interface Env {
	SOLVE_COUNTS: KVNamespace;
}

/** Must produce the same format as getTodayKey() in src/utils/daily.ts */
function getTodayKeyParis(): string {
	const now = new Date();
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Paris",
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).formatToParts(now);
	const y = parts.find((p) => p.type === "year")?.value ?? "0";
	const m = parts.find((p) => p.type === "month")?.value ?? "0";
	const d = parts.find((p) => p.type === "day")?.value ?? "0";
	return `${y}-${Number(m)}-${Number(d)}`;
}

// 26h so the key outlives the full Paris-timezone day even with clock skew
const DEDUP_TTL_SECONDS = 26 * 60 * 60;

const VALID_MODES = new Set(["classique"]);

function getMode(url: URL): string {
	const mode = url.searchParams.get("mode") || "classique";
	return VALID_MODES.has(mode) ? mode : "classique";
}

async function getCount(
	kv: KVNamespace,
	dateKey: string,
	mode: string,
): Promise<number> {
	const raw = await kv.get(`solves:${dateKey}:${mode}`);
	return raw !== null ? Number(raw) : 0;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
	const mode = getMode(new URL(request.url));
	const count = await getCount(env.SOLVE_COUNTS, getTodayKeyParis(), mode);
	return Response.json({ count });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
	const dateKey = getTodayKeyParis();
	const mode = getMode(new URL(request.url));
	const rawIp =
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for") ??
		"unknown";
	const ip = rawIp.split(",")[0].trim();

	const dedupKey = `solved:${dateKey}:${mode}:${ip}`;
	const alreadySolved = await env.SOLVE_COUNTS.get(dedupKey);
	if (alreadySolved !== null) {
		const count = await getCount(env.SOLVE_COUNTS, dateKey, mode);
		return Response.json({ count });
	}

	await env.SOLVE_COUNTS.put(dedupKey, "1", {
		expirationTtl: DEDUP_TTL_SECONDS,
	});

	// KV has no atomic increment, so concurrent requests may lose an update.
	// Acceptable for an approximate social counter.
	const next = (await getCount(env.SOLVE_COUNTS, dateKey, mode)) + 1;
	await env.SOLVE_COUNTS.put(`solves:${dateKey}:${mode}`, String(next));

	return Response.json({ count: next });
};
