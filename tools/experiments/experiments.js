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
import {dev, initLogConstructor, setReportError} from '../../src/log';
import {getCookie, setCookie} from '../../src/cookies';
import {getMode} from '../../src/mode';
import {isExperimentOn, toggleExperiment} from '../../src/experiments';
import {listenOnce} from '../../src/event-helper';
import {onDocumentReady} from '../../src/document-ready';
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
 * This experiment is special because it uses a different mechanism that is
 * interpreted by the server to deliver a different version of the AMP
 * JS libraries.
 */
const CANARY_EXPERIMENT_ID = 'dev-channel';


/** @const {!Array<!ExperimentDef>} */
const EXPERIMENTS = [
  // Canary (Dev Channel)
  {
    id: CANARY_EXPERIMENT_ID,
    name: 'AMP Dev Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/master/' +
        'contributing/release-schedule.md#amp-dev-channel',
  },
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
    id: 'amp-auto-ads',
    name: 'AMP Auto Ads',
    spec: 'https://github.com/ampproject/amphtml/issues/6196',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6217',
  },
  {
    id: 'amp-auto-ads-adsense-holdout',
    name: 'AMP Auto Ads AdSense Holdout',
    spec: 'https://github.com/ampproject/amphtml/issues/6196',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/9247',
  },
  {
    id: 'amp-auto-ads-adsense-responsive',
    name: 'AMP Auto Ads AdSense Responsive',
    spec: '',
    cleanupIssue: '',
  },
  {
    id: 'amp-google-vrview-image',
    name: 'AMP VR Viewer for images via Google VRView',
    spec: 'https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-google-vrview-image/amp-google-vrview-image.md',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/3996',
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
    id: 'amp-apester-media',
    name: 'AMP extension for Apester media (launched)',
    spec: 'https://github.com/ampproject/amphtml/issues/3233',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/4291',
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
    id: 'ios-embed-sd',
    name: 'A new iOS embedded viewport model that wraps the body into' +
      ' shadow root',
    spec: 'https://medium.com/@dvoytenko/amp-ios-scrolling-redo-2-the' +
      '-shadow-wrapper-approach-experimental-3362ed3c2fa2',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16640',
  },
  {
    id: 'ios-embed-sd-notransfer',
    name: 'Disables transfer mode for the new iOS embedded viewport model',
    spec: 'https://medium.com/@dvoytenko/amp-ios-scrolling-redo-2-the' +
        '-shadow-wrapper-approach-experimental-3362ed3c2fa2',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16640',
  },
  {
    id: 'chunked-amp',
    name: 'Split AMP\'s loading phase into chunks',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5535',
  },
  {
    id: 'font-display-swap',
    name: 'Use font-display: swap as the default for fonts.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/11165',
  },
  {
    id: 'pump-early-frame',
    name: 'If applicable, let the browser paint the current frame before ' +
        'executing the callback.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8237',
  },
  {
    id: 'version-locking',
    name: 'Force all extensions to have the same release ' +
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
    id: 'user-error-reporting',
    name: 'Report error to publishers',
    spec: 'https://github.com/ampproject/amphtml/issues/6415',
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
    id: 'amp-story-scaling',
    name: 'Scale pages dynamically in amp-story by default',
    spec: 'https://github.com/ampproject/amphtml/issues/12902',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/12902',
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
    id: 'amp-story-hold-to-pause',
    name: 'Hold to pause an amp-story',
    spec: 'https://github.com/ampproject/amphtml/issues/18714',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18715',
  },
  {
    id: 'amp-next-page',
    name: 'Document level next page recommendations and infinite scroll',
    spec: 'https://github.com/ampproject/amphtml/issues/12945',
  },
  {
    id: 'amp-live-list-sorting',
    name: 'Allows "newest last" insertion algorithm to be used',
    spec: 'https://github.com/ampproject/amphtml/issues/5396',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/13552',
  },
  {
    id: 'amp-consent',
    name: 'Enables the amp-consent extension',
    spec: 'https://github.com/ampproject/amphtml/issues/13716',
  },
  {
    id: 'no-sync-xhr-in-ads',
    name: 'Disables syncronous XHR requests in 3p iframes.',
    spec: 'TODO',
    cleanupIssue: 'TODO',
  },
  {
    id: 'sandbox-ads',
    name: 'Applies a sandbox to ad iframes.',
    spec: 'https://github.com/ampproject/amphtml/issues/14240',
    cleanupIssue: 'TODO',
  },
  {
    id: 'video-service',
    name: 'Enables new implementation of unified Video Interface services.',
    spec: 'https://github.com/ampproject/amphtml/issues/13674',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/13955',
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
    id: 'no-initial-intersection',
    name: 'Do not invoke context.observeIntersection callback with ' +
        'initialintersection',
    spec: 'https://github.com/ampproject/amphtml/issues/8562',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/8562',
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
    id: 'linker-meta-opt-in',
    name: 'Opts-in users that have included the GA client-id meta tag ',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/16737',
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
    id: 'amp-inputmask',
    name: 'Enables the amp-inputmask extension enabled through amp-form',
    spec: 'https://github.com/ampproject/amphtml/issues/12079',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18630',
  },
  {
    id: 'linker-form',
    name: 'Enables form support in linker',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18068',
  },
  {
    id: 'fie-metadata-extension',
    name: 'Use version supporting extension field in amp-ad-metadata.',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18737',
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
    id: 'amp-list-resizable-children',
    name: 'Experiment for allowing amp-list to resize when its children resize',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18875',
  },
  {
    id: 'hidden-mutation-observer',
    name: "Enables FixedLayer's hidden-attribute mutation observer",
    spec: 'https://github.com/ampproject/amphtml/issues/17475',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/18897',
  },
  {
    id: 'scroll-height-bounce',
    name: 'Bounces the scrolling when scroll height changes' +
        ' (fix for #18861 and #8798)',
    spec: 'https://github.com/ampproject/amphtml/issues/18861',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/19004',
  },
  {
    id: 'scroll-height-minheight',
    name: 'Forces min-height on body (fix for #18861 and #8798)',
    spec: 'https://github.com/ampproject/amphtml/issues/18861',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/19004',
  },
];

