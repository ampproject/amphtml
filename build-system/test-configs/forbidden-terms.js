/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const requiresReviewPrivacy =
  'Usage of this API requires dedicated review due to ' +
  'being privacy sensitive. Please file an issue asking for permission' +
  ' to use if you have not yet done so.';

const privateServiceFactory =
  'This service should only be installed in ' +
  'the allowlisted files. Other modules should use a public function ' +
  'typically called serviceNameFor.';

const shouldNeverBeUsed =
  'Usage of this API is not allowed - only for internal purposes.';

const backwardCompat =
  'This method must not be called. It is only retained ' +
  'for backward compatibility during rollout.';

const realiasGetMode =
  'Do not re-alias getMode or its return so it can be ' +
  'DCE\'d. Use explicitly like "getMode().localDev" instead.';

/**
 * @typedef {{
 *   message?: (undefined|string),
 *   allowlist?: (undefined|Array<string>),
 *   checkInTestFolder?: (undefined|boolean),
 *   checkComments?: (undefined|boolean),
 * }}
 */
let ForbiddenTermDef;

/**
 * Terms that must not appear in our source files.
 * @const {Object<string, string|!ForbiddenTermDef>}
 */
const forbiddenTermsGlobal = {
  'DO NOT SUBMIT': {
    checkComments: true,
  },
  'whitelist|white-list': {
    message: 'Please use the term allowlist instead',
    checkComments: true,
  },
  'blacklist|black-list': {
    message: 'Please use the term denylist instead',
    checkComments: true,
  },
  'grandfather|grandfathered': {
    message: 'Please use the term legacy instead',
    checkComments: true,
  },
  '(^-amp-|\\W-amp-)': {
    message: 'Switch to new internal class form',
    allowlist: [
      'build-system/server/amp4test.js',
      'build-system/server/app-index/boilerplate.js',
      'build-system/server/variable-substitution.js',
      'build-system/tasks/extension-generator/index.js',
      'extensions/amp-pinterest/0.1/amp-pinterest.css',
      'extensions/amp-pinterest/0.1/follow-button.js',
      'extensions/amp-pinterest/0.1/pin-widget.js',
      'extensions/amp-pinterest/0.1/save-button.js',
      'validator/js/engine/validator_test.js',
    ],
  },
  '(^i-amp-|\\Wi-amp-)': {
    message: 'Switch to new internal ID form',
    allowlist: [
      'build-system/tasks/create-golden-css/css/main.css',
      'css/ampshared.css',
    ],
  },
  'describe\\.only': '',
  'describes.*\\.only': '',
  'dev\\(\\)\\.assert\\(': 'Use the devAssert function instead.',
  '[^.]user\\(\\)\\.assert\\(': 'Use the userAssert function instead.',
  'it\\.only': '',
  'Math.random[^;()]*=': 'Use Sinon to stub!!!',
  'sinon\\.(spy|stub|mock)\\(': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls',
  },
  '(\\w*([sS]py|[sS]tub|[mM]ock|clock).restore)': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls',
  },
  'sinon\\.useFake\\w+': {
    message: 'Use a sandbox instead to avoid repeated `#restore` calls',
  },
  'sandbox\\.(spy|stub|mock)\\([^,\\s]*[iI]?frame[^,\\s]*,': {
    message:
      'Do NOT stub on a cross domain iframe! #5359\n' +
      '  If this is same domain, mark /*OK*/.\n' +
      '  If this is cross domain, overwrite the method directly.',
  },
  'console\\.\\w+\\(': {
    message: String(
      'console.log is generally forbidden. For the runtime, use ' +
        'console/*OK*/.[log|error] to allowlist a legit case. ' +
        'For build-system, use the functions in build-system/common/logging.js.'
    ),
    allowlist: [
      'build-system/common/check-package-manager.js',
      'build-system/common/logging.js',
      'src/purifier/noop.js',
      'validator/js/engine/validator-in-browser.js',
      'validator/js/engine/validator.js',
    ],
    checkInTestFolder: true,
  },
  '\\bgetModeObject\\(': {
    message: realiasGetMode,
    allowlist: ['src/mode-object.js', 'src/iframe-attributes.js'],
  },
  '(?:var|let|const) +IS_DEV +=': {
    message:
      'IS_DEV local var only allowed in mode.js and ' +
      'dist.3p/current/integration.js',
    allowlist: ['src/mode.js'],
  },
  '\\.prefetch\\(': {
    message: 'Do not use preconnect.prefetch, use preconnect.preload instead.',
  },
  'iframePing': {
    message:
      'This is only available in vendor config for temporary workarounds.',
    allowlist: [
      'build-system/server/routes/analytics.js',
      'extensions/amp-analytics/0.1/config.js',
      'extensions/amp-analytics/0.1/requests.js',
    ],
  },
  '\\.buildInternal': {
    message: 'can only be called by the framework',
    allowlist: [
      'src/custom-element.js',
      'src/service/resource.js',
      'testing/iframe.js',
    ],
  },
  '\\.mountInternal': {
    message: 'can only be called by the framework',
    allowlist: ['src/service/scheduler.js'],
  },
  'getSchedulerForDoc': {
    message: 'can only be used by the runtime',
    allowlist: ['src/custom-element.js', 'src/service/scheduler.js'],
  },
  // Service factories that should only be installed once.
  'installActionServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      'src/inabox/inabox-services.js',
      'src/service/action-impl.js',
      'src/service/core-services.js',
    ],
  },
  'installActionHandler': {
    message: privateServiceFactory,
    allowlist: [
      'src/service/action-impl.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-form/0.1/amp-form.js',
    ],
  },
  'installActivityService': {
    message: privateServiceFactory,
    allowlist: ['extensions/amp-analytics/0.1/activity-impl.js'],
  },
  'cidServiceForDocForTesting': {
    message: privateServiceFactory,
    allowlist: ['src/service/cid-impl.js'],
  },
  'installCryptoService': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/crypto-impl.js'],
  },
  'installDocService': {
    message: privateServiceFactory,
    allowlist: [
      'src/amp.js',
      'src/amp-shadow.js',
      'src/inabox/amp-inabox.js',
      'src/service/ampdoc-impl.js',
      'testing/describes.js',
      'testing/iframe.js',
    ],
  },
  'installMutatorServiceForDoc': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/mutator-impl.js'],
  },
  'installPerformanceService': {
    message: privateServiceFactory,
    allowlist: [
      'src/amp.js',
      'src/inabox/amp-inabox.js',
      'src/service/performance-impl.js',
    ],
  },
  'installResourcesServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      'src/service/core-services.js',
      'src/service/resources-impl.js',
    ],
  },
  'installStorageServiceForDoc': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/storage-impl.js'],
  },
  'installTemplatesServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      'src/inabox/inabox-services.js',
      'src/service/core-services.js',
      'src/service/template-impl.js',
    ],
  },
  'installUrlReplacementsServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      'src/inabox/inabox-services.js',
      'src/service/core-services.js',
      'src/service/url-replacements-impl.js',
    ],
  },
  'installViewerServiceForDoc': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/viewer-impl.js'],
  },
  'installViewportServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      'src/service/core-services.js',
      'src/service/viewport/viewport-impl.js',
    ],
  },
  'installVsyncService': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/vsync-impl.js'],
  },
  'installXhrService': {
    message: privateServiceFactory,
    allowlist: ['src/service/core-services.js', 'src/service/xhr-impl.js'],
  },
  'installPositionObserverServiceForDoc': {
    message: privateServiceFactory,
    allowlist: [
      // Please keep list alphabetically sorted.
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js',
      'extensions/amp-next-page/0.1/next-page-service.js',
      'extensions/amp-next-page/1.0/visibility-observer.js',
      'extensions/amp-position-observer/0.1/amp-position-observer.js',
      'src/service/position-observer/position-observer-impl.js',
    ],
  },
  'getServiceForDoc': {
    message:
      'Synchronous access to element services is unreliable (#22414). ' +
      'Use getServicePromiseForDoc() instead.',
    allowlist: [
      // Do not allowlist additional "extensions/*" paths.
      // TODO(#22414): Remove paths as they are migrated off of sync API.
      'extensions/amp-a4a/0.1/amp-ad-template-helper.js',
      'extensions/amp-analytics/0.1/instrumentation.js',
      'extensions/amp-analytics/0.1/variables.js',
      'extensions/amp-fx-collection/0.1/providers/fx-provider.js',
      'extensions/amp-gwd-animation/0.1/amp-gwd-animation.js',
      'src/chunk.js',
      'src/element-service.js',
      'src/service.js',
      'src/service/scheduler.js',
      'src/service/cid-impl.js',
      'src/service/origin-experiments-impl.js',
      'src/service/template-impl.js',
      'src/services.js',
      'src/utils/display-observer.js',
      'testing/test-helper.js',
    ],
  },
  'initLogConstructor|setReportError': {
    message: 'Should only be called from JS binary entry files.',
    allowlist: [
      '3p/integration-lib.js',
      '3p/ampcontext-lib.js',
      '3p/iframe-transport-client-lib.js',
      '3p/recaptcha.js',
      'ads/alp/install-alp.js',
      'ads/inabox/inabox-host.js',
      'extensions/amp-access/0.1/amp-login-done.js',
      'src/amp-story-player/amp-story-component-manager.js',
      'src/runtime.js',
      'src/log.js',
      'src/web-worker/web-worker.js',
      'tools/experiments/experiments.js',
    ],
  },
  'parseUrlWithA': {
    message: 'Use parseUrl instead.',
    allowlist: [
      'src/url.js',
      'src/service/url-impl.js',
      'src/amp-story-player/amp-story-player-impl.js',
    ],
  },
  '\\.sendMessage\\(': {
    message: 'Usages must be reviewed.',
    allowlist: [
      // viewer-impl.sendMessage
      'src/error.js',
      'src/service/navigation.js',
      'src/service/viewport/viewport-impl.js',
      'src/service/performance-impl.js',
      'src/service/resources-impl.js',
      'extensions/amp-bind/0.1/bind-impl.js',
      'extensions/amp-app-banner/0.1/amp-app-banner.js',
      'extensions/amp-subscriptions/0.1/viewer-subscription-platform.js',
      'extensions/amp-viewer-integration/0.1/highlight-handler.js',
      'extensions/amp-consent/0.1/consent-ui.js',
      'extensions/amp-story/1.0/amp-story-viewer-messaging-handler.js',

      // iframe-messaging-client.sendMessage
      '3p/iframe-messaging-client.js',
      '3p/ampcontext.js',
      '3p/ampcontext-integration.js',
    ],
  },
  '\\.sendMessageAwaitResponse\\(': {
    message: 'Usages must be reviewed.',
    allowlist: [
      'extensions/amp-access/0.1/login-dialog.js',
      'extensions/amp-story-education/0.1/amp-story-education.js',
      'extensions/amp-subscriptions/0.1/viewer-subscription-platform.js',
      'src/impression.js',
      'src/service/cid-impl.js',
      'src/service/history-impl.js',
      'src/service/storage-impl.js',
      'src/ssr-template-helper.js',
      'src/service/viewer-cid-api.js',
      'src/utils/xhr-utils.js',
    ],
  },
  // Privacy sensitive
  'cidForDoc|cidForDocOrNull': {
    message: requiresReviewPrivacy,
    allowlist: [
      // CID service is not allowed in amp4ads. No usage should there be
      // in extensions listed in the amp4ads spec:
      // https://amp.dev/documentation/guides-and-tutorials/learn/a4a_spec
      'src/ad-cid.js',
      'src/services.js',
      'src/service/standard-actions-impl.js',
      'src/service/url-replacements-impl.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-subscriptions/0.1/amp-subscriptions.js',
      'extensions/amp-experiment/0.1/variant.js',
      'extensions/amp-experiment/1.0/variant.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
      'extensions/amp-consent/0.1/consent-config.js',
      'extensions/amp-story-interactive/0.1/amp-story-interactive-abstract.js',
    ],
  },
  'getBaseCid': {
    message: requiresReviewPrivacy,
    allowlist: ['src/service/cid-impl.js'],
  },
  'isTrustedViewer': {
    message: requiresReviewPrivacy,
    allowlist: [
      'extensions/amp-bind/0.1/bind-impl.js',
      'src/error.js',
      'src/utils/xhr-utils.js',
      'src/service/navigation.js',
      'src/service/viewer-impl.js',
      'src/service/viewer-interface.js',
      'src/service/viewer-cid-api.js',
      'src/inabox/inabox-viewer.js',
      'src/service/cid-impl.js',
      'src/impression.js',
      'src/ssr-template-helper.js',
    ],
  },
  'prerenderSafe': {
    message: requiresReviewPrivacy,
    allowlist: [
      'build-system/externs/amp.extern.js',
      'extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.js',
      'src/utils/xhr-utils.js',
    ],
  },
  'eval\\(': {
    message: shouldNeverBeUsed,
  },
  'storageForDoc|storageForTopLevelDoc': {
    message:
      requiresReviewPrivacy +
      ' Please refer to spec/amp-localstorage.md for more information on' +
      ' the storage service usage.' +
      ' Once approved, please also update the spec/amp-localstorage.md to' +
      ' include your usage.',
    allowlist: [
      // Storage service is not allowed in amp4ads. No usage should there be
      // in extensions listed in the amp4ads spec:
      // https://amp.dev/documentation/guides-and-tutorials/learn/a4a_spec
      'src/services.js',
      'src/service/cid-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/responsive-state.js',
      'extensions/amp-app-banner/0.1/amp-app-banner.js',
      'extensions/amp-consent/0.1/consent-state-manager.js',
      'extensions/amp-user-notification/0.1/amp-user-notification.js',
    ],
  },
  'localStorage': {
    message: requiresReviewPrivacy,
    allowlist: [
      'extensions/amp-access/0.1/amp-access-iframe.js',
      'extensions/amp-script/0.1/amp-script.js',
      'extensions/amp-story/1.0/history.js',
      'extensions/amp-web-push/0.1/amp-web-push-helper-frame.js',
      'extensions/amp-web-push/0.1/amp-web-push-permission-dialog.js',
      'src/experiments.js',
      'src/service/cid-impl.js',
      'src/service/storage-impl.js',
      'testing/fake-dom.js',
    ],
  },
  'sessionStorage': {
    message: requiresReviewPrivacy,
    allowlist: [
      'extensions/amp-access/0.1/amp-access-iframe.js',
      'extensions/amp-accordion/0.1/amp-accordion.js',
      'extensions/amp-script/0.1/amp-script.js',
      'testing/fake-dom.js',
    ],
  },
  'indexedDB': {
    message: requiresReviewPrivacy,
  },
  'openDatabase': requiresReviewPrivacy,
  'requestFileSystem': requiresReviewPrivacy,
  'webkitRequestFileSystem': requiresReviewPrivacy,
  'getAccessReaderId': {
    message: requiresReviewPrivacy,
    allowlist: [
      'build-system/externs/amp.extern.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-access/0.1/access-vars.js',
      'extensions/amp-subscriptions/0.1/amp-subscriptions.js',
      'src/service/url-replacements-impl.js',
    ],
  },
  'getAuthdataField': {
    message: requiresReviewPrivacy,
    allowlist: [
      'build-system/externs/amp.extern.js',
      'extensions/amp-access/0.1/amp-access.js',
      'extensions/amp-access/0.1/access-vars.js',
      'extensions/amp-subscriptions/0.1/amp-subscriptions.js',
      'src/service/url-replacements-impl.js',
    ],
  },
  'debugger': '',
  // Overridden APIs.
  '(doc.*)\\.referrer': {
    message: 'Use Viewer.getReferrerUrl() instead.',
    allowlist: [
      '3p/integration-lib.js',
      'ads/google/a4a/utils.js',
      'src/inabox/inabox-viewer.js',
      'src/service/viewer-impl.js',
      'src/error.js',
      'src/window-interface.js',
    ],
  },
  'getUnconfirmedReferrerUrl': {
    message: 'Use Viewer.getReferrerUrl() instead.',
    allowlist: [
      'extensions/amp-dynamic-css-classes/0.1/amp-dynamic-css-classes.js',
      'src/iframe-attributes.js',
      'src/service/viewer-impl.js',
      'src/service/viewer-interface.js',
      'src/inabox/inabox-viewer.js',
    ],
  },
  'internalListenImplementation': {
    message:
      'Use `listen()` in either `event-helper` or `3p-frame-messaging`' +
      ', depending on your use case.',
    allowlist: [
      'src/3p-frame-messaging.js',
      'src/event-helper.js',
      'src/event-helper-listen.js',
    ],
  },
  'setTimeout.*throw': {
    message: 'Use dev.error or user.error instead.',
  },
  '(dev|user)\\(\\)\\.(fine|info|warn|error)\\((?!\\s*([A-Z0-9-]+|[\'"`][A-Z0-9-]+[\'"`]))[^,)\n]*': {
    message:
      'Logging message require explicitly `TAG`, or an all uppercase' +
      ' string as the first parameter',
    allowlist: [
      'build-system/babel-plugins/babel-plugin-transform-dev-methods/index.js',
    ],
  },
  '\\.schedulePass\\(': {
    message: 'schedulePass is heavy, think twice before using it',
    allowlist: ['src/service/mutator-impl.js', 'src/service/resources-impl.js'],
  },
  '\\.requireLayout\\(': {
    message:
      'requireLayout is restricted b/c it affects non-contained elements',
    allowlist: ['extensions/amp-animation/0.1/web-animations.js'],
  },
  '\\.updateLayoutPriority\\(': {
    message: 'updateLayoutPriority is a restricted API.',
    allowlist: [
      'extensions/amp-a4a/0.1/amp-a4a.js',
      'src/base-element.js',
      'src/service/resources-impl.js',
    ],
  },
  'overrideVisibilityState': {
    message: 'overrideVisibilityState is a restricted API.',
    allowlist: [
      'src/friendly-iframe-embed.js',
      'src/multidoc-manager.js',
      'src/service/ampdoc-impl.js',
      'src/service/viewer-impl.js',
    ],
  },
  '\\.scheduleLayoutOrPreload\\(': {
    message: 'scheduleLayoutOrPreload is a restricted API.',
    allowlist: ['src/custom-element.js', 'src/service/resources-impl.js'],
  },
  '(win|Win)(dow)?(\\(\\))?\\.open\\W': {
    message: 'Use dom.openWindowDialog',
    allowlist: ['src/dom.js'],
  },
  '\\.getWin\\(': {
    message: backwardCompat,
  },
  '/\\*\\* @type \\{\\!Element\\} \\*/': {
    message: 'Use assertElement instead of casting to !Element.',
    allowlist: [
      'src/log.js', // Has actual implementation of assertElement.
      'src/polyfills/custom-elements.js',
      'ads/google/imaVideo.js', // Required until #22277 is fixed.
      '3p/twitter.js', // Runs in a 3p window context, so cannot import log.js.
    ],
  },
  'startupChunk\\(': {
    message: 'startupChunk( should only be used during startup',
    allowlist: [
      'src/amp.js',
      'src/chunk.js',
      'src/inabox/amp-inabox.js',
      'src/runtime.js',
      'src/custom-element.js',
      'src/service/resources-impl.js',
    ],
  },
  'AMP_CONFIG': {
    message:
      'Do not access AMP_CONFIG directly. Use isExperimentOn() ' +
      'and getMode() to access config',
    allowlist: [
      'build-system/externs/amp.extern.js',
      'build-system/server/app.js',
      'build-system/tasks/e2e/index.js',
      'build-system/tasks/firebase.js',
      'build-system/tasks/integration.js',
      'build-system/tasks/prepend-global/index.js',
      'build-system/tasks/prepend-global/prepend-global.test.js',
      'build-system/tasks/release/index.js',
      'build-system/tasks/visual-diff/index.js',
      'build-system/tasks/build.js',
      'build-system/tasks/default-task.js',
      'build-system/tasks/dist.js',
      'build-system/tasks/helpers.js',
      'src/config.js',
      'src/experiments.js',
      'src/mode.js',
      'src/web-worker/web-worker.js', // Web worker custom error reporter.
      'tools/experiments/experiments.js',
      'build-system/server/amp4test.js',
    ],
  },
  'data:image/svg(?!\\+xml;charset=utf-8,)[^,]*,': {
    message:
      'SVG data images must use charset=utf-8: ' +
      '"data:image/svg+xml;charset=utf-8,..."',
    allowlist: ['src/service/ie-intrinsic-bug.js'],
  },
  'new CustomEvent\\(': {
    message: 'Use createCustomEvent() helper instead.',
  },
  'new FormData\\(': {
    message:
      'Use createFormDataWrapper() instead and call ' +
      'formDataWrapper.getFormData() to get the native FormData object.',
    allowlist: ['src/form-data-wrapper.js'],
  },
  '\\.defer\\(\\)': {
    message: 'Promise.defer() is deprecated and should not be used.',
  },
  '(dev|user)\\(\\)\\.assert(Element|String|Number)?\\(\\s*([A-Z][A-Z0-9-]*,)': {
    message: 'TAG is not an argument to assert(). Will cause false positives.',
  },
  'eslint no-unused-vars': {
    message: 'Use a line-level "no-unused-vars" rule instead.',
    allowlist: ['extensions/amp-access/0.1/iframe-api/access-controller.js'],
  },
  'this\\.skip\\(\\)': {
    message:
      'Use of `this.skip()` is forbidden in test files. Use ' +
      '`this.skipTest()` from within a `before()` block instead. See #17245.',
    checkInTestFolder: true,
    allowlist: ['test/_init_tests.js'],
  },
  '[^\\.]makeBodyVisible\\(': {
    message:
      'This is a protected function. If you are calling this to show ' +
      'body after an error please use `makeBodyVisibleRecovery`',
    allowlist: [
      'src/amp.js',
      'src/style-installer.js',
      'src/inabox/amp-inabox.js',
    ],
  },
  'isBuildRenderBlocking': {
    message:
      'This is a protected API. Please only override it the element is ' +
      'render blocking',
    allowlist: [
      'src/service/resources-impl.js',
      'src/service/resource.js',
      'src/custom-element.js',
      'src/base-element.js',
      'extensions/amp-experiment/0.1/amp-experiment.js',
      'extensions/amp-experiment/1.0/amp-experiment.js',
    ],
  },
  '^describe[\\.|\\(|$]': {
    message:
      'Top-level "describe" blocks in test files have been deprecated. ' +
      'Use "describes.{realWin|sandboxed|fakeWin|integration}".',
    allowlist: [
      // Non test files. These can remain.
      'build-system/server/app-index/test/test-amphtml-helpers.js',
      'build-system/server/app-index/test/test-file-list.js',
      'build-system/server/app-index/test/test-html.js',
      'build-system/server/app-index/test/test-self.js',
      'build-system/server/app-index/test/test-template.js',
      'build-system/server/app-index/test/test.js',
      'test/_init_tests.js',
      'test/e2e/test-controller-promise.js',
      'test/e2e/test-expect.js',
      'validator/js/engine/amp4ads-parse-css_test.js',
      'validator/js/engine/htmlparser_test.js',
      'validator/js/engine/keyframes-parse-css_test.js',
      'validator/js/engine/parse-css_test.js',
      'validator/js/engine/parse-srcset_test.js',
      'validator/js/engine/parse-url_test.js',
      'validator/js/engine/validator_test.js',
      'validator/js/gulpjs/test/validate.js',
      // Test files. TODO(#24144): Fix these and remove from the allowlist.
      'ads/google/a4a/shared/test/test-content-recommendation.js',
      'ads/google/a4a/shared/test/test-url-builder.js',
      'ads/google/a4a/test/test-line-delimited-response-handler.js',
      'ads/google/a4a/test/test-traffic-experiments.js',
      'ads/google/a4a/test/test-utils.js',
      'ads/google/test/test-utils.js',
      'extensions/amp-a4a/0.1/test/test-a4a-integration.js',
      'extensions/amp-a4a/0.1/test/test-a4a-var-source.js',
      'extensions/amp-a4a/0.1/test/test-amp-ad-utils.js',
      'extensions/amp-a4a/0.1/test/test-refresh.js',
      'extensions/amp-access/0.1/test/test-access-expr.js',
      'extensions/amp-access/0.1/test/test-amp-login-done-dialog.js',
      'extensions/amp-access/0.1/test/test-jwt.js',
      'extensions/amp-ad-exit/0.1/test/filters/test-click-delay.js',
      'extensions/amp-ad/0.1/test/test-amp-ad-3p-impl.js',
      'extensions/amp-ad/0.1/test/test-amp-ad-custom.js',
      'extensions/amp-ad/0.1/test/test-amp-ad-xorigin-iframe-handler.js',
      'extensions/amp-addthis/0.1/test/addthis-utils/test-fragment.js',
      'extensions/amp-addthis/0.1/test/addthis-utils/test-rot13.js',
      'extensions/amp-analytics/0.1/test/test-iframe-transport-client.js',
      'extensions/amp-analytics/0.1/test/test-linker-manager.js',
      'extensions/amp-analytics/0.1/test/test-linker-reader.js',
      'extensions/amp-analytics/0.1/test/test-linker.js',
      'extensions/amp-analytics/0.1/test/test-transport-serializers.js',
      'extensions/amp-auto-ads/0.1/test/test-attributes.js',
      'extensions/amp-bind/0.1/test/test-bind-evaluator.js',
      'extensions/amp-bind/0.1/test/test-bind-expression.js',
      'extensions/amp-bind/0.1/test/test-bind-validator.js',
      'extensions/amp-dynamic-css-classes/0.1/test/test-dynamic-classes.js',
      'extensions/amp-fx-collection/0.1/test/integration/test-amp-fx-fly-in.js',
      'extensions/amp-lightbox-gallery/0.1/test/integration/test-amp-lightbox-gallery.js',
      'extensions/amp-list/0.1/test/integration/test-amp-list.js',
      'extensions/amp-live-list/0.1/test/test-poller.js',
      'extensions/amp-script/0.1/test/unit/test-amp-script.js',
      'extensions/amp-sidebar/0.1/test/test-toolbar.js',
      'extensions/amp-truncate-text/0.1/test/test-binary-search.js',
      'extensions/amp-viewer-integration/0.1/test/test-findtext.js',
      'test/integration/test-3p-nameframe.js',
      'test/integration/test-amp-ad-3p.js',
      'test/integration/test-amp-pixel.js',
      'test/integration/test-amp-skimlinks.js',
      'test/integration/test-boilerplates.js',
      'test/integration/test-configuration.js',
      'test/integration/test-css.js',
      'test/integration/test-extensions-loading.js',
      'test/integration/test-released.js',
      'test/integration/test-video-manager.js',
      'test/integration/test-video-players.js',
      'test/unit/3p/test-3p-messaging.js',
      'test/unit/3p/test-recaptcha.js',
      'test/unit/ads/test-unruly.js',
      'test/unit/test-3p-environment.js',
      'test/unit/test-3p.js',
      'test/unit/test-action.js',
      'test/unit/test-activity.js',
      'test/unit/test-ad-helper.js',
      'test/unit/test-ads-config.js',
      'test/unit/test-alp-handler.js',
      'test/unit/test-amp-context.js',
      'test/unit/test-amp-inabox.js',
      'test/unit/test-animation.js',
      'test/unit/test-batched-json.js',
      'test/unit/test-callout-vendors.js',
      'test/unit/test-chunk.js',
      'test/unit/test-cid.js',
      'test/unit/test-css.js',
      'test/unit/test-curve.js',
      'test/unit/test-describes.js',
      'test/unit/test-document-ready.js',
      'test/unit/test-error.js',
      'test/unit/test-event-helper.js',
      'test/unit/test-experiments.js',
      'test/unit/test-exponential-backoff.js',
      'test/unit/test-finite-state-machine.js',
      'test/unit/test-focus-history.js',
      'test/unit/test-gesture-recognizers.js',
      'test/unit/test-gesture.js',
      'test/unit/test-get-html.js',
      'test/unit/test-ie-media-bug.js',
      'test/unit/test-input.js',
      'test/unit/test-integration.js',
      'test/unit/test-intersection-observer-polyfill.js',
      'test/unit/test-json.js',
      'test/unit/test-layout-rect.js',
      'test/unit/test-layout.js',
      'test/unit/test-log.js',
      'test/unit/test-mode.js',
      'test/unit/test-motion.js',
      'test/unit/test-mustache.js',
      'test/unit/test-object.js',
      'test/unit/test-observable.js',
      'test/unit/test-pass.js',
      'test/unit/test-platform.js',
      'test/unit/test-polyfill-document-contains.js',
      'test/unit/test-polyfill-math-sign.js',
      'test/unit/test-polyfill-object-assign.js',
      'test/unit/test-polyfill-object-values.js',
      'test/unit/test-pull-to-refresh.js',
      'test/unit/test-purifier.js',
      'test/unit/test-render-delaying-services.js',
      'test/unit/test-resource.js',
      'test/unit/test-sanitizer.js',
      'test/unit/test-service.js',
      'test/unit/test-srcset.js',
      'test/unit/test-static-template.js',
      'test/unit/test-string.js',
      'test/unit/test-style-installer.js',
      'test/unit/test-style.js',
      'test/unit/test-task-queue.js',
      'test/unit/test-transition.js',
      'test/unit/test-types.js',
      'test/unit/test-url-rewrite.js',
      'test/unit/test-url.js',
      'test/unit/test-viewport.js',
      'test/unit/test-web-components.js',
      'test/unit/utils/test-array.js',
      'test/unit/utils/test-bytes.js',
      'test/unit/utils/test-lru-cache.js',
      'test/unit/utils/test-priority-queue.js',
      'test/unit/utils/test-rate-limit.js',
      'test/unit/web-worker/test-amp-worker.js',
    ],
    checkInTestFolder: true,
  },
};

