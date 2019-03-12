/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../../src/polyfills';
import '../../src/service/timer-impl';
import {Deferred} from '../../src/utils/promise';
import {devAssert, initLogConstructor, setReportError} from '../../src/log';
import {
  getCookie,
  getCookieExperimentIdValue,
  setCookie,
} from '../../src/cookies';
import {getMode} from '../../src/mode';
import {
  isExperimentOn,
  toggleExperiment,
} from '../../src/experiments';
import {listenOnce} from '../../src/event-helper';
import {onDocumentReady} from '../../src/document-ready';
//TODO(@cramforce): For type. Replace with forward declaration.
import {reportError} from '../../src/error';

initLogConstructor();
setReportError(reportError);

const COOKIE_MAX_AGE_DAYS = 180; // 6 month
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_DAYS * MS_PER_DAY;
/** @enum {number|string} */
const ExperimentState = {
  DEFAULT: 'default',
  ON: 1,
  OFF: 0,
};
/**
 * @typedef {{
 *   data: {id: string, name: =string, value: =string},
 *   desc: string,
 *   spec: string
 * }}
 */
let ExperimentDef;

/**
 * These experiments are special because they use a different mechanism that is
 * interpreted by the server to deliver a different version of the AMP
 * JS libraries.
 */
const CANARY_EXPERIMENT_ID = 'dev-channel';
const RC_EXPERIMENT_ID = 'rc-channel';

/**
 * The different states of the AMP_CANARY cookie.
 */
const AMP_CANARY_COOKIE = {
  DISABLED: '0',
  CANARY: '1',
  RC: '2',
};

