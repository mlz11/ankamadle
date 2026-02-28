import styles from "./SilhouetteImage.module.css";

interface Props {
	src: string;
	revealed: boolean;
}

export default function SilhouetteImage({ src, revealed }: Props) {
	if (!src) return null;

	return (
		<div className={styles.container}>
			<img
				src={src}
				alt={revealed ? "Monstre révélé" : "Silhouette du monstre"}
				className={`${styles.image} ${revealed ? "" : styles.silhouette}`}
			/>
		</div>
	);
}