const bannedTermsHelpString =
  'Please review viewport service for helper ' +
  'methods or mark with `/*OK*/` or `/*REVIEW*/` and consult the AMP team. ' +
  'Most of the forbidden property/method access banned on the ' +
  '`forbiddenTermsSrcInclusive` object can be found in ' +
  '[What forces layout / reflow gist by Paul Irish]' +
  '(https://gist.github.com/paulirish/5d52fb081b3570c81e3a). ' +
  'These properties/methods when read/used require the browser ' +
  'to have the up-to-date value to return which might possibly be an ' +
  'expensive computation and could also be triggered multiple times ' +
  'if we are not careful. Please mark the call with ' +
  '`object./*OK*/property` if you explicitly need to read or update the ' +
  'forbidden property/method or mark it with `object./*REVIEW*/property` ' +
  'if you are unsure and so that it stands out in code reviews.';

const measurementApiDeprecated =
  'getLayoutSize/Box APIs are being deprecated. Please contact the' +
  ' @ampproject/wg-performance for questions.';

/**
 * @const {Object<string, string|!ForbiddenTermDef>}
 */
const forbiddenTermsSrcInclusive = {
  '\\.innerHTML(?!_)': bannedTermsHelpString,
  '\\.outerHTML(?!_)': bannedTermsHelpString,
  '\\.offsetLeft(?!_)': bannedTermsHelpString,
  '\\.offsetTop(?!_)': bannedTermsHelpString,
  '\\.offsetWidth(?!_)': bannedTermsHelpString,
  '\\.offsetHeight(?!_)': bannedTermsHelpString,
  '\\.offsetParent(?!_)': bannedTermsHelpString,
  '\\.clientLeft(?!_)(?!_)': bannedTermsHelpString,
  '\\.clientTop(?!_)': bannedTermsHelpString,
  '\\.clientWidth(?!_)': bannedTermsHelpString,
  '\\.clientHeight(?!_)': bannedTermsHelpString,
  '\\.scrollWidth(?!_)': 'please use `getScrollWidth()` from viewport',
  '\\.scrollHeight(?!_)': bannedTermsHelpString,
  '\\.scrollTop(?!_)': bannedTermsHelpString,
  '\\.scrollLeft(?!_)': bannedTermsHelpString,
  '\\.computedRole(?!_)': bannedTermsHelpString,
  '\\.computedName(?!_)': bannedTermsHelpString,
  '\\.innerText(?!_)': bannedTermsHelpString,
  '\\.scrollX(?!_)': bannedTermsHelpString,
  '\\.scrollY(?!_)': bannedTermsHelpString,
  '\\.pageXOffset(?!_)': bannedTermsHelpString,
  '\\.pageYOffset(?!_)': bannedTermsHelpString,
  '\\.innerWidth(?!_)': bannedTermsHelpString,
  '\\.innerHeight(?!_)': bannedTermsHelpString,
  '\\.scrollingElement(?!_)': bannedTermsHelpString,
  '\\.computeCTM(?!_)': bannedTermsHelpString,
  // Functions
  '\\.applySize\\(': bannedTermsHelpString,
  '\\.attemptChangeHeight\\(0\\)': 'please consider using `attemptCollapse()`',
  '\\.collapse\\(': bannedTermsHelpString,
  '\\.expand\\(': bannedTermsHelpString,
  '\\.focus\\(': bannedTermsHelpString,
  '\\.getBBox\\(': bannedTermsHelpString,
  '\\.getBoundingClientRect\\(': bannedTermsHelpString,
  '\\.getClientRects\\(': bannedTermsHelpString,
  '\\.getMatchedCSSRules\\(': bannedTermsHelpString,
  '\\.scrollBy\\(': bannedTermsHelpString,
  '\\.scrollIntoView\\(': bannedTermsHelpString,
  '\\.scrollIntoViewIfNeeded\\(': bannedTermsHelpString,
  '\\.scrollTo\\(': bannedTermsHelpString,
  '\\.webkitConvertPointFromNodeToPage\\(': bannedTermsHelpString,
  '\\.webkitConvertPointFromPageToNode\\(': bannedTermsHelpString,
  '\\.scheduleUnlayout\\(': bannedTermsHelpString,
  '\\.postMessage\\(': {
    message: bannedTermsHelpString,
    allowlist: [
      'extensions/amp-install-serviceworker/0.1/amp-install-serviceworker.js',
    ],
  },
  'getComputedStyle\\(': {
    message:
      'Due to various bugs in Firefox, you must use the computedStyle ' +
      'helper in style.js.',
    allowlist: ['src/style.js', 'build-system/tasks/coverage-map/index.js'],
  },
  'decodeURIComponent\\(': {
    message:
      'decodeURIComponent throws for malformed URL components. Please ' +
      'use tryDecodeUriComponent from src/url.js',
    allowlist: [
      '3p/integration-lib.js',
      'examples/pwa/pwa.js',
      'validator/js/engine/parse-url.js',
      'validator/js/engine/validator.js',
      'validator/js/webui/webui.js',
      'src/url.js',
      'src/url-try-decode-uri-component.js',
      'src/utils/bytes.js',
    ],
  },
  'Text(Encoder|Decoder)\\(': {
    message:
      'TextEncoder/TextDecoder is not supported in all browsers.' +
      ' Please use UTF8 utilities from src/bytes.js',
    allowlist: [
      'ads/google/a4a/line-delimited-response-handler.js',
      'examples/pwa/pwa.js',
      'src/utils/bytes.js',
      'src/utils/stream-response.js',
    ],
  },
  'contentHeightChanged': {
    message: bannedTermsHelpString,
    allowlist: [
      'src/inabox/inabox-viewport.js',
      'src/service/resources-impl.js',
      'src/service/viewport/viewport-binding-def.js',
      'src/service/viewport/viewport-binding-ios-embed-wrapper.js',
      'src/service/viewport/viewport-binding-natural.js',
      'src/service/viewport/viewport-impl.js',
      'src/service/viewport/viewport-interface.js',
    ],
  },
  'preloadExtension': {
    message: bannedTermsHelpString,
    allowlist: [
      'src/friendly-iframe-embed.js',
      'src/polyfillstub/intersection-observer-stub.js',
      'src/polyfillstub/resize-observer-stub.js',
      'src/service/extensions-impl.js',
      'src/service/crypto-impl.js',
    ],
  },
  'loadElementClass': {
    message: bannedTermsHelpString,
    allowlist: [
      'src/service/extensions-impl.js',
      'extensions/amp-ad/0.1/amp-ad.js',
    ],
  },
  'reject\\(\\)': {
    message:
      'Always supply a reason in rejections. ' +
      'error.cancellation() may be applicable.',
  },
  '[^.]loadPromise': {
    message: 'Most users should use BaseElement…loadPromise.',
    allowlist: [
      'src/base-element.js',
      'src/event-helper.js',
      'src/friendly-iframe-embed.js',
      'src/service/resources-impl.js',
      'src/service/variable-source.js',
      'src/validator-integration.js',
      'extensions/amp-image-lightbox/0.1/amp-image-lightbox.js',
      'extensions/amp-analytics/0.1/transport.js',
      'extensions/amp-web-push/0.1/iframehost.js',
      'extensions/amp-recaptcha-input/0.1/amp-recaptcha-service.js',
    ],
  },
  '\\.getTime\\(\\)': {
    message: 'Unless you do weird date math (allowlist), use Date.now().',
    allowlist: [
      '.github/workflows/create-design-review-issue.js',
      'extensions/amp-timeago/0.1/amp-timeago.js',
      'extensions/amp-timeago/1.0/component.js',
      'src/utils/date.js',
    ],
  },
  '\\.expandStringSync\\(': {
    message: requiresReviewPrivacy,
  },
  '\\.expandStringAsync\\(': {
    message: requiresReviewPrivacy,
    allowlist: [
      'extensions/amp-analytics/0.1/config.js',
      'extensions/amp-analytics/0.1/cookie-writer.js',
      'extensions/amp-analytics/0.1/requests.js',
      'extensions/amp-analytics/0.1/variables.js',
      'extensions/amp-consent/0.1/cookie-writer.js',
    ],
  },
  '\\.expandInputValueSync\\(': {
    message: requiresReviewPrivacy,
    allowlist: ['extensions/amp-form/0.1/amp-form.js'],
  },
  '\\.expandInputValueAsync\\(': {
    message: requiresReviewPrivacy,
    allowlist: ['extensions/amp-form/0.1/amp-form.js'],
  },
  '\\.setNonBoolean\\(': {
    message: requiresReviewPrivacy,
    allowlist: [
      'src/service/cid-impl.js',
      'src/service/storage-impl.js',
      'extensions/amp-consent/0.1/consent-state-manager.js',
    ],
  },
  '(cdn|3p)\\.ampproject\\.': {
    message:
      'The CDN domain should typically not be hardcoded in source ' +
      'code. Use a property of urls from src/config.js instead.',
    allowlist: [
      'ads/_a4a-config.js',
      'build-system/server/amp4test.js',
      'build-system/server/app-index/amphtml-helpers.js',
      'build-system/server/app-utils.js',
      'build-system/server/app-video-testbench.js',
      'build-system/server/app.js',
      'build-system/server/shadow-viewer.js',
      'build-system/server/variable-substitution.js',
      'build-system/tasks/dist.js',
      'build-system/tasks/extension-generator/index.js',
      'build-system/tasks/helpers.js',
      'build-system/tasks/performance/helpers.js',
      'src/3p-frame.js',
      'src/amp-story-player/amp-story-player-impl.js',
      'src/config.js',
      'testing/local-amp-chrome-extension/background.js',
      'tools/experiments/experiments.js',
      'validator/js/engine/htmlparser-interface.js',
      'validator/js/engine/validator-in-browser.js',
      'validator/js/engine/validator.js',
      'validator/js/nodejs/index.js',
      'validator/js/webui/serve-standalone.go',
    ],
  },
  '\\<\\<\\<\\<\\<\\<': {
    message: 'Unresolved merge conflict.',
  },
  '\\>\\>\\>\\>\\>\\>': {
    message: 'Unresolved merge conflict.',
  },
  '\\.indexOf\\([\'"][^)]+\\)\\s*===?\\s*0\\b': {
    message: 'use startsWith helper in src/string.js',
    allowlist: ['build-system/server/app.js'],
  },
  '\\.indexOf\\(.*===?.*\\.length': 'use endsWith helper in src/string.js',
  '/url-parse-query-string': {
    message: 'Import parseQueryString from `src/url.js`',
    allowlist: ['src/url.js', 'src/mode.js'],
  },
  '\\.trim(Left|Right)\\(\\)': {
    message: 'Unsupported on IE; use trim() or a helper instead.',
    allowlist: ['validator/js/engine/validator.js'],
  },
  "process\\.env(\\.|\\[\\')(GITHUB_ACTIONS|CIRCLECI)": {
    message:
      'Do not directly use CI-specific environment vars. Instead, add a ' +
      'function to build-system/common/ci.js',
  },
  '\\.matches\\(': 'Please use matches() helper in src/dom.js',
  '\\.getLayoutBox': {
    message: measurementApiDeprecated,
    allowlist: [
      'src/base-element.js',
      'src/custom-element.js',
      'src/friendly-iframe-embed.js',
      'src/service/mutator-impl.js',
      'src/service/resource.js',
      'src/service/resources-impl.js',
      'extensions/amp-ad/0.1/amp-ad-3p-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/responsive-state.js',
      'extensions/amp-fx-flying-carpet/0.1/amp-fx-flying-carpet.js',
      'extensions/amp-iframe/0.1/amp-iframe.js',
      'extensions/amp-next-page/1.0/visibility-observer.js',
      'extensions/amp-playbuzz/0.1/amp-playbuzz.js',
      'extensions/amp-story/1.0/page-advancement.js',
    ],
  },
  '\\.getLayoutSize': {
    message: measurementApiDeprecated,
    allowlist: [
      'builtins/amp-img.js',
      'src/base-element.js',
      'src/custom-element.js',
      'src/iframe-helper.js',
      'src/service/mutator-impl.js',
      'src/service/resources-impl.js',
      'src/service/video-manager-impl.js',
      'extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-auto-lightbox/0.1/amp-auto-lightbox.js',
      'extensions/amp-fx-flying-carpet/0.1/amp-fx-flying-carpet.js',
      'extensions/amp-script/0.1/amp-script.js',
      'extensions/amp-story/1.0/amp-story-page.js',
    ],
  },
  'onLayoutMeasure': {
    message: measurementApiDeprecated,
    allowlist: [
      'src/base-element.js',
      'src/custom-element.js',
      'extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-a4a/0.1/amp-ad-network-base.js',
      'extensions/amp-ad/0.1/amp-ad-3p-impl.js',
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js',
      'extensions/amp-ad-exit/0.1/amp-ad-exit.js',
      'extensions/amp-ad-exit/0.1/filters/click-location.js',
      'extensions/amp-ad-exit/0.1/filters/filter.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js',
      'extensions/amp-iframe/0.1/amp-iframe.js',
      'extensions/amp-script/0.1/amp-script.js',
      'extensions/amp-story/1.0/amp-story-page.js',
    ],
  },
  '\\.getIntersectionElementLayoutBox': {
    message: measurementApiDeprecated,
    allowlist: [
      'src/custom-element.js',
      'extensions/amp-a4a/0.1/amp-a4a.js',
      'extensions/amp-ad/0.1/amp-ad-3p-impl.js',
      'extensions/amp-ad-network-adsense-impl/0.1/amp-ad-network-adsense-impl.js',
      'extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js',
      'extensions/amp-iframe/0.1/amp-iframe.js',
    ],
  },
  "require\\('fancy-log'\\)": {
    message:
      'Instead of fancy-log, use the logging functions in build-system/common/logging.js.',
  },
};

