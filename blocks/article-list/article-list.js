import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Article List Block
 * Dynamically lists articles from the site's query index (default
 * /query-index.json), filtered by a path prefix (default /magazine/),
 * sorted by a field (default 'date' descending), and rendered as
 * accessible cards (linked optimized image + title + description).
 *
 * The block updates automatically when new articles are published - no
 * page edit or code change is required.
 *
 * Authored content model (document table). The block name is row 1.
 * All config rows are OPTIONAL key/value pairs:
 *
 *   | Article List  |            |
 *   | path          | /magazine/ |
 *   | limit         | 12         |
 *   | sort          | date       |
 *   | sortDirection | desc       |
 *   | source        | /query-index.json |
 *
 * A block with no config rows (just the "Article List" header) lists all
 * /magazine/ articles, newest first, capped at 12.
 */

const DEFAULTS = {
  source: '/query-index.json',
  path: '/magazine/',
  limit: 12,
  sort: 'date',
  sortDirection: 'desc',
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
    } else if (key === 'path' || key === 'source' || key === 'sort' || key === 'sortdirection') {
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
 * @returns {Array} the articles to render
 */
function selectArticles(entries, config) {
  const prefix = config.path;
  let articles = entries.filter((e) => e.path && e.path.startsWith(prefix));

  const { sort, sortDirection } = config;
  const dir = sortDirection === 'asc' ? 1 : -1;
  articles.sort((a, b) => {
    const av = a[sort] ?? '';
    const bv = b[sort] ?? '';
    // numeric compare when both look numeric (e.g. epoch dates), else string
    const an = Number(av);
    const bn = Number(bv);
    if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== '') {
      return (an - bn) * dir;
    }
    return String(av).localeCompare(String(bv)) * dir;
  });

  if (config.limit && config.limit > 0) {
    articles = articles.slice(0, config.limit);
  }
  return articles;
}

/**
 * Build a single accessible article card.
 * @param {object} article a query-index entry
 * @returns {HTMLLIElement} the card list item
 */
function buildCard(article) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const title = article.title || article.path;
  const href = article.path;

  if (article.image) {
    const imageLink = document.createElement('a');
    imageLink.className = 'article-list-card-image';
    imageLink.href = href;
    imageLink.setAttribute('aria-label', title);
    imageLink.append(
      createOptimizedPicture(article.image, title, false, [{ width: '750' }]),
    );
    li.append(imageLink);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const titleLink = document.createElement('a');
  titleLink.className = 'article-list-card-title';
  titleLink.href = href;
  titleLink.textContent = title;
  const heading = document.createElement('h3');
  heading.append(titleLink);
  body.append(heading);

  if (article.description) {
    const desc = document.createElement('p');
    desc.className = 'article-list-card-description';
    desc.textContent = article.description;
    body.append(desc);
  }

  li.append(body);
  return li;
}

/**
 * loads and decorates the article-list block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readConfig(block);

  // loading state
  block.textContent = '';
  block.setAttribute('aria-busy', 'true');
  const status = document.createElement('p');
  status.className = 'article-list-status';
  status.textContent = 'Loading articles…';
  block.append(status);

  const entries = await fetchIndex(config.source);
  const articles = selectArticles(entries, config);

  block.textContent = '';
  block.removeAttribute('aria-busy');

  if (!articles.length) {
    const empty = document.createElement('p');
    empty.className = 'article-list-status article-list-empty';
    empty.textContent = 'No articles found.';
    block.append(empty);
    return;
  }

  const ul = document.createElement('ul');
  articles.forEach((article) => ul.append(buildCard(article)));
  block.append(ul);
}
