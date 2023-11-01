'use strict';

/*eslint "max-len": 0*/

// This expands into
//   - `src/*.js`` -> all JS files directly under `src`
//   - `src/!(core)/**/*.js` -> all JS files in subfolders excluding `src/core`
const SRC_EXCLUDING_CORE = 'src{,/!(core)/**}/*.js';

// It is often OK to add things to the allowlist, but make sure to highlight
// this in review.
exports.rules = [
  // Global rules
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/video-iframe-integration.js',
    allowlist: [
      // Do not extend this allowlist.
      // video-iframe-integration.js is an entry point.
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/sanitizer.js',
    allowlist: [
      // DEPRECATED: Use src/purifier.js instead. @choumx for questions.
      'extensions/amp-mustache/0.1/amp-mustache.js->src/sanitizer.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/compiler/**/*.js',
    allowlist: [],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/purifier/**/*.js',
    allowlist: [
      // WARNING: Importing purifier.js will also bundle DOMPurify (13KB).
      'extensions/amp-list/0.1/amp-list.js->src/purifier/sanitation.js',
      'extensions/amp-mustache/0.2/amp-mustache.js->src/purifier/index.js',
      'extensions/amp-script/0.1/amp-script.js->src/purifier/index.js',
      'src/purifier/index.js->src/purifier/sanitation.js',
      'src/sanitizer.js->src/purifier/sanitation.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/module.js',
    allowlist: [
      'extensions/amp-date-picker/0.1/**->src/module.js',
      'extensions/amp-inputmask/0.1/**->src/module.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'third_party/**/*.js',
    allowlist: [
      'extensions/amp-autocomplete/**/*.js->third_party/fuzzysearch/index.js',
      'extensions/amp-crypto-polyfill/**/*.js->third_party/closure-library/sha384-generated.js',
      'extensions/amp-list/**->third_party/set-dom/set-dom.js',
      'extensions/amp-mustache/**/amp-mustache.js->third_party/mustache/mustache.js',
      'extensions/amp-recaptcha-input/**/*.js->third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm.js',
      'extensions/amp-resize-observer-polyfill/**/*.js->third_party/resize-observer-polyfill/ResizeObserver.install.js',
      'extensions/amp-story-360/0.1/amp-story-360.js->third_party/zuho/zuho.js',
      'extensions/amp-subscriptions-google/**/*.js->third_party/subscriptions-project/swg.js',
      'extensions/amp-subscriptions-google/**/*.js->third_party/subscriptions-project/swg-gaa.js',
      'extensions/amp-subscriptions/**/*.js->third_party/subscriptions-project/aes_gcm.js',
      'extensions/amp-subscriptions/**/*.js->third_party/subscriptions-project/config.js',
      'src/core/dom/css-selectors.js->third_party/css-escape/css-escape.js',
      'src/sanitizer.js->third_party/caja/html-sanitizer.js',
      'src/shadow-embed.js->third_party/webcomponentsjs/ShadowCSS.js',
    ],
  },
  // Rules for 3p
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: SRC_EXCLUDING_CORE,
    allowlist: [
      '3p/**->src/utils/log.js',
      '3p/**->src/url.js',
      '3p/**->src/config/urls.js',
      '3p/**->src/mode.js',
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
      '3p/polyfills.js->src/polyfills/string-starts-with.js',
      '3p/messaging.js->src/utils/event-helper.js',
      '3p/bodymovinanimation.js->src/utils/event-helper.js',
      '3p/iframe-messaging-client.js->src/utils/event-helper.js',
      '3p/viqeoplayer.js->src/utils/event-helper.js',
    ],
  },
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
  },
  // Rules for ads
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: SRC_EXCLUDING_CORE,
    allowlist: [
      'ads/**->src/utils/log.js',
      'ads/**->src/mode.js',
      'ads/**->src/url.js',
      // ads/google/a4a doesn't contain 3P ad code and should probably move
      // somewhere else at some point
      'ads/google/a4a/**->src/ad-cid.js',
      'ads/google/a4a/**->src/experiments/index.js',
      'ads/google/a4a/**->src/service/index.js',
      'ads/google/a4a/utils.js->src/service/variable-source.js',
      'ads/google/a4a/utils.js->src/ini-load.js',
      // IMA, similar to other non-Ad 3Ps above, needs access to event-helper
      'ads/google/ima/ima-video.js->src/utils/event-helper.js',
    ],
  },
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    allowlist: [
      // See todo note in ads/_a4a-config.js
      'ads/google/a4a/utils.js->extensions/amp-geo/0.1/amp-geo-in-group.js',
    ],
  },
  // Rules for extensions and main src.
  {
    filesMatching: '{src,extensions}/**/*.js',
    mustNotDependOn: '3p/**/*.js',
    allowlist: [
      'src/inabox/inabox-iframe-messaging-client.js->3p/iframe-messaging-client.js',
    ],
  },

  // Rules for extensions.
  {
    // Extensions can't depend on other extensions.
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    allowlist: [
      // a4a ads depend on a4a.
      'extensions/amp-ad-network-nws-impl/0.1/amp-ad-network-nws-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-fake-impl/0.1/amp-ad-network-fake-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-smartads-impl/0.1/amp-ad-network-smartads-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/sra-utils.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-oblivki-impl/0.1/amp-ad-network-oblivki-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-valueimpression-impl/0.1/amp-ad-network-valueimpression-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-dianomi-impl/0.1/amp-ad-network-dianomi-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-smartadserver-impl/0.1/amp-ad-network-smartadserver-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-mgid-impl/0.1/amp-ad-network-mgid-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',

      // A4A impls importing amp fast fetch header name
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->extensions/amp-a4a/0.1/signature-verifier.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/signature-verifier.js',

      // And a few more things depend on a4a.
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/amp-ad-network-base.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/amp-ad-type-defs.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/name-frame-renderer.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/template-renderer.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/template-validator.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-ad-template-helper.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-ad-type-defs.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-ad-utils.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/refresh-manager.js',
      'extensions/amp-ad-network-valueimpression-impl/0.1/amp-ad-network-valueimpression-impl.js->extensions/amp-a4a/0.1/refresh-manager.js',

      // AMP access depends on AMP access
      'extensions/amp-access-scroll/0.1/scroll-impl.js->extensions/amp-access/0.1/amp-access-client.js',

      // Ads needs concurrent loading
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->extensions/amp-ad/0.1/concurrent-load.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-ad/0.1/concurrent-load.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->extensions/amp-ad/0.1/concurrent-load.js',

      // Ads needs iframe transports
      'extensions/amp-ad-exit/0.1/config.js->extensions/amp-analytics/0.1/iframe-transport-vendors.js',

      // Amp carousel (and friends) depending on base carousel
      'extensions/amp-carousel/0.2/amp-carousel.js->extensions/amp-base-carousel/0.1/action-source.js',
      'extensions/amp-carousel/0.2/amp-carousel.js->extensions/amp-base-carousel/0.1/carousel.js',
      'extensions/amp-carousel/0.2/amp-carousel.js->extensions/amp-base-carousel/0.1/carousel-events.js',
      'extensions/amp-carousel/0.2/amp-carousel.js->extensions/amp-base-carousel/0.1/child-layout-manager.js',
      'extensions/amp-inline-gallery/0.1/amp-inline-gallery.js->extensions/amp-base-carousel/0.1/carousel-events.js',
      'extensions/amp-inline-gallery/0.1/amp-inline-gallery-thumbnails.js->extensions/amp-base-carousel/0.1/carousel-events.js',

      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/action-source.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/carousel.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/carousel-events.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/child-layout-manager.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/responsive-attributes.js',

      // <amp-date-display> versions share these date format helpers
      'extensions/amp-date-display/**->extensions/amp-date-display/format.js',

      // <amp-list> and <amp-render> share some logic
      'extensions/amp-list/1.0/amp-list.js**->extensions/amp-render/1.0/shared/amp-fetch-utils.js',

      // Facebook components
      'extensions/amp-facebook/1.0/amp-facebook.js->extensions/amp-facebook/0.1/facebook-loader.js',
      'extensions/amp-facebook-page/0.1/amp-facebook-page.js->extensions/amp-facebook/0.1/facebook-loader.js',
      'extensions/amp-facebook-comments/0.1/amp-facebook-comments.js->extensions/amp-facebook/0.1/facebook-loader.js',

      // Amp geo in group enum
      'extensions/amp-a4a/0.1/amp-a4a.js->extensions/amp-geo/0.1/amp-geo-in-group.js',
      'extensions/amp-consent/0.1/consent-config.js->extensions/amp-geo/0.1/amp-geo-in-group.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js->extensions/amp-geo/0.1/amp-geo-in-group.js',

      // AMP Story
      'extensions/amp-story/1.0/animation-types.js->extensions/amp-animation/0.1/web-animation-types.js',
      // AMP Story 360
      'extensions/amp-story-360/0.1/amp-story-360.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-360/0.1/amp-story-360.js->extensions/amp-story/1.0/utils.js',
      // AMP Story Panning Media
      'extensions/amp-story-panning-media/0.1/amp-story-panning-media.js->extensions/amp-story/1.0/amp-story-store-service.js',
      // Story ads
      'extensions/amp-story-auto-ads/0.1/algorithm-count-pages.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/algorithm-predetermined.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-page.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-page-manager.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/events.js',
      // TODO(#24080) Remove this when story ads have full ad network support.
      'extensions/amp-story-auto-ads/0.1/story-ad-page.js->extensions/amp-ad-exit/0.1/config.js',
      // TODO(ccordry): remove this after createShadowRootWithStyle is moved to src
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-ui.js->extensions/amp-story/1.0/utils.js',

      // Story captions
      'extensions/amp-story-captions/0.1/amp-story-captions.js->extensions/amp-story/1.0/utils.js',

      // Story education
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/amp-story-localization-service.js',

      // Story share menu
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-social-share/0.1/amp-social-share.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/request-utils.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/toast.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/amp-story-viewer-messaging-handler.js',

      // Story Shopping
      'extensions/amp-story-shopping/0.1/amp-story-shopping.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-config.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-config.js->extensions/amp-story/1.0/request-utils.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-tag.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-tag.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-attachment.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-attachment.js->extensions/amp-story/1.0/variable-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-attachment.js->extensions/amp-story/1.0/story-analytics.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-attachment.js->extensions/amp-story/1.0/history.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-tag.js->extensions/amp-story/1.0/variable-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-tag.js->extensions/amp-story/1.0/story-analytics.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-tag.js->extensions/amp-story/1.0/history.js',

      // Interactive components that depend on story functionality.
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/story-analytics.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/request-utils.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/variable-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-img-quiz.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-results.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-interactive/0.1/interactive-disclaimer.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-slider.js->extensions/amp-story/1.0/amp-story-store-service.js',

      // AMP Story Subscriptions.
      'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions.js->extensions/amp-story/1.0/amp-story-viewer-messaging-handler.js',
      'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions.js->extensions/amp-story/1.0/story-analytics.js',

      // AMP Story audio sticker.
      'extensions/amp-story-audio-sticker/0.1/amp-story-audio-sticker.js->extensions/amp-story/1.0/amp-story-store-service.js',

      // Story localization.
      'extensions/amp-story-360/0.1/amp-story-360.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-img-quiz.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-quiz.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-share-menu/0.1/amp-story-share-menu.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-draggable-drawer.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-form.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-page-attachment.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-shopping/0.1/amp-story-shopping-attachment.js->extensions/amp-story/1.0/amp-story-localization-service.js',
      'extensions/amp-story-subscriptions/0.1/amp-story-subscriptions.js->extensions/amp-story/1.0/amp-story-localization-service.js',

      // Subscriptions.
      'extensions/amp-subscriptions/0.1/expr.js->extensions/amp-access/0.1/access-expr.js',
      'extensions/amp-subscriptions/0.1/local-subscription-platform-iframe.js->extensions/amp-access/0.1/iframe-api/messenger.js',
      'extensions/amp-subscriptions/0.1/viewer-subscription-platform.js->extensions/amp-access/0.1/jwt.js',
      'extensions/amp-subscriptions/0.1/actions.js->extensions/amp-access/0.1/login-dialog.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/analytics.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/doc-impl.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/entitlement.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/constants.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/url-builder.js',

      // amp-smartlinks depends on amp-skimlinks/link-rewriter
      'extensions/amp-smartlinks/0.1/amp-smartlinks.js->extensions/amp-skimlinks/0.1/link-rewriter/link-rewriter-manager.js',
      'extensions/amp-smartlinks/0.1/linkmate.js->extensions/amp-skimlinks/0.1/link-rewriter/two-steps-response.js',

      'extensions/amp-story-page-attachment/0.1/amp-story-draggable-drawer.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-draggable-drawer.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-form.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-form.js->extensions/amp-story/1.0/loading-spinner.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-open-page-attachment.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-page-attachment.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-page-attachment.js->extensions/amp-story/1.0/history.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-page-attachment.js->extensions/amp-story/1.0/story-analytics.js',
      'extensions/amp-story-page-attachment/0.1/amp-story-page-attachment.js->extensions/amp-story/1.0/utils.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
    allowlist: [
      'extensions/**/*.js->src/service/index.js',
      'extensions/amp-a4a/0.1/a4a-variable-source.js->' +
        'src/service/variable-source.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->' +
        'src/service/url-replacements-impl.js',
      // Real time config.
      'extensions/amp-a4a/0.1/amp-a4a.js->' +
        'src/service/real-time-config/real-time-config-impl.js',
      // Parsing extension urls.
      'extensions/amp-a4a/0.1/head-validation.js->' +
        'src/service/extension-script.js',
      'extensions/amp-a4a/0.1/amp-ad-utils.js->' +
        'src/service/extension-script.js',
      'extensions/amp-live-list/0.1/live-list-manager.js->' +
        'src/service/extension-script.js',
      'extensions/amp-jwplayer/0.1/amp-jwplayer.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-video/0.1/amp-video.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-video-iframe/0.1/amp-video-iframe.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-ooyala-player/0.1/amp-ooyala-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-youtube/0.1/amp-youtube.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-viqeo-player/0.1/amp-viqeo-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-brightcove/0.1/amp-brightcove.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-powr-player/0.1/amp-powr-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-dailymotion/0.1/amp-dailymotion.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-brid-player/0.1/amp-brid-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-gfycat/0.1/amp-gfycat.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-connatix-player/0.1/amp-connatix-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-a4a/0.1/friendly-frame-util.js->' +
        'src/service/url-replacements-impl.js',
      'extensions/amp-nexxtv-player/0.1/amp-nexxtv-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-3q-player/0.1/amp-3q-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-ima-video/0.1/amp-ima-video.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-minute-media-player/0.1/amp-minute-media-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-vimeo/0.1/amp-vimeo.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-wistia-player/0.1/amp-wistia-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-delight-player/0.1/amp-delight-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-slikeplayer/0.1/amp-slikeplayer.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-position-observer/0.1/amp-position-observer.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-position-observer/0.1/amp-position-observer.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-analytics/0.1/cookie-writer.js->' +
        'src/service/cid-impl.js',
      'extensions/amp-consent/0.1/consent-state-manager.js->' +
        'src/service/cid-impl.js',
      'extensions/amp-consent/0.1/cookie-writer.js->' +
        'src/service/cid-impl.js',
      'extensions/amp-next-page/0.1/next-page-service.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-next-page/0.1/next-page-service.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-next-page/1.0/visibility-observer.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-next-page/1.0/visibility-observer.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js->' +
        'src/service/notification-ui-manager.js',
      'extensions/amp-consent/0.1/amp-consent.js->' +
        'src/service/notification-ui-manager.js',
      'extensions/amp-google-read-aloud-player/0.1/amp-google-read-aloud-player.js->' +
        'src/service/video-manager-impl.js',
      // Accessing USER_INTERACTED constant:
      'extensions/amp-story/1.0/page-advancement.js->' +
        'src/service/action-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->' +
        'src/service/navigation.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->' +
        'src/service/navigation.js',
      'extensions/amp-mowplayer/0.1/amp-mowplayer.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-analytics/0.1/linker-manager.js->' +
        'src/service/navigation.js',
      'extensions/amp-skimlinks/0.1/link-rewriter/link-rewriter-manager.js->' +
        'src/service/navigation.js',
      // Accessing extension-script.calculateExtensionScriptUrl().
      'extensions/amp-script/0.1/amp-script.js->' +
        'src/service/extension-script.js',
      // Origin experiments.
      'extensions/amp-experiment/1.0/amp-experiment.js->' +
        'src/service/origin-experiments-impl.js',
      // For action macros.
      'extensions/amp-link-rewriter/0.1/amp-link-rewriter.js->' +
        'src/service/navigation.js',
      // For localization.
      'extensions/amp-story/1.0/amp-story-localization-service.js->src/service/localization/index.js',
      'extensions/amp-story*/**/*.js->src/service/localization/strings.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-localization.js->src/service/localization/index.js',
      'extensions/amp-story/1.0/amp-story.js->src/service/extension-script.js',

      // Accessing calculateScriptBaseUrl() for vendor config URLs
      'extensions/amp-analytics/0.1/config.js->' +
        'src/service/extension-script.js',
      // Experiment moving Fixed Layer to extension
      'extensions/amp-viewer-integration/0.1/amp-viewer-integration.js->' +
        'src/service/fixed-layer.js',
      // Ads remote config manager
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->src/service/real-time-config/callout-vendors.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->src/service/real-time-config/real-time-config-impl.js',
      'extensions/amp-ad-network-valueimpression-impl/0.1/amp-ad-network-valueimpression-impl.js->src/service/real-time-config/real-time-config-impl.js',

      // For amp-image-slider_1.0: Required for `Gestures.get`
      'extensions/amp-image-slider/1.0/component.js->src/service/timer-impl.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/base-element.js',
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills/*.js',
    allowlist: [
      // DO NOT add extensions/ files
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
      '3p/polyfills.js->src/polyfills/string-starts-with.js',
      'src/amp.js->src/polyfills/index.js',
      'src/polyfills/index.js->src/polyfills/abort-controller.js',
      'src/polyfills/index.js->src/polyfills/document-contains.js',
      'src/polyfills/index.js->src/polyfills/fetch.js',
      'src/polyfills/index.js->src/polyfills/get-bounding-client-rect.js',
      'src/polyfills/index.js->src/polyfills/math-sign.js',
      'src/polyfills/index.js->src/polyfills/object-assign.js',
      'src/polyfills/index.js->src/polyfills/object-values.js',
      'src/polyfills/index.js->src/polyfills/array-includes.js',
      'src/polyfills/index.js->src/polyfills/string-starts-with.js',
      'src/polyfills/index.js->src/polyfills/custom-elements.js',
      'src/polyfills/index.js->src/polyfills/intersection-observer.js',
      'src/polyfills/index.js->src/polyfills/resize-observer.js',
      'src/polyfills/index.js->src/polyfills/map-set.js',
      'src/polyfills/index.js->src/polyfills/set.js',
      'src/polyfills/index.js->src/polyfills/weakmap-set.js',
      'src/friendly-iframe-embed.js->src/polyfills/abort-controller.js',
      'src/friendly-iframe-embed.js->src/polyfills/custom-elements.js',
      'src/friendly-iframe-embed.js->src/polyfills/document-contains.js',
      'src/friendly-iframe-embed.js->src/polyfills/intersection-observer.js',
      'src/friendly-iframe-embed.js->src/polyfills/resize-observer.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills/index.js',
    allowlist: ['src/amp.js->src/polyfills/index.js'],
  },

  // Base assertions should never be used explicitly; only the user/dev wrappers
  // or the Log class should have access to the base implementations.
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/core/assert/base.js',
    allowlist: [
      'src/core/assert/dev.js->src/core/assert/base.js',
      'src/core/assert/user.js->src/core/assert/base.js',
      'src/utils/log.js->src/core/assert/base.js',
    ],
  },

  // Rules for main src.
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    allowlist: [
      // Do not add to this allowlist.
    ],
  },
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'ads/**/*.js',
    allowlist: 'src/ad-cid.js->ads/_config.js',
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/service/custom-element-registry.js',
    allowlist: [
      'src/builtins/**->src/service/custom-element-registry.js',
      'src/amp.js->src/service/custom-element-registry.js',
      'src/runtime.js->src/service/custom-element-registry.js',
      'src/service/extensions-impl.js->src/service/custom-element-registry.js',
    ],
  },

  // A4A
  {
    filesMatching: 'extensions/**/*-ad-network-*.js',
    mustNotDependOn: [
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js',
      'src/3p-frame.js',
      'src/iframe-helper.js',
    ],
    allowlist:
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->src/3p-frame.js',
  },

  {
    mustNotDependOn: [
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js',
    ],
  },

  // Delayed fetch for Doubleclick will be deprecated on March 29, 2018.
  // Doubleclick.js will be deleted from the repository at that time.
  // Please see https://github.com/ampproject/amphtml/issues/11834
  // for more information.
  // Do not add any additional files to this allowlist without express
  // permission from @bradfrizzell, @keithwrightbos, or @robhazan.
  {
    mustNotDependOn: ['ads/google/doubleclick.js'],
    allowlist: [
      /** DO NOT ADD TO ALLOWLIST */
      'ads/vendors/ix.js->ads/google/doubleclick.js',
      'ads/vendors/imonomy.js->ads/google/doubleclick.js',
      'ads/vendors/navegg.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO ALLOWLIST */
      'ads/vendors/openx.js->ads/google/doubleclick.js',
      'ads/vendors/pulsepoint.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO ALLOWLIST */
    ],
  },
];
