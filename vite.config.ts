import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const port = env.VITE_PORT ? Number(env.VITE_PORT) : undefined;

	return {
		plugins: [
			react(),
			mode === "production" &&
				sentryVitePlugin({
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					authToken: process.env.SENTRY_AUTH_TOKEN,
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
