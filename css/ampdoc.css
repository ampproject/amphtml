

/**
 * @fileoverview CSS specifically for non-AMP4ADS formats.
 */

/**
 * Horizontal scrolling interferes with embedded scenarios and predominantly
 * the result of the non-responsive design.
 *
 * Notice that it's critical that `overflow-x: hidden` is only set on `html`
 * and not `body`. Otherwise, adding `overflow-x: hidden` forces `overflow-y`
 * to be computed to `auto` on both the `body` and `html` elements so they both
 * potentially get a scrolling box. See #3108 for more details.
 */
html {
  overflow-x: hidden !important;
}

html.i-amphtml-fie {
  height: 100% !important;
  width: 100% !important;
}

html:not([amp4ads]),
html:not([amp4ads]) body {
  height: auto !important;
}

/**
 * Margin:0 is currently needed for iOS viewer embeds.
 * See:
 * https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-layout.md
 */
html:not([amp4ads]) body {
  margin: 0 !important;
}

/** These properties can be overriden by user stylesheets. */
body {
  /* Text adjust is set to 100% to avoid iOS Safari bugs in Viewer where
     the font-size is sometimes not restored during orientation. See #449. */
  text-size-adjust: 100%;
}

/**
 * The enables passive touch handlers, e.g. for document swipe, since they
 * no will longer need to try to cancel vertical scrolls during swipes.
 * This is only done in the embedded mode because (a) the document swipe
 * is only possible in this case, and (b) we'd like to preserve pinch-zoom.
 */
html.i-amphtml-singledoc.i-amphtml-embedded {
  touch-action: pan-y pinch-zoom;
}

/**
 * Override a user-supplied `body{overflow: visible; position:relative}`. This
 * style is set in runtime vs css to avoid conflicts with ios-embedded mode
 * and fixed transfer layer.
 *
 * Reasoning behind not targeting inabox can be found at:
 * https://github.com/ampproject/amphtml/issues/18065
 */
html.i-amphtml-singledoc > body,
html.i-amphtml-fie > body {
  overflow: visible !important;
}

/**
 * The `position: relative` is necessary to ensure that `paddingTop` can be
 * applied to a document to offset the header height, and it doesn't missplace
 * `position: absolute` elements.
 */
html.i-amphtml-singledoc:not(.i-amphtml-inabox) > body,
html.i-amphtml-fie:not(.i-amphtml-inabox) > body {
  position: relative !important;
}


/**
 * iOS-Embed mode (iOS <= 8). The `body` itself is scrollable.
 */
html.i-amphtml-ios-embed-legacy > body {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  position: absolute !important;
}

/**
 * iOS-Embed Wrapper mode. The `body` is wrapped into `#i-amphtml-wrapper`
 * element.
 */
html.i-amphtml-ios-embed {
  overflow-y: auto !important;
  position: static;
}

/** Wrapper for iOS Embed Wrapper mode (iOS <= 12). */
#i-amphtml-wrapper {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  display: block !important;
}

/**
 * Overflow scrolling is set separately on iOS, after DOMReady due to various
 * rendering bugs. See #8798 for details.
 */
html.i-amphtml-ios-embed.i-amphtml-ios-overscroll,
html.i-amphtml-ios-embed.i-amphtml-ios-overscroll > #i-amphtml-wrapper {
  -webkit-overflow-scrolling: touch !important;
}

#i-amphtml-wrapper > body {
  /* Make sure position:absolute elements are positioned relative to the body,
     not i-amphtml-wrapper */
  position: relative !important;
  /* `body` must have a 1px transparent border for two purposes:
      (1) to cancel out margin collapse in body's children so that position
          absolute element is positioned correctly
      (2) to offset scroll adjustment to 1 to avoid scroll freeze problem. */
  border-top: 1px solid transparent !important;
}

/**
 * Hide the fixed layer when a lightbox is opened. This prevents buggy UX where
 * fixed elements are displayed on top of lightboxes...
 */
#i-amphtml-wrapper + body {
  visibility: visible;
}
#i-amphtml-wrapper + body[i-amphtml-lightbox] {
  visibility: hidden;
}
/**
 * ...except for fixed-position descendants of lightboxes, which we only want
 * to show when a lightbox is open. Note this is the opposite visibility of
 * the fixed layer itself! See fixed-layer.js#enterLightbox() for details.
 */
#i-amphtml-wrapper + body .i-amphtml-lightbox-element {
  visibility: hidden;
}
#i-amphtml-wrapper + body[i-amphtml-lightbox] .i-amphtml-lightbox-element {
  visibility: visible;
}


.i-amphtml-scroll-disabled {
  overflow-x: hidden !important;
  overflow-y: hidden !important;
}

