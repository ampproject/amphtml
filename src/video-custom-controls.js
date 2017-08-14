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

import {Animation} from './animation';
import {dev} from './log';
import {listen} from './event-helper';
import {Services} from './services';
import {VideoEvents} from './video-interface';
import {formatTime} from './utils/datetime';
import * as st from './style';
import * as tr from './transition';


/**
 * CustomControls is a class that given a video manager entry
 * ({@link ./service/video-manager-impl.VideoEntry}), adds an overlay of
 * customizable controls to the video element and manages their behavior.
 */
export class CustomControls {

  /**
   * Initializes variables and creates the custom controls
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!./service/video-manager-impl.VideoEntry} entry
   * @param {boolean} darkSkin whether to use dark or light theme
   * @param {string} mainCtrls list of controls to add to the main bar
   * @param {string} miniCtrls list of controls to add to the minimized overlay
   * @param {string} floating single control button to use as the main action
   */
  constructor(
    ampdoc,
    entry,
    darkSkin = false,
    mainCtrls = ['time', 'spacer', 'volume', 'fullscreen'],
    miniCtrls = ['play', 'volume', 'fullscreen'],
    floating = 'play'
  ) {

    /** @private {!./service/ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = ampdoc;

    /** @private {!./service/video-manager-impl.VideoEntry} */
    this.entry_ = entry;

    /** @private @const {!./service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private {boolean} */
    this.darkSkin_ = darkSkin;

    /** @private {?Element} */
    this.ctrlContainer_ = null;

    /** @private {?Element} */
    this.ctrlBarContainer_ = null;

    /** @private {?Element} */
    this.ctrlBarWrapper_ = null;

    /** @private {?Element} */
    this.floatingContainer_ = null;

    /** @private {?Element} */
    this.miniCtrlsContainer_ = null;

    /** @private {?Element} */
    this.miniCtrlsWrapper_ = null;

    /** @private {?Element} */
    this.ctrlBg_ = null;

    /** @private {?number} */
    this.controlsTimer_ = null;

    /** @private {boolean} */
    this.controlsShown_ = true;

    /** @private {boolean} */
    this.controlsShowing_ = false;

    /** @private {boolean} */
    this.controlsDisabled_ = false;

    /** @private {boolean} */
    this.minimal_ = false;

    this.createCustomControls_(mainCtrls, miniCtrls, floating);
  }

  /**
   * Returns the element that wraps all the controls
   * @return {!Element}
   */
  getElement() {
    return dev.assertElement(this.ctrlContainer_);
  }

  /**
   * Fullscreen Button
   * @return {!Element}
   * @private
   */
  createFullscreenBtn_() {
    const doc = this.ampdoc_.win.document;
    const fsBtnWrap = doc.createElement('amp-custom-controls-icon-wrapper');
    fsBtnWrap.classList.add('amp-custom-controls-fullscreen');
    const fsBtn = this.createIcon_('fullscreen');
    fsBtnWrap.appendChild(fsBtn);
    listen(fsBtnWrap, 'click', () => {
      if (this.entry_.video.isFullscreen()) {
        this.entry_.video.fullscreenExit();
      } else {
        this.entry_.video.fullscreenEnter();
      }
    });
    return fsBtnWrap;
  }

  /**
   * Volume controls
   * @return {!Element}
   * @private
   */
  createVolumeControls_() {
    const doc = this.ampdoc_.win.document;
    const volumeContainer = doc.createElement('amp-custom-controls-volume');
    const volumeSlider = doc.createElement('input');
    volumeSlider.setAttribute('type', 'range');
    volumeSlider.setAttribute('min', '0');
    volumeSlider.setAttribute('max', '100');
    volumeSlider.setAttribute('value', '30');
    volumeSlider.classList.add('amp-custom-controls-volume-indicator');
    const muteBtnWrap = doc.createElement('amp-custom-controls-icon-wrapper');
    muteBtnWrap.classList.add('amp-custom-controls-mute');
    const muteBtn = this.createIcon_(
        this.entry_.isMuted() ? 'mute' : 'volume-max'
    );
    muteBtnWrap.appendChild(muteBtn);
    volumeContainer.appendChild(muteBtnWrap);
    volumeContainer.appendChild(volumeSlider);
    listen(muteBtnWrap, 'click', () => {
      if (this.entry_.isMuted()) {
        this.entry_.video.unmute();
      } else {
        this.entry_.video.mute();
      }
    });
    [VideoEvents.MUTED, VideoEvents.UNMUTED].forEach(e => {
      listen(this.entry_.video.element, e, () => {
        if (e == VideoEvents.MUTED) {
          this.changeIcon_(muteBtn, 'mute');
        } else {
          this.changeIcon_(muteBtn, 'volume-max');
        }
      });
    });
    return volumeContainer;
  }

