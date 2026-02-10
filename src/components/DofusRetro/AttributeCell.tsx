import type { AttributeFeedback } from "../../types";

interface Props {
	label: string;
	feedback: AttributeFeedback;
	isNew?: boolean;
	index?: number;
}

const STATUS_CLASS: Record<string, string> = {
	correct: "cell-correct",
	partial: "cell-partial",
	wrong: "cell-wrong",
};

export default function AttributeCell({
	label,
	feedback,
	isNew,
	index = 0,
}: Props) {
	const arrowIcon =
		feedback.arrow === "up" ? "⬆️" : feedback.arrow === "down" ? "⬇️" : "";

	return (
		<div
			className={`attribute-cell ${STATUS_CLASS[feedback.status]} ${isNew ? "cell-flip" : ""}`}
			style={isNew ? { animationDelay: `${index * 100}ms` } : undefined}
		>
			<span className="cell-label">{label}</span>
			<span className="cell-value">
				{feedback.value} {arrowIcon}
			</span>
		</div>
	);
}
