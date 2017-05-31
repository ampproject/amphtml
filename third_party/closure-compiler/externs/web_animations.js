// TODO(dvoytenko): Remove once Closure adds this extern.
// See: https://github.com/google/closure-compiler/issues/2134
// See: https://www.w3.org/TR/web-animations/

/*
 * Copyright 2016 The Closure Compiler Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Animation
 * @interface
 * @extend {EventTarget}
 */
class Animation {

  /**
   * Starts or resumes playing of an animation, or begins the animation again
   * if it previously finished.
   */
  play() {}

  /**
   * Clears all keyframeEffects caused by this animation and aborts its
   * playback.
   */
  cancel() {}

  /**
   * Seeks either end of an animation, depending on whether the animation is
   * playing or reversing.
   */
  finish() {}

  /**
   * Suspends playing of an animation.
   */
  pause() {}

  /**
   * Reverses playback direction, stopping at the start of the animation.
   * If the animation is finished or unplayed, it will play from end to
   * beginning.
   */
  reverse() {}
}


/**
 * @extends {CSSRule}
 * @see https://www.w3.org/TR/2009/WD-css3-animations-20090320/#DOM-CSSKeyframesRule
 */
class CSSKeyframesRule {
  constructor() {
    /** @type {string} */
    this.name;
    /** @type {!CSSRuleList} */
    this.cssRules;
  }
}


/**
 * @extends {CSSRule}
 * @see https://www.w3.org/TR/2009/WD-css3-animations-20090320/#DOM-CSSKeyframeRule
 */
class CSSKeyframeRule {
  constructor() {
    /** @type {string} */
    this.keyText;
    /** @type {!CSSStyleDeclaration} */
    this.style;
  }
}


/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 * @param {!Object} keyframes
 * @param {(!Object|number)=} opt_timing
 * @return {!Animation}
 */
Element.prototype.animate = function(keyframes, opt_timing) {};
