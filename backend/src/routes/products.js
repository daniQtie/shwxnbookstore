const express = require('express');
const { body } = require('express-validator');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validate');
const { makeSlug, docToJson } = require('../utils/helpers');
const { verifyAdminPassword } = require('./auth');

const router = express.Router();
const COL = 'products';

// Simple list — no compound queries. Filtering done client-side.
router.get('/', async (_req, res) => {
  const snap = await db.collection(COL).orderBy('created_at', 'desc').get();
  res.json(snap.docs.map(docToJson));
});

router.get('/slug/:slug', async (req, res) => {
  const snap = await db.collection(COL).where('slug', '==', req.params.slug).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: 'Not found' });
  res.json(docToJson(snap.docs[0]));
});

router.get('/:id', async (req, res) => {
  const doc = await db.collection(COL).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json(docToJson(doc));
});

const productValidators = [
  body('name').isString().isLength({ min: 1, max: 200 }),
  body('category_id').isString().isLength({ min: 1 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('weight_kg').optional().isFloat({ min: 0, max: 100 }),
  body('image_url').optional().isString().isLength({ max: 1000 }),
  body('is_featured').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
];

router.post('/', requireAuth, sanitizeBody, productValidators, validate, async (req, res) => {
  const b = req.body;
  const data = {
    name: b.name,
    slug: makeSlug(b.name) + '-' + Date.now().toString(36),
    category_id: b.category_id,
    description: b.description || '',
    price: Number(b.price),
    stock: Number(b.stock),
    weight_kg: Number(b.weight_kg || 0),
    image_url: b.image_url || '',
    is_featured: !!b.is_featured,
    is_active: b.is_active !== false,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const ref = await db.collection(COL).add(data);
  res.status(201).json({ id: ref.id, ...data });
});

router.put('/:id', requireAuth, sanitizeBody, productValidators, validate, async (req, res) => {
  const b = req.body;
  const data = {
    name: b.name,
    category_id: b.category_id,
    description: b.description || '',
    price: Number(b.price),
    stock: Number(b.stock),
    weight_kg: Number(b.weight_kg || 0),
    image_url: b.image_url || '',
    is_featured: !!b.is_featured,
    is_active: b.is_active !== false,
    updated_at: new Date(),
  };
  await db.collection(COL).doc(req.params.id).update(data);
  res.json({ id: req.params.id, ...data });
});

// Bulk delete — requires password re-verification
router.post(
  '/delete-all',
  requireAuth,
  sanitizeBody,
  [body('password').isString().isLength({ min: 1, max: 128 })],
  validate,
  async (req, res) => {
    const ok = await verifyAdminPassword(req.user.sub, req.body.password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });
    const snap = await db.collection(COL).get();
    let count = 0;
    while (count < snap.size) {
      const batch = db.batch();
      const slice = snap.docs.slice(count, count + 400);
      slice.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      count += slice.length;
    }
    res.json({ ok: true, deleted: count });
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  await db.collection(COL).doc(req.params.id).delete();
  res.json({ ok: true });
});

module.exports = router;
