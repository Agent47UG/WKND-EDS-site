/* eslint-disable */
/* global WebImporter */

/**
 * Helper (NOT a hook transformer): WKND article per-page metadata enrichment.
 *
 * Called from import-article.js AFTER WebImporter.rules.createMetadata so it can
 * merge extra rows into the single metadata block createMetadata produced
 * (avoids duplicate .metadata blocks). Adds, when available:
 *   - Image            -> drives og:image / twitter:image (EDS convention)
 *   - Author           -> author byline (indexed + author meta at render)
 *   - Publication Date -> feeds helix-query 'date' so article-list sorts newest-first
 *   - Template         -> 'article'
 *
 * The lead image and author are read from the already-parsed DOM. Publication
 * dates come from the source WKND magazine (per-slug map); a sensible default
 * is used for any slug not in the map.
 */

const DATE_BY_SLUG = {
  'arctic-surfing': '2020-10-14',
  'san-diego-surf': '2020-07-09',
  'ski-touring': '2020-09-30',
  'guide-la-skateparks': '2020-09-30',
  'western-australia': '2020-07-09',
};

/**
 * Derive the article slug from the source URL.
 * @param {string} originalURL the source URL
 * @returns {string} the last path segment without extension
 */
function slugFromUrl(originalURL) {
  const path = new URL(originalURL).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  return path.split('/').pop();
}

/**
 * Enrich the article's metadata block with Image, Author, Publication Date, Template.
 * @param {Element} main the document body / main element
 * @param {Document} document the DOM document
 * @param {Object} params import params (needs originalURL)
 */
export default function enrichArticleMetadata(main, document, params) {
  // Lead image: first content image that is NOT the contributor avatar.
  const imgs = Array.from(main.querySelectorAll('img'));
  const leadImg = imgs.find((img) => !img.closest('.contributor')) || imgs[0] || null;

  // Author: read from the source byline/contributor. At this point in the
  // import the contributor block is still a parsed block TABLE (not the
  // decorated .contributor markup), so query the source shapes directly:
  //  - article byline: h2.cmp-byline__name
  //  - the contributor block table: first heading cell after the avatar
  let authorEl = document.querySelector('.cmp-byline__name');
  if (!authorEl) {
    // Fallback: the contributor block table's first heading.
    const contribTable = Array.from(main.querySelectorAll('table')).find((t) => {
      const first = t.querySelector('td, th');
      return first && first.textContent.trim().toLowerCase() === 'contributor';
    });
    if (contribTable) authorEl = contribTable.querySelector('h1, h2, h3, h4, h5, h6');
  }
  if (!authorEl) authorEl = main.querySelector('.contributor h1, .contributor h2, .contributor h3');
  const author = authorEl ? authorEl.textContent.trim() : '';

  const slug = slugFromUrl(params.originalURL);
  const date = DATE_BY_SLUG[slug] || '2020-07-09';

  // Locate the metadata block createMetadata produced (last .metadata wins).
  // createMetadata builds a WebImporter table element; depending on the
  // importer version it may be a div.metadata OR a <table>. Fall back to a
  // <table> whose first cell reads "Metadata", and if neither exists create a
  // fresh div.metadata (html2md merges consecutive metadata blocks).
  const metaBlocks = main.querySelectorAll('.metadata');
  let metaBlock = metaBlocks[metaBlocks.length - 1];
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

  // Only add an Image row if createMetadata didn't already produce one.
  const hasImageRow = Array.from(metaBlock.querySelectorAll(':scope > div > div:first-child'))
    .some((c) => c.textContent.trim().toLowerCase() === 'image');
  if (leadImg && !hasImageRow) addRow('Image', leadImg.cloneNode(true));
  if (author) addRow('Author', author);
  addRow('Publication Date', date);
  addRow('Template', 'article');
}
