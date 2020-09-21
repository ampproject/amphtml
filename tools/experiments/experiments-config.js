/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This file contains experiment configurations that are
 * used in experiment.js. If you are launching a new feature, you should
 * add an experiment block below including a descriptive id string, a
 * description of the experiment, a link to the issue referencing the bug
 * fixed or feature implemented by your experiment, as well as a cleanup
 * issue to remove your experiment once completed.
 */
/** @const {!Array<!ExperimentDef>} */
export const EXPERIMENTS = [
  {
    id: 'alp',
    name: 'Activates support for measuring incoming clicks.',
    spec: 'https://github.com/ampproject/amphtml/issues/2934',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4005',
  },
  {
    id: 'amp-access-iframe',
    name: 'AMP Access iframe prototype (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/13287',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/13287',
  },
  {
    id: 'amp-access-server',
    name: 'AMP Access server side prototype',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4000',
  },
  {
    id: 'amp-access-jwt',
    name: 'AMP Access JWT prototype',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4000',
  },
  {
    id: 'amp-base-carousel',
    name: 'AMP extension for a basic, flexible, carousel',
    spec: 'https://github.com/ampproject/amphtml/issues/20595',
  },
  {
    id: 'amp-google-vrview-image',
    name: 'AMP VR Viewer for images via Google VRView',
    spec:
      'https://github.com/ampproject/amphtml/blob/master/extensions/' +
      'amp-google-vrview-image/amp-google-vrview-image.md',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3996',
  },
  {
    id: 'amp-sidebar-v2',
    name: 'Updated sidebar component with nested menu and animations',
    spec: 'https://github.com/ampproject/amphtml/issues/25049',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/25022',
  },
  {
    id: 'ampdoc-fie',
    name: 'Install AmpDoc on FIE level',
    spec: 'https://github.com/ampproject/amphtml/issues/22734',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22733',
  },
  {
    id: 'no-auth-in-prerender',
    name: 'Delay amp-access auth request until doc becomes visible.',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3824',
  },
  {
    id: 'amp-viz-vega',
    name: 'AMP Visualization using Vega grammar',
    spec: 'https://github.com/ampproject/amphtml/issues/3991',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4171',
  },
  {
    id: 'cache-service-worker',
    name: 'AMP Cache Service Worker',
    spec: 'https://github.com/ampproject/amphtml/issues/1199',
  },
  {
    id: 'amp-lightbox-a4a-proto',
    name: 'Allows the new lightbox experience to be used in A4A (prototype).',
    spec: 'https://github.com/ampproject/amphtml/issues/7743',
  },
  {
    id: 'amp-playbuzz',
    name: 'AMP extension for playbuzz items (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/6106',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/6351',
  },
  {
    id: 'amp-action-macro',
    name: 'AMP extension for defining action macros',
    spec: 'https://github.com/ampproject/amphtml/issues/19494',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/19495',
  },
  {
    id: 'ios-fixed-no-transfer',
    name: 'Remove fixed transfer from iOS 12.2 and up',
    spec: 'https://github.com/ampproject/amphtml/issues/22220',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22220',
  },
  {
    id: 'chunked-amp',
    name: "Split AMP's loading phase into chunks",
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5535',
  },
  {
    id: 'pump-early-frame',
    name:
      'If applicable, let the browser paint the current frame before ' +
      'executing the callback.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8237',
  },
  {
    id: 'web-worker',
    name: 'Web worker for background processing',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/7156',
  },
  {
    id: 'jank-meter',
    name: 'Display jank meter',
  },
  {
    id: 'input-debounced',
    name: 'A debounced input event for AMP actions',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/9413',
    spec: 'https://github.com/ampproject/amphtml/issues/9277',
  },
  {
    id: 'disable-rtc',
    name: 'Disable AMP RTC',
    spec: 'https://github.com/ampproject/amphtml/issues/8551',
  },
  {
    id: 'inabox-position-api',
    name: 'Position API for foreign iframe',
    spec: 'https://github.com/ampproject/amphtml/issues/10995',
  },
  {
    id: 'amp-story',
    name: 'Visual storytelling in AMP (v0.1)',
    spec: 'https://github.com/ampproject/amphtml/issues/11329',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14357',
  },
  {
    id: 'disable-amp-story-default-media',
    name: 'Removes default media for amp-story',
    spec: 'https://github.com/ampproject/amphtml/issues/14535',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14535',
  },
  {
    id: 'amp-story-responsive-units',
    name: 'Scale pages in amp-story by rewriting responsive units',
    spec: 'https://github.com/ampproject/amphtml/issues/15955',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/15960',
  },
  {
    id: 'amp-next-page',
    name: 'Document level next page recommendations and infinite scroll',
    spec: 'https://github.com/ampproject/amphtml/issues/12945',
  },
  {
    id: 'amp-story-branching',
    name: 'Allow for the go to action, advance to, and fragment parameter URLs',
    spec: 'https://github.com/ampproject/amphtml/issues/20083',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20128',
  },
  {
    id: 'iframe-messaging',
    name: 'Enables "postMessage" action on amp-iframe.',
    spec: 'https://github.com/ampproject/amphtml/issues/9074',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14263',
  },
  {
    id: 'amp-carousel-chrome-scroll-snap',
    name: 'Enables scroll snap on carousel on Chrome browsers',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16508',
  },
  {
    id: 'chrome-animation-worklet',
    name: 'Opts-in users into using AnimationWorklet',
    cleanupIssue: 'X',
  },
  {
    id: 'video-dock',
    name: 'Enables <amp-video dock>',
    spec: 'https://github.com/ampproject/amphtml/issues/14061',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17161',
  },
  {
    id: 'amp-user-location',
    name:
      'Expose the browser geolocation API for latitude and longitude ' +
      'access after user interaction and approval',
    spec: 'https://github.com/ampproject/amphtml/issues/8929',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22177',
  },
  {
    id: 'untrusted-xhr-interception',
    name:
      'Enable "xhrInterceptor" capability for untrusted viewers. ' +
      'For development use only',
    spec: 'N/A',
    cleanupIssue: 'N/A',
  },
  {
    id: 'adsense-ad-size-optimization',
    name:
      'Per publisher server side settings for changing the ad size ' +
      'to responsive.',
    spec: 'https://github.com/ampproject/amphtml/issues/23568',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/24165',
  },
  {
    id: 'fix-inconsistent-responsive-height-selection',
    name: 'Fix inconsistent responsive height selection.',
    spec: 'https://github.com/ampproject/amphtml/issues/24166',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/24167',
  },
  {
    id: 'amp-stream-gallery',
    name: 'Enables component',
    spec: 'https://github.com/ampproject/amphtml/issues/20595',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/26709',
  },
  {
    id: 'visibility-trigger-improvements',
    name: 'AMP Analytics Visibility Trigger Improvements',
    spec: 'https://github.com/ampproject/amphtml/issues/26823',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/26823',
  },
  {
    id: 'analytics-chunks',
    name: 'AMP Analytics Break long tasks to chunks (AMP docs only)',
    spec: 'https://github.com/ampproject/amphtml/issues/28435',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/28435',
  },
  {
    id: 'analytics-chunks-inabox',
    name: 'AMP Analytics Break long tasks to chunks (AMP Ads only)',
    spec: 'https://github.com/ampproject/amphtml/issues/28435',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/28435',
  },
  {
    id: 'a4a-no-signing',
    name: 'Remove signing requirement for AMPHTML ads',
    spec: 'https://github.com/ampproject/amphtml/issues/27189',
  },
  {
    id: 'expand-json-targeting',
    name: 'Allow CLIENT_ID in doubleclick json targeting feature',
    spec: 'https://github.com/ampproject/amphtml/issues/25190',
  },
  {
    id: 'auto-ads-layout-callback',
    name: 'Move ads placement into layoutCallback',
    spec: 'https://github.com/ampproject/amphtml/issues/27068',
  },
  {
    id: 'layout-aspect-ratio-css',
    name: 'Responsive layouts implemented via aspect-ratio CSS',
    spec: 'https://github.com/ampproject/amphtml/issues/30291',
  },
];
