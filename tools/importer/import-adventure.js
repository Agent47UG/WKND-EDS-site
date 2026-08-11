/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';
import linksTransformer from './transformers/wknd-links.js';
import enrichAdventureMetadata from './lib/adventure-metadata.js';
import injectAdventureInfo from './lib/adventure-info.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
};

// TRANSFORMER REGISTRY (cleanup first, then sections, then link rewrite)
const transformers = [cleanupTransformer, sectionsTransformer, linksTransformer];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'adventure',
  description: 'Adventure detail page: title, hero, trip body/itinerary, related-adventures list.',
  urls: [
    'https://wknd.site/us/en/adventures/climbing-new-zealand.html',
    'https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html',
    'https://wknd.site/us/en/adventures/tahoe-skiing.html',
    'https://wknd.site/us/en/adventures/west-coast-cycling.html',
    'https://wknd.site/us/en/adventures/whistler-mountain-biking.html',
    'https://wknd.site/us/en/adventures/yosemite-backpacking.html',
  ],
  blocks: [
    { name: 'cards', instances: ['aside .cmp-list, .cmp-list--related, .cmp-list--upnext'] },
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
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
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
      }
    });

    executeTransformers('afterTransform', main, payload);

    // Inject the adventure-info block (trip facts as small cards) after the H1.
    injectAdventureInfo(main, document, params);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Enrich with Image, Category, Template (must run AFTER createMetadata).
    enrichAdventureMetadata(main, document, params);
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
