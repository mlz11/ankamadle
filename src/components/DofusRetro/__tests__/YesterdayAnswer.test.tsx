// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Monster } from "../../../types";
import YesterdayAnswer from "../YesterdayAnswer";

afterEach(cleanup);

const monster: Monster = {
	id: 1,
	name: "Bouftou",
	ecosystem: "Plaines de Cania",
	race: "Bouftous",
	niveau_min: 1,
	niveau_max: 10,
	pv_min: 10,
	pv_max: 50,
	couleur: "Orange",
	image: "/img/monsters/bouftou.svg",
	availableFrom: "2025-1-1",
};

describe("YesterdayAnswer", () => {
	it("should display yesterday's monster name when rendered", () => {
		render(<YesterdayAnswer monster={monster} />);
		expect(screen.getByText("Bouftou")).toBeVisible();
	});

	it("should display monster image when monster has an image", () => {
		render(<YesterdayAnswer monster={monster} />);
		expect(screen.getByAltText("Bouftou")).toBeVisible();
	});
});
