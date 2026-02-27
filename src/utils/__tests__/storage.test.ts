// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GameMode } from "../../types";
import {
	loadProgress,
	loadStats,
	loadTargetMonster,
	recordWin,
	saveProgress,
	saveTargetMonster,
} from "../storage";

vi.mock("../daily", () => ({
	getTodayKey: () => "2025-6-15",
	getYesterdayKey: () => "2025-6-14",
}));

const MODE: GameMode = "classique";
const PROGRESS_KEY = `dofusdle-progress-${MODE}`;
const STATS_KEY = `dofusdle-stats-${MODE}`;
const TARGET_KEY = `dofusdle-target-${MODE}`;
const LEGACY_PROGRESS_KEY = "dofusdle-progress";
const LEGACY_STATS_KEY = "dofusdle-stats";
const LEGACY_TARGET_KEY = "dofusdle-target";

afterEach(() => {
	localStorage.clear();
});

describe("saveTargetMonster", () => {
	it("should persist date and monsterId to localStorage when called", () => {
		saveTargetMonster(MODE, "2025-6-15", 42);
		const raw = localStorage.getItem(TARGET_KEY);
		expect(raw).toBeTruthy();
		expect(JSON.parse(raw as string)).toEqual({
			date: "2025-6-15",
			monsterId: 42,
		});
	});

	it("should overwrite the previous entry when called again", () => {
		saveTargetMonster(MODE, "2025-6-15", 42);
		saveTargetMonster(MODE, "2025-6-16", 99);
		expect(loadTargetMonster(MODE, "2025-6-15")).toBeNull();
		expect(loadTargetMonster(MODE, "2025-6-16")).toBe(99);
	});
});

describe("loadTargetMonster", () => {
	it("should return the monsterId when the stored date matches", () => {
		saveTargetMonster(MODE, "2025-6-15", 42);
		expect(loadTargetMonster(MODE, "2025-6-15")).toBe(42);
	});

	it("should return null when the stored date does not match", () => {
		saveTargetMonster(MODE, "2025-6-15", 42);
		expect(loadTargetMonster(MODE, "2025-6-16")).toBeNull();
	});

	it("should return null when nothing has been saved", () => {
		expect(loadTargetMonster(MODE, "2025-6-15")).toBeNull();
	});

	it("should return null when localStorage contains corrupted data", () => {
		localStorage.setItem(TARGET_KEY, "not json!!!");
		expect(loadTargetMonster(MODE, "2025-6-15")).toBeNull();
	});

	it("should return null when the stored data has an unexpected shape", () => {
		localStorage.setItem(TARGET_KEY, JSON.stringify({ foo: "bar" }));
		expect(loadTargetMonster(MODE, "2025-6-15")).toBeNull();
	});

	it("should return null when the stored monsterId is not a number", () => {
		localStorage.setItem(
			TARGET_KEY,
			JSON.stringify({ date: "2025-6-15", monsterId: "abc" }),
		);
		expect(loadTargetMonster(MODE, "2025-6-15")).toBeNull();
	});
});

describe("saveProgress", () => {
	it("should persist guesses and win state to localStorage when called", () => {
		saveProgress(MODE, ["Bouftou", "Tofu"], true);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.guesses).toEqual(["Bouftou", "Tofu"]);
		expect(raw.won).toBe(true);
		expect(raw.date).toBe("2025-6-15");
	});

	it("should default hint states to false when not provided", () => {
		saveProgress(MODE, ["Bouftou"], false);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.hint1Revealed).toBe(false);
		expect(raw.hint2Revealed).toBe(false);
	});

	it("should persist hint states when provided", () => {
		saveProgress(MODE, ["Bouftou"], false, true, true);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.hint1Revealed).toBe(true);
		expect(raw.hint2Revealed).toBe(true);
	});
});

