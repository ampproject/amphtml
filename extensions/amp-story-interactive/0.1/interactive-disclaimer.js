/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview
 * Interactive components support a disclaimer bubble that tells users where their data is being sent to.
 * Disclaimers will retrieve the information from the lookup dictionary in disclaimer-backends-list.json.
 * In order to add a "Learn more" link or entity name ("Your response will be sent to <Organization>"),
 * submit a PR with a new entry on the DisclaimerBackendList and tag @ampproject/wg-stories to review it.
 */

import {LocalizedStringId} from '#service/localization/strings';
import {htmlFor, htmlRefs} from '#core/dom/static-template';
import DisclaimerBackendsList from './disclaimer-backends-list.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {createShadowRootWithStyle} from 'extensions/amp-story/1.0/utils';
import {CSS} from '../../../build/amp-story-interactive-disclaimer-0.1.css';
import {addAttributesToElement} from '#core/dom';

/**
 * Creates a disclaimer icon and dialog.
 * @param {!Element} element
 * @return {!Element}
 */
function buildDisclaimerLayout(element) {
  const html = htmlFor(element);
  return html`<div
    class="i-amphtml-story-interactive-disclaimer-dialog"
    role="alertdialog"
  >
    <div
      class="i-amphtml-story-interactive-disclaimer-description"
      ref="descriptionEl"
    >
      <span class="i-amphtml-story-interactive-disclaimer-note" ref="noteEl"
        >Your response will be sent to
      </span>
      <span
        class="i-amphtml-story-interactive-disclaimer-entity"
        ref="entityEl"
      ></span>
      <div class="i-amphtml-story-interactive-disclaimer-url" ref="urlEl"></div>
    </div>
    <div>
      <a
        target="_blank"
        class="i-amphtml-story-interactive-disclaimer-link"
        ref="linkEl"
        >Learn more</a
      >
    </div>
    <button
      class="i-amphtml-story-interactive-disclaimer-close"
      aria-label="Close disclaimer"
    ></button>
  </div>`;
}

/**
 * Creates a disclaimer icon.
 * @param {!Element} element
 * @return {!Element}
 */
function buildIconLayout(element) {
  const html = htmlFor(element);
  return html`<button
    class="i-amphtml-story-interactive-disclaimer-icon"
    aria-label="Open disclaimer"
  ></button>`;
}

/**
 * Creates a disclaimer dialog from the interactive element passed in.
 * @param {!AmpStoryInteractive} interactive the interactive element.
 * @param {JsonObject<string, string>=} attrs optional attributes for the disclaimer.
 * @return {!Element} the container for the shadow root that has the disclaimer.
 */
export function buildInteractiveDisclaimer(interactive, attrs = {}) {
  const disclaimer = buildDisclaimerLayout(interactive.element);
  addAttributesToElement(disclaimer, attrs);

  // Fill information
  const {descriptionEl, entityEl, linkEl, noteEl, urlEl} = htmlRefs(disclaimer);
  const backendUrl = interactive.element
    .getAttribute('endpoint')
    .replace('https://', '');
  const backendSpecs = getBackendSpecs(backendUrl, DisclaimerBackendsList);
  if (backendSpecs) {
    entityEl.textContent = backendSpecs[1].entityName;
    urlEl.textContent = backendSpecs[0];
    backendSpecs[1].learnMoreUrl
      ? (linkEl.href = backendSpecs[1].learnMoreUrl)
      : linkEl.remove();
  } else {
    entityEl.remove();
    urlEl.textContent = backendUrl;
    linkEl.remove();
  }
  noteEl.textContent = interactive.localizationService.getLocalizedString(
    LocalizedStringId.AMP_STORY_INTERACTIVE_DISCLAIMER_NOTE
  );

  // Set the described-by for a11y.
  const disclaimerDescriptionId = `i-amphtml-story-disclaimer-${interactive.element.id}-description`;
  descriptionEl.id = disclaimerDescriptionId;
  disclaimer.setAttribute('aria-describedby', disclaimerDescriptionId);

  // Create container and return.
  const disclaimerContainer = htmlFor(
    interactive.element
  )`<div class="i-amphtml-story-interactive-disclaimer-dialog-container"></div>`;
  createShadowRootWithStyle(disclaimerContainer, disclaimer, CSS);
  return disclaimerContainer;
}

/**
 * Creates a disclaimer icon from the interactive element passed in.
 * @param {!AmpStoryInteractive} interactive the interactive element.
 * @return {!Element} the icon with the dialog that should be added to the shadowRoot.
 */
export function buildInteractiveIcon(interactive) {
  const disclaimerIcon = buildIconLayout(interactive.element);
  return disclaimerIcon;
}

/**
 * Returns the corresponding backend specs (as an array of url and specs), or undefined.
 * @param {string} backendUrl
 * @param {!Object<string, !Object<string, string>>} backendsList
 * @return {?Array<string|Object<string, string>>} array that contains: base url of backend, {learnMoreUrl, entity}.
 */
export function getBackendSpecs(backendUrl, backendsList) {
  return Object.entries(backendsList).find((element) => {
    return element[0] === backendUrl.substring(0, element[0].length);
  });
}