#i-amphtml-wrapper.i-amphtml-scroll-disabled {
  overflow-x: hidden !important;
  overflow-y: hidden !important;
}

/**
 * Instagram wraps the standard image into a fixed size container.
 * With these offsets, users can simply specify the the size of the
 * instagram images and things have the right size.
 * In particular the effect of adding padding to this container is
 * that with responsive layouts the responsiveness is based on the
 * asset while the padding stays constant.
 * This information is here instead of living with the CSS of the
 * component, so that the runtime can reserve the correct space
 * before the instagram implementation loads.
 */
amp-instagram {
  padding: 54px 0px 0px 0px !important;
  background-color: white;
}

/**
 * Iframe allows setting frameborder, so we need to set box-sizing to border-box
 * or otherwise the iframe will oevrflow its parent when there is a border.
 */
amp-iframe iframe {
  box-sizing: border-box !important;
}

/**
 * Minimal AMP Access CSS. This part has to be here so that the correct UI
 * can be provided before AMP Access JS has been loaded.
 */
[amp-access][amp-access-hide] {
  display: none;
}

/**
 * Minimal Subscriptions CSS. This part initially disables all of the UI
 * until the complete rules are loaded as part of amp-subscriptions extension.
 * Notice that, the `[subscription-dialog]` elements are always hidden.
 */
body:not(.i-amphtml-subs-ready) [subscriptions-section],
body:not(.i-amphtml-subs-ready) [subscriptions-action],
[subscriptions-dialog] {
  display: none !important;
}


/**
 * Hide the update reference point of amp-live-list by default. This is
 * reset by the `amp-live-list > .amp-active[update]` selector.
 */
amp-live-list > [update] {
  display: none;
}

/**
 * Display none elements
 */
amp-experiment {
  display: none;
}

/* amp-list CSS to avoid FOUC */

/**
 * The default amp-hidden changes visibility, which takes up space. In the case
 * where amp-list becomes a container via the resizable-children attribute, the
 * loader should be fully hidden and not take up space.
 */
amp-list[resizable-children] > .i-amphtml-loading-container.amp-hidden {
  display: none !important;
}

/* load-more elements should be hidden by default */
amp-list[load-more] [load-more-loading],
amp-list[load-more] [load-more-failed],
amp-list[load-more] [load-more-button],
amp-list[load-more] [load-more-end]
{
  display: none;
}

/**
 * amp-list error messaging container should be hidden at first.
 */
 amp-list [fetch-error] {
  display: none;
}

/**
 * amp-list initial content should be displayed (similar to placeholder).
 */
amp-list[diffable] div[role="list"] {
  display: block;
}

/**
 * amp-story
 */
amp-story[standalone], amp-story-page {
  /* Ensures amp-story and amp-story-page have a height and are prerendered. */
  min-height: 1px !important;
  display: block !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  width: 100% !important;
}

amp-story[standalone] {
  background-color: #000 !important;
  position: relative !important;
}

amp-story-page {
  background-color: #757575;
}

/* Hide amp-loader in stories
 * TODO(maxbittker): remove after amp-loader is no longer imported in stories
 */
amp-story .amp-active > div,
amp-story .i-amphtml-loader-background {
  display: none !important;
}

/**
 * Uses a selector that stops targeting amp-story-page elements once they have a
 * [distance] or [active] attribute, so amp-story.css doesn't have to rely on
 * CSS specificity hacks to override these styles after the JavaScript ran.
 */
amp-story-page:not(:first-of-type):not([distance]):not([active]) {
  transform: translateY(1000vh) !important;
}

/**
 * amp-autocomplete to avoid FOUC.
 */
amp-autocomplete {
  position: relative !important;
  display: inline-block !important;
}

amp-autocomplete > input,
amp-autocomplete > textarea {
  padding: 0.5rem; /* default-ui-space-large */
  border: 1px solid rgba(0, 0, 0, 0.33); /* default-ui-med-gray */
}

amp-autocomplete > input,
amp-autocomplete > textarea,
.i-amphtml-autocomplete-results {
  font-size: 1rem; /* default-ui-font-size */
  line-height: 1.5rem; /* default-ui-space-large */
}

/**
 * amp-fx
 */

/**
 * In ampfx-preset-utils.js we are installing styles once the extension is
 * loaded. This cause the element to jump. This is a fix for that, which
 * doesn't push the preset's defaults into v0.js making it larger.
 */
[amp-fx^="fly-in"] {
  visibility: hidden;
}

/**
 * amp-script[nodom] is an element with no UI, similar to amp-analytics.
 */
amp-script[nodom], amp-script[sandboxed] {
  /* Fixed to make position independent of page other elements. */
  position: fixed !important;
  top: 0 !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  visibility: hidden;
}
