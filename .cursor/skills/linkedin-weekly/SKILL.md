---
name: linkedin-weekly
description: Run the KontrolIQ LinkedIn weekly pipeline — refresh NotebookLM sources, landscape briefing, draft post, fact-check, generate a branded Canva infographic, and save a Notion publish pack. Use when the user asks to run LinkedIn weekly, Monday briefing, refresh NotebookLM sources, draft this week's LinkedIn post, generate post infographic, or automate the assessment funnel content cadence. Requires Desktop Cursor with NotebookLM + Canva MCP authenticated.
---

# KontrolIQ LinkedIn Weekly Pipeline (Desktop)

## When to use

Desktop Cursor only (NotebookLM + Canva need local OAuth/sessions). Do **not** expect this to work in Cloud Agents.

## Preconditions

1. **NotebookLM MCP** enabled (`@roomi-fields/notebooklm-mcp`) and authenticated
2. **Canva MCP** via **`mcp-remote`** bridge (not a bare `url` entry) and OAuth-authenticated
3. Notion MCP available (or update Notion manually if not)
4. Notebook exists: `KontrolIQ — Ghana Compliance Landscape` (create if missing)
5. Read:
   - `.cursor/linkedin-source-watchlist.json` (research / seed URLs)
   - `.cursor/linkedin-brand-visual.json` (Canva brand + template settings)

### Canva Desktop MCP (required config)

Merge from `.cursor/mcp.json.example` into `%USERPROFILE%\.cursor\mcp.json` (or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "Canva": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
    }
  }
}
```

Then: fully quit Cursor → reopen → open a chat and trigger a Canva tool → complete the browser OAuth login/consent until the Canva MCP shows green tools (not empty).

**`workspaceId-empty-window` / empty Canva tools** = OAuth never finished or the old bare `"url": "https://mcp.canva.com/mcp"` entry is still in use. Fix: switch to the `mcp-remote` block above, restart Cursor, clear stale `*_lock.json` under the mcp-remote config dir if auth hangs, and finish the Canva consent screen in the browser.

If Canva MCP tools are missing after that, continue with text draft + Notion pack, but clearly warn that the infographic step was skipped and how to enable Canva.

## Brand visual system (hard rules)

From `.cursor/linkedin-brand-visual.json` and site CSS (`css/kq.css` on main):

| Token | Value |
|-------|--------|
| Accent | `#D37506` |
| Near-black / navy | `#000000` / `#161616` |
| Surfaces | `#FFFFFF` / `#F8F8F8` |
| Muted text | `#666666` |
| Font | Montserrat (or closest Brand Kit sans) |
| Wordmark | Kontrol**IQ** — “IQ” in accent |
| Format | LinkedIn portrait **1080×1350** (preferred) or square **1080×1080** |

**Visual style:** dark navy/black background or clean white surface; accent for IQ + CTA; high contrast; no purple gradients; no emoji clutter; no fake “certified / automates BoG” claims on the graphic.

**Infographic content (max):**
- 1 short headline (≤ 8 words)
- 1 subline (≤ 16 words)
- 3 bullets max (operational, not slogans)
- Footer CTA line: `Free 3-min readiness assessment` (no full URL on graphic — URL goes in post body)

## Important: how “refresh” works

NotebookLM does **not** automatically re-crawl old URL/PDF snapshots. A weekly refresh means:

1. **List** current sources
2. **Sync** Google Drive sources if the MCP exposes sync/freshness tools
3. **Research** the web with watchlist queries (`research_sources`) and **import** new sources
4. **Add** any seed URLs from the watchlist that are not already in the notebook (`source_add`)
5. **Then** brief + draft + Canva

Never skip the refresh step before drafting.

## Pipeline steps (run in order)

### 1. Discover MCP tools

**NotebookLM:** `notebook_list`, `source_list`, `source_add`, `research_sources`, Drive sync if present, `notebook_ask`

