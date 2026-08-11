import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards block.
 * Each row becomes a card with an image cell and a body cell (title + text).
 * The whole card image is made clickable by wrapping it in a link that mirrors
 * the card's title link, so users can click the image or the title.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Make the card image clickable using the card's own title link (if any).
  ul.querySelectorAll('li').forEach((li) => {
    const imageCell = li.querySelector('.cards-card-image');
    const titleLink = li.querySelector('.cards-card-body a[href]');
    if (imageCell && titleLink && !imageCell.querySelector('a')) {
      const link = document.createElement('a');
      link.href = titleLink.href;
      link.className = 'cards-card-image-link';
      link.setAttribute('aria-hidden', 'true');
      link.setAttribute('tabindex', '-1');
      const picture = imageCell.querySelector('picture');
      if (picture) {
        link.append(picture);
        imageCell.append(link);
      }
    }
  });

  block.replaceChildren(ul);
}
