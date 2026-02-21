import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/app.css";
import App from "./components/App";

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (!dsn) throw new Error("VITE_SENTRY_DSN is required");

Sentry.init({
	dsn,
	sendDefaultPii: true,
	integrations: [Sentry.browserTracingIntegration()],
	tracesSampleRate: 1.0,
	enableLogs: true,
});

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

if (root.children.length > 0) {
	hydrateRoot(root, app);
} else {
	createRoot(root).render(app);
}
