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
 * - whitelist - Skip rule if this particular dependency is found.
 *     Syntax: fileAGlob->fileB where -> reads "depends on"
 * @typedef {{
 *   type: (string|undefined),
 *   filesMatching: (string|!Array<string>|undefined),
 *   mustNotDependOn: (string|!Array<string>|undefined),
 *   whitelist: (string|!Array<string>|undefined),
 * }}
 */
let RuleConfigDef;

// It is often OK to add things to the whitelist, but make sure to highlight
// this in review.
exports.rules = [
  // Global rules
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/video-iframe-integration.js',
    whitelist: [
      // Do not extend this whitelist.
      // video-iframe-integration.js is an entry point.
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/sanitizer.js',
    whitelist: [
      // DEPRECATED: Use src/purifier.js instead. @choumx for questions.
      'extensions/amp-mustache/0.1/amp-mustache.js->src/sanitizer.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/purifier.js',
    whitelist: [
      // WARNING: Importing purifier.js will also bundle DOMPurify (13KB).
      'extensions/amp-mustache/0.2/amp-mustache.js->src/purifier.js',
      'extensions/amp-script/0.1/amp-script.js->src/purifier.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/module.js',
    whitelist: [
      'extensions/amp-date-picker/0.1/**->src/module.js',
      'extensions/amp-inputmask/0.1/**->src/module.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'third_party/**/*.js',
    whitelist: [
      'extensions/amp-crypto-polyfill/**/*.js->' +
          'third_party/closure-library/sha384-generated.js',
      'extensions/amp-mustache/**/amp-mustache.js->' +
          'third_party/mustache/mustache.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/' +
          'amp-ad-network-adzerk-impl.js->third_party/mustache/mustache.js',
      'extensions/amp-timeago/0.1/amp-timeago.js->' +
          'third_party/timeagojs/timeago.js',
      '3p/polyfills.js->third_party/babel/custom-babel-helpers.js',
      'src/sanitizer.js->third_party/caja/html-sanitizer.js',
      'extensions/amp-viz-vega/**->third_party/vega/vega.js',
      'extensions/amp-viz-vega/**->third_party/d3/d3.js',
      'src/css.js->third_party/css-escape/css-escape.js',
      'src/shadow-embed.js->third_party/webcomponentsjs/ShadowCSS.js',
      'third_party/timeagojs/timeago.js->' +
          'third_party/timeagojs/timeago-locales.js',
      'extensions/amp-date-picker/**->third_party/react-dates/bundle.js',
      'extensions/amp-date-picker/**->third_party/rrule/rrule.js',
      'extensions/amp-subscriptions/**/*.js->' +
          'third_party/subscriptions-project/apis.js',
      'extensions/amp-subscriptions/**/*.js->' +
          'third_party/subscriptions-project/config.js',
      'extensions/amp-subscriptions-google/**/*.js->' +
          'third_party/subscriptions-project/apis.js',
      'extensions/amp-subscriptions-google/**/*.js->' +
          'third_party/subscriptions-project/config.js',
      'extensions/amp-subscriptions-google/**/*.js->' +
          'third_party/subscriptions-project/swg.js',
      'extensions/amp-recaptcha-input/**/*.js->' +
      'third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm.js',
    ],
  },
  // Rules for 3p
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    whitelist: [
      '3p/**->src/utils/function.js',
      '3p/**->src/utils/object.js',
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
      '3p/**->src/consent-state.js',
      '3p/**->src/internal-version.js',
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
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
    whitelist: [
      'ads/**->src/utils/base64.js',
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
      'ads/google/adsense-amp-auto-ads-responsive.js->src/experiments.js',
      'ads/google/doubleclick.js->src/experiments.js',
      // ads/google/a4a doesn't contain 3P ad code and should probably move
      // somewhere else at some point
      'ads/google/a4a/**->src/ad-cid.js',
      'ads/google/a4a/**->src/consent.js',
      'ads/google/a4a/**->src/consent-state.js',
      'ads/google/a4a/**->src/dom.js',
      'ads/google/a4a/**->src/experiments.js',
      'ads/google/a4a/**->src/services.js',
      'ads/google/a4a/utils.js->src/service/variable-source.js',
      'ads/google/a4a/utils.js->src/layout.js',
      // alp handler needs to depend on src files
      'ads/alp/handler.js->src/dom.js',
      'ads/alp/handler.js->src/config.js',
      // Some ads need to depend on json.js
      'ads/**->src/json.js',
      // IMA, similar to other non-Ad 3Ps above, needs access to event-helper
      'ads/google/imaVideo.js->src/event-helper.js',
    ],
  },
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    whitelist: [
      // See todo note in ads/_a4a-config.js
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-doubleclick-impl/0.1/' +
          'doubleclick-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-fake-impl/0.1/fake-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-triplelift-impl/0.1/triplelift-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-cloudflare-impl/0.1/cloudflare-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-gmossp-impl/0.1/gmossp-a4a-config.js',
    ],
  },
  // Rules for extensions and main src.
  {
    filesMatching: '{src,extensions}/**/*.js',
    mustNotDependOn: '3p/**/*.js',
  },

  // Rules for extensions.
  {
    // Extensions can't depend on other extensions.
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    whitelist: [
      // a4a ads depend on a4a.
      'extensions/amp-ad-network-fake-impl/0.1/amp-ad-network-fake-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-gmossp-impl/0.1/amp-ad-network-gmossp-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-triplelift-impl/0.1/amp-ad-network-triplelift-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-cloudflare-impl/0.1/amp-ad-network-cloudflare-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-adzerk-impl/0.1/amp-ad-network-adzerk-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/sra-utils.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-a4a/0.1/amp-a4a.js',

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

      // Ads depends on a4a?
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js->extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config.js',

      // Ads needs concurrent loading
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->extensions/amp-ad/0.1/concurrent-load.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js->extensions/amp-ad/0.1/concurrent-load.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->extensions/amp-ad/0.1/concurrent-load.js',

      // Ads needs iframe transports
      'extensions/amp-ad-exit/0.1/config.js->extensions/amp-analytics/0.1/iframe-transport-vendors.js',

      // Amp geo in group enum
      'extensions/amp-consent/0.1/amp-consent.js->extensions/amp-geo/0.1/amp-geo-in-group.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js->extensions/amp-geo/0.1/amp-geo-in-group.js',

      // AMP Story
      'extensions/amp-story/0.1/animation.js->extensions/amp-animation/0.1/web-animation-types.js',
      'extensions/amp-story/1.0/animation.js->extensions/amp-animation/0.1/web-animation-types.js',
      // Story ads
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/amp-story-store-service.js',
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/navigation-state.js',
      // TODO(ccordry): remove this after createShadowRootWithStyle is moved to src
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->extensions/amp-story/1.0/utils.js',

      // Subscriptions.
      'extensions/amp-subscriptions/0.1/expr.js->extensions/amp-access/0.1/access-expr.js',
      'extensions/amp-subscriptions/0.1/local-subscription-platform-iframe.js->extensions/amp-access/0.1/iframe-api/messenger.js',
      'extensions/amp-subscriptions/0.1/viewer-subscription-platform.js->extensions/amp-access/0.1/jwt.js',
      'extensions/amp-subscriptions/0.1/actions.js->extensions/amp-access/0.1/login-dialog.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/analytics.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/doc-impl.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/entitlement.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js->extensions/amp-subscriptions/0.1/score-factors.js',

      // amp-smartlinks depends on amp-skimlinks/link-rewriter
      'extensions/amp-smartlinks/0.1/amp-smartlinks.js->extensions/amp-skimlinks/0.1/link-rewriter/link-rewriter-manager.js',
      'extensions/amp-smartlinks/0.1/linkmate.js->extensions/amp-skimlinks/0.1/link-rewriter/two-steps-response.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
    whitelist: [
      'extensions/amp-a4a/0.1/a4a-variable-source.js->' +
          'src/service/variable-source.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->' +
          'src/service/url-replacements-impl.js',
      'extensions/amp-video-service/**->' +
          'src/service/video-service-interface.js',
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
      'extensions/amp-a4a/0.1/amp-a4a.js->src/service/variable-source.js',
      'extensions/amp-a4a/0.1/friendly-frame-util.js->' +
          'src/service/url-replacements-impl.js',
      'extensions/amp-nexxtv-player/0.1/amp-nexxtv-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-3q-player/0.1/amp-3q-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-ima-video/0.1/amp-ima-video.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-vimeo/0.1/amp-vimeo.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-wistia-player/0.1/amp-wistia-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-delight-player/0.1/amp-delight-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-analytics/0.1/iframe-transport.js->' +
          'src/service/extension-location.js',
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
      'extensions/amp-list/0.1/amp-list.js->' +
          'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-list/0.1/amp-list.js->' +
            'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-video-docking/0.1/amp-video-docking.js->' +
          'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-video-docking/0.1/amp-video-docking.js->' +
          'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-analytics/0.1/amp-analytics.js->' +
          'src/service/cid-impl.js',
      'extensions/amp-analytics/0.1/cookie-writer.js->' +
          'src/service/cid-impl.js',
      'extensions/amp-next-page/0.1/next-page-service.js->' +
          'src/service/position-observer/position-observer-impl.js',
      'extensions/amp-next-page/0.1/next-page-service.js->' +
          'src/service/position-observer/position-observer-worker.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js->' +
          'src/service/notification-ui-manager.js',
      'extensions/amp-consent/0.1/amp-consent.js->' +
          'src/service/notification-ui-manager.js',
      // For autoplay delegation:
      'extensions/amp-story/0.1/amp-story-page.js->' +
          'src/service/video-service-sync-impl.js',
      'extensions/amp-story/1.0/amp-story-page.js->' +
          'src/service/video-service-sync-impl.js',
      // Accessing USER_INTERACTED constant:
      'extensions/amp-story/1.0/media-pool.js->' +
          'src/service/video-service-interface.js',
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
      'extensions/amp-list/0.1/amp-list.js->' +
          'src/service/xhr-impl.js',
      'extensions/amp-form/0.1/amp-form.js->' +
          'src/service/xhr-impl.js',
      // Accessing extension-location.calculateExtensionScriptUrl().
      'extensions/amp-script/0.1/amp-script.js->' +
            'src/service/extension-location.js',
      // Origin experiments.
      'extensions/amp-list/0.1/amp-list.js->' +
          'src/service/origin-experiments-impl.js',
      'extensions/amp-recaptcha-input/0.1/amp-recaptcha-input.js->' +
          'src/service/origin-experiments-impl.js',
      'extensions/amp-experiment/1.0/amp-experiment.js->' +
          'src/service/origin-experiments-impl.js',
      'extensions/amp-script/0.1/amp-script.js->' +
          'src/service/origin-experiments-impl.js',
      // For action macros.
      'extensions/amp-action-macro/0.1/amp-action-macro.js->' +
            'src/service/action-impl.js',
      'extensions/amp-link-rewriter/0.1/amp-link-rewriter.js->' +
            'src/service/navigation.js',
      // For localization.
      'extensions/amp-story/0.1/amp-story.js->' +
            'src/service/localization.js',
      'extensions/amp-story/1.0/amp-story.js->' +
            'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/af.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/am.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ar.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/bg.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/bn.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/bs.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ca.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/cs.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/da.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/de.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/default.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/el.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/en-GB.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/en.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/es-419.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/es.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/et.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/eu.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/fa.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/fi.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/fil.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/fr.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/gl.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/gu.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/hi.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/hr.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/hu.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/id.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/is.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/it.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/iw.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ja.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ka.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/km.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/kn.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ko.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/lo.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/lt.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/lv.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/mk.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ml.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/mn.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/mr.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ms.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/my.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ne.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/nl.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/no.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/pa.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/pt-BR.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/pt-PT.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ro.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ru.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/si.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sk.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sl.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sq.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sr.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sv.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/sw.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ta.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/te.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/th.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/tr.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/uk.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/ur.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/vi.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/zh-CN.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/zh-TW.js->' +
          'src/service/localization.js',
      'extensions/amp-story/1.0/_locales/zu.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/af.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/am.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ar.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/bg.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/bn.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/bs.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ca.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/cs.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/da.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/de.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/el.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/en-GB.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/en.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/es-419.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/es.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/et.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/eu.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/fa.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/fi.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/fil.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/fr.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/gl.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/gu.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/hi.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/hr.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/hu.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/id.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/is.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/it.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/iw.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ja.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ka.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/km.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/kn.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ko.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/lo.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/lt.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/lv.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/mk.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ml.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/mn.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/mr.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ms.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/my.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ne.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/nl.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/no.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/pa.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/pt-BR.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/pt-PT.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ro.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ru.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/si.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sk.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sl.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sq.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sr.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sv.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/sw.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ta.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/te.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/th.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/tr.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/uk.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/ur.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/vi.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/zh-CN.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/zh-TW.js->' +
          'src/service/localization.js',
      'extensions/amp-story-auto-ads/0.1/_locales/zu.js->' +
          'src/service/localization.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/base-element.js',
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills/**/*.js',
    whitelist: [
      // DO NOT add extensions/ files
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      '3p/polyfills.js->src/polyfills/object-values.js',
      'src/polyfills.js->src/polyfills/domtokenlist-toggle.js',
      'src/polyfills.js->src/polyfills/document-contains.js',
      'src/polyfills.js->src/polyfills/fetch.js',
      'src/polyfills.js->src/polyfills/math-sign.js',
      'src/polyfills.js->src/polyfills/object-assign.js',
      'src/polyfills.js->src/polyfills/object-values.js',
      'src/polyfills.js->src/polyfills/promise.js',
      'src/polyfills.js->src/polyfills/array-includes.js',
      'src/polyfills.js->src/polyfills/custom-elements.js',
      'src/service/extensions-impl.js->src/polyfills/custom-elements.js',
      'src/service/extensions-impl.js->src/polyfills/document-contains.js',
      'src/service/extensions-impl.js->src/polyfills/domtokenlist-toggle.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills.js',
    whitelist: [
      'src/amp.js->src/polyfills.js',
      'src/service.js->src/polyfills.js',
      'src/service/timer-impl.js->src/polyfills.js',
      'src/service/extensions-impl.js->src/polyfills.js',
    ],
  },

  // Rules for main src.
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
  },
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'ads/**/*.js',
    whitelist: 'src/ad-cid.js->ads/_config.js',
  },

  // A4A
  {
    filesMatching: 'extensions/**/*-ad-network-*.js',
    mustNotDependOn: [
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js',
      'src/3p-frame.js',
      'src/iframe-helper.js',
    ],
    whitelist: 'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js->src/3p-frame.js',
  },

  {
    mustNotDependOn: [
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js',
    ],
  },

  {
    mustNotDependOn: [
      /** DO NOT WHITELIST ANY FILES */
      'ads/google/deprecated_doubleclick.js',
      /** DO NOT WHITELIST ANY FILES */
    ],
    whitelist: [
      'ads/google/doubleclick.js->ads/google/deprecated_doubleclick.js',
      '3p/integration.js->ads/google/deprecated_doubleclick.js',
    ],
  },

  // Delayed fetch for Doubleclick will be deprecated on March 29, 2018.
  // Doubleclick.js will be deleted from the repository at that time.
  // Please see https://github.com/ampproject/amphtml/issues/11834
  // for more information.
  // Do not add any additional files to this whitelist without express
  // permission from @bradfrizzell, @keithwrightbos, or @robhazan.
  {
    mustNotDependOn: [
      'ads/google/doubleclick.js',
    ],
    whitelist: [
      /** DO NOT ADD TO WHITELIST **/
      'ads/ix.js->ads/google/doubleclick.js',
      'ads/imonomy.js->ads/google/doubleclick.js',
      'ads/medianet.js->ads/google/doubleclick.js',
      'ads/navegg.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO WHITELIST **/
      'ads/openx.js->ads/google/doubleclick.js',
      'ads/pulsepoint.js->ads/google/doubleclick.js',
      'ads/rubicon.js->ads/google/doubleclick.js',
      'ads/yieldbot.js->ads/google/doubleclick.js',
      /** DO NOT ADD TO WHITELIST **/
    ],
  },
];
