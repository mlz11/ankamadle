// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSolveCount } from "../hooks/useSolveCount";

beforeEach(() => {
	vi.spyOn(globalThis, "fetch").mockResolvedValue(
		new Response(JSON.stringify({ count: 0 })),
	);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("useSolveCount", () => {
	it("should include mode in the GET request when a game mode is provided", async () => {
		const { result } = renderHook(() =>
			useSolveCount("2026-2-26", "classique"),
		);

		await waitFor(() => expect(result.current.count).toBe(0));

		expect(fetch).toHaveBeenCalledWith("/api/solve?d=2026-2-26&mode=classique");
	});

	it("should default mode to classique when no game mode is provided", async () => {
		const { result } = renderHook(() => useSolveCount("2026-2-26"));

		await waitFor(() => expect(result.current.count).toBe(0));

		expect(fetch).toHaveBeenCalledWith("/api/solve?d=2026-2-26&mode=classique");
	});

	it("should include mode in the POST request when reporting a solve", async () => {
		const { result } = renderHook(() =>
			useSolveCount("2026-2-26", "classique"),
		);

		await waitFor(() => expect(result.current.count).toBe(0));

		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ count: 42 })),
		);

		act(() => {
			result.current.reportSolve();
		});

		await waitFor(() => expect(result.current.count).toBe(42));

		expect(fetch).toHaveBeenCalledWith("/api/solve?mode=classique", {
			method: "POST",
		});
	});

	it("should not report a solve more than once when reportSolve is called multiple times", async () => {
		const { result } = renderHook(() =>
			useSolveCount("2026-2-26", "classique"),
		);

		await waitFor(() => expect(result.current.count).toBe(0));

		vi.mocked(fetch).mockClear();
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ count: 1 })),
		);

		act(() => {
			result.current.reportSolve();
			result.current.reportSolve();
		});

		await waitFor(() => expect(result.current.count).toBe(1));

		const postCalls = vi
			.mocked(fetch)
			.mock.calls.filter(
				(call) =>
					typeof call[1] === "object" &&
					call[1] !== null &&
					"method" in call[1] &&
					call[1].method === "POST",
			);
		expect(postCalls).toHaveLength(1);
	});
});
