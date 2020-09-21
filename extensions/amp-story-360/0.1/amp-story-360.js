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
} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {CSS} from '../../../build/amp-story-360-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Matrix, Renderer} from '../../../third_party/zuho/zuho';
import {Services} from '../../../src/services';
import {closest, whenUpgradedToCustomElement} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {timeStrToMillis} from '../../../extensions/amp-story/1.0/utils';

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
      <span class="i-amphtml-story-360-activate-text"></span>
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
            <linearGradient id="i-amphtml-story-360-activate-gradient">
              <stop stop-color="white" stop-opacity=".3"></stop>
              <stop offset="1" stop-color="white"></stop>
            </linearGradient>
            <ellipse
              id="i-amphtml-story-360-activate-ellipse"
              ry="11.5"
              rx="7.5"
              cy="12"
              cx="12"
              stroke="url(#i-amphtml-story-360-activate-gradient)"
            ></ellipse>
          </defs>
          <use xlink:href="#i-amphtml-story-360-activate-ellipse"></use>
          <use
            xlink:href="#i-amphtml-story-360-activate-ellipse"
            transform="rotate(90, 12, 12)"
          ></use>
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

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

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

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win);

    /** @private {?string} */
    this.pageId_ = null;

    /** @private {boolean} */
    this.isOnActivePage_ = false;

    /** @private {number} */
    this.sceneHeading_ = 0;

    /** @private {number} */
    this.scenePitch_ = 0;

    /** @private {number} */
    this.sceneRoll_ = 0;
  }

  /** @override */
  buildCallback() {
    const attr = (name) => this.element.getAttribute(name);
    const attrAsFloat = (name, fallbackValue = 0) => {
      return parseFloat(attr(name) || fallbackValue);
    };

    if (attr('duration')) {
      this.duration_ = timeStrToMillis(attr('duration')) || 0;
    }

    const startHeading = attrAsFloat('heading-start');
    const startPitch = attrAsFloat('pitch-start');
    const startZoom = attrAsFloat('zoom-start', 1);
    this.orientations_.push(
      CameraOrientation.fromDegrees(startHeading, startPitch, startZoom)
    );

    if (
      attr('heading-end') !== undefined ||
      attr('pitch-end') !== undefined ||
      attr('zoom-end') !== undefined
    ) {
      const endHeading = attrAsFloat('heading-end', startHeading);
      const endPitch = attrAsFloat('pitch-end', startPitch);
      const endZoom = attrAsFloat('zoom-end', startZoom);
      this.orientations_.push(
        CameraOrientation.fromDegrees(endHeading, endPitch, endZoom)
      );
    }

    if (
      attr('scene-heading') !== undefined ||
      attr('scene-pitch') !== undefined ||
      attr('scene-roll') !== undefined
    ) {
      this.sceneHeading_ = attrAsFloat('scene-heading');
      this.scenePitch_ = attrAsFloat('scene-pitch');
      this.sceneRoll_ = attrAsFloat('scene-roll');
    }

    const container = this.element.ownerDocument.createElement('div');
    this.canvas_ = this.element.ownerDocument.createElement('canvas');
    this.element.appendChild(container);
    container.appendChild(this.canvas_);
    this.applyFillContent(container, /* replacedContent */ true);

    this.renderer_ = new Renderer(this.canvas_);
    this.renderer_.resize();

    // Initialize all services before proceeding
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;

        storeService.subscribe(StateProperty.PAGE_SIZE, () =>
          this.resizeRenderer_()
        );

        storeService.subscribe(
          StateProperty.GYROSCOPE_PERMISSION_STATE,
          (permissionState) => this.onPermissionState_(permissionState)
        );

        storeService.subscribe(StateProperty.CURRENT_PAGE_ID, (currPageId) => {
          this.isOnActivePage_ = currPageId === this.getPageId_();
        });
      }),

      Services.localizationServiceForOrNull(this.element).then(
        (localizationService) => {
          this.localizationService_ = localizationService;
        }
      ),
    ]).then(() => {
      attr('controls') === 'gyroscope' && this.checkGyroscopePermissions_();
      return Promise.resolve();
    });
  }

  /**
   * @private
   * @return {string} the page id
   */
  getPageId_() {
    if (this.pageId_ == null) {
      this.pageId_ = closest(dev().assertElement(this.element), (el) => {
        return el.tagName.toLowerCase() === 'amp-story-page';
      }).getAttribute('id');
    }
    return this.pageId_;
  }

  /**
   * @param {string} permissionState
   * @private
   */
  onPermissionState_(permissionState) {
    if (permissionState === 'granted') {
      this.enableGyroscope_();
    } else if (permissionState === 'denied') {
      this.gyroscopeControls_ = false;
      this.togglePermissionClass_(true);
    }
  }

  /** @private */
  checkGyroscopePermissions_() {
    //  If browser doesn't support DeviceOrientationEvent.
    if (typeof this.win.DeviceOrientationEvent === 'undefined') {
      return;
    }

    // If browser doesn't require permission for DeviceOrientationEvent.
    if (
      typeof this.win.DeviceOrientationEvent.requestPermission === 'undefined'
    ) {
      this.enableGyroscope_();
    }

    // If permissions needed for DeviceOrientationEvent.
    if (
      typeof this.win.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      this.win.DeviceOrientationEvent.requestPermission()
        .catch(() => {
          // If permissions weren't set, render activate button.
          this.renderActivateButton_();
        })
        .then((permissionState) => {
          // If permissions already set, set permission state.
          permissionState && this.setPermissionState_(permissionState);
        });
    }
  }

  /**
   * Creates a device orientation listener and sets gyroscopeControls_ state.
   * If listener is not called in 1000ms, remove listener and resume animation.
   * This happens on desktop browsers that support deviceorientation but aren't in motion.
   * @private
   */
  enableGyroscope_() {
    this.gyroscopeControls_ = true;
    this.togglePermissionClass_(true);

    const checkNoMotion = this.timer_.delay(() => {
      this.gyroscopeControls_ = false;
      if (this.isReady_ && this.isPlaying_) {
        this.animate_();
      }
    }, 1000);

    let rafTimeout;

    this.win.addEventListener('deviceorientation', (e) => {
      if (this.isReady_ && this.isOnActivePage_) {
        // Debounce onDeviceOrientation_ to rAF.
        rafTimeout && this.win.cancelAnimationFrame(rafTimeout);
        rafTimeout = this.win.requestAnimationFrame(() =>
          this.onDeviceOrientation_(e)
        );
      }
      this.timer_.cancel(checkNoMotion);
    });
  }

  /**
   * @param {!Event} e
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
    !this.ampVideoEl_ && this.renderer_.render(true);
  }

  /**
   * A button to ask for permissons.
   * @private
   */
  renderActivateButton_() {
    const activateButton = buildActivateButtonTemplate(this.element);

    activateButton.querySelector(
      '.i-amphtml-story-360-activate-text'
    ).textContent = this.localizationService_.getLocalizedString(
      LocalizedStringId.AMP_STORY_ACTIVATE_BUTTON_TEXT
    );

    activateButton.addEventListener('click', () =>
      this.requestGyroscopePermissions_()
    );

    this.mutateElement(() => this.element.appendChild(activateButton));
  }

  /** @private */
  requestGyroscopePermissions_() {
    if (this.win.DeviceOrientationEvent.requestPermission) {
      this.win.DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          this.setPermissionState_(permissionState);
        })
        .catch((error) => {
          dev().error(TAG, `Gyroscope permission error: ${error.message}`);
        });
    }
  }

  /**
   * @param {string} permissionState
   * @private
   */
  setPermissionState_(permissionState) {
    if (permissionState === 'granted') {
      this.storeService_.dispatch(Action.SET_GYROSCOPE_PERMISSION, 'granted');
    } else if (permissionState === 'denied') {
      this.storeService_.dispatch(Action.SET_GYROSCOPE_PERMISSION, 'denied');
    }
  }

  /**
   * Toggles class on amp-story to show or hide activate button.
   * @param {boolean} hidePermissionButton
   * @private
   */
  togglePermissionClass_(hidePermissionButton) {
    this.mutateElement(() => {
      this.element.classList.toggle(
        'i-amphtml-story-360-hide-permissions-ui',
        hidePermissionButton
      );
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Checks if the image is larger than the GPUs max texture size.
   * Scales the image down if neededed.
   * Returns the image element if image is within bounds.
   * If image is out of bounds, returns a scaled canvas element.
   * @param {!Element} imgEl
   * @return {!Element}
   * @private
   */
  checkImageReSize_(imgEl) {
    const canvasForGL = document.createElement('canvas');
    const gl = canvasForGL.getContext('webgl');
    const MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    if (
      imgEl.naturalWidth > MAX_TEXTURE_SIZE ||
      imgEl.naturalHeight > MAX_TEXTURE_SIZE
    ) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.min(imgEl.naturalWidth, MAX_TEXTURE_SIZE);
      canvas.height = Math.min(imgEl.naturalHeight, MAX_TEXTURE_SIZE);
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      return canvas;
    } else {
      return imgEl;
    }
  }

  /** @override */
  layoutCallback() {
    const ampImgEl = this.element.querySelector('amp-img');
    this.ampVideoEl_ = this.element.querySelector('amp-video');
    userAssert(
      ampImgEl || this.ampVideoEl_,
      'amp-story-360 must contain an amp-img or amp-video element.'
    );

    if (this.ampVideoEl_) {
      return whenUpgradedToCustomElement(this.ampVideoEl_)
        .then(() => {
          return this.ampVideoEl_.signals().whenSignal(CommonSignals.LOAD_END);
        })
        .then(() => {
          listen(
            this.ampVideoEl_,
            'playing',
            () => {
              this.renderer_.setImage(
                dev().assertElement(this.ampVideoEl_.querySelector('video'))
              );
              if (this.orientations_.length < 1) {
                return;
              }
              this.renderInitialPosition_();
              this.renderer_.setImageOrientation(
                this.sceneHeading_,
                this.scenePitch_,
                this.sceneRoll_
              );
              this.isReady_ = true;
              if (this.isPlaying_) {
                this.animate_();
              }
            },
            () => {
              user().error(TAG, 'Failed to load the amp-video.');
            }
          );
        });
    }

    if (ampImgEl) {
      const owners = Services.ownersForDoc(this.element);
      owners.setOwner(ampImgEl, this.element);
      owners.scheduleLayout(this.element, ampImgEl);
      return whenUpgradedToCustomElement(ampImgEl)
        .then(() => {
          return ampImgEl.signals().whenSignal(CommonSignals.LOAD_END);
        })
        .then(
          () => {
            const img = this.checkImageReSize_(
              dev().assertElement(this.element.querySelector('img'))
            );
            this.renderer_.setImage(img);
            if (this.orientations_.length < 1) {
              return;
            }
            this.renderInitialPosition_();
            this.renderer_.setImageOrientation(
              this.sceneHeading_,
              this.scenePitch_,
              this.sceneRoll_
            );
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
    if (!this.animation_ && !this.gyroscopeControls_) {
      this.animation_ = new CameraAnimation(this.duration_, this.orientations_);
    }

    const renderLoop = () => {
      if (
        !this.isPlaying_ ||
        (!this.animation_ && !this.ampVideoEl_) ||
        (this.gyroscopeControls_ && !this.ampVideoEl_)
      ) {
        this.renderer_.render(false);
        return;
      }

      const nextOrientation =
        !this.gyroscopeControls_ && this.animation_.getNextOrientation();

      // mutateElement causes inaccurate animation speed here, so we use rAF.
      this.win.requestAnimationFrame(() => {
        if (nextOrientation) {
          this.renderer_.setCamera(
            nextOrientation.rotation,
            nextOrientation.scale
          );
        }

        if (this.ampVideoEl_) {
          this.renderer_.setImage(
            dev().assertElement(this.ampVideoEl_.querySelector('video'))
          );
        }

        if (!nextOrientation && !this.ampVideoEl_) {
          this.isPlaying_ = false;
          this.renderer_.render(false);
          return;
        }

        this.renderer_.render(true);
        renderLoop();
      });
    };

    this.mutateElement(() => renderLoop());
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
    // the animation (if applicable).
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
