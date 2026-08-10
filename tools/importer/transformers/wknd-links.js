/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND internal-link rewrite.
 *
 * Rewrites source WKND internal links (/us/en/...) to the new EDS structure so
 * imported content points at the migrated pages:
 *   - /us/en.html                       -> /
 *   - /us/en/about-us.html              -> /about
 *   - /us/en/magazine.html              -> /magazine
 *   - /us/en/magazine/<slug>.html       -> /magazine/<slug>
 *   - /us/en/<path>.html                -> /<path>   (locale prefix + .html stripped)
 *
 * Absolute wknd.site URLs pointing at the same locale are normalised the same
 * way. External links and in-page anchors (#...) are left untouched.
 */

const LOCALE_PREFIX = '/us/en';

/**
 * Rewrite a single href from the WKND locale structure to the new EDS path.
 * @param {string} href the original href
 * @returns {string|null} the rewritten href, or null to leave it unchanged
 */
function rewriteHref(href) {
  if (!href) return null;
  if (href.startsWith('#')) return null;

  let path = href;

  // Absolute wknd.site URL -> use its pathname (drop the origin).
  const abs = href.match(/^https?:\/\/(?:[^/]*\.)?wknd\.site(\/[^?#]*)?([?#].*)?$/i);
  if (abs) {
    path = abs[1] || '/';
  } else if (/^https?:\/\//i.test(href)) {
    // Some other absolute URL — leave it alone.
    return null;
  }

  // Only rewrite locale-scoped internal paths.
  if (path !== LOCALE_PREFIX && !path.startsWith(`${LOCALE_PREFIX}/`) && path !== `${LOCALE_PREFIX}.html`) {
    // e.g. "/us/en.html" is handled below; anything not under the locale is left as-is.
    if (path !== `${LOCALE_PREFIX}.html`) return null;
  }

  let out = path
    .replace(/\.html?(?=$|[?#])/, '')
    .replace(new RegExp(`^${LOCALE_PREFIX}`), '');

  if (out === '' || out === '/') out = '/';
  out = out.replace(/^\/about-us$/, '/about');

  return out;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const { document } = payload;
  const root = element || document.body;

  root.querySelectorAll('a[href]').forEach((a) => {
    const rewritten = rewriteHref(a.getAttribute('href'));
    if (rewritten !== null) a.setAttribute('href', rewritten);
  });
}
