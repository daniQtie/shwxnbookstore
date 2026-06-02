const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { db } = require('../config/firebase');
const { validate, sanitizeBody } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// Re-usable helper for password-confirmed sensitive operations
async function verifyAdminPassword(adminId, password) {
  const doc = await db.collection('admins').doc(adminId).get();
  if (!doc.exists) return false;
  return bcrypt.compare(password, doc.data().password_hash);
}

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
});

router.post(
  '/login',
  authLimiter,
  sanitizeBody,
  [
    body('username').isString().isLength({ min: 3, max: 64 }),
    body('password').isString().isLength({ min: 6, max: 128 }),
  ],
  validate,
  async (req, res) => {
    const { username, password } = req.body;
    const snap = await db.collection('admins').where('username', '==', username).limit(1).get();
    if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });
    const adminDoc = snap.docs[0];
    const admin = adminDoc.data();
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: adminDoc.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      // Cross-origin cookies (Vercel ↔ Render) require sameSite=none + secure=true
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ token, user: { id: adminDoc.id, username: admin.username } });
  }
);

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const doc = await db.collection('admins').doc(req.user.sub).get();
  if (!doc.exists) return res.status(404).json({ error: 'Account not found' });
  const a = doc.data();
  res.json({ user: { id: doc.id, username: a.username, name: a.name || '' } });
});

// Re-verify admin password for sensitive operations (bulk delete, account change)
router.post(
  '/verify-password',
  requireAuth,
  sanitizeBody,
  [body('password').isString().isLength({ min: 1, max: 128 })],
  validate,
  async (req, res) => {
    const doc = await db.collection('admins').doc(req.user.sub).get();
    if (!doc.exists) return res.status(404).json({ error: 'Account not found' });
    const ok = await bcrypt.compare(req.body.password, doc.data().password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });
    res.json({ ok: true });
  }
);

// Update admin account — requires current password to authorize the change
router.put(
  '/account',
  requireAuth,
  sanitizeBody,
  [
    body('current_password').isString().isLength({ min: 1, max: 128 }),
    body('name').optional().isString().isLength({ max: 120 }),
    body('username').optional().isString().isLength({ min: 3, max: 64 }),
    body('new_password').optional().isString().isLength({ min: 6, max: 128 }),
  ],
  validate,
  async (req, res) => {
    const ref = db.collection('admins').doc(req.user.sub);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Account not found' });

    const admin = doc.data();
    const ok = await bcrypt.compare(req.body.current_password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    const update = { updated_at: new Date() };
    if (typeof req.body.name === 'string') update.name = req.body.name;
    if (req.body.username && req.body.username !== admin.username) {
      const taken = await db.collection('admins').where('username', '==', req.body.username).limit(1).get();
      if (!taken.empty && taken.docs[0].id !== doc.id) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      update.username = req.body.username;
    }
    if (req.body.new_password) {
      update.password_hash = await bcrypt.hash(req.body.new_password, 10);
    }

    await ref.update(update);
    res.json({ ok: true, user: { id: doc.id, username: update.username || admin.username, name: update.name ?? (admin.name || '') } });
  }
);

module.exports = router;
module.exports.verifyAdminPassword = verifyAdminPassword;
