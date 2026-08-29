# mt-website

Website for Mainoo Technologies and KontrolIQ.

## Revenue funnel (LinkedIn → demo → paid)

Implements the flow documented in Notion: **Website Revenue Funnel — Ops Runbook**.

| Path | Purpose |
| --- | --- |
| `/assessment/` | Lead-magnet landing (LinkedIn CTA destination) |
| `/assessment/assess.html` | 12-question form (Perplexity domain model v1.1) + qualification |
| `/assessment/report.html` | Instant score /100 + domain gaps + Calendly CTA |
| `/assessment/contact.html` | Lead-capture contact form |

### LinkedIn CTA

```
https://www.mainootechnologies.com/assessment/assess.html?utm_source=linkedin&utm_medium=social&utm_campaign=week1-builder&utm_content=POST-SLUG
```

### Lead backend (Google Sheets + Apps Script)

Full deploy steps: [`ops/README.md`](ops/README.md). After you have the `/exec` URL:

```bash
./ops/wire-endpoint.sh 'https://script.google.com/macros/s/YOUR_ID/exec'
```

1. Create spreadsheet **KontrolIQ Leads**
2. Extensions → Apps Script → paste `ops/Code.gs` → Save
3. Run `setupSheet()` once (authorize)
4. Deploy → Web app → Execute as **Me** → Who has access: **Anyone**
5. Copy `/exec` URL into `js/funnel-config.js` → `formEndpoint`
6. Run `createDailyTrigger()` once for Day 3 / Day 7 nurture emails

Until `formEndpoint` is set, the assessment and report still work in-browser; leads are stored only in `localStorage` key `kontroliq_leads` for testing.

### Funnel

```
LinkedIn post → /assessment/ → report → (emails) → Calendly → design partner → paid
```
