# shwxnbookstore — Setup Guide

A full-stack online bookstore. Frontend: **Next.js 14 + Tailwind**. Backend: **Express + Firestore**. Image storage: **Cloudinary**.

---

## 1. Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- A Google account (Firebase) — **no credit card required**
- A Cloudinary account — **no credit card required**

---

## 2. Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it (e.g. `shwxnbookstore-dev`). Disable Analytics if you don’t need it.
3. Open **Build → Firestore Database** → **Create database** → **Production mode** → pick a region.
4. **Project settings (gear icon) → Service accounts → Generate new private key**. A JSON file downloads — keep it private.
5. **Project settings → General → Your apps → Web app (`</>`)**. Register an app and copy the `firebaseConfig` values (you’ll paste them into the frontend `.env`).

### Firestore security rules

In **Firestore → Rules**, paste this — clients are read-only; all writes go through the backend (Admin SDK bypasses these rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{doc}      { allow read: if true; allow write: if false; }
    match /categories/{doc}    { allow read: if true; allow write: if false; }
    match /reviews/{doc}       { allow read: if true; allow write: if false; }
    match /orders/{doc}        { allow read: if false; allow write: if false; }
    match /customers/{doc}     { allow read: if false; allow write: if false; }
    match /admins/{doc}        { allow read: if false; allow write: if false; }
  }
}
```

The admin UI uses `onSnapshot` for realtime; since orders/reviews are not client-readable, the admin pages still get realtime via the public `reviews` collection (status filter) and refetch summary data through the backend. If you want full client realtime for the admin, relax rules with custom claims (out of scope).

---

## 3. Cloudinary

1. Sign up at <https://cloudinary.com> (Free plan, no card).
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**.

---

## 4. Configure environment

### Backend — `backend/.env`

Copy `backend/.env.example` → `backend/.env` and fill:

```
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000

JWT_SECRET=<paste a long random string>
JWT_EXPIRES_IN=8h

FIREBASE_PROJECT_ID=<from service account JSON: project_id>
FIREBASE_CLIENT_EMAIL=<from service account JSON: client_email>
FIREBASE_PRIVATE_KEY="<from service account JSON: private_key — keep the \n escapes>"

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> The Firebase `private_key` must keep its `\n` escapes inside double quotes — the loader converts them back to real newlines.

### Frontend — `frontend/.env.local`

Copy `frontend/.env.example` → `frontend/.env.local` and fill:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## 5. Install + seed

```bash
# Backend
cd backend
npm install
npm run seed    # creates admin, categories, sample books, reviews

# Frontend
cd ../frontend
npm install
```

Seed creates the default admin:

- **Username:** `admin`
- **Password:** `admin123`

> Change this password after first login in production.

---

## 6. Run dev servers

In two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev    # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev    # http://localhost:3000
```

- Public site → <http://localhost:3000>
- Admin login → <http://localhost:3000/admin/login>

---

## 7. Production notes

- Serve everything over HTTPS.
- Set `NODE_ENV=production` so cookies are sent with `Secure`.
- Update `FRONTEND_ORIGIN` to your deployed frontend URL.
- Rotate `JWT_SECRET` and admin password.
- Never commit `.env`, service account JSON, or Cloudinary secrets.
- Keep using the Admin SDK for writes — never expose write rules to the client.

---

## 8. Project structure

```
shwxnbookstore/
├── backend/
│   ├── src/
│   │   ├── config/        # firebase, cloudinary
│   │   ├── middleware/    # auth, validate
│   │   ├── routes/        # auth, categories, products, orders, customers, reviews, reports, upload
│   │   ├── utils/
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (public)/   # home, products, gallery, reviews, contact
    │   │   └── admin/      # login + dashboard + CRUD pages
    │   ├── components/
    │   └── lib/            # api client, firebase client, types
    ├── .env.example
    └── package.json
```
