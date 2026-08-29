# KontrolIQ Lead Capture — Google Sheets + Apps Script

This deploys the backend for `/assessment/` form submissions:
leads → Google Sheet **KontrolIQ Leads** → Email 1 (immediate) + Day 3/7 nurture.

## One-time deploy (from this folder's parent)

### Option A — Browser (simplest)

1. Open [Google Sheets](https://sheets.google.com) as `mainootechnologies@gmail.com` (or your ops inbox).
2. Create spreadsheet named **KontrolIQ Leads**.
3. **Extensions → Apps Script**.
4. Delete any stub code; paste entire contents of `apps-script/Code.gs`.
5. Save → Run **`setupSheet`** once → authorize.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the `/exec` URL.
8. From repo root:

```bash
./ops/wire-endpoint.sh 'https://script.google.com/macros/s/YOUR_ID/exec'
```

9. Back in Apps Script, run **`createDailyTrigger`** once.
10. Commit + push the updated `js/funnel-config.js`.

### Option B — clasp CLI

```bash
cd ops
npm install
npx clasp login          # browser OAuth
npx clasp create --type sheets --title "KontrolIQ Leads" --rootDir apps-script
npx clasp push
npx clasp deploy --description "KontrolIQ lead capture web app"
# Then run setupSheet + createDailyTrigger from the Apps Script editor,
# copy the web app /exec URL, and run:
./wire-endpoint.sh 'https://script.google.com/macros/s/.../exec'
```

## Verify

```bash
curl -s -X POST -H 'Content-Type: text/plain;charset=utf-8' \
  --data '{"submitted_at":"2026-08-29T00:00:00.000Z","type":"smoke","contact":{"full_name":"Smoke Test","email":"you@example.com","company":"Test","role":"","message":""},"qualification":{},"attribution":{},"readiness_score":42,"qualification_tier":"nurture","priority_gaps":["SEC-01"]}' \
  "$FORM_ENDPOINT"
```

A row should appear in the **Leads** tab and Email 1 should arrive (to the contact email).

## Site contract

`js/app.js` POSTs JSON shaped for `Code.gs` `doPost` / `payloadToRow`.
`js/funnel-config.js` → `formEndpoint` must be the `/exec` URL (public by design for a static site).
