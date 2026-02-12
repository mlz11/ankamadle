import type { GuessResult } from "../../types";
import AttributeCell from "./AttributeCell";

interface Props {
	result: GuessResult;
	isNew?: boolean;
}

export default function GuessRow({ result, isNew }: Props) {
	return (
		<div className={`guess-row ${isNew ? "row-animating" : ""}`}>
			<div className="guess-monster-name">
				{result.monster.image && (
					<img
						src={result.monster.image}
						alt=""
						className="guess-monster-img"
					/>
				)}
				<span>{result.monster.name}</span>
			</div>
			<div className="guess-cells">
				<AttributeCell
					label="Écosystème"
					feedback={result.feedback.ecosystem}
				/>
				<AttributeCell label="Race" feedback={result.feedback.race} />
				<AttributeCell label="Couleur" feedback={result.feedback.couleur} />
				<AttributeCell label="Niveau max" feedback={result.feedback.niveau} />
				<AttributeCell label="PV max" feedback={result.feedback.pv} />
			</div>
		</div>
	);
}