/**
 * @typedef {{
 *   term: string,
 *   match: string,
 *   message?: (undefined|string),
 *   loc: import('eslint').AST.SourceLocation,
 * }}
 */
let ForbiddenTermMatchDef;

/**
 * Check if root of path is test/ or file is in a folder named test.
 * @param {string} path
 * @return {boolean}
 */
function isInTestFolder(path) {
  const dirs = path.split('/');
  return dirs.indexOf('test') >= 0;
}

/**
 * Strip Comments
 * @param {string} contents
 * @return {string}
 */
function stripComments(contents) {
  // Multi-line comments
  contents = contents.replace(/\/\*(?!.*\*\/)(.|\n)*?\*\//g, function (match) {
    // Preserve the newlines
    const newlines = [];
    for (let i = 0; i < match.length; i++) {
      if (match[i] === '\n') {
        newlines.push('\n');
      }
    }
    return newlines.join('');
  });
  // Single line comments either on its own line or following a space,
  // semi-colon, or closing brace
  return contents.replace(/( |}|;|^) *\/\/.*/gm, '$1');
}

/**
 * Collects any forbidden terms (regex patterns) in the contents of a file,
 * and provides any possible fix information.
 *
 * @param {string} srcFile
 * @param {string} contents
 * @param {!Object<string, string|!ForbiddenTermDef>} terms
 * @return {Array<!ForbiddenTermMatchDef>}
 */
