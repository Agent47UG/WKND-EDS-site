/*
 * Template-specific progressive enhancements, applied by body template class.
 * Runs after sections/blocks are decorated (called from loadLazy).
 */

/**
 * Article template: build a two-column layout — article body + contributor on
 * the left, related magazine articles as a vertical sidebar on the right — and
 * center the contributor profile. Purely a DOM re-grouping around existing
 * sections; no content changes.
 * @param {Element} main the page main element
 */
function decorateArticle(main) {
  const sections = [...main.querySelectorAll(':scope > .section')];
  const relatedSection = sections.find((s) => s.querySelector('.cards'));
  const bodySections = sections.filter((s) => s !== relatedSection
    && (s.querySelector('.default-content-wrapper') || s.querySelector('.contributor')));

  if (!relatedSection || !bodySections.length) return;
  if (main.querySelector(':scope > .article-layout')) return; // idempotent

  const layout = document.createElement('div');
  layout.className = 'article-layout';

  const body = document.createElement('div');
  body.className = 'article-main';
  bodySections.forEach((s) => body.append(s));

  const aside = document.createElement('aside');
  aside.className = 'article-related';
  // heading for the sidebar
  const heading = document.createElement('h2');
  heading.className = 'article-related-title';
  heading.textContent = 'Related stories';
  aside.append(heading);
  aside.append(relatedSection);

  layout.append(body, aside);
  main.prepend(layout);
}

/**
 * Adventure template: turn the Overview / Itinerary / What to Bring list
 * (authored under "Share this Adventure") into accessible tabs, and move each
 * matching h2 section's content into the corresponding tab panel.
 * @param {Element} main the page main element
 */
function decorateAdventureTabs(main) {
  // the tab labels live in an <ol>/<ul> right after the "Share this Adventure" heading
  const shareHeading = [...main.querySelectorAll('h5, h4, h3')]
    .find((h) => /share this adventure/i.test(h.textContent));
  const list = shareHeading && shareHeading.nextElementSibling;
  if (!list || !/^(OL|UL)$/.test(list.tagName)) return;
  if (main.querySelector('.adventure-tabs')) return; // idempotent

  const labels = [...list.querySelectorAll('li')].map((li) => li.textContent.trim()).filter(Boolean);
  if (labels.length < 2) return;

  // Collect content for each tab: everything from its <h2> up to the next tab's <h2>.
  const allH2 = [...main.querySelectorAll('h2')];
  const startFor = (label) => allH2.find(
    (h) => h.textContent.trim().toLowerCase() === label.toLowerCase(),
  );

  const panels = labels.map((label) => {
    const start = startFor(label);
    const nodes = [];
    if (start) {
      let n = start.nextElementSibling;
      const nextLabels = labels.map((l) => l.toLowerCase());
      while (n) {
        if (n.tagName === 'H2' && nextLabels.includes(n.textContent.trim().toLowerCase())) break;
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
    }
    return { label, start, nodes };
  });

  // Build the tablist + panels.
  const tabs = document.createElement('div');
  tabs.className = 'adventure-tabs';

  const tablist = document.createElement('div');
  tablist.className = 'adventure-tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Adventure details');

  const panelWrap = document.createElement('div');
  panelWrap.className = 'adventure-tabs-panels';

  const idBase = 'adv-tab';
  panels.forEach((panel, i) => {
    const tabId = `${idBase}-${i}`;
    const panelId = `${idBase}-panel-${i}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'adventure-tab';
    btn.id = tabId;
    btn.textContent = panel.label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.tabIndex = i === 0 ? 0 : -1;
    tablist.append(btn);

    const p = document.createElement('div');
    p.className = 'adventure-tab-panel';
    p.id = panelId;
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabId);
    if (i !== 0) p.hidden = true;
    // move the section's h2 + content nodes into the panel
    if (panel.start) p.append(panel.start);
    panel.nodes.forEach((n) => p.append(n));
    panelWrap.append(p);
  });

  const select = (index) => {
    const btns = [...tablist.querySelectorAll('.adventure-tab')];
    const ps = [...panelWrap.querySelectorAll('.adventure-tab-panel')];
    btns.forEach((b, i) => {
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
      b.tabIndex = i === index ? 0 : -1;
    });
    ps.forEach((p, i) => { p.hidden = i !== index; });
  };

  tablist.addEventListener('click', (e) => {
    const btn = e.target.closest('.adventure-tab');
    if (!btn) return;
    select([...tablist.children].indexOf(btn));
  });

  // keyboard navigation (Left/Right/Home/End)
  tablist.addEventListener('keydown', (e) => {
    const btns = [...tablist.querySelectorAll('.adventure-tab')];
    const current = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % btns.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = btns.length - 1;
    else return;
    e.preventDefault();
    select(next);
    btns[next].focus();
  });

  tabs.append(tablist, panelWrap);

  // Insert the tabs where the label list was, and remove the label list.
  list.replaceWith(tabs);
}

/**
 * Apply template enhancements based on the body's template class.
 * @param {Element} main the page main element
 */
export default function decorateTemplates(main) {
  if (document.body.classList.contains('article')) decorateArticle(main);
  if (document.body.classList.contains('adventure')) decorateAdventureTabs(main);
}