if (getMode().localDev) {
  EXPERIMENTS.forEach(experiment => {
    dev().assert(experiment.cleanupIssue, `experiment ${experiment.name} must` +
        ' have a `cleanupIssue` field.');
  });
}


/**
 * Builds the expriments tbale.
 */
function build() {
  const table = document.getElementById('experiments-table');
  EXPERIMENTS.forEach(function(experiment) {
    table.appendChild(buildExperimentRow(experiment));
  });
}


/**
 * Builds one row of the experiments table.
 * @param {!ExperimentDef} experiment
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

  button.addEventListener('click', toggleExperiment_.bind(null, experiment.id,
      experiment.name, undefined));

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
    return getCookie(window, 'AMP_CANARY') == '1';
  }
  return isExperimentOn(window, /*OK*/id);
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
  const confirmMessage = on ?
    'Do you really want to activate the AMP experiment' :
    'Do you really want to deactivate the AMP experiment';

  showConfirmation_(`${confirmMessage}: "${name}"`, () => {
    if (id == CANARY_EXPERIMENT_ID) {
      const validUntil = Date.now() + COOKIE_MAX_AGE_MS;

      setCookie(window, 'AMP_CANARY',
          (on ? '1' : '0'), (on ? validUntil : 0), {
            // Set explicit domain, so the cookie gets send to sub domains.
            domain: location.hostname,
            allowOnProxyOrigin: true,
          });
      // Reflect default experiment state.
      self.location.reload();
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
  const container = dev().assert(document.getElementById('popup-container'));
  const messageElement = dev().assert(document.getElementById('popup-message'));
  const confirmButton = dev().assert(
      document.getElementById('popup-button-ok'));
  const cancelButton = dev().assert(
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
 * user has (depends on whether they opted into canary), so that
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
