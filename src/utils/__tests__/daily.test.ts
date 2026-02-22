import { describe, expect, it } from "vitest";
import { getDailyMonster } from "../daily";
import { generateDateRange, makeMonster, makePool } from "./helpers";

describe("getDailyMonster", () => {
	describe("determinism", () => {
		it("should return the same monster when called with the same date and pool", () => {
			const pool = makePool(100);
			const dateKey = "2025-6-15";
			const first = getDailyMonster(pool, dateKey);
			for (let i = 0; i < 100; i++) {
				// New reference forces cache invalidation and full recomputation
				expect(getDailyMonster([...pool], dateKey).id).toBe(first.id);
			}
		});

		it("should return the same monster when called with an explicit seed multiple times", () => {
			const pool = makePool(100);
			const first = getDailyMonster(pool, "2025-8-1");
			for (let i = 0; i < 50; i++) {
				expect(getDailyMonster([...pool], "2025-8-1").id).toBe(first.id);
			}
		});
	});

	describe("date variation", () => {
		it("should return many distinct monsters when called over 100 consecutive days", () => {
			const pool = makePool(100);
			const dates = generateDateRange("2025-3-1", 100);
			const selections = dates.map((d) => getDailyMonster(pool, d).id);
			const unique = new Set(selections);
			expect(unique.size).toBeGreaterThanOrEqual(30);
		});
	});

	describe("anti-repeat window", () => {
		it("should never repeat a monster within any 30-day window when simulated over 365 days", () => {
			const pool = makePool(100);
			const dates = generateDateRange("2025-1-1", 365);
			const selections = dates.map((d) => getDailyMonster(pool, d).id);

			for (let i = 0; i < selections.length; i++) {
				const windowStart = Math.max(0, i - 30);
				for (let j = windowStart; j < i; j++) {
					if (selections[i] === selections[j]) {
						throw new Error(
							`Monster ${selections[i]} repeated at day ${i} (prev at day ${j}, gap=${i - j}, window=${30})`,
						);
					}
				}
			}
		});

		it("should not crash when the pool is smaller than the anti-repeat window", () => {
			const smallPool = makePool(5);
			const dates = generateDateRange("2025-1-1", 100);
			for (const d of dates) {
				const m = getDailyMonster(smallPool, d);
				expect(m).toBeDefined();
				expect(m.id).toBeGreaterThan(0);
			}
		});

		it("should always return the only monster when the pool has a single entry", () => {
			const singlePool = [makeMonster(42)];
			const dates = generateDateRange("2025-1-1", 50);
			for (const d of dates) {
				expect(getDailyMonster(singlePool, d).id).toBe(42);
			}
		});

		it("should never pick the same monster on two adjacent days when simulated over 1000 days", () => {
			const pool = makePool(100);
			const dates = generateDateRange("2025-1-1", 1000);
			let prevId = -1;
			for (const d of dates) {
				const id = getDailyMonster(pool, d).id;
				expect(id).not.toBe(prevId);
				prevId = id;
			}
		});
	});

	describe("pool resilience to mutations", () => {
		const dates = generateDateRange("2025-1-1", 365);

		it("should change less than 5% of selections when a monster is added to the pool", () => {
			const basePool = makePool(100);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const extendedPool = [...basePool, makeMonster(101)];
			const newSelections = dates.map(
				(d) => getDailyMonster(extendedPool, d).id,
			);

			let changed = 0;
			for (let i = 0; i < dates.length; i++) {
				if (baseSelections[i] !== newSelections[i]) changed++;
			}
			expect(changed / dates.length).toBeLessThan(0.05);
		});

		it("should change less than 10% of non-winner days when a monster is removed from the pool", () => {
			const basePool = makePool(100);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const reducedPool = basePool.filter((m) => m.id !== 50);
			const newSelections = dates.map(
				(d) => getDailyMonster(reducedPool, d).id,
			);

			let nonWinnerChanges = 0;
			let nonWinnerDays = 0;
			for (let i = 0; i < dates.length; i++) {
				if (baseSelections[i] !== 50) {
					nonWinnerDays++;
					if (baseSelections[i] !== newSelections[i]) nonWinnerChanges++;
				}
			}
			expect(nonWinnerChanges / nonWinnerDays).toBeLessThan(0.1);
		});

		it("should produce identical selections when a monster's attributes change but its id stays the same", () => {
			const basePool = makePool(100);
			const modifiedPool = basePool.map((m) =>
				m.id === 25 ? { ...m, name: "Modified Monster", pv_max: 9999 } : m,
			);

			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);
			const modifiedSelections = dates.map(
				(d) => getDailyMonster(modifiedPool, d).id,
			);

			for (let i = 0; i < dates.length; i++) {
				expect(modifiedSelections[i]).toBe(baseSelections[i]);
			}
		});

		it("should produce identical selections when a monster with future availableFrom is added", () => {
			const basePool = makePool(100);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const futureMonster = makeMonster(200, "2026-6-1");
			const extendedPool = [...basePool, futureMonster];
			const newSelections = dates.map(
				(d) => getDailyMonster(extendedPool, d).id,
			);

			for (let i = 0; i < dates.length; i++) {
				expect(newSelections[i]).toBe(baseSelections[i]);
			}
		});

		it("should produce identical selections when a monster is removed and re-added with the same id", () => {
			const basePool = makePool(100);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const restored = [
				...basePool.filter((m) => m.id !== 30),
				makeMonster(30),
			];
			const restoredSelections = dates.map(
				(d) => getDailyMonster(restored, d).id,
			);

			for (let i = 0; i < dates.length; i++) {
				expect(restoredSelections[i]).toBe(baseSelections[i]);
			}
		});

		it("should change less than 15% of selections when 10 monsters are added at once", () => {
			const basePool = makePool(100);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const newMonsters = Array.from({ length: 10 }, (_, i) =>
				makeMonster(200 + i),
			);
			const extendedPool = [...basePool, ...newMonsters];
			const newSelections = dates.map(
				(d) => getDailyMonster(extendedPool, d).id,
			);

			let changed = 0;
			for (let i = 0; i < dates.length; i++) {
				if (baseSelections[i] !== newSelections[i]) changed++;
			}
			expect(changed / dates.length).toBeLessThan(0.15);
		});

		it("should change less than 15% of non-winner days when 5 monsters are removed at once", () => {
			const basePool = makePool(100);
			const removedIds = new Set([10, 20, 30, 40, 50]);
			const baseSelections = dates.map((d) => getDailyMonster(basePool, d).id);

			const reducedPool = basePool.filter((m) => !removedIds.has(m.id));
			const newSelections = dates.map(
				(d) => getDailyMonster(reducedPool, d).id,
			);

			let nonWinnerChanges = 0;
			let nonWinnerDays = 0;
			for (let i = 0; i < dates.length; i++) {
				if (!removedIds.has(baseSelections[i])) {
					nonWinnerDays++;
					if (baseSelections[i] !== newSelections[i]) nonWinnerChanges++;
				}
			}
			expect(nonWinnerChanges / nonWinnerDays).toBeLessThan(0.15);
		});

		it("should never select a monster when its availableFrom is changed to a future date", () => {
			const modifiedPool = makePool(100).map((m) =>
				m.id === 10 ? { ...m, availableFrom: "2026-1-1" } : m,
			);
			for (const d of dates) {
				expect(getDailyMonster(modifiedPool, d).id).not.toBe(10);
			}
		});
	});

	describe("distribution quality", () => {
		it("should select every monster at least once when simulated over 3000 days with 100 monsters", () => {
			const pool = makePool(100);
			const dates = generateDateRange("2025-1-1", 3000);
			const counts = new Map<number, number>();
			for (const d of dates) {
				const id = getDailyMonster(pool, d).id;
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
			for (const m of pool) {
				expect(counts.has(m.id)).toBe(true);
			}
		}, 30_000);

		it("should have a reasonable standard deviation of appearance counts when simulated over 3000 days", () => {
			const pool = makePool(100);
			const dates = generateDateRange("2025-1-1", 3000);
			const counts = new Map<number, number>();
			for (const d of dates) {
				const id = getDailyMonster(pool, d).id;
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
			const values = Array.from(counts.values());
			const mean = values.reduce((a, b) => a + b, 0) / values.length;
			const variance =
				values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
			const stddev = Math.sqrt(variance);
			expect(stddev).toBeLessThan(2 * mean);
		}, 30_000);
	});
});
