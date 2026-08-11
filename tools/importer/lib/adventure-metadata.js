/* eslint-disable */
/* global WebImporter */

/**
 * Helper: WKND adventure per-page metadata enrichment.
 *
 * Called from import-adventure.js AFTER WebImporter.rules.createMetadata so it
 * merges extra rows into the metadata block createMetadata produced. Adds:
 *   - Image     -> og:image / twitter:image (first non-avatar content image)
 *   - Category  -> indexed `category` field, powers the adventures filter chips
 *   - Template  -> 'adventure'
 *
 * Category comes from the per-slug map below (derived from the WKND reference
 * adventure detail pages). Defaults to 'Travel' for any slug not in the map.
 */

const CATEGORY_BY_SLUG = {
  'climbing-new-zealand': 'Climbing',
  'downhill-skiing-wyoming': 'Skiing',
  'tahoe-skiing': 'Skiing',
  'west-coast-cycling': 'Cycling',
  'whistler-mountain-biking': 'Cycling',
  'yosemite-backpacking': 'Travel',
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
 * Enrich the adventure's metadata block with Image, Category, Template.
 * @param {Element} main the document body / main element
 * @param {Document} document the DOM document
 * @param {Object} params import params (needs originalURL)
 */
export default function enrichAdventureMetadata(main, document, params) {
  const imgs = Array.from(main.querySelectorAll('img'));
  const leadImg = imgs.find((img) => !img.closest('.contributor')) || imgs[0] || null;

  const slug = slugFromUrl(params.originalURL);
  const category = CATEGORY_BY_SLUG[slug] || 'Travel';

  const blocks = main.querySelectorAll('.metadata');
  let metaBlock = blocks[blocks.length - 1];
  if (!metaBlock) {
    const tables = Array.from(main.querySelectorAll('table'));
    metaBlock = tables.reverse().find((t) => {
      const first = t.querySelector('td, th');
      return first && first.textContent.trim().toLowerCase() === 'metadata';
    });
  }
  if (!metaBlock) {
    metaBlock = document.createElement('div');
    metaBlock.className = 'metadata';
    main.append(metaBlock);
  }

  const isTable = metaBlock.tagName === 'TABLE';
  const addRow = (key, valueNode) => {
    if (isTable) {
      const tr = document.createElement('tr');
      const kd = document.createElement('td');
      kd.textContent = key;
      const vd = document.createElement('td');
      if (typeof valueNode === 'string') vd.textContent = valueNode;
      else if (valueNode) vd.append(valueNode);
      tr.append(kd, vd);
      (metaBlock.querySelector('tbody') || metaBlock).append(tr);
      return;
    }
    const row = document.createElement('div');
    const k = document.createElement('div');
    k.textContent = key;
    const v = document.createElement('div');
    if (typeof valueNode === 'string') v.textContent = valueNode;
    else if (valueNode) v.append(valueNode);
    row.append(k, v);
    metaBlock.append(row);
  };

  const hasImageRow = Array.from(metaBlock.querySelectorAll(':scope > div > div:first-child'))
    .some((c) => c.textContent.trim().toLowerCase() === 'image');
  if (leadImg && !hasImageRow) addRow('Image', leadImg.cloneNode(true));
  addRow('Category', category);
  addRow('Template', 'adventure');
}
