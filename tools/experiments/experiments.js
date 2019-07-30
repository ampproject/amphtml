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
import {getCookie, setCookie} from '../../src/cookies';
import {getMode} from '../../src/mode';
import {isExperimentOn, toggleExperiment} from '../../src/experiments';
import {listenOnce} from '../../src/event-helper';
import {onDocumentReady} from '../../src/document-ready';
import {parseUrlDeprecated} from '../../src/url';
//TODO(@cramforce): For type. Replace with forward declaration.
import {reportError} from '../../src/error';

initLogConstructor();
setReportError(reportError);

const COOKIE_MAX_AGE_DAYS = 180; // 6 month
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_DAYS * MS_PER_DAY;
/**
 * @typedef {{
 *   id: string,
 *   name: string,
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
const CHANNELS = [
  // Canary (Dev Channel)
  {
    id: CANARY_EXPERIMENT_ID,
    name: 'AMP Dev Channel (more info)',
    spec:
      'https://github.com/ampproject/amphtml/blob/master/' +
      'contributing/release-schedule.md#amp-dev-channel',
  },
  // Release Candidate (RC Channel)
  {
    id: RC_EXPERIMENT_ID,
    name: 'AMP RC Channel (more info)',
    spec:
      'https://github.com/ampproject/amphtml/blob/master/' +
      'contributing/release-schedule.md#amp-release-candidate-rc-channel',
  },
];

/** @const {!Array<!ExperimentDef>} */
const EXPERIMENTS = [
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
    id: 'amp-lightbox-gallery-base-carousel',
    name: 'Uses amp-base-carousel in amp-lightbox-gallery',
    spec: 'https://github.com/ampproject/amphtml/issues/21568',
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
    id: 'amp-share-tracking',
    name: 'AMP Share Tracking',
    spec: 'https://github.com/ampproject/amphtml/issues/3135',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5167',
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
    id: 'ios-embed-sd',
    name:
      'A new iOS embedded viewport model that wraps the body into' +
      ' shadow root',
    spec:
      'https://medium.com/@dvoytenko/amp-ios-scrolling-redo-2-the' +
      '-shadow-wrapper-approach-experimental-3362ed3c2fa2',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16640',
  },
  {
    id: 'ios-scrollable-iframe',
    name: 'iOS 13 enables iframe scrolling per spec',
    spec: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/23379',
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
    id: 'version-locking',
    name:
      'Force all extensions to have the same release ' +
      'as the main JS binary',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8236',
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
    id: 'as-use-attr-for-format',
    name: 'Use slot width/height attribute for AdSense size format',
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
    id: 'disable-amp-story-desktop',
    name: 'Disables responsive desktop experience for the amp-story component',
    spec: 'https://github.com/ampproject/amphtml/issues/11714',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/11715',
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
    id: 'layers',
    name: 'Enables the new Layers position/measurement system',
    spec: 'https://github.com/ampproject/amphtml/issues/3434',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/15158',
  },
  {
    id: 'blurry-placeholder',
    name: 'Enables a blurred image placeholder as an amp-img loads',
    spec: 'https://github.com/ampproject/amphtml/issues/15146',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17107',
  },
  {
    id: 'amp-list-diffing',
    name: 'Enables DOM diffing of amp-list renders via set-dom',
    spec: 'https://github.com/ampproject/amphtml/pull/17000',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17637',
  },
  {
    id: 'custom-elements-v1',
    name: 'Enable a new custom elements v1 polyfill',
    spec: 'https://github.com/ampproject/amphtml/pull/17205',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17243',
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
    id: 'amp-consent-v2',
    name: 'Enables CMP support to amp-consent component',
    spec: 'https://github.com/ampproject/amphtml/issues/17742',
  },
  {
    id: 'video-dock',
    name: 'Enables <amp-video dock>',
    spec: 'https://github.com/ampproject/amphtml/issues/14061',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/17161',
  },
  {
    id: 'amp-list-load-more',
    name: 'Enables load-more related functionality in amp-list',
    spec: 'https://github.com/ampproject/amphtml/issues/13575',
  },
  {
    id: 'amp-script',
    name: 'Enables <amp-script>.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18845',
  },
  {
    id: 'hidden-mutation-observer',
    name: "Enables FixedLayer's hidden-attribute mutation observer",
    spec: 'https://github.com/ampproject/amphtml/issues/17475',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18897',
  },
  {
    id: 'inabox-viewport-friendly',
    name:
      'Inabox viewport measures the host window directly if ' +
      'within friendly iframe',
    spec: 'https://github.com/ampproject/amphtml/issues/19869',
    cleanupIssue: 'TODO',
  },
  {
    id: 'fie-css-cleanup',
    name:
      'Experiment to prevent regression after a major CSS clean up' +
      ' for AMPHTML Ads in FIE rendering mode',
    spec: 'https://github.com/ampproject/amphtml/issues/22418',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22418',
  },
  {
    id: 'inabox-css-cleanup',
    name:
      'Experiment to prevent regression after a major CSS clean up' +
      ' for AMPHTML Ads in inabox rendering mode',
    spec: 'https://github.com/ampproject/amphtml/issues/22418',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/22418',
  },
  {
    id: 'inabox-no-chunking',
    name: 'Experiment to disable startup chunking in inabox runtime',
    spec: 'https://github.com/ampproject/amphtml/issues/23573',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/23573',
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
    id: 'new-loaders',
    name: 'New default loaders',
    spec: 'https://github.com/ampproject/amphtml/issues/20237',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/21485',
  },
  {
    id: 'macro-after-long-task',
    name:
      'If applicable, convert remaining micro tasks to the next macro ' +
      ' tasks if a previous micro task execution took too long',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/23464',
  },
];

