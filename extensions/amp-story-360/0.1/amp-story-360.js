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
import {CommonSignals} from '../../../src/common-signals';
import {Matrix, Renderer} from '../../../third_party/zuho/zuho';
import {isLayoutSizeDefined} from '../../../src/layout';
import {whenUpgradedToCustomElement} from '../../../src/dom';


class CameraHeading {
  constructor(theta, phi, scale) {
    this.theta = theta;
    this.phi = phi;
    this.scale = scale;
  }

  get rotation() {
    return Matrix.mul(3,
        Matrix.rotation(3, 1, 2, this.theta),
        Matrix.rotation(3, 0, 1, this.phi));
  }
}

class CameraAnimation {
  constructor(duration, headings) {
    this.maxFrame = 60 / 1000 * duration;
    this.headings = headings;
    this.currentHeadingIndex = 0;
    this.currentFrame = 0;
  }

  easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  getNextHeading() {
    if (this.currentHeadingIndex < 0 || this.currentFrame == this.maxFrame - 1) {
      // Animation ended.
      return null;
    }
    this.currentFrame++;
    const framesPerSection = this.maxFrame / (this.headings.length - 1);
    const lastFrameOfCurrentSection = (this.currentHeadingIndex + 1) * framesPerSection;
    if (this.currentFrame >= lastFrameOfCurrentSection) {
      this.currentHeadingIndex++;
      if (this.currentHeadingIndex == this.headings.length) {
        // End of animation.
        this.currentHeadingIndex = -1;
        return null;
      } else {
        return this.headings[this.currentHeadingIndex];
      }
    }
    const easing = this.easeInOutQuad(this.currentFrame % framesPerSection / framesPerSection);
    const from = this.headings[this.currentHeadingIndex];
    const to = this.headings[this.currentHeadingIndex + 1];
    return new CameraHeading(
      from.theta + (to.theta - from.theta) * easing,
      from.phi + (to.phi - from.phi) * easing,
      from.scale + (to.scale - from.scale) * easing);
  }
}

export class AmpStory360 extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Promise} */
    this.imagePromise_ = null;

    /** @private {Array<!CameraHeading>} */
    this.headings_ = [];

    /** @private {number} */
    this.duration_ = parseInt(element.getAttribute('duration') || 0, 10);

    /** @private {?Element} */
    this.container_ = null;

    /** @pivate {?Renderer} */
    this.renderer_ = null;
  }

  /** @override */
  buildCallback() {
    const values = this.element.getAttribute('heading').split(',').map(s => parseFloat(s));
    for (let i = 0; i + 3 <= values.length; i = i + 3) {
      this.headings_.push(new CameraHeading(values[i], values[i+1], values[i+2]));
    }
    this.container_ = this.element.ownerDocument.createElement('div');
    const canvas = this.element.ownerDocument.createElement('canvas');
    this.element.appendChild(this.container_);
    this.container_.appendChild(canvas);
    this.renderer_ = new Renderer(canvas);
    this.applyFillContent(this.container_, /* replacedContent */ true);

    const ampImgEl = this.element.querySelector('amp-img');
    this.imagePromise_ = whenUpgradedToCustomElement(ampImgEl).then(() => {
      console.log('image element upgraded', ampImgEl.signals());
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
        if (this.headings_.length < 1) {
          return;
        }
        this.renderer_.setCamera(this.headings_[0].rotation, this.headings_[0].scale);
        this.renderer_.render(false);
        if (this.duration_ && this.headings_.length > 1) {
          this.animate();
        }
    });
  }

  animate() {
    const animation = new CameraAnimation(this.duration_, this.headings_);
    const loop = () => {
      let nextHeading = animation.getNextHeading();
      if (nextHeading) {
        window.requestAnimationFrame(() => {
          this.renderer_.setCamera(nextHeading.rotation, nextHeading.scale);
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