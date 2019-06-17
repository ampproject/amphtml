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

/**
 * @fileoverview Bling link component that turns into a tooltip when clicked.
 */

import {Layout} from '../../../src/layout';

/** @const */
const HOVER_CLASS = 'i-amphtml-story-bling-link-hover';

/** @const */
const PULSE_CLASS = 'pulse';

/** @const */
const MATERIAL_ICON_CLASS = 'material-icons';

/** @const */
const ICON_CLASS = 'i-amphtml-story-bling-link-icon';

export class AmpStoryBlingLink extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  layoutCallback() {
    addIconElement(this.element, this.win);
    addPulseAnimation(this.element);
    setClassOnHover(this.element);
  }
}

/**
 * Adds icon class
 * @param {!AmpStoryBlingLink} el
 * @param {!Window} win
 */
function addIconElement(el, win) {
  const iconEl = win.document.createElement('i');
  iconEl.classList.add(MATERIAL_ICON_CLASS, ICON_CLASS);
  iconEl.textContent = 'shopping_cart';
  el.appendChild(iconEl);
}

/**
 * Adds pulse class that starts animation
 * @param {!AmpStoryBlingLink} el
 */
function addPulseAnimation(el) {
  el.classList.add(PULSE_CLASS);
}

/**
 * Sets hover class and stops animation on hover
 * @param {!AmpStoryBlingLink} el
 */
function setClassOnHover(el) {
  el.addEventListener('mouseenter', () => {
    el.classList.add(HOVER_CLASS);
    el.classList.remove(PULSE_CLASS);
  });
  el.addEventListener('mouseleave', () => {
    el.classList.remove(HOVER_CLASS);
    el.classList.add(PULSE_CLASS);
  });
}
