/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes AEM chrome / non-authorable content so the import contains only
 * page-level authorable content. Every selector below was verified against the
 * captured DOM for this site:
 *   - migration-work/home/cleaned.html            (home template)
 *   - migration-work/about/cleaned.html           (about template)
 *   - migration-work/magazine-landing/cleaned.html (magazine-landing template)
 *   - live DOM of https://wknd.site/us/en/magazine/arctic-surfing.html (article template)
 *
 * Not-authorable content stripped: header/footer experience fragments, the
 * language-navigation toggle, the header search widget, breadcrumb navigation,
 * Sign In / Sign Out utility links, carousel prev/next + indicator controls,
 * the "Members Only" locked-teaser (sign-in gated) artifacts, the
 * "SHARE THIS STORY" / Pinterest+Facebook share widget, the mobile nav toggle,
 * and script/style/noscript/iframe elements. No cookie/consent banner exists
 * in the captured DOM (WKND has none), so none is targeted.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable elements that add noise to / interfere with block parsing.
    // Verified in live article DOM (13 <script> tags) and the Adobe demdex iframe
    // seen at body level in the cleaned snapshots.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'iframe', // e.g. <iframe id="destination_publishing_iframe_wkndsite_0" ...demdex...>
    ]);

    // Hero carousel controls live INSIDE the authorable hero carousel block
    // (main .carousel.cmp-carousel--hero). Remove only the controls before the
    // hero parser runs so the parser does not pick up duplicate indicator titles
    // ("WKND Adventures", "San Diego Surf Spots", ...) or Previous/Next buttons.
    // Verified in migration-work/home/cleaned.html (lines 233-249) and live home DOM.
    WebImporter.DOMUtils.remove(element, [
      '.cmp-carousel__actions',
      '.cmp-carousel__indicators',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome experience fragments. Tag + modifier selectors are used so
    // the authorable contributor experience fragments on the about template
    // (section.cmp-experience-fragment--contributor) are NOT matched.
    // Verified in all captured snapshots (header/footer present on every page).
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
    ]);

    // Header utility widgets. These live inside the header XF above, but are also
    // listed explicitly to document intent and guard against pages that render
    // them outside the header. Verified in cleaned snapshots (lines 14-152).
    WebImporter.DOMUtils.remove(element, [
      '.sign-in-buttons', // "Welcome" / Sign In / Sign Out utility links
      '.languagenavigation', // language navigation widget + langnavtoggle (a#langNavToggleHeader)
      '.search.cmp-search--header', // header search widget (form + results)
    ]);

    // Breadcrumb navigation. On the article template this sits in <main>,
    // OUTSIDE the header XF, so it must be removed on its own.
    // Verified in live article DOM (div.breadcrumb > nav.cmp-breadcrumb).
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumb',
    ]);

    // "SHARE THIS STORY" / Pinterest + Facebook share widget (article template).
    // The .sharing div holds the .fb-share-button and the Pinterest anchor.
    // Verified in live article DOM (lines 889-896).
    WebImporter.DOMUtils.remove(element, [
      '.sharing',
      '.fb-share-button',
      'a[data-pin-do]',
    ]);

    // The "SHARE THIS STORY" heading is a sibling .title block with only a
    // generic class, so target it by its (verified) text and remove its wrapper.
    // The adjacent related-articles list (.cmp-list--upnext) is left intact.
    element.querySelectorAll('.cmp-title__text').forEach((t) => {
      if (t.textContent.trim().toUpperCase() === 'SHARE THIS STORY') {
        const wrapper = t.closest('.title') || t.closest('.cmp-title');
        if (wrapper) wrapper.remove();
      }
    });

    // "Members Only" locked-teaser sign-in gating artifacts (magazine-landing).
    // These secure teasers have non-functional "Read More" (no href) because the
    // content is gated behind sign-in; they cannot round-trip through an anonymous
    // scrape. The "Members Only" heading + "Sign in to un-lock..." CTA text are
    // kept as authorable default content. Verified in
    // migration-work/magazine-landing/cleaned.html (lines 291-329).
    WebImporter.DOMUtils.remove(element, [
      '.teaser.cmp-teaser--secure',
    ]);

    // Mobile navigation chrome rendered at body level after the footer.
    // Verified in cleaned snapshots (home lines 568-596).
    WebImporter.DOMUtils.remove(element, [
      '#toggleNav',
      '#mobileNav',
      '.cmp-navigation--mobile',
    ]);
  }
}
