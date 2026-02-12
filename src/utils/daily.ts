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

function getPreviousDayKey(dateKey: string): string {
	const [y, m, d] = dateKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() - 1);
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getNextDayKey(dateKey: string): string {
	const [y, m, d] = dateKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + 1);
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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

function scorePool(pool: Monster[], dateKey: string): Monster | null {
	if (pool.length === 0) return null;
	let best = pool[0];
	let bestScore = -1;
	for (const monster of pool) {
		const seed = hashString(`${dateKey}-${monster.id}`);
		const score = mulberry32(seed)();
		if (score > bestScore) {
			best = monster;
			bestScore = score;
		}
	}
	return best;
}

// Module-level cache: ensures consistent selections across calls.
// All selections are computed forward from EPOCH, so day D's result
// is always the same regardless of which target date triggered the computation.
let _cachedPool: Monster[] | null = null;
let _selections = new Map<string, number>();
let _latestDate: string | null = null;

function ensureComputedUntil(monsters: Monster[], targetDate: string): void {
	if (_cachedPool !== monsters) {
		_cachedPool = monsters;
		_selections = new Map();
		_latestDate = null;
	}

	// Already computed up to or past targetDate
	if (_latestDate !== null && isDateOnOrBefore(targetDate, _latestDate)) {
		return;
	}

	// Start from the day after latest computed, or EPOCH
	let key = _latestDate !== null ? getNextDayKey(_latestDate) : EPOCH;

	// Handle dates before EPOCH: compute just that day with no history
	if (!isDateOnOrBefore(EPOCH, targetDate)) {
		const pool = getEligiblePool(monsters, targetDate);
		const winner = scorePool(pool, targetDate);
		if (winner) _selections.set(targetDate, winner.id);
		return;
	}

	for (let i = 0; i < 1_000_000; i++) {
		const pool = getEligiblePool(monsters, key);

		if (pool.length <= 1) {
			if (pool[0]) _selections.set(key, pool[0].id);
		} else {
			const recentIds = new Set<number>();
			let prev = key;
			for (let j = 0; j < ANTI_REPEAT_WINDOW; j++) {
				prev = getPreviousDayKey(prev);
				const prevId = _selections.get(prev);
				if (prevId !== undefined) recentIds.add(prevId);
			}

			const filtered = pool.filter((m) => !recentIds.has(m.id));
			const candidates = filtered.length > 0 ? filtered : pool;
			const winner = scorePool(candidates, key);
			if (winner) _selections.set(key, winner.id);
		}

		if (key === targetDate) break;
		key = getNextDayKey(key);
	}

	_latestDate = targetDate;
}

function selectMonsterForDay(monsters: Monster[], dateKey: string): Monster {
	ensureComputedUntil(monsters, dateKey);
	const pool = getEligiblePool(monsters, dateKey);
	const winnerId = _selections.get(dateKey);
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

export function getYesterdayMonster(monsters: Monster[]): Monster {
	return getDailyMonster(monsters, getYesterdayKey());
}
