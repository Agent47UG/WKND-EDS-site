/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import contributorParser from './parsers/contributor.js';
import socialLinksParser from './parsers/social-links.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';
import linksTransformer from './transformers/wknd-links.js';
import enrichArticleMetadata from './lib/article-metadata.js';

// PARSER REGISTRY
const parsers = {
  contributor: contributorParser,
  'social-links': socialLinksParser,
  cards: cardsParser,
};

// TRANSFORMER REGISTRY (cleanup first, then sections, then link rewrite)
const transformers = [cleanupTransformer, sectionsTransformer, linksTransformer];

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'article',
  description: 'Magazine article: breadcrumb, title + byline, body, contributor + social-links, related-articles list.',
  urls: [
    'https://wknd.site/us/en/magazine/arctic-surfing.html',
    'https://wknd.site/us/en/magazine/san-diego-surf.html',
    'https://wknd.site/us/en/magazine/ski-touring.html',
    'https://wknd.site/us/en/magazine/guide-la-skateparks.html',
    'https://wknd.site/us/en/magazine/western-australia.html',
  ],
  blocks: [
    { name: 'contributor', instances: ['main .cmp-byline'] },
    { name: 'social-links', instances: ['main .cmp-buildingblock--btn-list'] },
    { name: 'cards', instances: ['aside .cmp-list, .cmp-list--related'] },
  ],
};

/**
 * Map a WKND source URL path to the new EDS content path.
 * @param {string} originalURL the source URL
 * @returns {string} the sanitized target path (no extension)
 */
function generateDocumentPath(originalURL) {
  let p = new URL(originalURL).pathname
    .replace(/\.html?$/, '')
    .replace(/\/$/, '');
  p = p.replace(/^\/us\/en/, '');
  if (p === '' || p === '/') p = '/index';
  p = p.replace(/^\/about-us$/, '/about');
  return WebImporter.FileUtils.sanitizePath(p);
}

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName 'beforeTransform' or 'afterTransform'
 * @param {Element} element the DOM element to transform
 * @param {Object} payload { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * @param {Document} document the DOM document
 * @param {Object} template the embedded PAGE_TEMPLATE object
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Enrich the article's metadata block with Image, Author, Publication Date,
    // Template (must run AFTER createMetadata so it merges into that block).
    enrichArticleMetadata(main, document, params);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = generateDocumentPath(params.originalURL);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
