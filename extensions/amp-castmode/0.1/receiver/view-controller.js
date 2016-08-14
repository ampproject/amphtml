/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import * as st from '../../../../src/style';


export class ViewController {

  /**
   * @param {*} opts
   */
  constructor(opts) {

    /** @protected @const {*} */
    this.opts = opts;

    /** @protected @const {!Element} */
    this.element = this.createElement();
  }

  /** */
  dispose() {
  }

  /**
   * @param {function(string)} handler
   * @return {!Unlisten}
   */
  onPlayStateChanged(handler) {
  }

  /**
   * @param {string} state
   * @protected
   */
  playStateChanged(state) {
  }

  /**
   * @return {!Element}
   */
  getElement() {
    return this.element;
  }

  /**
   * @return {!Element}
   */
  createElement() {}

  /** */
  play() {}

  /** */
  pause() {}

}


export class TextViewController extends ViewController {
  /** @override */
  createElement() {
    const element = document.createElement('div');
    element.classList.add('full-screen');
    element.classList.add('centering');
    element.style.fontSize = '100px';
    element.style.textAlign = 'center';
    element.style.padding = '80px';
    element.textContent = this.opts.text;
    return element;
  }
}


export class ImageViewController extends ViewController {
  /** @override */
  createElement() {
    const img = document.createElement('img');
    img.classList.add('full-screen');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.src = this.opts.src;
    return img;
  }
}


export class VideoViewController extends ViewController {
  /** @override */
  createElement() {
    const video = document.createElement('video');
    video.classList.add('full-screen');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.controls = false;
    video.autoplay = true; // TODO: switch to play on request system.
    video.src = this.opts.src;

    video.addEventListener('play', () => {
      this.playStateChanged('playing');
    });
    video.addEventListener('pause', () => {
      this.playStateChanged('paused');
    });
    video.addEventListener('ended', () => {
      this.playStateChanged('ended');
    });

    return video;
  }

  /** @override */
  play() {
    this.element.play();
  }

  /** @override */
  pause() {
    this.element.pause();
  }
}


export class YoutubeViewController extends ViewController {
  /** @override */
  createElement() {
    const iframe = document.createElement('iframe');
    const src = `https://www.youtube.com/embed/${encodeURIComponent(this.opts.videoId)}?enablejsapi=1&autoplay=1&controls=0`;
    iframe.classList.add('full-screen');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = src;
    return iframe;
  }

  /** @override */
  play() {
    // https://developers.google.com/youtube/iframe_api_reference
    this.element.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'command',
      'func': 'playVideo',
      'args': '',
    }), '*');
  }

  /** @override */
  pause() {
    // https://developers.google.com/youtube/iframe_api_reference
    this.element.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'command',
      'func': 'pauseVideo',
      'args': '',
    }), '*');
  }
}


export class IframeViewController extends ViewController {
  /** @override */
  createElement() {
    const iframe = document.createElement('iframe');
    iframe.classList.add('full-screen');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = this.opts.src;
    return iframe;
  }
}
