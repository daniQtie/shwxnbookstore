const express = require('express');
const { body } = require('express-validator');
const { admin, db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validate');
const { docToJson } = require('../utils/helpers');

const router = express.Router();
const COL = 'orders';
const VALID_STATUS = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

// Public pre-order endpoint — creates customer if new, then order
router.post(
  '/preorder',
  sanitizeBody,
  [
    body('customer.name').isString().isLength({ min: 1, max: 120 }),
    body('customer.email').isEmail(),
    body('customer.phone').optional().isString().isLength({ max: 40 }),
    body('customer.address').isString().isLength({ min: 1, max: 500 }),
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').isString(),
    body('items.*.quantity').isInt({ min: 1, max: 99 }),
  ],
  validate,
  async (req, res) => {
    const { customer, items, note = '' } = req.body;

    // Upsert customer by email
    const custSnap = await db.collection('customers').where('email', '==', customer.email).limit(1).get();
    let customerId;
    if (custSnap.empty) {
      const ref = await db.collection('customers').add({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address,
        created_at: new Date(),
      });
      customerId = ref.id;
    } else {
      customerId = custSnap.docs[0].id;
      await custSnap.docs[0].ref.update({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address,
      });
    }

    // Resolve product prices + weights server-side
    const resolvedItems = [];
    let total = 0;
    let totalWeight = 0;
    for (const it of items) {
      const pdoc = await db.collection('products').doc(it.product_id).get();
      if (!pdoc.exists) return res.status(400).json({ error: `Product ${it.product_id} not found` });
      const p = pdoc.data();
      const qty = Number(it.quantity);
      const weight = Number(p.weight_kg || 0);
      const line = {
        product_id: pdoc.id,
        name: p.name,
        price: Number(p.price),
        weight_kg: weight,
        quantity: qty,
        subtotal: Number(p.price) * qty,
        weight_subtotal: weight * qty,
      };
      total += line.subtotal;
      totalWeight += line.weight_subtotal;
      resolvedItems.push(line);
    }

    const order = {
      customer_id: customerId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: customer.address,
      items: resolvedItems,
      total,
      total_weight_kg: Number(totalWeight.toFixed(3)),
      status: 'pending',
      type: 'preorder',
      note,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const ref = await db.collection(COL).add(order);
    res.status(201).json({ id: ref.id, ...order });
  }
);

router.get('/', requireAuth, async (_req, res) => {
  const snap = await db.collection(COL).orderBy('created_at', 'desc').get();
  res.json(snap.docs.map(docToJson));
});

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await db.collection(COL).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json(docToJson(doc));
});

const VALID_COURIERS = ['jt', 'lbc', 'flash', 'ninjavan', 'jrs', 'other'];

router.patch(
  '/:id/shipping',
  requireAuth,
  sanitizeBody,
  [
    body('courier').optional({ nullable: true }).isIn([...VALID_COURIERS, '']),
    body('tracking_number').optional({ nullable: true }).isString().isLength({ max: 80 }),
  ],
  validate,
  async (req, res) => {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });
    await ref.update({
      courier: req.body.courier || '',
      tracking_number: req.body.tracking_number || '',
      shipped_at: req.body.tracking_number ? new Date() : null,
      updated_at: new Date(),
    });
    const updated = await ref.get();
    res.json(docToJson(updated));
  }
);

router.patch(
  '/:id/status',
  requireAuth,
  sanitizeBody,
  [body('status').isIn(VALID_STATUS)],
  validate,
  async (req, res) => {
    const ref = db.collection(COL).doc(req.params.id);
    const newStatus = req.body.status;

    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) throw Object.assign(new Error('Order not found'), { status: 404 });
      const data = doc.data();
      const wasCompleted = data.status === 'completed';

      // Auto-deduct stock when transitioning into completed
      if (newStatus === 'completed' && !wasCompleted) {
        for (const item of data.items || []) {
          const pref = db.collection('products').doc(item.product_id);
          tx.update(pref, {
            stock: admin.firestore.FieldValue.increment(-Number(item.quantity)),
            updated_at: new Date(),
          });
        }
      }
      tx.update(ref, { status: newStatus, updated_at: new Date() });
    });

    const updated = await ref.get();
    res.json(docToJson(updated));
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  await db.collection(COL).doc(req.params.id).delete();
  res.json({ ok: true });
});

module.exports = router;
