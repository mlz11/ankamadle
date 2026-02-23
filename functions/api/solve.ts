interface Env {
	SOLVE_COUNTS: KVNamespace;
}

/** Date format YYYY-M-D matching getTodayKey() in src/utils/daily.ts */
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

const DEDUP_TTL_SECONDS = 26 * 60 * 60; // 26 hours - covers full Paris day + drift

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
	const dateKey = getTodayKeyParis();
	const raw = await env.SOLVE_COUNTS.get(`solves:${dateKey}`);
	const count = raw !== null ? Number(raw) : 0;
	return Response.json({ count });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
	const dateKey = getTodayKeyParis();
	const rawIp =
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for") ??
		"unknown";
	const ip = rawIp.split(",")[0].trim();

	const dedupKey = `solves:${dateKey}:${ip}`;
	const alreadySolved = await env.SOLVE_COUNTS.get(dedupKey);
	if (alreadySolved !== null) {
		const raw = await env.SOLVE_COUNTS.get(`solves:${dateKey}`);
		const count = raw !== null ? Number(raw) : 0;
		return Response.json({ count });
	}

	await env.SOLVE_COUNTS.put(dedupKey, "1", {
		expirationTtl: DEDUP_TTL_SECONDS,
	});

	// KV has no atomic increment - concurrent requests may read the same value
	// and lose an increment. Acceptable for an approximate social counter.
	const raw = await env.SOLVE_COUNTS.get(`solves:${dateKey}`);
	const current = raw !== null ? Number(raw) : 0;
	const next = current + 1;
	await env.SOLVE_COUNTS.put(`solves:${dateKey}`, String(next));

	return Response.json({ count: next });
};
