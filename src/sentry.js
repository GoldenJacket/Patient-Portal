import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://4a4a74b418acae9b35e6c88f7aab1dd4@o4511261232332800.ingest.us.sentry.io/4511261237772288",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});
