const express = require('express');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { docToJson } = require('../utils/helpers');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  const [custSnap, orderSnap] = await Promise.all([
    db.collection('customers').orderBy('created_at', 'desc').get(),
    db.collection('orders').get(),
  ]);
  const stats = new Map();
  orderSnap.docs.forEach((d) => {
    const o = d.data();
    const s = stats.get(o.customer_id) || { orders: 0, total: 0 };
    s.orders += 1;
    if (o.status === 'completed') s.total += Number(o.total || 0);
    stats.set(o.customer_id, s);
  });
  const customers = custSnap.docs.map((d) => {
    const c = docToJson(d);
    const s = stats.get(d.id) || { orders: 0, total: 0 };
    return { ...c, orders_count: s.orders, total_spent: s.total };
  });
  res.json(customers);
});

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await db.collection('customers').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  const orderSnap = await db.collection('orders').where('customer_id', '==', req.params.id).get();
  const orders = orderSnap.docs.map(docToJson)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  res.json({ customer: docToJson(doc), orders });
});

module.exports = router;
