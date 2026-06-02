const slugify = require('slugify');

const makeSlug = (s) => slugify(String(s || ''), { lower: true, strict: true });

// Convert Firestore Timestamp fields → ISO strings recursively
function serialize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj && typeof obj.toDate === 'function') return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = serialize(obj[k]);
    return out;
  }
  return obj;
}

const docToJson = (doc) => ({ id: doc.id, ...serialize(doc.data()) });

module.exports = { makeSlug, serialize, docToJson };
