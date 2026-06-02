require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('./config/firebase');
const { makeSlug } = require('./utils/helpers');

async function clearCollection(name) {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

async function main() {
  console.log('Seeding shwxnbookstore...');

  for (const c of ['admins', 'categories', 'products', 'reviews']) {
    await clearCollection(c);
  }

  // Admin
  const password_hash = await bcrypt.hash('admin123', 10);
  await db.collection('admins').add({
    username: 'admin',
    password_hash,
    created_at: new Date(),
  });
  console.log('  ✓ Admin: admin / admin123');

  // Categories
  const cats = [
    { name: 'Fiction', description: 'Novels and short stories' },
    { name: 'Non-Fiction', description: 'Biographies, essays, history' },
    { name: 'Filipiniana', description: 'Books by Filipino authors' },
    { name: 'Self-Help', description: 'Personal growth and productivity' },
    { name: 'Children', description: 'Books for young readers' },
  ];
  const catIds = {};
  for (const c of cats) {
    const ref = await db.collection('categories').add({
      name: c.name,
      slug: makeSlug(c.name),
      description: c.description,
      created_at: new Date(),
      updated_at: new Date(),
    });
    catIds[c.name] = ref.id;
  }
  console.log('  ✓ Categories:', cats.length);

  // Products
  const ph = (seed) => `https://picsum.photos/seed/${seed}/600/800`;
  const products = [
    { name: 'Noli Me Tangere', cat: 'Filipiniana', price: 450, stock: 25, weight: 0.55, featured: true,
      desc: 'José Rizal’s classic novel exposing colonial Philippine society.' },
    { name: 'El Filibusterismo', cat: 'Filipiniana', price: 450, stock: 18, weight: 0.50, featured: true,
      desc: 'The fiery sequel to Noli Me Tangere.' },
    { name: 'Dekada \'70', cat: 'Filipiniana', price: 380, stock: 12, weight: 0.40,
      desc: 'Lualhati Bautista’s portrait of a family during Martial Law.' },
    { name: 'The Midnight Library', cat: 'Fiction', price: 599, stock: 30, weight: 0.45, featured: true,
      desc: 'Matt Haig — a novel about lives we could have lived.' },
    { name: 'Project Hail Mary', cat: 'Fiction', price: 720, stock: 8, weight: 0.60,
      desc: 'Andy Weir’s science thriller across the stars.' },
    { name: 'Atomic Habits', cat: 'Self-Help', price: 650, stock: 40, weight: 0.48, featured: true,
      desc: 'James Clear — tiny changes, remarkable results.' },
    { name: 'Deep Work', cat: 'Self-Help', price: 580, stock: 5, weight: 0.42,
      desc: 'Cal Newport on focused success in a distracted world.' },
    { name: 'Sapiens', cat: 'Non-Fiction', price: 780, stock: 22, weight: 0.65,
      desc: 'Yuval Noah Harari’s brief history of humankind.' },
    { name: 'Educated', cat: 'Non-Fiction', price: 520, stock: 14, weight: 0.50,
      desc: 'Tara Westover’s memoir of self-invention.' },
    { name: 'The Little Prince', cat: 'Children', price: 320, stock: 50, weight: 0.25, featured: true,
      desc: 'Saint-Exupéry’s timeless fable for readers of every age.' },
  ];
  const productIds = [];
  for (const p of products) {
    const slug = makeSlug(p.name);
    const ref = await db.collection('products').add({
      name: p.name,
      slug,
      category_id: catIds[p.cat],
      description: p.desc,
      price: p.price,
      stock: p.stock,
      weight_kg: p.weight || 0,
      image_url: ph(slug),
      is_featured: !!p.featured,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    productIds.push({ id: ref.id, name: p.name });
  }
  console.log('  ✓ Products:', products.length);

  // Reviews (approved)
  const reviews = [
    { customer_name: 'Maria Santos', rating: 5, comment: 'Sobrang ganda ng libro, fast shipping pa!' },
    { customer_name: 'Juan dela Cruz', rating: 4, comment: 'Great selection of Filipiniana titles.' },
    { customer_name: 'Anna Reyes', rating: 5, comment: 'Highly recommended — legit talaga ang shop.' },
  ];
  for (const r of reviews) {
    await db.collection('reviews').add({
      ...r,
      product_id: null,
      status: 'approved',
      created_at: new Date(),
    });
  }
  console.log('  ✓ Reviews:', reviews.length);

  console.log('\nDone. Admin login → admin / admin123');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
