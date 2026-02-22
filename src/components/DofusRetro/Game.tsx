import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import monstersData from "../../data/monsters.json";
import type { GameStats, GuessResult, Monster } from "../../types";
import { compareMonsters } from "../../utils/compare";
import {
	getDailyMonster,
	getTodayKey,
	getYesterdayKey,
	getYesterdayMonster,
} from "../../utils/daily";
import {
	loadProgress,
	loadStats,
	loadTargetMonster,
	recordWin,
	saveProgress,
	saveTargetMonster,
} from "../../utils/storage";
import { parseMonsters } from "../../validation";
import ColorLegend from "./ColorLegend";
import DuplicateBanner from "./DuplicateBanner";
import styles from "./Game.module.css";
import GuessGrid from "./GuessGrid";
import HintPanel from "./HintPanel";
import { useHints } from "./hooks/useHints";
import { CONFETTI_FIRST_MS, useVictoryModal } from "./hooks/useVictoryModal";
import SearchBar from "./SearchBar";
import Victory from "./Victory";
import YesterdayAnswer from "./YesterdayAnswer";

const monsters = parseMonsters(monstersData);

interface Props {
	stats: GameStats;
	onStatsChange: (stats: GameStats) => void;
}

export default function Game({ stats, onStatsChange }: Props) {
	const [dateKey, setDateKey] = useState(getTodayKey);
	const [target, setTarget] = useState(() => getDailyMonster(monsters));
	const yesterdayKey = getYesterdayKey();
	const yesterdayMonster = useMemo(() => {
		const cachedId = loadTargetMonster(yesterdayKey);
		if (cachedId !== null) {
			const found = monsters.find((m) => m.id === cachedId);
			if (found) return found;
		}
		return getYesterdayMonster(monsters);
	}, [yesterdayKey]);
	const [devMode, setDevMode] = useState(false);

	const [results, setResults] = useState<GuessResult[]>([]);
	const [won, setWon] = useState(false);
	const [animatingRowIndex, setAnimatingRowIndex] = useState(-1);
	const [duplicateBannerVisible, setDuplicateBannerVisible] = useState(false);

	const {
		hint1,
		hint2,
		hintsUsed,
		revealHint1,
		revealHint2,
		resetHints,
		setRestoredHints,
	} = useHints();
	const {
		showVictory,
		victoryShownOnce,
		triggerWin,
		closeVictory,
		reopenVictory,
		showImmediately,
		resetVictory,
	} = useVictoryModal();

	// Persist progress to localStorage, consolidating all save calls.
	// Accepts optional hint overrides for when a hint is being revealed
	// (the new value hasn't propagated to state yet).
	const hint1Ref = useRef(hint1);
	const hint2Ref = useRef(hint2);
	hint1Ref.current = hint1;
	hint2Ref.current = hint2;

	const persistProgress = useCallback(
		(
			guesses: GuessResult[],
			hasWon: boolean,
			hintOverrides?: { hint1?: boolean; hint2?: boolean },
		) => {
			if (devMode) return;
			saveProgress(
				guesses.map((r) => r.monster.name),
				hasWon,
				hintOverrides?.hint1 ?? hint1Ref.current,
				hintOverrides?.hint2 ?? hint2Ref.current,
			);
		},
		[devMode],
	);

	const resetForNewDay = useCallback(
		(newKey: string) => {
			setDateKey(newKey);
			setTarget(getDailyMonster(monsters, newKey));
			setResults([]);
			setWon(false);
			setAnimatingRowIndex(-1);
			setDuplicateBannerVisible(false);
			resetHints();
			resetVictory();
		},
		[resetHints, resetVictory],
	);

	// Reset game when the Paris day changes while the tab is in the background
	useEffect(() => {
		function checkDayChange() {
			if (document.visibilityState !== "visible") return;
			const currentKey = getTodayKey();
			if (currentKey !== dateKey) {
				resetForNewDay(currentKey);
			}
		}
		document.addEventListener("visibilitychange", checkDayChange);
		return () =>
			document.removeEventListener("visibilitychange", checkDayChange);
	}, [dateKey, resetForNewDay]);

	// Cache today's target so tomorrow we can show "yesterday's answer" even if the pool changes
	useEffect(() => {
		if (!devMode) {
			saveTargetMonster(dateKey, target.id);
		}
	}, [dateKey, target, devMode]);

	// Restore progress on mount (skip in dev mode)
	useEffect(() => {
		if (devMode) return;
		const progress = loadProgress();
		if (progress) {
			const restored: GuessResult[] = [];
			for (const name of progress.guesses) {
				const m = monsters.find((m) => m.name === name);
				if (m) restored.push(compareMonsters(m, target));
			}
			setResults(restored);
			setWon(progress.won);
			setRestoredHints(
				progress.hint1Revealed ?? false,
				progress.hint2Revealed ?? false,
			);
			if (progress.won) {
				showImmediately();
				onStatsChange(loadStats());
			}
		}
	}, [target, devMode, onStatsChange, setRestoredHints, showImmediately]);

	function selectTarget(monster: Monster) {
		setTarget(monster);
		setResults([]);
		setWon(false);
		setAnimatingRowIndex(-1);
		setDuplicateBannerVisible(false);
		resetHints();
		resetVictory();
	}

	function resetGame() {
		const random = monsters[Math.floor(Math.random() * monsters.length)];
		if (random) selectTarget(random);
	}

	const usedIds = useMemo(
		() => new Set(results.map((r) => r.monster.id)),
		[results],
	);

	function handleGuess(monster: Monster) {
		const currentKey = getTodayKey();
		if (currentKey !== dateKey) {
			resetForNewDay(currentKey);
			return;
		}
		if (won || usedIds.has(monster.id)) return;

		setDuplicateBannerVisible(false);
		const result = compareMonsters(monster, target);
		const newResults = [...results, result];
		setResults(newResults);
		setAnimatingRowIndex(newResults.length - 1);

		const isWin = monster.id === target.id;
		if (isWin) {
			setWon(true);
			const newStats = recordWin(newResults.length);
			onStatsChange(newStats);
			triggerWin();
		}

		if (!isWin) {
			const allCorrect = Object.values(result.feedback).every(
				(f) => f.status === "correct",
			);
			if (allCorrect) {
				setTimeout(() => {
					setDuplicateBannerVisible(true);
				}, CONFETTI_FIRST_MS);
			}
		}

		persistProgress(newResults, isWin);
	}

	function handleRevealHint1() {
		revealHint1();
		persistProgress(results, won, { hint1: true });
	}

	function handleRevealHint2() {
		revealHint2();
		persistProgress(results, won, { hint2: true });
	}

	return (
		<div className={styles.game}>
			{import.meta.env.DEV && (
				<div className={styles.devToolbar}>
					<label>
						<input
							type="checkbox"
							checked={devMode}
							onChange={(e) => setDevMode(e.target.checked)}
						/>
						Dev mode
					</label>
					{devMode && (
						<>
							<button type="button" onClick={resetGame}>
								New Game
							</button>
							<span>Target: {target.name}</span>
							<input
								list="dev-monster-list"
								placeholder="Choose monster..."
								onChange={(e) => {
									const found = monsters.find((m) => m.name === e.target.value);
									if (found) {
										selectTarget(found);
										e.target.value = "";
									}
								}}
							/>
							<datalist id="dev-monster-list">
								{monsters.map((m) => (
									<option key={m.id} value={m.name} />
								))}
							</datalist>
						</>
					)}
				</div>
			)}
			<HintPanel
				guessCount={results.length}
				won={won}
				hint1Revealed={hint1}
				hint2Revealed={hint2}
				targetImage={target.image}
				targetEcosystem={target.ecosystem}
				onRevealHint1={handleRevealHint1}
				onRevealHint2={handleRevealHint2}
			/>
			<SearchBar
				monsters={monsters}
				usedIds={usedIds}
				onSelect={handleGuess}
				disabled={won}
			/>
			{duplicateBannerVisible && (
				<DuplicateBanner onDismiss={() => setDuplicateBannerVisible(false)} />
			)}
			<GuessGrid results={results} animatingRowIndex={animatingRowIndex} />
			{results.length > 0 && !won && <ColorLegend />}
			{won && !showVictory && victoryShownOnce && (
				<button
					type="button"
					className={styles.reopenBtn}
					onClick={reopenVictory}
				>
					Voir résultats
				</button>
			)}
			<YesterdayAnswer monster={yesterdayMonster} />
			{showVictory && (
				<Victory
					results={results}
					stats={stats}
					targetName={target.name}
					targetImage={target.image}
					hintsUsed={hintsUsed}
					onClose={closeVictory}
				/>
			)}
		</div>
	);
}