  /**
   * Spacer that separates the left/right portions of the controls bar
   * @return {!Element}
   * @private
   */
  createSpacer_() {
    const doc = this.ampdoc_.win.document;
    const spacer = doc.createElement('amp-custom-controls-spacer');
    return spacer;
  }

  /**
   * Play/Pause Button
   * @param {?Element|string} loadingElement
   * @return {!Element}
   * @private
   */
  createPlayPauseBtn_(loadingElement) {
    const doc = this.ampdoc_.win.document;
    const playpauseBtnWrap = doc.createElement('amp-custom-controls-icon-wrapper');
    playpauseBtnWrap.classList.add('amp-custom-controls-playpause');
    const playpauseBtn = this.createIcon_('play');
    playpauseBtnWrap.appendChild(playpauseBtn);
    if (loadingElement == 'self') {
      loadingElement = playpauseBtnWrap;
    }
    listen(playpauseBtnWrap, 'click', () => {
      if (this.entry_.isPlaying()) {
        this.changeIcon_(playpauseBtn, 'play');
        this.entry_.video.pause();
      } else {
        this.changeIcon_(playpauseBtn, 'pause');
        this.entry_.video.play(/*autoplay*/ false);
        loadingElement.classList.toggle('amp-custom-controls-loading', true);
      }
    });
    [VideoEvents.PLAYING, VideoEvents.PAUSE].forEach(e => {
      listen(this.entry_.video.element, e, () => {
        loadingElement.classList.toggle('amp-custom-controls-loading', false);
        if (e == VideoEvents.PAUSE) {
          this.changeIcon_(playpauseBtn, 'play');
          this.showControls();
          if (this.controlsTimer_) {
            clearTimeout(this.controlsTimer_);
          }
        } else {
          this.changeIcon_(playpauseBtn, 'pause');
        }
      });
    });
    return playpauseBtnWrap;
  }

  /**
   * Duration/Played time indicator
   * @return {!Element}
   * @private
   */
  createProgressTime_() {
    const doc = this.ampdoc_.win.document;
    const progressTime = doc.createElement('amp-custom-controls-progress-time');
    progressTime./*OK*/innerText = '0:00 / 0:00';
    // Update played time
    const updateProgress = () => {
      const current = this.entry_.video.getCurrentTime() || 0;
      const currentFormatted = formatTime(current);
      const total = this.entry_.video.getDuration() || 0;
      const totalFormatted = formatTime(total);
      progressTime./*OK*/innerText = currentFormatted + ' / ' + totalFormatted;
    };

    [VideoEvents.TIME_UPDATE, VideoEvents.LOAD].forEach(e => {
      listen(this.entry_.video.element, e, updateProgress.bind(this));
    });

    return progressTime;
  }

  /**
   * Progress bar
   * @return {!Element}
   * @private
   */
  createProgressBar_() {
    const doc = this.ampdoc_.win.document;
    const progressBar = doc.createElement('amp-custom-controls-progress-bar');
    const totalBar = doc.createElement('amp-custom-controls-total-bar');
    const currentBar = doc.createElement('amp-custom-controls-current-bar');
    const scrubber = doc.createElement('amp-custom-controls-scrubber');
    let scrubberTouched = false;
    let scrubberDragging = false;
    totalBar.appendChild(currentBar);
    totalBar.appendChild(scrubber);
    progressBar.appendChild(totalBar);
    let size = null;
    // Seek
    listen(totalBar, 'click', e => {
      // TODO(@wassgha) Seek when implemented
      if (!size) {
        size = progressBar./*OK*/getBoundingClientRect();
      }
      const left = size.left;
      const total = size.width;
      const newPercent = Math.min(100,
          Math.max(0, 100 * (e.clientX - left) / total)
      );
      st.setStyles(scrubber, {
        'left': st.percent(newPercent),
      });
      st.setStyles(currentBar, {
        'width': st.percent(newPercent),
      });
    });

    ['mousedown', 'touchstart'].forEach(event => {
      listen(totalBar, event, () => {
        scrubberTouched = true;
      });
      listen(scrubber, event, () => {
        scrubberTouched = true;
      });
    });

    ['mousemove', 'touchmove'].forEach(event => {
      listen(doc, event, e => {
        // TODO(@wassgha) Seek when implemented
        if (!size) {
          size = progressBar./*OK*/getBoundingClientRect();
        }
        const left = size.left;
        const total = size.width;
        const newPercent = Math.min(100,
            Math.max(0, 100 * (e.clientX - left) / total)
        );
        scrubberDragging = scrubberTouched;
        if (scrubberDragging) {
          st.setStyles(scrubber, {
            'left': st.percent(newPercent),
          });
          st.setStyles(currentBar, {
            'width': st.percent(newPercent),
          });
        }
      });
    });

    ['mouseup', 'touchend'].forEach(event => {
      listen(doc, event, () => {
        scrubberTouched = false;
        scrubberDragging = false;
      });
    });

    // Update progress bar
    const updateProgress = () => {
      const current = this.entry_.video.getCurrentTime() || 0;
      const total = this.entry_.video.getDuration() || 0;
      const percent = total ? Math.floor(current * (100 / total)) : 0;
      st.setStyles(currentBar, {
        'width': st.percent(percent),
      });
      st.setStyles(scrubber, {
        'left': st.percent(percent),
      });
    };

    [VideoEvents.TIME_UPDATE, VideoEvents.LOAD].forEach(e => {
      listen(this.entry_.video.element, e, updateProgress.bind(this));
    });

    return progressBar;
  }

