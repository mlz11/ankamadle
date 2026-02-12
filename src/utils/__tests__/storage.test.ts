// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
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
}));

const PROGRESS_KEY = "dofusdle-progress";
const STATS_KEY = "dofusdle-stats";
const TARGET_KEY = "dofusdle-target";

afterEach(() => {
	localStorage.removeItem(PROGRESS_KEY);
	localStorage.removeItem(STATS_KEY);
	localStorage.removeItem(TARGET_KEY);
});

describe("saveTargetMonster", () => {
	it("should persist date and monsterId to localStorage when called", () => {
		saveTargetMonster("2025-6-15", 42);
		const raw = localStorage.getItem(TARGET_KEY);
		expect(raw).toBeTruthy();
		expect(JSON.parse(raw as string)).toEqual({
			date: "2025-6-15",
			monsterId: 42,
		});
	});

	it("should overwrite the previous entry when called again", () => {
		saveTargetMonster("2025-6-15", 42);
		saveTargetMonster("2025-6-16", 99);
		expect(loadTargetMonster("2025-6-15")).toBeNull();
		expect(loadTargetMonster("2025-6-16")).toBe(99);
	});
});

describe("loadTargetMonster", () => {
	it("should return the monsterId when the stored date matches", () => {
		saveTargetMonster("2025-6-15", 42);
		expect(loadTargetMonster("2025-6-15")).toBe(42);
	});

	it("should return null when the stored date does not match", () => {
		saveTargetMonster("2025-6-15", 42);
		expect(loadTargetMonster("2025-6-16")).toBeNull();
	});

	it("should return null when nothing has been saved", () => {
		expect(loadTargetMonster("2025-6-15")).toBeNull();
	});

	it("should return null when localStorage contains corrupted data", () => {
		localStorage.setItem(TARGET_KEY, "not json!!!");
		expect(loadTargetMonster("2025-6-15")).toBeNull();
	});

	it("should return null when the stored data has an unexpected shape", () => {
		localStorage.setItem(TARGET_KEY, JSON.stringify({ foo: "bar" }));
		expect(loadTargetMonster("2025-6-15")).toBeNull();
	});

	it("should return null when the stored monsterId is not a number", () => {
		localStorage.setItem(
			TARGET_KEY,
			JSON.stringify({ date: "2025-6-15", monsterId: "abc" }),
		);
		expect(loadTargetMonster("2025-6-15")).toBeNull();
	});
});

describe("saveProgress", () => {
	it("should persist guesses and win state to localStorage when called", () => {
		saveProgress(["Bouftou", "Tofu"], true);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.guesses).toEqual(["Bouftou", "Tofu"]);
		expect(raw.won).toBe(true);
		expect(raw.date).toBe("2025-6-15");
	});

	it("should default hint states to false when not provided", () => {
		saveProgress(["Bouftou"], false);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.hint1Revealed).toBe(false);
		expect(raw.hint2Revealed).toBe(false);
	});

	it("should persist hint states when provided", () => {
		saveProgress(["Bouftou"], false, true, true);
		const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) as string);
		expect(raw.hint1Revealed).toBe(true);
		expect(raw.hint2Revealed).toBe(true);
	});
});

describe("loadProgress", () => {
	it("should return saved progress when date matches today", () => {
		saveProgress(["Bouftou", "Tofu"], true, true, false);
		const progress = loadProgress();
		expect(progress).toEqual({
			date: "2025-6-15",
			guesses: ["Bouftou", "Tofu"],
			won: true,
			hint1Revealed: true,
			hint2Revealed: false,
		});
	});

	it("should return null when no progress has been saved", () => {
		expect(loadProgress()).toBeNull();
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
		expect(loadProgress()).toBeNull();
	});

	it("should return null when localStorage contains corrupted JSON", () => {
		localStorage.setItem(PROGRESS_KEY, "not json!!!");
		expect(loadProgress()).toBeNull();
	});

	it("should preserve hint states from saved progress", () => {
		saveProgress(["Bouftou"], false, true, true);
		const progress = loadProgress();
		expect(progress?.hint1Revealed).toBe(true);
		expect(progress?.hint2Revealed).toBe(true);
	});
});

describe("loadStats", () => {
	it("should return default stats when nothing has been saved", () => {
		expect(loadStats()).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
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
		expect(loadStats()).toEqual(stats);
	});

	it("should return default stats when localStorage contains corrupted JSON", () => {
		localStorage.setItem(STATS_KEY, "not json!!!");
		expect(loadStats()).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: {},
		});
	});
});

describe("recordWin", () => {
	it("should increment gamesPlayed and gamesWon when called", () => {
		const stats = recordWin(3);
		expect(stats.gamesPlayed).toBe(1);
		expect(stats.gamesWon).toBe(1);
	});

	it("should increment currentStreak when called", () => {
		recordWin(3);
		const stats = recordWin(2);
		expect(stats.currentStreak).toBe(2);
	});

	it("should update maxStreak when currentStreak exceeds it", () => {
		recordWin(3);
		recordWin(2);
		const stats = recordWin(1);
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
		const stats = recordWin(3);
		expect(stats.currentStreak).toBe(2);
		expect(stats.maxStreak).toBe(5);
	});

	it("should increment guessDistribution for the given guess count", () => {
		const stats = recordWin(3);
		expect(stats.guessDistribution[3]).toBe(1);
	});

	it("should accumulate distribution across multiple wins", () => {
		recordWin(3);
		recordWin(3);
		const stats = recordWin(3);
		expect(stats.guessDistribution[3]).toBe(3);
	});

	it("should persist updated stats to localStorage when called", () => {
		recordWin(4);
		const raw = JSON.parse(localStorage.getItem(STATS_KEY) as string);
		expect(raw.gamesPlayed).toBe(1);
		expect(raw.gamesWon).toBe(1);
		expect(raw.guessDistribution[4]).toBe(1);
	});
});
