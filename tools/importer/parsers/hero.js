/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://wknd.site/us/en.html — main .carousel.cmp-carousel--hero
 * Generated: 2026-08-10
 *
 * WKND source is an AEM Core Components carousel with multiple hero teaser
 * slides. The hero block is 1 column; to preserve all slide content we emit,
 * per slide, an (optional) background-image row followed by a content row
 * (title + description + CTA). Row 1 is the block name.
 */
export default function parse(element, { document }) {
  // Collect every hero teaser slide — exactly one element per slide to avoid
  // double-selecting the outer (.cmp-teaser--hero) and inner (.cmp-teaser)
  // wrappers. Prefer the carousel item; fall back to the teaser, then element.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('.cmp-teaser--hero'));
  if (!slides.length) slides = [element];

  const cells = [];

  slides.forEach((slide) => {
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image__image, img');
    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, p, [class*="description"]');
    const ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link'));

    if (!heading && !description && !image) return;

    // Background image row (optional, its own single cell).
    if (image) cells.push([image]);

    // Content row — hero is 1 column, so all elements go in one cell.
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    if (contentCell.length) cells.push([contentCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
