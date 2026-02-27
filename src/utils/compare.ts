import type {
	ArrowDirection,
	FeedbackStatus,
	GuessResult,
	Monster,
} from "../types";

function compareString(guessVal: string, targetVal: string): FeedbackStatus {
	if (guessVal.toLowerCase() === targetVal.toLowerCase()) return "correct";
	return "wrong";
}

function compareCouleur(
	guessCouleur: string,
	targetCouleur: string,
): FeedbackStatus {
	if (!guessCouleur || !targetCouleur) {
		return guessCouleur === targetCouleur ? "correct" : "wrong";
	}
	if (guessCouleur.toLowerCase() === targetCouleur.toLowerCase())
		return "correct";
	const guessColors = guessCouleur.toLowerCase().split(/[\s,/]+/);
	const targetColors = targetCouleur.toLowerCase().split(/[\s,/]+/);
	const hasOverlap = guessColors.some((c) => targetColors.includes(c));
	if (hasOverlap) return "partial";
	return "wrong";
}

const CORRECT_PERCENT = 0.1;
const PARTIAL_PERCENT = 0.2;

const NIVEAU_CORRECT_FLOOR = 5;
const NIVEAU_PARTIAL_FLOOR = 10;

const PV_CORRECT_FLOOR = 25;
const PV_PARTIAL_FLOOR = 50;

function compareNumeric(
	guessVal: number,
	targetVal: number,
	partialThreshold: number,
	correctThreshold = 0,
): { status: FeedbackStatus; arrow: ArrowDirection } {
	if (guessVal === targetVal) {
		return { status: "correct", arrow: null };
	}

	const diff = Math.abs(guessVal - targetVal);

	if (diff <= correctThreshold) {
		return { status: "correct", arrow: null };
	}

	const arrow: ArrowDirection = guessVal < targetVal ? "up" : "down";

	if (diff <= partialThreshold) {
		return { status: "partial", arrow };
	}

	return { status: "wrong", arrow };
}

export function compareMonsters(guess: Monster, target: Monster): GuessResult {
	const niveauResult = compareNumeric(
		guess.niveau_max,
		target.niveau_max,
		Math.max(target.niveau_max * PARTIAL_PERCENT, NIVEAU_PARTIAL_FLOOR),
		Math.max(target.niveau_max * CORRECT_PERCENT, NIVEAU_CORRECT_FLOOR),
	);
	const pvResult = compareNumeric(
		guess.pv_max,
		target.pv_max,
		Math.max(target.pv_max * PARTIAL_PERCENT, PV_PARTIAL_FLOOR),
		Math.max(target.pv_max * CORRECT_PERCENT, PV_CORRECT_FLOOR),
	);

	return {
		monster: guess,
		feedback: {
			ecosystem: {
				value: guess.ecosystem,
				status: compareString(guess.ecosystem, target.ecosystem),
				arrow: null,
			},
			race: {
				value: guess.race,
				status: compareString(guess.race, target.race),
				arrow: null,
			},
			niveau: {
				value: String(guess.niveau_max),
				status: niveauResult.status,
				arrow: niveauResult.arrow,
			},
			couleur: {
				value: guess.couleur || "-",
				status: compareCouleur(guess.couleur, target.couleur),
				arrow: null,
			},
			pv: {
				value: String(guess.pv_max),
				status: pvResult.status,
				arrow: pvResult.arrow,
			},
		},
	};
}
