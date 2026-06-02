const express = require('express');
const { body } = require('express-validator');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validate');
const { makeSlug, docToJson } = require('../utils/helpers');
const { verifyAdminPassword } = require('./auth');

const router = express.Router();
const COL = 'categories';

router.get('/', async (_req, res) => {
  const snap = await db.collection(COL).orderBy('name').get();
  res.json(snap.docs.map(docToJson));
});

router.get('/:id', async (req, res) => {
  const doc = await db.collection(COL).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json(docToJson(doc));
});

router.post(
  '/',
  requireAuth,
  sanitizeBody,
  [body('name').isString().isLength({ min: 1, max: 100 }), body('description').optional().isString().isLength({ max: 500 })],
  validate,
  async (req, res) => {
    const { name, description = '' } = req.body;
    const slug = makeSlug(name);
    const data = { name, slug, description, created_at: new Date(), updated_at: new Date() };
    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  }
);

router.put(
  '/:id',
  requireAuth,
  sanitizeBody,
  [body('name').isString().isLength({ min: 1, max: 100 }), body('description').optional().isString().isLength({ max: 500 })],
  validate,
  async (req, res) => {
    const { name, description = '' } = req.body;
    const slug = makeSlug(name);
    const data = { name, slug, description, updated_at: new Date() };
    await db.collection(COL).doc(req.params.id).update(data);
    res.json({ id: req.params.id, ...data });
  }
);

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
    // Firestore batch limit = 500. Chunk if needed.
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
