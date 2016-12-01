/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import '../../third_party/babel/custom-babel-helpers';
import '../../src/polyfills';
import {dev, initLogConstructor} from '../../src/log';
import {getCookie, setCookie} from '../../src/cookies';
import {getMode} from '../../src/mode';
import {isExperimentOn, toggleExperiment} from '../../src/experiments';
import {listenOnce} from '../../src/event-helper';
import {onDocumentReady} from '../../src/document-ready';
//TODO(@cramforce): For type. Replace with forward declaration.
import '../../src/service/timer-impl';

initLogConstructor();

const COOKIE_MAX_AGE_DAYS = 180;  // 6 month

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
        'README.md#amp-dev-channel',
  },
  {
    id: 'ad-type-custom',
    name: 'Activates support for custom (self-serve) advertisements',
    spec: 'https://github.com/ampproject/amphtml/ads/custom.md',
  },
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
    id: 'amp-access-signin',
    name: 'AMP Access sign-in',
    spec: 'https://github.com/ampproject/amphtml/issues/4227',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4226',
  },
  {
    id: 'amp-auto-ads',
    name: 'AMP Auto Ads',
    spec: 'https://github.com/ampproject/amphtml/issues/6196',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6217',
  },
  {
    id: 'amp-inabox',
    name: 'AMP inabox',
    spec: 'https://github.com/ampproject/amphtml/issues/5700',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6156',
  },
  {
    id: 'amp-form-custom-validations',
    name: 'AMP Form Custom Validations',
    spec: 'https://github.com/ampproject/amphtml/issues/3343',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5423',
  },
  {
    id: 'amp-form-var-sub',
    name: 'Variable Substitutions in AMP Form inputs',
    spec: 'https://github.com/ampproject/amphtml/issues/5654',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6377',
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
    name: 'AMP extension for Apester media',
    spec: 'https://github.com/ampproject/amphtml/issues/3233',
    cleanupIssue: 'https://github.com/ampproject/amphtml/pull/4291',
  },
  {
    id: 'cache-service-worker',
    name: 'AMP Cache Service Worker',
    spec: 'https://github.com/ampproject/amphtml/issues/1199',
  },
  {
    id: 'amp-lightbox-viewer',
    name: 'Enables a new lightbox experience via the `lightbox` attribute',
    spec: 'https://github.com/ampproject/amphtml/issues/4152',
  },
  {
    id: 'amp-lightbox-viewer-auto',
    name: 'Allows the new lightbox experience to automatically include some ' +
        'elements without the need to manually add the `lightbox` attribute',
    spec: 'https://github.com/ampproject/amphtml/issues/4152',
  },
  {
    id: 'amp-fresh',
    name: 'Guaranteed minimum freshness on sections of a page',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/4715',
  },
  {
    id: 'make-body-block',
    name: 'Sets the body to display:block.',
    spec: 'https://github.com/ampproject/amphtml/issues/5310',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5319',
  },
  {
    id: 'make-body-relative',
    name: 'Sets the body to position:relative.',
    spec: 'https://github.com/ampproject/amphtml/issues/5667',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5660',
  },
  {
    id: 'link-url-replace',
    name: 'Enables replacing variables in URLs of outgoing links.',
    spec: 'https://github.com/ampproject/amphtml/issues/4078',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5627',
  },
  {
    id: 'alp-for-a4a',
    name: 'Enable redirect to landing page directly for A4A',
    spec: 'https://github.com/ampproject/amphtml/issues/5212',
  },
  {
    id: 'ios-embed-wrapper',
    name: 'A new iOS embedded viewport model that wraps the body into' +
        ' a synthetic root',
    spec: '',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5639',
  },
  {
    id: 'chunked-amp',
    name: 'Split AMP\'s loading phase into chunks',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5535',
  },
  {
    id: 'amp-animation',
    name: 'High-performing keyframe animations in AMP.',
    spec: 'https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-animation/amp-animation.md',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/5888',
  },
  {
    id: 'amp-ad-loading-ux',
    name: 'New default loading UX to amp-ad',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6009',
  },
  {
    id: 'visibility-v2',
    name: 'New visibility tracking using native IntersectionObserver',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6254',
  },
  {
    id: 'amp-selector',
    name: 'Amp selector extension',
    cleanupIssue: 'https://github.com/ampproject/amphtml/issues/6168',
    spec: 'https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-selector/amp-selector.md',
  },
  {
    id: 'amp-accordion-session-state-optout',
    name: 'AMP Accordion attribute to opt out of preserved state.',
    Spec: 'https://github.com/ampproject/amphtml/issues/3813',
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
  tr.setAttribute('data-on', isExperimentOn_(experiment.id) ? 1 : 0);
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
  return isExperimentOn(window, id);
}


/**
 * Toggles the experiment.
 * @param {string} id
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
      const validUntil = Date.now() +
          COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      setCookie(window, 'AMP_CANARY', (on ? '1' : '0'), (on ? validUntil : 0));
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


// Start up.
onDocumentReady(document, () => {
  build();
  update();
});
