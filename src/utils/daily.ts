import type { Monster } from "../types";

export function getTodayKey(): string {
	const today = new Date();
	return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function getDailyMonster(monsters: Monster[]): Monster {
	const seed = getTodayKey();
	let hash = 0;
	for (const ch of seed) {
		hash = (hash << 5) - hash + ch.charCodeAt(0);
		hash |= 0;
	}
	return monsters[Math.abs(hash) % monsters.length];
}
