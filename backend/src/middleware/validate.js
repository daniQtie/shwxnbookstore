const { validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

// Recursively strip HTML/scripts from string fields
function sanitizeBody(req, _res, next) {
  const clean = (val) => {
    if (typeof val === 'string') {
      return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim();
    }
    if (Array.isArray(val)) return val.map(clean);
    if (val && typeof val === 'object') {
      const out = {};
      for (const k of Object.keys(val)) out[k] = clean(val[k]);
      return out;
    }
    return val;
  };
  if (req.body) req.body = clean(req.body);
  next();
}

module.exports = { validate, sanitizeBody };
