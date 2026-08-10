/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://wknd.site/us/en.html — .image-list.list (curated adventures)
 *         https://wknd.site/us/en/magazine/arctic-surfing.html — related list
 * Generated: 2026-08-10
 *
 * WKND uses two source shapes for cards:
 *  1. Image list (.cmp-image-list): each .cmp-image-list__item has an image,
 *     a title link (.cmp-image-list__item-title-link) and a description
 *     (.cmp-image-list__item-description). => 2-column cards: [image | text].
 *  2. Related "up next" list (.cmp-list--*): each .cmp-list__item has a title
 *     link (.cmp-list__item-link/.cmp-list__item-title) and a date, but NO
 *     image. => still 2 columns, with an empty first (image) cell so the block
 *     table stays rectangular (per cards library convention).
 *
 * Every row has 2 cells (image | body); when no image exists the first cell
 * is left empty rather than omitted.
 */
export default function parse(element, { document }) {
  // Locate the card items regardless of shape.
  let items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (!items.length) items = Array.from(element.querySelectorAll('.cmp-list__item'));
  if (!items.length) items = Array.from(element.querySelectorAll(':scope > li, li'));

  const cells = [];

  items.forEach((item) => {
    // --- Image (optional) ---
    const img = item.querySelector('img, picture');

    // --- Title link ---
    const titleLink = item.querySelector(
      '.cmp-image-list__item-title-link, .cmp-list__item-link, a',
    );
    const titleText = (
      item.querySelector('.cmp-image-list__item-title, .cmp-list__item-title')
      || titleLink
    );

    // --- Description / date (optional) ---
    const description = item.querySelector(
      '.cmp-image-list__item-description, .cmp-list__item-date, [class*="description"]',
    );

    // Build the body cell: a heading-style title link plus optional description.
    const body = [];
    if (titleLink) {
      // Preserve the link; ensure its text is present.
      const link = titleLink.cloneNode(true);
      if (!link.textContent.trim() && titleText) {
        link.textContent = titleText.textContent.trim();
      }
      const heading = document.createElement('h3');
      heading.append(link);
      body.push(heading);
    } else if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText.textContent.trim();
      body.push(heading);
    }
    if (description) body.push(description);

    // Skip genuinely empty items.
    if (!img && !body.length) return;

    // 2-column row: [image | body]. Empty first cell when no image.
    cells.push([img || '', body]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
