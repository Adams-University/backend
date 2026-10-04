# Adam University - Certificate Verification API

## What it does
`POST /verify` with `{ "certificateId": "...", "surname": "..." }`
- found:     HTTP 200 `{ verified:true, holder, programme, enrolled, graduated, ledgerTx }`
- not found: HTTP 404 `{ verified:false }` (same answer for wrong ID, wrong surname or revoked)
- bad input: HTTP 400. Too many requests (over 10 per minute per IP): HTTP 429.

Only your website can call it (CORS). By default that is
`https://adams-university.github.io`. To add your real domain later, set the
environment variable `ALLOWED_ORIGINS`, e.g.
`https://adams-university.github.io,https://www.adamuniversity.org`

## Your certificate records
Edit `certificates.json`, one block per certificate. `status` must be `"valid"`
(use `"revoked"` to switch a certificate off). Optional extra fields per record: `holder`, `programme`, `enrolled`, `graduated`, `ledgerTx`
(shown on the website only if present). Keep real personal data out of public
GitHub repositories: deploy this folder from a PRIVATE repository.

## Deploy (example: Render.com, free plan)
1. Put this folder in a new PRIVATE GitHub repository.
2. On render.com: New > Web Service > connect that repository.
3. Build command: `npm install`   Start command: `npm start`
4. When it is live, your API link is  https://YOUR-SERVICE.onrender.com/verify
5. Send that link to be put into `index.html` (the line `const VERIFY_API='';`).

## Run on your own computer (optional)
`npm install` then `npm start`, and open http://localhost:3000
