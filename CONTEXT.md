# Card Case Design

Card Case is an original static browser roguelite with a cycling card deck, a rotatable spatial equipment board, distinct enemies, event choices, three playable peoples, and d20 skill checks. Setting, cards, peoples, enemies, and rules are original; outside games are references for broad design ideas only.

## Run and route

- The player starts at **34 HP** and chooses one people plus one of six starting gear items—**锋刃**, **护符**, **回响棱镜**, **鹰眼镜片**, **荆棘甲片**, or **均衡核心**—to place on the 4 × 4 equipment board.
- The fixed 11-room route is: **荒径斥候**, **壁垒搬运工**, **塌陷的补给车**, **镜面决斗者 · 精英**, **裂甲重锤手**, **荒径修理站**, **齿轮窃贼**, **余烬狂犬**, **封锁的旧军械库**, **失联信号塔**, **铸炉守卫 · Boss**.
- **烬裔**: +3 on 气势 checks and +2 damage on the first attack of each battle. **岩裔**: +3 on 耐力 checks and prevents up to 3 damage on the first harmful hit of each battle. **机巧民**: +3 on 机巧 checks and draws one extra opening card per battle.
- Victories before the Boss offer one of three random rewards. Player health, deck additions, upgrades, and gear persist between rooms; enemy health/shield and temporary combat states reset for each fight.
- Four event rooms offer recovery, upgrades, card drafts/removal, or a d20 skill check at the sealed armory. Events do not trigger combat.
- Armory options use 耐力, 气势, or 机巧 against DC 14. A natural 20 always succeeds and unlocks a stronger reward selection; a natural 1 always fails and causes 7 damage. Other failed checks cause 4 damage. Check failure leaves at least 1 HP, so the run continues.

## Cycling deck

- Starter deck: three **轻击** (1 AP, 5 damage), two **格挡** (1 AP, 5 block), one **重击** (2 AP, 10 damage), and one **缴械** (1 AP, reduce the next enemy attack by 4).
- Draw five cards at battle start and each turn; the hand limit is six. 机巧民 draws one additional card at battle start. **坚壁** and **战术换手** cost 2 AP; the other card costs are unchanged. Play cards in any order while you can pay their AP cost.
- Played cards go to the discard pile. Unplayed cards are discarded at turn end. When the draw pile empties, shuffle the discard pile to make a new draw pile. Draw, discard, and total-deck counts are visible.
- Card rewards add attacks, blocks, draw effects, healing, or attack weakening. **战术换手** draws two; **穿甲刺** bypasses shield; **横扫** damages and weakens; **急救贴片** heals. The repair-station event can permanently remove a card.
- An attack readies +2 block on the next block; a block readies +3 damage on the next attack. Each combo triggers once and expires at turn end.

## Single-fight combat prototype

- **炉心决斗** is a standalone experiment for testing whether one replayable boss encounter is a stronger foundation than a long construction run. It does not replace the eleven-room game.
- The fixed 12-card starter deck contains eight attacks (including two free **探手**), two **架势**, and two **读招**. Draw four each round and spend up to 3 AP between cards and movement.
- The **炉心统领** previews attacks against one or more of three lanes. Moving to a safe lane costs 1 AP, completely avoids a normal telegraphed attack, and primes +4 damage on the next hit. The every-third-round, 14-damage **炉心过载** hits every lane; deal 14 damage before it resolves to interrupt it, otherwise armor reduces the blast.

## Event dice

- The armory's d20 check is deliberately limited to a high-stakes event. Routine combat remains readable and tactical rather than being decided by dice.
- The matching people grants +3 to its skill check; other checks have no modifier. Display the raw roll, modifier, total, and DC before resolving the choice.
- Critical success and failure use natural 20/1 respectively; otherwise meet or exceed DC. Success offers a choice of recovery, permanent run attack improvement, or a card draft. Critical success offers stronger rewards.

## Enemies

- **荒径斥候**: alternates 5/7 damage attacks.
- **壁垒搬运工**: begins with 4 shield, gains 5 shield during its guard intent, and attacks for 6/8.
- **镜面决斗者 · 精英**: attacks for 6/8; the stronger attack pierces 3 block. Each player attack is countered for 1 damage.
- **裂甲重锤手**: alternates 6 damage and a 10-damage attack that pierces 4 block.
- **齿轮窃贼**: alternates attacks with a 7-damage attack that reduces next-turn AP by 1.
- **余烬狂犬**: alternates attacks and fury hits; each fury hit permanently increases later fury damage by 2 for the fight.
- **铸炉守卫 · Boss**: starts with 6 shield; cycles a 7-damage attack, a 10-damage hit piercing 3 block, gaining 8 shield, and a 13-damage fury hit that increases by 2 after each use.
- Enemy intent, piercing, shields, counter damage, and AP disruption are exposed before ending a turn where applicable.

## Spatial equipment

- The board is 4 × 4. Gear occupies one to three cells, rotates in quarter-turns, cannot overlap, and must stay within the board.
- Press **R** to rotate selected gear; an on-screen control remains available. During reward placement, install the new gear first; then existing gear can be picked up and moved only onto empty space, without selecting other occupied gear during that move. The reward board remains open until the player finishes; **Escape** cancels a move.
- Distinct adjacent gear pairs resonate. At most two unique pairs each grant +1 attack and +1 block. Gear can improve attack, block, action points, counters, first attack, perfect-block reflection, or health.

## Language

**Original illustration**: Artwork created specifically for Card Case's own world, cards, enemies, and equipment.

**Sound effect**: A brief browser-generated audio cue for a game event, distinct from background music; players can mute effects, and the game has no background music.

## Controls and delivery

- Mouse/touch: choose a people and gear, play cards, end turn, choose rewards/events, roll checks, place/move gear.
- Keyboard: **R** rotates gear; **1–6** plays the matching current hand card; **Escape** cancels moving gear.
- Sound effects accompany card play, damage, blocking, gear placement, reward selection, and ending a turn; a toggle controls effects. No background music plays.
- Plain HTML/CSS/JS, static-hostable, no build step or runtime API. Do not push or alter the GitHub remote/cloud project without explicit authorization.
