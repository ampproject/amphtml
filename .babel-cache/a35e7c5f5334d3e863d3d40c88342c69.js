function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { VisibilityState } from "../core/constants/visibility-state";
import { Observable } from "../core/data-structures/observable";
import { Deferred } from "../core/data-structures/promise";
import { hasNextNodeInDocumentOrder } from "../core/dom";
import { Services } from "../service";
import { Resource, ResourceState } from "../service/resource";
import { READY_SCAN_SIGNAL } from "../service/resources-interface";
import { dev } from "../log";
import { getMode } from "../mode";
import { Pass } from "../pass";
import { registerServiceBuilderForDoc } from "../service-helpers";
var TAG = 'inabox-resources';
var FOUR_FRAME_DELAY = 70;

/**
 * @implements {../service/resources-interface.ResourcesInterface}
 * @implements {../service.Disposable}
 * @visibleForTesting
 */
export var InaboxResources = /*#__PURE__*/function () {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  function InaboxResources(ampdoc) {
    var _this = this;

    _classCallCheck(this, InaboxResources);

    /** @const {!../service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @const @private {!Pass} */
    this.pass_ = new Pass(this.win, this.doPass_.bind(this), FOUR_FRAME_DELAY);

    /** @private @const {!Observable} */
    this.passObservable_ = new Observable();

    /** @const @private {!Deferred} */
    this.firstPassDone_ = new Deferred();

    /** @private {?IntersectionObserver} */
    this.inViewportObserver_ = null;
    var input = Services.inputFor(this.win);
    input.setupInputModeClasses(ampdoc);

    // TODO(#31246): launch the visibility logic in inabox as well.
    if (getMode(this.win).runtime != 'inabox') {
      ampdoc.onVisibilityChanged(function () {
        switch (ampdoc.getVisibilityState()) {
          case VisibilityState.PAUSED:
            _this.resources_.forEach(function (r) {
              return r.pause();
            });

            break;

          case VisibilityState.VISIBLE:
            _this.resources_.forEach(function (r) {
              return r.resume();
            });

            _this.
            /*OK*/
            schedulePass();

            break;
        }
      });
    }

    /** @private {!Array<Resource>} */
    this.pendingBuildResources_ = [];

    /** @private {boolean} */
    this.documentReady_ = false;
    this.ampdoc_.whenReady().then(function () {
      _this.documentReady_ = true;

      _this.buildReadyResources_();

      _this.
      /*OK*/
      schedulePass(1);
    });
  }

  /** @override */
  _createClass(InaboxResources, [{
    key: "dispose",
    value: function dispose() {
      this.resources_.forEach(function (r) {
        return r.unload();
      });
      this.resources_.length = 0;

      if (this.inViewportObserver_) {
        this.inViewportObserver_.disconnect();
        this.inViewportObserver_ = null;
      }
    }
    /** @override */

  }, {
    key: "get",
    value: function get() {
      return this.resources_.slice(0);
    }
    /** @override */

  }, {
    key: "getAmpdoc",
    value: function getAmpdoc() {
      return this.ampdoc_;
    }
    /** @override */

  }, {
    key: "getResourceForElement",
    value: function getResourceForElement(element) {
      return Resource.forElement(element);
    }
    /** @override */

  }, {
    key: "getResourceForElementOptional",
    value: function getResourceForElementOptional(element) {
      return Resource.forElementOptional(element);
    }
    /** @override */

  }, {
    key: "getScrollDirection",
    value: function getScrollDirection() {
      return 1;
    }
    /** @override */

  }, {
    key: "add",
    value: function add(element) {
      var resource = new Resource(++this.resourceIdCounter_, element, this);
      this.resources_.push(resource);
      dev().fine(TAG, 'resource added:', resource.debugid);
    }
    /** @override */

  }, {
    key: "upgraded",
    value: function upgraded(element) {
      var resource = Resource.forElement(element);
      this.pendingBuildResources_.push(resource);
      this.buildReadyResources_();
    }
    /** @override */

  }, {
    key: "remove",
    value: function remove(element) {
      var resource = Resource.forElementOptional(element);

      if (!resource) {
        return;
      }

      if (this.inViewportObserver_) {
        this.inViewportObserver_.unobserve(element);
      }

      var index = this.resources_.indexOf(resource);

      if (index !== -1) {
        this.resources_.splice(index, 1);
      }

      dev().fine(TAG, 'element removed:', resource.debugid);
    }
    /** @override */

  }, {
    key: "scheduleLayoutOrPreload",
    value: function scheduleLayoutOrPreload(unusedResource) {
      this.pass_.schedule();
    }
    /** @override */

  }, {
    key: "schedulePass",
    value: function schedulePass(opt_delay) {
      return this.pass_.schedule(opt_delay);
    }
    /** @override */

  }, {
    key: "updateOrEnqueueMutateTask",
    value: function updateOrEnqueueMutateTask(unusedResource, unusedNewRequest) {}
    /** @override */

  }, {
    key: "schedulePassVsync",
    value: function schedulePassVsync() {}
    /** @override */

  }, {
    key: "onNextPass",
    value: function onNextPass(callback) {
      this.passObservable_.add(callback);
    }
    /** @override */

  }, {
    key: "ampInitComplete",
    value: function ampInitComplete() {}
    /** @override */

  }, {
    key: "updateLayoutPriority",
    value: function updateLayoutPriority(unusedElement, unusedNewLayoutPriority) {// concept of element priority does not exist in inabox
    }
    /** @override */

  }, {
    key: "setRelayoutTop",
    value: function setRelayoutTop(unusedRelayoutTop) {}
    /** @override */

  }, {
    key: "maybeHeightChanged",
    value: function maybeHeightChanged() {}
    /**
     * @return {!Promise} when first pass executed.
     */

  }, {
    key: "whenFirstPass",
    value: function whenFirstPass() {
      return this.firstPassDone_.promise;
    }
    /**
     * @private
     */

  }, {
    key: "doPass_",
    value: function doPass_() {
      var now = Date.now();
      dev().fine(TAG, 'doPass');
      // measure in a batch
      this.resources_.forEach(function (resource) {
        if (!resource.isLayoutPending() || resource.element.R1()) {
          return;
        }

        resource.measure();
      });
      // mutation in a batch
      this.resources_.forEach(function (resource) {
        if (!resource.element.R1() && resource.getState() === ResourceState.READY_FOR_LAYOUT && resource.isDisplayed()) {
          resource.layoutScheduled(now);
          resource.startLayout();
        }
      });
      this.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
      this.passObservable_.fire();
      this.firstPassDone_.resolve();
    }
    /**
     * Builds any pending resouces if document is ready, or next element has been
     * added to DOM.
     * @private
     */

  }, {
    key: "buildReadyResources_",
    value: function buildReadyResources_() {
      var _this2 = this;

      for (var i = this.pendingBuildResources_.length - 1; i >= 0; i--) {
        var resource = this.pendingBuildResources_[i];

        if (this.documentReady_ || hasNextNodeInDocumentOrder(resource.element, this.ampdoc_.getRootNode())) {
          this.pendingBuildResources_.splice(i, 1);
          resource.build().then(function () {
            return _this2.
            /*OK*/
            schedulePass();
          });
          dev().fine(TAG, 'resource upgraded:', resource.debugid);
        }
      }
    }
  }]);

  return InaboxResources;
}();

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxResourcesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'resources', InaboxResources);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluYWJveC1yZXNvdXJjZXMuanMiXSwibmFtZXMiOlsiVmlzaWJpbGl0eVN0YXRlIiwiT2JzZXJ2YWJsZSIsIkRlZmVycmVkIiwiaGFzTmV4dE5vZGVJbkRvY3VtZW50T3JkZXIiLCJTZXJ2aWNlcyIsIlJlc291cmNlIiwiUmVzb3VyY2VTdGF0ZSIsIlJFQURZX1NDQU5fU0lHTkFMIiwiZGV2IiwiZ2V0TW9kZSIsIlBhc3MiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiVEFHIiwiRk9VUl9GUkFNRV9ERUxBWSIsIkluYWJveFJlc291cmNlcyIsImFtcGRvYyIsImFtcGRvY18iLCJ3aW4iLCJyZXNvdXJjZXNfIiwicmVzb3VyY2VJZENvdW50ZXJfIiwicGFzc18iLCJkb1Bhc3NfIiwiYmluZCIsInBhc3NPYnNlcnZhYmxlXyIsImZpcnN0UGFzc0RvbmVfIiwiaW5WaWV3cG9ydE9ic2VydmVyXyIsImlucHV0IiwiaW5wdXRGb3IiLCJzZXR1cElucHV0TW9kZUNsYXNzZXMiLCJydW50aW1lIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImdldFZpc2liaWxpdHlTdGF0ZSIsIlBBVVNFRCIsImZvckVhY2giLCJyIiwicGF1c2UiLCJWSVNJQkxFIiwicmVzdW1lIiwic2NoZWR1bGVQYXNzIiwicGVuZGluZ0J1aWxkUmVzb3VyY2VzXyIsImRvY3VtZW50UmVhZHlfIiwid2hlblJlYWR5IiwidGhlbiIsImJ1aWxkUmVhZHlSZXNvdXJjZXNfIiwidW5sb2FkIiwibGVuZ3RoIiwiZGlzY29ubmVjdCIsInNsaWNlIiwiZWxlbWVudCIsImZvckVsZW1lbnQiLCJmb3JFbGVtZW50T3B0aW9uYWwiLCJyZXNvdXJjZSIsInB1c2giLCJmaW5lIiwiZGVidWdpZCIsInVub2JzZXJ2ZSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInVudXNlZFJlc291cmNlIiwic2NoZWR1bGUiLCJvcHRfZGVsYXkiLCJ1bnVzZWROZXdSZXF1ZXN0IiwiY2FsbGJhY2siLCJhZGQiLCJ1bnVzZWRFbGVtZW50IiwidW51c2VkTmV3TGF5b3V0UHJpb3JpdHkiLCJ1bnVzZWRSZWxheW91dFRvcCIsInByb21pc2UiLCJub3ciLCJEYXRlIiwiaXNMYXlvdXRQZW5kaW5nIiwiUjEiLCJtZWFzdXJlIiwiZ2V0U3RhdGUiLCJSRUFEWV9GT1JfTEFZT1VUIiwiaXNEaXNwbGF5ZWQiLCJsYXlvdXRTY2hlZHVsZWQiLCJzdGFydExheW91dCIsInNpZ25hbHMiLCJzaWduYWwiLCJmaXJlIiwicmVzb2x2ZSIsImkiLCJnZXRSb290Tm9kZSIsImJ1aWxkIiwiaW5zdGFsbEluYWJveFJlc291cmNlc1NlcnZpY2VGb3JEb2MiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGVBQVI7QUFDQSxTQUFRQyxVQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLDBCQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFFBQVIsRUFBa0JDLGFBQWxCO0FBQ0EsU0FBUUMsaUJBQVI7QUFFQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyw0QkFBUjtBQUVBLElBQU1DLEdBQUcsR0FBRyxrQkFBWjtBQUNBLElBQU1DLGdCQUFnQixHQUFHLEVBQXpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxlQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsMkJBQVlDLE1BQVosRUFBb0I7QUFBQTs7QUFBQTs7QUFDbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWVELE1BQWY7O0FBRUE7QUFDQSxTQUFLRSxHQUFMLEdBQVdGLE1BQU0sQ0FBQ0UsR0FBbEI7O0FBRUE7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLEVBQWxCOztBQUVBO0FBQ0EsU0FBS0Msa0JBQUwsR0FBMEIsQ0FBMUI7O0FBRUE7QUFDQSxTQUFLQyxLQUFMLEdB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Q2tDLEtBQVQsR0FBaUIzQyxJQUFqQixDQUFzQjtBQUFBLG1CQUFNLE1BQUk7QUFBQztBQUFPSixZQUFBQSxZQUFaLEVBQU47QUFBQSxXQUF0QjtBQUNBOUIsVUFBQUEsR0FBRyxHQUFHNkMsSUFBTixDQUFXekMsR0FBWCxFQUFnQixvQkFBaEIsRUFBc0N1QyxRQUFRLENBQUNHLE9BQS9DO0FBQ0Q7QUFDRjtBQUNGO0FBdE5IOztBQUFBO0FBQUE7O0FBeU5BO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2dDLG1DQUFULENBQTZDdkUsTUFBN0MsRUFBcUQ7QUFDMURKLEVBQUFBLDRCQUE0QixDQUFDSSxNQUFELEVBQVMsV0FBVCxFQUFzQkQsZUFBdEIsQ0FBNUI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge2hhc05leHROb2RlSW5Eb2N1bWVudE9yZGVyfSBmcm9tICcjY29yZS9kb20nO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1Jlc291cmNlLCBSZXNvdXJjZVN0YXRlfSBmcm9tICcjc2VydmljZS9yZXNvdXJjZSc7XG5pbXBvcnQge1JFQURZX1NDQU5fU0lHTkFMfSBmcm9tICcjc2VydmljZS9yZXNvdXJjZXMtaW50ZXJmYWNlJztcblxuaW1wb3J0IHtkZXZ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtQYXNzfSBmcm9tICcuLi9wYXNzJztcbmltcG9ydCB7cmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuY29uc3QgVEFHID0gJ2luYWJveC1yZXNvdXJjZXMnO1xuY29uc3QgRk9VUl9GUkFNRV9ERUxBWSA9IDcwO1xuXG4vKipcbiAqIEBpbXBsZW1lbnRzIHsuLi9zZXJ2aWNlL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlfVxuICogQGltcGxlbWVudHMgey4uL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgSW5hYm94UmVzb3VyY2VzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgeyEuLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gYW1wZG9jLndpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhUmVzb3VyY2U+fSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5yZXNvdXJjZUlkQ291bnRlcl8gPSAwO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IVBhc3N9ICovXG4gICAgdGhpcy5wYXNzXyA9IG5ldyBQYXNzKHRoaXMud2luLCB0aGlzLmRvUGFzc18uYmluZCh0aGlzKSwgRk9VUl9GUkFNRV9ERUxBWSk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshT2JzZXJ2YWJsZX0gKi9cbiAgICB0aGlzLnBhc3NPYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshRGVmZXJyZWR9ICovXG4gICAgdGhpcy5maXJzdFBhc3NEb25lXyA9IG5ldyBEZWZlcnJlZCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9ICovXG4gICAgdGhpcy5pblZpZXdwb3J0T2JzZXJ2ZXJfID0gbnVsbDtcblxuICAgIGNvbnN0IGlucHV0ID0gU2VydmljZXMuaW5wdXRGb3IodGhpcy53aW4pO1xuICAgIGlucHV0LnNldHVwSW5wdXRNb2RlQ2xhc3NlcyhhbXBkb2MpO1xuXG4gICAgLy8gVE9ETygjMzEyNDYpOiBsYXVuY2ggdGhlIHZpc2liaWxpdHkgbG9naWMgaW4gaW5hYm94IGFzIHdlbGwuXG4gICAgaWYgKGdldE1vZGUodGhpcy53aW4pLnJ1bnRpbWUgIT0gJ2luYWJveCcpIHtcbiAgICAgIGFtcGRvYy5vblZpc2liaWxpdHlDaGFuZ2VkKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChhbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkpIHtcbiAgICAgICAgICBjYXNlIFZpc2liaWxpdHlTdGF0ZS5QQVVTRUQ6XG4gICAgICAgICAgICB0aGlzLnJlc291cmNlc18uZm9yRWFjaCgocikgPT4gci5wYXVzZSgpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEU6XG4gICAgICAgICAgICB0aGlzLnJlc291cmNlc18uZm9yRWFjaCgocikgPT4gci5yZXN1bWUoKSk7XG4gICAgICAgICAgICB0aGlzLi8qT0sqLyBzY2hlZHVsZVBhc3MoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTxSZXNvdXJjZT59ICovXG4gICAgdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5kb2N1bWVudFJlYWR5XyA9IGZhbHNlO1xuXG4gICAgdGhpcy5hbXBkb2NfLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5kb2N1bWVudFJlYWR5XyA9IHRydWU7XG4gICAgICB0aGlzLmJ1aWxkUmVhZHlSZXNvdXJjZXNfKCk7XG4gICAgICB0aGlzLi8qT0sqLyBzY2hlZHVsZVBhc3MoMSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNfLmZvckVhY2goKHIpID0+IHIudW5sb2FkKCkpO1xuICAgIHRoaXMucmVzb3VyY2VzXy5sZW5ndGggPSAwO1xuICAgIGlmICh0aGlzLmluVmlld3BvcnRPYnNlcnZlcl8pIHtcbiAgICAgIHRoaXMuaW5WaWV3cG9ydE9ic2VydmVyXy5kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLmluVmlld3BvcnRPYnNlcnZlcl8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc18uc2xpY2UoMCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEFtcGRvYygpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2NfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSZXNvdXJjZUZvckVsZW1lbnQoZWxlbWVudCkge1xuICAgIHJldHVybiBSZXNvdXJjZS5mb3JFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSZXNvdXJjZUZvckVsZW1lbnRPcHRpb25hbChlbGVtZW50KSB7XG4gICAgcmV0dXJuIFJlc291cmNlLmZvckVsZW1lbnRPcHRpb25hbChlbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U2Nyb2xsRGlyZWN0aW9uKCkge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhZGQoZWxlbWVudCkge1xuICAgIGNvbnN0IHJlc291cmNlID0gbmV3IFJlc291cmNlKCsrdGhpcy5yZXNvdXJjZUlkQ291bnRlcl8sIGVsZW1lbnQsIHRoaXMpO1xuICAgIHRoaXMucmVzb3VyY2VzXy5wdXNoKHJlc291cmNlKTtcbiAgICBkZXYoKS5maW5lKFRBRywgJ3Jlc291cmNlIGFkZGVkOicsIHJlc291cmNlLmRlYnVnaWQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1cGdyYWRlZChlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzb3VyY2UgPSBSZXNvdXJjZS5mb3JFbGVtZW50KGVsZW1lbnQpO1xuICAgIHRoaXMucGVuZGluZ0J1aWxkUmVzb3VyY2VzXy5wdXNoKHJlc291cmNlKTtcbiAgICB0aGlzLmJ1aWxkUmVhZHlSZXNvdXJjZXNfKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbW92ZShlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzb3VyY2UgPSBSZXNvdXJjZS5mb3JFbGVtZW50T3B0aW9uYWwoZWxlbWVudCk7XG4gICAgaWYgKCFyZXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5pblZpZXdwb3J0T2JzZXJ2ZXJfKSB7XG4gICAgICB0aGlzLmluVmlld3BvcnRPYnNlcnZlcl8udW5vYnNlcnZlKGVsZW1lbnQpO1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmVzb3VyY2VzXy5pbmRleE9mKHJlc291cmNlKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLnJlc291cmNlc18uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgZGV2KCkuZmluZShUQUcsICdlbGVtZW50IHJlbW92ZWQ6JywgcmVzb3VyY2UuZGVidWdpZCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkKHVudXNlZFJlc291cmNlKSB7XG4gICAgdGhpcy5wYXNzXy5zY2hlZHVsZSgpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzY2hlZHVsZVBhc3Mob3B0X2RlbGF5KSB7XG4gICAgcmV0dXJuIHRoaXMucGFzc18uc2NoZWR1bGUob3B0X2RlbGF5KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdXBkYXRlT3JFbnF1ZXVlTXV0YXRlVGFzayh1bnVzZWRSZXNvdXJjZSwgdW51c2VkTmV3UmVxdWVzdCkge31cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlUGFzc1ZzeW5jKCkge31cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uTmV4dFBhc3MoY2FsbGJhY2spIHtcbiAgICB0aGlzLnBhc3NPYnNlcnZhYmxlXy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhbXBJbml0Q29tcGxldGUoKSB7fVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdXBkYXRlTGF5b3V0UHJpb3JpdHkodW51c2VkRWxlbWVudCwgdW51c2VkTmV3TGF5b3V0UHJpb3JpdHkpIHtcbiAgICAvLyBjb25jZXB0IG9mIGVsZW1lbnQgcHJpb3JpdHkgZG9lcyBub3QgZXhpc3QgaW4gaW5hYm94XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNldFJlbGF5b3V0VG9wKHVudXNlZFJlbGF5b3V0VG9wKSB7fVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbWF5YmVIZWlnaHRDaGFuZ2VkKCkge31cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2V9IHdoZW4gZmlyc3QgcGFzcyBleGVjdXRlZC5cbiAgICovXG4gIHdoZW5GaXJzdFBhc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlyc3RQYXNzRG9uZV8ucHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZG9QYXNzXygpIHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGRldigpLmZpbmUoVEFHLCAnZG9QYXNzJyk7XG4gICAgLy8gbWVhc3VyZSBpbiBhIGJhdGNoXG4gICAgdGhpcy5yZXNvdXJjZXNfLmZvckVhY2goKHJlc291cmNlKSA9PiB7XG4gICAgICBpZiAoIXJlc291cmNlLmlzTGF5b3V0UGVuZGluZygpIHx8IHJlc291cmNlLmVsZW1lbnQuUjEoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvdXJjZS5tZWFzdXJlKCk7XG4gICAgfSk7XG4gICAgLy8gbXV0YXRpb24gaW4gYSBiYXRjaFxuICAgIHRoaXMucmVzb3VyY2VzXy5mb3JFYWNoKChyZXNvdXJjZSkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAhcmVzb3VyY2UuZWxlbWVudC5SMSgpICYmXG4gICAgICAgIHJlc291cmNlLmdldFN0YXRlKCkgPT09IFJlc291cmNlU3RhdGUuUkVBRFlfRk9SX0xBWU9VVCAmJlxuICAgICAgICByZXNvdXJjZS5pc0Rpc3BsYXllZCgpXG4gICAgICApIHtcbiAgICAgICAgcmVzb3VyY2UubGF5b3V0U2NoZWR1bGVkKG5vdyk7XG4gICAgICAgIHJlc291cmNlLnN0YXJ0TGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFtcGRvY18uc2lnbmFscygpLnNpZ25hbChSRUFEWV9TQ0FOX1NJR05BTCk7XG4gICAgdGhpcy5wYXNzT2JzZXJ2YWJsZV8uZmlyZSgpO1xuICAgIHRoaXMuZmlyc3RQYXNzRG9uZV8ucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbnkgcGVuZGluZyByZXNvdWNlcyBpZiBkb2N1bWVudCBpcyByZWFkeSwgb3IgbmV4dCBlbGVtZW50IGhhcyBiZWVuXG4gICAqIGFkZGVkIHRvIERPTS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkUmVhZHlSZXNvdXJjZXNfKCkge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnBlbmRpbmdCdWlsZFJlc291cmNlc18ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHJlc291cmNlID0gdGhpcy5wZW5kaW5nQnVpbGRSZXNvdXJjZXNfW2ldO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmRvY3VtZW50UmVhZHlfIHx8XG4gICAgICAgIGhhc05leHROb2RlSW5Eb2N1bWVudE9yZGVyKHJlc291cmNlLmVsZW1lbnQsIHRoaXMuYW1wZG9jXy5nZXRSb290Tm9kZSgpKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0J1aWxkUmVzb3VyY2VzXy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHJlc291cmNlLmJ1aWxkKCkudGhlbigoKSA9PiB0aGlzLi8qT0sqLyBzY2hlZHVsZVBhc3MoKSk7XG4gICAgICAgIGRldigpLmZpbmUoVEFHLCAncmVzb3VyY2UgdXBncmFkZWQ6JywgcmVzb3VyY2UuZGVidWdpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbEluYWJveFJlc291cmNlc1NlcnZpY2VGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAncmVzb3VyY2VzJywgSW5hYm94UmVzb3VyY2VzKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/inabox/inabox-resources.js