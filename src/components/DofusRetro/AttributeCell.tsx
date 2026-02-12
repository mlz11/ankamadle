import type { AttributeFeedback } from "../../types";
import ArrowIcon from "./ArrowIcon";

interface Props {
	label: string;
	feedback: AttributeFeedback;
}

const STATUS_CLASS: Record<string, string> = {
	correct: "cell-correct",
	partial: "cell-partial",
	wrong: "cell-wrong",
};

export default function AttributeCell({ label, feedback }: Props) {
	return (
		<div className={`attribute-cell ${STATUS_CLASS[feedback.status]}`}>
			<span className="cell-label">{label}</span>
			<span className="cell-value">
				{feedback.value}
				<ArrowIcon direction={feedback.arrow} />
			</span>
		</div>
	);
}
