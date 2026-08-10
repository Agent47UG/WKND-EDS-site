/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks.
 *
 * Inserts section-break <hr> elements (which serialize to `---` in the EDS
 * output) between the top-level content sections of each WKND template, so the
 * imported document gets proper section boundaries.
 *
 * page-templates.json does not populate a `sections` array for these templates,
 * so this transformer is DOM-driven (keyed on payload.template.name) rather than
 * template-driven. Every boundary anchor below was verified against captured DOM:
 *   - migration-work/home/cleaned.html            (home)
 *   - migration-work/magazine-landing/cleaned.html (magazine-landing)
 *   - migration-work/about/cleaned.html            (about)
 *   - live DOM of https://wknd.site/us/en/magazine/arctic-surfing.html (article)
 *
 * Section maps (first section is implicit / no leading break; entries below are
 * the START of each subsequent section):
 *   home            : hero | featured | recent articles | next adventures | where-to-go   (4 breaks)
 *   magazine-landing: title | featured | all-articles | members-only                       (3 breaks)
 *   about           : title | our contributors | wknd guides                                (2 breaks)
 *   article         : body | contributor | related                                          (2 breaks)
 *
 * Anchors prefer default-content headings (which survive block parsing) and
 * structural containers, so the transformer works whether it runs on raw DOM
 * (validation harness) or after block parsers have replaced blocks with tables
 * (real import). Runs in afterTransform only.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Ordered list of section-start boundaries per template. Each boundary resolves
// an anchor element; an <hr> is inserted immediately before that anchor.
//   heading         : match a default-content title/heading by its text
//   selector        : first matching element
//   fallbackSelector: used if `selector` matches nothing (e.g. block already
//                     replaced by a table in the real import)
//   afterHeading    : final fallback — anchor is the element after this heading
const SECTION_BOUNDARIES = {
  home: [
    // Featured article teaser (columns-featured block); post-parse it is a table
    // and is the first child of the first fixed layout container.
    { selector: '.teaser.cmp-teaser--featured', fallbackSelector: '.cmp-layout-container--fixed' },
    { heading: 'Recent Articles' }, // dynamic recent-articles list section
    { heading: 'Next Adventures' }, // "Next Adventures" title + Climbing New Zealand teaser
    { heading: 'Where do you want to go?' }, // curated adventures card grid section
  ],
  'magazine-landing': [
    // Featured article teaser; sits directly after the "Magazine" H1.
    { selector: '.teaser.cmp-teaser--featured', afterHeading: 'Magazine' },
    { heading: 'All Articles' }, // dynamic all-articles listing section
    { heading: 'Members Only' }, // members-only CTA section (secure teasers removed by cleanup)
  ],
  about: [
    { heading: 'Our Contributors' }, // contributors grid section
    { heading: 'WKND Guides' }, // guides grid section
  ],
  article: [
    // Contributor block. Live DOM uses .cmp-byline; template mapping references
    // .cmp-teaser--author / "article + div". Post-parse it becomes a table.
    { selector: '.cmp-byline, .cmp-teaser--author, main article + div' },
    // Related-articles list. Live DOM uses .cmp-list--upnext; mapping references
    // .cmp-list--related / aside .cmp-list.
    { selector: '.cmp-list--upnext, .cmp-list--related, aside .cmp-list' },
  ],
};

/** Normalize heading/title text for comparison. */
function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Find the outermost wrapper of a default-content title/heading matching `text`.
 * Returns the `.title` grid-column wrapper when present, else the `.cmp-title`
 * block, else the heading element itself. Null if not found.
 */
function findHeadingWrapper(main, text) {
  const target = normalize(text);
  const candidates = main.querySelectorAll('.cmp-title__text, h1, h2, h3, h4, h5, h6');
  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i];
    if (normalize(el.textContent) === target) {
      return el.closest('.title') || el.closest('.cmp-title') || el;
    }
  }
  return null;
}

/**
 * Insert an <hr> immediately before `anchor` unless it is already preceded by
 * one or is the very first element (no preceding content). Returns true on insert.
 */
function insertBreakBefore(anchor) {
  if (!anchor || !anchor.parentElement) return false;
  const prev = anchor.previousElementSibling;
  if (prev && prev.tagName === 'HR') return false; // avoid duplicate breaks
  const hr = anchor.ownerDocument.createElement('hr');
  anchor.parentElement.insertBefore(hr, anchor);
  return true;
}

/** Resolve a boundary descriptor to its anchor element (or null). */
function resolveAnchor(main, boundary) {
  if (boundary.heading) {
    return findHeadingWrapper(main, boundary.heading);
  }
  if (boundary.selector) {
    let anchor = main.querySelector(boundary.selector);
    if (!anchor && boundary.fallbackSelector) {
      anchor = main.querySelector(boundary.fallbackSelector);
    }
    if (!anchor && boundary.afterHeading) {
      const hw = findHeadingWrapper(main, boundary.afterHeading);
      anchor = hw ? hw.nextElementSibling : null;
    }
    return anchor;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const templateName = payload && payload.template && payload.template.name;
  const boundaries = templateName ? SECTION_BOUNDARIES[templateName] : null;
  if (!boundaries) return;

  boundaries.forEach((boundary) => {
    const anchor = resolveAnchor(element, boundary);
    insertBreakBefore(anchor);
  });
}
