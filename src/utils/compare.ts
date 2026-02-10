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

function compareRange(
	guessMin: number,
	guessMax: number,
	targetMin: number,
	targetMax: number,
): { status: FeedbackStatus; arrow: ArrowDirection } {
	if (guessMin === targetMin && guessMax === targetMax) {
		return { status: "correct", arrow: null };
	}

	const overlaps = guessMin <= targetMax && targetMin <= guessMax;
	const guessMid = (guessMin + guessMax) / 2;
	const targetMid = (targetMin + targetMax) / 2;
	const arrow: ArrowDirection = guessMid < targetMid ? "up" : "down";

	if (overlaps) {
		return { status: "partial", arrow };
	}

	return { status: "wrong", arrow };
}

function formatRange(min: number, max: number): string {
	if (min === max) return String(min);
	return `${min} - ${max}`;
}

export function compareMonsters(guess: Monster, target: Monster): GuessResult {
	const niveauResult = compareRange(
		guess.niveau_min,
		guess.niveau_max,
		target.niveau_min,
		target.niveau_max,
	);
	const pvResult = compareRange(
		guess.pv_min,
		guess.pv_max,
		target.pv_min,
		target.pv_max,
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
				value: formatRange(guess.niveau_min, guess.niveau_max),
				status: niveauResult.status,
				arrow: niveauResult.arrow,
			},
			couleur: {
				value: guess.couleur || "—",
				status: compareCouleur(guess.couleur, target.couleur),
				arrow: null,
			},
			pv: {
				value: formatRange(guess.pv_min, guess.pv_max),
				status: pvResult.status,
				arrow: pvResult.arrow,
			},
		},
	};
}
