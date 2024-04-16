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
    id: 'amp-sidebar-v2',
    name: 'Updated sidebar component with nested menu and animations',
    spec: 'https://github.com/ampproject/amphtml/issues/25049',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/25022',
  },
  {
    id: 'no-auth-in-prerender',
    name: 'Delay amp-access auth request until doc becomes visible.',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3824',
  },
  {
    id: 'amp-lightbox-a4a-proto',
    name: 'Allows the new lightbox experience to be used in A4A (prototype).',
    spec: 'https://github.com/ampproject/amphtml/issues/7743',
  },
  {
    id: 'analytics-browser-events',
    name: 'Allows tracking of a custom set of browser events',
    spec: 'https://github.com/ampproject/amphtml/pull/35193',
  },
  {
    id: 'ios-fixed-no-transfer',
    name: 'Remove fixed transfer from iOS 12.2 and up',
    spec: 'https://github.com/ampproject/amphtml/issues/22220',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22220',
  },
  {
    id: 'web-worker',
    name: 'Web worker for background processing',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/7156',
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
    id: 'untrusted-xhr-interception',
    name:
      'Enable "xhrInterceptor" capability for untrusted viewers. ' +
      'For development use only',
    spec: 'N/A',
    cleanupIssue: 'N/A',
  },
  {
    id: 'amp-stream-gallery',
    name: 'Enables component',
    spec: 'https://github.com/ampproject/amphtml/issues/20595',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/26709',
  },
  {
    id: 'a4a-no-signing',
    name: 'Remove signing requirement for AMPHTML ads',
    spec: 'https://github.com/ampproject/amphtml/issues/27189',
  },
  {
    id: 'auto-ads-layout-callback',
    name: 'Move ads placement into layoutCallback',
    spec: 'https://github.com/ampproject/amphtml/issues/27068',
  },
  {
    id: 'dfp-render-on-idle-cwv-exp',
    name: 'To measure the CWV impact of ads idle rendering',
    spec: 'https://github.com/ampproject/amphtml/issues/31436',
  },
  {
    id: 'flexible-bitrate',
    name: 'Adaptive bitrate algorithm for videos on documents from the AMPProject CDN',
    spec: 'https://github.com/ampproject/amphtml/projects/111',
  },
  {
    id: 'story-ad-placements',
    name: 'Optimization of story ad placements',
    spec: 'https://github.com/ampproject/amphtml/issues/33147',
  },
  {
    id: 'story-ad-auto-advance',
    name: 'Auto advancing story ads',
    spec: 'https://github.com/ampproject/amphtml/issues/33969',
  },
  {
    id: 'story-ad-page-outlink',
    name: 'Story ad CTA page outlink',
    spec: 'https://github.com/ampproject/amphtml/pull/35867',
  },
  {
    id: 'amp-story-first-page-max-bitrate',
    name: 'Decrease max bitrate for videos on first page',
    spec: 'https://github.com/ampproject/amphtml/pull/35389',
  },
  {
    id: 'story-disable-animations-first-page',
    name: 'Disable animations on the first page that can artificially delay LCP reports',
    spec: 'https://github.com/ampproject/amphtml/pull/35356',
  },
  {
    id: 'story-load-inactive-outside-viewport',
    name: 'Load inactive pages outside the viewport to prevent them from counting towards LCP when invisible',
    spec: 'https://github.com/ampproject/amphtml/pull/35323',
  },
  {
    id: 'story-video-cache-apply-audio',
    name: 'Apply the hasAudio flag from cached videos on stories',
    spec: 'https://github.com/ampproject/amphtml/pull/38285',
  },
  {
    id: 'amp-story-subscriptions',
    name: 'Enable paywall experiences in web stories by turning on amp-story-subscriptions extension',
    spec: 'https://github.com/ampproject/amphtml/pull/38179',
  },
  {
    id: 'attribution-reporting',
    name: 'Enable new privacy preserving attribution reporting APIs',
    spec: 'https://github.com/ampproject/amphtml/pull/35347',
  },
  {
    id: 'interaction-to-next-paint',
    name: 'Enable new INP metrics reporting on amp-analytics',
    spec: 'https://github.com/ampproject/amphtml/issues/38470',
  },
];