  createIcon_(name) {
    const doc = this.ampdoc_.win.document;
    const icon = doc.createElement('amp-custom-controls-icon');
    icon.className = 'amp-custom-controls-icon-' + name;
    return icon;
  }

  changeIcon_(icon, name) {
    icon.className = 'amp-custom-controls-icon-' + name;
  }

  /**
   * Creates a button element from the button's name
   * @param {string} btn
   * @param {?Element|string} opt_loadingElement
   * @return {!Element}
   * @private
   */
  elementFromButton_(btn, opt_loadingElement = null) {
    const doc = this.ampdoc_.win.document;
    switch (btn) {
      case 'play':
        return this.createPlayPauseBtn_(opt_loadingElement);
      case 'time':
        return this.createProgressTime_();
      case 'spacer':
        return this.createSpacer_();
      case 'volume':
        return this.createVolumeControls_();
      case 'fullscreen':
        return this.createFullscreenBtn_();
      default:
        return doc.createElement('span');
    };
  }

  /**
   * Create the custom controls shim and insert it inside the video
   * @param {Array<string>} mainCtrls List of orderd controls (main bar)
   * @param {Array<string>} miniCtrls List of orderd controls (minimized ctrls)
   * @param {string} floating Name of the primary floating button (usually play)
   * @private
   */
  createCustomControls_(mainCtrls, miniCtrls, floating) {
    // Set up controls
    const doc = this.ampdoc_.win.document;
    this.ctrlContainer_ = doc.createElement('amp-custom-controls');
    this.ctrlContainer_.classList.toggle('light', !this.darkSkin_);
    this.ctrlBg_ = doc.createElement('amp-custom-controls-bg');
    this.ctrlBarWrapper_ = doc.createElement('amp-custom-controls-bar-wrapper');
    this.ctrlBarContainer_ = doc.createElement('amp-custom-controls-bar');
    this.miniCtrlsWrapper_ = doc.createElement('amp-custom-controls-mini-wrapper');
    this.miniCtrlsContainer_ = doc.createElement('amp-custom-controls-mini');
    this.floatingContainer_ = doc.createElement('amp-custom-controls-floating');

    // Shadow filter
    const shadowFilter = this.createIcon_('shadow');
    st.setStyles(shadowFilter, {
      'width': '0px',
      'height': '0px',
      'position': 'absolute',
    });

    // Show controls when mouse is over
    let oldCoords = '0-0';
    const showCtrlsIfNewPos = e => {
      if (e.type == 'mousemove'
      && e.clientX + '-' + e.clientY != oldCoords) {
        this.showControls();
        oldCoords = e.clientX + '-' + e.clientY;
      } else if (e.type != 'mousemove') {
        this.showControls();
      }
    };
    [this.entry_.video.element,
      this.floatingContainer_,
      this.ctrlContainer_,
      this.ctrlBarContainer_,
    ].forEach(element => {
      listen(element, 'mousemove', showCtrlsIfNewPos.bind(this));
    });

    // Hide controls when mouse is outside
    const hideCtrls = () => {
      if (this.controlsTimer_) {
        clearTimeout(this.controlsTimer_);
      }
      this.hideControls();
    };
    listen(this.ctrlContainer_, 'mouseleave', hideCtrls.bind(this));

    const toggleCtrls = e => {
      if (e.target != this.ctrlContainer_
          && e.target != this.miniCtrlsContainer_) {
        return;
      }
      e.stopPropagation();
      if (this.controlsTimer_) {
        clearTimeout(this.controlsTimer_);
      }
      if (this.controlsShown_) {
        this.hideControls(true);
      } else {
        this.showControls();
      }
    };

    // Toggle controls when video is clicked
    listen(this.ctrlContainer_, 'click', toggleCtrls.bind(this));

    // Add to the element
    this.vsync_.mutate(() => {
      // Add SVG shadow
      this.ctrlContainer_.appendChild(shadowFilter);

      // Floating controls
      this.floatingContainer_.appendChild(
          this.elementFromButton_(floating, this.floatingContainer_)
      );
      this.ctrlContainer_.appendChild(this.floatingContainer_);

      // Add background
      this.ctrlContainer_.appendChild(this.ctrlBg_);

      // Add main controls
      mainCtrls.forEach(btn => {
        this.ctrlBarContainer_.appendChild(
            this.elementFromButton_(btn)
        );
      });
      this.ctrlBarWrapper_.appendChild(this.ctrlBarContainer_);
      this.ctrlBarWrapper_.appendChild(this.createProgressBar_());
      this.ctrlContainer_.appendChild(this.ctrlBarWrapper_);

      // Add mini controls
      miniCtrls.forEach(btn => {
        this.miniCtrlsContainer_.appendChild(
            this.elementFromButton_(btn)
        );
      });
      this.miniCtrlsWrapper_.appendChild(this.miniCtrlsContainer_);
      this.miniCtrlsWrapper_.appendChild(this.createProgressBar_());
      this.ctrlContainer_.appendChild(this.miniCtrlsWrapper_);

      // Add main buttons container
      this.entry_.video.element.appendChild(this.ctrlContainer_);
    });
  }

