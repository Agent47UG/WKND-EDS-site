/* eslint-disable */
/* global WebImporter */

/**
 * Helper: inject an `adventure-info` block into an adventure detail page.
 *
 * The WKND source exposes trip facts (Activity, Adventure Type, Trip Length,
 * Group Size, Difficulty, Price) in a structured info panel that the generic
 * importer doesn't reliably capture. This helper injects those facts as an
 * adventure-info block (rendered as small info cards) right after the H1, using
 * a per-slug data map extracted from the reference adventure detail pages.
 *
 * Called from import-adventure.js during transform (before createMetadata).
 */

const INFO_BY_SLUG = {
  'climbing-new-zealand': [
    ['Activity', 'Rock Climbing'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '2 Days'], ['Group Size', '3'], ['Difficulty', 'Intermediate'], ['Price', '$900'],
  ],
  'downhill-skiing-wyoming': [
    ['Activity', 'Skiing'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '2-3 Days'], ['Group Size', '4'], ['Difficulty', 'Intermediate'], ['Price', '$400'],
  ],
  'tahoe-skiing': [
    ['Activity', 'Skiing'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '3-4 Days'], ['Group Size', '8'], ['Difficulty', 'Advanced'], ['Price', '$1500'],
  ],
  'west-coast-cycling': [
    ['Activity', 'Cycling'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '5 Days'], ['Group Size', '12'], ['Difficulty', 'Intermediate'], ['Price', '$4500'],
  ],
  'whistler-mountain-biking': [
    ['Activity', 'Cycling'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '2 Days'], ['Group Size', '3'], ['Difficulty', 'Advanced'], ['Price', '$1500'],
  ],
  'yosemite-backpacking': [
    ['Activity', 'Camping'], ['Adventure Type', 'Overnight Trip'],
    ['Trip Length', '5 Days'], ['Group Size', '12'], ['Difficulty', 'Intermediate'], ['Price', '$1500'],
  ],
};

/**
 * Derive the adventure slug from the source URL.
 * @param {string} originalURL the source URL
 * @returns {string} the last path segment without extension
 */
function slugFromUrl(originalURL) {
  const path = new URL(originalURL).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  return path.split('/').pop();
}

/**
 * Insert an adventure-info block (as a WebImporter block table) after the H1.
 * @param {Element} main the document body / main element
 * @param {Document} document the DOM document
 * @param {Object} params import params (needs originalURL)
 */
export default function injectAdventureInfo(main, document, params) {
  const slug = slugFromUrl(params.originalURL);
  const facts = INFO_BY_SLUG[slug];
  if (!facts || !facts.length) return;

  // Remove the source's raw content-fragment trip panel so our clean
  // adventure-info card block is the single source of these facts (avoids a
  // duplicate list showing "900.0" etc.).
  main.querySelectorAll('.contentfragment, .cmp-contentfragment').forEach((n) => n.remove());

  const cells = [['Adventure Info']];
  facts.forEach(([label, value]) => cells.push([label, value]));
  const block = WebImporter.Blocks.createBlock(document, { name: 'adventure-info', cells });

  const h1 = main.querySelector('h1');
  if (h1 && h1.parentNode) {
    h1.after(block);
  } else {
    main.prepend(block);
  }
}
