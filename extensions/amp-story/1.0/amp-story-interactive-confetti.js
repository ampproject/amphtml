/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {htmlFor} from '../../../src/static-template';
import {setStyles} from '../../../src/style';

/**
 * Generates the template for the particle wrapper.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildWrapperTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-interactive-particle-wrapper"
      aria-hidden="true"
    ></div>
  `;
};

/**
 * Generates a template for a particle.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildParticleTemplate = (element) => {
  const html = htmlFor(element);
  return html` <div class="i-amphtml-story-interactive-particle"></div> `;
};

/**
 * Creates a radial burst of emoji.
 * The burst begins from the center of the parent element and
 * animates to the edges of the parent element.
 * Nodes are removed from the dom at the end of the animation.
 *
 * @param {!Element} rootEl
 * @param {string} confettiEmoji
 * @return {void}
 */
export function emojiBurst(rootEl, confettiEmoji) {
  const PARTICLE_COUNT = 5;
  const SLICE = (Math.PI * 2) / PARTICLE_COUNT;

  const ANGLE_RANDOMNESS = SLICE * 0.2;
  const FONT_SIZE_RANDOM_RANGE = [30, 50];
  const ROTATION_RANDOMNESS = 20;
  const ADDITIONAL_DISTANCE = 5;

  const ANIMATION_IN_DELAY = 300;
  const ANIMATION_OUT_DELAY = 1000;

  let particleWrapper = rootEl.appendChild(buildWrapperTemplate(rootEl));

  setTimeout(() => {
    // Generate particles. Set their ending position, size and rotation.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = particleWrapper.appendChild(
        buildParticleTemplate(rootEl)
      );
      particle.textContent = confettiEmoji;

      const fontSize = randomInRange(...FONT_SIZE_RANDOM_RANGE) + 'px';
      const angle =
        SLICE * i + randomInRange(-ANGLE_RANDOMNESS, ANGLE_RANDOMNESS);
      const clientRect = rootEl.getBoundingClientRect();
      const x = Math.sin(angle) * (clientRect.width / 2 + ADDITIONAL_DISTANCE);
      const y = Math.cos(angle) * (clientRect.height / 2 + ADDITIONAL_DISTANCE);
      const rotation = randomInRange(-ROTATION_RANDOMNESS, ROTATION_RANDOMNESS);
      setStyles(particle, {
        fontSize,
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      });
    }
    // Scale up particle container.
    setStyles(particleWrapper, {transform: 'scale(1)'});

    // Animate out the particle wrapper and remove it from the dom.
    setTimeout(() => {
      setStyles(particleWrapper, {
        transform: `scale(1.2)`,
        opacity: `0`,
      });

      particleWrapper.addEventListener('transitionend', () => {
        particleWrapper && rootEl.removeChild(particleWrapper);
        // Set to null so removeChild is not fired twice.
        particleWrapper = null;
      });
    }, ANIMATION_OUT_DELAY);
  }, ANIMATION_IN_DELAY);
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
