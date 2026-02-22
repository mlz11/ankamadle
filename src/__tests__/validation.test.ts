import { describe, expect, it } from "vitest";
import {
	parseDailyProgress,
	parseGameStats,
	parseMonsters,
} from "../validation";

const validMonster = {
	id: 1,
	name: "Bouftou",
	ecosystem: "Plaines de Cania",
	race: "Bouftous",
	niveau_min: 1,
	niveau_max: 10,
	pv_min: 5,
	pv_max: 50,
	couleur: "Brun",
	image: "/img/monsters/1.svg",
	availableFrom: "2025-1-1",
};

describe("parseMonsters", () => {
	it("should return monsters when given valid data", () => {
		const result = parseMonsters([validMonster]);
		expect(result).toEqual([validMonster]);
	});

	it("should accept monsters without optional image field", () => {
		const { image: _, ...noImage } = validMonster;
		const result = parseMonsters([noImage]);
		expect(result).toHaveLength(1);
		expect(result[0]).not.toHaveProperty("image");
	});

	it("should default couleur to empty string when missing", () => {
		const { couleur: _, ...noCouleur } = validMonster;
		const result = parseMonsters([noCouleur]);
		expect(result[0]?.couleur).toBe("");
	});

	it("should throw when a required field is missing", () => {
		const { name: _, ...noName } = validMonster;
		expect(() => parseMonsters([noName])).toThrow();
	});

	it("should throw when a field has the wrong type", () => {
		expect(() =>
			parseMonsters([{ ...validMonster, niveau_max: "ten" }]),
		).toThrow();
	});

	it("should throw when data is not an array", () => {
		expect(() => parseMonsters("not an array")).toThrow();
	});

	it("should throw when data is null", () => {
		expect(() => parseMonsters(null)).toThrow();
	});
});

describe("parseDailyProgress", () => {
	const validProgress = {
		date: "2025-6-15",
		guesses: ["Bouftou", "Tofu"],
		won: true,
	};

	it("should return progress when given valid data", () => {
		expect(parseDailyProgress(validProgress)).toEqual(validProgress);
	});

	it("should accept optional hint flags", () => {
		const withHints = {
			...validProgress,
			hint1Revealed: true,
			hint2Revealed: false,
		};
		expect(parseDailyProgress(withHints)).toEqual(withHints);
	});

	it("should return null when date is missing", () => {
		const { date: _, ...noDate } = validProgress;
		expect(parseDailyProgress(noDate)).toBeNull();
	});

	it("should return null when guesses is not an array", () => {
		expect(
			parseDailyProgress({ ...validProgress, guesses: "not array" }),
		).toBeNull();
	});

	it("should return null when won is not a boolean", () => {
		expect(parseDailyProgress({ ...validProgress, won: "yes" })).toBeNull();
	});

	it("should return null when data is null", () => {
		expect(parseDailyProgress(null)).toBeNull();
	});

	it("should return null when data is a string", () => {
		expect(parseDailyProgress("garbage")).toBeNull();
	});
});

describe("parseGameStats", () => {
	const validStats = {
		gamesPlayed: 10,
		gamesWon: 7,
		currentStreak: 3,
		maxStreak: 5,
		guessDistribution: { "1": 2, "3": 5 },
		lastPlayedDate: "2025-6-15",
	};

	it("should return stats when given valid data", () => {
		expect(parseGameStats(validStats)).toEqual(validStats);
	});

	it("should accept null lastPlayedDate", () => {
		const result = parseGameStats({ ...validStats, lastPlayedDate: null });
		expect(result?.lastPlayedDate).toBeNull();
	});

	it("should accept missing lastPlayedDate", () => {
		const { lastPlayedDate: _, ...noLastPlayed } = validStats;
		const result = parseGameStats(noLastPlayed);
		expect(result).toBeTruthy();
	});

	it("should return null when gamesPlayed is not a number", () => {
		expect(parseGameStats({ ...validStats, gamesPlayed: "ten" })).toBeNull();
	});

	it("should return null when guessDistribution values are not numbers", () => {
		expect(
			parseGameStats({ ...validStats, guessDistribution: { "1": "two" } }),
		).toBeNull();
	});

	it("should return null when data is null", () => {
		expect(parseGameStats(null)).toBeNull();
	});

	it("should return null when data is a number", () => {
		expect(parseGameStats(42)).toBeNull();
	});
});
