import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Normalize footer section headings (e.g. "Follow Us") to h2. The footer is
  // site-wide furniture appended after the page's main content, so a fixed h4
  // skips levels (h2 -> h4) and fails the "heading order" a11y rule. h2 sits
  // safely below the page's h1/h2 without skipping. Preserve text and id.
  footer.querySelectorAll('h3, h4, h5, h6').forEach((heading) => {
    const h2 = document.createElement('h2');
    h2.innerHTML = heading.innerHTML;
    if (heading.id) h2.id = heading.id;
    heading.getAttributeNames().forEach((name) => {
      if (name !== 'id') h2.setAttribute(name, heading.getAttribute(name));
    });
    heading.replaceWith(h2);
  });

  block.append(footer);
}
