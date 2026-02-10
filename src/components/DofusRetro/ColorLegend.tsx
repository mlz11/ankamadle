export default function ColorLegend() {
	return (
		<div className="color-legend">
			<div className="color-legend-items">
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-correct" />
					Exact
				</span>
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-partial" />
					Proche
				</span>
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-wrong" />
					Mauvais
				</span>
				<span className="color-legend-item">
					<span className="color-legend-arrows">
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
						</svg>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							style={{ transform: "rotate(180deg)" }}
							aria-hidden="true"
						>
							<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
						</svg>
					</span>
					Plus haut / bas
				</span>
			</div>
		</div>
	);
}
