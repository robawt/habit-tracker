# Design Contract — Decision Record

## Goal
Redesign the Habit Tracker web app to a Windows XP / Y2K / old-internet aesthetic while preserving all existing functionality (auth, team management, habit tracking, check-ins, leaderboard, profiles).

## Target Artifacts
- All pages and components in `app/` and `components/`
- Tailwind config, global CSS
- Layout system and navigation

## Evidence Table

| Evidence | Type | Confidence |
|----------|------|------------|
| User's reference to "retro javascript old internet blogposts type, windows xp y2k aesthetic" | `provided` | High |
| User's URL reference `https://anlucas.neocities.org/88x31Buttons` | `provided` | High |
| User's attached screenshots of Y2K/retro aesthetic | `provided` | High |
| Current app uses retro pixel-art theme (navy/yellow, hard shadows) | `observed` | High |
| Existing codebase structure (Next.js 14, Tailwind 3, Supabase) | `observed` | High |
| macOS/Windows compatibility requirement | `inferred` | Medium |

## Keep / Change / Do Not Copy

### Keep from current design
- Retro non-modern feel (appropriate to maintain some pixel-art DNA)
- Bold color contrast
- Thick border treatment
- The existing color family actually already leans retro — we're just pivoting to XP/Y2K instead of pixel-art

### Change
- Color palette: navy/yellow pixel → XP Luna blue/silver/green
- Shadows: hard pixel shadow → Windows beveled 3D borders
- Fonts: Segoe UI → Tahoma + Trebuchet MS
- Card style: white card with shadow → silver window frame with title bar
- Navigation: modern link bar → XP taskbar with start button
- Buttons: hard pixel → 3D raised/sunken bevel
- Inputs: border-2 → sunken inset fields
- Background: cream/yellow → classic web gray

### Do Not Copy
- No direct UI cloning of Windows XP operating system
- No Microsoft branding, logos, or trademarked assets
- No literal "Start" menu dropdown — use the visual language without implementing a full OS shell
- No Wingdings/Webdings font for functional text
- No actual 88x31 buttons from the reference site — create original ones with similar style

## Final Design Stance

One coherent direction: **"What if Windows XP Luna made a web app for tracking habits, and it lived on a Geocities-style page?"** The app should be immediately recognized as retro/Y2K without copying any single existing product. The silver/blue/green XP palette combined with old-web elements (88x31 badges, Trebuchet headers, web-gray backgrounds) creates a distinct, nostalgic identity that stands apart from both modern flat design and the current pixel-art theme.

## Risks and Unknowns

| Risk | Mitigation |
|------|------------|
| XP aesthetic may feel dated on macOS | Tahoma and Trebuchet MS are available on macOS. Test on both platforms |
| Beveled 3D borders look clunky on modern screens | That's the point — embrace the chunky look as intentional retro |
| Too much deviation from the existing pixel theme | The old-retro DNA is preserved; this is a pivot within the same family |
| Adding 88x31 buttons could feel tacked on | Use them sparingly as achievement badges in the leaderboard sidebar |
| Font rendering differs across OS | Use a web-safe font stack with fallbacks |

## Quality Gate Checklist

- [ ] All pages load without errors
- [ ] Auth flow works (login, signup, magic link, callback)
- [ ] Team creation and joining works
- [ ] Habit creation and check-in works
- [ ] Leaderboard updates in real time
- [ ] Profile editing works
- [ ] Navigation works on all pages
- [ ] Responsive layout doesn't break on mobile
- [ ] No console errors
- [ ] All interactive states work (hover, active, focus, disabled)
- [ ] 88x31 badges display correctly
