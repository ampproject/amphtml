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

import { htmlFor } from "../../../src/static-template";

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
};

const function buildDisclaimerIcon(element) {
  const html = htmlFor(element);
  return html`<button class="i-amphtml-story-interactive-disclaimer">
  <div class="i-amphtml-story-interactive-disclaimer-content">
    <div class="i-amphtml-story-interactive-disclaimer-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="4" height="12" viewBox="0 0 4 12" fill="black">
        <path d="M2.00002 0C1.8191 2.71375e-07 1.64002 0.0361432 1.47343 0.10628C1.30683 0.176418 1.15613 0.279119 1.03026 0.408281C0.904391 0.537443 0.805932 0.690432 0.740732 0.858156C0.675531 1.02588 0.644921 1.20492 0.650718 1.38463L0.921037 6.88156C0.930028 7.15999 1.04765 7.42404 1.24901 7.61784C1.45038 7.81164 1.7197 7.92 2.00002 7.92C2.28034 7.92 2.54966 7.81164 2.75103 7.61784C2.9524 7.42404 3.07001 7.15999 3.07901 6.88156L3.34933 1.38463C3.35513 1.20492 3.32452 1.02588 3.25932 0.858158C3.19412 0.690434 3.09566 0.537445 2.96979 0.408282C2.84392 0.279119 2.69322 0.176418 2.52662 0.10628C2.36003 0.036143 2.18095 2.57507e-07 2.00002 0Z" />
        <path d="M2 9.30005C1.73299 9.30005 1.47199 9.37924 1.24999 9.52758C1.02798 9.67592 0.854954 9.88676 0.75278 10.1334C0.650606 10.3801 0.623875 10.6516 0.675968 10.9134C0.728061 11.1753 0.856639 11.4159 1.04544 11.6047C1.23424 11.7935 1.47479 11.922 1.73666 11.9741C1.99854 12.0262 2.26997 11.9995 2.51665 11.8973C2.76333 11.7951 2.97417 11.6221 3.12251 11.4001C3.27085 11.1781 3.35002 10.917 3.35002 10.65C3.35002 10.4728 3.3151 10.2972 3.24726 10.1334C3.17941 9.96963 3.07997 9.8208 2.95461 9.69544C2.82925 9.57008 2.68042 9.47064 2.51663 9.4028C2.35283 9.33496 2.17728 9.30004 2 9.30005Z" />
      </svg>
    </div>
    <div class="i-amphtml-story-interactive-disclaimer-bubble">
      <div>Your response will be sent to Google</div>
      <div class="i-amphtml-story-interactive-disclaimer-url">webstoriesinteractivity.googleapis.com</div>
      <div><a href="https://developers.google.com/terms" class="i-amphtml-story-interactive-disclaimer-link">Learn more</a></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" class="i-amphtml-story-interactive-disclaimer-close">
        <rect x="0.787868" y="1.83337" width="1.47851" height="13.2636" rx="0.739255" transform="rotate(-45 0.787868 1.83337)" fill="#9AA0A6" stroke="#9AA0A6" stroke-width="0.3" />
        <rect x="10.1669" y="0.787868" width="1.47851" height="13.2636" rx="0.739255" transform="rotate(45 10.1669 0.787868)" fill="#9AA0A6" stroke="#9AA0A6" stroke-width="0.3" />
      </svg>
    </div>
  </div>
</button>`;
}

/**
 * Creates a disclaimer icon and dialog from the interactive element passed in.
 *
 * @param {!Element} element the interactive element.
 * @return {!Element} the icon with the dialog that should be added to the shadowRoot.
 */
export function buildInteractiveDisclaimer(element) {
  const backendUrl = element.getAttribute('endpoint');
  if (!backendUrl) {
    return;
  }
  getBackendSpecs(backendUrl.replace('https://', ''));
}

/**
 * Returns the corresponding backend specs, or none.
 * @param {string} backendUrl
 * @return {?Object<string, !Object>} specs of the backend, or none if doesn't match.
 */
function getBackendSpecs(backendUrl) {
  Object.entries(BACKENDS).find((element) => {
    return element[0] === backendUrl.substring(0, element[0].length);
  });
}
