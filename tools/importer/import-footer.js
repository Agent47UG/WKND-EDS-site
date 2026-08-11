/* eslint-disable */
/* global WebImporter */

/*
 * Furniture import: builds the WKND site footer document at /footer.
 *
 * Mirrors the source WKND footer: brand, footer navigation links, a "Follow Us"
 * heading with a social-links block (reusing the custom social-links block), and
 * the copyright / attribution text. The social icons are rendered by
 * blocks/social-links (accessible, keyboard-navigable icon links).
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
    const section = document.createElement('div');

    // Brand
    const brandP = document.createElement('p');
    brandP.append(el(document, 'a', { href: '/' }, 'WKND'));
    section.append(brandP);

    // Footer navigation links
    const navUl = document.createElement('ul');
    [
      ['Magazine', '/magazine'],
      ['Adventures', '/adventures'],
      ['About', '/about'],
    ].forEach(([label, href]) => {
      const li = document.createElement('li');
      li.append(el(document, 'a', { href }, label));
      navUl.append(li);
    });
    section.append(navUl);

    // Follow Us heading
    section.append(el(document, 'h4', {}, 'Follow Us'));

    // social-links block: build via WebImporter.Blocks.createBlock so the block
    // table survives markdown conversion (a hand-built <div> would be flattened
    // to paragraphs by md2da). One row per platform: [platform | url].
    const socialCells = [
      ['Facebook', 'https://www.facebook.com/'],
      ['Twitter', 'https://www.twitter.com/'],
      ['Instagram', 'https://www.instagram.com/'],
    ].map(([platform, url]) => [platform, el(document, 'a', { href: url }, url)]);
    const social = WebImporter.Blocks.createBlock(document, { name: 'social-links', cells: socialCells });
    section.append(social);

    // Copyright / attribution
    section.append(el(document, 'p', {}, '© 2026 WKND Adventures. All rights reserved.'));
    section.append(el(
      document,
      'p',
      {},
      'WKND is a fictitious adventure and travel brand used to demonstrate a WKND-style site built with Adobe Experience Manager Edge Delivery Services.',
    ));

    main.append(section);

    return [{
      element: main,
      path: '/footer',
      report: { title: 'Footer', template: 'footer' },
    }];
  },
};
