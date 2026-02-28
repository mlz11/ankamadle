import { useEffect, useState } from "react";
import { useCloseOnKey } from "../../hooks/useCloseOnKey";
import statsGridStyles from "../../styles/StatsGrid.module.css";
import type { GameStats } from "../../types";
import { getWinPercentage } from "../../utils/storage";
import { getTimeUntilMidnightParis } from "../../utils/time";
import styles from "./SilhouetteVictory.module.css";

interface Props {
	guessCount: number;
	stats: GameStats;
	targetName: string;
	targetImage: string;
	onClose: () => void;
}

function buildShareText(guessCount: number): string {
	const header = `Dofusdle Silhouette - J'ai trouvé la réponse en ${guessCount} essai${guessCount > 1 ? "s" : ""} !`;
	return `${header}\nhttps://dofusdle.fr/silhouette`;
}

export default function SilhouetteVictory({
	guessCount,
	stats,
	targetName,
	targetImage,
	onClose,
}: Props) {
	const [copied, setCopied] = useState(false);
	const [countdown, setCountdown] = useState(getTimeUntilMidnightParis);

	useEffect(() => {
		const id = setInterval(
			() => setCountdown(getTimeUntilMidnightParis()),
			1_000,
		);
		return () => clearInterval(id);
	}, []);

	useCloseOnKey(true, onClose);

	function handleShare() {
		const text = buildShareText(guessCount);
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	const winPct = getWinPercentage(stats);

	return (
		<div className={styles.overlay} onClick={onClose} onKeyDown={() => {}}>
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className={styles.closeBtn}
					onClick={onClose}
					aria-label="Fermer"
				>
					&#x2715;
				</button>
				<h2>Bravo !</h2>
				{targetImage && (
					<img
						src={targetImage}
						alt={targetName}
						className={styles.monsterImg}
					/>
				)}
				<p>
					Tu as trouvé <strong>{targetName}</strong> en{" "}
					<strong>{guessCount}</strong> essai{guessCount > 1 ? "s" : ""}.
				</p>

				<div className={statsGridStyles.grid}>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.gamesPlayed}</span>
						<span className={statsGridStyles.label}>Parties</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{winPct}%</span>
						<span className={statsGridStyles.label}>Victoires</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.currentStreak}</span>
						<span className={statsGridStyles.label}>Série</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.maxStreak}</span>
						<span className={statsGridStyles.label}>Max série</span>
					</div>
				</div>

				<div className={styles.countdown}>
					<span className={styles.label}>Prochain monstre dans</span>
					<span className={styles.timer}>{countdown}</span>
				</div>

				<button type="button" className={styles.shareBtn} onClick={handleShare}>
					{copied ? "Copié !" : "Partager"}
				</button>
			</div>
		</div>
	);
}
