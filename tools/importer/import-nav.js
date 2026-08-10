/* eslint-disable */
/* global WebImporter */

/*
 * Furniture import: builds the WKND site navigation document at /nav.
 *
 * The header block (blocks/header/header.js) splits the nav content into three
 * sections — brand, sections (links), tools — one per top-level child, with
 * section breaks (---) between them. This script constructs that structure
 * deterministically (the source header is an AEM experience fragment, so we
 * author the EDS-native equivalent rather than scraping XF chrome). Links point
 * at the migrated pages only, so the nav is fully keyboard-navigable with no
 * broken targets.
 */

function el(document, tag, attrs, text) {
  const node = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text != null) node.textContent = text;
  return node;
}

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');

    // --- Section 1: brand ---
    const brand = document.createElement('div');
    const brandP = document.createElement('p');
    brandP.append(el(document, 'a', { href: '/' }, 'WKND'));
    brand.append(brandP);
    main.append(brand);
    main.append(document.createElement('hr'));

    // --- Section 2: nav sections (links) ---
    const sections = document.createElement('div');
    const ul = document.createElement('ul');
    [
      ['Magazine', '/magazine'],
      ['About', '/about'],
    ].forEach(([label, href]) => {
      const li = document.createElement('li');
      li.append(el(document, 'a', { href }, label));
      ul.append(li);
    });
    sections.append(ul);
    main.append(sections);
    main.append(document.createElement('hr'));

    // --- Section 3: tools (search) ---
    const tools = document.createElement('div');
    const toolsP = document.createElement('p');
    toolsP.textContent = ':search:';
    tools.append(toolsP);
    main.append(tools);

    return [{
      element: main,
      path: '/nav',
      report: { title: 'Navigation', template: 'nav' },
    }];
  },
};
