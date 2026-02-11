import { useEffect, useRef, useState } from "react";

export default function Footer() {
	const [showInfo, setShowInfo] = useState(false);
	const btnRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!showInfo) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" || e.key === "Enter") {
				setShowInfo(false);
				btnRef.current?.blur();
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [showInfo]);

	return (
		<footer className="app-footer">
			<button
				ref={btnRef}
				type="button"
				className="footer-info-btn"
				onClick={() => setShowInfo((v) => !v)}
			>
				À propos / Mentions légales
			</button>
			{showInfo && (
				<div
					role="presentation"
					className="rules-overlay"
					onClick={() => setShowInfo(false)}
				>
					<div
						role="presentation"
						className="rules-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2>À propos</h2>
						<p>
							Dofus est un jeu édité par <strong>Ankama Games</strong>. Toutes
							les images, noms de monstres et données de jeu sont la propriété
							d'Ankama. Ce site n'est ni affilié, ni approuvé par Ankama.
						</p>
						<p>
							Données issues de{" "}
							<a
								href="https://solomonk.fr/"
								target="_blank"
								rel="noopener noreferrer"
							>
								solomonk.fr
							</a>{" "}
							et{" "}
							<a
								href="https://wiki-dofus.eu/"
								target="_blank"
								rel="noopener noreferrer"
							>
								wiki-dofus.eu
							</a>
							. Inspiré de{" "}
							<a
								href="https://www.nytimes.com/games/wordle"
								target="_blank"
								rel="noopener noreferrer"
							>
								Wordle
							</a>{" "}
							et{" "}
							<a
								href="https://loldle.net/"
								target="_blank"
								rel="noopener noreferrer"
							>
								LoLdle
							</a>
							.
						</p>
						<button
							type="button"
							className="rules-close-btn"
							onClick={() => setShowInfo(false)}
						>
							Fermer
						</button>
					</div>
				</div>
			)}
		</footer>
	);
}
