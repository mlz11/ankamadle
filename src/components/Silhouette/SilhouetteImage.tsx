import { useState } from "react";
import styles from "./SilhouetteImage.module.css";

interface Props {
	src: string;
	revealed: boolean;
}

export default function SilhouetteImage({ src, revealed }: Props) {
	const [loaded, setLoaded] = useState(false);

	if (!src) return null;

	return (
		<div className={styles.container}>
			<div className={styles.frame}>
				<img
					src={src}
					alt={revealed ? "Monstre révélé" : "Silhouette du monstre"}
					className={`${styles.image} ${revealed ? styles.revealed : styles.silhouette}`}
					style={{ visibility: loaded || revealed ? "visible" : "hidden" }}
					onLoad={() => setLoaded(true)}
				/>
			</div>
		</div>
	);
}
