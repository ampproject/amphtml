/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/*eslint "max-len": 0*/

/**
 * - type - Is assumed to be "forbidden" if not provided.
 * - filesMatching - Is assumed to be all files if not provided.
 * - mustNotDependOn - If type is "forbidden" (default) then the files
 *     matched must not match the glob(s) provided.
 * - allowlist - Skip rule if this particular dependency is found.
 *     Syntax: fileAGlob->fileB where -> reads "depends on"
 * @typedef {{
 *   type: (string|undefined),
 *   filesMatching: (string|!Array<string>|undefined),
 *   mustNotDependOn: (string|!Array<string>|undefined),
 *   allowlist: (string|!Array<string>|undefined),
 * }}
 */
let RuleConfigDef;

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
    mustNotDependOn: 'src/purifier/**/*.js',
    allowlist: [
      // WARNING: Importing purifier.js will also bundle DOMPurify (13KB).
      'extensions/amp-list/0.1/amp-list.js->src/purifier/sanitation.js',
      'extensions/amp-mustache/0.2/amp-mustache.js->src/purifier/purifier.js',
      'extensions/amp-script/0.1/amp-script.js->src/purifier/purifier.js',
      'src/purifier/purifier.js->src/purifier/sanitation.js',
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
      'extensions/amp-story-360/0.1/amp-story-360.js->third_party/zuho/zuho.js',
      'extensions/amp-subscriptions-google/**/*.js->third_party/subscriptions-project/swg.js',
      'extensions/amp-subscriptions/**/*.js->third_party/subscriptions-project/aes_gcm.js',
      'extensions/amp-subscriptions/**/*.js->third_party/subscriptions-project/config.js',
      'extensions/amp-timeago/0.1/amp-timeago.js->third_party/timeagojs/timeago.js',
      'extensions/amp-timeago/1.0/timeago.js->third_party/timeagojs/timeago.js',
      'src/css.js->third_party/css-escape/css-escape.js',
      'src/sanitizer.js->third_party/caja/html-sanitizer.js',
      'src/shadow-embed.js->third_party/webcomponentsjs/ShadowCSS.js',
      'third_party/timeagojs/timeago.js->third_party/timeagojs/timeago-locales.js',
    ],
  },
  // Rules for 3p
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    allowlist: [
      '3p/**->src/utils/function.js',
      '3p/**->src/utils/object.js',
      '3p/**->src/utils/promise.js',
      '3p/**->src/log.js',
      '3p/**->src/types.js',
      '3p/**->src/string.js',
      '3p/**->src/style.js',
      '3p/**->src/url.js',
      '3p/**->src/config.js',
      '3p/**->src/mode.js',
      '3p/**->src/json.js',
      '3p/**->src/3p-frame-messaging.js',
      '3p/**->src/observable.js',
      '3p/**->src/amp-events.js',
      '3p/**->src/internal-version.js',
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
      '3p/polyfills.js->src/polyfills/string-starts-with.js',
      '3p/polyfills.js->src/polyfills/promise.js',
      '3p/messaging.js->src/event-helper.js',
      '3p/bodymovinanimation.js->src/event-helper.js',
      '3p/iframe-messaging-client.js->src/event-helper.js',
      '3p/viqeoplayer.js->src/event-helper.js',
    ],
  },
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
  },
  // Rules for ads
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    allowlist: [
      'ads/**->src/utils/dom-fingerprint.js',
      'ads/**->src/utils/object.js',
      'ads/**->src/utils/rate-limit.js',
      'ads/**->src/log.js',
      'ads/**->src/mode.js',
      'ads/**->src/url.js',
      'ads/**->src/types.js',
      'ads/**->src/string.js',
      'ads/**->src/style.js',
      'ads/**->src/consent-state.js',
      'ads/**->src/internal-version.js',
      // ads/google/a4a doesn't contain 3P ad code and should probably move
      // somewhere else at some point
      'ads/google/a4a/**->src/ad-cid.js',
      'ads/google/a4a/**->src/consent.js',
      'ads/google/a4a/**->src/dom.js',
      'ads/google/a4a/**->src/experiments.js',
      'ads/google/a4a/**->src/services.js',
      'ads/google/a4a/utils.js->src/service/variable-source.js',
      'ads/google/a4a/utils.js->src/ini-load.js',
      // Some ads need to depend on json.js
      'ads/**->src/json.js',
      // IMA, similar to other non-Ad 3Ps above, needs access to event-helper
      'ads/google/imaVideo.js->src/event-helper.js',
    ],
  },
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    allowlist: [
      // See todo note in ads/_a4a-config.js
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
  // Note: For the multipass build to correctly include depended on code, you
  // need to add the depended on code to `CLOSURE_SRC_GLOBS` in
  // build-system/compile/sources.js.
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

      // And a few mrore things depend on a4a.
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/amp-ad-network-base.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/amp-ad-type-defs.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/name-frame-renderer.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/template-renderer.js',
      'extensions/amp-ad-custom/0.1/amp-ad-custom.js->extensions/amp-a4a/0.1/template-validator.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-ad-template-helper.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-ad-type-defs.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/callout-vendors.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/real-time-config-manager.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/refresh-manager.js',

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
      'extensions/amp-inline-gallery/1.0/amp-inline-gallery.js->extensions/amp-base-carousel/1.0/carousel-props.js',
      'extensions/amp-inline-gallery/1.0/amp-inline-gallery-pagination.js->extensions/amp-base-carousel/1.0/carousel-props.js',
      'extensions/amp-inline-gallery/1.0/inline-gallery.js->extensions/amp-base-carousel/1.0/carousel-context.js',
      'extensions/amp-inline-gallery/1.0/pagination.js->extensions/amp-base-carousel/1.0/carousel-context.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/action-source.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/carousel.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/carousel-events.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/child-layout-manager.js',
      'extensions/amp-stream-gallery/0.1/amp-stream-gallery.js->extensions/amp-base-carousel/0.1/responsive-attributes.js',

      // Facebook components
      'extensions/amp-facebook-page/0.1/amp-facebook-page.js->extensions/amp-facebook/0.1/facebook-loader.js',
      'extensions/amp-facebook-comments/0.1/amp-facebook-comments.js->extensions/amp-facebook/0.1/facebook-loader.js',

      // Amp geo in group enum
      'extensions/amp-consent/0.1/consent-config.js->extensions/amp-geo/0.1/amp-geo-in-group.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js->extensions/amp-geo/0.1/amp-geo-in-group.js',

      // AMP Story
      'extensions/amp-story/1.0/animation-types.js->extensions/amp-animation/0.1/web-animation-types.js',
      // AMP Story 360
      'extensions/amp-story-360/0.1/amp-story-360.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-360/0.1/amp-story-360.js->extensions/amp-story/1.0/utils.js',
      // Story ads
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-page.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/events.js',
      // TODO(#24080) Remove this when story ads have full ad network support.
      'extensions/amp-story-auto-ads/0.1/story-ad-page.js->extensions/amp-ad-exit/0.1/config.js',
      // TODO(ccordry): remove this after createShadowRootWithStyle is moved to src
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-page.js->extensions/amp-story/1.0/utils.js',
      // Story education
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-education/0.1/amp-story-education.js->extensions/amp-story/1.0/amp-story-localization-service.js',

      // Interactive components that depend on story functionality.
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/story-analytics.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/utils.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js->extensions/amp-story/1.0/variable-service.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-results.js->extensions/amp-story/1.0/amp-story-store-service.js',

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
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
    allowlist: [
      'extensions/amp-a4a/0.1/a4a-variable-source.js->' +
        'src/service/variable-source.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->' +
        'src/service/url-replacements-impl.js',
      // Parsing extension urls.
      'extensions/amp-a4a/0.1/head-validation.js->' +
        'src/service/extension-location.js',
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
      'extensions/amp-jwplayer/0.1/amp-jwplayer.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-gfycat/0.1/amp-gfycat.js->' +
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
      'extensions/amp-redbull-player/0.1/amp-redbull-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-vimeo/0.1/amp-vimeo.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-wistia-player/0.1/amp-wistia-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-delight-player/0.1/amp-delight-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-analytics/0.1/iframe-transport.js->' +
        'src/service/jank-meter.js',
      'extensions/amp-position-observer/0.1/amp-position-observer.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-position-observer/0.1/amp-position-observer.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-video-docking/0.1/amp-video-docking.js->' +
        'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-video-docking/0.1/amp-video-docking.js->' +
        'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-analytics/0.1/cookie-writer.js->' +
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
      // Accessing extension-location.calculateExtensionScriptUrl().
      'extensions/amp-script/0.1/amp-script.js->' +
        'src/service/extension-location.js',
      // Origin experiments.
      'extensions/amp-experiment/1.0/amp-experiment.js->' +
        'src/service/origin-experiments-impl.js',
      // For action macros.
      'extensions/amp-link-rewriter/0.1/amp-link-rewriter.js->' +
        'src/service/navigation.js',
      // For localization.
      'extensions/amp-story/1.0/amp-story-localization-service.js->src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/story-ad-localization.js->src/service/localization.js',
      // Accessing calculateScriptBaseUrl() for vendor config URLs
      'extensions/amp-analytics/0.1/config.js->' +
        'src/service/extension-location.js',
      // Experiment moving Fixed Layer to extension
      'extensions/amp-viewer-integration/0.1/amp-viewer-integration.js->' +
        'src/service/fixed-layer.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/base-element.js',
  },
  {
    filesMatching: 'src/polyfills/**/*.js',
    mustNotDependOn: '**/*.js',
    allowlist: [
      'src/polyfills/fetch.js->src/log.js',
      'src/polyfills/fetch.js->src/types.js',
      'src/polyfills/fetch.js->src/json.js',
      'src/polyfills/fetch.js->src/utils/object.js',
      'src/polyfills/fetch.js->src/utils/bytes.js',
      'src/polyfills/intersection-observer.js->src/polyfillstub/intersection-observer-stub.js',
      'src/polyfills/promise.js->node_modules/promise-pjs/promise.js',
      'src/polyfills/custom-elements.js->src/resolved-promise.js',
    ],
  },
  {
    filesMatching: 'src/polyfillstub/**/*.js',
    mustNotDependOn: '**/*.js',
    allowlist: [
      'src/polyfillstub/intersection-observer-stub.js->src/services.js',
      'src/polyfillstub/intersection-observer-stub.js->src/resolved-promise.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills/**/*.js',
    allowlist: [
      // DO NOT add extensions/ files
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
      '3p/polyfills.js->src/polyfills/promise.js',
      'src/polyfills.js->src/polyfills/abort-controller.js',
      'src/polyfills.js->src/polyfills/domtokenlist.js',
      'src/polyfills.js->src/polyfills/document-contains.js',
      'src/polyfills.js->src/polyfills/fetch.js',
      'src/polyfills.js->src/polyfills/math-sign.js',
      'src/polyfills.js->src/polyfills/object-assign.js',
      'src/polyfills.js->src/polyfills/object-values.js',
      'src/polyfills.js->src/polyfills/promise.js',
      'src/polyfills.js->src/polyfills/array-includes.js',
      'src/polyfills.js->src/polyfills/string-starts-with.js',
      'src/polyfills.js->src/polyfills/custom-elements.js',
      'src/polyfills.js->src/polyfills/intersection-observer.js',
      'src/polyfills.js->src/polyfills/map-set.js',
      'src/polyfills.js->src/polyfills/set-add.js',
      'src/polyfills.js->src/polyfills/weakmap-set.js',
      'src/friendly-iframe-embed.js->src/polyfills/custom-elements.js',
      'src/friendly-iframe-embed.js->src/polyfills/document-contains.js',
      'src/friendly-iframe-embed.js->src/polyfills/domtokenlist.js',
      'src/friendly-iframe-embed.js->src/polyfills/intersection-observer.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills.js',
    allowlist: ['src/amp.js->src/polyfills.js'],
  },

  // Rules for main src.
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
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
      'builtins/**->src/service/custom-element-registry.js',
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
      'ads/ix.js->ads/google/doubleclick.js',
      'ads/imonomy.js->ads/google/doubleclick.js',
      'ads/navegg.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO ALLOWLIST */
      'ads/openx.js->ads/google/doubleclick.js',
      'ads/pulsepoint.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO ALLOWLIST */
    ],
  },
];
