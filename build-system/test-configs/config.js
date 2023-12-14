'use strict';

/**
 * @type
 * Array<string | {
 *   pattern: string,
 *   included: boolean,
 *   nocache: boolean,
 *   watched: boolean
 * }>
 */
const initTestsPath = ['testing/init-tests.js'];

const karmaHtmlFixturesPath = 'test/fixtures/*.html';

const fixturesExamplesPaths = [
  karmaHtmlFixturesPath,
  {
    pattern: 'test/fixtures/served/*.html',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'examples/**/*',
    included: false,
    nocache: false,
    watched: true,
  },
];

const builtRuntimePaths = [
  {
    pattern: 'dist/**/*.js',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist/**/*.mjs',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist.3p/**/*',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist.tools/**/*.js',
    included: false,
    nocache: false,
    watched: true,
  },
  {
    pattern: 'dist.tools/**/*.mjs',
    included: false,
    nocache: false,
    watched: true,
  },
];

const karmaJsPaths = [
  'test/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
  'testing/**/*.js',
];

/**
 * @return {Array<*>}
 */
function getCommonUnitTestPaths() {
  return initTestsPath.concat(fixturesExamplesPaths);
}

const commonIntegrationTestPaths = initTestsPath.concat(
  fixturesExamplesPaths,
  builtRuntimePaths
);

const testPaths = commonIntegrationTestPaths.concat([
  'test/*/!(e2e)/**/*.js',
  'ads/**/test/test-*.js',
  'extensions/**/test/**/*.js',
]);

const unitTestPaths = [
  'test/unit/**/*.js',
  'ads/**/test/test-*.js',
  'ads/**/test/unit/test-*.js',
  'extensions/**/test/*.js',
  'extensions/**/test/unit/*.js',
];

// TODO(amphtml): Opt-in more unit tests to run on Safari / FF / Edge.
const unitTestCrossBrowserPaths = [
  'test/unit/core/test-error.js',
  'test/unit/test-log.js',
];

const integrationTestPaths = [
  'test/integration/**/*.js',
  'extensions/**/test/integration/**/*.js',
];

const e2eTestPaths = ['test/e2e/*.js', 'extensions/**/test-e2e/test-*.js'];

const devDashboardTestPaths = ['build-system/server/app-index/test/**/*.js'];

const jisonPath = 'extensions/**/*.jison';

const lintGlobs = [
  '**/*.{js,jsx}',
  '**/*.{ts,tsx}',
  '!**/*.d.ts',
  // To ignore a file / directory, add it to .eslintignore.
];

/**
 * This should not include .js files, since those are handled by eslint via the
 * local/no-forbidden-terms rule.
 */
const presubmitGlobs = [
  '**/*.{css,go,md}',
  '!{node_modules,build,dist,dist.tools,' +
    'dist.3p/[0-9]*,dist.3p/current,dist.3p/current-min}/**/*.*',
  '!out/**/*.*',
  '!validator/validator.pb.go',
  '!validator/dist/**/*.*',
  '!validator/htmlparser/**/*.*',
  '!build-system/runner/build/**/*.*',
  '!third_party/**/*.*',
  '!**/node_modules/**/*.*',
  '!extensions/**/dist/*',
  '!examples/**/*',
  '!examples/visual-tests/**/*',
  '!test/coverage/**/*.*',
  '!firebase/**/*.*',
];

/**
 * List of non-JS files to be checked by `amp prettify` (using prettier).
 * NOTE: When you add a new filename / glob to this list:
 * 1. Make sure its formatting options are specified in .prettierrc
 * 2. Make sure it is listed in .vscode/settings.json (for auto-fix-on-save)
 */
const prettifyGlobs = [
  '.prettierrc',
  '.renovaterc.json',
  '.vscode/settings.json',
  '.github/workflows/continuous-integration-workflow.yml',
  '**/*.json',
  '**/OWNERS',
  '**/*.md',
  '**/*.yml',
];

/**
 * List of markdown and yaml files that may be checked by `amp check-links`
 * (using markdown-link-check).
 */