if (getMode().localDev) {
  EXPERIMENTS.forEach(experiment => {
    devAssert(
      experiment.cleanupIssue,
      `experiment ${experiment.name} must have a \`cleanupIssue\` field.`
    );
  });
}

/**
 * Builds the expriments tbale.
 */
function build() {
  const {host} = window.location;

  const subdomain = document.getElementById('subdomain');
  subdomain.textContent = host;

  // #redirect contains UI that generates a subdomain experiments page link
  // given a "google.com/amp/..." viewer URL.
  const redirect = document.getElementById('redirect');
  const input = redirect.querySelector('input');
  const button = redirect.querySelector('button');
  const anchor = redirect.querySelector('a');
  button.addEventListener('click', function() {
    let urlString = input.value.trim();
    // Avoid protocol-less urlString from being parsed as a relative URL.
    const hasProtocol = /^https?:\/\//.test(urlString);
    if (!hasProtocol) {
      urlString = 'https://' + urlString;
    }
    const url = parseUrlDeprecated(urlString);
    if (url) {
      const subdomain = url.hostname.replace(/\./g, '-');
      const href = `https://${subdomain}.cdn.ampproject.org/experiments.html`;
      anchor.href = href;
      anchor.textContent = href;
    }
  });

  const channelsTable = document.getElementById('channels-table');
  CHANNELS.forEach(function(experiment) {
    channelsTable.appendChild(buildExperimentRow(experiment));
  });

  const experimentsTable = document.getElementById('experiments-table');
  EXPERIMENTS.forEach(function(experiment) {
    experimentsTable.appendChild(buildExperimentRow(experiment));
  });

  if (host === 'cdn.ampproject.org') {
    const experimentsDesc = document.getElementById('experiments-desc');
    experimentsDesc.setAttribute('hidden', '');
    experimentsTable.setAttribute('hidden', '');
  } else {
    redirect.setAttribute('hidden', '');
  }
}

/**
 * Builds one row in the channel or experiments table.
 * @param {!ExperimentDef} experiment
 * @return {*} TODO(#23582): Specify return type
 */
