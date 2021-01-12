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

import {LocalizedStringId} from '../../../src/localized-strings';
import {htmlFor} from '../../../src/static-template';
import DisclaimerBackendsList from './disclaimer-backends-list.json' assert {type: 'json'}; // lgtm[js/syntax-error]

/**
 * Creates a disclaimer icon and dialog.
 * @param {!Element} element
 * @return {!Element}
 */
function buildDisclaimerLayout(element) {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-story-interactive-disclaimer">
    <button
      class="i-amphtml-story-interactive-disclaimer-alert"
      aria-label="Open disclaimer"
    ></button>
    <div
      class="i-amphtml-story-interactive-disclaimer-dialog"
      role="alertdialog"
    >
      <div class="i-amphtml-story-interactive-disclaimer-description">
        <span class="i-amphtml-story-interactive-disclaimer-note"
          >Your response will be sent to
        </span>
        <span class="i-amphtml-story-interactive-disclaimer-entity"></span>
        <div class="i-amphtml-story-interactive-disclaimer-url"></div>
      </div>
      <div>
        <a target="_blank" class="i-amphtml-story-interactive-disclaimer-link"
          >Learn more</a
        >
      </div>
      <button
        class="i-amphtml-story-interactive-disclaimer-close"
        aria-label="Close disclaimer"
      ></button>
    </div>
  </div>`;
}

/**
 * Creates a disclaimer icon and dialog from the interactive element passed in.
 * @param {!AmpStoryInteractive} interactive the interactive element.
 * @return {!Element} the icon with the dialog that should be added to the shadowRoot.
 */
export function buildInteractiveDisclaimer(interactive) {
  const {element} = interactive;
  const backendUrl = element.getAttribute('endpoint').replace('https://', '');

  const disclaimer = buildDisclaimerLayout(element);
  const dialogEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-dialog'
  );
  const descriptionEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-description'
  );
  const urlEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-url'
  );
  const linkEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-link'
  );
  const entityEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-entity'
  );
  const noteEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-note'
  );

  // Fill information
  const backendSpecs = getBackendSpecs(backendUrl, DisclaimerBackendsList);
  const disclaimerDescriptionId = `i-amphtml-story-disclaimer-${interactive.element.id}-description`;
  interactive.mutateElement(() => {
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
    descriptionEl.id = disclaimerDescriptionId;
    dialogEl.setAttribute('aria-describedby', disclaimerDescriptionId); // For screen readers.
    return closeDisclaimer(interactive, disclaimer);
  });

  // Add click listener to open or close the dialog.
  disclaimer.addEventListener('click', (event) => {
    if (
      event.target.classList.contains(
        'i-amphtml-story-interactive-disclaimer-close'
      )
    ) {
      closeDisclaimer(interactive, disclaimer);
    } else if (
      event.target.classList.contains(
        'i-amphtml-story-interactive-disclaimer-alert'
      )
    ) {
      openDisclaimer(interactive, disclaimer);
    }
  });
  return disclaimer;
}

/**
 * Sets the styles to open the disclaimer dialog.
 * @param {!AmpStoryInteractive} interactive
 * @param {!Element} disclaimerEl
 */
function openDisclaimer(interactive, disclaimerEl) {
  interactive.mutateElement(() => {
    disclaimerEl.setAttribute('active', '');
  });
}

/**
 * Sets the styles to close the disclaimer dialog.
 * @param {!AmpStoryInteractive} interactive
 * @param {!Element} disclaimerEl
 * @return {!Promise}
 */
function closeDisclaimer(interactive, disclaimerEl) {
  return interactive.mutateElement(() => {
    disclaimerEl.removeAttribute('active');
  });
}

/**
 * Close the disclaimer if it's open.
 * @param {!AmpStoryInteractive} interactive
 * @param {?Element} disclaimerEl
 * @return {!Promise}
 */
export function tryCloseDisclaimer(interactive, disclaimerEl) {
  if (disclaimerEl && disclaimerEl.hasAttribute('active')) {
    return closeDisclaimer(interactive, disclaimerEl);
  }
  return Promise.resolve();
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
