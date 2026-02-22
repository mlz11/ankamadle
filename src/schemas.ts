import { z } from "zod";

export const MonsterSchema = z.object({
	id: z.number(),
	name: z.string(),
	ecosystem: z.string(),
	race: z.string(),
	niveau_min: z.number(),
	niveau_max: z.number(),
	pv_min: z.number(),
	pv_max: z.number(),
	couleur: z.string().optional().default(""),
	image: z.string(),
	availableFrom: z.string(),
});

export const DailyProgressSchema = z.object({
	date: z.string(),
	guesses: z.array(z.string()),
	won: z.boolean(),
	hint1Revealed: z.boolean().optional(),
	hint2Revealed: z.boolean().optional(),
});

export const GameStatsSchema = z.object({
	gamesPlayed: z.number(),
	gamesWon: z.number(),
	currentStreak: z.number(),
	maxStreak: z.number(),
	guessDistribution: z.record(z.string(), z.number()),
	lastPlayedDate: z.string().nullable().optional(),
});
