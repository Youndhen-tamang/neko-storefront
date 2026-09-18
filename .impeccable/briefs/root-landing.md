# Surface brief: root landing (`/` with no tenant subdomain)

Scope: the page a visitor sees at the bare host (localhost:3000, later the apex domain). Mode: Persuade.
Audience: people deciding whether to run their shop on Neko, plus the two operator roles (store owner, super admin) who need their door.
Job: understand what Neko is in seconds, see the mechanism work, and go to the right door.
Constraints: no pricing, no customer counts, no invented capabilities. Only what the backend does today. Register/login flow deferred; doors are: open a store by slug, admin sign-in, super admin (port 3004).
Spline: hero slot reads `NEXT_PUBLIC_SPLINE_SCENE`; an interactive storefront preview fills the slot when unset.

## Direction contract

THESIS: Type a name, get a store. The hero is the mechanism itself, a live re-branding storefront preview, not a headline over a screenshot. Refuses the SaaS hero-plus-feature-card-grid.

OWN-WORLD: Inherits the storefront system (Fraunces display, Outfit body, cream ground, forest green primary). Committed color: forest green owns whole regions (hero panel, closing doors section in deep ink-green). No accent color beyond green and ink; door actions are set in the section's foreground. Rules are 1px hairlines in border tone; no cards inside cards, no eyebrows, no gradient text, no glass, and the sticky header is opaque.

STORY: A visitor reads "every store gets its own front door", types a shop name, watches the preview take its name and color, and opens it. They scroll to see that one API serves every store, what each store ships with, the path from zero to first order, then pick their door.

FIRST VIEWPORT: Two columns on desktop. Left 5/12: headline at 4.5rem, one paragraph, the store-name field with the primary action "Open store" set inside the field's right edge (the typed name and the door it opens are one gesture, so the action lives in the same control), then the color chips beneath. Right 7/12: a green panel holding a browser-framed storefront preview whose address bar, brand mark, title and buttons follow the input live; Spline scene replaces the panel background when configured. Nav above with Sign in and Open a store.

FORM: Live-mechanism hero; first on the ordered list (mechanism demo, ledger of capabilities, architecture strip, numbered path, doors). Seed key: none. The concept-seed launcher was blocked by the session's permission classifier ("Permission for this action was denied by the Claude Code auto mode classifier"), so no roll ran. Waiver: the direction was chosen in-thread and confirmed through the structured question round; the user's answers verbatim were "we willd ecude that next time for now neko" (name), "No scene yet, leave a slot (Recommended)" (Spline), and "no need for now" (register flow).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
