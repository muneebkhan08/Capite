# Design system

The interface is built on two references:

- **[clay.com](https://www.clay.com)** — the colour philosophy. Clay's palette is
  built on an *oat* scale: warm, low-chroma neutrals that read as paper rather
  than screen, with saturated naturals (lime, lemon, tangerine, blueberry)
  used sparingly on top. Their own tokens (`oat-100 #fefdfb` … `oat-950 #1d1c1a`,
  `lime-300 #cbd810`, `lemon-300 #fcbe11`) are the anchor points here.
- **[imagine.art](https://www.imagine.art)** — the structure and typography.
  Geometric-humanist sans at low weights (nothing above 600), an editorial serif
  used on one or two words, positive tracking on micro-labels, 12px/16px radii,
  numbered card grids, and pill-shaped segmented controls.

Everything lives in `src/app/globals.css`. Components reference semantic tokens,
never raw palette steps.

---

## Colour

### Oat — the neutral spine

Hue ~45°, chroma under 0.02. Every surface, border and text colour comes from
here, which is what stops the UI reading cold.

| Step | Hex | Used for |
|---|---|---|
| `oat-50` | `#fefdfb` | page canvas (light) |
| `oat-150` | `#f6f4ef` | sunken surfaces, toolbars |
| `oat-300` | `#e7e3da` | hairline borders |
| `oat-400` | `#dad4c8` | strong borders, scrollbar thumb |
| `oat-700` | `#6f6b65`* | subtle text |
| `oat-800` | `#55534e` | muted body text |
| `oat-950` | `#1d1c1a` | ink, and the dark slabs (footer, terminal, pipeline) |

\* the semantic `--ink-subtle` is deepened from Clay's `#85817a` to `#6f6b65` to
clear AA on the canvas.

Tailwind's default `gray-*` scale is **remapped onto oat** in `@theme`. That was
the highest-leverage move in the redesign: it re-toned 473 existing `gray-*`
utilities from blue-grey to warm paper without touching the markup.

### Accents

| Family | Key step | Role |
|---|---|---|
| **Moss** | `#3e8968` (`--brand` = `#367a5c`) | primary — buttons, links, active states |
| **Lime** | `#cbd810` | the single most important action on a screen, dark ink on top |
| **Lemon** | `#fcbe11` | warm highlight, "unsaved changes", customisation markers |
| **Clay** | `#ee6f24` | warm earth — privacy/self-host tinting |
| **Sky** | `#3b8ef0` | informational |
| **Iris** | `#8b5cf6` | secondary category tinting |
| **Brick** | `#cc5b44` | destructive — a natural brick red, not fire-engine |

Each accent has a pale wash (100/200) for backgrounds and a saturated tone
(400/500) for text and icons on top of it. The six feature cards each take one,
all desaturated to the same perceived weight so the grid reads as one set.

### Semantic layer

Components use `canvas / surface / surface-2 / surface-3`, `line / line-strong`,
`ink / ink-muted / ink-subtle / ink-faint`, and `brand / brand-wash / brand-edge /
accent-lime / highlight`. The light/dark split lives only in `:root` and `.dark`.

**Dark mode is the same paper, dimmed** — warm charcoal (`#141311`, `#1d1c1a`),
never blue-black, so the hue never jumps between modes.

### Contrast

Every text role clears WCAG AA:

| Role | Light | Dark |
|---|---|---|
| ink on canvas | 16.8:1 | 17.5:1 |
| ink-muted | 7.6:1 | 9.4:1 |
| ink-subtle | 5.2:1 | 5.5:1 |
| brand as text | 5.0:1 | 5.8:1 |
| white on brand | 5.1:1 | 5.8:1 |
| ink on lime | 10.1:1 | — |

`ink-faint` (3.6:1) is deliberately below AA and is used only for decorative
markers, index numbers and large text.

---

## Type

| Face | Variable | Role |
|---|---|---|
| **Plus Jakarta Sans** | `--font-jakarta` | the whole interface — geometric enough to feel like a tool, humanist enough to stay warm at 11px |
| **Instrument Serif** | `--font-instrument` | editorial accent, italic, one or two words per heading |
| **JetBrains Mono** | `--font-mono-ui` | eyebrows, timecodes, numeric readouts |

Font variables are declared on `<html>`, not `<body>` — an undefined custom
property inside a `font-family` list invalidates the whole declaration and silently
falls back to serif.

**Rules**

- Headings cap at weight 600. Buttons and labels at 500–550.
- Display type: `-0.034em` tracking, `0.98` leading (`.text-display`).
- Micro-labels: `+0.14em` tracking, uppercase, mono (`.text-eyebrow`).
- `font-variant-numeric: tabular-nums` globally — progress percentages,
  timecodes and file sizes sit in columns and must not jitter.
- `text-wrap: balance` on headings, `pretty` on paragraphs.

---

## Shape, depth and motion

- **Radii**: 6 / 8 / **12** / **16** / 20 / 24 / 32px, plus true pills for
  controls and chips. 12 and 16 carry most of the UI.
- **Shadows** are tinted with the warm ink (`rgb(29 28 26 / …)`), never pure
  black, so elevation reads as depth rather than dirt.
- **Easing**: `--ease-out-soft` for surfaces, `--ease-spring` for caption motion.
- `prefers-reduced-motion` collapses every animation and disables smooth scroll.

## Texture

Three utilities keep the light theme from feeling clinical:

- `.bg-grain` — 2.5% fractal-noise overlay; paper fibre, not visible noise.
- `.bg-grid` — 64px engineering grid, radially masked; suggests a workspace.
- `.bg-aurora` — moss, lemon and lime bleeding in from the page edges.

## Primitives

`.surface-card`, `.surface-card-interactive`, `.surface-well`, `.btn-brand`,
`.btn-accent`, `.btn-quiet`, `.chip`, `.rule-fade`, `.text-display`,
`.text-editorial`, `.text-eyebrow`.

---

## Patterns

**Segmented controls.** Header nav, style-picker tabs, studio tabs, backdrop
scene selector and position presets all use the same shape: a pill track on
`surface-2` with a hairline border, and a raised `surface` pill marking the
active option. One idiom, five places.

**Numbered surfaces.** The workbench columns are labelled `1 Source video`,
`2 Caption style`, `3 Live preview`; feature cards carry `01`–`06`; FAQ rows
carry `01`–`06`. Borrowed from imagine.art — it gives the eye an anchor and makes
grids feel catalogued.

**Style-coloured thumbnails.** History cards render the chosen caption style's
own `primaryColor` and `highlightColor` as a miniature caption and a tinted
gradient, so the library is scannable by look rather than by name.

**One accent per screen.** Lime appears exactly once on any given view — the
primary submit on the landing page, "Apply & Re-render" in the studio, and only
when there is something to apply.

---

## Conventions

- Prefer semantic tokens (`bg-surface`, `text-ink-muted`) over palette steps
  (`bg-oat-150`) over raw values. Roughly 54 legacy `gray-*` utilities remain in
  the studio panels; they render correctly through the oat remap, and are worth
  converting opportunistically.
- Caption rendering is **not** part of this system. The 13 display faces loaded
  at the top of `globals.css`, the `.animate-caption-*` keyframes and the
  `.caption-word-active-*` classes mirror the ASS output the backend produces and
  must stay in sync with `caption-styles.config.json`.
