import type { DailyProgress, GameMode, GameStats } from "../types";
import { parseDailyProgress, parseGameStats } from "../validation";
import { getTodayKey, getYesterdayKey } from "./daily";

const LEGACY_PROGRESS_KEY = "dofusdle-progress";
const LEGACY_STATS_KEY = "dofusdle-stats";
const TARGET_KEY = "dofusdle-target";

function progressKey(mode: GameMode): string {
	return `dofusdle-progress-${mode}`;
}

function statsKey(mode: GameMode): string {
	return `dofusdle-stats-${mode}`;
}

function migrateIfNeeded(mode: GameMode): void {
	if (mode !== "classique") return;

	const legacyStats = localStorage.getItem(LEGACY_STATS_KEY);
	if (legacyStats !== null) {
		if (localStorage.getItem(statsKey(mode)) === null) {
			localStorage.setItem(statsKey(mode), legacyStats);
		}
		localStorage.removeItem(LEGACY_STATS_KEY);
	}

	const legacyProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
	if (legacyProgress !== null) {
		if (localStorage.getItem(progressKey(mode)) === null) {
			localStorage.setItem(progressKey(mode), legacyProgress);
		}
		localStorage.removeItem(LEGACY_PROGRESS_KEY);
	}
}

function defaultStats(): GameStats {
	return {
		gamesPlayed: 0,
		gamesWon: 0,
		currentStreak: 0,
		maxStreak: 0,
		guessDistribution: {},
		lastPlayedDate: null,
	};
}

export function loadProgress(mode: GameMode): DailyProgress | null {
	if (typeof window === "undefined") return null;
	try {
		migrateIfNeeded(mode);
		const raw = localStorage.getItem(progressKey(mode));
		if (!raw) return null;
		const progress = parseDailyProgress(JSON.parse(raw));
		if (!progress || progress.date !== getTodayKey()) return null;
		return progress;
	} catch {
		return null;
	}
}

export function saveProgress(
	mode: GameMode,
	guesses: string[],
	won: boolean,
	hint1Revealed = false,
	hint2Revealed = false,
): void {
	const progress: DailyProgress = {
		date: getTodayKey(),
		guesses,
		won,
		hint1Revealed,
		hint2Revealed,
	};
	localStorage.setItem(progressKey(mode), JSON.stringify(progress));
}

export function loadStats(mode: GameMode): GameStats {
	if (typeof window === "undefined") return defaultStats();
	try {
		migrateIfNeeded(mode);
		const raw = localStorage.getItem(statsKey(mode));
		if (!raw) return defaultStats();
		return parseGameStats(JSON.parse(raw)) ?? defaultStats();
	} catch {
		return defaultStats();
	}
}

function saveStats(mode: GameMode, stats: GameStats): void {
	localStorage.setItem(statsKey(mode), JSON.stringify(stats));
}

export function saveTargetMonster(dateKey: string, monsterId: number): void {
	localStorage.setItem(
		TARGET_KEY,
		JSON.stringify({ date: dateKey, monsterId }),
	);
}

export function loadTargetMonster(dateKey: string): number | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(TARGET_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (data?.date !== dateKey || typeof data?.monsterId !== "number")
			return null;
		return data.monsterId;
	} catch {
		return null;
	}
}

export function getWinPercentage(stats: GameStats): number {
	return stats.gamesPlayed > 0
		? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
		: 0;
}

export function recordWin(mode: GameMode, guessCount: number): GameStats {
	const stats = loadStats(mode);
	const today = getTodayKey();
	const yesterday = getYesterdayKey();
	if (
		stats.lastPlayedDate &&
		stats.lastPlayedDate !== yesterday &&
		stats.lastPlayedDate !== today
	) {
		stats.currentStreak = 0;
	}
	stats.gamesPlayed += 1;
	stats.gamesWon += 1;
	stats.currentStreak += 1;
	if (stats.currentStreak > stats.maxStreak) {
		stats.maxStreak = stats.currentStreak;
	}
	stats.guessDistribution[guessCount] =
		(stats.guessDistribution[guessCount] || 0) + 1;
	stats.lastPlayedDate = today;
	saveStats(mode, stats);
	return stats;
}
