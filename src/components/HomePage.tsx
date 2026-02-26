import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import styles from "./HomePage.module.css";

export default function HomePage() {
	useDocumentMeta({
		title: "Dofusdle - Le jeu de devinettes Dofus Retro",
		description:
			"Choisis ton mode de jeu Dofusdle ! Devine le monstre Dofus Retro du jour dans différents modes inspirés de Wordle.",
		canonicalUrl: "https://dofusdle.fr/",
	});

	return (
		<div className={styles.page}>
			<p className={styles.tagline}>Choisis ton mode de jeu</p>
			<div className={styles.grid}>
				<Link to="/classique" className={styles.card}>
					<img
						src="/og-image.png"
						width={96}
						height={96}
						alt=""
						className={styles.cardImage}
					/>
					<span className={styles.cardTitle}>Classique</span>
					<span className={styles.cardDescription}>
						Devine le monstre du jour en comparant ses attributs
					</span>
				</Link>
			</div>
		</div>
	);
}