  /**
   * Enables controls if disabled
   */
  enableControls() {
    this.controlsDisabled_ = false;
  }

  /**
   * Disables controls (showControls would no longer work)
   */
  disableControls() {
    this.controlsDisabled_ = true;
  }

  /**
   * Fades out the custom controls
   * @param {boolean} override hide controls even when video is not playing
   */
  hideControls(override = false) {
    this.vsync_.mutate(() => {
      if (!this.ctrlBarWrapper_
          || !this.floatingContainer_
          || !this.ctrlBg_
          || (!this.entry_.isPlaying() && !override)
          || !this.controlsShown_) {
        return;
      }

      Animation.animate(dev().assertElement(this.miniCtrlsContainer_),
          tr.setStyles(dev().assertElement(this.miniCtrlsContainer_), {
            'opacity': tr.numeric(1, 0),
          })
      , 200);

      Animation.animate(dev().assertElement(this.ctrlBarWrapper_),
          tr.setStyles(dev().assertElement(this.ctrlBarWrapper_), {
            'opacity': tr.numeric(1, 0),
          })
      , 200);

      Animation.animate(dev().assertElement(this.ctrlBg_),
          tr.setStyles(dev().assertElement(this.ctrlBg_), {
            'opacity': tr.numeric(1, 0),
          })
      , 200);

      Animation.animate(dev().assertElement(this.floatingContainer_),
          tr.setStyles(dev().assertElement(this.floatingContainer_), {
            'opacity': tr.numeric(1, 0),
          })
      , 200).thenAlways(() => {
        const classes = this.ctrlContainer_.classList;
        classes.toggle('amp-custom-controls-hidden', true);
        this.controlsShown_ = false;
      });
    });
  }

  /**
   * Fades-in the custom controls
   */
  showControls() {
    this.vsync_.mutate(() => {
      if (!this.ctrlBarWrapper_
          || !this.floatingContainer_
          || !this.ctrlBg_
          || this.controlsDisabled_) {
        return;
      }

      if (this.controlsTimer_) {
        clearTimeout(this.controlsTimer_);
      }
      this.controlsTimer_ = setTimeout(() => {
        this.hideControls();
      }, 3000);

      if (this.controlsShown_ || this.controlsShowing_) {
        return;
      }

      this.ctrlContainer_.classList.toggle('amp-custom-controls-hidden', false);
      this.controlsShowing_ = true;

      if (this.minimal_) {
        Animation.animate(dev().assertElement(this.miniCtrlsContainer_),
            tr.setStyles(dev().assertElement(this.miniCtrlsContainer_), {
              'opacity': tr.numeric(0, 1),
            })
        , 200).thenAlways(() => {
          this.controlsShown_ = true;
          this.controlsShowing_ = false;
          this.controlsDisabled_ = false;
        });
      } else {
        Animation.animate(dev().assertElement(this.ctrlBarWrapper_),
            tr.setStyles(dev().assertElement(this.ctrlBarWrapper_), {
              'opacity': tr.numeric(0, 1),
            })
        , 200);

        Animation.animate(dev().assertElement(this.ctrlBg_),
            tr.setStyles(dev().assertElement(this.ctrlBg_), {
              'opacity': tr.numeric(0, 1),
            })
        , 200);

        Animation.animate(dev().assertElement(this.floatingContainer_),
            tr.setStyles(dev().assertElement(this.floatingContainer_), {
              'opacity': tr.numeric(0, 1),
            })
        , 200).thenAlways(() => {
          this.controlsShown_ = true;
          this.controlsShowing_ = false;
          this.controlsDisabled_ = false;
        });
      }
    });
  }

  toggleMinimalControls(enable = true) {
    this.ctrlContainer_.classList.toggle('amp-custom-controls-minimal', enable);
    this.minimal_ = enable;
  }
}
