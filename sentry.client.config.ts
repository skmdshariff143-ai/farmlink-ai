import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "<PLACEHOLDER>",
  tracesSampleRate: 0.1,
  debug: false,
  
  beforeSend(event) {
    // 1. Scrub headers and cookies
    if (event.request && event.request.headers) {
      delete event.request.headers["cookie"];
      delete event.request.headers["authorization"];
    }

    // 2. Scrub PII regex matcher (emails and phone numbers)
    const piiRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}|\+?[0-9]{10,15}/g;

    const redact = (val: any): any => {
      if (!val) return val;
      if (typeof val === "string") {
        return val.replace(piiRegex, "[REDACTED_PII]");
      }
      if (Array.isArray(val)) {
        return val.map(redact);
      }
      if (typeof val === "object") {
        const cleaned: any = {};
        for (const key in val) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey.includes("email") ||
            lowerKey.includes("phone") ||
            lowerKey.includes("password") ||
            lowerKey.includes("token") ||
            lowerKey.includes("session") ||
            lowerKey.includes("secret") ||
            lowerKey.includes("cookie")
          ) {
            cleaned[key] = "[REDACTED_PII]";
          } else {
            cleaned[key] = redact(val[key]);
          }
        }
        return cleaned;
      }
      return val;
    };

    if (event.extra) {
      event.extra = redact(event.extra);
    }

    if (event.user) {
      if (event.user.email) event.user.email = "[REDACTED_PII]";
      if (event.user.username) event.user.username = "[REDACTED_PII]";
      if (event.user.ip_address) event.user.ip_address = "[REDACTED_IP]";
    }

    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((crumb) => {
        if (crumb.data) crumb.data = redact(crumb.data);
        if (crumb.message) crumb.message = redact(crumb.message);
        return crumb;
      });
    }

    return event;
  }
});
