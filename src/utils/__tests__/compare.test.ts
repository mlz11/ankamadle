import { describe, expect, it } from "vitest";
import { compareMonsters } from "../compare";
import { makeMonsterWith as monster } from "./helpers";

describe("compareMonsters", () => {
	describe("ecosystem", () => {
		it("should return correct when guess matches target case-insensitively", () => {
			const guess = monster({ ecosystem: "plaine" });
			const target = monster({ ecosystem: "Plaine" });
			expect(compareMonsters(guess, target).feedback.ecosystem.status).toBe(
				"correct",
			);
		});

		it("should return wrong when guess differs from target", () => {
			const guess = monster({ ecosystem: "Forêt" });
			const target = monster({ ecosystem: "Plaine" });
			expect(compareMonsters(guess, target).feedback.ecosystem.status).toBe(
				"wrong",
			);
		});
	});

	describe("race", () => {
		it("should return correct when guess matches target case-insensitively", () => {
			const guess = monster({ race: "bouftou" });
			const target = monster({ race: "Bouftou" });
			expect(compareMonsters(guess, target).feedback.race.status).toBe(
				"correct",
			);
		});

		it("should return wrong when guess differs from target", () => {
			const guess = monster({ race: "Tofu" });
			const target = monster({ race: "Bouftou" });
			expect(compareMonsters(guess, target).feedback.race.status).toBe("wrong");
		});
	});

	describe("couleur", () => {
		it("should return correct when both colors are identical", () => {
			const guess = monster({ couleur: "Bleu" });
			const target = monster({ couleur: "Bleu" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"correct",
			);
		});

		it("should return correct when both colors are empty", () => {
			const guess = monster({ couleur: "" });
			const target = monster({ couleur: "" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"correct",
			);
		});

		it("should return wrong when only guess color is empty", () => {
			const guess = monster({ couleur: "" });
			const target = monster({ couleur: "Bleu" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"wrong",
			);
		});

		it("should return wrong when only target color is empty", () => {
			const guess = monster({ couleur: "Bleu" });
			const target = monster({ couleur: "" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"wrong",
			);
		});

		it("should return correct when colors match case-insensitively", () => {
			const guess = monster({ couleur: "bleu" });
			const target = monster({ couleur: "Bleu" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"correct",
			);
		});

		it("should return partial when multi-value colors partially overlap", () => {
			const guess = monster({ couleur: "Orange / Bleu" });
			const target = monster({ couleur: "Bleu / Vert" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"partial",
			);
		});

		it("should return wrong when colors have no overlap", () => {
			const guess = monster({ couleur: "Orange / Rouge" });
			const target = monster({ couleur: "Bleu / Vert" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"wrong",
			);
		});

		it("should return partial when colors use slash separator", () => {
			const guess = monster({ couleur: "Orange/Bleu" });
			const target = monster({ couleur: "Bleu/Vert" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"partial",
			);
		});

		it("should return partial when colors use comma separator", () => {
			const guess = monster({ couleur: "Orange, Bleu" });
			const target = monster({ couleur: "Bleu, Vert" });
			expect(compareMonsters(guess, target).feedback.couleur.status).toBe(
				"partial",
			);
		});
	});

	describe("niveau", () => {
		it("should return correct with no arrow when values are equal", () => {
			const guess = monster({ niveau_max: 50 });
			const target = monster({ niveau_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return correct when guess is within green threshold below target", () => {
			const guess = monster({ niveau_max: 45 });
			const target = monster({ niveau_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return correct when guess is within green threshold above target", () => {
			const guess = monster({ niveau_max: 55 });
			const target = monster({ niveau_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return wrong with up arrow when guess is far below target", () => {
			const guess = monster({ niveau_max: 30 });
			const target = monster({ niveau_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("wrong");
			expect(arrow).toBe("up");
		});

		it("should return wrong with down arrow when guess is far above target", () => {
			const guess = monster({ niveau_max: 70 });
			const target = monster({ niveau_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("wrong");
			expect(arrow).toBe("down");
		});

		it("should return partial when difference is exactly at partial threshold", () => {
			const guess = monster({ niveau_max: 40 });
			const target = monster({ niveau_max: 50 });
			const { status } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("partial");
		});

		it("should return correct when diff is within green floor for low-level monster", () => {
			const guess = monster({ niveau_max: 20 });
			const target = monster({ niveau_max: 25 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return partial when diff is within partial floor for low-level monster", () => {
			const guess = monster({ niveau_max: 15 });
			const target = monster({ niveau_max: 25 });
			const { status, arrow } = compareMonsters(guess, target).feedback.niveau;
			expect(status).toBe("partial");
			expect(arrow).toBe("up");
		});
	});

	describe("pv", () => {
		it("should return correct with no arrow when values are equal", () => {
			const guess = monster({ pv_max: 500 });
			const target = monster({ pv_max: 500 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return correct when guess is within green threshold below target", () => {
			const guess = monster({ pv_max: 450 });
			const target = monster({ pv_max: 500 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return correct when guess is within green threshold above target", () => {
			const guess = monster({ pv_max: 550 });
			const target = monster({ pv_max: 500 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return wrong with up arrow when guess is far below target", () => {
			const guess = monster({ pv_max: 200 });
			const target = monster({ pv_max: 500 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("wrong");
			expect(arrow).toBe("up");
		});

		it("should return wrong with down arrow when guess is far above target", () => {
			const guess = monster({ pv_max: 900 });
			const target = monster({ pv_max: 500 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("wrong");
			expect(arrow).toBe("down");
		});

		it("should return partial when difference is exactly 20% of target", () => {
			const guess = monster({ pv_max: 400 });
			const target = monster({ pv_max: 500 });
			const { status } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("partial");
		});

		it("should scale threshold with target value", () => {
			// 20% of 1000 = 200, so 850 (diff 150) is within partial threshold
			const guess = monster({ pv_max: 850 });
			const target = monster({ pv_max: 1000 });
			expect(compareMonsters(guess, target).feedback.pv.status).toBe("partial");

			// 20% of 100 = 20 but floor is 50, so 150 (diff 50) is within partial floor
			const guess2 = monster({ pv_max: 150 });
			const target2 = monster({ pv_max: 100 });
			expect(compareMonsters(guess2, target2).feedback.pv.status).toBe(
				"partial",
			);
		});

		it("should return correct when diff is within green floor for low-pv monster", () => {
			const guess = monster({ pv_max: 30 });
			const target = monster({ pv_max: 50 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("correct");
			expect(arrow).toBeNull();
		});

		it("should return partial when diff is within partial floor for low-pv monster", () => {
			const guess = monster({ pv_max: 30 });
			const target = monster({ pv_max: 70 });
			const { status, arrow } = compareMonsters(guess, target).feedback.pv;
			expect(status).toBe("partial");
			expect(arrow).toBe("up");
		});
	});

	describe("result structure", () => {
		it("should include guess monster in result", () => {
			const guess = monster({ id: 42, name: "Tofu" });
			const target = monster();
			const result = compareMonsters(guess, target);
			expect(result.monster).toBe(guess);
		});

		it("should display dash for couleur value when guess color is empty", () => {
			const guess = monster({ couleur: "" });
			const target = monster();
			expect(compareMonsters(guess, target).feedback.couleur.value).toBe("-");
		});
	});
});
