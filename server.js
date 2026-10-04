// Adam University - certificate verification API
// POST /verify   body: { "certificateId": "...", "surname": "..." }
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Websites allowed to call this API (comma-separated). Add the real domain later.
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://adams-university.github.io')
  .split(',').map(s => s.trim()).filter(Boolean);

const FILE = path.join(__dirname, 'certificates.json');
function load() { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }

// lower-case, no accents, "ё" = "е", single spaces
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/ё/gi, 'е').toLowerCase().trim().replace(/\s+/g, ' ');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2kb' }));
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED.includes(origin)),
  methods: ['POST', 'OPTIONS'],
}));
app.use('/verify', rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { verified: false, error: 'Too many requests' } }));

app.get('/', (req, res) => res.json({ service: 'Adam University verification API', ok: true }));

app.post('/verify', (req, res) => {
  const { certificateId, surname } = req.body || {};
  if (typeof certificateId !== 'string' || typeof surname !== 'string'
      || !/^[A-Za-z0-9-]{1,32}$/.test(certificateId.trim()) || !surname.trim() || surname.length > 100) {
    return res.status(400).json({ verified: false, error: 'Invalid input' });
  }
  let rec;
  try { rec = load().find(c => c.certificateId.toLowerCase() === certificateId.trim().toLowerCase()); }
  catch (e) { return res.status(500).json({ verified: false, error: 'Server error' }); }

  // Same 404 for: unknown ID, wrong surname, revoked certificate
  if (!rec || rec.status !== 'valid' || norm(rec.surname) !== norm(surname)) {
    return res.status(404).json({ verified: false });
  }
  res.json({
    verified: true,
    holder: rec.holder,
    holderCountry: rec.holderCountry,
    programme: rec.programme,
    institution: rec.institution,
    location: rec.location,
    studyMode: rec.studyMode,
    enrolled: rec.enrolled,
    graduated: rec.graduated,
    ledgerTx: rec.ledgerTx,
  });
});

app.listen(PORT, () => console.log('Verification API listening on port ' + PORT));
