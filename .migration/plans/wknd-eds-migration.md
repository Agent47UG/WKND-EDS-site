I'll explore the current repo state to ground the plan, then draft it.I have enough context on the repo. A few decisions will materially shape the plan, so let me confirm them before drafting.# WKND EDS Site Migration Plan

Build a WKND-style Edge Delivery Services site with **da.live** as the content source, migrating content from `wknd.site/us/en.html` using the Experience Modernization Agent (EMA). This plan covers every must-have feature and rubric acceptance criterion.

## Context (confirmed)

- **Repo:** `Agent47UG/WKND-EDS-site` (branch `main`); boilerplate-based, no `fstab.yaml` yet.
- **Content source:** da.live — mountpoint `https://content.da.live/agent47ug/wknd-eds-site`.
- **Preview/Live:** `https://main--wknd-eds-site--agent47ug.aem.page/` and `.aem.live/`.
- **Existing blocks:** cards, columns, footer, fragment, header, hero, widget. (No `helix-query.yaml`, `metadata`, `redirects`, or `sitemap` yet.)
- **Scope decisions:** migrate **all available magazine articles (~6–8)**; **build the article-list block fresh**; content source org/repo = **agent47ug/wknd-eds-site**.
- **Constraint:** all content authored/imported into DA via the bundled import script (never hand-written HTML into `content/`); all code shipped via a **feature branch + PR** (no direct commits to `main`).

## Target site structure

```
/                         Home (hero, magazine teaser w/ dynamic article list, about teaser)
/magazine                 Magazine landing (dynamic article list from query index)
/magazine/<article-1..n>  Individual article pages (writer/photographer block, social links)
/about                    About section
/nav                      Header nav content (DA)
/footer                   Footer content (DA, incl. social-links block)
```

## Custom blocks to build

| Block | Purpose | Content model (author contract) |
|---|---|---|
| `article-list` | Dynamically lists all magazine articles from the query index; updates on publish with **no code change** | Optional rows for config (e.g. path filter `/magazine/`, limit, sort) |
| `social-links` | Social media icon links | Rows of `platform → URL`; renders accessible icon links |
| `contributor` | Writer/photographer details | Rows: avatar image, name, title/role |

## Config files to add

- `fstab.yaml` — mountpoint to da.live content source.
- `helix-query.yaml` — index over `/magazine/**` exposing title, description, image, author, publication date, template.
- `metadata.json` (bulk metadata) — path-pattern rules applying shared metadata to `/magazine/*` pages; plus per-page metadata in each article's page metadata block.
- `redirects.json` (or spreadsheet) — ≥2 old→new **301** mappings (e.g. `/us/en/magazine/...` → `/magazine/...`).
- `sitemap.yaml` + `robots.txt` — valid sitemap + robots for SEO.

---

## Checklist

### Phase 0 — Setup & scaffolding
- [ ] Create a feature branch (e.g. `feat/wknd-migration`); confirm no work lands on `main`.
- [ ] Add `fstab.yaml` pointing to `https://content.da.live/agent47ug/wknd-eds-site`.
- [ ] Verify AEM Code Sync / repo mountpoint config; start local dev server (`aem up`) on port 3000.
- [ ] Confirm which reference article URLs exist on `wknd.site/us/en` (enumerate the full magazine list to migrate).

### Phase 1 — EMA content migration (into DA)
- [ ] Run the Experience Modernization Agent site analysis on `wknd.site/us/en.html` to catalog templates (home, magazine landing, article, about).
- [ ] Generate import infrastructure (parsers/transformers/page-templates) via the migration skills.
- [ ] Import Home, Magazine landing, About, and all ~6–8 article pages using the **bundled import script** (not hand-edited HTML).
- [ ] Upload/publish imported HTML to DA (`admin.da.live` source API) for org `agent47ug`, repo `wknd-eds-site`.
- [ ] Verify each imported page previews correctly at localhost:3000 and matches the source structure.

### Phase 2 — Custom blocks (Block Collection patterns)
- [ ] Build `article-list` block (query-index driven; fetches `/query-index.json`, filters `/magazine/`, renders teasers; **no hardcoded articles**).
- [ ] Build `social-links` block (accessible icon links; keyboard-navigable; aria-labels).
- [ ] Build `contributor` block (avatar alt text, name, title).
- [ ] Add each block's `.js` + `.css`, scoped selectors, mobile-first responsive, self-contained.
- [ ] Wire `article-list` into the Home teaser and the Magazine landing page.

### Phase 3 — Indexing, metadata, redirects, SEO
- [ ] Add `helix-query.yaml` indexing `/magazine/**` (title, description, image, author, date, template).
- [ ] Apply **bulk metadata** via `metadata.json` path rules for `/magazine/*`.
- [ ] Apply **per-page metadata** (title, description, `og:` and `twitter:` tags, image) on each article page.
- [ ] Add `redirects.json` with ≥2 old→new mappings; confirm they return **301**.
- [ ] Add `sitemap.yaml` and `robots.txt`; verify sitemap is valid and exposed.

### Phase 4 — Header & footer
- [ ] Author/verify header nav content in DA (`/nav`) — WKND branding + Magazine/About links.
- [ ] Author/verify footer content in DA (`/footer`) including the `social-links` block.
- [ ] Confirm header/footer render on all page types.

### Phase 5 — Quality gates (rubric)
- [ ] **Lint:** `npm run lint` passes (JS + CSS); fix issues.
- [ ] **Functionality:** publish a new test article and confirm the article list updates with **no code change** (validates live-index behavior).
- [ ] **Accessibility:** Lighthouse a11y = 100; keyboard navigation works; all images have meaningful alt text; proper heading hierarchy.
- [ ] **Performance:** PageSpeed/Lighthouse mobile = 100 on Home **and** an article page; LCP & CLS within CWV "good".
- [ ] **SEO:** validate sitemap, per-page `og:`/`twitter:` metadata, robots.txt, and 301 redirects.

### Phase 6 — Content workflow (DA snapshot + review)
- [ ] Make at least one content update, ship it through a **DA snapshot + review** before publishing live (satisfies content-workflow criterion).
- [ ] Document the snapshot/review step taken.

### Phase 7 — Ship via PR
- [ ] Push feature branch; verify AEM Code Sync builds the feature preview.
- [ ] Run PageSpeed against the feature-preview URL; fix any regressions to hit 100.
- [ ] Open a PR to `main` with a demo link `https://feat-wknd-migration--wknd-eds-site--agent47ug.aem.page/<path>`.
- [ ] Verify `gh pr checks` (code sync, lint, performance) are green; leave for human review/merge.

---

## Open considerations
- **EMA availability:** the migration is driven by the Experience Modernization Agent skills already available in this session; no additional plugins are required for the core must-haves. (Commerce/Figma/Forms plugins are not needed here.)
- **Article count:** proceeding with **all available (~6–8)** magazine articles; exact set confirmed during Phase 0 enumeration.
- **Redirect examples:** old WKND paths like `/us/en/magazine/<slug>.html` → new `/magazine/<slug>`; final pairs finalized once article slugs are known.

> **Execution requires Execute mode.** This artifact is the plan only; approve/exit plan mode to begin Phase 0.