const linkCheckGlobs = [
  '.github/ISSUE_TEMPLATE/*.yml',
  '**/*.md',
  '!**/{examples,node_modules,build,dist,dist.3p,dist.tools}/**',
  '!.github/*.md',
];

/**
 * List of files checked by `amp check-invalid-whitespaces`.
 * - JS files are already checked by `amp lint` using eslint / prettier.
 * - Markdown files are ignored because line-breaks use trailing whitespaces.
 */
const invalidWhitespaceGlobs = [
  '**/*.css',
  '**/*.html',
  '**/*.out',
  '**/*.out.cpponly',
  '**/*.protoascii',
  '**/*.sh',
  '!**/{node_modules,build,dist,dist.3p,dist.tools}/**',
];

/**
 * List of HTML fixtures to check to ensure they contain valid AMPHTML.
 */
const htmlFixtureGlobs = [
  'examples/**/*.html',
  'test/fixtures/e2e/**/*.html',

  // The following are not AMP documents and are not meant to validate.
  '!examples/amp-video-iframe/frame*.html',
  '!examples/viewer-iframe-poll.html',
  '!examples/viewer-webview.html',
  '!examples/viewer.html',

  // The following are folders where amp docs have the extension .amp.html.
  '!examples/amp-story/**/!(*.amp.html)',
  '!examples/visual-tests/amp-story/!(*.amp.html)',
  '!examples/visual-tests/amp-story-player/!(*.amp.html)',
  '!test/fixtures/e2e/amp-story-player/!(*.amp.html)',

  // Remove this from the list after TODO(#37467) gets closed.
  '!examples/amp-access-fewcents.html',

  // TODO(#25149): Fix these invalid files and remove them from this list.
  '!examples/accordion.amp.html',
  '!examples/ad-lightbox.amp.html',
  '!examples/alp.amp.html',
  '!examples/alp/creative.html',
  '!examples/amp-3d-gltf.amp.html',
  '!examples/amp-action-macro.html',
  '!examples/amp-ad-template.amp.html',
  '!examples/amp-ad/a4a.amp.html',
  '!examples/amp-ad/ads.amp.esm.html',
  '!examples/amp-ad/ads.amp.html',
  '!examples/amp-ad/doubleclick-remote-html.html',
  '!examples/amp-ad/doubleclick-rtc.amp.html',
  '!examples/amp-ad/doubleclick-safeframe.html',
  '!examples/amp-ad/doubleclick-vanilla.amp.html',
  '!examples/amp-ad/sticky-creative.html',
  '!examples/amp-ad/sticky.html',
  '!examples/amp-autocomplete-testing.html',
  '!examples/amp-autocomplete.ssr.html',
  '!examples/amp-consent/amp-consent-3p-postmessage.html',
  '!examples/amp-consent/amp-consent-amp-ad.amp.html',
  '!examples/amp-consent/amp-consent-client.html',
  '!examples/amp-consent/amp-consent-cmp.html',
  '!examples/amp-consent/amp-consent-geo.html',
  '!examples/amp-consent/amp-consent-iframe.amp.html',
  '!examples/amp-consent/amp-consent-iframe.embed.html',
  '!examples/amp-consent/amp-consent-server.html',
  '!examples/amp-consent/cmp-vendors.amp.html',
  '!examples/amp-consent/diy-3p-iframe-tcf-postmessage.html',
  '!examples/amp-consent/diy-consent.html',
  '!examples/amp-form.ssr.html',
  '!examples/amp-layout-intrinsic.amp.html',
  '!examples/amp-lightbox.amp.html',
  '!examples/amp-list-layout-container.amp.html',
  '!examples/amp-list-with-form.amp.html',
  '!examples/amp-list.amp.html',
  '!examples/amp-list.ssr.html',
  '!examples/amp-list.state.html',
  '!examples/amp-minute-media-player.amp.html',
  '!examples/amp-mowplayer.amp.html',
  '!examples/amp-next-page.amp.html',
  '!examples/amp-onetap-google/iframe.html',
  '!examples/amp-orientation-observer-3d-parallax.amp.html',
  '!examples/amp-orientation-observer-amp-3d-gltf.amp.html',
  '!examples/amp-orientation-observer-panorama.amp.html',
  '!examples/amp-orientation-observer-scroll.amp.html',
  '!examples/amp-orientation-observer.amp.html',
  '!examples/amp-position-observer.amp.html',
  '!examples/amp-script/example.amp.html',
  '!examples/amp-script/example.sandboxed.amp.html',
  '!examples/amp-script/todomvc.amp.html',
  '!examples/amp-script/vue-todomvc.amp.html',
  '!examples/amp-skimlinks.html',
  '!examples/amp-smartlinks.html',
  // TODO(#37285): remove after the new validator rules are pushed with the new npm.
  '!examples/amp-story-subscriptions/amp-story-subscriptions.html',
  '!examples/amp-subscriptions-google/amp-subscriptions-iframe.provider.html',
  '!examples/amp-subscriptions-google/amp-subscriptions-metering-laa.amp.html',
  '!examples/amp-subscriptions-google/amp-subscriptions-metering-registration-widget.html',
  '!examples/amp-subscriptions-google/amp-subscriptions-smartbox.amp.html',
  '!examples/amp-subscriptions-google/amp-subscriptions.amp.html',
  '!examples/amp-subscriptions-rtp.amp.html',
  '!examples/amp-tiktok.amp.html',
  '!examples/amp-toggle-theme.html',
  '!examples/ampcontext-creative-json.html',
  '!examples/ampcontext-creative.html',
  '!examples/amphtml-ads/adchoices-1.a4a.html',
  '!examples/amphtml-ads/adchoices-2.a4a.html',
  '!examples/amphtml-ads/animation-ad.a4a.html',
  '!examples/amphtml-ads/fake-memory.host.html',
  '!examples/amphtml-ads/gif-ad.a4a.html',
  '!examples/amphtml-ads/gpt.host.html',
  '!examples/amphtml-ads/many-ads.host.html',
  '!examples/amphtml-ads/text-ad.a4a.html',
  '!examples/amphtml-ads/visibility-ad.a4a.html',
  '!examples/amphtml-ads/visibility.host.html',
  '!examples/analytics-error-reporting.amp.html',
  '!examples/analytics-html-attr.amp.html',
  '!examples/analytics-iframe-transport-remote-frame.html',
  '!examples/analytics-iframe-transport.amp.html',
  '!examples/analytics-in-creative-measurement.amp.html',
  '!examples/analytics-reportWhen.amp.html',
  '!examples/analytics-vendors.amp.html',
  '!examples/article-access-iframe.amp.html',
  '!examples/article-access-iframe.provider.html',
  '!examples/article-access-laterpay.amp.html',
  '!examples/article-access-multiple.amp.html',
  '!examples/article-access-poool.amp.html',
  '!examples/article-access.amp.html',
  '!examples/article-fixed-header.amp.html',
  '!examples/article-super-short.amp.html',
  '!examples/article.amp.html',
  '!examples/auto-ads.amp.html',
  '!examples/beopinion.amp.html',
  '!examples/beopinion.article.amp.html',
  '!examples/bind/carousels.amp.html',
  '!examples/bind/ecommerce.amp.html',
  '!examples/bind/errors.amp.html',
  '!examples/bind/game.amp.html',
  '!examples/bind/list.amp.html',
  '!examples/bind/performance.amp.html',
  '!examples/bind/sandbox.amp.html',
  '!examples/bind/svgimage.amp.html',
  '!examples/bodymovin-animation.amp.html',
  '!examples/csa.amp.html',
  '!examples/csp.amp.html',
  '!examples/date-picker.amp.html',
  '!examples/doubleload.amp.html',
  '!examples/everything.amp.esm.html',
  '!examples/everything.amp.html',
  '!examples/everything.iframed.html',
  '!examples/fake-ad.amp.html',
  '!examples/forms.amp.html',
  '!examples/gfk-sensic-analytics.amp.html',
  '!examples/gwd.amp.html',
  '!examples/image-lightbox.amp.html',
  '!examples/img.amp.html',
  '!examples/linkers.html',
  '!examples/live-blog-non-floating-button.amp.html',
  '!examples/live-list.amp.html',
  '!examples/loads-windowcontext-creative-https.html',
  '!examples/loads-windowcontext-creative.html',
  '!examples/megaphone.amp.html',
  '!examples/metadata-examples/article-json-ld-twitter-card.amp.html',
  '!examples/metadata-examples/article-json-ld.amp.html',
  '!examples/metadata-examples/recipe-json-ld.amp.html',
  '!examples/metadata-examples/review-json-ld.amp.html',
  '!examples/metadata-examples/sports-article-json-ld.amp.html',
  '!examples/metadata-examples/video-json-ld.amp.html',
  '!examples/mraid/inabox-mraid.html',
  '!examples/multiple-docs.html',
  '!examples/pwa-multidoc-loader.html',
  '!examples/pwa/pwa-sd-polyfill.html',
  '!examples/pwa/pwa.html',
  '!examples/released.amp.html',
  '!examples/runtime/article.html',
  '!examples/runtime/list-always.html',
  '!examples/selector.amp.html',
  '!examples/sidebar.amp.html',
  '!examples/social-share.amp.html',
  '!examples/standard-actions.amp.html',
  '!examples/sticky.ads.0.1.amp.html',
  '!examples/travel-lb.amp.html',
  '!examples/travel.amp.html',
  '!examples/twitter.amp.html',
  '!examples/user-notification.amp.html',
  '!examples/valueimpression.amp.html',
  '!examples/video-animation-sync.html',
  '!examples/visual-tests/amp-accordion/amp-accordion.html',
  '!examples/visual-tests/amp-date-picker/amp-date-picker.amp.html',
  '!examples/visual-tests/amp-inabox/amp-inabox-gpt.html',
  '!examples/visual-tests/amp-lightbox-gallery.html',
  '!examples/visual-tests/amp-list/amp-list.amp.html',
  '!examples/visual-tests/amp-selector.amp.html',
  '!examples/visual-tests/amp-sidebar/amp-sidebar-toolbar-ol.amp.html',
  '!examples/visual-tests/amp-sidebar/amp-sidebar-toolbar-ul.amp.html',
  '!examples/visual-tests/amp-sidebar/amp-sidebar.amp.html',
  '!examples/visual-tests/amp-sticky-ad/amp-sticky-ad.amp.html',
  '!examples/visual-tests/amp-video-docking/video-iframe-inner.html',
  '!examples/visual-tests/amphtml-ads/amp-fie-adchoices.html',
  '!examples/visual-tests/amphtml-ads/amp-fie-static.html',
  '!examples/visual-tests/amphtml-ads/amp-inabox-adchoices.html',
  '!examples/visual-tests/amphtml-ads/amp-inabox-static.html',
  '!examples/visual-tests/amphtml-ads/resource/amp-ads-fallback.html',
  '!examples/visual-tests/article-access.amp/article-access.amp.html',
  '!examples/visual-tests/article.amp/article.amp.html',
  '!examples/visual-tests/blank-page/blank.html',
  '!examples/visual-tests/css.amp/css.amp.html',
  '!examples/visual-tests/iframe-wrapper.html',
  '!examples/wistiaplayer.amp.html',
  '!examples/xhr-intercept.html',
  '!test/fixtures/e2e/amp-accordion/amp-accordion.html',
  '!test/fixtures/e2e/amp-accordion/single-expand.html',
  '!test/fixtures/e2e/amp-analytics/browser-events.html',
  '!test/fixtures/e2e/amp-auto-lightbox/amp-auto-lightbox.html',
  '!test/fixtures/e2e/amp-autocomplete/amp-autocomplete-inline.amp.html',
  '!test/fixtures/e2e/amp-autocomplete/amp-autocomplete.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/1.0/grouping-move-by-2.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/1.0/vertical.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/advance.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/disable-layers.html',
  '!test/fixtures/e2e/amp-base-carousel/enable-experiment.html',
  '!test/fixtures/e2e/amp-base-carousel/grouping.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/index.html',
  '!test/fixtures/e2e/amp-base-carousel/related-items.amp.html',
  '!test/fixtures/e2e/amp-base-carousel/zero-index-slide.amp.html',
  '!test/fixtures/e2e/amp-bind/bind-amp4email.html',
  '!test/fixtures/e2e/amp-bind/bind-form.html',
  '!test/fixtures/e2e/amp-carousel/0.1/hidden-controls.amp.html',
  '!test/fixtures/e2e/amp-consent/cmp-interaction.html',
  '!test/fixtures/e2e/amp-date-countdown/amp-date-countdown.html',
  '!test/fixtures/e2e/amp-date-picker/blocked-dates.html',
  '!test/fixtures/e2e/amp-fit-text/1.0/amp-fit-text.html',
  '!test/fixtures/e2e/amp-form/amp-form.html',
  '!test/fixtures/e2e/amp-list/amp-list-function-load-more.html',
  '!test/fixtures/e2e/amp-list/amp-list-function-src.html',
  '!test/fixtures/e2e/amp-list/amp-list.html',
  '!test/fixtures/e2e/amp-list/amp-list.ssr.html',
  '!test/fixtures/e2e/amp-script/basic.amp.html',
  '!test/fixtures/e2e/amp-selector/amp-selector-tabs.html',
  '!test/fixtures/e2e/amp-social-share/amp-social-share.html',
  '!test/fixtures/e2e/amp-story-auto-ads/basic.html',
  '!test/fixtures/e2e/amp-story-auto-ads/dv3-request.html',
  '!test/fixtures/e2e/amp-story-auto-ads/dv3-transformed-creative.html',
  '!test/fixtures/e2e/amp-story-auto-ads/fullbleed.html',
  '!test/fixtures/e2e/amp-story/amp-story.amp.html',
  '!test/fixtures/e2e/amp-subscriptions-google/swg.amp.html',
  '!test/fixtures/e2e/amp-video/videos-cdn.html',
  '!test/fixtures/e2e/amp-viewer-integration/viewer.html',
  '!test/fixtures/e2e/amp4email/element-size-race.html',
  '!test/fixtures/e2e/amp4email/viewport-size-race.html',
  '!test/fixtures/e2e/amphtml-ads/amp-creative.html',
  '!test/fixtures/e2e/amphtml-ads/botguard.a4a.html',
  '!test/fixtures/e2e/amphtml-ads/image.html',
  '!test/fixtures/e2e/amphtml-ads/lightbox-ad.a4a.html',
  '!test/fixtures/e2e/amphtml-ads/text.html',

  // The following is a server-rendered file which is technically invalid.
  '!examples/compiler-hydration.html',
];

