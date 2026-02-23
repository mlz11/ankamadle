import { useEffect, useRef, useState } from "react";

function parseCount(data: unknown): number | null {
	if (
		data !== null &&
		typeof data === "object" &&
		"count" in data &&
		typeof (data as { count: unknown }).count === "number"
	) {
		return (data as { count: number }).count;
	}
	return null;
}

/**
 * Fetches the daily solve count on mount and when the date changes.
 * When `postOnWin` transitions to `true` during the session, fires
 * a POST to record the solve and updates the count.
 * Returns `null` while loading or on failure (caller hides the display).
 */
export function useSolveCount(
	postOnWin: boolean,
	dateKey: string,
): number | null {
	const [count, setCount] = useState<number | null>(null);
	// Initialize to postOnWin so a restored win (already true on mount)
	// does not trigger a spurious POST.
	const posted = useRef(postOnWin);

	// Fetch count on mount and when the date changes (day rollover)
	useEffect(() => {
		posted.current = false;
		setCount(null);
		fetch(`/api/solve?d=${dateKey}`)
			.then((r) => r.json())
			.then((data: unknown) => {
				const n = parseCount(data);
				if (n !== null) setCount(n);
			})
			.catch(() => {});
	}, [dateKey]);

	useEffect(() => {
		if (!postOnWin || posted.current) return;
		posted.current = true;
		fetch("/api/solve", { method: "POST" })
			.then((r) => r.json())
			.then((data: unknown) => {
				const n = parseCount(data);
				if (n !== null) setCount(n);
			})
			.catch(() => {});
	}, [postOnWin]);

	return count;
}
