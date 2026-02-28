import type { Monster } from "../../types";
import styles from "./WrongGuessList.module.css";

interface Props {
	guesses: Monster[];
}

export default function WrongGuessList({ guesses }: Props) {
	if (guesses.length === 0) return null;

	return (
		<div className={styles.list}>
			{[...guesses].reverse().map((m) => (
				<div key={m.id} className={styles.guess}>
					{m.image && <img src={m.image} alt="" className={styles.guessImg} />}
					<span className={styles.guessName}>{m.name}</span>
					<svg
						className={styles.crossIcon}
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--wrong)"
						strokeWidth="3"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<line x1="6" y1="6" x2="18" y2="18" />
						<line x1="18" y1="6" x2="6" y2="18" />
					</svg>
				</div>
			))}
		</div>
	);
}
