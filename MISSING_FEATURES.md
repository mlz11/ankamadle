# Ankamadle — Missing Features vs. Narutodle / LoLdle

Comparison based on LoLdle (loldle.net) and Narutodle (narutodle.com), the two main references for anime/game -dle games.

---

## 1. Cell Flip / Reveal Animation

**LoLdle/Narutodle**: Cells flip one-by-one left to right with a 3D card-flip animation (like Wordle tiles). Each cell has a slight stagger delay creating a cascade reveal effect.

**Ours**: Simple `slideIn` from top. No per-cell staggered reveal.

---

## 2. Character Image in Guess Row

**LoLdle**: First column of every guess row shows the **champion portrait** (square image). The autocomplete dropdown also shows portraits next to names.

**Ours**: Text-only. No monster images anywhere.

---

## 3. Color Legend / Indicator Guide

**LoLdle**: Shows a floating "Indicateurs de couleur" box after the first guess — explains green/orange/red/arrows. Always visible during play.

**Ours**: Only explained in the rules modal (hidden behind `?` button). New players won't know what colors mean.

---

## 4. Submit Button

**LoLdle/Narutodle**: Styled circular send/arrow button next to the input field.

**Ours**: No submit button — relies only on dropdown click. No way to submit via a visible button.

---

## 5. Player Counter / Social Proof

**LoLdle**: Shows "46403 personnes ont déjà trouvé !" — how many people already solved today's puzzle.

**Ours**: Nothing. No social proof or community feel.

---

## 6. Yesterday's Answer

**LoLdle**: "Le champion d'hier était #1313 Sylas" displayed below the game.

**Ours**: Nothing. Players can't see what they missed.

---

## 7. Countdown Timer to Next Puzzle

**Narutodle/LoLdle**: Countdown showing hours/minutes/seconds until the next daily puzzle (resets at midnight or 06:00 UTC).

**Ours**: Nothing. After winning, players don't know when the next one is.

---

## 8. Game Mode Tabs / Navigation

**LoLdle**: 5 game mode icons (Classique, Citation, Compétence, Emoji, Splash) as a tab bar.
**Narutodle**: 4 modes (Classic, Jutsu, Quote, Eye).

**Ours**: Just one mode, no mode selector UI (fine for now, but no infrastructure for it).

---

## 9. Settings / Gear Icon

**LoLdle**: Settings gear in the header for dark mode toggle, language, etc.

**Ours**: No settings at all.

---

## 10. Background Art / Visual Identity

**LoLdle**: Full-bleed game artwork as background image, styled logo with game-themed font.

**Ours**: Plain dark CSS background, plain text title (gradient but no game personality).

---

## 11. Streak / Stats in Header Area

**Narutodle**: Fire emoji streak counter and "Won Days" visible in the header bar at all times, not just in the victory modal.
**LoLdle**: Stats/counter icons always visible in toolbar.

**Ours**: Stats only visible after winning in the victory modal.

---

## 12. Autocomplete with Images

**LoLdle**: Dropdown shows champion portrait + name.

**Ours**: Text-only dropdown.

---

## 13. Guess Counter Badge

**LoLdle**: Shows a numbered badge (e.g. "0") in the toolbar indicating current guess count.

**Ours**: No visible guess counter.

---

## 14. Shake Animation on Invalid Input

**Wordle standard**: Input field shakes when submitting an invalid/empty guess.

**Ours**: Nothing — invalid input is silently ignored.

---

## 15. Toast Notifications

**Wordle/LoLdle**: Small toast messages ("Not in list", "Copied!", etc.) that pop up and disappear.

**Ours**: No toast system.

---

## 16. Confetti / Victory Celebration

**Narutodle**: Animated effects on win.
**Wordle**: Bounce animation on winning row tiles.

**Ours**: Just a modal that pops up. No celebration feeling.

---

## 17. Changelog / Patch Notes

**LoLdle**: Changelog icon in toolbar so players see what's new.

**Ours**: Nothing.

---

## 18. Progressive Image Reveal (future mode)

**Narutodle**: Eye mode (zoomed-in image that zooms out on each wrong guess), Jutsu mode (blurry GIF that sharpens).

**Ours**: Out of scope but worth noting for the architecture.

---

## Priority Ranking

| Priority | Feature | Impact |
|----------|---------|--------|
| **P0** | Cell flip animation (staggered per-cell) | Core game feel |
| **P0** | Countdown timer to next puzzle | Retention hook |
| **P0** | Color legend visible during play | Usability |
| **P1** | Yesterday's answer | Engagement |
| **P1** | Submit button next to input | UX clarity |
| **P1** | Toast notifications | Polish |
| **P1** | Shake on invalid input | Polish |
| **P1** | Confetti on victory | Dopamine |
| **P2** | Streak display in header | Engagement |
| **P2** | Guess counter badge | Awareness |
| **P2** | Background art / themed logo | Visual identity |
| **P2** | Monster images in rows + autocomplete | Visual richness (needs sprites) |
| **P3** | Player counter / social proof | Community feel (needs backend) |
| **P3** | Settings panel | Nice-to-have |
