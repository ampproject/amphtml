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

import '../../src/polyfills';
import {onDocumentReady} from '../../src/document-state';
import {getCookie, setCookie} from '../../src/cookies';


/** @const {number} */
const COOKIE_MAX_AGE_DAYS = 180;  // 6 month


/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   spec: string
 * }}
 */
const Experiment = {};


/** @const {!Array<!Experiment>} */
const EXPERIMENTS = [

  // Mustache
  {
    id: 'mustache',
    name: 'Mustache templates (amp-mustache)',
    spec: 'https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-mustache/amp-mustache.md',
  },
];


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
 * @param {!Experiment} experiment
 */
function buildExperimentRow(experiment) {
  const tr = document.createElement('tr');
  tr.id = 'exp-tr-' + experiment.id;

  const tdId = document.createElement('td');
  tdId.appendChild(buildLinkMaybe(experiment.id, experiment.spec));
  tr.appendChild(tdId);

  const tdName = document.createElement('td');
  tdName.textContent = experiment.name;
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

  button.addEventListener('click', toggleExperiment.bind(null, experiment.id,
      undefined));

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
 * @param {!Experiment} experiment
 */
function updateExperimentRow(experiment) {
  const tr = document.getElementById('exp-tr-' + experiment.id);
  if (!tr) {
    return;
  }
  tr.setAttribute('data-on', isExperimentOn(experiment.id) ? 1 : 0);
}


/**
 * Returns a set of experiment IDs currently on.
 * @return {!Array<string>}
 */
function getExperimentIds() {
  const experimentCookie = getCookie(window, 'AMP_EXP');
  return experimentCookie ? experimentCookie.split(/\s*,\s*/g) : [];
}


/**
 * Returns whether the experiment is on or off.
 * @param {string} id
 * @return {boolean}
 */
function isExperimentOn(id) {
  return getExperimentIds().indexOf(id) != -1;
}


/**
 * Toggles the expriment.
 * @param {string} id
 * @param {boolean=} opt_on
 */
function toggleExperiment(id, opt_on) {
  const experimentIds = getExperimentIds();
  const currentlyOn = experimentIds.indexOf(id) != -1;
  const on = opt_on !== undefined ? opt_on : !currentlyOn;
  if (on != currentlyOn) {
    if (on) {
      experimentIds.push(id);
    } else {
      experimentIds.splice(experimentIds.indexOf(id), 1);
    }
    setCookie(window, 'AMP_EXP', experimentIds.join(','),
        new Date().getTime() + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  }
  update();
}


// Start up.
onDocumentReady(document, () => {
  build();
  update();
});
