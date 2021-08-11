function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Services } from "../../../src/service";
import { createElementWithAttributes, removeElement } from "../../../src/core/dom";
import { toWin } from "../../../src/core/window";

/** @private @const {string} */
var TOAST_CLASSNAME = 'i-amphtml-story-toast';

/**
 * The 'alert' role assertively announces toast content to screen readers.
 * @private @const {string}
 * */
var TOAST_ROLE = 'alert';

/**
 * Should be higher than total animation time.
 * @private @const {number}
 */
var TOAST_VISIBLE_TIME_MS = 2600;

/**
 * UI notifications service, displaying a message to the user for a limited
 * amount of time.
 */
export var Toast = /*#__PURE__*/function () {
  function Toast() {
    _classCallCheck(this, Toast);
  }

  _createClass(Toast, null, [{
    key: "show",
    value:
    /**
     * @param {!Element} storyEl
     * @param {!Node|string} childNodeOrText
     */
    function show(storyEl, childNodeOrText) {
      var win = toWin(storyEl.ownerDocument.defaultView);
      var toast = createElementWithAttributes(win.document, 'div',
      /** @type {!JsonObject} */
      {
        'class': TOAST_CLASSNAME,
        'role': TOAST_ROLE
      });

      if (typeof childNodeOrText == 'string') {
        toast.textContent = childNodeOrText;
      } else {
        toast.appendChild(childNodeOrText);
      }

      storyEl.appendChild(toast);
      Services.timerFor(win).delay(function () {
        return removeElement(toast);
      }, TOAST_VISIBLE_TIME_MS);
    }
  }]);

  return Toast;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvYXN0LmpzIl0sIm5hbWVzIjpbIlNlcnZpY2VzIiwiY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzIiwicmVtb3ZlRWxlbWVudCIsInRvV2luIiwiVE9BU1RfQ0xBU1NOQU1FIiwiVE9BU1RfUk9MRSIsIlRPQVNUX1ZJU0lCTEVfVElNRV9NUyIsIlRvYXN0Iiwic3RvcnlFbCIsImNoaWxkTm9kZU9yVGV4dCIsIndpbiIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsInRvYXN0IiwiZG9jdW1lbnQiLCJ0ZXh0Q29udGVudCIsImFwcGVuZENoaWxkIiwidGltZXJGb3IiLCJkZWxheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLDJCQUFSLEVBQXFDQyxhQUFyQztBQUNBLFNBQVFDLEtBQVI7O0FBRUE7QUFDQSxJQUFNQyxlQUFlLEdBQUcsdUJBQXhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsVUFBVSxHQUFHLE9BQW5COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMscUJBQXFCLEdBQUcsSUFBOUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxLQUFiO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0Usa0JBQVlDLE9BQVosRUFBcUJDLGVBQXJCLEVBQXNDO0FBQ3BDLFVBQU1DLEdBQUcsR0FBR1AsS0FBSyxDQUFDSyxPQUFPLENBQUNHLGFBQVIsQ0FBc0JDLFdBQXZCLENBQWpCO0FBRUEsVUFBTUMsS0FBSyxHQUFHWiwyQkFBMkIsQ0FDdkNTLEdBQUcsQ0FBQ0ksUUFEbUMsRUFFdkMsS0FGdUM7QUFHdkM7QUFBNEI7QUFDMUIsaUJBQVNWLGVBRGlCO0FBRTFCLGdCQUFRQztBQUZrQixPQUhXLENBQXpDOztBQVNBLFVBQUksT0FBT0ksZUFBUCxJQUEwQixRQUE5QixFQUF3QztBQUN0Q0ksUUFBQUEsS0FBSyxDQUFDRSxXQUFOLEdBQW9CTixlQUFwQjtBQUNELE9BRkQsTUFFTztBQUNMSSxRQUFBQSxLQUFLLENBQUNHLFdBQU4sQ0FBa0JQLGVBQWxCO0FBQ0Q7O0FBRURELE1BQUFBLE9BQU8sQ0FBQ1EsV0FBUixDQUFvQkgsS0FBcEI7QUFFQWIsTUFBQUEsUUFBUSxDQUFDaUIsUUFBVCxDQUFrQlAsR0FBbEIsRUFBdUJRLEtBQXZCLENBQ0U7QUFBQSxlQUFNaEIsYUFBYSxDQUFDVyxLQUFELENBQW5CO0FBQUEsT0FERixFQUVFUCxxQkFGRjtBQUlEO0FBN0JIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzLCByZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnI2NvcmUvd2luZG93JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVE9BU1RfQ0xBU1NOQU1FID0gJ2ktYW1waHRtbC1zdG9yeS10b2FzdCc7XG5cbi8qKlxuICogVGhlICdhbGVydCcgcm9sZSBhc3NlcnRpdmVseSBhbm5vdW5jZXMgdG9hc3QgY29udGVudCB0byBzY3JlZW4gcmVhZGVycy5cbiAqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfVxuICogKi9cbmNvbnN0IFRPQVNUX1JPTEUgPSAnYWxlcnQnO1xuXG4vKipcbiAqIFNob3VsZCBiZSBoaWdoZXIgdGhhbiB0b3RhbCBhbmltYXRpb24gdGltZS5cbiAqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBUT0FTVF9WSVNJQkxFX1RJTUVfTVMgPSAyNjAwO1xuXG4vKipcbiAqIFVJIG5vdGlmaWNhdGlvbnMgc2VydmljZSwgZGlzcGxheWluZyBhIG1lc3NhZ2UgdG8gdGhlIHVzZXIgZm9yIGEgbGltaXRlZFxuICogYW1vdW50IG9mIHRpbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb2FzdCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBzdG9yeUVsXG4gICAqIEBwYXJhbSB7IU5vZGV8c3RyaW5nfSBjaGlsZE5vZGVPclRleHRcbiAgICovXG4gIHN0YXRpYyBzaG93KHN0b3J5RWwsIGNoaWxkTm9kZU9yVGV4dCkge1xuICAgIGNvbnN0IHdpbiA9IHRvV2luKHN0b3J5RWwub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG5cbiAgICBjb25zdCB0b2FzdCA9IGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhcbiAgICAgIHdpbi5kb2N1bWVudCxcbiAgICAgICdkaXYnLFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHtcbiAgICAgICAgJ2NsYXNzJzogVE9BU1RfQ0xBU1NOQU1FLFxuICAgICAgICAncm9sZSc6IFRPQVNUX1JPTEUsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAodHlwZW9mIGNoaWxkTm9kZU9yVGV4dCA9PSAnc3RyaW5nJykge1xuICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBjaGlsZE5vZGVPclRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvYXN0LmFwcGVuZENoaWxkKGNoaWxkTm9kZU9yVGV4dCk7XG4gICAgfVxuXG4gICAgc3RvcnlFbC5hcHBlbmRDaGlsZCh0b2FzdCk7XG5cbiAgICBTZXJ2aWNlcy50aW1lckZvcih3aW4pLmRlbGF5KFxuICAgICAgKCkgPT4gcmVtb3ZlRWxlbWVudCh0b2FzdCksXG4gICAgICBUT0FTVF9WSVNJQkxFX1RJTUVfTVNcbiAgICApO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/toast.js