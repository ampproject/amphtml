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

/**
 * Must be served over https for permissions API to work.
 * For local development, run gulp --host="192.168.44.47" --https --extensions=amp-story-360
 */

import {
  Action,
  StateProperty,
  getStoreService,
} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {CSS} from '../../../build/amp-story-360-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Matrix, Renderer} from '../../../third_party/zuho/zuho';
import {Services} from '../../../src/services';
import {dev, user, userAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {timeStrToMillis} from '../../../extensions/amp-story/1.0/utils';
import {whenUpgradedToCustomElement} from '../../../src/dom';

/** @const {string} */
const TAG = 'AMP_STORY_360';

/**
 * Generates the template for the permission button.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildActivateButtonTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <button class="i-amphtml-story-360-activate-button" role="button">
      Activate
      <span class="i-amphtml-story-360-activate-button-icon"
        >360°
        <svg
          class="i-amphtml-story-360-activate-button-icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <defs>
            <linearGradient id="gradient">
              <stop stop-color="white" stop-opacity=".3"></stop>
              <stop offset="1" stop-color="white"></stop>
            </linearGradient>
          </defs>
          <ellipse
            ry="11.5"
            rx="7.5"
            cy="12"
            cx="12"
            stroke="url(#gradient)"
          ></ellipse>
          <ellipse
            ry="11.5"
            rx="7.5"
            cy="12"
            cx="12"
            stroke="url(#gradient)"
            transform="rotate(90, 12, 12)"
          ></ellipse>
        </svg>
      </span>
    </button>
  `;
};

/**
 * Generates the template for the permission dialog box.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildPermissionDialogBoxTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-360-permissions-dialog i-amphtml-story-360-permissions-dialog-hidden"
    >
      <p>
        This immersive story requires access to your devices motion sensors.
      </p>
      <div class="i-amphtml-story-360-permissions-dialog-button-container">
        <button data-action="disable" role="button">disable</button>
        <button data-action="enable" role="button">enable</button>
      </div>
    </div>
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

    /** @private {boolean} */
    this.gyroscopeControls_ = false;

    /** @private @const {!../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
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

    this.element.getAttribute('controls') === 'gyroscope' &&
      this.checkGyroscopePermissions_();

    this.initializeListeners_();
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.GYROSCOPE_ENABLED_STATE,
      (enabled) => enabled && this.enableGyroscope_()
    );

    this.storeService_.subscribe(StateProperty.PAGE_SIZE, () =>
      this.resizeRenderer_()
    );
  }

  /** @private */
  checkGyroscopePermissions_() {
    // If gyroscope isn't supported, keep animating.
    if (typeof DeviceOrientationEvent === 'undefined') {
      return;
    }

    // If motion and no permissions like android, enable gyro right away.
    if (typeof DeviceOrientationEvent.requestPermission === 'undefined') {
      this.enableGyroscope_();
    }

    // If motion and permissions (like ios) build permission interface to ask user.
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      this.buildPermissionUI_();
    }
  }

  /**
   * Creates a device orientation listener and sets gyroscopeControls state.
   * Removes the listener and resumes animation if listener is not called in 1000ms.
   * @private
   */
  enableGyroscope_() {
    this.gyroscopeControls_ = true;

    this.mutateElement(() => {
      this.element.classList.add('i-amphtml-story-360-hide-permissions-ui');
    });

    this.win.addEventListener('deviceorientation', (e) => {
      this.isReady_ && this.onDeviceOrientation_(e);
      // If this listener is called, device is in motion and checkNoMotion is cleared.
      clearTimeout(checkNoMotion);
    });

    // If device isn't moving cancel gyroscope controls and resume animating.
    // This happens with desktop browsers that have the motion API but are stationary.
    const checkNoMotion = setTimeout(() => {
      this.gyroscopeControls_ = false;
      this.mutateElement(() => {
        this.element.classList.remove(
          'i-amphtml-story-360-hide-permissions-ui'
        );
      });
      this.animate_();
    }, 1000);
  }

  /**
   * @param {Event} e
   * @private
   */
  onDeviceOrientation_(e) {
    let rot = Matrix.identity(3);
    rot = Matrix.mul(
      3,
      Matrix.rotation(3, 1, 0, (Math.PI / 180.0) * e.alpha),
      rot
    );
    rot = Matrix.mul(
      3,
      Matrix.rotation(3, 2, 1, (Math.PI / 180.0) * e.beta),
      rot
    );
    rot = Matrix.mul(
      3,
      Matrix.rotation(3, 0, 2, (Math.PI / 180.0) * e.gamma),
      rot
    );
    this.renderer_.setCamera(rot, 1);
    this.renderer_.render(true);
  }

  /**
   * Creates a "activate" button and prompt to request DeviceOrientation permissions.
   * Only built if device has motion sensors and needs permission.
   * @private
   */
  buildPermissionUI_() {
    const activateButton = buildActivateButtonTemplate(this.element);
    this.element.appendChild(activateButton);

    const dialogBox = buildPermissionDialogBoxTemplate(this.element);
    this.element.appendChild(dialogBox);

    activateButton.addEventListener('click', () => {
      this.mutateElement(() => {
        dialogBox.classList.toggle(
          'i-amphtml-story-360-permissions-dialog-hidden'
        );
      });
    });

    dialogBox.addEventListener('click', (e) => {
      dev().assertElement(e.target).dataset['action'] === 'enable' &&
        this.requestGyroscopePermissions_();

      this.mutateElement(() => {
        dialogBox.classList.add(
          'i-amphtml-story-360-permissions-dialog-hidden'
        );
      });
    });
  }

  /**
   * Requests permission to the gyroscope sensor.
   * Emits an event on "granted" to update all 360 components in the story.
   * @private
   */
  requestGyroscopePermissions_() {
    if (this.win.DeviceOrientationEvent.requestPermission) {
      this.win.DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            this.storeService_.dispatch(Action.TOGGLE_GYROSCOPE, true);
          } else if (permissionState === 'denied') {
            // TODO: handle if user denied permissions in same window.
            this.element.classList.add(
              'i-amphtml-story-360-hide-permissions-ui'
            );
          }
        })
        .catch((error) => {
          dev().error(error.message);
        });
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
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
      if (!this.isPlaying_ || !this.animation_ || this.gyroscopeControls_) {
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
