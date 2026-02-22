import type { Monster } from "../../types";

export function makeMonsterWith(overrides: Partial<Monster> = {}): Monster {
	return {
		id: 1,
		name: "Default",
		ecosystem: "Plaine",
		race: "Bouftou",
		niveau_min: 1,
		niveau_max: 50,
		pv_min: 10,
		pv_max: 500,
		couleur: "Bleu",
		image: "/img/monsters/1.svg",
		availableFrom: "2025-1-1",
		...overrides,
	};
}

export function makeMonster(id: number, availableFrom = "2025-1-1"): Monster {
	return {
		id,
		name: `Monster ${id}`,
		ecosystem: `Eco ${id % 5}`,
		race: `Race ${id % 3}`,
		niveau_min: 1,
		niveau_max: 10 + id,
		pv_min: 10,
		pv_max: 100 + id,
		couleur: "Bleu",
		image: `/img/monsters/${id}.svg`,
		availableFrom,
	};
}

export function makePool(count: number, availableFrom = "2025-1-1"): Monster[] {
	return Array.from({ length: count }, (_, i) =>
		makeMonster(i + 1, availableFrom),
	);
}

export function getNextDayKey(dateKey: string): string {
	const [y, m, d] = dateKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + 1);
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function generateDateRange(start: string, count: number): string[] {
	const keys: string[] = [start];
	let current = start;
	for (let i = 1; i < count; i++) {
		current = getNextDayKey(current);
		keys.push(current);
	}
	return keys;
}
