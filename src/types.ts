import type { z } from "zod";
import type {
	DailyProgressSchema,
	GameStatsSchema,
	MonsterSchema,
} from "./schemas";

export type Monster = z.infer<typeof MonsterSchema>;
export type DailyProgress = z.infer<typeof DailyProgressSchema>;
export type GameStats = z.infer<typeof GameStatsSchema>;

export type GameMode = "classique" | "silhouette";

export type FeedbackStatus = "correct" | "partial" | "wrong";
export type ArrowDirection = "up" | "down" | null;

export interface AttributeFeedback {
	value: string | number;
	status: FeedbackStatus;
	arrow: ArrowDirection;
}

export interface GuessResult {
	monster: Monster;
	feedback: {
		ecosystem: AttributeFeedback;
		race: AttributeFeedback;
		niveau: AttributeFeedback;
		couleur: AttributeFeedback;
		pv: AttributeFeedback;
	};
}
