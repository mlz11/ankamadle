import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const port = env.VITE_PORT ? Number(env.VITE_PORT) : undefined;

	const sentryOrg = process.env.SENTRY_ORG;
	const sentryProject = process.env.SENTRY_PROJECT;
	const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

	if (mode === "production") {
		if (!sentryOrg) throw new Error("SENTRY_ORG is required");
		if (!sentryProject) throw new Error("SENTRY_PROJECT is required");
		if (!sentryAuthToken) throw new Error("SENTRY_AUTH_TOKEN is required");
	}

	return {
		plugins: [
			react(),
			mode === "production" &&
				sentryVitePlugin({
					org: sentryOrg,
					project: sentryProject,
					authToken: sentryAuthToken,
				}),
		],
		build: {
			sourcemap: mode === "production" ? "hidden" : undefined,
		},
		server: {
			...(port !== undefined && { port, strictPort: true }),
		},
		test: {
			environment: "node",
		},
	};
});
