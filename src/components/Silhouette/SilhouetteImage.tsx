import { useCallback, useState } from "react";
import styles from "./SilhouetteImage.module.css";

interface Props {
	src: string;
	revealed: boolean;
}

export default function SilhouetteImage({ src, revealed }: Props) {
	const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

	const imgRef = useCallback(
		(img: HTMLImageElement | null) => {
			if (img?.complete && img.naturalWidth > 0) {
				setLoadedSrc(src);
			}
		},
		[src],
	);

	if (!src) return null;

	return (
		<div className={styles.container}>
			<div className={styles.frame}>
				<img
					ref={imgRef}
					src={src}
					alt={revealed ? "Monstre révélé" : "Silhouette du monstre"}
					className={`${styles.image} ${revealed ? styles.revealed : styles.silhouette}`}
					style={{
						visibility: loadedSrc === src || revealed ? "visible" : "hidden",
					}}
					onLoad={() => setLoadedSrc(src)}
				/>
			</div>
		</div>
	);
}
