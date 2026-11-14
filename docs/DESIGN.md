# Design system: "Path"

Find My School is drawn like a wayfinding system — the signs and route maps you follow in a metro — in a soft, warm palette. A family is on a route (elementary → middle → high school → university) and has to pick a line. Everything visual comes from that idea, so new screens should too.

All tokens live in `app/globals.css`. Use the token classes (`bg-surface`, `text-muted`, `bg-gold` …), never a hex colour in a component.

## Colour

A soft, warm palette built on five anchors: lavender `#e0ddf9`, dusty pink `#d2c1ce`, taupe `#ad9a93`, brown `#8f7769` and plum `#3c394c`.

| Token | Light | Use |
| --- | --- | --- |
| `background` | `#f4f1f8` | Page ground (lavender-white) |
| `surface` | `#fffdfb` | Plates: cards, header, panels |
| `foreground` / `muted` / `subtle` | plum inks | Text, strongest to quietest |
| `band` | `#3c394c` | The plum band: home scene, footer, compare tray. Dark in both themes |
| `accent` | `#5a569f` | **Public line** (indigo). Also primary buttons and links |
| `tone-private` | `#a44f77` | **Private line** (rose) |
| `tone-intl` | `#3b7c6e` | **International line** (sage) |
| `gold` | `#efc081` | Honey, "you are here": the current tab, selected chip, current quiz stop, best score. One honey button per screen at most |
| `pastel-*` | the anchors | Shapes and decoration only. Too pale for text |
| `ok` / `danger` | green / red | Verified, errors |

The three school types are three lines. A school always carries its line colour: the stripe on its card, its monogram, its map pin, the band on its profile, its column in Compare. Use `TYPE_FILL[type]` from `components/common/Badge.tsx`; never use a line colour for anything that isn't about school type (indigo is the one exception: it is also the action colour).

Dark mode follows the device (`prefers-color-scheme`) and is defined by the same tokens. Check both themes when you add a colour, and run a contrast check: soft colours fail WCAG easily.

## Type

- **Geologica** (`font-display`): headings, school names, numbers.
- **Commissioner** (`font-sans`): everything else.

Both include Mongolian Cyrillic (Ө, Ү) and the tugrik sign (₮). Use `.page-title` for the one big heading on a page, `.section-title` for blocks inside it, `.label` for small field names. Numbers that line up in columns get `tabular-nums`.

## Shapes and components

- `.plate` — the one container: white, 1px line, 16px radius. `.plate-link` when the whole plate is a link (it lifts slightly on hover).
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.btn-quiet`; add `.btn-sm` inside rows. Minimum height 44px (40px small) for touch.
- `.chip` — toggle pill; `aria-pressed="true"` or `.is-on` turns it gold.
- `.field` — inputs, selects, textareas.
- Stops and lines: a stop is a white circle with a 3px coloured ring; a line is a 6px bar. See `components/home/PathMap.tsx`, the quiz progress in `MatchQuiz.tsx`, and the ranked route on `/match`.
- Empty states use `components/common/EmptyState.tsx`: what is missing, why, and one action.

## Motion

The home page opens with a 3D scene you scroll through (`components/home/ScrollStory.tsx`): kinetic headline, three shapes that morph into blocks and then into stops on a road, and a camera that flies to "university". It is CSS 3D with one small script, no WebGL and no library, and it lives on the home page only. Keep 3D out of the working pages (search, profiles, compare).

Everywhere else, motion is short and purposeful: `.pop-in` for a panel that just opened, `.route-draw` / `.stop-in` for the home path map, `.reveal` for a section that eases in on scroll (CSS only). Nothing loops. `prefers-reduced-motion` turns all of it off.

## Rules

1. Every control does something real. No placeholder buttons, no fake numbers.
2. Unknown is said once, plainly ("Fees not listed"), not hidden and not guessed. Graduate destinations and achievements always carry the "not verified" note.
3. Text goes in `messages/en.json` and `messages/mn.json`, in both. Mongolian strings are often longer: check the layout in `mn`.
4. Check 375px, 820px and 1280px, in light and dark, before you call a screen done.
5. Keyboard and screen readers: real `<button>` and `<a>` elements, visible focus, labels on icon buttons. The pages pass axe (WCAG 2.2 AA); keep it that way.
