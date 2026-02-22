import { DailyProgressSchema, GameStatsSchema, MonsterSchema } from "./schemas";
import type { DailyProgress, GameStats, Monster } from "./types";

export function parseMonsters(data: unknown): Monster[] {
	return MonsterSchema.array().parse(data);
}

export function parseDailyProgress(data: unknown): DailyProgress | null {
	const result = DailyProgressSchema.safeParse(data);
	return result.success ? result.data : null;
}

export function parseGameStats(data: unknown): GameStats | null {
	const result = GameStatsSchema.safeParse(data);
	return result.success ? result.data : null;
}
