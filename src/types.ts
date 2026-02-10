export interface Monster {
  id: number;
  name: string;
  type: string;
  zone: string;
  niveau: number;
  couleur: string;
  pv: number;
  image?: string;
}

export type FeedbackStatus = 'correct' | 'partial' | 'wrong';
export type ArrowDirection = 'up' | 'down' | null;

export interface AttributeFeedback {
  value: string | number;
  status: FeedbackStatus;
  arrow: ArrowDirection;
}

export interface GuessResult {
  monster: Monster;
  feedback: {
    type: AttributeFeedback;
    zone: AttributeFeedback;
    niveau: AttributeFeedback;
    couleur: AttributeFeedback;
    pv: AttributeFeedback;
  };
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
}

export interface DailyProgress {
  date: string;
  guesses: string[];
  won: boolean;
}