/**
 * Array of 3p bootstrap urls
 * Defined by the following object schema:
 * basename: the name of the 3p frame without extension
 * max: the path of the readable html
 * min: the name of the minimized html
 */
const thirdPartyFrames = [
  {
    basename: 'frame',
    max: '3p/frame.max.html',
    min: 'frame.html',
  },
  {
    basename: 'nameframe',
    max: '3p/nameframe.max.html',
    min: 'nameframe.html',
  },
  {
    basename: 'recaptcha',
    max: '3p/recaptcha.max.html',
    min: 'recaptcha.html',
  },
];

/**
 * File types to ignore while auto-generating a changelog for a new release.
 */
const changelogIgnoreFileTypes = /\.md|\.json|\.yaml|LICENSE|CONTRIBUTORS$/;

/** @const  */
module.exports = {
  changelogIgnoreFileTypes,
  commonIntegrationTestPaths,
  getCommonUnitTestPaths,
  devDashboardTestPaths,
  e2eTestPaths,
  htmlFixtureGlobs,
  integrationTestPaths,
  invalidWhitespaceGlobs,
  jisonPath,
  karmaHtmlFixturesPath,
  karmaJsPaths,
  linkCheckGlobs,
  lintGlobs,
  presubmitGlobs,
  prettifyGlobs,
  testPaths,
  thirdPartyFrames,
  unitTestCrossBrowserPaths,
  unitTestPaths,
};