function buildExperimentRow(experiment) {
  const tr = document.createElement('tr');
  tr.id = 'exp-tr-' + experiment.id;

  const tdId = document.createElement('td');
  tdId.appendChild(buildLinkMaybe(experiment.id, experiment.spec));
  tr.appendChild(tdId);

  const tdName = document.createElement('td');
  tdName.appendChild(buildLinkMaybe(experiment.name, experiment.spec));
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

  button.addEventListener(
    'click',
    toggleExperiment_.bind(null, experiment.id, experiment.name, undefined)
  );

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
  CHANNELS.concat(EXPERIMENTS).forEach(function(experiment) {
    updateExperimentRow(experiment);
  });
}

/**
 * Updates the state of a single experiment.
 * @param {!ExperimentDef} experiment
 */
function updateExperimentRow(experiment) {
  const tr = document.getElementById('exp-tr-' + experiment.id);
  if (!tr) {
    return;
  }
  let state = isExperimentOn_(experiment.id) ? 1 : 0;
  if (self.AMP_CONFIG[experiment.id]) {
    state = 'default';
  }
  tr.setAttribute('data-on', state);
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
  return isExperimentOn(window, /*OK*/ id);
}

/**
 * Opts in to / out of the "canary" or "rc" runtime types by setting the
 * AMP_CANARY cookie.
 * @param {string} cookieState One of AMP_CANARY_COOKIE.{DISABLED|CANARY|RC}
 */
function setAmpCanaryCookie_(cookieState) {
  const validUntil =
    cookieState != AMP_CANARY_COOKIE.DISABLED
      ? Date.now() + COOKIE_MAX_AGE_MS
      : 0;
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
 */
function toggleExperiment_(id, name, opt_on) {
  const currentlyOn = isExperimentOn_(id);
  const on = opt_on === undefined ? !currentlyOn : opt_on;
  // Protect against click jacking.
  const confirmMessage = on
    ? 'Do you really want to activate the AMP experiment'
    : 'Do you really want to deactivate the AMP experiment';

  showConfirmation_(`${confirmMessage}: "${name}"`, () => {
    if (id == CANARY_EXPERIMENT_ID) {
      setAmpCanaryCookie_(
        on ? AMP_CANARY_COOKIE.CANARY : AMP_CANARY_COOKIE.DISABLED
      );
    } else if (id == RC_EXPERIMENT_ID) {
      setAmpCanaryCookie_(
        on ? AMP_CANARY_COOKIE.RC : AMP_CANARY_COOKIE.DISABLED
      );
    } else {
      toggleExperiment(window, id, on);
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
  const confirmButton = devAssert(document.getElementById('popup-button-ok'));
  const cancelButton = devAssert(
    document.getElementById('popup-button-cancel')
  );
  const unlistenSet = [];
  const closePopup = affirmative => {
    container.classList.remove('show');
    unlistenSet.forEach(unlisten => unlisten());
    if (affirmative) {
      callback();
    }
  };

  messageElement.textContent = message;
  unlistenSet.push(listenOnce(confirmButton, 'click', () => closePopup(true)));
  unlistenSet.push(listenOnce(cancelButton, 'click', () => closePopup(false)));
  container.classList.add('show');
}

/**
 * Loads the AMP_CONFIG objects from whatever the v0.js is that the
 * user has (depends on whether they opted into canary or RC), so that
 * experiment state can reflect the default activated experiments.
 * @return {*} TODO(#23582): Specify return type
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
  return promise
    .then(text => {
      const match = text.match(/self\.AMP_CONFIG=([^;]+)/);
      if (!match) {
        throw new Error("Can't find AMP_CONFIG in: " + text);
      }
      // Setting global var to make standard experiment code just work.
      return (self.AMP_CONFIG = JSON.parse(match[1]));
    })
    .catch(error => {
      console./*OK*/ error('Error fetching AMP_CONFIG', error);
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
