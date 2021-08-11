function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Action, getStoreService } from "./amp-story-store-service";
import { CSS } from "../../../build/amp-story-unsupported-browser-layer-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { createShadowRootWithStyle } from "./utils";
import { dict } from "../../../src/core/types/object";
import { removeElement } from "../../../src/core/dom";
import { renderAsElement } from "./simple-template";

/** @const {string} Class for the continue anyway button */
var CONTINUE_ANYWAY_BUTTON_CLASS = 'i-amphtml-continue-button';

/**
 * Full viewport black layer indicating browser is not supported.
 * @private @const {!./simple-template.ElementDef}
 */
var UNSUPPORTED_BROWSER_LAYER_TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-unsupported-browser-overlay'
  }),
  children: [{
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-overlay-container'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-gear-icon'
      })
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-overlay-text'
      }),
      localizedStringId: LocalizedStringId.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT
    }, // The continue button functionality will only be present in the default
    // layer. Publisher provided fallbacks will not provide users with the
    // ability to continue with an unsupported browser
    {
      tag: 'button',
      attrs: dict({
        'class': 'i-amphtml-continue-button'
      }),
      localizedStringId: LocalizedStringId.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL
    }]
  }]
};

/**
 * Unsupported browser layer UI.
 */
export var UnsupportedBrowserLayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function UnsupportedBrowserLayer(win) {
    _classCallCheck(this, UnsupportedBrowserLayer);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.continueButton_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);
  }

  /**
   * Builds and appends the component in the story.
   * @return {*} TODO(#23582): Specify return type
   */
  _createClass(UnsupportedBrowserLayer, [{
    key: "build",
    value: function build() {
      var _this = this;

      if (this.root_) {
        return this.root_;
      }

      this.root_ = this.win_.document.createElement('div');
      this.element_ = renderAsElement(this.win_.document, UNSUPPORTED_BROWSER_LAYER_TEMPLATE);
      createShadowRootWithStyle(this.root_, this.element_, CSS);
      this.continueButton_ = this.element_.
      /*OK*/
      querySelector("." + CONTINUE_ANYWAY_BUTTON_CLASS);
      this.continueButton_.addEventListener('click', function () {
        _this.storeService_.dispatch(Action.TOGGLE_SUPPORTED_BROWSER, true);
      });
      return this.root_;
    }
    /**
     * Returns the unsupported browser componenet
     * @return {?Element} The root element of the componenet
     */

  }, {
    key: "get",
    value: function get() {
      if (!this.root_) {
        this.build();
      }

      return this.root_;
    }
    /**
     * Removes the entire layer
     */

  }, {
    key: "removeLayer",
    value: function removeLayer() {
      if (this.root_) {
        removeElement(this.root_);
      }
    }
  }]);

  return UnsupportedBrowserLayer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS11bnN1cHBvcnRlZC1icm93c2VyLWxheWVyLmpzIl0sIm5hbWVzIjpbIkFjdGlvbiIsImdldFN0b3JlU2VydmljZSIsIkNTUyIsIkxvY2FsaXplZFN0cmluZ0lkIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImRpY3QiLCJyZW1vdmVFbGVtZW50IiwicmVuZGVyQXNFbGVtZW50IiwiQ09OVElOVUVfQU5ZV0FZX0JVVFRPTl9DTEFTUyIsIlVOU1VQUE9SVEVEX0JST1dTRVJfTEFZRVJfVEVNUExBVEUiLCJ0YWciLCJhdHRycyIsImNoaWxkcmVuIiwibG9jYWxpemVkU3RyaW5nSWQiLCJBTVBfU1RPUllfV0FSTklOR19VTlNVUFBPUlRFRF9CUk9XU0VSX1RFWFQiLCJBTVBfU1RPUllfQ09OVElOVUVfQU5ZV0FZX0JVVFRPTl9MQUJFTCIsIlVuc3VwcG9ydGVkQnJvd3NlckxheWVyIiwid2luIiwid2luXyIsInJvb3RfIiwiZWxlbWVudF8iLCJjb250aW51ZUJ1dHRvbl8iLCJzdG9yZVNlcnZpY2VfIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJkaXNwYXRjaCIsIlRPR0dMRV9TVVBQT1JURURfQlJPV1NFUiIsImJ1aWxkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxNQUFSLEVBQWdCQyxlQUFoQjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxlQUFSOztBQUVBO0FBQ0EsSUFBTUMsNEJBQTRCLEdBQUcsMkJBQXJDOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsa0NBQWtDLEdBQUc7QUFD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VE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0FjdGlvbiwgZ2V0U3RvcmVTZXJ2aWNlfSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktdW5zdXBwb3J0ZWQtYnJvd3Nlci1sYXllci0xLjAuY3NzJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7Y3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3JlbW92ZUVsZW1lbnR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge3JlbmRlckFzRWxlbWVudH0gZnJvbSAnLi9zaW1wbGUtdGVtcGxhdGUnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9IENsYXNzIGZvciB0aGUgY29udGludWUgYW55d2F5IGJ1dHRvbiAqL1xuY29uc3QgQ09OVElOVUVfQU5ZV0FZX0JVVFRPTl9DTEFTUyA9ICdpLWFtcGh0bWwtY29udGludWUtYnV0dG9uJztcbi8qKlxuICogRnVsbCB2aWV3cG9ydCBibGFjayBsYXllciBpbmRpY2F0aW5nIGJyb3dzZXIgaXMgbm90IHN1cHBvcnRlZC5cbiAqIEBwcml2YXRlIEBjb25zdCB7IS4vc2ltcGxlLXRlbXBsYXRlLkVsZW1lbnREZWZ9XG4gKi9cbmNvbnN0IFVOU1VQUE9SVEVEX0JST1dTRVJfTEFZRVJfVEVNUExBVEUgPSB7XG4gIHRhZzogJ2RpdicsXG4gIGF0dHJzOiBkaWN0KHsnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LXVuc3VwcG9ydGVkLWJyb3dzZXItb3ZlcmxheSd9KSxcbiAgY2hpbGRyZW46IFtcbiAgICB7XG4gICAgICB0YWc6ICdkaXYnLFxuICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtb3ZlcmxheS1jb250YWluZXInfSksXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1nZWFyLWljb24nfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGF0dHJzOiBkaWN0KHsnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LW92ZXJsYXktdGV4dCd9KSxcbiAgICAgICAgICBsb2NhbGl6ZWRTdHJpbmdJZDpcbiAgICAgICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9XQVJOSU5HX1VOU1VQUE9SVEVEX0JST1dTRVJfVEVYVCxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGNvbnRpbnVlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5IHdpbGwgb25seSBiZSBwcmVzZW50IGluIHRoZSBkZWZhdWx0XG4gICAgICAgIC8vIGxheWVyLiBQdWJsaXNoZXIgcHJvdmlkZWQgZmFsbGJhY2tzIHdpbGwgbm90IHByb3ZpZGUgdXNlcnMgd2l0aCB0aGVcbiAgICAgICAgLy8gYWJpbGl0eSB0byBjb250aW51ZSB3aXRoIGFuIHVuc3VwcG9ydGVkIGJyb3dzZXJcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2J1dHRvbicsXG4gICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtY29udGludWUtYnV0dG9uJ30pLFxuICAgICAgICAgIGxvY2FsaXplZFN0cmluZ0lkOlxuICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0NPTlRJTlVFX0FOWVdBWV9CVVRUT05fTEFCRUwsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuXG4vKipcbiAqIFVuc3VwcG9ydGVkIGJyb3dzZXIgbGF5ZXIgVUkuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbnN1cHBvcnRlZEJyb3dzZXJMYXllciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucm9vdF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jb250aW51ZUJ1dHRvbl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luXyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBhcHBlbmRzIHRoZSBjb21wb25lbnQgaW4gdGhlIHN0b3J5LlxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIGlmICh0aGlzLnJvb3RfKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb290XztcbiAgICB9XG4gICAgdGhpcy5yb290XyA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVsZW1lbnRfID0gcmVuZGVyQXNFbGVtZW50KFxuICAgICAgdGhpcy53aW5fLmRvY3VtZW50LFxuICAgICAgVU5TVVBQT1JURURfQlJPV1NFUl9MQVlFUl9URU1QTEFURVxuICAgICk7XG4gICAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSh0aGlzLnJvb3RfLCB0aGlzLmVsZW1lbnRfLCBDU1MpO1xuICAgIHRoaXMuY29udGludWVCdXR0b25fID0gdGhpcy5lbGVtZW50Xy4vKk9LKi8gcXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHtDT05USU5VRV9BTllXQVlfQlVUVE9OX0NMQVNTfWBcbiAgICApO1xuICAgIHRoaXMuY29udGludWVCdXR0b25fLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfU1VQUE9SVEVEX0JST1dTRVIsIHRydWUpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnJvb3RfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVuc3VwcG9ydGVkIGJyb3dzZXIgY29tcG9uZW5ldFxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH0gVGhlIHJvb3QgZWxlbWVudCBvZiB0aGUgY29tcG9uZW5ldFxuICAgKi9cbiAgZ2V0KCkge1xuICAgIGlmICghdGhpcy5yb290Xykge1xuICAgICAgdGhpcy5idWlsZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yb290XztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBlbnRpcmUgbGF5ZXJcbiAgICovXG4gIHJlbW92ZUxheWVyKCkge1xuICAgIGlmICh0aGlzLnJvb3RfKSB7XG4gICAgICByZW1vdmVFbGVtZW50KHRoaXMucm9vdF8pO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-unsupported-browser-layer.js