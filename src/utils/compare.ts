import type { Monster, GuessResult, FeedbackStatus, ArrowDirection } from '../types';

const ZONE_REGIONS: Record<string, string> = {
  'Plaines de Cania': 'Cania',
  'Coin des Bouftous': 'Cania',
  'Incarnam': 'Incarnam',
  'Forêt d\'Amakna': 'Amakna',
  'Cimetière d\'Amakna': 'Amakna',
  'Souterrains d\'Amakna': 'Amakna',
  'Rivage sufokien': 'Sufokia',
  'Camp des Bworks': 'Sidimote',
};

function compareString(guessVal: string, targetVal: string): FeedbackStatus {
  if (guessVal.toLowerCase() === targetVal.toLowerCase()) return 'correct';
  return 'wrong';
}

function compareZone(guessZone: string, targetZone: string): FeedbackStatus {
  if (guessZone === targetZone) return 'correct';
  const guessRegion = ZONE_REGIONS[guessZone] ?? guessZone;
  const targetRegion = ZONE_REGIONS[targetZone] ?? targetZone;
  if (guessRegion === targetRegion) return 'partial';
  return 'wrong';
}

function compareCouleur(guessCouleur: string, targetCouleur: string): FeedbackStatus {
  if (guessCouleur.toLowerCase() === targetCouleur.toLowerCase()) return 'correct';
  const guessColors = guessCouleur.toLowerCase().split(/[\s,\/]+/);
  const targetColors = targetCouleur.toLowerCase().split(/[\s,\/]+/);
  const hasOverlap = guessColors.some(c => targetColors.includes(c));
  if (hasOverlap) return 'partial';
  return 'wrong';
}

function compareNumeric(
  guessVal: number,
  targetVal: number,
  threshold: number
): { status: FeedbackStatus; arrow: ArrowDirection } {
  if (guessVal === targetVal) return { status: 'correct', arrow: null };
  const diff = Math.abs(guessVal - targetVal);
  const arrow: ArrowDirection = guessVal < targetVal ? 'up' : 'down';
  if (diff <= threshold) return { status: 'partial', arrow };
  return { status: 'wrong', arrow };
}

export function compareMonsters(guess: Monster, target: Monster): GuessResult {
  const niveauResult = compareNumeric(guess.niveau, target.niveau, 10);
  const pvThreshold = Math.round(target.pv * 0.2);
  const pvResult = compareNumeric(guess.pv, target.pv, pvThreshold);

  return {
    monster: guess,
    feedback: {
      type: {
        value: guess.type,
        status: compareString(guess.type, target.type),
        arrow: null,
      },
      zone: {
        value: guess.zone,
        status: compareZone(guess.zone, target.zone),
        arrow: null,
      },
      niveau: {
        value: guess.niveau,
        status: niveauResult.status,
        arrow: niveauResult.arrow,
      },
      couleur: {
        value: guess.couleur,
        status: compareCouleur(guess.couleur, target.couleur),
        arrow: null,
      },
      pv: {
        value: guess.pv,
        status: pvResult.status,
        arrow: pvResult.arrow,
      },
    },
  };
}
