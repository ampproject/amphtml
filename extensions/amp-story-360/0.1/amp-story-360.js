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

import {CSS} from '../../../build/amp-story-360-0.1.css';
import {timeStrToMillis} from '../../../extensions/amp-story/1.0/utils';
import {CommonSignals} from '../../../src/common-signals';
import {whenUpgradedToCustomElement} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';
import {Matrix, Renderer} from '../../../third_party/zuho/zuho';


/**
 * Internal helper class representing a camera orientation (POV) in polar
 * coordinates.
 */
class CameraOrientation {
  /**
   * @param {number} theta
   * @param {number} phi
   * @param {number} scale
   */
  constructor(theta, phi, scale) {
    this.theta = theta;
    this.phi = phi;
    this.scale = scale;
  }

  /**
   * @param {number} heading
   * @param {number} pitch
   * @param {number} zoom
   * @return {!CameraOrientation}
   */
  static fromDegrees(heading, pitch, zoom) {
    const deg2rad = (deg) => deg * Math.PI / 180;
    return new CameraOrientation(
        deg2rad(-pitch - 90), deg2rad(heading), 1 / zoom);
  }

  /**
   * @return {!Float32Array}
   */
  get rotation() {
    return Matrix.mul(
        3, Matrix.rotation(3, 1, 2, this.theta),
        Matrix.rotation(3, 0, 1, this.phi));
  }
}


/**
 * Internal helper class generating a sequence of frame by frame orientations
 * from a set of 2 or more CameraOrientation target points and an animation
 * duration.
 */
class CameraAnimation {
  /**
   * @param {number} duration
   * @param {!Array<!CameraOrientation>} orientations
   */
  constructor(duration, orientations) {
    this.maxFrame = 60 / 1000 * duration;
    this.orientations = orientations;
    this.currentHeadingIndex = 0;
    this.currentFrame = 0;
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  easeInOutQuad_(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  /**
   * Returns the CameraOrientation for the next frame, or null if the animation
   * is over.
   * @return {?CameraOrientation}
   */
  getNextOrientation() {
    if (this.currentHeadingIndex < 0 ||
        this.currentFrame == this.maxFrame - 1) {
      // Animation ended.
      return null;
    }
    this.currentFrame++;
    const framesPerSection = this.maxFrame / (this.orientations.length - 1);
    const lastFrameOfCurrentSection =
        (this.currentHeadingIndex + 1) * framesPerSection;
    if (this.currentFrame >= lastFrameOfCurrentSection) {
      this.currentHeadingIndex++;
      if (this.currentHeadingIndex == this.orientations.length) {
        // End of animation.
        this.currentHeadingIndex = -1;
        return null;
      } else {
        return this.orientations[this.currentHeadingIndex];
      }
    }
    const easing = this.easeInOutQuad_(
        this.currentFrame % framesPerSection / framesPerSection);
    const from = this.orientations[this.currentHeadingIndex];
    const to = this.orientations[this.currentHeadingIndex + 1];
    return new CameraOrientation(
        from.theta + (to.theta - from.theta) * easing,
        from.phi + (to.phi - from.phi) * easing,
        from.scale + (to.scale - from.scale) * easing);
  }
}

export class AmpStory360 extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Promise<undefined>} */
    this.imagePromise_ = null;

    /** @private {!Array<!CameraOrientation>} */
    this.orientations_ = [];

    /** @private {number} */
    this.duration_ = timeStrToMillis(element.getAttribute('duration'));

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Renderer} */
    this.renderer_ = null;
  }

  /** @override */
  buildCallback() {
    const attr = (name) => this.element.getAttribute(name);

    const startHeading = parseFloat(attr('heading-start') || 0);
    const startPitch = parseFloat(attr('pitch-start') || 0);
    const startZoom = parseFloat(attr('zoom-start') || 1);
    this.orientations_.push(
        CameraOrientation.fromDegrees(startHeading, startPitch, startZoom));

    if (attr('heading-end') !== undefined || attr('pitch-end') !== undefined ||
        attr('zoom-end') !== undefined) {
      const endHeading = parseFloat(attr('heading-end') || 0);
      const endPitch = parseFloat(attr('pitch-end') || 0);
      const endZoom = parseFloat(attr('zoom-end') || 1);
      this.orientations_.push(
          CameraOrientation.fromDegrees(endHeading, endPitch, endZoom));
    }

    this.container_ = this.element.ownerDocument.createElement('div');
    const canvas = this.element.ownerDocument.createElement('canvas');
    this.element.appendChild(this.container_);
    this.container_.appendChild(canvas);
    this.renderer_ = new Renderer(canvas);
    this.applyFillContent(this.container_, /* replacedContent */ true);

    const ampImgEl = this.element.querySelector('amp-img');
    userAssert(ampImgEl, 'amp-story-360 must contain an amp-img element.');
    this.imagePromise_ = whenUpgradedToCustomElement(ampImgEl).then(() => {
      return ampImgEl.signals().whenSignal(CommonSignals.LOAD_END);
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    return this.imagePromise_.then(() => {
      this.renderer_.resize();
      this.renderer_.setImage(this.element.querySelector('img'));
      if (this.orientations_.length < 1) {
        return;
      }
      this.renderer_.setCamera(
          this.orientations_[0].rotation, this.orientations_[0].scale);
      this.renderer_.render(false);
      if (this.duration_ && this.orientations_.length > 1) {
        this.animate();
      }
    });
  }

  animate() {
    const animation = new CameraAnimation(this.duration_, this.orientations_);
    const loop = () => {
      let nextOrientation = animation.getNextOrientation();
      if (nextOrientation) {
        window.requestAnimationFrame(() => {
          this.renderer_.setCamera(
              nextOrientation.rotation, nextOrientation.scale);
          this.renderer_.render(true);
          loop();
        });
      } else {
        this.renderer_.render(false);
        return;
      }
    };
    loop();
  }
}

AMP.extension('amp-story-360', '0.1', (AMP) => {
  AMP.registerElement('amp-story-360', AmpStory360, CSS);
});
