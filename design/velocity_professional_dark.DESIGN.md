---
name: Velocity Professional
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered for high-performance sprint management. It prioritizes clarity, speed of interaction, and a focused workspace for product teams. The aesthetic follows a **Corporate / Modern** approach with a heavy emphasis on **Minimalism** to reduce cognitive load during complex project planning.

The brand personality is professional, systematic, and reliable. It avoids decorative flourishes in favor of high-utility density and a clear information hierarchy. The emotional response should be one of "calm productivity"—where the interface recedes to let the user's data and workflows take center stage.

## Colors

This design system utilizes a deep slate-based palette to reduce eye strain during long-form technical work. 

- **Primary:** Indigo (#6366F1) is used exclusively for primary actions, active states, and focus indicators.
- **Surface Strategy:** The background uses a deep charcoal (#0F172A). UI containers and cards utilize a slightly elevated slate (#1E293B) to create natural depth without relying on heavy shadows.
- **Borders:** A subtle slate (#334155) provides structural definition for inputs and card boundaries.
- **Status Colors:** Standardized semantic colors are used for task statuses, priority levels, and system feedback, ensuring immediate recognition of blockers or successes.

## Typography

The design system uses **Inter** for all UI elements to ensure maximum legibility across different pixel densities. 

- **Headings:** Bold weights with slightly negative letter-spacing create a compact, "engraved" look for headers.
- **Body:** The default body size is 14px (`body-md`) to allow for data-dense layouts required by sprint boards and backlogs.
- **Labels:** Small, uppercase labels with increased letter-spacing are used for metadata like "Status," "Assignee," or "Priority" to distinguish them from primary content.
- **Monospace:** JetBrains Mono is suggested for technical ticket IDs or code snippets within task descriptions.

## Layout & Spacing

The design system operates on a **4px baseline grid** with a 12-column fluid grid system for desktop layouts. 

- **Grid Logic:** Use 24px gutters for standard layouts. For dense data tables or sidebars, reduce gutters to 16px.
- **Safe Areas:** Mobile layouts should maintain a 16px side margin, while desktop containers cap at 1440px to maintain line-length readability.
- **Component Padding:** Buttons and inputs follow a strict `12px x 20px` or `8px x 16px` padding rule to maintain consistency across the application.
- **Sectioning:** Use `3xl` (64px) spacing to separate major sections of the UI, like the sprint header from the task board.

## Elevation & Depth

This system avoids heavy shadows, instead using **Tonal Layering** to communicate hierarchy.

1.  **Level 0 (Base):** #0F172A — Used for the main application background.
2.  **Level 1 (Surface):** #1E293B — Used for cards, sidebar containers, and navigation bars.
3.  **Level 2 (Overlay):** #334155 — Used for dropdown menus, modals, and tooltips.

**Borders & Outlines:**
Instead of traditional shadows, use 1px solid borders (#334155) for all interactive elements. For active or focused states, transition the border color to the Primary Accent or use a subtle 2px glow with high diffusion and low opacity (e.g., `0 0 8px rgba(99, 102, 241, 0.3)`).

## Shapes

The shape language is modern and approachable but remains professional. 

- **Standard Elements:** Buttons, inputs, and cards use `rounded` (8px) corners. 
- **Large Containers:** Modals and large dashboard cards should use `rounded-lg` (16px) to soften the interface.
- **Micro-elements:** Badges and checkboxes use `rounded-sm` (4px) to maintain a precise, technical feel.
- **Avatars:** Always rendered as perfect circles for immediate human identification within a grid of rectangular cards.

## Components

### Buttons
- **Primary:** Solid Indigo background with white text. No gradient. 
- **Secondary:** Transparent background with #334155 border. 
- **Ghost:** No background or border until hover. Used for low-priority actions in toolbars.

### Input Fields
- Background should match the `surface_hex` (#1E293B).
- Borders are #334155, turning Indigo on focus.
- Placeholder text uses #94A3B8.

### Task Cards
- Background: #1E293B.
- Border: 1px solid #334155.
- On hover, the border should brighten slightly to #475569 to indicate interactivity.
- Include a vertical "Priority" strip on the left edge (using Status colors).

### Badges / Chips
- Use low-opacity versions of the status colors for the background (e.g., 10-15% opacity) with a fully opaque text label.
- Roundedness: 4px.

### Data Tables
- Header row: Darker background (#0F172A) with uppercase `label-md` text.
- Row divider: 1px solid #1E293B.
- Hover state: Row background changes to #1E293B.

### Skeletons
- Use a pulse animation transitioning between #1E293B and #334155.