/* eslint-disable */
/* global WebImporter */

/*
 * Builds the WKND Adventures landing document at /adventures.
 *
 * Mirrors the Magazine landing: an H1 + intro, a featured teaser
 * (columns-featured), an "All Adventures" heading, and the dynamic `adventures`
 * block (query-index driven, filtered to /adventures/, with category filters).
 * The block is authored as a table with optional config rows; the adventure
 * cards render at runtime from /query-index.json, so publishing a new adventure
 * updates this page automatically with no edit or code change.
 */

function el(document, tag, attrs, text) {
  const node = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text != null) node.textContent = text;
  return node;
}

function blockTable(document, name, rows) {
  const table = document.createElement('table');
  const head = document.createElement('tr');
  const th = document.createElement('th');
  th.setAttribute('colspan', '2');
  th.textContent = name;
  head.append(th);
  table.append(head);
  rows.forEach(([k, v]) => {
    const tr = document.createElement('tr');
    const c1 = document.createElement('td');
    c1.textContent = k;
    const c2 = document.createElement('td');
    c2.textContent = v;
    tr.append(c1, c2);
    table.append(tr);
  });
  return table;
}

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');

    // Section 1: title + intro
    const intro = document.createElement('div');
    intro.append(el(document, 'h1', {}, 'Adventures'));
    intro.append(el(document, 'p', {}, 'Experience the world with us.'));
    main.append(intro);
    main.append(document.createElement('hr'));

    // Section 2: "All Adventures" heading + dynamic adventures block
    const listSection = document.createElement('div');
    listSection.append(el(document, 'h2', {}, 'All Adventures'));
    listSection.append(blockTable(document, 'Adventures', [
      ['path', '/adventures/'],
      ['sort', 'title'],
      ['sortDirection', 'asc'],
      ['filters', 'true'],
    ]));
    main.append(listSection);

    // Page metadata as a proper block table (a hand-built <div class="metadata">
    // gets flattened to paragraphs by md2da; a "Metadata" block table survives).
    main.append(blockTable(document, 'Metadata', [
      ['Title', 'Adventures | WKND'],
      ['Description', 'Experience the world with us. Browse WKND’s curated adventures and guided trips.'],
      ['Template', 'adventures-landing'],
    ]));

    return [{
      element: main,
      path: '/adventures',
      report: { title: 'Adventures', template: 'adventures-landing' },
    }];
  },
};
