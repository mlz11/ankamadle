import { useCallback, useEffect, useRef, useState } from "react";

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

export function useSolveCount(dateKey: string): {
	count: number | null;
	reportSolve: () => void;
} {
	const [count, setCount] = useState<number | null>(null);
	const posted = useRef(false);

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

	const reportSolve = useCallback(() => {
		if (posted.current) return;
		posted.current = true;
		fetch("/api/solve", { method: "POST" })
			.then((r) => r.json())
			.then((data: unknown) => {
				const n = parseCount(data);
				if (n !== null) setCount(n);
			})
			.catch(() => {});
	}, []);

	return { count, reportSolve };
}
