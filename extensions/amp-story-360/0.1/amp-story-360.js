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
import {listenOncePromise} from '../../../src/event-helper';
import {timeStrToMillis} from '../../../extensions/amp-story/1.0/utils';

/** @const {string} */
const TAG = 'AMP_STORY_360';

/**
 * readyState for first rendrable frame of video element.
 * @const {number}
 */
const HAVE_CURRENT_DATA = 2;

/**
 * Centers heading and pitch value between [-90; 90]
 * @const {number}
 */
const CENTER_OFFSET = 90;

/**
 * Min value for WebGL context to be active.
 * @const {number}
 */
const MIN_WEBGL_DISTANCE = 3;

/**
 * Generates the template for the permission button.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildActivateButtonTemplate = (element) => htmlFor(element)`
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

/**
 * Generates the template for the gyroscope feature discovery animation.
 *
 * NOTE: i-amphtml-story-360-discovery is used in maybeShowDiscoveryAnimation_
 * and must be changed in both places if updated.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildDiscoveryTemplate = (element) => htmlFor(element)`
    <div class="i-amphtml-story-360-discovery" aria-live="polite">
      <div class="i-amphtml-story-360-discovery-animation"></div>
      <span class="i-amphtml-story-360-discovery-text" aria-hidden="true">
        Move device to explore
      </span>
    </div>
  `;

/**
 * @param {number} deg
 * @return {number}
 * */
