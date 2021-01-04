/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * Check if click is inside element
 * @param {Event} e
 * @param {HTMLElement} element
 * @return {boolean}
 */
export function isClickInsideElementRect(e, element) {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  return (
    e.clientX > rect.left &&
    e.clientX < rect.left + rect.width &&
    e.clientY > rect.top &&
    e.clientY < rect.top + rect.height
  );
}

/**
 * Get the extension size for the close button
 * @param {number|string} extendRadius
 * @return {*}
 */
export function getCloseButtonExtendedRadius(extendRadius) {
  let extendRadiusArray = String(extendRadius).split(' ').map(Number);

  if (extendRadiusArray.length === 1) {
    const radius = extendRadiusArray[0];
    extendRadiusArray = [radius, radius, radius, radius];
  }

  return extendRadiusArray;
}

/**
 * @param {"top" | "left" | "bottom" | "right"} outer
 * @param {boolean} inset
 * @return {CSSStyleDeclaration}
 */
export function getCloseButtonOuterPositionStyle(outer, inset) {
  switch (outer) {
    case 'bottom':
      return inset
        ? {bottom: '5px'}
        : {top: '100%', transform: 'translateY(5px)'};
    case 'left':
      return inset
        ? {left: '5px'}
        : {right: '100%', transform: 'translateX(-5px)'};
    case 'right':
      return inset
        ? {right: '5px'}
        : {left: '100%', transform: 'translateX(5px)'};
    case 'top':
      return inset
        ? {top: '5px'}
        : {bottom: '100%', transform: 'translateY(-5px)'};
  }
}

/**
 *
 * @param {"top" | "left" | "bottom" | "right"} inner
 * @return {CSSStyleDeclaration}
 */
export function getCloseButtonInnerPositionStyle(inner) {
  return {[inner]: '5px'};
}
