import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { GameMode, GameStats } from "../types";
import { loadStats } from "../utils/storage";
import styles from "./App.module.css";
import ClassiqueGame from "./DofusRetro/Game";
import ErrorBoundary from "./ErrorBoundary";
import Footer from "./Footer";
import Header from "./Header";
import HomePage from "./HomePage";
import SilhouetteGame from "./Silhouette/Game";

function FallbackUI() {
	return (
		<div className={styles.app}>
			<p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
		</div>
	);
}

const MODE_BY_PATH: Record<string, GameMode> = {
	"/classique": "classique",
	"/silhouette": "silhouette",
};

function AppContent() {
	const location = useLocation();
	const activeMode = MODE_BY_PATH[location.pathname] ?? null;

	useEffect(() => {
		document.body.classList.toggle(
			"theme-classique",
			location.pathname === "/classique",
		);
		document.body.classList.toggle(
			"theme-silhouette",
			location.pathname === "/silhouette",
		);
		return () => {
			document.body.classList.remove("theme-classique", "theme-silhouette");
		};
	}, [location.pathname]);

	const [statsByMode, setStatsByMode] = useState<Record<GameMode, GameStats>>(
		() => ({
			classique: loadStats("classique"),
			silhouette: loadStats("silhouette"),
		}),
	);

	const handleStatsChange = useCallback((mode: GameMode, stats: GameStats) => {
		setStatsByMode((prev) => ({ ...prev, [mode]: stats }));
	}, []);

	const handleClassiqueStatsChange = useCallback(
		(s: GameStats) => handleStatsChange("classique", s),
		[handleStatsChange],
	);

	const handleSilhouetteStatsChange = useCallback(
		(s: GameStats) => handleStatsChange("silhouette", s),
		[handleStatsChange],
	);

	return (
		<div className={styles.app}>
			<Header
				stats={activeMode ? statsByMode[activeMode] : statsByMode.classique}
				gameMode={activeMode}
			/>
			<main>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route
						path="/classique"
						element={
							<ClassiqueGame
								gameMode="classique"
								stats={statsByMode.classique}
								onStatsChange={handleClassiqueStatsChange}
							/>
						}
					/>
					<Route
						path="/silhouette"
						element={
							<SilhouetteGame
								gameMode="silhouette"
								stats={statsByMode.silhouette}
								onStatsChange={handleSilhouetteStatsChange}
							/>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

export default function App() {
	return (
		<ErrorBoundary fallback={<FallbackUI />}>
			<AppContent />
		</ErrorBoundary>
	);
}
