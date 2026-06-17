# Homepage Figma Export

This folder contains a standalone HTML version of the current Optika100 homepage:

- [homepage-figma-export.html](./homepage-figma-export.html)

What it is:

- A static, single-file design export based on the current React homepage structure in `src/routes/index.tsx`
- Tuned for visual editing and import into HTML-to-Figma style tools
- Uses absolute asset URLs from `https://optika.p2print.site`, so the HTML stays portable

What it is not:

- Not a production page
- Not wired to React state, live search, cart, tabs, or modals
- Not intended to replace the real homepage implementation

Suggested workflow:

1. Open `homepage-figma-export.html` in a browser and sanity-check the layout.
2. Import that HTML into your preferred HTML-to-design tool.
3. Iterate on visuals there.
4. Bring approved design changes back into `lovable_frontend_design` for implementation.