function matchForbiddenTerms(srcFile, contents, terms) {
  const contentsWithoutComments = stripComments(contents);
  return Object.entries(terms)
    .map(([term, messageOrDef]) => {
      const {
        message,
        allowlist = null,
        checkInTestFolder = false,
        checkComments = false,
      } =
        typeof messageOrDef === 'string'
          ? {message: messageOrDef}
          : messageOrDef;
      // NOTE: we could do a glob test instead of exact check in the future
      // if needed but that might be too permissive.
      if (
        (Array.isArray(allowlist) && allowlist.indexOf(srcFile) != -1) ||
        (isInTestFolder(srcFile) && !checkInTestFolder)
      ) {
        return [];
      }

      const matches = /** @type {Array<!ForbiddenTermMatchDef>} */ ([]);
      // we can't optimize building the `RegExp` objects early unless we build
      // another mapping of term -> regexp object to be able to get back to the
      // original term to get the possible fix value. This is ok as the
      // presubmit doesn't have to be blazing fast and this is most likely
      // negligible.
      const regex = new RegExp(term, 'gm' + (checkComments ? 'i' : ''));
      let index = 0;
      let line = 1;
      let column = 0;
      const start = {line: -1, column: -1};

      const subject = checkComments ? contents : contentsWithoutComments;
      let result;
      while ((result = regex.exec(subject))) {
        const [match] = result;

        for (index; index < result.index + match.length; index++) {
          if (index === result.index) {
            start.line = line;
            start.column = column;
          }
          if (subject[index] === '\n') {
            line++;
            column = 0;
          } else {
            column++;
          }
        }

        matches.push({
          match,
          term,
          message,
          loc: {start, end: {line, column}},
        });
      }

      return matches;
    })
    .reduce((a, b) => a.concat(b));
}

module.exports = {
  forbiddenTermsGlobal,
  forbiddenTermsSrcInclusive,
  matchForbiddenTerms,
};