/** @const {!Array<!ExperimentDef>} */
const EXPERIMENTS = [
  // Canary (Dev Channel)
  {
    data: {id: CANARY_EXPERIMENT_ID},
    desc: 'AMP Dev Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/master/' +
        'contributing/release-schedule.md#amp-dev-channel',
  },
  // Release Candidate (RC Channel)
  {
    data: {id: RC_EXPERIMENT_ID},
    desc: 'AMP RC Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/master/' +
        'contributing/release-schedule.md#amp-release-candidate-rc-channel',
  },
  {
    data: {id: 'alp'},
    desc: 'Activates support for measuring incoming clicks.',
    spec: 'https://github.com/ampproject/amphtml/issues/2934',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4005',
  },
  {
    data: {id: 'amp-access-iframe'},
    desc: 'AMP Access iframe prototype (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/13287',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/13287',
  },
  {
    data: {id: 'amp-access-server'},
    desc: 'AMP Access server side prototype',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4000',
  },
  {
    data: {id: 'amp-access-jwt'},
    desc: 'AMP Access JWT prototype',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4000',
  },
  {
    data: {id: 'amp-auto-ads'},
    desc: 'AMP Auto Ads',
    spec: 'https://github.com/ampproject/amphtml/issues/6196',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6217',
  },
  {
    data: {id: 'amp-auto-ads-adsense-responsive'},
    desc: 'AMP Auto Ads AdSense Responsive',
    spec: '',
    cleanupIssue: '',
  },
  {
    data: {id: 'amp-base-carousel'},
    desc: 'AMP extension for a basic, flexible, carousel',
    spec: 'https://github.com/ampproject/amphtml/issues/20595',
  },
  {
    data: {id: 'amp-google-vrview-image'},
    desc: 'AMP VR Viewer for images via Google VRView',
    spec: 'https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-google-vrview-image/amp-google-vrview-image.md',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3996',
  },
  {
    data: {id: 'no-auth-in-prerender'},
    desc: 'Delay amp-access auth request until doc becomes visible.',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3824',
  },
  {
    data: {id: 'amp-share-tracking'},
    desc: 'AMP Share Tracking',
    spec: 'https://github.com/ampproject/amphtml/issues/3135',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5167',
  },
  {
    data: {id: 'amp-viz-vega'},
    desc: 'AMP Visualization using Vega grammar',
    spec: 'https://github.com/ampproject/amphtml/issues/3991',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4171',
  },
  {
    data: {id: 'amp-apester-media'},
    desc: 'AMP extension for Apester media (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/3233',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/4291',
  },
  {
    data: {id: 'cache-service-worker'},
    desc: 'AMP Cache Service Worker',
    spec: 'https://github.com/ampproject/amphtml/issues/1199',
  },
  {
    data: {id: 'amp-lightbox-a4a-proto'},
    desc: 'Allows the new lightbox experience to be used in A4A (prototype).',
    spec: 'https://github.com/ampproject/amphtml/issues/7743',
  },
  {
    data: {id: 'amp-playbuzz'},
    desc: 'AMP extension for playbuzz items (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/6106',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/6351',
  },
  {
    data: {id: 'amp-action-macro'},
    desc: 'AMP extension for defining action macros',
    spec: 'https://github.com/ampproject/amphtml/issues/19494',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/19495',
  },
  {
    data: {id: 'ios-embed-sd'},
    desc: 'A new iOS embedded viewport model that wraps the body into' +
      ' shadow root',
    spec: 'https://medium.com/@dvoytenko/amp-ios-scrolling-redo-2-the' +
      '-shadow-wrapper-approach-experimental-3362ed3c2fa2',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16640',
  },
  {
    data: {id: 'ios-embed-sd-notransfer'},
    desc: 'Disables transfer mode for the new iOS embedded viewport model',
    spec: 'https://medium.com/@dvoytenko/amp-ios-scrolling-redo-2-the' +
        '-shadow-wrapper-approach-experimental-3362ed3c2fa2',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16640',
  },
  {
    data: {id: 'chunked-amp'},
    desc: 'Split AMP\'s loading phase into chunks',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5535',
  },
  {
    data: {id: 'font-display-swap'},
    desc: 'Use font-display: swap as the default for fonts.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/11165',
  },
  {
    data: {id: 'pump-early-frame'},
    desc: 'If applicable, let the browser paint the current frame before ' +
        'executing the callback.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8237',
  },
  {
    data: {id: 'version-locking'},
    desc: 'Force all extensions to have the same release ' +
        'as the main JS binary',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8236',
  },
  {
    data: {id: 'web-worker'},
    desc: 'Web worker for background processing',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/7156',
  },
  {
    data: {id: 'jank-meter'},
    desc: 'Display jank meter',
  },
  {
    data: {id: 'as-use-attr-for-format'},
    desc: 'Use slot width/height attribute for AdSense size format',
  },
  {
    data: {id: 'input-debounced'},
    desc: 'A debounced input event for AMP actions',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/9413',
    spec: 'https://github.com/ampproject/amphtml/issues/9277',
  },
  {
    data: {id: 'disable-rtc'},
    desc: 'Disable AMP RTC',
    spec: 'https://github.com/ampproject/amphtml/issues/8551',
  },
  {
    data: {id: 'inabox-position-api'},
    desc: 'Position API for foreign iframe',
    spec: 'https://github.com/ampproject/amphtml/issues/10995',
  },
  {
    data: {id: 'amp-story'},
    desc: 'Visual storytelling in AMP (v0.1)',
    spec: 'https://github.com/ampproject/amphtml/issues/11329',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14357',
  },
  {
    data: {id: 'disable-amp-story-desktop'},
    desc: 'Disables responsive desktop experience for the amp-story component',
    spec: 'https://github.com/ampproject/amphtml/issues/11714',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/11715',
  },
  {
    data: {id: 'disable-amp-story-default-media'},
    desc: 'Removes default media for amp-story',
    spec: 'https://github.com/ampproject/amphtml/issues/14535',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14535',
  },
  {
    data: {id: 'amp-story-responsive-units'},
    desc: 'Scale pages in amp-story by rewriting responsive units',
    spec: 'https://github.com/ampproject/amphtml/issues/15955',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/15960',
  },
  {
    data: {id: 'amp-story-desktop-background'},
    desc: 'Removes blurred background images from the amp-story component\'s ' +
        'three-panel desktop UI.',
    spec: 'https://github.com/ampproject/amphtml/issues/21287',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/21288',
  },
  {
    data: {id: 'amp-next-page'},
    desc: 'Document level next page recommendations and infinite scroll',
    spec: 'https://github.com/ampproject/amphtml/issues/12945',
  },
  {
    data: {id: 'amp-live-list-sorting'},
    desc: 'Allows "newest last" insertion algorithm to be used',
    spec: 'https://github.com/ampproject/amphtml/issues/5396',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/13552',
  },
  {
    data: {id: 'amp-consent'},
    desc: 'Enables the amp-consent extension',
    spec: 'https://github.com/ampproject/amphtml/issues/13716',
  },
  {
    data: {id: 'amp-story-branching'},
    desc: 'Allow for the go to action, advance to, and fragment parameter URLs',
    spec: 'https://github.com/ampproject/amphtml/issues/20083',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20128',
  },
  {
    data: {id: 'no-sync-xhr-in-ads'},
    desc: 'Disables syncronous XHR requests in 3p iframes.',
    spec: 'TODO',
    cleanupIssue: 'TODO',
  },
  {
    data: {id: 'sandbox-ads'},
    desc: 'Applies a sandbox to ad iframes.',
    spec: 'https://github.com/ampproject/amphtml/issues/14240',
    cleanupIssue: 'TODO',
  },
  {
    data: {id: 'iframe-messaging'},
    desc: 'Enables "postMessage" action on amp-iframe.',
    spec: 'https://github.com/ampproject/amphtml/issues/9074',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/14263',
  },
  {
    data: {id: 'layers'},
    desc: 'Enables the new Layers position/measurement system',
    spec: 'https://github.com/ampproject/amphtml/issues/3434',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/15158',
  },
  {
    data: {id: 'blurry-placeholder'},
    desc: 'Enables a blurred image placeholder as an amp-img loads',
    spec: 'https://github.com/ampproject/amphtml/issues/15146',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17107',
  },
  {
    data: {id: 'amp-list-diffing'},
    desc: 'Enables DOM diffing of amp-list renders via set-dom',
    spec: 'https://github.com/ampproject/amphtml/pull/17000',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17637',
  },
  {
    data: {id: 'no-initial-intersection'},
    desc: 'Do not invoke context.observeIntersection callback with ' +
        'initialintersection',
    spec: 'https://github.com/ampproject/amphtml/issues/8562',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8562',
  },
  {
    data: {id: 'custom-elements-v1'},
    desc: 'Enable a new custom elements v1 polyfill',
    spec: 'https://github.com/ampproject/amphtml/pull/17205',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17243',
  },
  {
    data: {id: 'amp-carousel-chrome-scroll-snap'},
    desc: 'Enables scroll snap on carousel on Chrome browsers',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16508',
  },
  {
    data: {id: 'chrome-animation-worklet'},
    desc: 'Opts-in users into using AnimationWorklet',
    cleanupIssue: 'X',
  },
  {
    data: {id: 'amp-consent-v2'},
    desc: 'Enables CMP support to amp-consent component',
    spec: 'https://github.com/ampproject/amphtml/issues/17742',
  },
  {
    data: {id: 'video-dock'},
    desc: 'Enables <amp-video dock>',
    spec: 'https://github.com/ampproject/amphtml/issues/14061',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17161',
  },
  {
    data: {id: 'linker-form'},
    desc: 'Enables form support in linker',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18068',
  },
  {
    data: {id: 'fie-metadata-extension'},
    desc: 'Use version supporting extension field in amp-ad-metadata.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18737',
  },
  {
    data: {id: 'amp-list-load-more'},
    desc: 'Enables load-more related functionality in amp-list',
    spec: 'https://github.com/ampproject/amphtml/issues/13575',
  },
  {
    data: {id: 'amp-script'},
    desc: 'Enables <amp-script>.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18845',
  },
  {
    data: {id: 'amp-list-resizable-children'},
    desc: 'Experiment for allowing amp-list to resize when its children resize',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18875',
  },
  {
    data: {id: 'hidden-mutation-observer'},
    desc: "Enables FixedLayer's hidden-attribute mutation observer",
    spec: 'https://github.com/ampproject/amphtml/issues/17475',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18897',
  },
  {
    data: {id: 'scroll-height-bounce'},
    desc: 'Bounces the scrolling when scroll height changes' +
        ' (fix for #18861 and #8798)',
    spec: 'https://github.com/ampproject/amphtml/issues/18861',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/19004',
  },
  {
    data: {id: 'scroll-height-minheight'},
    desc: 'Forces min-height on body (fix for #18861 and #8798)',
    spec: 'https://github.com/ampproject/amphtml/issues/18861',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/19004',
  },
  {
    data: {id: 'amp-auto-lightbox'},
    desc: 'Automatically detects images to place in a lightbox.',
    spec: 'https://github.com/ampproject/amphtml/issues/20395',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20394',
  },
  {
    data: {id: 'amp-auto-lightbox-carousel'},
    desc: 'Automatically detects carousels to group in a lightbox.',
    spec: 'https://github.com/ampproject/amphtml/issues/20395',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20394',
  },
  {
    data: {id: 'fixed-elements-in-lightbox'},
    desc: 'Transfer fixed elements in lightboxes for smooth iOS scrolling',
    spec: 'https://github.com/ampproject/amphtml/issues/20964',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20965',
  },
  {
    data: {id: 'amp-img-auto-sizes'},
    desc: 'Automatically generates sizes for amp-img if not given',
    spec: 'https://github.com/ampproject/amphtml/issues/19513',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/20517',
  },
  {
    data: {id: 'amp-autocomplete'},
    desc: 'AMP Autocomplete provides a set of suggestions to' +
        ' complete a user query in an input field.',
    spec: 'https://github.com/ampproject/amphtml/issues/9785',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/21021',
  },
  {
    data: {id: 'inabox-viewport-friendly'},
    desc: 'Inabox viewport measures the host window directly if ' +
        'within friendly iframe',
    spec: 'https://github.com/ampproject/amphtml/issues/19869',
    cleanupIssue: 'TODO',
  },
  {
    data: {name: 'log-disabled', id: 'log', value: '0'},
    desc: 'Log level OFF',
    cleanupIssue: 'N/A',
  },
  {
    data: {name: 'log-error', id: 'log', value: '1'},
    desc: 'Log level ERROR.',
    cleanupIssue: 'N/A',
  },
  {
    data: {name: 'log-warn', id: 'log', value: '2'},
    desc: 'Log level WARN.',
    cleanupIssue: 'N/A',
  },
  {
    data: {name: 'log-info', id: 'log', value: '3'},
    desc: 'Log level INFO.',
    cleanupIssue: 'N/A',
  },
  {
    data: {name: 'log-fine', id: 'log', value: '4'},
    desc: 'Log level FINE.',
    cleanupIssue: 'N/A',
  },
];

