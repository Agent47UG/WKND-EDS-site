/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns-featured
 * Base block: columns
 * Source: https://wknd.site/us/en.html — main .teaser.cmp-teaser--featured
 * Generated: 2026-08-10
 *
 * WKND featured-article teaser (AEM Core Components). Rendered as a single
 * 2-column row: [image | (eyebrow + title + description + CTA)]. Matches
 * blocks/columns-featured/columns-featured.js which treats an image-only
 * column as the image column and the other column as the text column.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');
  const eyebrow = element.querySelector('.cmp-teaser__pretitle');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link'));

  // Empty-block guard.
  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Text column contents (order: eyebrow, title, description, CTA).
  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // Single 2-column row: image cell + text cell.
  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
