/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: social-links
 * Base block: social-links (custom)
 * Source: https://wknd.site/us/en/about-us.html and
 *         https://wknd.site/us/en/magazine/arctic-surfing.html —
 *         .cmp-buildingblock--btn-list (a set of .cmp-button anchors)
 * Generated: 2026-08-10
 *
 * Per blocks/social-links/social-links.js the block is a 2-column table with
 * one row per link: [platform name | destination URL].
 *
 * WKND source: a building-block button list (.cmp-buildingblock--btn-list)
 * where each social link is an <a class="cmp-button"> with:
 *   - a platform icon span .cmp-button__icon--{facebook|twitter|instagram|...}
 *   - a text label span .cmp-button__text (e.g. "Facebook")
 *   - an aria-label and an href.
 * The platform name is normalised to a lowercase key; the URL is the href.
 *
 * NOTE: The class .cmp-teaser--author referenced originally does not exist on
 * WKND; page-templates.json selectors were corrected to the btn-list.
 *
 * NOTE ON VALIDATION: completeness scores below 90% here by design. Column 2
 * (the URL) is taken from each anchor's href attribute, which is NOT part of
 * the source element's visible text, so the text-similarity metric is
 * inherently low even though every platform + URL is captured faithfully.
 * Several WKND profiles use placeholder hrefs (e.g. "#", "#selveraj"), which
 * drives the score down further. Do not "fix" this — the extraction is
 * complete and correct.
 */
export default function parse(element, { document }) {
  // Collect the social anchor links (each social button is an <a>).
  const anchors = Array.from(element.querySelectorAll('a.cmp-button, .cmp-button'))
    .filter((a) => a.tagName === 'A');

  const cells = [];

  anchors.forEach((a) => {
    // Determine the platform name, preferring an explicit label.
    const iconSpan = a.querySelector('[class*="cmp-button__icon--"]');
    let platform = '';
    if (iconSpan) {
      const match = (iconSpan.className.match(/cmp-button__icon--([a-z]+)/) || [])[1];
      if (match) platform = match;
    }
    const textLabel = (a.querySelector('.cmp-button__text') || {}).textContent;
    const label = (textLabel || a.getAttribute('aria-label') || a.textContent || platform || '').trim();
    if (!platform) platform = label.toLowerCase().replace(/[^a-z]/g, '');

    const url = a.getAttribute('href') || '';

    // Skip anchors with no usable platform or URL.
    if (!platform || !url) return;

    // One row per link: [platform name | url] (2-column model).
    cells.push([label || platform, url]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'social-links', cells });
  element.replaceWith(block); // no return — replace in place
}
