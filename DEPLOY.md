# Deploy Guide — Vercel (frontend) + Render (backend)

Two services to deploy:
- **Backend (Express API)** → Render.com — free, supports Node.js
- **Frontend (Next.js)** → Vercel.com — free, made by Next.js creators

Both have free tiers, no credit card required.

> ⚠️ **Free Render note:** Backend sleeps after **15 min of inactivity**. First request after sleep takes ~30s to wake up. Para gising lagi, mag-upgrade ($7/mo) or use a cron pinger.

---

## Step 1 — Push code to GitHub

1. Sa GitHub, create new repo (e.g. `shwxnbookstore`). Don't add README or .gitignore.
2. Sa terminal:

```bash
cd "C:/Users/umipi/Desktop/New folder/shwxnbookstore"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shwxnbookstore.git
git push -u origin main
```

> ✅ I-double check na **walang naka-push na `.env` files**. May `.gitignore` na excluding them.

---

## Step 2 — Deploy Backend to Render

1. Go to <https://render.com> → Sign up with GitHub.
2. Dashboard → **New** → **Web Service**.
3. Connect your `shwxnbookstore` GitHub repo.
4. Fill in:
   - **Name**: `shwxnbookstore-api`
   - **Region**: Singapore (closest to PH)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free
5. Scroll to **Environment Variables**. Click **Add Environment Variable** for each:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | (paste yung mahabang random string from your local .env) |
   | `JWT_EXPIRES_IN` | `8h` |
   | `FIREBASE_PROJECT_ID` | `shwxnbookstore-dev` |
   | `FIREBASE_CLIENT_EMAIL` | (from local .env) |
   | `FIREBASE_PRIVATE_KEY` | (from local .env — paste **with the double quotes**, keep `\n` as literal `\n`) |
   | `CLOUDINARY_CLOUD_NAME` | `djaqq5v6i` |
   | `CLOUDINARY_API_KEY` | `279821735632946` |
   | `CLOUDINARY_API_SECRET` | (from local .env) |
   | `FRONTEND_ORIGIN` | *(leave blank for now — set after Step 3)* |

   > **Firebase private key gotcha:** Sa Render UI, paste yung full multi-line value. May 2 options:
   > - Option A: Paste with `\n` escapes literally (e.g. `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`) — kasama yung quotes
   > - Option B: Paste as multi-line (Render's input supports this) — without quotes, with real newlines
   >
   > Our code handles both (`.replace(/\\n/g, '\n')` only converts `\n` if present).

6. Click **Create Web Service**. Build takes ~3-5 min.
7. Once deployed, copy your Render URL (e.g. `https://shwxnbookstore-api.onrender.com`). Test:
   ```
   https://shwxnbookstore-api.onrender.com/api/health
   ```
   Dapat: `{"ok":true}`

---

## Step 3 — Deploy Frontend to Vercel

1. Go to <https://vercel.com> → Sign up with GitHub.
2. Dashboard → **Add New** → **Project**.
3. Import your `shwxnbookstore` GitHub repo.
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: click **Edit** → set to `frontend`
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)
5. **Environment Variables** — expand the section and add:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://shwxnbookstore-api.onrender.com/api` (from Step 2.7) |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDmZl_myiZe7QsbJ7t7wiWjohdvh_dCch0` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `shwxnbookstore-dev.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `shwxnbookstore-dev` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `shwxnbookstore-dev.firebasestorage.app` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `395487335446` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:395487335446:web:8d6bf744d09511d4371137` |

6. Click **Deploy**. Build takes ~2-3 min.
7. Once deployed, copy your Vercel URL (e.g. `https://shwxnbookstore.vercel.app`).

---

## Step 4 — Wire up CORS

Bumalik sa Render dashboard:

1. Open your `shwxnbookstore-api` service → **Environment** tab.
2. Edit `FRONTEND_ORIGIN`. Paste your Vercel URL — **exact, walang trailing slash**:
   ```
   https://shwxnbookstore.vercel.app
   ```
   > Multiple origins? Comma-separate them:
   > `https://shwxnbookstore.vercel.app,https://www.shwxn.ph`

3. **Save changes** → Render will auto-redeploy (~1 min).

---

## Step 5 — Test sa production

Buksan ang Vercel URL mo. Subukan:
- ✅ Browse books → Add to cart → Pre-order
- ✅ Admin login → `/admin/login` → `admin` / `admin123`
- ✅ Realtime orders update kapag may bagong pre-order
- ✅ Receipt download as PNG

Kung may errors:
- **CORS error sa browser console** → Step 4 ay mali yung URL (check exact spelling, https://, no trailing slash)
- **401 Unauthorized** → JWT_SECRET mismatch or cookies blocked. Try clear cookies + login again.
- **Firebase Admin error** → `FIREBASE_PRIVATE_KEY` formatting wrong. Re-check Render env var.
- **First request slow (~30s)** → Normal yan sa Render free tier. Backend was asleep, waking up.

---

## Optional — Custom domain

### Vercel
1. Project → **Settings** → **Domains**
2. Add `shwxnbookstore.com` (or whatever you own)
3. Update DNS records as instructed
4. Wait for SSL provisioning (~5 min)
5. Update `FRONTEND_ORIGIN` sa Render to include the custom domain too

### Render (custom API subdomain)
1. Service → **Settings** → **Custom Domains**
2. Add `api.shwxnbookstore.com`
3. Add CNAME record sa DNS
4. Update `NEXT_PUBLIC_API_URL` sa Vercel to `https://api.shwxnbookstore.com/api`

---

## Updates / re-deploy

Both Vercel and Render auto-deploy when you push to `main`:

```bash
git add .
git commit -m "your message"
git push
```

- Vercel kicks off a build immediately (~2 min)
- Render kicks off a build immediately (~3 min)

You can also trigger manual redeploys from each dashboard's UI.

---

## Cost summary (free tier)

| Service | Free tier limit | Cost after |
|---|---|---|
| Vercel (Hobby) | 100 GB bandwidth/mo, unlimited deploys | $20/mo Pro |
| Render (Free Web) | 750 hrs/mo, sleeps after 15 min idle | $7/mo Starter (no sleep) |
| Firebase Firestore | 1 GB storage, 50k reads + 20k writes/day | Pay-as-you-go |
| Cloudinary | 25 credits/mo (~25 GB bandwidth + storage) | $99/mo Plus |

For a small bookstore, libre na talaga lahat ito for the first few hundred orders.