if (getMode().localDev) {
  EXPERIMENTS.forEach(experiment => {
    devAssert(experiment.cleanupIssue, `experiment ${experiment.desc} must` +
        ' have a `cleanupIssue` field.');
  });
}


/**
 * Builds the experiments table.
 */
function build() {
  const table = document.getElementById('experiments-table');
  const experiments = document.createDocumentFragment();
  EXPERIMENTS.forEach(function(experiment) {
    experiments.appendChild(buildExperimentRow(experiment));
  });
  table.appendChild(experiments);
}


/**
 * Builds one row of the experiments table.
 * @param {!ExperimentDef} experiment
 */
function buildExperimentRow(experiment) {

  const tr = document.createElement('tr');
  tr.id = 'exp-tr-' + (experiment.data.name || experiment.data.id);

  const tdId = document.createElement('td');
  tdId.appendChild(buildLinkMaybe(experiment.data.id, experiment.spec));
  tr.appendChild(tdId);

  const tdName = document.createElement('td');
  tdName.appendChild(buildLinkMaybe(experiment.desc, experiment.spec));
  tr.appendChild(tdName);

  const tdOn = document.createElement('td');
  tdOn.classList.add('button-cell');
  tr.appendChild(tdOn);

  const button = document.createElement('button');
  tdOn.appendChild(button);

  const buttonOn = document.createElement('div');
  buttonOn.classList.add('on');
  buttonOn.textContent = 'On';
  button.appendChild(buttonOn);

  const buttonDefault = document.createElement('div');
  buttonDefault.classList.add('default');
  buttonDefault.textContent = 'Default on';
  button.appendChild(buttonDefault);

  const buttonOff = document.createElement('div');
  buttonOff.classList.add('off');
  buttonOff.textContent = 'Off';
  button.appendChild(buttonOff);

  button.addEventListener('click', toggleExperiment_.bind(null,
      experiment.data.id, experiment.desc, undefined, experiment.data.value));

  return tr;
}


