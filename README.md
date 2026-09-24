# Card Case

Card Case is an original, static browser-playable card-combat roguelite. Choose a lineage with a distinct combat talent and d20-check specialty, arrange a rotatable 4 × 4 gear board, and build a cycling deck as you cross an eleven-node route of battles and events. Read enemy intentions, make event choices, and roll against a difficulty class when you take a risky path. No build step, game server, or runtime API is required.

## Play

Open `index.html`, or serve this directory locally:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Current systems

- Draw five cards each turn from a deck/discard cycle, with a hand limit of six. 机巧民 draws one extra card at battle start. Played and unplayed cards are discarded at turn end; when the draw pile runs out, the discard pile is shuffled back in.
- Add attacks, blocks, tactical debuffs, healing, and draw effects to your deck. Events can draft or remove cards.
- Choose one of six starting gear items: 锋刃, 护符, 回响棱镜, 鹰眼镜片, 荆棘甲片, or 均衡核心. Build around the 4 × 4 equipment board; gear occupies space, rotates with **R** (or the on-screen button), and adjacent items can resonate. After installing a gear reward, rearrange existing gear before continuing.
- Fight shielded, retaliating, armor-piercing, action-disrupting, and escalating enemies. Each card, enemy, and gear type has an original etched-style SVG illustration. Read each enemy's intent before ending your turn; a generated sound-effects toggle is available during combat.
- Visit the supply cart, repair station, signal tower, and sealed armory for recovery, upgrades, card selection/removal, or a d20 ability check.
- Choose one of three original lineages: 烬裔 adds +2 damage to its first attack in each battle and gets +3 on 气势 checks; 岩裔 prevents 3 damage the first time it is hurt in each battle and gets +3 on 耐力 checks; 机巧民 draws one extra opening card and gets +3 on 机巧 checks.
- 坚壁 and 战术换手 cost 2 AP; other card costs are unchanged. **R** rotates gear, **1–6** plays the matching hand card, and **Escape** cancels gear movement. Roll a d20 for the armory's 耐力、气势, or 机巧 check (DC 14). A natural 20 is a critical success; a natural 1 is a critical failure. Success unlocks a reward choice; failure costs health but cannot immediately end the run.

The setting, peoples, card content, enemies, mechanics, and SVG illustrations are original. Dice apply to event checks rather than replacing tactical card combat. The deck cycle and spatial equipment board use broad genre ideas without reproducing another game's content.

## Publish

The project is published as a static site at [couldes.github.io/card-case](https://couldes.github.io/card-case/). It can also be hosted on GitHub Pages or another static-file host; no build step or runtime API is needed.
