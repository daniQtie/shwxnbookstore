const admin = require('firebase-admin');

// Normalize FIREBASE_PRIVATE_KEY across environments:
// - Strips surrounding quotes (some hosts include them when pasting)
// - Converts literal \n to actual newlines (most common case)
// - Leaves real newlines alone (when host supports multi-line input)
function normalizePrivateKey(raw) {
  if (!raw) return '';
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n');
  return key;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

const db = admin.firestore();
module.exports = { admin, db };
