import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { GameStats } from "../types";
import { loadStats } from "../utils/storage";
import styles from "./App.module.css";
import Game from "./DofusRetro/Game";
import ErrorBoundary from "./ErrorBoundary";
import Footer from "./Footer";
import Header from "./Header";
import HomePage from "./HomePage";

function FallbackUI() {
	return (
		<div className={styles.app}>
			<p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
		</div>
	);
}

export default function App() {
	const [stats, setStats] = useState<GameStats>(() => loadStats("classique"));
	const location = useLocation();

	useEffect(() => {
		const isClassique = location.pathname === "/classique";
		document.body.classList.toggle("theme-classique", isClassique);
		return () => document.body.classList.remove("theme-classique");
	}, [location.pathname]);

	return (
		<ErrorBoundary fallback={<FallbackUI />}>
			<div className={styles.app}>
				<Header stats={stats} />
				<main>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route
							path="/classique"
							element={
								<Game
									gameMode="classique"
									stats={stats}
									onStatsChange={setStats}
								/>
							}
						/>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</ErrorBoundary>
	);
}
