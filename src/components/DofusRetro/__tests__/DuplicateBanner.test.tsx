// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DuplicateBanner from "../DuplicateBanner";

function setupUser() {
	return userEvent.setup({
		advanceTimers: (ms) => vi.advanceTimersByTime(ms),
	});
}

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("DuplicateBanner", () => {
	it("should display the duplicate attributes message when rendered", () => {
		render(<DuplicateBanner onDismiss={() => {}} />);
		expect(
			screen.getByText(/Mêmes attributs, mais ce n'est pas le bon monstre/),
		).toBeVisible();
	});

	it("should have an accessible status role when rendered", () => {
		render(<DuplicateBanner onDismiss={() => {}} />);
		expect(screen.getByRole("status")).toBeVisible();
	});

	it("should auto-dismiss after the timeout when left untouched", () => {
		const onDismiss = vi.fn();
		render(<DuplicateBanner onDismiss={onDismiss} />);
		expect(onDismiss).not.toHaveBeenCalled();
		act(() => vi.advanceTimersByTime(5000));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("should dismiss when clicked", async () => {
		const user = setupUser();
		const onDismiss = vi.fn();
		render(<DuplicateBanner onDismiss={onDismiss} />);
		await user.click(screen.getByRole("status"));
		expect(onDismiss).toHaveBeenCalledOnce();
	});
});
