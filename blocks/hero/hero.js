/*
 * Hero block
 * WKND hero: a full-bleed background image with an overlapping content panel
 * (heading + description + CTA). The source WKND home hero is a 3-slide
 * carousel; per the migration decision the hero is a single instance using the
 * first slide. This decorator normalises whatever the parser produced (which
 * may include extra slide rows) into one image + one content panel, so the
 * layout matches the reference regardless of how many rows were authored.
 *
 * Expected content (rows):
 *   row 1: background image
 *   row 2: heading + description + CTA
 *   (any further image/content rows are treated as additional slides and
 *    removed so the hero renders a single, clean panel)
 */

export default function decorate(block) {
  const rows = [...block.children];

  // Find the first row that contains an image (background) and the first row
  // that contains a heading (the content panel).
  const imageRow = rows.find((r) => r.querySelector('picture, img'));
  const contentRow = rows.find(
    (r) => r.querySelector('h1, h2, h3, h4, h5, h6') && r !== imageRow,
  );

  block.replaceChildren();

  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    const wrap = document.createElement('div');
    wrap.className = 'hero-image';
    if (picture) {
      wrap.append(picture);
    } else {
      const img = imageRow.querySelector('img');
      if (img) wrap.append(img);
    }
    block.append(wrap);
  }

  if (contentRow) {
    const content = document.createElement('div');
    content.className = 'hero-content';
    // move the heading/description/CTA nodes into the content panel
    [...contentRow.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => content.append(node));
    });
    block.append(content);
  }
}
