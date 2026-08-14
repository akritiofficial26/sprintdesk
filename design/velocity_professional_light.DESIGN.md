---
name: Velocity Professional Light
colors:
  surface: '#f8f9fa'
  surface-dim: '#F3F4F6'
  surface-bright: '#FFFFFF'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464554'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  text-primary: '#111827'
  border-subtle: '#E5E7EB'
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
    fontFamily: jetbrainsMono
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
  gutter: 24px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-performance sprint management, optimized for clarity and speed. This light mode variant shifts the narrative toward an "open-office" digital workspace—clean, airy, and hyper-focused. The aesthetic is rooted in **Modern Minimalism**, removing the visual weight of dark interfaces to prioritize long-term legibility and reduced eye strain in bright environments.

The brand personality remains systematic and reliable. By utilizing a high-contrast ratio between crisp typography and soft surface tones, the UI evokes a sense of "organized precision." It is a tool designed to recede, ensuring that the user’s cognitive load is reserved for project data rather than navigating the interface.

## Colors

The light mode palette is built on a foundation of "Cool Neutrals" to maintain a professional, corporate atmosphere.

- **Primary:** The signature Indigo (#6366F1) remains the core action color, providing a vibrant focal point against the neutral background.
- **Surface Strategy:** The system uses a triple-layered white/gray approach. The main application canvas is Soft Gray (#F9FAFB), while interactive cards and high-priority containers use pure White (#FFFFFF) to visually pop.
- **Typography:** Dark Charcoal (#111827) is used for maximum contrast on primary text, while Muted Gray (#6B7280) handles secondary metadata.
- **Borders:** A consistent Subtle Gray (#E5E7EB) defines boundaries without creating visual clutter.

## Typography

The design system leverages **Inter** for its neutral, highly legible character, which excels in data-dense light environments.

- **Contrast Management:** Headlines utilize the primary charcoal color with tighter tracking to feel structural and authoritative.
- **Density:** `body-md` (14px) is the standard for interface text, allowing for complex information display without overwhelming the screen.
- **Labels:** Meta-information uses the secondary muted gray and increased letter-spacing to create a clear visual distinction from user-generated content.
- **Technical Content:** **JetBrains Mono** is reserved for ticket IDs, code snippets, and terminal outputs to provide a distinct "developer-centric" texture.

## Layout & Spacing

This design system adheres to a rigorous **4px baseline grid**, ensuring that every element—from the smallest icon to the largest container—scales predictably.

- **Grid System:** A 12-column fluid grid is used for primary layouts. Desktop gutters are set at 24px, though this can be tightened to 16px for utility-heavy sidebars or data inspectors.
- **Responsibility:** Layouts transition at standard breakpoints (640px, 1024px, 1440px). On mobile, side margins are 16px to maximize horizontal real estate for task titles.
- **Component Rhythms:** Consistent vertical rhythm is maintained by using `md` (16px) or `lg` (24px) spacing for internal component padding and object separation.

## Elevation & Depth

In light mode, hierarchy is communicated through **Tonal Layers** and extremely subtle **Ambient Shadows**.

- **Surface Levels:** 
    - **Base (Level 0):** #F9FAFB — The foundational canvas.
    - **Elevated (Level 1):** #FFFFFF — Used for cards, task items, and primary white-space containers.
    - **Overlay (Level 2):** #FFFFFF + Subtle Shadow — Used for modals and dropdowns.
- **Shadow Profile:** Shadows should be nearly imperceptible, using a large blur radius with very low opacity (e.g., `0 4px 12px rgba(0, 0, 0, 0.05)`).
- **Outlines:** All containers and interactive elements must utilize a 1px solid border (#E5E7EB) to maintain definition against the light background.

## Shapes

The shape language balances modern softness with professional precision. 

- **Standard Components:** Buttons and inputs use a base radius of 8px (`rounded`).
- **Data & Micro-UI:** Checkboxes, status badges, and small icons use 4px (`rounded-sm`) to keep the interface feeling crisp and technical.
- **Major Containers:** Dashboard widgets and modals use 16px (`rounded-lg`) to create a clear "containerized" feel.
- **Avatars:** Strictly circular to distinguish people from objects (cards/buttons).

## Components

### Buttons
- **Primary:** Solid Indigo (#6366F1) with White text. High impact.
- **Secondary:** White background with #E5E7EB border and #111827 text.
- **Ghost:** No border or background. Text color is #6B7280, shifting to Indigo on hover.

### Input Fields
- Background: #FFFFFF.
- Border: #E5E7EB. On focus, the border becomes Indigo with a subtle 2px Indigo glow at 10% opacity.
- Placeholder: #9CA3AF (Muted gray).

### Task Cards
- Background: #FFFFFF.
- Border: 1px solid #E5E7EB.
- Interaction: On hover, cards should lift slightly via a subtle shadow increase and a border color shift to #D1D5DB.

### Status Badges
- Backgrounds: Use highly desaturated, light versions of the status color (e.g., Success: #F0FDF4).
- Text: High-contrast, bold version of the status color (e.g., Success: #166534).

### Data Tables
- Header Row: #F3F4F6 (Surface-Dim) with #6B7280 uppercase labels.
- Dividers: 1px solid #F3F4F6 between rows.
- Selection: Selected rows use a very light Indigo tint (#EEF2FF).