describe("loadProgress", () => {
	it("should return saved progress when date matches today", () => {
		saveProgress(MODE, ["Bouftou", "Tofu"], true, true, false);
		const progress = loadProgress(MODE);
		expect(progress).toEqual({
			date: "2025-6-15",
			guesses: ["Bouftou", "Tofu"],
			won: true,
			hint1Revealed: true,
			hint2Revealed: false,
		});
	});

	it("should return null when no progress has been saved", () => {
		expect(loadProgress(MODE)).toBeNull();
	});

	it("should return null when stored date does not match today", () => {
		localStorage.setItem(
			PROGRESS_KEY,
			JSON.stringify({
				date: "2025-6-14",
				guesses: ["Bouftou"],
				won: false,
				hint1Revealed: false,
				hint2Revealed: false,
			}),
		);
		expect(loadProgress(MODE)).toBeNull();
	});

	it("should return null when localStorage contains corrupted JSON", () => {
		localStorage.setItem(PROGRESS_KEY, "not json!!!");
		expect(loadProgress(MODE)).toBeNull();
	});

	it("should preserve hint states from saved progress", () => {
		saveProgress(MODE, ["Bouftou"], false, true, true);
		const progress = loadProgress(MODE);
		expect(progress?.hint1Revealed).toBe(true);
		expect(progress?.hint2Revealed).toBe(true);
	});

	it("should return null when stored data has wrong shape", () => {
		localStorage.setItem(
			PROGRESS_KEY,
			JSON.stringify({
				date: "2025-6-15",
				guesses: "not an array",
				won: false,
			}),
		);
		expect(loadProgress(MODE)).toBeNull();
	});

	it("should return null when stored data has wrong types", () => {
		localStorage.setItem(
			PROGRESS_KEY,
			JSON.stringify({
				date: "2025-6-15",
				guesses: ["Bouftou"],
				won: "yes",
			}),
		);
		expect(loadProgress(MODE)).toBeNull();
	});
});

describe("loadStats", () => {
	it("should return default stats when nothing has been saved", () => {
		expect(loadStats(MODE)).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
			lastPlayedDate: null,
		});
	});

	it("should return stored stats when valid data exists", () => {
		const stats = {
			gamesPlayed: 5,
			gamesWon: 3,
			currentStreak: 2,
			maxStreak: 4,
			guessDistribution: { 1: 1, 3: 2 },
		};
		localStorage.setItem(STATS_KEY, JSON.stringify(stats));
		expect(loadStats(MODE)).toEqual(stats);
	});

	it("should return default stats when localStorage contains corrupted JSON", () => {
		localStorage.setItem(STATS_KEY, "not json!!!");
		expect(loadStats(MODE)).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
			lastPlayedDate: null,
		});
	});

	it("should return default stats when stored data has wrong shape", () => {
		localStorage.setItem(STATS_KEY, JSON.stringify({ foo: "bar", baz: 42 }));
		expect(loadStats(MODE)).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
			lastPlayedDate: null,
		});
	});

	it("should return default stats when stored data has wrong types", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: "ten",
				gamesWon: 0,
				currentStreak: 0,
				maxStreak: 0,
				guessDistribution: {},
			}),
		);
		expect(loadStats(MODE)).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
			lastPlayedDate: null,
		});
	});
});

describe("recordWin", () => {
	it("should increment gamesPlayed and gamesWon when called", () => {
		const stats = recordWin(MODE, 3);
		expect(stats.gamesPlayed).toBe(1);
		expect(stats.gamesWon).toBe(1);
	});

	it("should increment currentStreak when called", () => {
		recordWin(MODE, 3);
		const stats = recordWin(MODE, 2);
		expect(stats.currentStreak).toBe(2);
	});

	it("should update maxStreak when currentStreak exceeds it", () => {
		recordWin(MODE, 3);
		recordWin(MODE, 2);
		const stats = recordWin(MODE, 1);
		expect(stats.maxStreak).toBe(3);
	});

	it("should not update maxStreak when currentStreak is lower", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: 10,
				gamesWon: 8,
				currentStreak: 1,
				maxStreak: 5,
				guessDistribution: {},
			}),
		);
		const stats = recordWin(MODE, 3);
		expect(stats.currentStreak).toBe(2);
		expect(stats.maxStreak).toBe(5);
	});

	it("should increment guessDistribution for the given guess count", () => {
		const stats = recordWin(MODE, 3);
		expect(stats.guessDistribution[3]).toBe(1);
	});

	it("should accumulate distribution across multiple wins", () => {
		recordWin(MODE, 3);
		recordWin(MODE, 3);
		const stats = recordWin(MODE, 3);
		expect(stats.guessDistribution[3]).toBe(3);
	});

	it("should persist updated stats to localStorage when called", () => {
		recordWin(MODE, 4);
		const raw = JSON.parse(localStorage.getItem(STATS_KEY) as string);
		expect(raw.gamesPlayed).toBe(1);
		expect(raw.gamesWon).toBe(1);
		expect(raw.guessDistribution[4]).toBe(1);
	});

	it("should reset currentStreak to 1 when the player skipped a day", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: 5,
				gamesWon: 5,
				currentStreak: 5,
				maxStreak: 5,
				guessDistribution: {},
				lastPlayedDate: "2025-6-10",
			}),
		);
		const stats = recordWin(MODE, 3);
		expect(stats.currentStreak).toBe(1);
		expect(stats.maxStreak).toBe(5);
	});

	it("should continue the streak when the player played yesterday", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: 3,
				gamesWon: 3,
				currentStreak: 3,
				maxStreak: 3,
				guessDistribution: {},
				lastPlayedDate: "2025-6-14",
			}),
		);
		const stats = recordWin(MODE, 2);
		expect(stats.currentStreak).toBe(4);
		expect(stats.maxStreak).toBe(4);
	});

	it("should not reset the streak when lastPlayedDate is missing (migration)", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: 10,
				gamesWon: 10,
				currentStreak: 10,
				maxStreak: 10,
				guessDistribution: {},
			}),
		);
		const stats = recordWin(MODE, 1);
		expect(stats.currentStreak).toBe(11);
		expect(stats.maxStreak).toBe(11);
	});
});

