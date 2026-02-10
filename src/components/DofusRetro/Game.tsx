import { useState, useEffect, useMemo } from 'react';
import type { Monster, GuessResult, GameStats } from '../../types';
import monstersData from '../../data/monsters.json';
import { getDailyMonster } from '../../utils/daily';
import { compareMonsters } from '../../utils/compare';
import { loadProgress, saveProgress, loadStats, recordWin } from '../../utils/storage';
import SearchBar from './SearchBar';
import GuessGrid from './GuessGrid';
import Victory from './Victory';

const monsters: Monster[] = monstersData as Monster[];

export default function Game() {
  const target = useMemo(() => getDailyMonster(monsters), []);

  const [results, setResults] = useState<GuessResult[]>([]);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState<GameStats>(loadStats());

  // Restore progress on mount
  useEffect(() => {
    const progress = loadProgress();
    if (progress) {
      const restored: GuessResult[] = [];
      for (const name of progress.guesses) {
        const m = monsters.find(m => m.name === name);
        if (m) restored.push(compareMonsters(m, target));
      }
      setResults(restored);
      setWon(progress.won);
      if (progress.won) setStats(loadStats());
    }
  }, [target]);

  const usedIds = useMemo(
    () => new Set(results.map(r => r.monster.id)),
    [results]
  );

  function handleGuess(monster: Monster) {
    if (won || usedIds.has(monster.id)) return;

    const result = compareMonsters(monster, target);
    const newResults = [...results, result];
    setResults(newResults);

    const isWin = monster.id === target.id;
    if (isWin) {
      setWon(true);
      const newStats = recordWin(newResults.length);
      setStats(newStats);
    }

    saveProgress(
      newResults.map(r => r.monster.name),
      isWin
    );
  }

  return (
    <div className="game">
      <p className="game-subtitle">Dofus Retro 1.29 — Devine le monstre du jour</p>
      <SearchBar
        monsters={monsters}
        usedIds={usedIds}
        onSelect={handleGuess}
        disabled={won}
      />
      <GuessGrid results={results} />
      {won && (
        <Victory
          results={results}
          stats={stats}
          targetName={target.name}
        />
      )}
    </div>
  );
}
