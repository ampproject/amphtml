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
import {EXPERIMENTS} from './experiments-config';
import {SameSite, getCookie, setCookie} from '../../src/cookies';
import {devAssert, initLogConstructor, setReportError} from '../../src/log';
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
 *   spec: string,
 *   cleanupIssue: string,
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
  // Experimental Channel
  {
    id: CANARY_EXPERIMENT_ID,
    name: 'AMP Experimental Channel (more info)',
    spec:
      'https://github.com/ampproject/amphtml/blob/master/' +
      'contributing/release-schedule.md#amp-experimental-and-beta-channels',
  },
  // Beta Channel
  {
    id: RC_EXPERIMENT_ID,
    name: 'AMP Beta Channel (more info)',
    spec:
      'https://github.com/ampproject/amphtml/blob/master/' +
      'contributing/release-schedule.md#amp-experimental-and-beta-channels',
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
 * Builds the expriments table.
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
    // Make sure the cookie is available for the script loads coming from
    // other domains. Chrome's default of LAX would otherwise prevent it
    // from being sent.
    sameSite: SameSite.NONE,
    secure: true,
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
