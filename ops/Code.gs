/**
 * KontrolIQ Lead Capture + Email Nurture
 *
 * SETUP (one time):
 * 1. Create a Google Sheet named "KontrolIQ Leads"
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Run setupSheet() once (authorize when prompted)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL into mt-website/js/funnel-config.js → formEndpoint
 * 6. Run createDailyTrigger() once to enable Day 3 / Day 7 nurture emails
 *
 * Optional: set Script Property CALENDLY_URL (Project settings → Script properties)
 */

var SHEET_NAME = "Leads";
var CALENDLY_DEFAULT = "https://calendly.com/mainootechnologies";

var HEADERS = [
  "submitted_at",
  "type",
  "full_name",
  "email",
  "company",
  "role",
  "next_audit_date",
  "frameworks",
  "cloud_provider",
  "evidence_process",
  "team_size",
  "readiness_score",
  "qualification_tier",
  "priority_gaps",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "message",
  "email_1_sent",
  "email_2_sent",
  "email_3_sent",
  "nurture_status"
];

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function getSheet() {
  setupSheet();
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Empty body" });
    }
    var payload = JSON.parse(e.postData.contents);
    var row = payloadToRow(payload);
    var sheet = getSheet();
    sheet.appendRow(row);
    var rowNum = sheet.getLastRow();

    // Skip nurture for smoke tests
    var email = payload.contact && payload.contact.email;
    var isSmoke = payload.type === "smoke" || (email && /example\.com$/i.test(email));
    if (email && !isSmoke) {
      sendEmail1_(payload, rowNum);
    }

    return jsonResponse({ ok: true, row: rowNum });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  return jsonResponse({ ok: true, service: "KontrolIQ Lead Capture", version: "1.0.0" });
}

function payloadToRow(p) {
  var c = p.contact || {};
  var q = p.qualification || {};
  var a = p.attribution || {};
  var gaps = p.priority_gaps || [];
  if (typeof gaps !== "string") gaps = gaps.join(" | ");

  return [
    p.submitted_at || new Date().toISOString(),
    p.type || "unknown",
    c.full_name || "",
    c.email || "",
    c.company || "",
    c.role || "",
    q.next_audit_date || q.audit_timeline || "",
    arrayOrString(q.frameworks),
    q.cloud_provider || q.cloud_env || "",
    q.evidence_process || "",
    q.team_size || "",
    p.readiness_score != null ? p.readiness_score : "",
    p.qualification_tier || "",
    gaps,
    a.utm_source || "",
    a.utm_campaign || "",
    a.utm_content || a.utm_medium || "",
    c.message || "",
    new Date().toISOString(),
    "",
    "",
    "active"
  ];
}

function arrayOrString(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.join("; ");
  return String(v);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function calendlyUrl_() {
  return PropertiesService.getScriptProperties().getProperty("CALENDLY_URL") || CALENDLY_DEFAULT;
}

function sendEmail1_(payload, rowNum) {
  var c = payload.contact;
  var score = payload.readiness_score != null ? payload.readiness_score : "—";
  var tier = payload.qualification_tier || "nurture";
  var gaps = payload.priority_gaps || [];
  var gapText = gaps.length
    ? gaps.slice(0, 3).map(function (g, i) { return (i + 1) + ". " + g; }).join("\n")
    : "Your baseline looks solid — a readiness review can validate evidence quality before your next audit.";

  var subject = "Your KontrolIQ readiness score: " + score + "/100";
  var body =
    "Hi " + (c.full_name || "there") + ",\n\n" +
    "Thanks for completing the Ghana Compliance Readiness Assessment" +
    (c.company ? " for " + c.company : "") + ".\n\n" +
    "YOUR READINESS SCORE: " + score + "/100\n\n" +
    "PRIORITY GAPS TO ADDRESS FIRST:\n" + gapText + "\n\n" +
    "What this means: this score reflects your self-assessed posture across six domains " +
    "(Security, Availability, Confidentiality, Privacy/Act 843, Processing Integrity, and Audit Readiness). " +
    "It is indicative — not an audit opinion — but it shows where auditors typically spend the most time.\n\n" +
    (tier === "hot"
      ? "Given your upcoming audit window, I'd recommend booking a 20-minute readiness review this week.\n\n"
      : "Over the next few days I'll share practical guidance on closing common gaps — no pitch, just playbook.\n\n") +
    "Book a readiness review: " + calendlyUrl_() + "\n\n" +
    "— Mainoo Technologies / KontrolIQ\n" +
    "Compliance infrastructure for sovereign environments\n" +
    "https://www.mainootechnologies.com\n";

  GmailApp.sendEmail(c.email, subject, body, { name: "KontrolIQ | Mainoo Technologies" });

  var sheet = getSheet();
  sheet.getRange(rowNum, colIndex_("email_1_sent")).setValue(new Date().toISOString());
}

function colIndex_(name) {
  return HEADERS.indexOf(name) + 1;
}

function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "processNurtureQueue") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("processNurtureQueue").timeBased().everyDays(1).atHour(9).create();
}