/**
 * If link is available, builds the anchor. Otherwise, it'd return a basic span.
 * @param {string} text
 * @param {?string} link
 * @return {!Element}
 */
function buildLinkMaybe(text, link) {
  let element;
  if (link) {
    element = document.createElement('a');
    element.setAttribute('href', link);
    element.setAttribute('target', '_blank');
  } else {
    element = document.createElement('span');
  }
  element.textContent = text;
  return element;
}


/**
 * Updates states of all experiments in the table.
 */
function update() {
  EXPERIMENTS.forEach(function(experiment) {
    updateExperimentRow(experiment);
  });
}


/**
 * Updates the state of a single experiment.
 * @param {!ExperimentDef} experiment
 */
function updateExperimentRow(experiment) {
  const tr = document.getElementById(
      'exp-tr-' + (experiment.data.name || experiment.data.id));
  if (!tr) {
    return;
  }
  const isOn = isExperimentOn_(experiment.data.id);
  let state = isOn ? ExperimentState.ON : ExperimentState.OFF;
  if (self.AMP_CONFIG[experiment.data.id]) {
    state = ExperimentState.DEFAULT;
  }
  // Experiments that share the same experiment ID and whose value is
  // not what's set in the AMP_EXP cookie must be set to an OFF state.
  if (experiment.data.value && isOn
      && !onBasedOnExperimentIdValue(experiment)) {
    state = ExperimentState.OFF;
  }
  tr.setAttribute('data-on', state);
}