**Canva:** discover tools after auth — expect variants of generate/search/export/autofill/brand-check/resize. Use whatever names the live Canva MCP exposes; prefer brand-template autofill when available.

Confirm both are healthy before continuing (or note Canva skip).

### 2. Resolve notebook

Find notebook named **`KontrolIQ — Ghana Compliance Landscape`** (from watchlist `notebook_name`).
If missing, create it, then continue.

### 3. Weekly source refresh (REQUIRED before draft)

Read `.cursor/linkedin-source-watchlist.json`.

#### 3a. Inventory
Call `source_list` for the notebook. Note titles/URLs already present.

#### 3b. Sync Drive sources (if available)
If any sources are Google Drive (or tools for freshness/sync exist):
- Sync / refresh each Drive source
- Report which synced vs failed

If no sync tool exists, note that Drive docs may be stale and continue with research/import.

#### 3c. Web research + import
For each query in watchlist `research_queries` (cap so you stay under NotebookLM daily quota):
1. Call `research_sources` with mode from watchlist (`fast` unless user asks for `deep`)
2. Import / add the best new results up to `max_new_sources_per_week` total new sources
3. Skip duplicates already in `source_list`

Research focus: Ghana BoG / DPA / fintech / cloud compliance — not generic global GRC noise.

#### 3d. Seed URL catch-up
For each `seed_urls` entry not already in the notebook:
- `source_add` with type `url`
- Skip if add fails because it already exists

#### 3e. Refresh report
Before drafting, summarize for the user:
- Sources synced (Drive)
- New sources imported (title + URL if available)
- Skipped duplicates
- Failures

If **zero** sources could be refreshed or added and the notebook looks empty, stop and ask the user to upload core PDFs first.

### 4. Monday briefing (NotebookLM)

Ask the notebook (after refresh):

```
You are helping Mainoo Technologies draft LinkedIn content for KontrolIQ (audit readiness intelligence for regulated Ghanaian cloud environments).

Based ONLY on the sources in this notebook (prefer the newest / most recent sources):
1. What changed in Ghana's compliance/regulatory landscape recently? (BoG, DPA, fintech, cloud)
2. What are 3 operational pain points compliance officers and CTOs are likely facing right now?
3. What misconceptions should we avoid in public posts?
4. Suggest ONE LinkedIn post angle for this week that naturally leads to our free readiness assessment (do NOT mention pricing or self-serve signup).
5. Suggest infographic copy: headline (≤8 words), subline (≤16 words), and exactly 3 short bullets suitable for a LinkedIn graphic.

Cite sources. Keep it practical, not inspirational.
```

### 5. Draft LinkedIn post

Write a post (max ~1,300 characters) for Smith Mainoo:

**Audience:** CTOs, compliance officers, founders at regulated Ghanaian fintechs

**Requirements:**
- Hook in first 2 lines
- One concrete operational insight grounded in refreshed sources
- Mention free 3-minute readiness assessment
- **UTM link in the post body** (preferred for LinkedIn native Schedule — first comments cannot be scheduled)
- Optional note: if posting live (not scheduled), UTM may instead go in the first comment
- Do NOT claim: self-serve, published pricing, "automates BoG", regulator endorsement
- Tone: practitioner, not vendor brochure
- 4–6 hashtags max

**UTM template:**
```
https://www.mainootechnologies.com/assessment/assess.html?utm_source=linkedin&utm_medium=social&utm_campaign={CAMPAIGN}&utm_content={SLUG}
```

Campaign codes: `week1-builder` | `week2-visibility` | `week3-audit-prep` | `week4-evidence` | `sept-audit-readiness`

End the body with a clear CTA line, e.g.:

```
Free readiness assessment (3 min):
{UTM_URL}
```

### 6. Fact-check (NotebookLM)

Send the draft back to NotebookLM:

