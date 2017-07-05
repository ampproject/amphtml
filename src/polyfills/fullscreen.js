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


/**
 * Polyfill for `Element.requestFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @this {Element}
 */
 function requestFullscreenPolyfill() {
   try {
     const requestFs = this.webkitEnterFullscreen
      || this.webkitRequestFullScreen
      || this.requestFullscreen
      || this.webkitEnterFullscreen
      || this.msRequestFullscreen
      || this.mozRequestFullScreen;
     return requestFs.call(this);
   } catch (e) {
     // requestFullscreen not supported
   }
 }

/**
 * Polyfill for `Document.exitFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 * @this {Document}
 */
 function exitFullscreenPolyfill() {
   try {
     // Determine which implementation of exitFullScreen to use
     const exitFs = this.documentElement.webkitCancelFullScreen
     || this.documentElement.cancelFullScreen
     || this.documentElement.webkitExitFullscreen
     || this.documentElement.exitFullscreen
     || this.documentElement.mozCancelFullScreen
     || this.documentElement.msExitFullscreen
     || this.webkitCancelFullScreen
     || this.cancelFullScreen
     || this.webkitExitFullscreen
     || this.exitFullscreen
     || this.mozCancelFullScreen
     || this.msExitFullscreen;
     return exitFs.call(this);
   } catch (e) {
     // exitFullscreen not supported
   }
 }



/**
 * Polyfills `Element.requestFullscreen` and `Document.exitFullscreen` APIs.
 * @param {!Window} win
 */
 export function install(win) {
   if (!win.Element.prototype.requestFullscreen) {
     win.Object.defineProperty(win.Element.prototype, 'requestFullscreen', {
       enumerable: false,
       configurable: true,
       writable: true,
       value: requestFullscreenPolyfill,
     });
   }
   if (!win.Document.prototype.exitFullscreen) {
     win.Object.defineProperty(win.Document.prototype, 'exitFullscreen', {
       enumerable: false,
       configurable: true,
       writable: true,
       value: exitFullscreenPolyfill,
     });
   }
 }
