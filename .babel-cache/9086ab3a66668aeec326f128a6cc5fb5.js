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
import { CSS } from "../../../build/amp-story-hint-1.0.css";
import { EmbeddedComponentState, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { createShadowRootWithStyle } from "./utils";
import { dict } from "../../../src/core/types/object";
import { renderAsElement } from "./simple-template";

/** @private @const {!./simple-template.ElementDef} */
var TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class': 'i-amphtml-story-hint-container ' + 'i-amphtml-story-system-reset i-amphtml-hidden'
  }),
  children: [{
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-navigation-help-overlay'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-navigation-help-section prev-page'
      }),
      children: [{
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-hint-placeholder'
        }),
        children: [{
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button'
          }),
          children: [{
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-hint-tap-button-icon'
            })
          }]
        }, {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button-text'
          }),
          localizedStringId: LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL
        }]
      }]
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-navigation-help-section next-page'
      }),
      children: [{
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-hint-placeholder'
        }),
        children: [{
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button'
          }),
          children: [{
            tag: 'div',
            attrs: dict({
              'class': 'i-amphtml-story-hint-tap-button-icon'
            })
          }]
        }, {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-hint-tap-button-text'
          }),
          localizedStringId: LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL
        }]
      }]
    }]
  }]
};

/** @type {string} */
var NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {string} */
var FIRST_PAGE_OVERLAY_CLASS = 'show-first-page-overlay';

/** @type {number} */
var NAVIGATION_OVERLAY_TIMEOUT = 3000;

/** @type {number} */
var FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT = 275;

/**
 * User Hint Layer for <amp-story>.
 */
