/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


// XXX no need for all the overrides, just experimenting
export class AmpHorizontalScroller extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    console.log(layout);
    return true;
  }

  /** @override */
  firstAttachedCallback() {
    console.log('firstAttachedCallback');
  }

  /** @override */
  preconnectCallback(onLayout) {
    console.log(onLayout);
    console.log('preconnectCallback');
  }

  /** @override */
  buildCallback() {
    console.log('buildCallback');
  }

  /** @override */
  onLayoutMeasure() {
    console.log('onLayoutMeasure');
  }

  /** @override */
  getIntersectionElementLayoutBox() {
    console.log('getIntersectionElementLayoutBox');
  }

  /** @override */
  layoutCallback() {
    console.log('layoutCallback');
    return Promise.resolve();
  }

  /** @override */
  unlayoutOnPause() {
    console.log('unlayoutOnPause');
    return true;
  }

  /** @override */
  unlayoutCallback() {
    console.log('unlayoutCallback');
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    console.log(inViewport);
    console.log('viewportCallback');
  }

  /** @override  */
  getPriority() {
    console.log('getPriority');
    return 1;
  }

  /** @override */
  firstLayoutCompleted() {
    console.log('firstLayoutCompleted');
  }
}
