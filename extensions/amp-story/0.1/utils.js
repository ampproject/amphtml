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

import {closestAncestorElementBySelector} from '../../../src/dom';
import {createShadowRoot} from '../../../src/shadow-embed';
import {user, userAssert} from '../../../src/log';

/**
 * Returns millis as number if given a string(e.g. 1s, 200ms etc)
 * @param {string} time
 * @return {number|undefined}
 */
export function timeStrToMillis(time) {
  const match = time.toLowerCase().match(/^([0-9\.]+)\s*(s|ms)$/);
  if (!match) {
    return NaN;
  }

  const num = match[1];
  const units = match[2];

  userAssert(
      match &&
          match.length == 3 &&
          (units == 's' || units == 'ms'),
      'Invalid time string %s', time);

  return units == 's' ? parseFloat(num) * 1000 : parseInt(num, 10);
}


/**
 * Determines whether the specified element has an action for its on="tap:..."
 * handler.
 * @param {!Element} el
 * @return {boolean}
 */
export function hasTapAction(el) {
  // There are better ways to determine this, but they're all bound to action
  // service race conditions. This is good enough for our use case.
  return el.hasAttribute('on') &&
      !!el.getAttribute('on').match(/(^|;)\s*tap\s*:/);
}


/**
 * Calculates a client rect without applying scaling transformations.
 * Note: must be run in a vsync measure context.
 * @param {!Element} el
 * @return {!ClientRect}
 */
export function unscaledClientRect(el) {
  const {width, height, left, top} = el./*OK*/getBoundingClientRect();

  const scaleFactorX = width == 0 ? 1 : width / el./*OK*/offsetWidth;
  const scaleFactorY = height == 0 ? 1 : height / el./*OK*/offsetHeight;

  return /** @type {!ClientRect} */ ({
    left: left / scaleFactorX,
    top: top / scaleFactorY,
    width: width / scaleFactorX,
    height: height / scaleFactorY,
  });
}


/**
 * Finds an amp-video/amp-audio ancestor.
 * @param {!Element} el
 * @return {?AmpElement}
 */
export function ampMediaElementFor(el) {
  return closestAncestorElementBySelector(el, 'amp-video, amp-audio');
}


/**
 * Creates a shadow root for the provided container, and appends the element
 * along with its CSS.
 * @param  {!Element} container
 * @param  {!Element} element
 * @param  {string} css
 * @return {!ShadowRoot}
 */
export function createShadowRootWithStyle(container, element, css) {
  const shadowRoot = createShadowRoot(container);

  const style = self.document.createElement('style');
  style./*OK*/textContent = css;

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(element);

  return shadowRoot;
}


/**
 * Parses the resolved CSS color property, that is always in the form of
 * `rgba(0, 0, 0, 1)` or `rgb(0, 0, 0)`, that can be retrieved using
 * `getComputedStyle`.
 * Returns an object containing the R, G, and B 8bit numbers.
 * @param  {string} cssValue
 * @return {!Object<string, number>}
 */
export function getRGBFromCssColorValue(cssValue) {
  const regexPattern = /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})/;

  if (!cssValue.match(regexPattern)) {
    user().error('UTILS', 'getRGBFromCssColorValue expects a parameter in ' +
        `the form of 'rgba(0, 0, 0, 1)' or 'rgb(0, 0, 0)' but got ${cssValue}`);
    // Returns a fallback value, to fail 'gracefully' in case a browser we don't
    // know about gave an unexpected value.
    return {r: 0, g: 0, b: 0};
  }

  const matches = regexPattern.exec(cssValue);

  return {
    r: Number(matches[1]),
    g: Number(matches[2]),
    b: Number(matches[3]),
  };
}


/**
 * Returns the color, either black or white, that has the best contrast ratio
 * against the provided RGB 8bit values.
 * @param  {!Object<string, number>} rgb  ie: {r: 0, g: 0, b: 0}
 * @return {string} '#fff' or '#000'
 */
export function getTextColorForRGB({r, g, b}) {
  // Calculates the relative luminance L.
  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
  const getLinearRGBValue = x => {
    // 8bit to sRGB.
    x /= 255;

    // Converts the gamma-compressed RGB values to linear RGB.
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };

  const linearR = getLinearRGBValue(r);
  const linearG = getLinearRGBValue(g);
  const linearB = getLinearRGBValue(b);

  const L = (0.2126 * linearR) + (0.7152 * linearG) + (0.0722 * linearB);

  // Determines which one of the white and black text have a better contrast
  // ratio against the used background color.
  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
  // @TODO(gmajoulet): Improve the text color for high contrast ratio.
  // 1 is L for #FFF, and 0 is L for #000.
  // (1 + 0.05) / (L + 0.05) > (L + 0.05) / (0 + 0.05) toggles for L = 0.179.
  return L > 0.179 ? '#000' : '#FFF';
}