export var AmpStoryHint = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  function AmpStoryHint(win, parentEl) {
    _classCallCheck(this, AmpStoryHint);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} Whether the component is built. */
    this.isBuilt_ = false;

    /** @private {!Document} */
    this.document_ = this.win_.document;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?(number|string)} */
    this.hintTimeout_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;
  }

  /**
   * Builds the hint layer DOM.
   */
  _createClass(AmpStoryHint, [{
    key: "build",
    value: function build() {
      var _this = this;

      if (this.isBuilt()) {
        return;
      }

      this.isBuilt_ = true;
      var root = this.document_.createElement('div');
      this.hintContainer_ = renderAsElement(this.document_, TEMPLATE);
      createShadowRootWithStyle(root, this.hintContainer_, CSS);
      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE, function (isVisible) {
        _this.onSystemUiIsVisibleStateUpdate_(isVisible);
      });
      this.storeService_.subscribe(StateProperty.INTERACTIVE_COMPONENT_STATE,
      /** @param {./amp-story-store-service.InteractiveComponentDef} component */
      function (component) {
        _this.hideOnFocusedState_(component.state === EmbeddedComponentState.FOCUSED);
      });
      this.vsync_.mutate(function () {
        _this.parentEl_.appendChild(root);
      });
    }
    /**
     * Whether the component is built.
     * @return {boolean}
     */

  }, {
    key: "isBuilt",
    value: function isBuilt() {
      return this.isBuilt_;
    }
    /**
     * Shows the given hint, only if not desktop.
     * @param {string} hintClass
     * @private
     */

  }, {
    key: "showHint_",
    value: function showHint_(hintClass) {
      var _this2 = this;

      if (this.storeService_.get(StateProperty.UI_STATE) !== UIType.MOBILE) {
        return;
      }

      this.build();
      this.vsync_.mutate(function () {
        _this2.hintContainer_.classList.toggle(NAVIGATION_OVERLAY_CLASS, hintClass == NAVIGATION_OVERLAY_CLASS);

        _this2.hintContainer_.classList.toggle(FIRST_PAGE_OVERLAY_CLASS, hintClass == FIRST_PAGE_OVERLAY_CLASS);

        _this2.hintContainer_.classList.remove('i-amphtml-hidden');

        var hideTimeout = hintClass == NAVIGATION_OVERLAY_CLASS ? NAVIGATION_OVERLAY_TIMEOUT : FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT;

        _this2.hideAfterTimeout(hideTimeout);
      });
    }
    /**
     * Show navigation overlay DOM.
     */

  }, {
    key: "showNavigationOverlay",
    value: function showNavigationOverlay() {
      // Don't show the overlay if the share menu is open.
      if (this.storeService_.get(StateProperty.SHARE_MENU_STATE)) {
        return;
      }

      this.showHint_(NAVIGATION_OVERLAY_CLASS);
    }
    /**
     * Show navigation overlay DOM.
     */

  }, {
    key: "showFirstPageHintOverlay",
    value: function showFirstPageHintOverlay() {
      this.showHint_(FIRST_PAGE_OVERLAY_CLASS);
    }
    /**
     * Hides the overlay after a given time
     * @param {number} timeout
     */

  }, {
    key: "hideAfterTimeout",
    value: function hideAfterTimeout(timeout) {
      var _this3 = this;

      this.hintTimeout_ = this.timer_.delay(function () {
        return _this3.hideInternal_();
      }, timeout);
    }
    /**
     * Hide all navigation hints.
     */

  }, {
    key: "hideAllNavigationHint",
    value: function hideAllNavigationHint() {
      this.hideInternal_();

      if (this.hintTimeout_ !== null) {
        this.timer_.cancel(this.hintTimeout_);
        this.hintTimeout_ = null;
      }
    }
    /** @private */

  }, {
    key: "hideInternal_",
    value: function hideInternal_() {
      var _this4 = this;

      if (!this.isBuilt()) {
        return;
      }

      this.vsync_.mutate(function () {
        _this4.hintContainer_.classList.add('i-amphtml-hidden');
      });
    }
    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */

  }, {
    key: "onRtlStateUpdate_",
    value: function onRtlStateUpdate_(rtlState) {
      var _this5 = this;

      this.vsync_.mutate(function () {
        rtlState ? _this5.hintContainer_.setAttribute('dir', 'rtl') : _this5.hintContainer_.removeAttribute('dir');
      });
    }
    /**
     * Reacts to system UI visibility state updates.
     * @param {boolean} isVisible
     * @private
     */

  }, {
    key: "onSystemUiIsVisibleStateUpdate_",
    value: function onSystemUiIsVisibleStateUpdate_(isVisible) {
      if (!isVisible) {
        this.hideAllNavigationHint();
      }
    }
    /**
     * Hides navigation hint if tooltip is open.
     * @param {boolean} isActive
     * @private
     */

  }, {
    key: "hideOnFocusedState_",
    value: function hideOnFocusedState_(isActive) {
      if (isActive) {
        this.hideAllNavigationHint();
      }
    }
  }]);

  return AmpStoryHint;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1oaW50LmpzIl0sIm5hbWVzIjpbIkNTUyIsIkVtYmVkZGVkQ29tcG9uZW50U3RhdGUiLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiZ2V0U3RvcmVTZXJ2aWNlIiwiTG9jYWxpemVkU3RyaW5nSWQiLCJTZXJ2aWNlcyIsImNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUiLCJkaWN0IiwicmVuZGVyQXNFbGVtZW50IiwiVEVNUExBVEUiLCJ0YWciLCJhdHRycyIsImNoaWxkcmVuIiwibG9jYWxpemVkU3RyaW5nSWQiLCJBTVBfU1RPUllfSElOVF9VSV9QUkVWSU9VU19MQUJFTCIsIkFNUF9TVE9SWV9ISU5UX1VJX05FWFRfTEFCRUwiLCJOQVZJR0FUSU9OX09WRVJMQVlfQ0xBU1MiLCJGSVJTVF9QQUdFX09WRVJMQVlfQ0xBU1MiLCJOQVZJR0FUSU9OX09WRVJMQVlfVElNRU9VVCIsIkZJUlNUX1BBR0VfTkFWSUdBVElPTl9PVkVSTEFZX1RJTUVPVVQiLCJBbXBTdG9yeUhpbnQiLCJ3aW4iLCJwYXJlbnRFbCIsIndpbl8iLCJpc0J1aWx0XyIsImRvY3VtZW50XyIsImRvY3VtZW50IiwidnN5bmNfIiwidnN5bmNGb3IiLCJ0aW1lcl8iLCJ0aW1lckZvciIsImhpbnRDb250YWluZXJfIiwiaGludFRpbWVvdXRfIiwic3RvcmVTZXJ2aWNlXyIsInBhcmVudEVsXyIsImlzQnVpbHQiLCJyb290IiwiY3JlYXRlRWxlbWVudCIsInN1YnNjcmliZSIsIlJUTF9TVEFURSIsInJ0bFN0YXRlIiwib25SdGxTdGF0ZVVwZGF0ZV8iLCJTWVNURU1fVUlfSVNfVklTSUJMRV9TVEFURSIsImlzVmlzaWJsZSIsIm9uU3lzdGVtVWlJc1Zpc2libGVTdGF0ZVVwZGF0ZV8iLCJJTlRFUkFDVElWRV9DT01QT05FTlRfU1RBVEUiLCJjb21wb25lbnQiLCJoaWRlT25Gb2N1c2VkU3RhdGVfIiwic3RhdGUiLCJGT0NVU0VEIiwibXV0YXRlIiwiYXBwZW5kQ2hpbGQiLCJoaW50Q2xhc3MiLCJnZXQiLCJVSV9TVEFURSIsIk1PQklMRSIsImJ1aWxkIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwicmVtb3ZlIiwiaGlkZVRpbWVvdXQiLCJoaWRlQWZ0ZXJUaW1lb3V0IiwiU0hBUkVfTUVOVV9TVEFURSIsInNob3dIaW50XyIsInRpbWVvdXQiLCJkZWxheSIsImhpZGVJbnRlcm5hbF8iLCJjYW5jZWwiLCJhZGQiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJoaWRlQWxsTmF2aWdhdGlvbkhpbnQiLCJpc0FjdGl2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsR0FBUjtBQUNBLFNBQ0VDLHNCQURGLEVBRUVDLGFBRkYsRUFHRUMsTUFIRixFQUlFQyxlQUpGO0FBTUEsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMseUJBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBLElBQU1DLFFBQVEsR0FBRztBQUNmQyxFQUFBQSxHQUFHLEVBQUUsT0FEVTtBQUVmQyxFQUFBQSxLQUFLLEVBQUVKLElBQUksQ0FBQztBQUNWLGFBQ0Usb0NBQ0E7QUFIUSxHQUFELENBRkk7QUFPZkssRUFBQUEsUUFBUSxFQUFFLENBQ1I7QUFDRUYsSUFBQUEsR0FBRyxFQUFFLEtBRFA7QUFFRUMsSUFBQUEsS0FBSyxFQUFFSixJQUFJLENBQUM7QUFBQyxlQUFTO0FBQVYsS0FBRCxDQUZiO0FBR0VLLElBQUFBLFFBQVEsRUFBRSxDQUNSO0FBQ0VGLE1BQUFBLEdBQUcsRUFBRSxLQURQO0FBRUVDLE1BQUFBLEtBQUssRUFBRUosSUFBSSxDQUFDO0FBQ1YsaUJBQVM7QUFEQyxPQUFELENBRmI7QUFLRUssTUFBQUEsUUFBUSxFQUFFLENBQ1I7QUFDRUYsUUFBQUEsR0FBRyxFQUFFLEtBRFA7QUFFRUMs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YUFBSzRCLHFCQUFMO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBcE1BO0FBQUE7QUFBQSxXQXFNRSw2QkFBb0JDLFFBQXBCLEVBQThCO0FBQzVCLFVBQUlBLFFBQUosRUFBYztBQUNaLGFBQUtELHFCQUFMO0FBQ0Q7QUFDRjtBQXpNSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaGludC0xLjAuY3NzJztcbmltcG9ydCB7XG4gIEVtYmVkZGVkQ29tcG9uZW50U3RhdGUsXG4gIFN0YXRlUHJvcGVydHksXG4gIFVJVHlwZSxcbiAgZ2V0U3RvcmVTZXJ2aWNlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7TG9jYWxpemVkU3RyaW5nSWR9IGZyb20gJyNzZXJ2aWNlL2xvY2FsaXphdGlvbi9zdHJpbmdzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Y3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3JlbmRlckFzRWxlbWVudH0gZnJvbSAnLi9zaW1wbGUtdGVtcGxhdGUnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHshLi9zaW1wbGUtdGVtcGxhdGUuRWxlbWVudERlZn0gKi9cbmNvbnN0IFRFTVBMQVRFID0ge1xuICB0YWc6ICdhc2lkZScsXG4gIGF0dHJzOiBkaWN0KHtcbiAgICAnY2xhc3MnOlxuICAgICAgJ2ktYW1waHRtbC1zdG9yeS1oaW50LWNvbnRhaW5lciAnICtcbiAgICAgICdpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0IGktYW1waHRtbC1oaWRkZW4nLFxuICB9KSxcbiAgY2hpbGRyZW46IFtcbiAgICB7XG4gICAgICB0YWc6ICdkaXYnLFxuICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktbmF2aWdhdGlvbi1oZWxwLW92ZXJsYXknfSksXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LW5hdmlnYXRpb24taGVscC1zZWN0aW9uIHByZXYtcGFnZScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktaGludC1wbGFjZWhvbGRlcid9KSxcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktaGludC10YXAtYnV0dG9uJ30pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oaW50LXRhcC1idXR0b24taWNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oaW50LXRhcC1idXR0b24tdGV4dCcsXG4gICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgIGxvY2FsaXplZFN0cmluZ0lkOlxuICAgICAgICAgICAgICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfSElOVF9VSV9QUkVWSU9VU19MQUJFTCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LW5hdmlnYXRpb24taGVscC1zZWN0aW9uIG5leHQtcGFnZScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktaGludC1wbGFjZWhvbGRlcid9KSxcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3QoeydjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktaGludC10YXAtYnV0dG9uJ30pLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oaW50LXRhcC1idXR0b24taWNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oaW50LXRhcC1idXR0b24tdGV4dCcsXG4gICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgIGxvY2FsaXplZFN0cmluZ0lkOlxuICAgICAgICAgICAgICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfSElOVF9VSV9ORVhUX0xBQkVMLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmNvbnN0IE5BVklHQVRJT05fT1ZFUkxBWV9DTEFTUyA9ICdzaG93LW5hdmlnYXRpb24tb3ZlcmxheSc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuY29uc3QgRklSU1RfUEFHRV9PVkVSTEFZX0NMQVNTID0gJ3Nob3ctZmlyc3QtcGFnZS1vdmVybGF5JztcblxuLyoqIEB0eXBlIHtudW1iZXJ9ICovXG5jb25zdCBOQVZJR0FUSU9OX09WRVJMQVlfVElNRU9VVCA9IDMwMDA7XG5cbi8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuY29uc3QgRklSU1RfUEFHRV9OQVZJR0FUSU9OX09WRVJMQVlfVElNRU9VVCA9IDI3NTtcblxuLyoqXG4gKiBVc2VyIEhpbnQgTGF5ZXIgZm9yIDxhbXAtc3Rvcnk+LlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlIaW50IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudEVsIEVsZW1lbnQgd2hlcmUgdG8gYXBwZW5kIHRoZSBjb21wb25lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgcGFyZW50RWwpIHtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSBXaGV0aGVyIHRoZSBjb21wb25lbnQgaXMgYnVpbHQuICovXG4gICAgdGhpcy5pc0J1aWx0XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2N1bWVudF8gPSB0aGlzLndpbl8uZG9jdW1lbnQ7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdnN5bmMtaW1wbC5Wc3luY30gKi9cbiAgICB0aGlzLnZzeW5jXyA9IFNlcnZpY2VzLnZzeW5jRm9yKHRoaXMud2luXyk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luXyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuaGludENvbnRhaW5lcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/KG51bWJlcnxzdHJpbmcpfSAqL1xuICAgIHRoaXMuaGludFRpbWVvdXRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5wYXJlbnRFbF8gPSBwYXJlbnRFbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgdGhlIGhpbnQgbGF5ZXIgRE9NLlxuICAgKi9cbiAgYnVpbGQoKSB7XG4gICAgaWYgKHRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pc0J1aWx0XyA9IHRydWU7XG5cbiAgICBjb25zdCByb290ID0gdGhpcy5kb2N1bWVudF8uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5oaW50Q29udGFpbmVyXyA9IHJlbmRlckFzRWxlbWVudCh0aGlzLmRvY3VtZW50XywgVEVNUExBVEUpO1xuICAgIGNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUocm9vdCwgdGhpcy5oaW50Q29udGFpbmVyXywgQ1NTKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlJUTF9TVEFURSxcbiAgICAgIChydGxTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlNZU1RFTV9VSV9JU19WSVNJQkxFX1NUQVRFLFxuICAgICAgKGlzVmlzaWJsZSkgPT4ge1xuICAgICAgICB0aGlzLm9uU3lzdGVtVWlJc1Zpc2libGVTdGF0ZVVwZGF0ZV8oaXNWaXNpYmxlKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFLFxuICAgICAgLyoqIEBwYXJhbSB7Li9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5JbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gY29tcG9uZW50ICovIChcbiAgICAgICAgY29tcG9uZW50XG4gICAgICApID0+IHtcbiAgICAgICAgdGhpcy5oaWRlT25Gb2N1c2VkU3RhdGVfKFxuICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9PT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5GT0NVU0VEXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnBhcmVudEVsXy5hcHBlbmRDaGlsZChyb290KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb21wb25lbnQgaXMgYnVpbHQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0J1aWx0KCkge1xuICAgIHJldHVybiB0aGlzLmlzQnVpbHRfO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3dzIHRoZSBnaXZlbiBoaW50LCBvbmx5IGlmIG5vdCBkZXNrdG9wLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGludENsYXNzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzaG93SGludF8oaGludENsYXNzKSB7XG4gICAgaWYgKHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSkgIT09IFVJVHlwZS5NT0JJTEUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCk7XG5cbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5oaW50Q29udGFpbmVyXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICBOQVZJR0FUSU9OX09WRVJMQVlfQ0xBU1MsXG4gICAgICAgIGhpbnRDbGFzcyA9PSBOQVZJR0FUSU9OX09WRVJMQVlfQ0xBU1NcbiAgICAgICk7XG4gICAgICB0aGlzLmhpbnRDb250YWluZXJfLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgIEZJUlNUX1BBR0VfT1ZFUkxBWV9DTEFTUyxcbiAgICAgICAgaGludENsYXNzID09IEZJUlNUX1BBR0VfT1ZFUkxBWV9DTEFTU1xuICAgICAgKTtcbiAgICAgIHRoaXMuaGludENvbnRhaW5lcl8uY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLWhpZGRlbicpO1xuXG4gICAgICBjb25zdCBoaWRlVGltZW91dCA9XG4gICAgICAgIGhpbnRDbGFzcyA9PSBOQVZJR0FUSU9OX09WRVJMQVlfQ0xBU1NcbiAgICAgICAgICA/IE5BVklHQVRJT05fT1ZFUkxBWV9USU1FT1VUXG4gICAgICAgICAgOiBGSVJTVF9QQUdFX05BVklHQVRJT05fT1ZFUkxBWV9USU1FT1VUO1xuICAgICAgdGhpcy5oaWRlQWZ0ZXJUaW1lb3V0KGhpZGVUaW1lb3V0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IG5hdmlnYXRpb24gb3ZlcmxheSBET00uXG4gICAqL1xuICBzaG93TmF2aWdhdGlvbk92ZXJsYXkoKSB7XG4gICAgLy8gRG9uJ3Qgc2hvdyB0aGUgb3ZlcmxheSBpZiB0aGUgc2hhcmUgbWVudSBpcyBvcGVuLlxuICAgIGlmICh0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuU0hBUkVfTUVOVV9TVEFURSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNob3dIaW50XyhOQVZJR0FUSU9OX09WRVJMQVlfQ0xBU1MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3cgbmF2aWdhdGlvbiBvdmVybGF5IERPTS5cbiAgICovXG4gIHNob3dGaXJzdFBhZ2VIaW50T3ZlcmxheSgpIHtcbiAgICB0aGlzLnNob3dIaW50XyhGSVJTVF9QQUdFX09WRVJMQVlfQ0xBU1MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBvdmVybGF5IGFmdGVyIGEgZ2l2ZW4gdGltZVxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZW91dFxuICAgKi9cbiAgaGlkZUFmdGVyVGltZW91dCh0aW1lb3V0KSB7XG4gICAgdGhpcy5oaW50VGltZW91dF8gPSB0aGlzLnRpbWVyXy5kZWxheSgoKSA9PiB0aGlzLmhpZGVJbnRlcm5hbF8oKSwgdGltZW91dCk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZSBhbGwgbmF2aWdhdGlvbiBoaW50cy5cbiAgICovXG4gIGhpZGVBbGxOYXZpZ2F0aW9uSGludCgpIHtcbiAgICB0aGlzLmhpZGVJbnRlcm5hbF8oKTtcblxuICAgIGlmICh0aGlzLmhpbnRUaW1lb3V0XyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy50aW1lcl8uY2FuY2VsKHRoaXMuaGludFRpbWVvdXRfKTtcbiAgICAgIHRoaXMuaGludFRpbWVvdXRfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaGlkZUludGVybmFsXygpIHtcbiAgICBpZiAoIXRoaXMuaXNCdWlsdCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuaGludENvbnRhaW5lcl8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWhpZGRlbicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBSVEwgc3RhdGUgdXBkYXRlcyBhbmQgdHJpZ2dlcnMgdGhlIFVJIGZvciBSVEwuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcnRsU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKSB7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHJ0bFN0YXRlXG4gICAgICAgID8gdGhpcy5oaW50Q29udGFpbmVyXy5zZXRBdHRyaWJ1dGUoJ2RpcicsICdydGwnKVxuICAgICAgICA6IHRoaXMuaGludENvbnRhaW5lcl8ucmVtb3ZlQXR0cmlidXRlKCdkaXInKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gc3lzdGVtIFVJIHZpc2liaWxpdHkgc3RhdGUgdXBkYXRlcy5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc1Zpc2libGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU3lzdGVtVWlJc1Zpc2libGVTdGF0ZVVwZGF0ZV8oaXNWaXNpYmxlKSB7XG4gICAgaWYgKCFpc1Zpc2libGUpIHtcbiAgICAgIHRoaXMuaGlkZUFsbE5hdmlnYXRpb25IaW50KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIG5hdmlnYXRpb24gaGludCBpZiB0b29sdGlwIGlzIG9wZW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBY3RpdmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpZGVPbkZvY3VzZWRTdGF0ZV8oaXNBY3RpdmUpIHtcbiAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuaGlkZUFsbE5hdmlnYXRpb25IaW50KCk7XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-hint.js