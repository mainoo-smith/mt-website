/**
 * KontrolIQ website revenue funnel config.
 *
 * After deploying Google Apps Script (see ops/Code.gs + Notion Ops Runbook):
 * paste the Web App /exec URL into formEndpoint and commit.
 *
 * Leave formEndpoint empty to run the assessment offline (report still works;
 * leads are only stored in localStorage for testing).
 */
window.KONTROLIQ_FUNNEL = {
  formEndpoint: "",
  calendlyUrl: "https://calendly.com/mainootechnologies",
  siteHome: "../index.html"
};
