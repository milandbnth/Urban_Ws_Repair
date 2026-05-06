const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Database ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create leads table if it doesn't exist
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id        SERIAL PRIMARY KEY,
        ref       VARCHAR(20) UNIQUE NOT NULL,
        fname     VARCHAR(100) NOT NULL,
        lname     VARCHAR(100),
        phone     VARCHAR(30) NOT NULL,
        email     VARCHAR(150) NOT NULL,
        appliance VARCHAR(100) NOT NULL,
        pdate     DATE,
        issue     TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function generateRef() {
  return 'FR-' + Math.floor(100000 + Math.random() * 900000);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/leads — submit a new lead from the form
app.post('/api/leads', async (req, res) => {
  const { fname, lname, phone, email, appliance, pdate, issue } = req.body;

  // Basic validation
  if (!fname || !phone || !email || !appliance) {
    return res.status(400).json({ error: 'Missing required fields: fname, phone, email, appliance' });
  }

  const ref = generateRef();

  try {
    await pool.query(
      `INSERT INTO leads (ref, fname, lname, phone, email, appliance, pdate, issue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ref, fname, lname || '', phone, email, appliance, pdate || null, issue || '']
    );

    console.log(`📋 New lead saved: ${ref} — ${fname} (${appliance})`);
    res.status(201).json({ success: true, ref });

  } catch (err) {
    console.error('❌ Error saving lead:', err.message);
    res.status(500).json({ error: 'Failed to save lead. Please try again.' });
  }
});

// GET /api/leads — view all leads (protect this in production!)
app.get('/api/leads', async (req, res) => {
  // Simple secret key protection — set ADMIN_KEY in your Render env vars
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json({ total: result.rowCount, leads: result.rows });
  } catch (err) {
    console.error('❌ Error fetching leads:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET / — serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 UrbanWs server running on port ${PORT}`);
  });
});
