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

import {closest} from '../../../src/dom';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * Disclaimers will retrieve the information from the lookup dictionary below.
 * In order to add a "Learn more" link or entity name ("Your response will be sent to <Organization>"),
 * submit a PR with a new entry on the BACKENDS dictionary and tag @wg-stories to review it.
 */

/** @const {!Object<string, !Object>} */
const BACKENDS = {
  'webstoriesinteractivity.googleapis.com': {
    learnMoreUrl: 'https://policies.google.com/terms',
    entityName: 'Google',
  },
  'webstoriesinteractivity-beta.web.app': {
    learnMoreUrl: 'https://policies.google.com/terms',
    entityName: 'Google Firebase',
  },
};

/**
 * Creates a disclaimer icon and dialog.
 * @param {!Element} element
 * @return {!Element}
 */
function buildDisclaimerLayout(element) {
  const html = htmlFor(element);
  return html`<div class="i-amphtml-story-interactive-disclaimer">
    <div class="i-amphtml-story-interactive-disclaimer-content">
      <div class="i-amphtml-story-interactive-disclaimer-icon"></div>
      <div class="i-amphtml-story-interactive-disclaimer-bubble">
        <div>
          <span>Your response will be sent to </span>
          <span class="i-amphtml-story-interactive-disclaimer-entity"></span>
        </div>
        <div class="i-amphtml-story-interactive-disclaimer-url"></div>
        <div>
          <a target="_blank" class="i-amphtml-story-interactive-disclaimer-link"
            >Learn more</a
          >
        </div>
        <button class="i-amphtml-story-interactive-disclaimer-close"></button>
      </div>
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
  const urlEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-url'
  );
  const linkEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-link'
  );
  const entityEl = disclaimer.querySelector(
    '.i-amphtml-story-interactive-disclaimer-entity'
  );

  // Fill information
  const backendSpecs = getBackendSpecs(backendUrl);
  interactive
    .mutateElement(() => {
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
    })
    .then(() => closeDisclaimer(interactive, disclaimer))
    .then(() =>
      disclaimer
        .querySelector('.i-amphtml-story-interactive-disclaimer-content')
        .classList.add('i-amphtml-story-interactive-disclaimer-content-inplace')
    );

  // Add click listener to open or close the dialog.
  disclaimer.addEventListener('click', (event) => {
    const closeClicked = closest(
      event.target,
      (e) =>
        e.classList.contains('i-amphtml-story-interactive-disclaimer-close'),
      interactive
    );
    if (closeClicked) {
      closeDisclaimer(interactive, disclaimer);
    } else if (!disclaimer.hasAttribute('active')) {
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
  const contentEl = disclaimerEl.querySelector(
    '.i-amphtml-story-interactive-disclaimer-content'
  );

  interactive.mutateElement(() => {
    disclaimerEl.setAttribute('active', '');
    setStyle(contentEl, 'transform', 'scale(1, 1)');
  });
}

/**
 * Sets the styles to close the disclaimer dialog.
 * @param {!AmpStoryInteractive} interactive
 * @param {!Element} disclaimerEl
 * @return {!Promise}
 */
function closeDisclaimer(interactive, disclaimerEl) {
  const bubbleEl = disclaimerEl.querySelector(
    '.i-amphtml-story-interactive-disclaimer-bubble'
  );
  const iconEl = disclaimerEl.querySelector(
    '.i-amphtml-story-interactive-disclaimer-icon'
  );
  const contentEl = disclaimerEl.querySelector(
    '.i-amphtml-story-interactive-disclaimer-content'
  );

  const scale = {x: 1, y: 1};
  return interactive.measureMutateElement(
    () => {
      scale.x = bubbleEl.offsetWidth / iconEl.offsetWidth;
      scale.y = bubbleEl.offsetHeight / iconEl.offsetHeight;
    },
    () => {
      console.log(scale);
      disclaimerEl.removeAttribute('active');
      setStyle(contentEl, 'transform', `scale(${1 / scale.x}, ${1 / scale.y})`);
      setStyle(iconEl, 'transform', `scale(${scale.x}, ${scale.y})`);
    }
  );
}

/**
 * Returns the corresponding backend specs, or none.
 * @param {string} backendUrl
 * @return {?Object<string, !Object>} specs of the backend, or none if doesn't match.
 */
function getBackendSpecs(backendUrl) {
  return Object.entries(BACKENDS).find((element) => {
    return element[0] === backendUrl.substring(0, element[0].length);
  });
}