describe("legacy migration", () => {
	it("should migrate legacy stats to classique-scoped key when loading stats", () => {
		const legacyStats = {
			gamesPlayed: 7,
			gamesWon: 5,
			currentStreak: 3,
			maxStreak: 4,
			guessDistribution: { 2: 3, 3: 2 },
			lastPlayedDate: "2025-6-14",
		};
		localStorage.setItem(LEGACY_STATS_KEY, JSON.stringify(legacyStats));
		const stats = loadStats(MODE);
		expect(stats).toEqual(legacyStats);
		expect(localStorage.getItem(LEGACY_STATS_KEY)).toBeNull();
		expect(localStorage.getItem(STATS_KEY)).toBe(JSON.stringify(legacyStats));
	});

	it("should migrate legacy progress to classique-scoped key when loading progress", () => {
		const legacyProgress = {
			date: "2025-6-15",
			guesses: ["Bouftou"],
			won: false,
			hint1Revealed: false,
			hint2Revealed: false,
		};
		localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify(legacyProgress));
		const progress = loadProgress(MODE);
		expect(progress).toEqual(legacyProgress);
		expect(localStorage.getItem(LEGACY_PROGRESS_KEY)).toBeNull();
		expect(localStorage.getItem(PROGRESS_KEY)).toBe(
			JSON.stringify(legacyProgress),
		);
	});

	it("should not overwrite existing scoped stats when legacy data exists", () => {
		const scopedStats = {
			gamesPlayed: 10,
			gamesWon: 8,
			currentStreak: 5,
			maxStreak: 5,
			guessDistribution: { 1: 8 },
			lastPlayedDate: "2025-6-14",
		};
		const legacyStats = {
			gamesPlayed: 1,
			gamesWon: 1,
			currentStreak: 1,
			maxStreak: 1,
			guessDistribution: {},
		};
		localStorage.setItem(STATS_KEY, JSON.stringify(scopedStats));
		localStorage.setItem(LEGACY_STATS_KEY, JSON.stringify(legacyStats));
		const stats = loadStats(MODE);
		expect(stats).toEqual(scopedStats);
		expect(localStorage.getItem(LEGACY_STATS_KEY)).toBeNull();
	});

	it("should not overwrite existing scoped progress when legacy data exists", () => {
		const scopedProgress = {
			date: "2025-6-15",
			guesses: ["Bouftou", "Tofu"],
			won: true,
			hint1Revealed: true,
			hint2Revealed: false,
		};
		const legacyProgress = {
			date: "2025-6-15",
			guesses: ["Arakne"],
			won: false,
			hint1Revealed: false,
			hint2Revealed: false,
		};
		localStorage.setItem(PROGRESS_KEY, JSON.stringify(scopedProgress));
		localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify(legacyProgress));
		const progress = loadProgress(MODE);
		expect(progress).toEqual(scopedProgress);
		expect(localStorage.getItem(LEGACY_PROGRESS_KEY)).toBeNull();
	});

	it("should migrate legacy target to classique-scoped key when loading target", () => {
		const legacyTarget = { date: "2025-6-14", monsterId: 77 };
		localStorage.setItem(LEGACY_TARGET_KEY, JSON.stringify(legacyTarget));
		const id = loadTargetMonster(MODE, "2025-6-14");
		expect(id).toBe(77);
		expect(localStorage.getItem(LEGACY_TARGET_KEY)).toBeNull();
		expect(localStorage.getItem(TARGET_KEY)).toBe(
			JSON.stringify(legacyTarget),
		);
	});

	it("should remove legacy keys even when scoped keys already exist", () => {
		localStorage.setItem(
			STATS_KEY,
			JSON.stringify({
				gamesPlayed: 1,
				gamesWon: 1,
				currentStreak: 1,
				maxStreak: 1,
				guessDistribution: {},
			}),
		);
		localStorage.setItem(
			LEGACY_STATS_KEY,
			JSON.stringify({
				gamesPlayed: 2,
				gamesWon: 2,
				currentStreak: 2,
				maxStreak: 2,
				guessDistribution: {},
			}),
		);
		loadStats(MODE);
		expect(localStorage.getItem(LEGACY_STATS_KEY)).toBeNull();
	});
});