/**
 * Whether an experiment with an associated value is set in the
 * AMP_EXP cookie.
 * @param {!ExperimentDef} experiment
 * @return {boolean}
 */
function onBasedOnExperimentIdValue(experiment) {
  if (experiment.data.value) {
    return experiment.data.value
        === getCookieExperimentIdValue(window, experiment.data.id);
  }
  return false;
}


/**
 * Returns whether the experiment is on or off.
 * @param {string} id
 * @return {boolean}
 */
function isExperimentOn_(id) {
  if (id == CANARY_EXPERIMENT_ID) {
    return getCookie(window, 'AMP_CANARY') == AMP_CANARY_COOKIE.CANARY;
  } else if (id == RC_EXPERIMENT_ID) {
    return getCookie(window, 'AMP_CANARY') == AMP_CANARY_COOKIE.RC;
  }
  return isExperimentOn(window, /*OK*/id);
}

/**
 * Opts in to / out of the "canary" or "rc" runtime types by setting the
 * AMP_CANARY cookie.
 * @param {string} cookieState One of AMP_CANARY_COOKIE.{DISABLED|CANARY|RC}
 */
function setAmpCanaryCookie_(cookieState) {
  const validUntil = (cookieState != AMP_CANARY_COOKIE.DISABLED) ?
    (Date.now() + COOKIE_MAX_AGE_MS) : 0;
  const cookieOptions = {
    // Set explicit domain, so the cookie gets sent to sub domains.
    domain: location.hostname,
    allowOnProxyOrigin: true,
  };
  setCookie(window, 'AMP_CANARY', cookieState, validUntil, cookieOptions);
  // Reflect default experiment state.
  self.location.reload();
}

