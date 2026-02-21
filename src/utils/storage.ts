import type { DailyProgress, GameStats } from "../types";
import { getTodayKey, getYesterdayKey } from "./daily";

const PROGRESS_KEY = "dofusdle-progress";
const STATS_KEY = "dofusdle-stats";
const TARGET_KEY = "dofusdle-target";
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

export function loadProgress(): DailyProgress | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(PROGRESS_KEY);
		if (!raw) return null;
		const progress: DailyProgress = JSON.parse(raw);
		if (progress.date !== getTodayKey()) return null;
		return progress;
	} catch {
		return null;
	}
}

export function saveProgress(
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
	localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadStats(): GameStats {
	if (typeof window === "undefined") return defaultStats();
	try {
		const raw = localStorage.getItem(STATS_KEY);
		if (!raw) return defaultStats();
		return JSON.parse(raw);
	} catch {
		return defaultStats();
	}
}

function saveStats(stats: GameStats): void {
	localStorage.setItem(STATS_KEY, JSON.stringify(stats));
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

export function recordWin(guessCount: number): GameStats {
	const stats = loadStats();
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
	saveStats(stats);
	return stats;
}
