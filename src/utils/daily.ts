import type { Monster } from "../types";

const ANTI_REPEAT_WINDOW = 30;
const EPOCH = "2025-1-1";

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

export function getYesterdayKey(): string {
	return getPreviousDayKey(getTodayKey());
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

function daysInMonth(y: number, m: number): number {
	if (m === 2) {
		return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28;
	}
	return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

function getPreviousDayKey(dateKey: string): string {
	let [y, m, d] = parseDateKey(dateKey);
	d -= 1;
	if (d < 1) {
		m -= 1;
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		d = daysInMonth(y, m);
	}
	return `${y}-${m}-${d}`;
}

function getNextDayKey(dateKey: string): string {
	let [y, m, d] = parseDateKey(dateKey);
	d += 1;
	if (d > daysInMonth(y, m)) {
		d = 1;
		m += 1;
		if (m > 12) {
			m = 1;
			y += 1;
		}
	}
	return `${y}-${m}-${d}`;
}

function hashString(str: string): number {
	let h = 0;
	for (const ch of str) {
		h = (h << 5) - h + ch.charCodeAt(0);
		h |= 0;
	}
	h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
	h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
	h = h ^ (h >>> 16);
	return h >>> 0;
}

function mulberry32(seed: number): () => number {
	let s = seed | 0;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
	};
}

function getEligiblePool(monsters: Monster[], dateKey: string): Monster[] {
	const eligible = monsters.filter((m) =>
		isDateOnOrBefore(m.availableFrom, dateKey),
	);
	const pool = eligible.length > 0 ? eligible : monsters;
	return [...pool].sort((a, b) => a.id - b.id);
}

function scorePool(
	pool: Monster[],
	dateKey: string,
	salt = "",
): Monster | null {
	if (pool.length === 0) return null;
	let best = pool[0];
	let bestScore = -1;
	const prefix = salt ? `${salt}:` : "";
	for (const monster of pool) {
		const seed = hashString(`${prefix}${dateKey}-${monster.id}`);
		const score = mulberry32(seed)();
		if (score > bestScore) {
			best = monster;
			bestScore = score;
		}
	}
	return best;
}

interface ModeCache {
	pool: Monster[] | null;
	selections: Map<string, number>;
	latestDate: string | null;
}

const _caches = new Map<string, ModeCache>();

function getCache(salt: string): ModeCache {
	let cache = _caches.get(salt);
	if (!cache) {
		cache = { pool: null, selections: new Map(), latestDate: null };
		_caches.set(salt, cache);
	}
	return cache;
}

function ensureComputedUntil(
	monsters: Monster[],
	targetDate: string,
	salt = "",
): void {
	const cache = getCache(salt);

	if (cache.pool !== monsters) {
		cache.pool = monsters;
		cache.selections = new Map();
		cache.latestDate = null;
	}

	if (
		cache.latestDate !== null &&
		isDateOnOrBefore(targetDate, cache.latestDate)
	) {
		return;
	}

	let key = cache.latestDate !== null ? getNextDayKey(cache.latestDate) : EPOCH;

	if (!isDateOnOrBefore(EPOCH, targetDate)) {
		const pool = getEligiblePool(monsters, targetDate);
		const winner = scorePool(pool, targetDate, salt);
		if (winner) cache.selections.set(targetDate, winner.id);
		return;
	}

	for (let i = 0; i < 1_000_000; i++) {
		const pool = getEligiblePool(monsters, key);

		if (pool.length <= 1) {
			if (pool[0]) cache.selections.set(key, pool[0].id);
		} else {
			const recentIds = new Set<number>();
			let prev = key;
			for (let j = 0; j < ANTI_REPEAT_WINDOW; j++) {
				prev = getPreviousDayKey(prev);
				const prevId = cache.selections.get(prev);
				if (prevId !== undefined) recentIds.add(prevId);
			}

			const filtered = pool.filter((m) => !recentIds.has(m.id));
			const candidates = filtered.length > 0 ? filtered : pool;
			const winner = scorePool(candidates, key, salt);
			if (winner) cache.selections.set(key, winner.id);
		}

		if (key === targetDate) break;
		key = getNextDayKey(key);
	}

	cache.latestDate = targetDate;
}

function selectMonsterForDay(
	monsters: Monster[],
	dateKey: string,
	salt = "",
): Monster {
	ensureComputedUntil(monsters, dateKey, salt);
	const cache = getCache(salt);
	const pool = getEligiblePool(monsters, dateKey);
	const winnerId = cache.selections.get(dateKey);
	if (winnerId !== undefined) {
		const found = pool.find((m) => m.id === winnerId);
		if (found) return found;
	}
	return pool[0];
}

export function getDailyMonster(
	monsters: Monster[],
	seed: string = getTodayKey(),
): Monster {
	return selectMonsterForDay(monsters, seed);
}

export function getDailyMonsterForMode(
	monsters: Monster[],
	mode: string,
	seed: string = getTodayKey(),
): Monster {
	return selectMonsterForDay(monsters, seed, mode);
}

export function getYesterdayMonster(
	monsters: Monster[],
	mode?: string,
): Monster {
	if (mode) {
		return getDailyMonsterForMode(monsters, mode, getYesterdayKey());
	}
	return getDailyMonster(monsters, getYesterdayKey());
}
