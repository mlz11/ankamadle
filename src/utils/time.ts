export function getTimeUntilMidnightParis(): string {
	const now = new Date();
	const parisNow = new Date(
		now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
	);
	const midnightParis = new Date(parisNow);
	midnightParis.setHours(24, 0, 0, 0);
	const diff = midnightParis.getTime() - parisNow.getTime();
	const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
	const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
	const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
	return `${h}:${m}:${s}`;
}
