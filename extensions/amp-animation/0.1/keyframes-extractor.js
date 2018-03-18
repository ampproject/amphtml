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

import {endsWith} from '../../../src/string';
import {toWin} from '../../../src/types';


/**
 * Finds and extracts keyframes definition for Web Animations from CSS styles.
 * @param {!Document|!ShadowRoot} rootNode
 * @param {string} name
 * @return {?./web-animation-types.WebKeyframesDef}
 */
export function extractKeyframes(rootNode, name) {
  const styleSheets = rootNode.styleSheets;
  if (!styleSheets) {
    return null;
  }
  const win = toWin((rootNode.ownerDocument || rootNode).defaultView);
  // Go from the last to first since the last rule wins in CSS.
  for (let i = styleSheets.length - 1; i >= 0; i--) {
    const keyframes = scanStyle(
        win, /** @type {!CSSStyleSheet} */ (styleSheets[i]), name);
    if (keyframes) {
      return keyframes;
    }
  }
  return null;
}


/**
 * @param {!Window} win
 * @param {!CSSStyleSheet} styleSheet
 * @param {string} name
 * @return {?./web-animation-types.WebKeyframesDef}
 */
function scanStyle(win, styleSheet, name) {
  // No rules, e.g. a font.
  if (!styleSheet.cssRules) {
    return null;
  }

  const styleNode = styleSheet.ownerNode;
  if (!styleNode) {
    return null;
  }
  // Exlcude AMP's own styles.
  if (!styleNode.hasAttribute('amp-custom') &&
      !styleNode.hasAttribute('amp-keyframes')) {
    return null;
  }

  return scanRules(win, styleSheet.cssRules, name);
}


/**
 * @param {!Window} win
 * @param {!CSSRuleList} rules
 * @param {string} name
 * @return {?./web-animation-types.WebKeyframesDef}
 */
function scanRules(win, rules, name) {
  // Go backwards since in CSS the last one wins.
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (rule.type == /* CSSKeyframesRule */ 7) {
      const keyframesRule = /** @type {!CSSKeyframesRule} */ (rule);
      if (rule.name == name && isEnabled(win, rule)) {
        return buildKeyframes(keyframesRule);
      }
    } else if (rule.type == /* CSSMediaRule */ 4 ||
          rule.type == /* CSSSupportsRule */ 12) {
      // Go recursively inside. The media/supports match will be checked only
      // when the corresponding @keyframes have been found.
      const found = scanRules(win, rule.cssRules, name);
      if (found) {
        return found;
      }
    }
  }
  return null;
}


/**
 * @param {!Window} win
 * @param {!CSSRule} rule
 * @return {boolean}
 */
function isEnabled(win, rule) {
  // Try rule itself.
  if (rule.media && rule.media.mediaText) {
    const enabled = win.matchMedia(rule.media.mediaText).matches;
    if (!enabled) {
      return false;
    }
  }
  if (rule.type == /* CSSSupportsRule */ 12) {
    if (!win.CSS ||
        !win.CSS.supports ||
        !win.CSS.supports(
            /** @type {!CSSSupportsRule} */ (rule).conditionText)) {
      return false;
    }
  }

  // Check the parents.
  if (rule.parentRule) {
    return isEnabled(win, rule.parentRule);
  }
  return true;
}


/**
 * @param {!CSSKeyframesRule} keyframesRule
 * @return {!./web-animation-types.WebKeyframesDef}
 */
function buildKeyframes(keyframesRule) {
  const array = [];
  for (let i = 0; i < keyframesRule.cssRules.length; i++) {
    const keyframeRule = /** @type {!CSSKeyframeRule} */ (
      keyframesRule.cssRules[i]);
    const keyframe = {};
    keyframe['offset'] =
        keyframeRule.keyText == 'from' ? 0 :
          keyframeRule.keyText == 'to' ? 1 :
            parseFloat(keyframeRule.keyText) / 100;
    const style = keyframeRule.style;
    for (let j = 0; j < style.length; j++) {
      const styleName = style[j];
      let propName = styleName;
      if (endsWith(styleName, 'animation-timing-function')) {
        propName = 'easing';
      }
      keyframe[propName] = style[styleName];
    }
    array.push(keyframe);
  }
  return array;
}
