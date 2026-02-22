import { useCallback, useState } from "react";

export function useHints() {
	const [hints, setHints] = useState({ hint1: false, hint2: false });

	const revealHint1 = useCallback(() => {
		setHints((h) => ({ ...h, hint1: true }));
	}, []);

	const revealHint2 = useCallback(() => {
		setHints((h) => ({ ...h, hint2: true }));
	}, []);

	const resetHints = useCallback(() => {
		setHints({ hint1: false, hint2: false });
	}, []);

	const setRestoredHints = useCallback((hint1: boolean, hint2: boolean) => {
		setHints({ hint1, hint2 });
	}, []);

	const hintsUsed = (hints.hint1 ? 1 : 0) + (hints.hint2 ? 1 : 0);

	return {
		hint1: hints.hint1,
		hint2: hints.hint2,
		hintsUsed,
		revealHint1,
		revealHint2,
		resetHints,
		setRestoredHints,
	};
}
