import type { Monster } from "../types";

function getDateKey(date: Date): string {
	const paris = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Paris",
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).formatToParts(date);
	const y = paris.find((p) => p.type === "year")?.value;
	const m = paris.find((p) => p.type === "month")?.value;
	const d = paris.find((p) => p.type === "day")?.value;
	return `${y}-${Number(m)}-${Number(d)}`;
}

export function getTodayKey(): string {
	return getDateKey(new Date());
}

function getYesterdayKey(): string {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return getDateKey(yesterday);
}

function parseDateKey(key: string): [number, number, number] {
	const [y, m, d] = key.split("-").map(Number);
	return [y, m, d];
}

function isDateOnOrBefore(a: string, b: string): boolean {
	const [ay, am, ad] = parseDateKey(a);
	const [by, bm, bd] = parseDateKey(b);
	if (ay !== by) return ay < by;
	if (am !== bm) return am < bm;
	return ad <= bd;
}

function hash(str: string): number {
	let h = 0;
	for (const ch of str) {
		h = (h << 5) - h + ch.charCodeAt(0);
		h |= 0;
	}
	return h;
}

export function getDailyMonster(
	monsters: Monster[],
	seed: string = getTodayKey(),
): Monster {
	const eligible = monsters.filter((m) =>
		isDateOnOrBefore(m.availableFrom, seed),
	);
	const pool = eligible.length > 0 ? eligible : monsters;
	let best = pool[0];
	let bestScore = -Infinity;
	for (const monster of pool) {
		const score = hash(`${seed}-${monster.id}`);
		if (score > bestScore) {
			bestScore = score;
			best = monster;
		}
	}
	return best;
}

export function getYesterdayMonster(monsters: Monster[]): Monster {
	return getDailyMonster(monsters, getYesterdayKey());
}
