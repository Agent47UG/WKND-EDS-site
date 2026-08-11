import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Adventures Block
 * Dynamically lists adventures from the site's query index (default
 * /query-index.json), filtered by a path prefix (default /adventures/), and
 * rendered as accessible cards (linked optimized image + title + description).
 * Adds category filter chips (All + the distinct `category` values found in the
 * index) that filter the grid client-side. The list updates automatically when
 * a new adventure is published - no page edit or code change.
 *
 * Authored content model (document table). The block name is row 1.
 * All config rows are OPTIONAL key/value pairs:
 *
 *   | Adventures    |               |
 *   | path          | /adventures/  |
 *   | limit         | 24            |
 *   | sort          | title         |
 *   | sortDirection | asc           |
 *   | source        | /query-index.json |
 *   | filters       | true          |
 */

const DEFAULTS = {
  source: '/query-index.json',
  path: '/adventures/',
  limit: 24,
  sort: 'title',
  sortDirection: 'asc',
  filters: true,
};

/**
 * Read optional key/value config rows from the authored block.
 * @param {Element} block the block element
 * @returns {object} merged configuration
 */
function readConfig(block) {
  const config = { ...DEFAULTS };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (!key || !value) return;
    if (key === 'limit') {
      const n = parseInt(value, 10);
      config.limit = Number.isNaN(n) ? DEFAULTS.limit : n;
    } else if (key === 'filters') {
      config.filters = value.toLowerCase() !== 'false';
    } else if (['path', 'source', 'sort', 'sortdirection'].includes(key)) {
      config[key === 'sortdirection' ? 'sortDirection' : key] = value;
    }
  });
  return config;
}

/**
 * Fetch the query index, returning an array of entries (or [] on failure).
 * @param {string} source query-index path/URL
 * @returns {Promise<Array>} query index entries
 */
async function fetchIndex(source) {
  try {
    const resp = await fetch(source);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Filter, sort and limit query-index entries per config.
 * @param {Array} entries raw query-index entries
 * @param {object} config resolved configuration
 * @returns {Array} the adventures to render
 */
function selectAdventures(entries, config) {
  const prefix = config.path;
  let items = entries.filter((e) => e.path && e.path.startsWith(prefix));

  const { sort, sortDirection } = config;
  const dir = sortDirection === 'desc' ? -1 : 1;
  items.sort((a, b) => {
    const av = a[sort] ?? '';
    const bv = b[sort] ?? '';
    const an = Number(av);
    const bn = Number(bv);
    if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== '') {
      return (an - bn) * dir;
    }
    return String(av).localeCompare(String(bv)) * dir;
  });

  if (config.limit && config.limit > 0) {
    items = items.slice(0, config.limit);
  }
  return items;
}

/**
 * Normalise a category label to a lowercase token for matching/CSS.
 * @param {string} value the raw category value
 * @returns {string} normalised token
 */
function categoryToken(value) {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Build a single accessible adventure card.
 * @param {object} item a query-index entry
 * @returns {HTMLLIElement} the card list item
 */
function buildCard(item) {
  const li = document.createElement('li');
  li.className = 'adventures-card';
  const cat = categoryToken(item.category);
  if (cat) li.dataset.category = cat;

  const title = item.title || item.path;
  const href = item.path;

  if (item.image) {
    const imageLink = document.createElement('a');
    imageLink.className = 'adventures-card-image';
    imageLink.href = href;
    imageLink.setAttribute('aria-label', title);
    imageLink.append(
      createOptimizedPicture(item.image, title, false, [{ width: '750' }]),
    );
    li.append(imageLink);
  }

  const body = document.createElement('div');
  body.className = 'adventures-card-body';

  if (item.category) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'adventures-card-category';
    eyebrow.textContent = item.category;
    body.append(eyebrow);
  }

  const titleLink = document.createElement('a');
  titleLink.className = 'adventures-card-title';
  titleLink.href = href;
  titleLink.textContent = title;
  const heading = document.createElement('h3');
  heading.append(titleLink);
  body.append(heading);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'adventures-card-description';
    desc.textContent = item.description;
    body.append(desc);
  }

  li.append(body);
  return li;
}

/**
 * Build the category filter toolbar. Returns null if fewer than two categories.
 * @param {Array} items selected adventures
 * @param {Element} list the <ul> of cards to filter
 * @returns {HTMLElement|null} the filter toolbar
 */
function buildFilters(items, list) {
  const cats = [...new Set(items.map((i) => (i.category || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  if (cats.length < 2) return null;

  const nav = document.createElement('div');
  nav.className = 'adventures-filters';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Filter adventures by category');

  const makeBtn = (label, token, pressed) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'adventures-filter';
    btn.textContent = label;
    btn.dataset.filter = token;
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.adventures-filter').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const f = btn.dataset.filter;
      list.querySelectorAll(':scope > .adventures-card').forEach((card) => {
        const show = f === 'all' || card.dataset.category === f;
        card.hidden = !show;
      });
    });
    return btn;
  };

  nav.append(makeBtn('All', 'all', true));
  cats.forEach((c) => nav.append(makeBtn(c, categoryToken(c), false)));
  return nav;
}

/**
 * loads and decorates the adventures block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);

  block.textContent = '';
  block.setAttribute('aria-busy', 'true');
  const status = document.createElement('p');
  status.className = 'adventures-status';
  status.textContent = 'Loading adventures…';
  block.append(status);

  const entries = await fetchIndex(config.source);
  const items = selectAdventures(entries, config);

  block.textContent = '';
  block.removeAttribute('aria-busy');

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'adventures-status adventures-empty';
    empty.textContent = 'No adventures found.';
    block.append(empty);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'adventures-list';
  items.forEach((item) => ul.append(buildCard(item)));

  if (config.filters) {
    const filters = buildFilters(items, ul);
    if (filters) block.append(filters);
  }
  block.append(ul);
}
