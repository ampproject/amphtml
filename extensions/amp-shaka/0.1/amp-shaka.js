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

import {
  childElementsByTag,
} from '../../../src/dom';
import {dev, devAssert} from '../../../src/log';
import {toArray} from '../../../src/types';
import {AmpVideoBase} from '../../amp-video/0.1/amp-video-base';

const TAG = 'amp-shaka';

class AmpShaka extends AmpVideoBase {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    this.player_ = null;
  }

  // TODO(dalecurtis): Should manifest based playbacks ever be allowed to
  // prerender? The manifest is insufficient to render playback.

  /** @override */
  buildCallback() {
    super.buildCallback();
    devAssert(this.video_);

    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (!shaka.Player.isBrowserSupported()) {
      this.toggleFallback(true);
      return;
    }

    this.player_ = new shaka.Player(this.video_);

    // TODO(dalecurtis): What should we do with errors? amp-video does nothing?
    // this.player_.addEventListener('error', onShakaFail);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.video_ || !this.player_) {
      return;
    }

    const {element} = this;
    if (mutations['src']) {
      const urlService = this.getUrlService_();
      urlService.assertHttpsUrl(element.getAttribute('src'), element);

      this.player_.load(element.getAttribute('src')).then(function() {
        console.log('The video has now been loaded!');
      }).catch(function(error) {
        console.error('mutatedAttributesCallback: Error code', error.code, 'object', error);
      });

      element.dispatchCustomEvent(VideoEvents.RELOAD);
    }

    // Don't propogate 'src' mutations into the amp-video base class.
    delete mutations['src'];
  }

  /**
   * @override
   *
   * This replaces an internal method for amp-video. amp-shaka does not support
   * multiple sources, but we do want to start loading a manifest source that is
   * cached by the CDN.
   */
  propagateCachedSources_() {
    devAssert(this.video_);
    devAssert(this.player_);

    // if the `src` of `amp-shaka` itself is cached, load it with ShakaPlayer.
    //
    // TODO(dalecurtis): A comment on propagateLayoutChildren_() indicates this
    // may fail, which for normal <video> would try a different source. We can
    // force somthing similar with Shaka through an error handler.
    if (this.element.hasAttribute('src') && this.isCachedByCDN_(this.element)) {
      const src = this.element.getAttribute('src');
      const type = this.element.getAttribute('type');
      const ampOrigSrc = this.element.getAttribute('amp-orig-src');

      // Also make sure src is removed from amp-shaka since Stories media-pool
      // may copy it back from amp-shaka.
      this.element.removeAttribute('src');
      this.element.removeAttribute('type');
      this.player_.load(src).then(function() {
        console.log('The video has now been loaded!');
      }).catch(function(error) {
        console.error('propagateCachedSources_: Error code', error.code, 'object', error);
      });
    }
  }

  /**
   * Propagate origin sources and tracks
   * @override
   */
  propagateLayoutChildren_() {
    devAssert(this.video_);
    devAssert(this.player_);

    const {element} = this;
    const urlService = this.getUrlService_();

    // If the `src` of `amp-shaka` itself is NOT cached, set it on video
    if (element.hasAttribute('src') &&
        !this.isCachedByCDN_(element)) {
      urlService.assertHttpsUrl(element.getAttribute('src'), element);
      this.player_.load(element.getAttribute('src')).then(function() {
        console.log('The video has now been loaded!');
      }).catch(function(error) {
        console.error('propagateLayoutChildren_: Error code', error.code, 'object', error);
      });
    }

    // To handle cases where cached source may 404 if not primed yet,
    // duplicate the `origin` Urls for cached sources and insert them after each
    // TODO(dalecurtis): What???

    const tracks = toArray(childElementsByTag(element, 'track'));
    tracks.forEach(track => {
      this.video_.appendChild(track);
    });
  }

  /**
   * @override
   */
  createSourceElement_(src, type) {
    // Should not be called for amp-shaka.
    devAssert(false);
    return false;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpShaka);
});
