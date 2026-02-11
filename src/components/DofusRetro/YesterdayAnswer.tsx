import type { Monster } from "../../types";

interface Props {
	monster: Monster;
}

export default function YesterdayAnswer({ monster }: Props) {
	return (
		<div className="yesterday-answer">
			{monster.image && (
				<img
					className="yesterday-answer-img"
					src={monster.image}
					alt={monster.name}
				/>
			)}
			<p>
				Le monstre d'hier était <strong>{monster.name}</strong>
			</p>
		</div>
	);
}
