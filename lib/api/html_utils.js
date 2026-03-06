  // ---------------------
  // html safety helpers
  // ---------------------
  const SAFE_HTML = Symbol.for("sivu.safe_html");

  // Ensure req.session exists (session middleware should provide it, but be defensive)
  if (!req.session) req.session = {};

  function $var_dump(obj) {
    try {
      return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
    } catch (err) {
      return `<pre>[var_dump error: ${err.message}]</pre>`;
    }
  }

  function html(raw) {
    return {
      [SAFE_HTML]: true,
      value: String(raw ?? ""),
    };
  }

  function isHtml(v) {
    return !!(v && typeof v === "object" && v[SAFE_HTML] === true);
  }

  function __toHtml(value) {
    if (value == null) return "";

    // Explicitly trusted HTML
    if (isHtml(value)) {
      return value.value;
    }

    // Auto-escape if enabled
    if (config.autoescape_html) {
      return escapeHtml(String(value));
    }

    // Raw output otherwise
    return String(value);
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function htmlentities(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[\u00A0-\u9999<>&]/gim, function (i) {
      return `&#${i.charCodeAt(0)};`;
    });
  }

  function raw(value) {
    return html(value);
  }