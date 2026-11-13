# Design system: "Path"

Find My School is drawn like a wayfinding system — the signs and route maps you follow in a metro. A family is on a route (elementary → middle → high school → university) and has to pick a line. Everything visual comes from that idea, so new screens should too.

All tokens live in `app/globals.css`. Use the token classes (`bg-surface`, `text-muted`, `bg-gold` …), never a hex colour in a component.

## Colour

| Token | Light | Use |
| --- | --- | --- |
| `background` | `#edf0f5` | Page ground ("pavement") |
| `surface` | `#ffffff` | Plates: cards, header, panels |
| `foreground` / `muted` / `subtle` | navy inks | Text, strongest to quietest |
| `band` | `#131c45` | The navy band: home hero, footer, compare tray. Dark in both themes |
| `accent` | `#1b45d6` | **Public line.** Also primary buttons and links |
| `tone-private` | `#b4246f` | **Private line** |
| `tone-intl` | `#0a7c66` | **International line** |
| `gold` | `#ffc629` | "You are here": the current tab, selected chip, current quiz stop, best score. One gold button per screen at most |
| `ok` / `danger` | green / red | Verified, errors |

The three school types are three lines. A school always carries its line colour: the stripe on its card, its monogram, its map pin, the band on its profile, its column in Compare. Use `TYPE_FILL[type]` from `components/common/Badge.tsx`; never use a line colour for anything that isn't about school type (blue is the one exception: it is also the action colour).

Dark mode follows the device (`prefers-color-scheme`) and is defined by the same tokens. Check both themes when you add a colour.

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

Short and purposeful: `.pop-in` for a panel that just opened, `.route-draw` / `.stop-in` for the home path map, `.reveal` for a section that eases in on scroll (CSS only). Nothing loops. `prefers-reduced-motion` turns all of it off.

## Rules

1. Every control does something real. No placeholder buttons, no fake numbers.
2. Unknown is said once, plainly ("Fees not listed"), not hidden and not guessed. Graduate destinations and achievements always carry the "not verified" note.
3. Text goes in `messages/en.json` and `messages/mn.json`, in both. Mongolian strings are often longer: check the layout in `mn`.
4. Check 375px, 820px and 1280px, in light and dark, before you call a screen done.
5. Keyboard and screen readers: real `<button>` and `<a>` elements, visible focus, labels on icon buttons. The pages pass axe (WCAG 2.2 AA); keep it that way.
