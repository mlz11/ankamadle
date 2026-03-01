import { execSync } from "node:child_process";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import { defineConfig } from "vitest/config";

/**
 * Forces the process to exit after the build completes. The source-map
 * dependency used by vite-prerender-plugin initializes a WebAssembly worker
 * (MessagePort) at import time that keeps the Node.js event loop alive.
 */
function forceExitAfterBuild(): Plugin {
	return {
		name: "force-exit-after-build",
		apply: "build",
		enforce: "post",
		closeBundle() {
			process.exit(0);
		},
	};
}

/**
 * Strips the prerender entry's modulepreload / script tags from every HTML
 * page and removes its sourcemap. The JS chunk itself is kept because Vite
 * may code-split shared dependencies into it, and the main bundle imports
 * from it at runtime.
 */
function removePrerenderChunk(): Plugin {
	return {
		name: "remove-prerender-chunk",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			const prerenderAssets: string[] = [];
			for (const key of Object.keys(bundle)) {
				if (key.endsWith(".js") && key.includes("prerender")) {
					prerenderAssets.push(key);
				}
				if (key.endsWith(".js.map") && key.includes("prerender")) {
					delete bundle[key];
				}
			}

			for (const key of Object.keys(bundle)) {
				const asset = bundle[key];
				if (
					!key.endsWith(".html") ||
					asset.type !== "asset" ||
					typeof asset.source !== "string"
				)
					continue;

				let source = asset.source;
				for (const name of prerenderAssets) {
					const escaped = name.replace(/\./g, "\\.");
					source = source.replace(
						new RegExp(`\\s*<link[^>]+href="/${escaped}"[^>]*>`),
						"",
					);
					source = source.replace(
						new RegExp(`\\s*<script[^>]+src="/${escaped}"[^>]*></script>`),
						"",
					);
				}
				asset.source = source;
			}
		},
	};
}

const ROUTE_THEME: Record<string, string> = {
	"/classique": "theme-classique",
	"/silhouette": "theme-silhouette",
};

/**
 * Adds the correct theme class to <body> in each prerendered HTML page so the
 * browser applies game-mode colours and background before React hydrates.
 */
function injectThemeClass(): Plugin {
	return {
		name: "inject-theme-class",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			for (const key of Object.keys(bundle)) {
				const asset = bundle[key];
				if (
					!key.endsWith(".html") ||
					asset.type !== "asset" ||
					typeof asset.source !== "string"
				)
					continue;

				const route = htmlKeyToRoute(key);
				const theme = ROUTE_THEME[route];
				if (!theme) continue;

				asset.source = asset.source.replace(
					"<body>",
					`<body class="${theme}">`,
				);
			}
		},
	};
}

const ROUTE_META: Record<
	string,
	{ title: string; description: string; url: string }
> = {
	"/": {
		title: "Dofusdle - Le jeu de devinettes Dofus Retro",
		description:
			"Choisis ton mode de jeu Dofusdle ! Devine le monstre Dofus Retro du jour dans différents modes inspirés de Wordle.",
		url: "https://dofusdle.fr/",
	},
	"/classique": {
		title: "Dofusdle - Devine le monstre Dofus Retro du jour !",
		description:
			"Devine le monstre Dofus Retro du jour ! Un jeu de devinettes quotidien inspiré de Wordle pour les fans de Dofus 1.29.",
		url: "https://dofusdle.fr/classique",
	},
};

function htmlKeyToRoute(key: string): string {
	if (key === "index.html") return "/";
	return `/${key.replace(/\/index\.html$/, "")}`;
}

/**
 * Injects the correct meta tags into each prerendered HTML page so that
 * crawlers and social-media bots see the right title, description, and
 * canonical URL without needing JavaScript.
 */
function injectRouteMeta(): Plugin {
	return {
		name: "inject-route-meta",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			for (const key of Object.keys(bundle)) {
				const asset = bundle[key];
				if (
					!key.endsWith(".html") ||
					asset.type !== "asset" ||
					typeof asset.source !== "string"
				)
					continue;

				const route = htmlKeyToRoute(key);
				const meta = ROUTE_META[route];
				if (!meta) continue;

				let html = asset.source;
				html = html.replace(
					/<title>[^<]*<\/title>/,
					`<title>${meta.title}</title>`,
				);
				html = html.replace(
					/(<link rel="canonical" href=")[^"]*(")/,
					`$1${meta.url}$2`,
				);
				html = html.replace(
					/(<meta name="description" content=")[^"]*(")/,
					`$1${meta.description}$2`,
				);
				html = html.replace(
					/(<meta property="og:url" content=")[^"]*(")/,
					`$1${meta.url}$2`,
				);
				html = html.replace(
					/(<meta property="og:title" content=")[^"]*(")/,
					`$1${meta.title}$2`,
				);
				html = html.replace(
					/(<meta property="og:description" content=")[^"]*(")/,
					`$1${meta.description}$2`,
				);
				html = html.replace(
					/(<meta name="twitter:title" content=")[^"]*(")/,
					`$1${meta.title}$2`,
				);
				html = html.replace(
					/(<meta name="twitter:description" content=")[^"]*(")/,
					`$1${meta.description}$2`,
				);
				asset.source = html;
			}
		},
	};
}

/**
 * Detect if running inside a git worktree and derive a stable unique port
 * from the worktree name so parallel agents don't collide on :5173.
 */
function getWorktreePort(): number | undefined {
	try {
		const gitDir = execSync("git rev-parse --git-dir", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const match = gitDir.match(/\/worktrees\/(.+)$/);
		if (!match) return undefined;
		const name = match[1];
		let hash = 0;
		for (const ch of name) {
			hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
		}
		return 5174 + (Math.abs(hash) % 100);
	} catch {
		return undefined;
	}
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const port = env.VITE_PORT ? Number(env.VITE_PORT) : getWorktreePort();

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
			vitePrerenderPlugin({
				renderTarget: "#root",
				prerenderScript: "src/prerender.tsx",
			}),
			removePrerenderChunk(),
			injectThemeClass(),
			injectRouteMeta(),
			mode === "production" &&
				sentryVitePlugin({
					org: sentryOrg,
					project: sentryProject,
					authToken: sentryAuthToken,
				}),
			forceExitAfterBuild(),
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
