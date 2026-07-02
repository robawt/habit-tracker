# Implementation Handoff — Habit Tracker Redesign

## Files to Read
- `DESIGN.md` — full visual direction
- `design-contract.md` — decision record
- `tailwind.config.ts` — current config
- `app/globals.css` — current global styles
- All files in `app/` and `components/` — current component code

## Token / Palette Constraints
- Use `xp-blue-*`, `xp-teal`, `xp-green*`, `xp-silver*`, `xp-gold`, `web-bg`, `retro-*` from the validated Tailwind config
- No modern palette (remove old-blue, old-yellow, old-navy)
- Blue accent only, gold for achievements only
- Warm silver-gray family, no neutral blue-grays

## Typography Constraints
- Headings: `'Trebuchet MS', 'Lucida Sans Unicode', sans-serif`
- Body: `Tahoma, Geneva, Verdana, sans-serif`
- Monospace: `'Courier New', 'Lucida Console', monospace`
- NO Inter, Geist, Satoshi, or modern fonts

## Layout Constraints
- Max-width container: 1200px
- Page background: web-bg (#C0C0C0)
- Card background: xp-silver (#ECE9D8)
- Use beveled borders, not box-shadows
- Grid gaps: 16px (gap-4)

## Bevel System
- `xp-raised`: `1px 1px 0 #fff, -1px -1px 0 #808080`
- `xp-sunken`: `inset 1px 1px 0 #808080, inset -1px -1px 0 #fff`
- `xp-window`: `2px 2px 0 #404040` for the outer window frame

## Component Rules
- Every button needs: raised bevel default, sunken bevel on active, lighter shade on hover
- Every card is a window frame: blue gradient title bar + silver body + raised border
- Every input is a sunken field: white background, inset bevel
- Navbar is an XP taskbar: teal gradient background, start-button on left
- Leaderboard is a detail list: column headers, alternating rows, no cards
- 88x31 buttons: small rectangular badges with bold text, used sparingly

## Responsive Requirements
- Works on mobile (stack vertically, reduce padding)
- Navigation collapses gracefully (start button + hamburger-style menu on very small screens)
- No horizontal overflow

## First Artifact Should Prove...
- That the XP window card pattern works with actual content (team list, habits)
- That the 3D bevel buttons look correct with hover/active states
- That the taskbar navigation feels right
- That fonts render acceptably on non-Windows systems
