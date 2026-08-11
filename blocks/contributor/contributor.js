import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Contributor Block
 * Renders an author/photographer profile: optional avatar, name, and role.
 * May be immediately followed by a social-links block in the document.
 *
 * Expected content model (authored as a table in a document):
 *   | Contributor |                          |
 *   | <avatar img>| Jacob Wester (heading)   |
 *   |             | Skater, Writer           |
 *
 * Two columns: cell 1 = optional avatar image, cell 2 = name (as a heading)
 * plus role text. A single-column table (no avatar) is also supported.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const firstRow = rows[0];
  if (!firstRow) return;

  const cells = [...firstRow.children];

  // Locate the avatar image: prefer a cell that only contains a picture/img.
  let imageCell = null;
  let contentCell = null;

  if (cells.length >= 2) {
    [imageCell, contentCell] = cells;
  } else {
    // Single column: content only, image (if any) is inline within it.
    [contentCell] = cells;
    const pic = contentCell.querySelector('picture, img');
    if (pic && contentCell.children.length === 1) {
      imageCell = contentCell;
      contentCell = null;
    }
  }

  block.replaceChildren();

  // Avatar
  const img = imageCell && imageCell.querySelector('img');
  if (img) {
    const avatar = document.createElement('div');
    avatar.className = 'contributor-avatar';
    const alt = img.getAttribute('alt') || '';
    avatar.append(
      createOptimizedPicture(img.src, alt, false, [{ width: '200' }]),
    );
    block.append(avatar);
  }

  // Details (name + role)
  if (contentCell) {
    const details = document.createElement('div');
    details.className = 'contributor-details';

    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      heading.classList.add('contributor-name');
      details.append(heading);
    }

    // Remaining text nodes become the role/occupations.
    [...contentCell.children].forEach((el) => {
      if (el === heading) return;
      if (el.querySelector && el.querySelector('picture, img')) return;
      el.classList.add('contributor-role');
      details.append(el);
    });

    // If no explicit heading was found, treat the first paragraph as the name.
    if (!heading) {
      const first = details.querySelector('.contributor-role');
      if (first) {
        first.classList.remove('contributor-role');
        first.classList.add('contributor-name');
      }
    }

    block.append(details);
  }

  // Pull the immediately-following social-links block into this profile card so
  // each contributor + its socials form a single element. This makes the About
  // page grid reliable (one grid item per person) and keeps the article byline
  // grouped. The social block may not be decorated yet, so move its wrapper and
  // let its own decorator run in place.
  const wrapper = block.closest('.contributor-wrapper') || block.parentElement;
  const nextWrapper = wrapper && wrapper.nextElementSibling;
  if (nextWrapper && nextWrapper.classList.contains('social-links-wrapper')) {
    const social = nextWrapper.querySelector('.social-links') || nextWrapper;
    const socialSlot = document.createElement('div');
    socialSlot.className = 'contributor-social';
    socialSlot.append(social);
    block.append(socialSlot);
    // remove the now-empty wrapper
    if (!nextWrapper.children.length) nextWrapper.remove();
  }
}
