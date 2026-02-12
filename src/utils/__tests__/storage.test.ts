// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { loadTargetMonster, saveTargetMonster } from "../storage";

const TARGET_KEY = "dofusdle-target";

afterEach(() => {
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