/**
 * Runs daily — sends Email 2 (day 3) and Email 3 (day 7) based on submitted_at.
 */
function processNurtureQueue() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    var row = rowToObject_(data[i]);
    if (row.nurture_status !== "active" || !row.email) continue;

    var submitted = new Date(row.submitted_at);
    var days = (now - submitted) / 86400000;

    if (days >= 3 && !row.email_2_sent) {
      sendEmail2_(row);
      sheet.getRange(i + 1, colIndex_("email_2_sent")).setValue(now.toISOString());
    }
    if (days >= 7 && !row.email_3_sent) {
      sendEmail3_(row);
      sheet.getRange(i + 1, colIndex_("email_3_sent")).setValue(now.toISOString());
      sheet.getRange(i + 1, colIndex_("nurture_status")).setValue("complete");
    }
  }
}

function rowToObject_(arr) {
  var o = {};
  for (var j = 0; j < HEADERS.length; j++) {
    o[HEADERS[j]] = arr[j];
  }
  return o;
}

function sendEmail2_(row) {
  var subject = "3 controls that show up in every failed audit";
  var body =
    "Hi " + (row.full_name || "there") + ",\n\n" +
    "Following up on your readiness assessment" +
    (row.company ? " (" + row.company + ")" : "") + ".\n\n" +
    "After working with Ghanaian audit practitioners and IT teams, three gaps appear in almost every failed or delayed audit:\n\n" +
    "1. ACCESS REVIEWS WITHOUT EVIDENCE TRAILS\n" +
    "   Auditors ask who had access to production systems at a point in time. " +
    "Spreadsheet attestations without system-generated logs get challenged.\n\n" +
    "2. EVIDENCE SCATTERED ACROSS EMAIL AND SHARED DRIVES\n" +
    "   When evidence lives in inboxes, it ages quickly and cannot be tied to control periods. " +
    "Centralized, audit-context metadata is what passes review.\n\n" +
    "3. CONTROLS WITH NO NAMED OWNER\n" +
    "   A failed control with no owner becomes an audit finding that stalls for weeks. " +
    "Remediation tracking with deadlines is non-negotiable for regulated fintechs.\n\n" +
    (row.readiness_score && row.readiness_score < 60
      ? "Your score of " + row.readiness_score + " suggests at least one of these may apply. "
      : "") +
    "KontrolIQ verifies automatable technical controls inside your cloud — evidence stays in your environment, not ours.\n\n" +
    "Reply to this email if you want to walk through your specific gap list.\n\n" +
    "— Mainoo Technologies / KontrolIQ\n";

  GmailApp.sendEmail(row.email, subject, body, { name: "KontrolIQ | Mainoo Technologies" });
}

function sendEmail3_(row) {
  var subject = "See continuous control verification in your cloud (20 min)";
  var body =
    "Hi " + (row.full_name || "there") + ",\n\n" +
    "Last note on your readiness assessment.\n\n" +
    "If you're preparing for a BoG review, DPA audit, or SOC 2 readiness assessment, " +
    "the next step is a focused 20-minute readiness review:\n\n" +
    "• Walk through your top gaps from the assessment\n" +
    "• See how KontrolIQ runs inside your AWS environment (BYOC — evidence never leaves your cloud)\n" +
    "• Discuss whether the design-partner pilot fits your timeline\n\n" +
    (row.next_audit_date
      ? "You noted an upcoming review around " + row.next_audit_date + " — happy to prioritize your slot.\n\n"
      : "") +
    "Book here: " + calendlyUrl_() + "\n\n" +
    "We're running a limited design-partner program for regulated Ghanaian organizations. " +
    "No self-serve signup yet — every deployment is sales-assisted to match your regulatory context.\n\n" +
    "If now isn't the right time, reply \"later\" and I'll check back when your audit date is closer.\n\n" +
    "— Mainoo Technologies / KontrolIQ\n" +
    "https://www.mainootechnologies.com/assessment/\n";

  GmailApp.sendEmail(row.email, subject, body, { name: "KontrolIQ | Mainoo Technologies" });
}
