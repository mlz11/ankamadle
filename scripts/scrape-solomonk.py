#!/usr/bin/env python3
"""
Scrape monster data from Solomonk.fr for Dofusdle.

Fetches all monsters from the bestiary AJAX endpoint and extracts:
- id, name, ecosystem, race, zone (subarea), level range, HP range,
  image URL, resistances, PA, PM, XP, and archmonster name.

Outputs a JSON file with all scraped data.

Usage:
    python3 scripts/scrape-solomonk.py
"""

import json
import re
import sys
import time
import urllib.request
from html import unescape
from html.parser import HTMLParser

BASE_URL = "https://solomonk.fr/ajax/select_monster.php"
HEADERS = {
    "Referer": "https://solomonk.fr/fr/monstres/chercher",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}
BATCH_SIZE = 10
DELAY = 0.5  # seconds between requests, be polite


def fetch_batch(offset: int) -> dict | None:
    params = (
        f"lang=fr&Q={BATCH_SIZE}&O={offset}&T=all"
        f"&F%5BS%5D=undefined"
        f"&CS%5B%5D=0&CS%5B%5D=0&CS%5B%5D=0&CS%5B%5D=0&CS%5B%5D=0"
    )
    url = f"{BASE_URL}?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if not data.get("html"):
                return None
            return data
    except Exception as e:
        print(f"  Error fetching offset {offset}: {e}", file=sys.stderr)
        return None


def parse_monsters(html: str) -> list[dict]:
    """Parse monster entries from the HTML fragment."""
    monsters = []

    # Split by monster container divs
    # Each monster block starts with: <div class="container-fluid mt-4" data-mob="">
    blocks = re.split(r'<div class="container-fluid mt-4" data-mob="">', html)

    for block in blocks[1:]:  # skip first empty split
        monster = parse_monster_block(block)
        if monster:
            monsters.append(monster)

    return monsters


def parse_monster_block(block: str) -> dict | None:
    """Extract data from a single monster HTML block."""
    monster = {}

    # Monster ID and name from the link:
    # <a class="text-sololightbeige" href="https://solomonk.fr/fr/monstre/31/larve-bleue">Larve Bleue</a>
    name_match = re.search(
        r'<a class="text-sololightbeige" href="https://solomonk\.fr/fr/monstre/(\d+)/[^"]*">([^<]+)</a>',
        block,
    )
    if not name_match:
        return None

    monster["id"] = int(name_match.group(1))
    monster["name"] = unescape(name_match.group(2))

    # Archmonster name (optional)
    arch_match = re.search(
        r'<a class="text-solobrown" href="https://solomonk\.fr/fr/monstre/\d+/[^"]*">([^<]+)</a>',
        block,
    )
    if arch_match:
        monster["archmonster"] = unescape(arch_match.group(1))

    # Image URL
    img_match = re.search(r'<img src="(https://solomonk\.fr/img/monsters/artworks/[^"]+)"', block)
    if img_match:
        monster["image"] = img_match.group(1)

    # Ecosystem
    eco_match = re.search(
        r'Ecosyst[eè]me: <a[^>]*class="text-solobrown"[^>]*>([^<]+)</a>', block
    )
    if eco_match:
        monster["ecosystem"] = unescape(eco_match.group(1))

    # Race
    race_match = re.search(
        r'Race: <a[^>]*class="text-solobrown"[^>]*>([^<]+)</a>', block
    )
    if race_match:
        monster["race"] = unescape(race_match.group(1))

    # Level (from the Niv. span)
    level_match = re.search(
        r'Niv\.<span[^>]*data-rank-1=(\d+)[^>]*data-rank-5=(\d+)[^>]*>',
        block,
    )
    if level_match:
        monster["level_min"] = int(level_match.group(1))
        monster["level_max"] = int(level_match.group(2))

    # Stats from icon-entity elements
    # HP (vita)
    vita_match = re.search(
        r'icon-vita"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)', block
    )
    if vita_match:
        monster["hp_min"] = int(vita_match.group(1))
        monster["hp_max"] = int(vita_match.group(2))

    # PA
    pa_match = re.search(
        r'icon-pa"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)', block
    )
    if pa_match:
        monster["pa_min"] = int(pa_match.group(1))
        monster["pa_max"] = int(pa_match.group(2))

    # PM
    pm_match = re.search(
        r'icon-pm"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)', block
    )
    if pm_match:
        monster["pm_min"] = int(pm_match.group(1))
        monster["pm_max"] = int(pm_match.group(2))

    # XP
    xp_match = re.search(
        r'icon-xp"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)', block
    )
    if xp_match:
        monster["xp_min"] = int(xp_match.group(1))
        monster["xp_max"] = int(xp_match.group(2))

    # Initiative
    init_match = re.search(
        r'icon-init"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)', block
    )
    if init_match:
        monster["initiative_min"] = int(init_match.group(1))
        monster["initiative_max"] = int(init_match.group(2))

    # Resistances (percentage values in spans inside icon-* lis)
    for element, key in [
        ("neutral", "res_neutral"),
        ("earth", "res_earth"),
        ("fire", "res_fire"),
        ("water", "res_water"),
        ("air", "res_air"),
    ]:
        res_match = re.search(
            rf'icon-{element}"><span[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)',
            block,
        )
        if res_match:
            monster[f"{key}_min"] = int(res_match.group(1))
            monster[f"{key}_max"] = int(res_match.group(2))

    # Element bonuses (damage bonuses)
    for element, key in [
        ("earthbonus", "bonus_earth"),
        ("firebonus", "bonus_fire"),
        ("waterbonus", "bonus_water"),
        ("airbonus", "bonus_air"),
    ]:
        bonus_match = re.search(
            rf'icon-{element}"[^>]*data-rank-1=(-?\d+)[^>]*data-rank-5=(-?\d+)',
            block,
        )
        if bonus_match:
            monster[f"{key}_min"] = int(bonus_match.group(1))
            monster[f"{key}_max"] = int(bonus_match.group(2))

    # Drops section - extract zone/subarea from drop links if present
    # (zone info may come from drops or from a separate section)

    return monster


def main():
    all_monsters = []
    seen_ids = set()
    offset = 0
    empty_count = 0

    print("Scraping Solomonk.fr bestiary...", file=sys.stderr)

    while empty_count < 3:
        print(f"  Fetching offset {offset}...", file=sys.stderr, end="")
        data = fetch_batch(offset)

        if data is None:
            print(" empty/error", file=sys.stderr)
            empty_count += 1
            offset += BATCH_SIZE
            time.sleep(DELAY)
            continue

        empty_count = 0
        monsters = parse_monsters(data["html"])
        new_count = 0

        for m in monsters:
            if m["id"] not in seen_ids:
                seen_ids.add(m["id"])
                all_monsters.append(m)
                new_count += 1

        print(f" got {len(monsters)} monsters ({new_count} new)", file=sys.stderr)

        offset = data.get("offset", offset + BATCH_SIZE)
        time.sleep(DELAY)

    # Sort by ID
    all_monsters.sort(key=lambda m: m["id"])

    print(f"\nTotal unique monsters: {len(all_monsters)}", file=sys.stderr)

    # Write to stdout
    json.dump(all_monsters, sys.stdout, ensure_ascii=False, indent=2)
    print()  # trailing newline


if __name__ == "__main__":
    main()
