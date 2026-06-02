const express = require('express');
const { body } = require('express-validator');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validate');
const { docToJson } = require('../utils/helpers');

const router = express.Router();
const COL = 'reviews';
const STATUSES = ['pending', 'approved', 'disapproved'];

// Public — submit review (goes to pending)
router.post(
  '/',
  sanitizeBody,
  [
    body('customer_name').isString().isLength({ min: 1, max: 120 }),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').isString().isLength({ min: 1, max: 1000 }),
    body('product_id').optional().isString(),
  ],
  validate,
  async (req, res) => {
    const data = {
      customer_name: req.body.customer_name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      product_id: req.body.product_id || null,
      status: 'pending',
      created_at: new Date(),
    };
    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  }
);

// Public — list approved only
router.get('/', async (_req, res) => {
  const snap = await db.collection(COL).orderBy('created_at', 'desc').get();
  res.json(snap.docs.map(docToJson).filter((r) => r.status === 'approved'));
});

// Admin — all
router.get('/admin/all', requireAuth, async (_req, res) => {
  const snap = await db.collection(COL).orderBy('created_at', 'desc').get();
  res.json(snap.docs.map(docToJson));
});

router.patch(
  '/:id/status',
  requireAuth,
  sanitizeBody,
  [body('status').isIn(STATUSES)],
  validate,
  async (req, res) => {
    await db.collection(COL).doc(req.params.id).update({ status: req.body.status, updated_at: new Date() });
    res.json({ ok: true });
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  await db.collection(COL).doc(req.params.id).delete();
  res.json({ ok: true });
});

module.exports = router;