/**
 * Toggles the experiment.
 * @param {string} id
 * @param {string} name
 * @param {boolean=} opt_on
 * @param {string=} opt_value
 */
function toggleExperiment_(id, name, opt_on, opt_value) {
  const currentlyOn = isExperimentOn_(id);
  const experimentValue = getCookieExperimentIdValue(window, id);
  let on = opt_on === undefined ? !currentlyOn : opt_on;
  // The experiment of the same value is being toggled to off.
  if (currentlyOn && opt_value && (opt_value === experimentValue)) {
    on = false;
  }
  // Protect against click jacking.
  const confirmMessage = on ?
    'Do you really want to activate the AMP experiment' :
    'Do you really want to deactivate the AMP experiment';

  showConfirmation_(`${confirmMessage}: "${name}"`, () => {
    if (id == CANARY_EXPERIMENT_ID) {
      setAmpCanaryCookie_(
          on ? AMP_CANARY_COOKIE.CANARY : AMP_CANARY_COOKIE.DISABLED);
    } else if (id == RC_EXPERIMENT_ID) {
      setAmpCanaryCookie_(
          on ? AMP_CANARY_COOKIE.RC : AMP_CANARY_COOKIE.DISABLED);
    } else {
      toggleExperiment(window, id, on, undefined, opt_value);
    }
    update();
  });
}


/**
 * Shows confirmation and calls callback if it's approved.
 * @param {string} message
 * @param {function()} callback
 */
function showConfirmation_(message, callback) {
  const container = devAssert(document.getElementById('popup-container'));
  const messageElement = devAssert(document.getElementById('popup-message'));
  const confirmButton = devAssert(
      document.getElementById('popup-button-ok'));
  const cancelButton = devAssert(
      document.getElementById('popup-button-cancel'));
  const unlistenSet = [];
  const closePopup = affirmative => {
    container.classList.remove('show');
    unlistenSet.forEach(unlisten => unlisten());
    if (affirmative) {
      callback();
    }
  };

  messageElement.textContent = message;
  unlistenSet.push(listenOnce(confirmButton, 'click',
      () => closePopup(true)));
  unlistenSet.push(listenOnce(cancelButton, 'click',
      () => closePopup(false)));
  container.classList.add('show');
}

/**
 * Loads the AMP_CONFIG objects from whatever the v0.js is that the
 * user has (depends on whether they opted into canary or RC), so that
 * experiment state can reflect the default activated experiments.
 */
function getAmpConfig() {
  const deferred = new Deferred();
  const {promise, resolve, reject} = deferred;
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    resolve(xhr.responseText);
  });
  xhr.addEventListener('error', () => {
    reject(new Error(xhr.statusText));
  });
  // Cache bust, so we immediately reflect AMP_CANARY cookie changes.
  xhr.open('GET', '/v0.js?' + Math.random(), true);
  xhr.send(null);
  return promise.then(text => {
    const match = text.match(/self\.AMP_CONFIG=([^;]+)/);
    if (!match) {
      throw new Error('Can\'t find AMP_CONFIG in: ' + text);
    }
    // Setting global var to make standard experiment code just work.
    return self.AMP_CONFIG = JSON.parse(match[1]);
  }).catch(error => {
    console./*OK*/error('Error fetching AMP_CONFIG', error);
    return {};
  });
}


// Start up.
getAmpConfig().then(() => {
  onDocumentReady(document, () => {
    build();
    update();
  });
});
