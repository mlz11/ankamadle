import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const raw = JSON.parse(
	readFileSync(join(__dirname, "solomonk-monsters.json"), "utf-8"),
);

const monsters = raw.map((m) => ({
	id: m.id,
	name: m.name,
	ecosystem: m.ecosystem,
	race: m.race,
	niveau_min: m.level_min,
	niveau_max: m.level_max,
	pv_min: m.hp_min,
	pv_max: m.hp_max,
	image: m.image,
}));

writeFileSync(
	join(__dirname, "..", "src", "data", "monsters.json"),
	JSON.stringify(monsters, null, "\t"),
);

console.log(`Wrote ${monsters.length} monsters`);
