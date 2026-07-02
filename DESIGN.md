# Habit Tracker — Reference Design Contract

## 1. Visual Theme & Atmosphere

**Windows XP Luna / Old Internet Y2K**

The app evokes the feeling of a Windows XP desktop crossed with the early-2000s web — nostalgic, tactile, playful, and slightly chunky. It should feel like a utility you'd find on a Y2K-era computer: taskbars with start buttons, beveled panel borders, window-frame cards, and web-graphic accents like 88x31 badges. The overall mood is warm, inviting, and fun — not sleek or modern. Functionality is front and center, presented with the honest, unpolished charm of early-2000s software.

**Reference sources:**
- Windows XP Luna theme (taskbar, start menu, window chrome, button bevels)
- Geocities/Angelfire personal sites (88x31 button badges, guestbook aesthetics, bold color blocks)
- NeoCities retro web directory (button collections, pixel borders, handcrafted web graphics)
- Y2K design language (glossy surfaces, teal/silver gradients, futuristic geometric shapes)

---

## 2. Color

**Primary palette (XP Luna + web retro):**

| Token | Hex | Usage |
|-------|-----|-------|
| `xp-blue-500` | `#0055E5` | Window title bars, primary actions, links |
| `xp-blue-700` | `#00338A` | Title bar hover, active window |
| `xp-teal` | `#3A6EA5` | Taskbar background gradient middle |
| `xp-green` | `#2E8B57` | Start button green, success states |
| `xp-green-dark` | `#1E6B3E` | Start button hover |
| `xp-silver` | `#ECE9D8` | Window/panel background (classic silver) |
| `xp-silver-light` | `#F5F3ED` | Lighter panel surfaces |
| `xp-silver-dark` | `#D4C8B8` | Pressed/active surfaces |
| `xp-gold` | `#FFCC00` | Star badges, highlights, accent |
| `web-bg` | `#C0C0C0` | Classic web gray page background |
| `retro-magenta` | `#FF00FF` | Y2K accent (sparingly, for decorative elements) |
| `retro-lime` | `#00FF00` | Retro web accent (sparingly) |
| `retro-cyan` | `#00CCFF` | Y2K futuristic accent |

