import { useEffect } from "react";
import styles from "./DuplicateBanner.module.css";

const AUTO_DISMISS_MS = 5000;

interface Props {
	onDismiss: () => void;
}

export default function DuplicateBanner({ onDismiss }: Props) {
	useEffect(() => {
		const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<output className={styles.banner} onClick={onDismiss} onKeyDown={onDismiss}>
			Mêmes attributs, mais ce n'est pas le bon monstre. Essaie encore !
		</output>
	);
}
