# Move Redirects to a DA Sheet (`/redirects`)

## Goal

Re-implement the site redirects so they are sourced from a **Document Authoring (DA) sheet named `redirects`** (served as `/redirects.json` from the DA content source) instead of the committed `redirects.json` code file at the repo root. Same 8 mappings, same **301** behavior — but now the redirects live in content (author-editable, shipped through the DA preview/publish workflow) rather than in code.

## Why this is the better fit

- **Content workflow, not code deploys.** Authors can edit redirects in DA and preview/publish them without a GitHub PR or Code Sync build.
- **Single source of truth.** The DA sheet becomes authoritative; the code file is removed so the two can't diverge or shadow each other.
- Preserves all existing requirements: ≥2 old→new mappings returning **301**, plus SEO sitemap/metadata unaffected.

## Current state (to change)

- `redirects.json` exists at the repo root (committed, merged to `main`) with 8 `Source`→`Destination` rows.
- It is served/activated via `admin.hlx.page` preview+publish and returns 301s today.

## Target state

- A DA document `redirects.json` under `content.da.live/agent47ug/wknd-eds-site/` (a **sheet**), authored in DA, published to `/redirects.json`.
- The repo-root `redirects.json` **removed** (via feature branch → PR → merge) so the DA sheet is the only source.
- 301s continue to work, now driven by the DA sheet.

## Sheet contents (unchanged mappings)

```
Source                               Destination
/us/en                               /
/us/en/magazine                      /magazine
/us/en/about-us                      /about
/us/en/magazine/arctic-surfing       /magazine/arctic-surfing
/us/en/magazine/san-diego-surf       /magazine/san-diego-surf
/us/en/magazine/ski-touring          /magazine/ski-touring
/us/en/magazine/guide-la-skateparks  /magazine/guide-la-skateparks
/us/en/magazine/western-australia    /magazine/western-australia
```

## Approach & sequencing (avoid a redirect outage)

1. **Create the DA sheet first** and publish it, so redirects never go dark.
2. **Confirm the DA sheet is the source** (temporarily add a unique probe row, e.g. `/__da-redirect-test__ → /magazine`, publish, verify the 301, then remove it). This proves the DA sheet — not the leftover code file — is driving redirects, given both could resolve the same path.
3. **Then remove the code file** `redirects.json` on a feature branch → PR → merge to `main`; re-publish and re-verify.

## Implementation notes / risks

- **DA sheet format:** DA stores sheets as JSON in the helix sheet shape (`{ total, limit, offset, data:[...], ":type":"sheet" }`). I'll POST the sheet to the DA source API (`POST https://admin.da.live/source/agent47ug/wknd-eds-site/redirects.json`) and confirm the served `/redirects.json` matches the expected shape; adjust the wrapper/content-type if DA needs a specific format.
- **Precedence unknown:** if the committed code file shadows the DA sheet (or vice-versa), the probe-row test in step 2 will reveal it; removing the code file (step 3) resolves any ambiguity definitively.
- **Credentials:** DA upload + git push require the same Settings opt-ins already enabled in this project; if a call returns 401/403 I'll surface it rather than proceed.
- No `content/` files are touched; the sheet is a new DA document, and the only git change is deleting the root `redirects.json`.

## Checklist

- [ ] Read current `redirects.json` mappings to carry over verbatim (done — 8 rows)
- [ ] Author the `redirects` sheet JSON in the correct DA sheet format
- [ ] Upload the sheet to DA at `.../wknd-eds-site/redirects.json` (source API)
- [ ] Preview the sheet: `POST admin.hlx.page/preview/agent47ug/wknd-eds-site/main/redirects.json`
- [ ] Publish the sheet: `POST admin.hlx.page/live/.../redirects.json`
- [ ] Add a temporary probe row, publish, and verify it 301s → confirms the DA sheet is authoritative; then remove the probe row and republish
- [ ] Remove the repo-root `redirects.json` on a feature branch; open PR → merge to `main`
- [ ] Re-publish and re-verify redirects after the code file is gone
- [ ] Verify ≥2 old→new paths return **301** on preview (`.aem.page`) and live (`.aem.live`)
- [ ] Confirm lint still passes and no unrelated files changed

> This plan describes work to be performed — **execution requires Execute mode.** Switch to Execute mode and I'll create the DA `redirects` sheet, verify it drives the 301s, remove the old code file via PR, and re-confirm on live. Mappings stay identical unless you want to add/change any (tell me and I'll fold them in).
