/**
 * KontrolIQ lead magnet — client logic
 * Scoring/domains/questions from Perplexity app.js (mirrors app/scoring.py).
 * Lead capture adapted for static GitHub Pages → Google Apps Script
 * (see js/funnel-config.js + ops/Code.gs + Notion Ops Runbook).
 */
(function () {
  "use strict";

  var CFG = window.KONTROLIQ_FUNNEL || {};
  var STORAGE_LEADS = "kontroliq_leads";
  var STORAGE_REPORT = "kontroliq_latest_report";
  var STORAGE_UTM = "kontroliq_utm";

  // Mirrors app/scoring.py QUESTIONS + DOMAINS (kept in sync manually)
  var DOMAINS = [
    { id: "D1", name: "Identity & Access Security", weight: 0.21 },
    { id: "D2", name: "Data Protection & Privacy", weight: 0.19 },
    { id: "D3", name: "Infrastructure Security", weight: 0.17 },
    { id: "D4", name: "Monitoring & Accountability", weight: 0.17 },
    { id: "D5", name: "Resilience & Availability", weight: 0.14 },
    { id: "D6", name: "Processing Integrity", weight: 0.12 }
  ];

  var MATURITY = [
    "Not in place",
    "Ad-hoc / manual",
    "Defined & implemented",
    "Verified & continuous"
  ];

  var QUESTIONS = [
    {
      id: "q1",
      domain: "D1",
      text: "Multi-factor authentication is enforced for all cloud console and programmatic (API) access.",
      control: "MFA Enforcement"
    },
    {
      id: "q2",
      domain: "D1",
      text: "Privileged access is scoped (least privilege), reviewed periodically, and joiner-mover-leaver changes are automated.",
      control: "Privileged Access & JML"
    },
    {
      id: "q3",
      domain: "D2",
      text: "Sensitive and personal data is encrypted at rest and in transit with managed keys, and retention/deletion is enforced.",
      control: "Encryption & Retention"
    },
    {
      id: "q4",
      domain: "D2",
      text: "You can identify where personal data lives, who can access it, and demonstrate lawful processing (Ghana DPA / NDPA / GDPR).",
      control: "Data Discovery & Privacy"
    },
    {
      id: "q5",
      domain: "D3",
      text: "Network exposure is restricted (no public ports, private subnets, security groups/NACLs) and configurations are hardened.",
      control: "Network & Config Hardening"
    },
    {
      id: "q6",
      domain: "D3",
      text: "Environments (dev/test/prod) are isolated and access is segregated across them.",
      control: "Environment Segregation"
    },
    {
      id: "q7",
      domain: "D4",
      text: "Audit logging is enabled for control-plane activity and access to sensitive resources, with alerting on anomalies.",
      control: "Audit Logging & Alerting"
    },
    {
      id: "q8",
      domain: "D4",
      text: "You produce audit-ready evidence (who did what, when, and whether controls passed) without manual assembly.",
      control: "Evidence Readiness"
    },
    {
      id: "q9",
      domain: "D5",
      text: "Backups exist, are tested, and have defined recovery objectives (RTO/RPO) for in-scope systems.",
      control: "Backups & Recovery"
    },
    {
      id: "q10",
      domain: "D5",
      text: "Change management is controlled and every infrastructure change is reviewed, approved, and logged.",
      control: "Change Management"
    },
    {
      id: "q11",
      domain: "D6",
      text: "Transaction and processing controls are monitored for completeness, accuracy, and authorization.",
      control: "Transaction Governance"
    },
    {
      id: "q12",
      domain: "D6",
      text: "Third-party and vendor access is governed, reviewed, and risks are tracked.",
      control: "Vendor Risk Management"
    }
  ];

  var FRAMEWORK_LABELS = {
    ghana_dpa: "Ghana DPA (Act 843)",
    ndpa: "Nigeria NDPA",
    iso_27001: "ISO/IEC 27001",
    soc2: "SOC 2",
    not_sure: "Not sure yet"
  };

  var EVIDENCE_LABELS = {
    email: "Email / shared drives",
    tickets: "Ticketing system",
    spreadsheets: "Spreadsheets",
    governance_tool: "GRC / governance tool",
    none: "No formal process"
  };

  var CLOUD_LABELS = {
    aws: "AWS",
    azure: "Azure",
    gcp: "Google Cloud",
    hybrid: "Hybrid / on-prem"
  };

  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var incoming = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      ref: params.get("ref") || ""
    };
    try {
      var existing = JSON.parse(sessionStorage.getItem(STORAGE_UTM) || "{}");
      var merged = {};
      Object.keys(incoming).forEach(function (k) {
        merged[k] = incoming[k] || existing[k] || "";
      });
      sessionStorage.setItem(STORAGE_UTM, JSON.stringify(merged));
      return merged;
    } catch (e) {
      return incoming;
    }
  }

  function getUtm() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_UTM) || "{}");
    } catch (e) {
      return {};
    }
  }

  // ---- Client-side scoring (ports app/scoring.py weighted_domain_aggregation) ----
  function scoreReadiness(answers, qualification) {
    var byDomain = {};
    DOMAINS.forEach(function (d) {
      byDomain[d.id] = [];
    });
    QUESTIONS.forEach(function (q) {
      var m = Math.max(0, Math.min(3, parseInt(answers[q.id] != null ? answers[q.id] : 0, 10)));
      byDomain[q.domain].push({
        control: q.control,
        text: q.text,
        maturity: m,
        label: MATURITY[m],
        gap: m < 3
      });
    });
    var domains = DOMAINS.map(function (d) {
      var items = byDomain[d.id];
      var avg = items.length
        ? items.reduce(function (s, i) {
            return s + i.maturity;
          }, 0) / items.length
        : 0;
      return {
        id: d.id,
        name: d.name,
        weight: d.weight,
        avg_maturity: Math.round(avg * 100) / 100,
        score: Math.round((avg / 3) * 100 * 10) / 10,
        items: items
      };
    });
    var overall =
      Math.round(
        domains.reduce(function (s, dr) {
          return s + dr.score * dr.weight;
        }, 0) * 10
      ) / 10;
    var toneVal = overall < 50 ? "critical" : overall < 75 ? "warning" : "healthy";
    var verdict =
      overall < 50
        ? "Not audit-ready — significant gaps across multiple domains."
        : overall < 75
          ? "Partially ready — several controls need remediation before audit."
          : "Largely ready — focus on closing the remaining gaps to 'verified'.";
    var gaps = [];
    domains.forEach(function (dr) {
      dr.items.forEach(function (i) {
        if (i.gap) {
          gaps.push({
            control: i.control,
            text: i.text,
            maturity: i.maturity,
            label: i.label,
            domain: dr.name,
            domain_id: dr.id,
            weight: dr.weight
          });
        }
      });
    });
    gaps.sort(function (a, b) {
      return a.maturity - b.maturity || b.weight - a.weight;
    });
    var top_gaps = gaps.slice(0, 3).map(function (g) {
      return {
        control: g.control,
        domain: g.domain,
        label: g.label,
        maturity: g.maturity,
        text: g.text
      };
    });
    return {
      overall_score: overall,
      verdict: verdict,
      verdict_tone: toneVal,
      domains: domains,
      top_gaps: top_gaps,
      qualification: qualification || {},
      run_id: ""
    };
  }

  function tone(score) {
    return score < 50 ? "critical" : score < 75 ? "warning" : "healthy";
  }

  function daysUntil(iso) {
    if (!iso) return null;
    var target = new Date(iso + "T00:00:00").getTime();
    if (isNaN(target)) return null;
    return Math.ceil((target - Date.now()) / 86400000);
  }

  function qualificationTier(score, nextAuditDate) {
    var days = daysUntil(nextAuditDate);
    if ((days !== null && days >= 0 && days <= 90) || score < 45) return "hot";
    if ((days !== null && days > 90 && days <= 180) || score < 70) return "warm";
    return "nurture";
  }

  function calendlyUrl(qualification) {
    var base = CFG.calendlyUrl || "https://calendly.com/mainootechnologies";
    var utm = getUtm();
    var params = new URLSearchParams();
    if (qualification && qualification.full_name) params.set("name", qualification.full_name);
    if (qualification && qualification.email) params.set("email", qualification.email);
    if (utm.utm_source) params.set("utm_source", utm.utm_source);
    params.set("utm_medium", utm.utm_medium || "assessment");
    params.set("utm_campaign", utm.utm_campaign || "readiness-checklist");
    if (utm.utm_content) params.set("utm_content", utm.utm_content);
    var qs = params.toString();
    return qs ? base + "?" + qs : base;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderQuestions() {
    var host = document.getElementById("questions");
    if (!host) return;
    var cur = "";
    var html = "";
    for (var qi = 0; qi < QUESTIONS.length; qi++) {
      var q = QUESTIONS[qi];
      if (q.domain !== cur) {
        var d = DOMAINS.find(function (x) {
          return x.id === q.domain;
        });
        html +=
          '<div class="d-flex align-items-center mt-4 mb-2"><i class="fas fa-layer-group mr-2" style="color:var(--accent-500)"></i><h5 class="mb-0 font-weight-bold">' +
          d.name +
          '</h5><span class="ml-2 text-muted small">weight ' +
          d.weight +
          "</span></div>";
        cur = q.domain;
      }
      html +=
        '<div class="q-block mb-3"><div class="d-flex justify-content-between align-items-start flex-wrap"><div class="q-label pr-2" style="min-width:0">' +
        q.text +
        '</div><div class="q-control">' +
        q.control +
        '</div></div><div class="row mt-2 text-center">';
      for (var v = 0; v < 4; v++) {
        html +=
          '<div class="col-3 px-1"><label class="maturity-option"><input type="radio" name="' +
          q.id +
          '" value="' +
          v +
          '"><div class="opt-box">' +
          MATURITY[v] +
          "</div></label></div>";
      }
      html += "</div></div>";
    }
    host.innerHTML = html;
  }

  function collectAnswers() {
    var a = {};
    QUESTIONS.forEach(function (q) {
      var el = document.querySelector('input[name="' + q.id + '"]:checked');
      a[q.id] = el ? parseInt(el.value, 10) : 0;
    });
    return a;
  }

  function collectQualification(form) {
    var fd = new FormData(form);
    var frameworks = fd.getAll("frameworks");
    if (!frameworks.length) {
      var sel = form.querySelector('[name="frameworks"]');
      if (sel) {
        frameworks = Array.prototype.slice.call(sel.selectedOptions).map(function (o) {
          return o.value;
        });
      }
    }
    return {
      company: (fd.get("company") || "").trim(),
      full_name: (fd.get("full_name") || "").trim(),
      role: fd.get("role") || "",
      email: (fd.get("email") || "").trim(),
      next_audit_date: fd.get("next_audit_date") || "",
      frameworks: frameworks,
      evidence_process: fd.get("evidence_process") || "",
      cloud_provider: fd.get("cloud_provider") || "",
      team_size: fd.get("team_size") || "",
      message: (fd.get("message") || "").trim()
    };
  }

  function renderReport(r) {
    var host = document.getElementById("report");
    if (!host || !r) return;
    var t = r.verdict_tone || tone(r.overall_score);
    var q = r.qualification || {};
    var bars = "";
    for (var i = 0; i < r.domains.length; i++) {
      var d = r.domains[i];
      var dt = tone(d.score);
      bars +=
        '<div class="mt-3"><div class="d-flex justify-content-between"><span class="font-weight-bold">' +
        d.name +
        '</span><span class="text-muted small">' +
        Math.round(d.score) +
        "% · weight " +
        d.weight +
        '</span></div><div class="domain-bar-track mt-1"><div class="domain-bar-fill fill-' +
        dt +
        '" style="width:' +
        Math.round(d.score) +
        '%"></div></div></div>';
    }
    var gaps =
      r.top_gaps && r.top_gaps.length
        ? r.top_gaps
            .map(function (g) {
              return (
                '<li class="mb-3"><span class="gap-chip">' +
                escapeHtml(g.control) +
                '</span><div class="small text-muted mt-1">' +
                escapeHtml(g.domain) +
                " · currently: " +
                escapeHtml(g.label) +
                "</div></li>"
              );
            })
            .join("")
        : '<p class="text-muted mt-3">No major gaps detected.</p>';

    var meta = "";
    if (q.full_name || q.company) {
      meta =
        '<p class="text-muted small mb-3">Prepared for ' +
        escapeHtml(q.full_name || "you") +
        (q.company ? " · " + escapeHtml(q.company) : "") +
        (q.next_audit_date ? " · next review " + escapeHtml(q.next_audit_date) : "") +
        "</p>";
    }

    host.innerHTML =
      '<div class="card assess-card p-4 mb-4 text-center">' +
      '<div class="row align-items-center">' +
      '<div class="col-md-4"><div class="score-ring tone-' +
      t +
      '"><div class="num">' +
      Math.round(r.overall_score) +
      '%</div><div class="lbl">Readiness</div></div></div>' +
      '<div class="col-md-8 text-md-left mt-3 mt-md-0"><h4 class="font-weight-bold">Verdict</h4><p class="lead">' +
      escapeHtml(r.verdict) +
      "</p>" +
      meta +
      '<p class="text-muted small mb-0">Weighted aggregate across 6 domains, mirroring how auditors weight assurance areas (domain model v1.1).</p></div>' +
      "</div></div>" +
      '<div class="card assess-card p-4 mb-4"><h4 class="font-weight-bold"><i class="fas fa-chart-bar mr-2" style="color:var(--accent-500)"></i>Domain breakdown</h4>' +
      bars +
      "</div>" +
      '<div class="row">' +
      '<div class="col-md-6 mb-4"><div class="card assess-card p-4 h-100"><h4 class="font-weight-bold"><i class="fas fa-bullseye mr-2" style="color:var(--accent-500)"></i>Top gaps to fix first</h4><ul class="list-unstyled mt-3">' +
      gaps +
      "</ul></div></div>" +
      '<div class="col-md-6 mb-4"><div class="card assess-card p-4 h-100" style="background:var(--navy-800);color:#fff"><h4 class="font-weight-bold" style="color:#fff">Turn this score into audit-ready evidence</h4><p class="mt-3" style="color:rgba(255,255,255,0.8)">KontrolIQ continuously collects control signals, evaluates your posture, and produces regulator-ready evidence — without moving sensitive data out of your environment.</p><ul class="mt-3" style="color:rgba(255,255,255,0.85)"><li>Continuous evidence collection (no more spreadsheet chase)</li><li>Remediation steps with owners and deadlines</li><li>Audit-ready reports mapped to Ghana DPA, ISO 27001 &amp; SOC 2</li></ul><a href="' +
      calendlyUrl(q) +
      '" target="_blank" rel="noopener" class="btn btn-accent btn-lg btn-block mt-3"><i class="far fa-calendar mr-2"></i>Book a 20-min readiness review</a></div></div>' +
      "</div>";

    host.scrollIntoView({ behavior: "smooth" });
  }

  function showFormError(msg) {
    var e = document.getElementById("formError");
    if (e) {
      e.textContent = msg;
      e.style.display = "block";
    }
  }

  function saveReportLocally(report) {
    var id = "kq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    try {
      sessionStorage.setItem("kq_report_" + id, JSON.stringify(report));
      sessionStorage.setItem(STORAGE_REPORT, id);
    } catch (e) {}
    return id;
  }

  function loadReportLocally(id) {
    try {
      var raw = sessionStorage.getItem("kq_report_" + id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function buildAppsScriptPayload(type, qualification, report) {
    var utm = getUtm();
    var fw = qualification.frameworks || [];
    if (typeof fw === "string") fw = fw ? fw.split(",") : [];
    var gaps = report
      ? (report.top_gaps || []).map(function (g) {
          return g.control + " (" + g.domain + "): " + g.label;
        })
      : [];
    var score = report ? Math.round(report.overall_score) : null;
    return {
      submitted_at: new Date().toISOString(),
      type: type,
      contact: {
        full_name: qualification.full_name || "",
        email: qualification.email || "",
        company: qualification.company || "",
        role: qualification.role || "",
        message: qualification.message || ""
      },
      qualification: {
        next_audit_date: qualification.next_audit_date || "",
        frameworks: fw.map(function (f) {
          return FRAMEWORK_LABELS[f] || f;
        }),
        cloud_provider: CLOUD_LABELS[qualification.cloud_provider] || qualification.cloud_provider || "",
        evidence_process:
          EVIDENCE_LABELS[qualification.evidence_process] || qualification.evidence_process || "",
        team_size: qualification.team_size || ""
      },
      attribution: {
        utm_source: utm.utm_source || "",
        utm_medium: utm.utm_medium || "",
        utm_campaign: utm.utm_campaign || "",
        utm_content: utm.utm_content || "",
        ref: utm.ref || ""
      },
      readiness_score: score,
      qualification_tier: report
        ? qualificationTier(score, qualification.next_audit_date)
        : "nurture",
      priority_gaps: gaps
    };
  }

  function saveLeadLocally(payload) {
    try {
      var list = JSON.parse(localStorage.getItem(STORAGE_LEADS) || "[]");
      list.push(payload);
      localStorage.setItem(STORAGE_LEADS, JSON.stringify(list.slice(-50)));
    } catch (e) {}
  }

  function submitLead(payload) {
    saveLeadLocally(payload);
    var endpoint = CFG.formEndpoint || "";
    if (!endpoint) return Promise.resolve({ ok: false, skipped: true });
    return fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return { ok: res.ok || res.type === "opaque", status: res.status };
      })
      .catch(function () {
        return fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        })
          .then(function () {
            return { ok: true, opaque: true };
          })
          .catch(function () {
            return { ok: false, error: true };
          });
      });
  }

  function initAssessPage() {
    renderQuestions();
    var form = document.getElementById("assessForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = document.getElementById("formError");
      if (err) err.style.display = "none";

      var qualification = collectQualification(form);
      if (!qualification.full_name || !qualification.email) {
        showFormError("Please enter your name and work email.");
        return;
      }

      var missing = QUESTIONS.filter(function (q) {
        return !document.querySelector('input[name="' + q.id + '"]:checked');
      });
      if (
        missing.length &&
        !window.confirm(
          "You left " +
            missing.length +
            " question(s) unanswered. They will be scored as 0 (not in place). Continue?"
        )
      ) {
        return;
      }

      var answers = collectAnswers();
      var report = scoreReadiness(answers, qualification);
      var reportId = saveReportLocally(report);
      var leadPayload = buildAppsScriptPayload("assessment", qualification, report);

      var btn = form.querySelector("button[type=submit]");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Calculating…';
      }

      submitLead(leadPayload).finally(function () {
        // Prefer dedicated report page (shareable deep link within session)
        if (location.pathname.indexOf("assess.html") !== -1) {
          window.location.href = "report.html?id=" + encodeURIComponent(reportId);
          return;
        }
        form.style.display = "none";
        renderReport(report);
        if (history.replaceState) {
          history.replaceState({}, "", "report.html?id=" + reportId);
        }
      });
    });
  }

  function initReportPage() {
    var host = document.getElementById("report");
    if (!host) return;
    var params = new URLSearchParams(location.search);
    var rid = params.get("id");
    if (!rid) {
      try {
        rid = sessionStorage.getItem(STORAGE_REPORT);
      } catch (e) {}
    }
    if (rid) {
      var stored = loadReportLocally(rid);
      if (stored) {
        renderReport(stored);
        return;
      }
    }
    // No stored report: show sample so preview/demo is never blank
    var sample = {
      q1: 2,
      q2: 1,
      q3: 3,
      q4: 0,
      q5: 2,
      q6: 1,
      q7: 0,
      q8: 1,
      q9: 2,
      q10: 2,
      q11: 1,
      q12: 0
    };
    if (!rid) {
      renderReport(
        scoreReadiness(sample, { company: "Sample Co.", role: "Compliance Lead", full_name: "Sample User" })
      );
    } else {
      host.innerHTML =
        '<div class="alert alert-warning">Report not found. <a href="assess.html">Take the assessment</a></div>';
    }
  }

  function initContactPage() {
    var cform = document.getElementById("contactForm");
    if (!cform) return;
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var qualification = collectQualification(cform);
      if (!qualification.full_name || !qualification.email) {
        var e2 = document.getElementById("cErr");
        if (e2) {
          e2.textContent = "Please enter your name and work email.";
          e2.style.display = "block";
        }
        return;
      }
      var btn = cform.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      var payload = buildAppsScriptPayload("contact", qualification, null);
      submitLead(payload).then(function () {
        cform.innerHTML =
          '<div class="alert alert-success mb-0"><strong>Thanks — we\'ve got your message.</strong> We\'ll be in touch within one business day.</div>';
      });
    });
  }

  function init() {
    captureUtm();
    var page = document.body && document.body.getAttribute("data-kq-page");
    var path = location.pathname || "";

    if (page === "assess" || path.indexOf("assess.html") !== -1) {
      initAssessPage();
    }
    if (page === "report" || path.indexOf("report.html") !== -1) {
      initReportPage();
    }
    if (page === "contact" || path.indexOf("contact.html") !== -1) {
      initContactPage();
    }
    // Landing page only needs UTM capture (already done)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
