import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/app.css";
import App from "./components/App";

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

// Initialize Sentry after render to keep it off the critical path
import("@sentry/react").then((Sentry) => {
	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (!dsn) {
		console.warn("VITE_SENTRY_DSN is not set, Sentry disabled");
		return;
	}
	Sentry.init({
		dsn,
		sendDefaultPii: true,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: 1.0,
		enableLogs: true,
	});
});
