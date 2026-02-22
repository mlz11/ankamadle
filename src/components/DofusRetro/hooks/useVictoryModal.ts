import confetti from "canvas-confetti";
import { useCallback, useState } from "react";

/** Delay before first confetti burst (after last cell finishes flipping). */
export const CONFETTI_FIRST_MS = 1200;
/** Delay before second, smaller confetti burst. */
const CONFETTI_SECOND_MS = 1700;
/** Delay before showing the victory modal. */
const VICTORY_MODAL_DELAY_MS = 2000;

interface UseVictoryModalReturn {
	showVictory: boolean;
	victoryShownOnce: boolean;
	triggerWin: () => void;
	closeVictory: () => void;
	reopenVictory: () => void;
	showImmediately: () => void;
	resetVictory: () => void;
}

export function useVictoryModal(): UseVictoryModalReturn {
	const [showVictory, setShowVictory] = useState(false);
	const [victoryShownOnce, setVictoryShownOnce] = useState(false);

	const triggerWin = useCallback(() => {
		setTimeout(() => {
			confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
		}, CONFETTI_FIRST_MS);
		setTimeout(() => {
			confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
		}, CONFETTI_SECOND_MS);
		setTimeout(() => {
			setShowVictory(true);
			setVictoryShownOnce(true);
		}, VICTORY_MODAL_DELAY_MS);
	}, []);

	const closeVictory = useCallback(() => {
		setShowVictory(false);
	}, []);

	const reopenVictory = useCallback(() => {
		setShowVictory(true);
	}, []);

	const showImmediately = useCallback(() => {
		setShowVictory(true);
		setVictoryShownOnce(true);
	}, []);

	const resetVictory = useCallback(() => {
		setShowVictory(false);
		setVictoryShownOnce(false);
	}, []);

	return {
		showVictory,
		victoryShownOnce,
		triggerWin,
		closeVictory,
		reopenVictory,
		showImmediately,
		resetVictory,
	};
}
