import { useEffect } from "react";

const DEFAULT_KEYS = ["Escape"];

export function useCloseOnKey(
	isOpen: boolean,
	onClose: () => void,
	keys: string[] = DEFAULT_KEYS,
) {
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (keys.includes(e.key)) onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose, keys]);
}
