const express = require('express');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { docToJson } = require('../utils/helpers');

const router = express.Router();

router.get('/summary', requireAuth, async (_req, res) => {
  const [productsSnap, customersSnap, ordersSnap] = await Promise.all([
    db.collection('products').get(),
    db.collection('customers').get(),
    db.collection('orders').get(),
  ]);
  const orders = ordersSnap.docs.map(docToJson);
  const completed = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;

  const products = productsSnap.docs.map(docToJson);
  const lowStock = products.filter((p) => Number(p.stock) <= 5);

  const recentOrders = orders
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  res.json({
    totals: {
      products: products.length,
      customers: customersSnap.size,
      revenue: totalRevenue,
      pending_orders: pending,
      completed_orders: completed.length,
    },
    low_stock: lowStock,
    recent_orders: recentOrders,
  });
});

router.get('/monthly-revenue', requireAuth, async (_req, res) => {
  const snap = await db.collection('orders').get();
  const buckets = new Map();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(k, 0);
  }
  snap.docs.forEach((d) => {
    const o = d.data();
    if (o.status !== 'completed') return;
    const dt = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at);
    const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (buckets.has(k)) buckets.set(k, buckets.get(k) + Number(o.total || 0));
  });
  res.json(Array.from(buckets, ([month, revenue]) => ({ month, revenue })));
});

router.get('/top-products', requireAuth, async (_req, res) => {
  const snap = await db.collection('orders').get();
  const sold = new Map();
  snap.docs.forEach((d) => {
    const o = d.data();
    if (o.status !== 'completed') return;
    (o.items || []).forEach((it) => {
      const cur = sold.get(it.product_id) || { product_id: it.product_id, name: it.name, qty: 0, revenue: 0 };
      cur.qty += Number(it.quantity || 0);
      cur.revenue += Number(it.subtotal || 0);
      sold.set(it.product_id, cur);
    });
  });
  const top = Array.from(sold.values()).sort((a, b) => b.qty - a.qty).slice(0, 10);
  res.json(top);
});

module.exports = router;
