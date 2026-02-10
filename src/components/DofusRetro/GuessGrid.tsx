import type { GuessResult } from "../../types";
import GuessRow from "./GuessRow";

interface Props {
	results: GuessResult[];
}

export default function GuessGrid({ results }: Props) {
	if (results.length === 0) return null;

	return (
		<div className="guess-grid">
			<div className="guess-grid-header">
				<div className="guess-monster-name header-label">Monstre</div>
				<div className="guess-cells">
					<div className="header-cell">Type</div>
					<div className="header-cell">Zone</div>
					<div className="header-cell">Niveau</div>
					<div className="header-cell">Couleur</div>
					<div className="header-cell">PV</div>
				</div>
			</div>
			{results.map((r, i) => (
				<GuessRow
					key={`${r.monster.id}-${i}`}
					result={r}
					isNew={i === results.length - 1}
				/>
			))}
		</div>
	);
}
