/**
 * KontrolIQ Compliance Readiness Assessment
 * Frontend for /assessment/ — posts to Google Apps Script (ops/Code.gs).
 * Contract: Notion "Website Revenue Funnel — Ops Runbook"
 */
(function () {
  "use strict";

  var CFG = window.KONTROLIQ_FUNNEL || {};
  var STORAGE_LEADS = "kontroliq_leads";
  var STORAGE_REPORT = "kontroliq_latest_report";
  var STORAGE_UTM = "kontroliq_utm";

  var MATURITY = [
    { value: 0, label: "Not in place" },
    { value: 1, label: "Ad-hoc" },
    { value: 2, label: "Defined" },
    { value: 3, label: "Verified" }
  ];

  /* Six domains matching Apps Script email copy + SOC 2 TSC + Act 843 */
  var DOMAINS = [
    {
      id: "security",
      name: "Security",
      weight: 1.2,
      frameworks: ["SOC 2 CC6", "ISO 27001 A.9", "Ghana DPA"],
      questions: [
        {
          id: "sec-01",
          control: "SEC-01",
          text: "Privileged access is role-based, MFA-protected, and reviewed on a defined cadence."
        },
        {
          id: "sec-02",
          control: "SEC-02",
          text: "Security baselines (encryption, network exposure, hardening) are enforced in production."
        }
      ]
    },
    {
      id: "availability",
      name: "Availability",
      weight: 1.0,
      frameworks: ["SOC 2 A1", "ISO 27001 A.12"],
      questions: [
        {
          id: "avl-01",
          control: "AVL-01",
          text: "Backup, recovery, and uptime objectives are documented and periodically tested."
        },
        {
          id: "avl-02",
          control: "AVL-02",
          text: "Monitoring alerts cover outages, capacity, and critical dependency failures."
        }
      ]
    },
    {
      id: "confidentiality",
      name: "Confidentiality",
      weight: 1.1,
      frameworks: ["SOC 2 C1", "ISO 27001 A.8"],
      questions: [
        {
          id: "cnf-01",
          control: "CNF-01",
          text: "Sensitive data is classified and access is restricted to need-to-know roles."
        },
        {
          id: "cnf-02",
          control: "CNF-02",
          text: "Data at rest and in transit is encrypted with managed keys and rotation policy."
        }
      ]
    },
    {
      id: "privacy",
      name: "Privacy / Act 843",
      weight: 1.2,
      frameworks: ["Ghana DPA (Act 843)", "SOC 2 P", "ISO 27001 A.5"],
      questions: [
        {
          id: "prv-01",
          control: "PRV-01",
          text: "Personal data inventory and lawful basis are documented and kept current."
        },
        {
          id: "prv-02",
          control: "PRV-02",
          text: "Data subject rights and breach-notification timelines have a defined owner and SLA."
        }
      ]
    },
    {
      id: "processing_integrity",
      name: "Processing Integrity",
      weight: 1.0,
      frameworks: ["SOC 2 PI1", "ISO 27001 A.12"],
      questions: [
        {
          id: "pi-01",
          control: "PI-01",
          text: "Change management and deployment approvals are documented for production systems."
        },
        {
          id: "pi-02",
          control: "PI-02",
          text: "Critical processing jobs have integrity checks, error handling, and audit trails."
        }
      ]
    },
    {
      id: "audit_readiness",
      name: "Audit Readiness",
      weight: 1.2,
      frameworks: ["ISO 27001 A.18", "SOC 2 CC8"],
      questions: [
        {
          id: "aud-01",
          control: "AUD-01",
          text: "Compliance evidence is collected continuously — not assembled in a pre-audit scramble."
        },
        {
          id: "aud-02",
          control: "AUD-02",
          text: "Control owners, evidence sources, and review cadence are mapped and traceable."
        }
      ]
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

  function $(sel) { return document.querySelector(sel); }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

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

  function toneForScore(pct) {
    if (pct < 40) return "critical";
    if (pct < 70) return "warning";
    return "healthy";
  }

  function scoreToPct(raw) {
    return Math.round((raw / 3) * 100);
  }

  function formatDate(iso) {
    if (!iso) return "Not specified";
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
      });
    } catch (e) {
      return iso;
    }
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

  function renderQuestions() {
    var container = $("#questions");
    if (!container) return;
    var html = "";
    DOMAINS.forEach(function (domain) {
      html += '<div class="mb-4">';
      html += '<h5 class="font-weight-bold mb-1">' + domain.name + '</h5>';
      html += '<p class="text-muted small mb-3">Mapped to: ' + domain.frameworks.join(" · ") + '</p>';
      domain.questions.forEach(function (q) {
        var name = "q_" + q.id;
        html += '<div class="q-block">';
        html += '<div class="d-flex justify-content-between align-items-start mb-2">';
        html += '<div class="q-label">' + q.text + '</div>';
        html += '<span class="q-control ml-2">' + q.control + '</span>';
        html += '</div><div class="row no-gutters">';
        MATURITY.forEach(function (m) {
          html += '<div class="col-3 px-1 maturity-option"><label class="w-100 mb-0">';
          html += '<input type="radio" name="' + name + '" value="' + m.value + '" required>';
          html += '<div class="opt-box">' + m.label + '</div>';
          html += '</label></div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function readFormData(form) {
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
    var answers = {};
    DOMAINS.forEach(function (domain) {
      domain.questions.forEach(function (q) {
        var val = fd.get("q_" + q.id);
        answers[q.id] = val !== null ? parseInt(val, 10) : null;
      });
    });
    return {
      full_name: (fd.get("full_name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      company: (fd.get("company") || "").trim(),
      role: fd.get("role") || "",
      next_audit_date: fd.get("next_audit_date") || "",
      team_size: fd.get("team_size") || "",
      frameworks: frameworks,
      cloud_provider: fd.get("cloud_provider") || "",
      evidence_process: fd.get("evidence_process") || "",
      message: (fd.get("message") || "").trim(),
      answers: answers
    };
  }

  function computeScores(answers) {
    var domainResults = [];
    var allQuestions = [];
    var totalWeight = 0;
    var weightedSum = 0;

    DOMAINS.forEach(function (domain) {
      var scores = domain.questions.map(function (q) {
        var raw = answers[q.id];
        if (raw === null || isNaN(raw)) raw = 0;
        return { question: q, raw: raw, pct: scoreToPct(raw) };
      });
      var avgRaw = scores.reduce(function (s, x) { return s + x.raw; }, 0) / scores.length;
      var pct = scoreToPct(avgRaw);
      domainResults.push({
        id: domain.id,
        name: domain.name,
        weight: domain.weight,
        pct: pct,
        tone: toneForScore(pct),
        questions: scores
      });
      totalWeight += domain.weight;
      weightedSum += pct * domain.weight;
      scores.forEach(function (s) {
        allQuestions.push(Object.assign({ domain: domain.name }, s));
      });
    });

    var overall = Math.round(weightedSum / totalWeight);
    var gaps = allQuestions
      .filter(function (q) { return q.raw <= 1; })
      .sort(function (a, b) {
        return a.raw - b.raw || a.question.control.localeCompare(b.question.control);
      })
      .slice(0, 5);

    return {
      overall: overall,
      tone: toneForScore(overall),
      domains: domainResults,
      gaps: gaps
    };
  }

  function buildPayload(type, data, scores) {
    var utm = getUtm();
    var gaps = scores
      ? scores.gaps.map(function (g) {
          return g.question.control + ": " + g.question.text;
        })
      : [];
    var tier = scores
      ? qualificationTier(scores.overall, data.next_audit_date)
      : "nurture";

    return {
      submitted_at: new Date().toISOString(),
      type: type,
      contact: {
        full_name: data.full_name,
        email: data.email,
        company: data.company,
        role: data.role,
        message: data.message || ""
      },
      qualification: {
        next_audit_date: data.next_audit_date,
        frameworks: (data.frameworks || []).map(function (f) {
          return FRAMEWORK_LABELS[f] || f;
        }),
        cloud_provider: CLOUD_LABELS[data.cloud_provider] || data.cloud_provider,
        evidence_process: EVIDENCE_LABELS[data.evidence_process] || data.evidence_process,
        team_size: data.team_size
      },
      attribution: {
        utm_source: utm.utm_source || "",
        utm_medium: utm.utm_medium || "",
        utm_campaign: utm.utm_campaign || "",
        utm_content: utm.utm_content || "",
        ref: utm.ref || ""
      },
      readiness_score: scores ? scores.overall : null,
      qualification_tier: tier,
      priority_gaps: gaps,
      domain_scores: scores
        ? scores.domains.map(function (d) {
            return { id: d.id, name: d.name, pct: d.pct };
          })
        : []
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
    if (!endpoint) {
      return Promise.resolve({ ok: false, skipped: true });
    }
    /* Apps Script web apps often require no-cors / text; try JSON first */
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
        /* Fallback: no-cors so submit still reaches Apps Script */
        return fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        }).then(function () {
          return { ok: true, opaque: true };
        }).catch(function () {
          return { ok: false, error: true };
        });
      });
  }

  function calendlyUrl(data) {
    var base = CFG.calendlyUrl || "https://calendly.com/mainootechnologies";
    var utm = getUtm();
    var params = new URLSearchParams();
    if (data && data.full_name) params.set("name", data.full_name);
    if (data && data.email) params.set("email", data.email);
    if (utm.utm_source) params.set("utm_source", utm.utm_source);
    params.set("utm_medium", utm.utm_medium || "assessment");
    params.set("utm_campaign", utm.utm_campaign || "readiness-checklist");
    if (utm.utm_content) params.set("utm_content", utm.utm_content);
    var qs = params.toString();
    return qs ? base + "?" + qs : base;
  }

  function renderReportHtml(data, scores) {
    var fwLabels = (data.frameworks || [])
      .map(function (f) { return FRAMEWORK_LABELS[f] || f; })
      .join(", ") || "Not specified";

    var html = '<div class="report-card mb-4">';
    html += '<div class="text-center mb-4">';
    html += '<div class="score-ring tone-' + scores.tone + '">';
    html += '<div class="num">' + scores.overall + '</div>';
    html += '<div class="lbl">/ 100</div></div>';
    html += '<h3 class="font-weight-bold mt-3 mb-1">Audit Readiness Snapshot</h3>';
    html += '<p class="report-meta mb-0">Prepared for ' + escapeHtml(data.full_name);
    if (data.company) html += " · " + escapeHtml(data.company);
    html += "</p></div>";

    html += '<div class="row mb-4">';
    html += metaCol("Frameworks", fwLabels);
    html += metaCol("Next review", formatDate(data.next_audit_date));
    html += metaCol("Cloud", CLOUD_LABELS[data.cloud_provider] || data.cloud_provider || "—");
    html += metaCol("Evidence today", EVIDENCE_LABELS[data.evidence_process] || data.evidence_process || "—");
    html += "</div>";

    html += '<h5 class="font-weight-bold mb-3">Domain breakdown</h5>';
    scores.domains.forEach(function (d) {
      html += '<div class="mb-3">';
      html += '<div class="d-flex justify-content-between small mb-1">';
      html += '<span class="font-weight-bold">' + d.name + "</span>";
      html += "<span>" + d.pct + "%</span></div>";
      html +=
        '<div class="domain-bar-track"><div class="domain-bar-fill fill-' +
        d.tone +
        '" style="width:' +
        d.pct +
        '%"></div></div></div>';
    });

    html += '<h5 class="font-weight-bold mt-4 mb-2">Top gaps to address first</h5>';
    if (scores.gaps.length) {
      html += '<div class="mb-3">';
      scores.gaps.forEach(function (g) {
        html +=
          '<span class="gap-chip">' +
          g.question.control +
          " · " +
          escapeHtml(g.question.text) +
          "</span>";
      });
      html += "</div>";
    } else {
      html +=
        '<p class="text-muted small">No critical gaps flagged — focus on maintaining continuous evidence collection.</p>';
    }

    html +=
      '<p class="small text-muted mt-4 mb-0">Indicative self-assessment across Security, Availability, Confidentiality, Privacy/Act 843, Processing Integrity, and Audit Readiness — not an audit or legal opinion.</p>';
    html += "</div>";

    html += '<div class="report-cta text-center mb-4">';
    html += '<h4 class="font-weight-bold mb-2">Want a walkthrough of your gaps?</h4>';
    html +=
      '<p class="mb-3" style="opacity:0.85">Book a 20-minute design-partner session. We\'ll map your readiness score to a sovereign BYOC pilot plan.</p>';
    html +=
      '<a class="btn btn-accent btn-lg px-4 mr-2 mb-2" href="' +
      calendlyUrl(data) +
      '" target="_blank" rel="noopener"><i class="far fa-calendar mr-2"></i>Schedule a readiness demo</a>';
    html +=
      '<a class="btn btn-outline-accent btn-lg px-4 mb-2" href="contact.html" style="background:transparent;color:#fff;border-color:#fff;">Talk to us</a>';
    html += "</div>";
    return html;
  }

  function metaCol(label, value) {
    return (
      '<div class="col-6 col-md-3 mb-3"><div class="small text-muted text-uppercase">' +
      label +
      '</div><div class="font-weight-bold">' +
      escapeHtml(value) +
      "</div></div>"
    );
  }

  function saveReport(payload) {
    var id = "kq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    try {
      sessionStorage.setItem("kq_report_" + id, JSON.stringify(payload));
      sessionStorage.setItem(STORAGE_REPORT, id);
    } catch (e) {}
    return id;
  }

  function loadReport(id) {
    try {
      var raw = sessionStorage.getItem("kq_report_" + id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideError(el) {
    if (el) el.style.display = "none";
  }

  function handleAssessSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var errEl = $("#formError");
    hideError(errEl);

    var data = readFormData(form);
    if (!data.full_name || !data.email) {
      showError(errEl, "Please enter your name and work email.");
      return;
    }

    var missing = false;
    DOMAINS.forEach(function (d) {
      d.questions.forEach(function (q) {
        if (data.answers[q.id] === null || isNaN(data.answers[q.id])) missing = true;
      });
    });
    if (missing) {
      showError(errEl, "Please answer all readiness questions before generating your report.");
      return;
    }

    var scores = computeScores(data.answers);
    var reportPayload = {
      data: data,
      scores: scores,
      created_at: new Date().toISOString()
    };
    var reportId = saveReport(reportPayload);
    var leadPayload = buildPayload("assessment", data, scores);

    var btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating report…';
    }

    submitLead(leadPayload).finally(function () {
      window.location.href = "report.html?id=" + encodeURIComponent(reportId);
    });
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var errEl = $("#cErr");
    hideError(errEl);
    var data = readFormData(form);
    if (!data.full_name || !data.email) {
      showError(errEl, "Please enter your name and work email.");
      return;
    }
    var btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
    }
    var payload = buildPayload("contact", data, null);
    submitLead(payload).then(function () {
      form.innerHTML =
        '<div class="alert alert-success-soft mb-0">Thanks — we received your message and will follow up shortly.</div>';
    });
  }

  function initReportPage() {
    var container = $("#report");
    if (!container) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!id) {
      try {
        id = sessionStorage.getItem(STORAGE_REPORT);
      } catch (e) {}
    }
    var payload = id ? loadReport(id) : null;
    if (!payload) {
      container.innerHTML =
        '<div class="alert alert-warning">No report found. <a href="assess.html">Take the assessment</a> to generate your readiness snapshot.</div>';
      return;
    }
    container.innerHTML = renderReportHtml(payload.data, payload.scores);
    document.title = payload.scores.overall + "/100 Readiness | KontrolIQ";
  }

  function initAssessPage() {
    renderQuestions();
    var form = $("#assessForm");
    if (form) form.addEventListener("submit", handleAssessSubmit);
  }

  function initContactPage() {
    var form = $("#contactForm");
    if (form) form.addEventListener("submit", handleContactSubmit);
  }

  function init() {
    captureUtm();
    var page = document.body && document.body.getAttribute("data-kq-page");
    if (page === "assess") initAssessPage();
    else if (page === "report") initReportPage();
    else if (page === "contact") initContactPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