```
Review this LinkedIn draft against notebook sources only:
{draft}

Flag:
1. Any factual claims not supported by sources
2. Any regulatory overstatements
3. Anything that sounds like legal/audit advice vs indicative self-assessment

Suggest minimal edits only.
```

Apply minimal safe edits. Also fact-check the proposed infographic headline/bullets the same way.

### 7. Generate branded infographic (Canva) — REQUIRED when Canva is connected

Read `.cursor/linkedin-brand-visual.json`.

#### 7a. Preferred path — Brand template autofill
1. Search Canva for template named in config (`template_name`, default: `KontrolIQ LinkedIn — Weekly`)
2. If found and autofill is available: create a design from that template with fields:
   - `headline`
   - `subline`
   - `bullet_1` / `bullet_2` / `bullet_3`
   - `cta` = `Free 3-min readiness assessment`
   - `brand` = `KontrolIQ`
3. Resize to `1080x1350` if needed
4. Run brand-check if the tool exists; fix obvious off-brand issues
5. Export **PNG**

#### 7b. Fallback — Generate from prompt
If no brand template / autofill:

```
Create a LinkedIn portrait infographic (1080x1350) for KontrolIQ by Mainoo Technologies.

Brand:
- Background: near-black #161616 or white #FFFFFF (pick one; prefer dark)
- Accent: #D37506 for “IQ” and key highlights only
- Font: Montserrat or closest geometric sans
- Clean, high-contrast, no purple, no glow clutter, no emoji

Content:
- Headline: {headline}
- Subline: {subline}
- Three bullets:
  1. {b1}
  2. {b2}
  3. {b3}
- Footer: KontrolIQ · Free 3-min readiness assessment

Do not include a long URL. Do not claim audit certification or regulator endorsement.
```

Then export PNG. Brand-check if available.

#### 7c. Optional NotebookLM Studio
Only if Canva fails entirely: generate a NotebookLM Studio infographic as a rough visual, and label it **off-brand draft — replace with Canva**. Do not treat Studio output as final.

#### 7d. Asset handling
- Prefer attaching/exporting PNG into the Notion publish pack (upload or link)
- Record Canva design URL if returned
- File name suggestion: `kontroliq-linkedin-{campaign}-{YYYYMMDD}.png`

### 8. Save Notion publish pack

Create a child page under LinkedIn-to-Revenue Campaign (`3cc4e335-fe54-8150-9dae-d27f1fb46912`) titled:

`Week N Publish Pack — {campaign} (YYYY-MM-DD)`

Include:
- **Source refresh summary** (synced / imported / skipped)
- Status + publish checklist
- Post body (copy-paste) with **in-body UTM**
- Scheduling note: attach Canva PNG; LinkedIn Schedule does not support first comment — UTM stays in body
- Infographic: PNG / Canva link + headline/bullets used
- 2–3 comment reply scripts
- Week KPI targets (5 assessments / 2 hot / 1 Calendly / 3 DMs)

### 9. Stop

Do **not** publish or schedule to LinkedIn automatically. Tell Smith the Notion URL and ask for review / schedule in LinkedIn UI.

## Messaging guardrails (hard rules)

**Say:** indicative self-assessment, Audit Readiness Intelligence, design-partner program, sales-assisted / BYOC, frameworks as context (Ghana DPA, ISO 27001, SOC 2, BoG expectations)

**Never say:** start free trial, published pricing, automates BoG, regulator endorsement, audit-ready certified

## Updating configs

Edit `.cursor/linkedin-source-watchlist.json` for research queries / seed URLs / import cap.

Edit `.cursor/linkedin-brand-visual.json` for Canva template name, size, colors, and CTA line.

## Notion references

- Campaign: https://app.notion.com/p/3cc4e335fe5481509daed27f1fb46912
- NotebookLM workflow: https://app.notion.com/p/3cc4e335fe5481a39bc8c0d86b910375
- Local switch guide: https://app.notion.com/p/3cd4e335fe5481c787d7ed1299e79567