function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

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
    return new CameraOrientation(
      deg2rad(-pitch - CENTER_OFFSET),
      deg2rad(CENTER_OFFSET + heading),
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

    /** @private {?Element} */
    this.activateButton_ = null;

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

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

    /** @private {?Element|?EventTarget} */
    this.ampVideoEl_ = null;

    /** @private {number} */
    this.orientationAlpha_ = 0;

    /** @private {number} */
    this.headingOffset_ = 0;

    this.lostGlContext_ = null;
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

    // Initialize all services before proceeding
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;

        storeService.subscribe(StateProperty.PAGE_SIZE, () =>
          this.resizeRenderer_()
        );

        if (attr('controls') === 'gyroscope') {
          storeService.subscribe(
            StateProperty.GYROSCOPE_PERMISSION_STATE,
            (permissionState) => this.onPermissionState_(permissionState)
          );
          this.checkGyroscopePermissions_();
        }

        storeService.subscribe(StateProperty.CURRENT_PAGE_ID, (currPageId) => {
          this.isOnActivePage_ = currPageId === this.getPageId_();
          this.onPageNavigation_();
          this.maybeShowDiscoveryAnimation_();
          this.maybeSetGyroscopeDefaultHeading_();
          this.maybeActivateGlContext_();
        });

        this.storeService_.subscribe(StateProperty.PAUSED_STATE, (isPaused) => {
          isPaused ? this.pause_() : this.play_();
        });
      }),

      Services.localizationServiceForOrNull(this.element).then(
        (localizationService) => {
          this.localizationService_ = localizationService;
        }
      ),
    ]).then(() => Promise.resolve());
  }

  /**
   * @private
   * @return {string} the page id
   */
  getPageId_() {
    if (this.pageId_ == null) {
      this.pageId_ = this.getPage_().getAttribute('id');
    }
    return this.pageId_;
  }

  /**
   * @private
   * @return {?Element} the parent amp-story-page
   */
  getPage_() {
    return closest(
      dev().assertElement(this.element),
      (el) => el.tagName.toLowerCase() === 'amp-story-page'
    );
  }

  /** @private */
  onPageNavigation_() {
    if (this.isOnActivePage_) {
      this.play_();
    } else {
      this.pause_();
      this.rewind_();
    }
  }

  /** @private */
  maybeActivateGlContext_() {
    const distance = this.getPage_().getAttribute('distance');
    if (distance && this.isReady_) {
      if (parseInt(distance, 10) < MIN_WEBGL_DISTANCE) {
        if (this.renderer_.gl.isContextLost()) {
          this.lostGlContext_.restoreContext();
        }
      } else if (!this.renderer_.gl.isContextLost()) {
        this.lostGlContext_.loseContext();
      }
    }
  }

  /**
   * @param {string} permissionState
   * @private
   */
  onPermissionState_(permissionState) {
    if (this.activateButton_) {
      this.mutateElement(() => {
        this.getPage_().removeChild(this.activateButton_);
        this.activateButton_ = null;
      });
    }
    if (permissionState === 'granted') {
      this.enableGyroscope_();
    } else if (permissionState === 'denied') {
      this.gyroscopeControls_ = false;
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
   * Listens for deviceorientation events.
   *
   * Some browsers support the 'deviceorientation' event but never call it.
   * This waits for one call before initiating a constant listener.
   * @private
   */
  enableGyroscope_() {
    // Listen for one call before initiating.
    listenOncePromise(this.win, 'deviceorientation').then((e) => {
      this.gyroscopeControls_ = true;
      this.orientationAlpha_ = e.alpha;
      this.maybeSetGyroscopeDefaultHeading_();
      // Debounce onDeviceOrientation_ to rAF.
      let rafTimeout;
      this.win.addEventListener('deviceorientation', (e) => {
        // Used to set default heading when navigating to this page.
        this.orientationAlpha_ = e.alpha;
        if (this.isReady_ && this.isOnActivePage_) {
          rafTimeout && this.win.cancelAnimationFrame(rafTimeout);
          rafTimeout = this.win.requestAnimationFrame(() =>
            this.onDeviceOrientation_(e)
          );
        }
      });
      this.maybeShowDiscoveryAnimation_();
    });
  }

  /**
   * Ensures user is facing a specified point of interest.
   * @private
   */
  maybeSetGyroscopeDefaultHeading_() {
    if (this.isOnActivePage_ && this.gyroscopeControls_ && this.isReady_) {
      this.headingOffset_ =
        parseFloat(
          this.element.getAttribute('heading-end') ||
            this.element.getAttribute('heading-start') ||
            0
        ) +
        CENTER_OFFSET +
        this.orientationAlpha_;
    }
  }

  /**
   * Only show once per story on first instance of 360 component.
   * @private
   */
  maybeShowDiscoveryAnimation_() {
    if (
      this.isOnActivePage_ &&
      this.gyroscopeControls_ &&
      !this.element.ownerDocument.querySelector(
        `.i-amphtml-story-360-discovery`
      )
    ) {
      const page = this.getPage_();
      const discoveryTemplate = page && buildDiscoveryTemplate(page);
      this.mutateElement(() => page.appendChild(discoveryTemplate));
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  onDeviceOrientation_(e) {
    let rot = Matrix.identity(3);
    rot = Matrix.mul(
      3,
      Matrix.rotation(3, 1, 0, deg2rad(e.alpha - this.headingOffset_)),
      rot
    );
    rot = Matrix.mul(3, Matrix.rotation(3, 2, 1, deg2rad(e.beta)), rot);
    rot = Matrix.mul(3, Matrix.rotation(3, 0, 2, deg2rad(e.gamma)), rot);
    this.renderer_.setCamera(rot, 1);
    this.renderer_.render(true);
  }

  /**
   * A button to ask for permissons.
   * @private
   */
  renderActivateButton_() {
    const ampStoryPage = this.getPage_();
    this.activateButton_ =
      ampStoryPage && buildActivateButtonTemplate(ampStoryPage);

    this.activateButton_.querySelector(
      '.i-amphtml-story-360-activate-text'
    ).textContent = this.localizationService_.getLocalizedString(
      LocalizedStringId.AMP_STORY_ACTIVATE_BUTTON_TEXT
    );

    this.activateButton_.addEventListener('click', () =>
      this.requestGyroscopePermissions_()
    );

    this.mutateElement(() => ampStoryPage.appendChild(this.activateButton_));
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
    const MAX_TEXTURE_SIZE = this.renderer_.gl.getParameter(
      this.renderer_.gl.MAX_TEXTURE_SIZE
    );

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
    // Used to update the video in animate_.
    this.ampVideoEl_ = this.element.querySelector('amp-video');

    userAssert(
      ampImgEl || this.ampVideoEl_,
      'amp-story-360 must contain an amp-img or amp-video element.'
    );

    if (ampImgEl) {
      return this.setupAmpImgRenderer_(ampImgEl);
    }
    if (this.ampVideoEl_) {
      return this.setupAmpVideoRenderer_();
    }
  }

  /**
   * @param {!Element} ampImgEl
   * @return {!Promise}
   * @private
   */
  setupAmpImgRenderer_(ampImgEl) {
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
          this.renderer_.init();
          this.setUpCanvasGlListeners_();
          this.image_ = this.checkImageReSize_(
            dev().assertElement(this.element.querySelector('img'))
          );
          this.renderer_.setImageOrientation(
            this.sceneHeading_,
            this.scenePitch_,
            this.sceneRoll_
          );
          this.renderer_.setImage(this.image_);
          this.renderer_.resize();
          if (this.orientations_.length < 1) {
            return;
          }
          this.renderInitialPosition_();
          this.isReady_ = true;
          if (this.gyroscopeControls_) {
            this.maybeSetGyroscopeDefaultHeading_();
          }
          if (this.isPlaying_) {
            this.animate_();
          }
        },
        () => {
          user().error(TAG, 'Failed to load the amp-img.');
        }
      );
  }

  /**
   * @return {!Promise}
   * @private
   */
  setupAmpVideoRenderer_() {
    return whenUpgradedToCustomElement(dev().assertElement(this.ampVideoEl_))
      .then(() => {
        return this.ampVideoEl_.signals().whenSignal(CommonSignals.LOAD_END);
      })
      .then(() => {
        const alreadyHasData =
          dev().assertElement(this.ampVideoEl_.querySelector('video'))
            .readyState >= HAVE_CURRENT_DATA;

        return alreadyHasData
          ? Promise.resolve()
          : listenOncePromise(this.ampVideoEl_, 'loadeddata');
      })
      .then(
        () => {
          this.renderer_ = new Renderer(this.canvas_);
          this.setUpCanvasGlListeners_();

          this.renderer_.init();
          this.renderer_.setImageOrientation(
            this.sceneHeading_,
            this.scenePitch_,
            this.sceneRoll_
          );
          this.renderer_.setImage(
            dev().assertElement(this.ampVideoEl_.querySelector('video'))
          );
          this.renderer_.resize();
          if (this.orientations_.length < 1) {
            return;
          }
          this.renderInitialPosition_();
          this.isReady_ = true;
          if (this.gyroscopeControls_) {
            this.maybeSetGyroscopeDefaultHeading_();
          }
          if (this.isPlaying_) {
            this.animate_();
          }
        },
        () => {
          user().error(TAG, 'Failed to load the amp-video.');
        }
      );
  }

  /** @private */
  setUpCanvasGlListeners_() {
    this.lostGlContext_ = this.renderer_.gl.getExtension('WEBGL_lose_context');
    this.renderer_.canvas.addEventListener('webglcontextlost', (e) => {
      console.log('context lost');
      e.preventDefault();
    });
    this.renderer_.canvas.addEventListener('webglcontextrestored', () => {
      console.log('context restored');
      this.renderer_.init();
      if (this.ampVideoEl_) {
        this.renderer_.setImage(
          dev().assertElement(this.ampVideoEl_.querySelector('video'))
        );
      } else {
        this.renderer_.setImage(this.image_);
      }
    });
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
    if (this.gyroscopeControls_) {
      return;
    }
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
      // mutateElement causes inaccurate animation speed here, so we use rAF.
      this.win.requestAnimationFrame(() => {
        // Stop loop if no next orientation and not a video.
        if (!nextOrientation && !this.ampVideoEl_) {
          this.isPlaying_ = false;
          this.renderer_.render(false);
          return;
        }
        // Only apply next orientation if not in gyroscope mode.
        if (nextOrientation && !this.gyroscopeControls_) {
          this.renderer_.setCamera(
            nextOrientation.rotation,
            nextOrientation.scale
          );
        }
        // If video, check if ready and copy the texture on each frame.
        if (this.ampVideoEl_) {
          const videoEl = dev().assertElement(
            this.ampVideoEl_.querySelector('video')
          );
          if (videoEl.readyState >= HAVE_CURRENT_DATA) {
            this.renderer_.setImage(videoEl);
          }
        }
        this.renderer_.render(true);
        loop();
      });
    };
    this.mutateElement(() => loop());
  }

  /** @private */
  pause_() {
    this.isPlaying_ = false;
  }

  /** @private */
  play_() {
    if (!this.canAnimate) {
      return;
    }
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

  /** @private */
  rewind_() {
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
