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
import {Services} from '../../../src/services';
import {StateProperty} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {isLayoutSizeDefined} from '../../../src/layout';
import {timeStrToMillis} from '../../../extensions/amp-story/1.0/utils';
import {user, userAssert} from '../../../src/log';
import {whenUpgradedToCustomElement} from '../../../src/dom';
import {htmlFor} from '../../../src/static-template';

/** @const {string} */
const TAG = 'AMP_STORY_360';

/**
 * Generates the template for the binary poll option.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildPermissionButtonTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <button class="i-amp-story-360-permissions-button">
      Activate
      <span class="i-amp-story-360-permissions-button-icon"
        >360°
        <svg
          class="i-amp-story-360-permissions-button-icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <defs>
            <linearGradient id="gradient1">
              <stop stop-color="white" stop-opacity=".3" />
              <stop offset="1" stop-color="white" />
            </linearGradient>
            <linearGradient id="gradient2" gradientTransform="rotate(90)">
              <stop stop-color="white" stop-opacity=".3" />
              <stop offset="1" stop-color="white" />
            </linearGradient>
          </defs>
          <ellipse
            ry="11.5"
            rx="7.5"
            cy="12"
            cx="12"
            stroke="url(#gradient1)"
          />
          <ellipse
            ry="7.5"
            rx="11.5"
            cy="12"
            cx="12"
            stroke="url(#gradient2)"
          />
        </svg>
      </span>
    </button>
  `;
};

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
    const deg2rad = (deg) => (deg * Math.PI) / 180;
    return new CameraOrientation(
      deg2rad(-pitch - 90),
      deg2rad(90 + heading),
      1 / zoom
    );
  }

  /**
   * @return {!Float32Array}
   */
  get rotation() {
    return Matrix.mul(
      3,
      Matrix.rotation(3, 1, 2, this.theta),
      Matrix.rotation(3, 0, 1, this.phi)
    );
  }
}

/**
 * Internal helper class generating a sequence of frame by frame orientations
 * from a set of 2 or more CameraOrientation target points and an animation
 * duration (approximate duration in ms based on 60FPS refresh rate).
 */
class CameraAnimation {
  /**
   * @param {number} durationMs
   * @param {!Array<!CameraOrientation>} orientations
   */
  constructor(durationMs, orientations) {
    this.maxFrame = (60 / 1000) * durationMs;
    this.orientations = orientations;
    this.currentHeadingIndex = 0;
    this.currentFrame = 0;
    this.framesPerSection = this.maxFrame / (orientations.length - 1);
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
    if (
      this.currentHeadingIndex < 0 ||
      this.currentFrame == this.maxFrame - 1
    ) {
      // Animation ended.
      return null;
    }
    this.currentFrame++;
    const lastFrameOfCurrentSection =
      (this.currentHeadingIndex + 1) * this.framesPerSection;
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
    const toNext = this.orientations[this.currentHeadingIndex + 1];
    const from = this.orientations[this.currentHeadingIndex];
    if (!toNext) {
      // End of animation.
      this.currentHeadingIndex = -1;
      return null;
    }
    const easing = this.easeInOutQuad_(
      (this.currentFrame % this.framesPerSection) / this.framesPerSection
    );
    return new CameraOrientation(
      from.theta + (toNext.theta - from.theta) * easing,
      from.phi + (toNext.phi - from.phi) * easing,
      from.scale + (toNext.scale - from.scale) * easing
    );
  }
}

