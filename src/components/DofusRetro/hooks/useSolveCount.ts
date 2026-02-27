import { useCallback, useEffect, useRef, useState } from "react";
import type { GameMode } from "../../../types";

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

export function useSolveCount(
	dateKey: string,
	gameMode: GameMode = "classique",
): {
	count: number | null;
	reportSolve: () => void;
} {
	const [count, setCount] = useState<number | null>(null);
	const posted = useRef(false);

	useEffect(() => {
		posted.current = false;
		setCount(null);
		fetch(`/api/solve?d=${dateKey}&mode=${gameMode}`)
			.then((r) => r.json())
			.then((data: unknown) => {
				const n = parseCount(data);
				if (n !== null) setCount(n);
			})
			.catch((error: unknown) => {
				import("@sentry/react").then((Sentry) => {
					Sentry.captureException(error, {
						extra: { gameMode, dateKey },
					});
				});
			});
	}, [dateKey, gameMode]);

	const reportSolve = useCallback(() => {
		if (posted.current) return;
		posted.current = true;
		fetch(`/api/solve?mode=${gameMode}`, { method: "POST" })
			.then((r) => r.json())
			.then((data: unknown) => {
				const n = parseCount(data);
				if (n !== null) setCount(n);
			})
			.catch((error: unknown) => {
				import("@sentry/react").then((Sentry) => {
					Sentry.captureException(error, {
						extra: { gameMode },
					});
				});
			});
	}, [gameMode]);

	return { count, reportSolve };
}
