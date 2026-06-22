# Design System Document: Deep Earth Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Agronomist"**
This design system rejects the "SaaS Dashboard" cliché in favor of a high-end, editorial experience. It blends the raw, tactile nature of the earth with the precision of satellite-guided intelligence. By utilizing dramatic typography scales, non-linear layouts, and a "Deep Earth" palette, we create a prestigious environment where data feels like a premium asset. 

The system moves beyond the grid; it uses intentional asymmetry and overlapping "glass" layers to mimic the organic layering of soil and atmosphere. Every interaction should feel intentional, cinematic, and authoritative.

---

## 2. Colors: The Deep Earth Palette
Our palette is rooted in the "Deep Earth" philosophy—heavy, metallic foundations accented by the vibrant life of high-tech farming.

### Foundation & Accents
*   **Surface & Background (`#131313`)**: The void of the earth. Use this as the canvas for all high-contrast typography.
*   **Primary (`#54e98a` / `#2ecc71`)**: Planting Green. Reserved for growth metrics, "Active" statuses, and primary calls to action.
*   **Secondary (`#92ccff` / `#3398db`)**: Atmospheric Blue. Used for irrigation data, weather trends, and satellite overlays.
*   **Tertiary (`#f2ca50` / `#d4af37`)**: Metallic Gold/Bronze. Exclusively for market commodity quotes and prestige alerts.

### The Rules of Engagement
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation needed.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. Use the `surface-container` tiers (Lowest to Highest) to create depth. An inner data card should use `surface-container-high` to "lift" off a `surface-container-low` section.
*   **The "Glass & Gradient" Rule:** To achieve an Awwwards-level finish, use Glassmorphism for floating overlays. Apply semi-transparent surface colors with a `20px` to `40px` backdrop-blur. 
*   **Signature Textures:** Use subtle linear gradients (e.g., `primary` to `primary-container` at 135 degrees) for primary action buttons to give them a metallic, iridescent sheen.

---

## 3. Typography: Editorial Authority
We pair the brutalist strength of **Space Grotesk** with the surgical precision of **Inter**.

*   **Display (Space Grotesk):** Use `display-lg` (3.5rem) and `display-md` (2.75rem) for hero statements and key data points. These should often overlap background imagery or containers to break the linear flow.
*   **Headlines (Space Grotesk):** Use `headline-lg` (2rem) for section titles. Ensure tight letter-spacing (-0.02em) to maintain a prestigious, "heavy" feel.
*   **Body & Labels (Inter):** Use `body-lg` (1rem) for insights and `label-md` (0.75rem) for technical metadata. This sans-serif provides the "data-driven" clarity required for complex agricultural metrics.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web-standard." We achieve depth through atmospheric light and tonal shifts.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` sections. This creates a soft, natural lift without structural noise.
*   **Ambient Shadows:** When an element must "float" (e.g., a critical modal or tool-tip), use an extra-diffused shadow: `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4)`. The shadow should feel like an ambient occlusion, not a hard drop shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
*   **3D Tilt Effects:** Apply a subtle `1deg` to `3deg` 3D tilt on mouse-hover for high-value cards (e.g., Yield Forecasts) to emphasize the "High-Tech" personality.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background with `on-primary` text. Use `xl` (0.75rem) roundedness. Add a subtle inner-glow (top-down white gradient at 5% opacity) for a metallic finish.
*   **Secondary:** Ghost-style. No background, `outline-variant` border (at 20%), and `secondary` text.
*   **Tertiary:** Text-only with a `3.5` (1.2rem) bottom-underline that expands on hover.

### Cards & Lists
*   **The Divider Rule:** Forbid the use of divider lines. Separate list items using `spacing-4` (1.4rem) or alternating background shifts between `surface-container-low` and `surface-container-lowest`.
*   **Data Visualization Cards:** Use isometric animated icons in the top-right corner. The card background should be a subtle gradient from `surface-container-high` to `surface-container-highest`.

### Input Fields
*   **Style:** Minimalist. Only a bottom border using `outline-variant`. On focus, the border transitions to `primary` and the label shifts to `label-sm` in `primary` color.
*   **Errors:** Use `error` text with a `surface-container-highest` background to make the error feel like a "system alert" rather than a mistake.

### Specialty Component: The "Commodity Ticker"
*   A horizontal scrolling bar at the top/bottom of the viewport. Use `tertiary` (Gold) for price increases and `error` for decreases. Background must be `surface-container-lowest` with a glassmorphism blur.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. If the left margin is `spacing-12`, the right can be `spacing-24` to create a dynamic, editorial feel.
*   **Do** overlap elements. Allow a `display-lg` heading to partially cover a `surface-container` card.
*   **Do** use the Spacing Scale strictly. Gaps should be generous (`spacing-16` or `20`) to convey prestige.

### Don't
*   **Don't** use 100% opaque borders. They clutter the "organic" feel of the system.
*   **Don't** use standard "Select" or "Dropdown" menus. Use custom, glass-morphic overlays that animate into view.
*   **Don't** cram data. If a screen feels full, increase the `surface` whitespace. High-end design requires "room to breathe."
*   **Don't** use flat icons. All iconography must be isometric to align with the "3D / High-Tech" brand personality.