export class AmpStory360 extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!CameraOrientation>} */
    this.orientations_ = [];

    /** @private {number} */
    this.duration_ = 0;

    /** @private {?Element} */
    this.canvas_ = null;

    /** @private {?Renderer} */
    this.renderer_ = null;

    /** @private {?CameraAnimation} */
    this.animation_ = null;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isReady_ = false;
  }

  /** @override */
  buildCallback() {
    const attr = (name) => this.element.getAttribute(name);

    if (attr('duration')) {
      this.duration_ = timeStrToMillis(attr('duration')) || 0;
    }

    const startHeading = parseFloat(attr('heading-start') || 0);
    const startPitch = parseFloat(attr('pitch-start') || 0);
    const startZoom = parseFloat(attr('zoom-start') || 1);
    this.orientations_.push(
      CameraOrientation.fromDegrees(startHeading, startPitch, startZoom)
    );

    if (
      attr('heading-end') !== undefined ||
      attr('pitch-end') !== undefined ||
      attr('zoom-end') !== undefined
    ) {
      const endHeading = parseFloat(attr('heading-end') || startHeading);
      const endPitch = parseFloat(attr('pitch-end') || startPitch);
      const endZoom = parseFloat(attr('zoom-end') || startZoom);
      this.orientations_.push(
        CameraOrientation.fromDegrees(endHeading, endPitch, endZoom)
      );
    }

    const container = this.element.ownerDocument.createElement('div');
    this.canvas_ = this.element.ownerDocument.createElement('canvas');
    this.element.appendChild(container);
    container.appendChild(this.canvas_);
    this.applyFillContent(container, /* replacedContent */ true);

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        storeService.subscribe(
          StateProperty.PAGE_SIZE,
          this.resizeRenderer_.bind(this),
          false /* callToInitialize */
        );
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const button = buildPermissionButtonTemplate(this.element);
    this.element.appendChild(button);

    button.addEventListener('click', () => {
      onClick();
    });

    function onClick() {
      // feature detect
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            alert(permissionState);
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', () => {});
            }
          })
          .catch(alert.error);
      } else {
        // handle regular non iOS 13+ devices
      }
    }

    const ampImgEl = this.element.querySelector('amp-img');
    userAssert(ampImgEl, 'amp-story-360 must contain an amp-img element.');
    const owners = Services.ownersForDoc(this.element);
    owners.setOwner(ampImgEl, this.element);
    owners.scheduleLayout(this.element, ampImgEl);
    return whenUpgradedToCustomElement(ampImgEl)
      .then(() => {
        return ampImgEl.signals().whenSignal(CommonSignals.LOAD_END);
      })
      .then(
        () => {
          this.renderer_ = new Renderer(this.canvas_);
          this.renderer_.setImage(this.element.querySelector('img'));
          this.renderer_.resize();
          if (this.orientations_.length < 1) {
            return;
          }
          this.renderInitialPosition_();
          this.isReady_ = true;
          if (this.isPlaying_) {
            this.animate_();
          }
        },
        () => {
          user().error(TAG, 'Failed to load the amp-img.');
        }
      );
  }

  /** @private */
  resizeRenderer_() {
    this.mutateElement(() => {
      if (this.renderer_) {
        this.renderer_.resize();
        if (!this.isPlaying_) {
          this.renderer_.render(false);
        }
      }
    });
  }

  /** @private */
  renderInitialPosition_() {
    this.mutateElement(() => {
      this.renderer_.setCamera(
        this.orientations_[0].rotation,
        this.orientations_[0].scale
      );
      this.renderer_.render(false);
    });
  }

  /**
   * @return {boolean}
   */
  get canAnimate() {
    return this.duration_ > 0 && this.orientations_.length > 1;
  }

  /** @private */
  animate_() {
    if (!this.animation_) {
      this.animation_ = new CameraAnimation(this.duration_, this.orientations_);
    }
    const loop = () => {
      if (!this.isPlaying_ || !this.animation_) {
        this.renderer_.render(false);
        return;
      }
      const nextOrientation = this.animation_.getNextOrientation();
      if (nextOrientation) {
        // mutateElement causes inaccurate animation speed here, so we use rAF.
        this.win.requestAnimationFrame(() => {
          this.renderer_.setCamera(
            nextOrientation.rotation,
            nextOrientation.scale
          );
          this.renderer_.render(true);
          loop();
        });
      } else {
        this.isPlaying_ = false;
        this.renderer_.render(false);
        return;
      }
    };
    this.mutateElement(() => loop());
  }

  /** @public */
  pause() {
    this.isPlaying_ = false;
  }

  /** @public */
  play() {
    userAssert(
      this.canAnimate,
      'amp-story-360 is either not configured to play an animation or ' +
        'still loading content.'
    );
    this.isPlaying_ = true;
    if (this.isReady_) {
      this.animate_();
    }
  }

  /** @public */
  rewind() {
    if (!this.canAnimate) {
      return;
    }
    this.animation_ = null;
    // Let the animation loop exit, then render the initial position and resume
    // the animation (if applicable)
    if (this.isReady_) {
      this.win.requestAnimationFrame(() => {
        this.renderInitialPosition_();
        if (this.isPlaying_) {
          this.animate_();
        }
      });
    }
  }
}

AMP.extension('amp-story-360', '0.1', (AMP) => {
  AMP.registerElement('amp-story-360', AmpStory360, CSS);
});
