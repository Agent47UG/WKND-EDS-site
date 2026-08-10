/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: article-list
 * Base block: article-list (custom, DYNAMIC)
 * Source: https://wknd.site/us/en.html ("Recent Articles" image-list) and
 *         https://wknd.site/us/en/magazine.html ("All Articles" image-list)
 * Generated: 2026-08-10
 *
 * article-list is a DYNAMIC block: at runtime it fetches the site's
 * query-index and renders article cards itself (see blocks/article-list/
 * article-list.js). Therefore this parser MUST NOT emit the source article
 * cards as static rows. It emits ONLY the block name row plus config
 * key/value rows.
 *
 * NOTE ON VALIDATION: The completeness check compares source article text to
 * parsed block text and will REPORT LOW COMPLETENESS for this block by design
 * — the article cards are intentionally not copied into the output. This is
 * correct: copying them would produce stale, duplicated content. Do not
 * "fix" this by emitting the source cards.
 *
 * Two instances are detected:
 *  - Home "Recent Articles": a limited list appearing first on the homepage.
 *      -> path=/magazine/, limit=4, sort=date, sortDirection=desc
 *  - Magazine "All Articles": the full listing on the magazine landing page.
 *      -> path=/magazine/, sort=date, sortDirection=desc (no limit)
 *
 * Detection heuristic (in order):
 *  1. A nearby heading containing "Recent" -> recent variant.
 *  2. A nearby heading containing "All Articles" -> all variant.
 *  3. The page URL path: /magazine(.html) -> all; the site root -> recent.
 *  4. Fallback: path=/magazine/ sort=date sortDirection=desc, no limit.
 */
export default function parse(element, { document }) {
  // --- Gather detection signals -------------------------------------------
  // Heading text: look for a preceding title/heading near this list.
  function nearbyHeadingText() {
    // Walk previous siblings up the ancestor chain looking for a heading.
    let node = element;
    for (let depth = 0; depth < 4 && node; depth += 1) {
      let sib = node.previousElementSibling;
      while (sib) {
        const h = sib.matches && sib.matches('h1,h2,h3,h4,h5,h6,[class*="title"]')
          ? sib
          : (sib.querySelector && sib.querySelector('h1,h2,h3,h4,h5,h6,.cmp-title__text'));
        if (h && h.textContent.trim()) return h.textContent.trim().toLowerCase();
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
    }
    return '';
  }

  const heading = nearbyHeadingText();
  const url = (element.ownerDocument
    && element.ownerDocument.location
    && element.ownerDocument.location.pathname) || '';
  const itemCount = element.querySelectorAll('.cmp-image-list__item, .cmp-list__item, li').length;

  // --- Decide which instance this is --------------------------------------
  let recent = false;
  if (heading.includes('recent')) {
    recent = true;
  } else if (heading.includes('all article')) {
    recent = false;
  } else if (/\/magazine(\.html|\/|$)/.test(url)) {
    recent = false; // magazine landing => All Articles
  } else if (url && !/magazine/.test(url)) {
    // Some other page (e.g. homepage) with a short list => Recent Articles.
    recent = itemCount > 0 && itemCount <= 6;
  } else {
    recent = false; // ambiguous -> default to the full "All Articles" config
  }

  // --- Build config rows ---------------------------------------------------
  // Only block-name + key/value config rows are emitted (dynamic block).
  const config = recent
    ? [['path', '/magazine/'], ['limit', '4'], ['sort', 'date'], ['sortDirection', 'desc']]
    : [['path', '/magazine/'], ['sort', 'date'], ['sortDirection', 'desc']];

  // Each config entry becomes a 2-cell row [key, value].
  const cells = config.map(([key, value]) => [key, value]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block); // no return — replace in place

}
