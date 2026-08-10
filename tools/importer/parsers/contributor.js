/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: contributor
 * Base block: contributor (custom)
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html — .cmp-byline
 *         https://wknd.site/us/en/about-us.html — .cmp-experience-fragment--contributor
 * Generated: 2026-08-10
 *
 * Renders an author/photographer profile. Per blocks/contributor/contributor.js
 * the block is a single 2-column row: [avatar image | name heading + role text].
 * A single-column row (no avatar) is also supported by the block.
 *
 * WKND has two source shapes (note: the class .cmp-teaser--author does not
 * exist on WKND — page-templates.json selectors were corrected to these):
 *  1. Article byline (main .cmp-byline): avatar in .cmp-byline__image,
 *     name in h2.cmp-byline__name, role in p.cmp-byline__occupations.
 *     This element excludes the social buttons (they are a sibling btn-list).
 *  2. About contributor XF (main .cmp-experience-fragment--contributor):
 *     avatar in .image img, name in h3.cmp-title__text (first title),
 *     role in the following h5.cmp-title__text. The social button labels
 *     inside this element belong to the separate social-links block and are
 *     intentionally NOT copied here.
 *
 * NOTE ON VALIDATION: On the about page the source .cmp-experience-fragment
 * --contributor element ALSO contains the social button labels (Facebook,
 * Twitter, Instagram). Those are deliberately excluded here because they are
 * captured by the sibling social-links block. As a result the completeness
 * check reports ~60-80% for these instances by design — do not "fix" it by
 * pulling the social labels into the contributor block.
 */
export default function parse(element, { document }) {
  // --- Avatar image (optional) ---
  const img = element.querySelector(
    '.cmp-byline__image img, .cmp-teaser__image img, .image img, .cmp-image__image, img',
  );

  // --- Name (heading) ---
  let name = element.querySelector(
    '.cmp-byline__name, .cmp-teaser__title',
  );
  if (!name) {
    // About shape: first title heading is the name.
    name = element.querySelector('.cmp-title__text, h1, h2, h3, h4, h5, h6');
  }

  // --- Role / occupation (optional) ---
  let role = element.querySelector(
    '.cmp-byline__occupations, .cmp-teaser__description',
  );
  if (!role && name) {
    // About shape: the next title heading after the name is the role.
    const headings = Array.from(element.querySelectorAll('.cmp-title__text, h1, h2, h3, h4, h5, h6'));
    const idx = headings.indexOf(name);
    if (idx !== -1 && headings[idx + 1]) role = headings[idx + 1];
  }

  // Empty-block guard.
  if (!name && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the content cell: name as a heading (h3) + role text.
  const contentCell = [];
  if (name) {
    let heading = name;
    // Normalise the name to a heading element if it isn't one already.
    if (!/^H[1-6]$/.test(name.tagName)) {
      heading = document.createElement('h3');
      heading.textContent = name.textContent.trim();
    }
    contentCell.push(heading);
  }
  if (role) {
    let roleEl = role;
    if (/^H[1-6]$/.test(role.tagName)) {
      // Demote a heading role to a paragraph so it reads as supporting text.
      roleEl = document.createElement('p');
      roleEl.textContent = role.textContent.trim();
    }
    contentCell.push(roleEl);
  }

  // 2-column row: [avatar | name + role]. Empty first cell when no avatar.
  // (Social links from the same source element are handled by social-links.)
  const cells = [[img || '', contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'contributor', cells });

  // About-page shape: the social buttons are NESTED inside this contributor
  // container (.cmp-experience-fragment--contributor > .cmp-buildingblock
  // --btn-list). Because this parser replaces the whole container, the sibling
  // social-links selector can no longer reach that nested btn-list. So emit the
  // social-links block here, immediately AFTER the contributor block, mirroring
  // the article-page layout (contributor followed by a sibling social-links).
  // On the article page the btn-list is a sibling (not nested), so this finds
  // nothing and the dedicated social-links parser handles it instead.
  const nestedBtnList = element.querySelector('.cmp-buildingblock--btn-list');
  let socialBlock = null;
  if (nestedBtnList) {
    const anchors = Array.from(nestedBtnList.querySelectorAll('a.cmp-button, .cmp-button'))
      .filter((a) => a.tagName === 'A');
    const socialCells = [];
    anchors.forEach((a) => {
      const iconSpan = a.querySelector('[class*="cmp-button__icon--"]');
      let platform = '';
      if (iconSpan) {
        const m = (iconSpan.className.match(/cmp-button__icon--([a-z]+)/) || [])[1];
        if (m) platform = m;
      }
      const textLabel = (a.querySelector('.cmp-button__text') || {}).textContent;
      const label = (textLabel || a.getAttribute('aria-label') || a.textContent || platform || '').trim();
      if (!platform) platform = label.toLowerCase().replace(/[^a-z]/g, '');
      const url = a.getAttribute('href') || '';
      if (!platform || !url) return;
      socialCells.push([label || platform, url]);
    });
    if (socialCells.length) {
      socialBlock = WebImporter.Blocks.createBlock(document, { name: 'social-links', cells: socialCells });
    }
  }

  element.replaceWith(block); // no return — replace in place
  if (socialBlock) block.after(socialBlock);
}
