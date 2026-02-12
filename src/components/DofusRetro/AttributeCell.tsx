import type { ArrowDirection, AttributeFeedback } from "../../types";

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

function ArrowIcon({ direction }: { direction: ArrowDirection }) {
	if (!direction) return null;
	const rotation = direction === "down" ? 180 : 0;
	return (
		<svg
			className="arrow-icon"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			style={{ transform: `rotate(${rotation}deg)` }}
			role="img"
			aria-label={direction === "up" ? "Plus haut" : "Plus bas"}
		>
			<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
		</svg>
	);
}

export default function AttributeCell({
	label,
	feedback,
	isNew,
	index = 0,
}: Props) {
	return (
		<div
			className={`attribute-cell ${STATUS_CLASS[feedback.status]} ${isNew ? "cell-flip" : ""}`}
			style={isNew ? { animationDelay: `${index * 200}ms` } : undefined}
		>
			<span className="cell-label">{label}</span>
			<span className="cell-value">
				{feedback.value}
				<ArrowIcon direction={feedback.arrow} />
			</span>
		</div>
	);
}
