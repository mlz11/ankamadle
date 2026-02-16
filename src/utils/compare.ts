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

function compareNumeric(
	guessVal: number,
	targetVal: number,
	threshold: number,
): { status: FeedbackStatus; arrow: ArrowDirection } {
	if (guessVal === targetVal) {
		return { status: "correct", arrow: null };
	}

	const arrow: ArrowDirection = guessVal < targetVal ? "up" : "down";
	const diff = Math.abs(guessVal - targetVal);

	if (diff <= threshold) {
		return { status: "partial", arrow };
	}

	return { status: "wrong", arrow };
}

export function compareMonsters(guess: Monster, target: Monster): GuessResult {
	const niveauResult = compareNumeric(guess.niveau_max, target.niveau_max, 10);
	const pvResult = compareNumeric(
		guess.pv_max,
		target.pv_max,
		target.pv_max * 0.2,
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
