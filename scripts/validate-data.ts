import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MonsterSchema } from "../src/schemas";

const filePath = resolve(import.meta.dirname, "../src/data/monsters.json");
const raw = JSON.parse(readFileSync(filePath, "utf-8"));

const result = MonsterSchema.array().safeParse(raw);

if (!result.success) {
	console.error("monsters.json validation failed:");
	for (const issue of result.error.issues) {
		console.error(`  [${issue.path.join(".")}] ${issue.message}`);
	}
	process.exit(1);
}

const ids = result.data.map((m) => m.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicates.length > 0) {
	console.error(
		`Duplicate monster IDs found: ${[...new Set(duplicates)].join(", ")}`,
	);
	process.exit(1);
}

console.log(`monsters.json is valid (${result.data.length} monsters)`);
