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

import {Services} from '../../../src/services';
import {htmlFor} from '../../../src/static-template';
import {setStyles} from '../../../src/style';

/**
 * Generates the template for the confetti wrapper.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildConfettiWrapperTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-interactive-confetti-wrapper"
      aria-hidden="true"
    ></div>
  `;
};

/**
 * Generates a template for a confetti.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildconfettiTemplate = (element) => {
  const html = htmlFor(element);
  return html` <div class="i-amphtml-story-interactive-confetti"></div> `;
};

/**
 * Creates a radial burst of emoji.
 * The burst begins from the center of the parent element and
 * animates to the edges of the parent element.
 * Nodes are removed from the dom at the end of the animation.
 *
 * @param {!Element} rootEl
 * @param {!Window} win
 * @param {string} confettiEmoji
 * @return {void}
 */
export function emojiConfetti(rootEl, win, confettiEmoji) {
  const confettiCount = 5;
  const angleSlice = (Math.PI * 2) / confettiCount;

  const angleRandomness = angleSlice * 0.2;
  const fontSizeRandomRange = [30, 50];
  const rotationRandomness = 20;
  const additionalDistance = 5;

  const animationTime = 300;
  const animationOutDelay = 1000;

  // To calculate confetti transform distance.
  const rootElRect = rootEl./*OK*/ getBoundingClientRect();

  /** @private @const {!../../../src/service/timer-impl.Timer} */
  const timer = Services.timerFor(win);

  const confettiWrapper = buildConfettiWrapperTemplate(rootEl);
  rootEl.appendChild(confettiWrapper);

  timer.delay(() => {
    // Generate confetti. Set their ending position, size and rotation.
    for (let i = 0; i < confettiCount; i++) {
      const confetti = buildconfettiTemplate(rootEl);
      confettiWrapper.appendChild(confetti);
      confetti.textContent = confettiEmoji;

      const fontSize =
        randomInRange(fontSizeRandomRange[0], fontSizeRandomRange[1]) + 'px';
      const angle =
        angleSlice * i + randomInRange(-angleRandomness, angleRandomness);
      const x = Math.sin(angle) * (rootElRect.width / 2 + additionalDistance);
      const y = Math.cos(angle) * (rootElRect.height / 2 + additionalDistance);
      const rotation = randomInRange(-rotationRandomness, rotationRandomness);
      setStyles(confetti, {
        fontSize,
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      });
    }
    // Scale up confetti container.
    confettiWrapper.classList.add(
      'i-amphtml-story-interactive-confetti-wrapper-animate-in'
    );

    // Animate out the wrapper
    timer.delay(() => {
      confettiWrapper.classList.add(
        'i-amphtml-story-interactive-confetti-wrapper-animate-out'
      );
      // Remove the wrapper from the dom.
      timer.delay(() => rootEl.removeChild(confettiWrapper), animationTime);
    }, animationOutDelay);
  }, animationTime);
}

/**
 * Returns a random number between the min and max values.
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
