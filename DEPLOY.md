# 🚀 FixRight — Render Deployment Guide

## Project Structure
```
fixright/
├── public/
│   └── index.html       ← Your website frontend
├── server.js            ← Node.js backend
├── package.json
├── .env.example         ← Copy this to .env locally
└── .gitignore
```

---

## Step 1 — Test Locally First

```bash
# Install dependencies
npm install

# Create your local .env file
cp .env.example .env
# Edit .env and fill in your local PostgreSQL details (or skip DB for now)

# Start the server
npm start

# Visit http://localhost:3000 — your site should load!
```

---

## Step 2 — Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit — FixRight Appliance website"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/fixright.git
git push -u origin main
```

---

## Step 3 — Create PostgreSQL Database on Render

1. Go to **https://render.com** and sign up / log in
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name:** `fixright-db`
   - **Plan:** Free
4. Click **"Create Database"**
5. Once created, copy the **"Internal Database URL"** — you'll need it in Step 4

---

## Step 4 — Deploy the Node.js Backend on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo (`fixright`)
3. Fill in settings:
   - **Name:** `fixright-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. Under **"Environment Variables"**, add:
   - `DATABASE_URL` → paste the Internal Database URL from Step 3
   - `ADMIN_KEY` → type any secret password (e.g. `mysecret123`)
   - `NODE_ENV` → `production`
5. Click **"Create Web Service"**
6. Wait ~2 minutes for it to deploy
7. Copy your live URL — it will look like:
   `https://fixright-backend.onrender.com`

---

## Step 5 — Update the Frontend with Your Backend URL

Open `public/index.html` and find this line near the bottom:

```javascript
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://YOUR-RENDER-APP-NAME.onrender.com';  // ← Update this!
```

Replace `YOUR-RENDER-APP-NAME` with your actual Render app name:

```javascript
  : 'https://fixright-backend.onrender.com';
```

Then push to GitHub again:
```bash
git add .
git commit -m "Update API URL to Render backend"
git push
```

Render will auto-redeploy within ~1 minute.

---

## Step 6 — Test Your Live Form

1. Visit your Render URL: `https://fixright-backend.onrender.com`
2. Fill in the form and submit
3. Check the database by calling:

```bash
curl -H "x-admin-key: mysecret123" \
  https://fixright-backend.onrender.com/api/leads
```

You should see your lead in the JSON response!

---

## 📋 Viewing Your Leads

To see all submitted leads, make a GET request with your admin key:

```bash
curl -H "x-admin-key: YOUR_ADMIN_KEY" \
  https://fixright-backend.onrender.com/api/leads
```

Or open it in your browser using a tool like **Postman** or **Insomnia**.

---

## ⚠️ Free Tier Reminders

- **Backend sleeps** after 15 min of inactivity — first request may take 30–60 seconds to wake up
- **Database resets** every 30 days — upgrade to paid ($6/mo) when ready for production
- **No credit card required** to get started!

---

## 🔧 Local Development Tips

```bash
# Install nodemon for auto-restart during development
npm install --save-dev nodemon

# Run in dev mode (auto-restarts on file changes)
npm run dev
```