**Surface hierarchy:**
- Page background: `web-bg` (#C0C0C0) — classic web gray
- Card/window background: `xp-silver` (#ECE9D8) — beveled panel
- Input background: white — sunken text field
- Window title bar: `xp-blue-500` gradient to `xp-blue-700`
- Selected/highlighted: `xp-blue-500` with white text
- Success/checked-in: `xp-green` tones

**Rule:** One consistent gray family (warm silver-beige). No mixing warm/cool grays. Blue is the accent color. Gold is used for special achievements/stars only.

---

## 3. Typography

- **Headings:** `'Trebuchet MS', 'Lucida Sans Unicode', sans-serif` — classic old-web sans-serif, wide and friendly
- **Body text:** `Tahoma, Geneva, Verdana, sans-serif` — the Windows XP system font
- **Monospace/code:** `'Courier New', 'Lucida Console', monospace` — classic web monospace
- **UI labels/buttons:** `Tahoma` — matches XP UI conventions

**Scale:**
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Display/hero | 2.5rem (40px) | Bold | Title bar text |
| Section heading | 1.25rem (20px) | Bold | XP window title |
| Subheading | 1rem (16px) | Bold | Panel headers |
| Body | 0.875rem (14px) | Normal | XP default |
| Small/caption | 0.75rem (12px) | Normal | Status bar text |

**Avoid:** Inter, Geist, or modern geometric sans-serif fonts. The retro feel depends on using era-appropriate typefaces.

---

## 4. Spacing & Grid

- **Base unit:** 4px (Tailwind default)
- **Container max-width:** 1200px (keeps pages from feeling empty on wide screens)
- **Card padding:** 24px (p-6)
- **Section spacing:** 32px (space-y-8)
- **Grid gaps:** 16px (gap-4)

**Bevel rules:**
- Raised panels get `1px white top-left + 1px #808080 bottom-right`
- Sunken fields get `inset 1px #808080 top-left + inset 1px white bottom-right`
- Window frames get a 2px dark outer border for depth

---

## 5. Layout & Composition

- **Navigation:** XP taskbar at the *top* of the page, spanning full width, with a Start-button-style logo on the left and system tray elements (profile, sign out) on the right
- **Content area:** Centered column with generous whitespace, sitting on the classic web gray background
- **Cards:** Treated as Windows/panels with a title bar gradient at top, beveled silver body
- **Forms:** Use XP-style property sheets — labeled fields with sunken text inputs, buttons aligned bottom-right
- **Leaderboard:** Detail list view with columns, alternating row backgrounds (white/silver), like Windows Explorer
- **Habit list:** Checklist-style cards with XP radio-button-style check indicators
- **88x31 buttons:** Used as decorative badges for achievements, team logos, or fun web-retro touches

**Layout rules:**
- No modern card grid patterns (3-equal-columns). Use 2-column or full-width panels
- Content should not stretch edge-to-edge — use max-width container
- Buttons bottom-aligned in card groups

---

## 6. Components

### Buttons (XP 3D raised)
- Background: gradient (light to dark on the same hue)
- Border: 1px white top/left, 1px dark gray bottom/right (raised bevel)
- Hover: slight color shift
- Active/pressed: inverted bevel (sunken)
- Primary: XP blue gradient
- Success: XP green gradient (start button style)
- Disabled: grayed out, no bevel

### Window Frame (Card)
- Title bar: 24px tall, blue gradient (#0055E5 to #00338A), white bold text
- Close/minimize/maximize buttons: small squares in top-right of title bar
- Body: silver (#ECE9D8) background, raised bevel border
- Optional: status bar at bottom with subtle sunken border

### Input Fields (Sunken)
- Border: inset 1px dark gray top/left, inset 1px white bottom/right
- Background: white
- Focus: XP blue border highlight
- Disabled: gray background, no bevel

### Navigation (Taskbar)
- XP-green start button on left: rounded left edge, gradient green background, white bold text
- Nav links as toolbar buttons: raised bevel, active state = sunken
- System tray on right: clock, profile icon, sign out
- Taskbar background: gradient (teal → lighter teal)

### Badges (88x31 style)
- Small rectangular buttons with old-web aesthetic
- Used for: habit streak levels, achievement markers, decorative elements
- Pattern: bold text, pixel border, retro color combinations
- Source inspiration: https://anlucas.neocities.org/88x31Buttons

### Leaderboard
- Detail list view styled like Windows Explorer
- Column headers: XP toolbar style with bevel
- Alternating rows: white / xp-silver
- Current user row highlighted in blue

---

## 7. Motion & Interaction

- **Button hover:** 50ms transition, slight background lighten
- **Button active:** 0ms transition (instant bevel flip for tactile feel)
- **Page transitions:** instant (era-appropriate, no fancy animations)
- **Hover states:** subtle bevel color change on interactive elements
- **Focus rings:** XP dotted focus rectangle (classic Windows accessibility)
- **Scroll behavior:** automatic (no smooth scroll — era-appropriate)
- **Loading states:** simple text-based "Loading..." (no spinners)

---

## 8. Voice & Brand

**Tone:** Playful, direct, encouraging — like a game from 2002.
- Use "you" and "your" liberally
- Celebrate streaks with simple congratulations ("Streak +1!")
- Error messages are helpful, not alarming: "Couldn't check in. Try again?"
- Nothing overly corporate or modern-sounding

**Name references:**
- App is "Habit Tracker" (plain, functional)
- Teams are called "teams"
- Habits are "habits"
- Check-ins are "check ins"
- Points are "points"

**DO write:** "Nice streak!", "You checked in!", "Ready for tomorrow?"
**DON'T write:** "Elevate your journey", "Seamless tracking", "Unlock your potential"

---

## 9. Anti-patterns

Things to **avoid** in this redesign:

- ❌ Modern flat design (no flat cards, no minimalism)
- ❌ Inter, Geist, Satoshi, or any trendy 2020s font
- ❌ Lucide or Feather icons — use text symbols or retro-style indicators instead
- ❌ Glassmorphism / blur effects
- ❌ Smooth scroll or scroll-triggered animations
- ❌ Purple/blue "AI gradient" aesthetic
- ❌ Pure #000000 backgrounds
- ❌ Three-equal-card-column feature rows
- ❌ Generic card shadows (use beveled borders instead)
- ❌ Pill-shaped badges
- ❌ Sun/moon dark mode toggle
- ❌ Modern navigation patterns (hamburger menus, floating nav)
- ❌ Lorem Ipsum or placeholder text
- ❌ "Elevate", "Seamless", "Game-changer", or similar copy cliches
- ❌ Using Accordion FAQ sections
