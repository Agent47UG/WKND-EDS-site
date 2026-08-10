/*
 * Social Links Block
 * Renders a set of accessible, keyboard-navigable icon links.
 *
 * Expected content model (authored as a table in a document):
 *   | Social Links |            |
 *   | Facebook     | https://.. |
 *   | Twitter      | https://.. |
 *   | Instagram    | https://.. |
 *
 * Each row is one link: cell 1 = platform name, cell 2 = destination URL.
 * Alternatively a single cell may contain a link whose text is the platform
 * name; both shapes are handled gracefully.
 */

// Inline SVG paths keep the block self-contained (no external icon requests).
const ICONS = {
  facebook:
    '<path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/>',
  twitter:
    '<path d="M18.9 2h3.3l-7.2 8.24L23.5 22h-6.6l-5.18-6.77L5.8 22H2.5l7.7-8.8L2 2h6.77l4.68 6.19L18.9 2Zm-1.16 18h1.83L7.34 3.9H5.38L17.74 20Z"/>',
  instagram:
    '<path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.47.66.25 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.63.42 1.36.47 2.43C21.99 8.94 22 9.28 22 12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.43a4.9 4.9 0 0 1-1.15 1.77c-.55.55-1.11.9-1.77 1.15-.63.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.63-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.43.25-.66.6-1.22 1.15-1.77.55-.55 1.11-.9 1.77-1.15.63-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.5.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.31.88-.35 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.21 1.5.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.31 1.86.35 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.5-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.31-.88.35-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.21-1.5-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.31-1.86-.35-1.05-.05-1.37-.06-4.04-.06Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 8.48a3.34 3.34 0 1 0 0-6.68 3.34 3.34 0 0 0 0 6.68Zm6.54-8.68a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/>',
  linkedin:
    '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.73v20.53C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.73C24 .78 23.2 0 22.22 0Z"/>',
  youtube:
    '<path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.6 15.6V8.4l6.24 3.6-6.24 3.6Z"/>',
  pinterest:
    '<path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.85 6.36 9.31-.09-.79-.17-2 .03-2.86.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .86-.54 2.13-.83 3.32-.24.99.5 1.8 1.48 1.8 1.77 0 3.14-1.87 3.14-4.57 0-2.39-1.72-4.06-4.17-4.06-2.84 0-4.51 2.13-4.51 4.33 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.32-.25 1-.28 1.14-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.46 0 6.16 2.47 6.16 5.77 0 3.45-2.17 6.22-5.19 6.22-1.01 0-1.97-.53-2.29-1.15l-.62 2.38c-.23.87-.83 1.96-1.24 2.62.94.29 1.92.44 2.95.44 5.52 0 10-4.48 10-10S17.52 2 12 2Z"/>',
};

function platformFromText(text) {
  return (text || '').trim().toLowerCase();
}

function buildIconLink(platform, url, label) {
  const a = document.createElement('a');
  a.className = 'social-links-link';
  a.href = url;
  a.setAttribute('aria-label', label);
  a.setAttribute('rel', 'noopener');
  a.setAttribute('target', '_blank');

  const key = platform.replace(/[^a-z]/g, '');
  if (ICONS[key]) {
    a.classList.add(`social-links-link-${key}`);
    a.innerHTML = `<svg class="social-links-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[key]}</svg>`;
  } else {
    // Unknown platform: keep a visible text label so nothing is lost.
    a.classList.add('social-links-link-text');
    a.textContent = label;
  }
  return a;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'social-links-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    let platform;
    let url;
    let label;

    const explicitLink = row.querySelector('a');
    if (cells.length >= 2) {
      // Two-column shape: platform | url
      platform = platformFromText(cells[0].textContent);
      url = (cells[1].querySelector('a')?.href || cells[1].textContent || '').trim();
      label = cells[0].textContent.trim() || platform;
    } else if (explicitLink) {
      // Single cell containing an anchor whose text is the platform name.
      platform = platformFromText(explicitLink.textContent);
      url = explicitLink.href;
      label = explicitLink.textContent.trim() || platform;
    } else {
      return;
    }

    if (!url) return;

    const li = document.createElement('li');
    li.className = 'social-links-item';
    li.append(buildIconLink(platform, url, label));
    list.append(li);
  });

  block.replaceChildren(list);
}
