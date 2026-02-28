import type { Monster } from "../../types";
import styles from "./WrongGuessList.module.css";

interface Props {
	guesses: Monster[];
	winner?: Monster | undefined;
}

export default function WrongGuessList({ guesses, winner }: Props) {
	if (guesses.length === 0 && !winner) return null;

	const items = [...guesses].reverse();

	return (
		<div className={styles.list}>
			{winner && (
				<div className={`${styles.guess} ${styles.correct}`}>
					{winner.image && (
						<img src={winner.image} alt="" className={styles.guessImg} />
					)}
					<span className={styles.guessName}>{winner.name}</span>
				</div>
			)}
			{items.map((m) => (
				<div key={m.id} className={styles.guess}>
					{m.image && <img src={m.image} alt="" className={styles.guessImg} />}
					<span className={styles.guessName}>{m.name}</span>
				</div>
			))}
		</div>
	);
}
