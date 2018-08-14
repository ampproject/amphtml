/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Embeds an Audioburst audio player
 * @author Audioburst
 *
 * Example:
 * <code>
 * <amp-audioburst-audio
 *  autoplay
 *  layout="fixed-height"
 *  height="315"
 *  src="https://sapi.audioburst.com/audio/repo/play/web/l1AXp9wBR57y.mp3"
 *  fullShow="http://storageaudiobursts.blob.core.windows.net/temp/11760_2018081122_t.mp3"
 *  fullShowPosition="640">
 * </amp-audioburst-audio>
 */

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {listen} from '../../../src/event-helper';
import {setStyle, setStyles} from '../../../src/style';


export class AmpAudioburstAudio extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private */
    this.viewport_ = null;
    /** @private {string} */
    this.burstSrc_ = undefined;
    /** @private {string} */
    this.fullShowSrc_ = undefined;
    /** @private {number} */
    this.fullShowPosition_ = 0;
    /** @public {boolean} */
    this.isPlaying = false;
    /** @public {boolean} */
    this.ended = false;
    /** @public {number} */
    this.currentTime = 0;
    /** @private {number} */
    this.burstSaveTime_ = undefined;
    /** @public {number} */
    this.duration = 0;

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');

    /** @private {!Element} */
    this.audio_ = null;

    /** @private {!Element} */
    this.pauseBtn_ = null;

    /** @private {!Element} */
    this.playBtn_ = null;

    /** @private {!Element} */
    this.currentTimeEl_ = null;

    /** @private {!Element} */
    this.durationEl_ = null;

    /** @private {!Element} */
    this.slider_ = null;
  }

  /** @override */
  buildCallback() {
    // this.container_.textContent = this.myText_;
    // this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  layoutCallback() {
    this.viewport_ = Services.viewportForDoc(this.getAmpDoc());
    this.burstSrc_ = this.element.getAttribute('src');
    this.fullShowSrc_ = this.element.getAttribute('fullShow');
    this.fullShowPosition_ =
      Number(this.element.getAttribute('fullShowPosition'));
    setStyles(this.container_, {
      'padding': '2em 1em',
      'text-align': 'center',
    });
    const buttonWrapper = this.win.document.createElement('div');
    setStyles(buttonWrapper, {
      'width': '10em',
      'height': '10em',
      'background': 'linear-gradient(to bottom, #ff4d4d, #cc01fe)',
      'border-radius': '50%',
      'box-shadow': '0 0 3rem 1rem rgba(0,0, 0, 0.2)',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'position': 'relative',
      'margin': '0 auto',
    });
    this.createPlayButton_();
    this.createPauseButton_();
    buttonWrapper.appendChild(this.playBtn_);
    buttonWrapper.appendChild(this.pauseBtn_);
    const buttonWrapperCircle = this.win.document.createElement('div');
    setStyles(buttonWrapperCircle, {
      'position': 'absolute',
      'border': '1px dotted #fff',
      'width': '65%',
      'height': '65%',
      'border-radius': '50%',
    });
    buttonWrapper.appendChild(buttonWrapperCircle);

    /* Audio Control */
    const audio = this.win.document.createElement('audio');
    audio.src = this.burstSrc_;
    this.propagateAttributes(
        [
          'preload',
          'autoplay',
          'muted',
          'loop',
          'aria-label',
          'aria-describedby',
          'aria-labelledby',
        ],
        audio
    );
    listen(audio, 'play', () => this.setPlaying_(true));
    listen(audio, 'pause', () => this.setPlaying_(false));
    listen(audio, 'timeupdate', () => this.timeUpdate_());
    listen(audio, 'durationchange', () => this.setDuration_());
    this.audio_ = audio;
    this.container_.appendChild(this.audio_);
    this.container_.appendChild(buttonWrapper);
    /* ===================*/

    /** Full Show Button */
    const fullShowButton = this.win.document.createElement('button');
    fullShowButton.textContent = 'Keep Listening';
    setStyles(fullShowButton, {
      'text-align': 'center',
      'margin': '1.5em auto',
      'border': 'none',
      'color': '#ae21ff',
      'background': '#fff',
      'cursor': 'pointer',
      'padding': '0.5em 1em',
      'outline': 'none',
      'box-shadow': '4px 10px 20px 0 rgba(50, 37, 57, 0.2)',
    });
    listen(fullShowButton, 'click', () => {
      if (this.burstSaveTime_) {
        this.audio_.src = this.burstSrc_;
        this.audio_.currentTime = this.burstSaveTime_;
        fullShowButton.textContent = 'Keep Listening';
        this.burstSaveTime_ = undefined;
      } else {
        this.burstSaveTime_ = this.audio_.currentTime;
        this.audio_.currentTime = 0;
        this.audio_.src = this.fullShowSrc_;
        this.audio_.currentTime =
          this.fullShowPosition_ + this.burstSaveTime_ - 2;
        fullShowButton.textContent = 'Back To Burst';
      }
    });
    /** Slider */
    this.createSlider_();

    /* Times */
    const timeWrapper = this.win.document.createElement('div');
    setStyles(timeWrapper, {
      'text-align': 'center',
      'color': 'rgba(0, 0, 0, 0.3)',
      'margin': '0.5em auto',
      'font-size': '0.8em',
    });
    this.currentTimeEl_ = this.win.document.createElement('span');
    this.durationEl_ = this.win.document.createElement('span');
    timeWrapper.appendChild(this.currentTimeEl_);
    timeWrapper.appendChild(this.durationEl_);

    if (this.fullShowSrc_ && this.fullShowSrc_.length > 0) {
      this.container_.appendChild(fullShowButton);
    }
    this.container_.appendChild(this.slider_);
    this.container_.appendChild(timeWrapper);
    this.element.appendChild(this.container_);
    return this.loadPromise(this.container_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** */
  play() {
    if (this.audio_ && !this.isPlaying) {
      this.audio_.play();
      this.setPlaying_(true);
    }
  }

  /** */
  pause() {
    if (this.audio_ && this.isPlaying) {
      this.audio_.pause();
      this.setPlaying_(false);
    }
  }

  /** @private
   * @param {boolean} playing
  */
  setPlaying_(playing) {
    if (!!playing) {
      this.isPlaying = true;
      if (this.playBtn_ && this.pauseBtn_) {
        setStyle(this.playBtn_, 'display', 'none');
        setStyle(this.pauseBtn_, 'display', 'flex');
      }
    } else {
      this.isPlaying = false;
      setStyle(this.pauseBtn_, 'display', 'none');
      setStyle(this.playBtn_, 'display', 'flex');
    }
  }

  /** @private */
  timeUpdate_() {
    if (this.audio_) {
      this.currentTime = this.audio_.currentTime;
      if (this.currentTimeEl_) {
        this.currentTimeEl_.textContent = this.convertTime_(this.currentTime);
        this.currentTimeEl_.textContent += ' / ';
        this.updateSlider_();
      }
    }
  }

  /** @private */
  setDuration_() {
    if (this.audio_) {
      this.duration = this.audio_.duration;
      if (this.durationEl_) {
        this.durationEl_.textContent = this.convertTime_(this.duration);
      }
    }
  }

  /** @private */
  createPauseButton_() {
    const btn = this.win.document.createElement('button');
    setStyles(btn, {
      'width': '100px',
      'height': '100px',
      'background': 'none',
      'border': 'none',
      'display': 'none',
      'justify-content': 'center',
      'align-items': 'center',
      'outline': 'none',
      'cursor': 'pointer',
      'z-index': '10',
    });
    const pauseIcon = this.win.document.createElement('div');
    setStyles(pauseIcon, {
      'width': '30px',
      'height': '22px',
    });
    const pauseIconVertLine1 = this.win.document.createElement('div');
    const pauseIconVertLine2 = this.win.document.createElement('div');
    const pauseIconStyles = {
      'width': '20%',
      'height': '100%',
      'margin': '0 12.5%',
      'background': '#fff',
      'display': 'inline-block',
    };
    setStyles(pauseIconVertLine1, pauseIconStyles);
    setStyles(pauseIconVertLine2, pauseIconStyles);
    pauseIcon.appendChild(pauseIconVertLine1);
    pauseIcon.appendChild(pauseIconVertLine2);
    btn.appendChild(pauseIcon);
    listen(btn, 'click', () => this.pause());
    this.pauseBtn_ = btn;
  }

  /** @private */
  createPlayButton_() {
    const btn = this.win.document.createElement('button');
    setStyles(btn, {
      'width': '100px',
      'height': '100px',
      'background': 'none',
      'border': 'none',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'outline': 'none',
      'cursor': 'pointer',
      'z-index': '10',
    });
    const playIcon = this.win.document.createElement('div');
    const PLAY_ICON_SIZE = 24;
    setStyles(playIcon, {
      'width': '0',
      'height': '0',
      'border-left': `${PLAY_ICON_SIZE}px solid #fff`,
      'border-top': `${PLAY_ICON_SIZE * .666}px solid transparent`,
      'border-bottom': `${PLAY_ICON_SIZE * .666}px solid transparent`,
      'margin-left': '10px',
    });
    btn.appendChild(playIcon);
    listen(btn, 'click', () => this.play());
    this.playBtn_ = btn;
  }

  /** @private */
  createSlider_() {
    const slider = this.win.document.createElement('div');
    setStyles(slider, {
      'width': '80%',
      'height': '3px',
      'margin': '1em auto',
      'position': 'relative',
      'background': '#e7e7e7',
      'z-index': '0',
    });
    const sliderL1 = this.win.document.createElement('div');
    sliderL1.id = 'ampAudioburstAudioSliderL1';
    setStyles(sliderL1, {
      'position': 'absolute',
      'top': '0',
      'bottom': '0',
      'left': '0',
      'width': '0',
      'max-width': '100%',
      'background': 'linear-gradient(to right, #fff, #ae21ff)',
      'z-index': '1',
      'transition': '0.3s linear width',
    });

    const sliderL2 = this.win.document.createElement('div');
    sliderL2.id = 'ampAudioburstAudioSliderL2';
    setStyles(sliderL2, {
      'position': 'absolute',
      'background': '#ae21ff',
      'border': '2px solid #fff',
      'border-radius': '50%',
      'width': '1em',
      'height': '1em',
      'top': '-0.57em',
      'left': '-0.65em',
      'box-shadow': '3px 1px 8px 0px rgba(18, 12, 48, 0.2)',
      'z-index': '2',
      'transition': '0.3s linear left',
    });

    slider.appendChild(sliderL1);
    slider.appendChild(sliderL2);

    const setAudioPosition = x => {
      const rectangle = this.viewport_.getLayoutRect(slider);
      const eventX = x ? x : 0;
      if (rectangle && this.audio_) {
        const percent = (eventX - rectangle.x) / rectangle.width;
        this.audio_.currentTime = this.duration * percent;
      }
    };

    listen(slider, 'touchstart',
        event => setAudioPosition(event.changedTouches[0].clientX));
    listen(slider, 'click', event => setAudioPosition(event.x));

    let sliderDraging = false;
    listen(sliderL2, 'touchstart', () => sliderDraging = true);
    listen(sliderL2, 'mousedown', () => sliderDraging = true);
    listen(sliderL2, 'touchmove', event => {
      if (sliderDraging) {
        setAudioPosition(event.changedTouches[0].clientX);
      }
    });
    listen(sliderL2, 'mousemove', event => {
      if (sliderDraging) {
        setAudioPosition(event.x);
      }
    });
    listen(sliderL2, 'touchend', event => {
      if (sliderDraging) {
        setAudioPosition(event.changedTouches[0].clientX);
      }
      sliderDraging = false;
    });
    listen(sliderL2, 'mouseup', event => {
      if (sliderDraging) {
        setAudioPosition(event.x);
      }
      sliderDraging = false;
    });
    this.slider_ = slider;
  }

  /** @private */
  updateSlider_() {
    if (this.slider_) {
      const l1 = this.slider_.querySelector('#ampAudioburstAudioSliderL1');
      const l2 = this.slider_.querySelector('#ampAudioburstAudioSliderL2');
      const width = this.currentTime * 100 / this.duration;
      if (l1 && this.currentTime >= 0 && this.duration > 0) {
        setStyle(l1, 'width', width + '%');
      }
      if (l2 && this.currentTime >= 0 && this.duration > 0 && width <= 100) {
        setStyle(l2, 'left', `calc(${width}% - 0.65em)`);
      }
    }
  }

  /** @private
   * @param {number} seconds
  */
  convertTime_(seconds) {
    if (seconds == undefined || seconds === 0) {
      return '0:00';
    }
    let result = '';
    seconds = Math.floor(seconds);
    if (seconds < 60) {
      result =
        `0:${(seconds < 10 ? '0' + seconds.toString() : seconds.toString())}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      result = `${minutes.toString()}:`;
      result +=
        `${(seconds < 10 ? '0' + seconds.toString() : seconds.toString())}`;
    }
    return result;
  }
}

AMP.registerElement('amp-audioburst-audio', AmpAudioburstAudio);
