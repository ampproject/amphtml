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

/* eslint-disable no-unused-vars */

/**
 * @interface
 */
export var MutatorInterface = /*#__PURE__*/function () {
  function MutatorInterface() {
    _classCallCheck(this, MutatorInterface);
  }

  _createClass(MutatorInterface, [{
    key: "forceChangeSize",
    value:
    /**
     * Requests the runtime to change the element's size. When the size is
     * successfully updated then the opt_callback is called.
     * @param {!Element} element
     * @param {number|undefined} newHeight
     * @param {number|undefined} newWidth
     * @param {function()=} opt_callback A callback function.
     * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
     */
    function forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {}
    /**
     * Return a promise that requests the runtime to update the size of
     * this element to the specified value.
     * The runtime will schedule this request and attempt to process it
     * as soon as possible. However, unlike in {@link forceChangeSize}, the runtime
     * may refuse to make a change in which case it will reject promise, call the
     * `overflowCallback` method on the target resource with the height value.
     * Overflow callback is expected to provide the reader with the user action
     * to update the height manually.
     * Note that the runtime does not call the `overflowCallback` method if the
     * requested height is 0 or negative.
     * If the height is successfully updated then the promise is resolved.
     * @param {!Element} element
     * @param {number|undefined} newHeight
     * @param {number|undefined} newWidth
     * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
     * @return {!Promise}
     * @param {?Event=} opt_event
     */

  }, {
    key: "requestChangeSize",
    value: function requestChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {}
    /**
     * Expands the element.
     * @param {!Element} element
     */

  }, {
    key: "expandElement",
    value: function expandElement(element) {}
    /**
     * Return a promise that requests runtime to collapse this element.
     * The runtime will schedule this request and first attempt to resize
     * the element to height and width 0. If success runtime will set element
     * display to none, and notify element owner of this collapse.
     * @param {!Element} element
     * @return {!Promise}
     */

  }, {
    key: "attemptCollapse",
    value: function attemptCollapse(element) {}
    /**
     * Collapses the element: ensures that it's `display:none`, notifies its
     * owner and updates the layout box.
     * @param {!Element} element
     */

  }, {
    key: "collapseElement",
    value: function collapseElement(element) {}
    /**
     * Runs the specified measure, which is called in the "measure" vsync phase.
     * This is simply a proxy to the privileged vsync service.
     *
     * @param {function()} measurer
     * @return {!Promise}
     */

  }, {
    key: "measureElement",
    value: function measureElement(measurer) {}
    /**
     * Runs the specified mutation on the element and ensures that remeasures and
     * layouts performed for the affected elements.
     *
     * This method should be called whenever a significant mutations are done
     * on the DOM that could affect layout of elements inside this subtree or
     * its siblings. The top-most affected element should be specified as the
     * first argument to this method and all the mutation work should be done
     * in the mutator callback which is called in the "mutation" vsync phase.
     *
     * By default, all mutations force a remeasure. If you know that a mutation
     * cannot cause a change to the layout, you may use the skipRemeasure arg.
     *
     * @param {!Element} element
     * @param {function()} mutator
     * @param {boolean=} skipRemeasure
     * @return {!Promise}
     */

  }, {
    key: "mutateElement",
    value: function mutateElement(element, mutator, skipRemeasure) {}
    /**
     * Runs the specified mutation on the element and ensures that remeasures and
     * layouts performed for the affected elements.
     *
     * This method should be called whenever a significant mutations are done
     * on the DOM that could affect layout of elements inside this subtree or
     * its siblings. The top-most affected element should be specified as the
     * first argument to this method and all the mutation work should be done
     * in the mutator callback which is called in the "mutation" vsync phase.
     *
     * @param {!Element} element
     * @param {?function()} measurer
     * @param {function()} mutator
     * @return {!Promise}
     */

  }, {
    key: "measureMutateElement",
    value: function measureMutateElement(element, measurer, mutator) {}
  }]);

  return MutatorInterface;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm11dGF0b3ItaW50ZXJmYWNlLmpzIl0sIm5hbWVzIjpbIk11dGF0b3JJbnRlcmZhY2UiLCJlbGVtZW50IiwibmV3SGVpZ2h0IiwibmV3V2lkdGgiLCJvcHRfY2FsbGJhY2siLCJvcHRfbmV3TWFyZ2lucyIsIm9wdF9ldmVudCIsIm1lYXN1cmVyIiwibXV0YXRvciIsInNraXBSZW1lYXN1cmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQSxnQkFBYjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSw2QkFBZ0JDLE9BQWhCLEVBQXlCQyxTQUF6QixFQUFvQ0MsUUFBcEMsRUFBOENDLFlBQTlDLEVBQTREQyxjQUE1RCxFQUE0RSxDQUFFO0FBRTlFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlCQTtBQUFBO0FBQUEsV0ErQkUsMkJBQWtCSixPQUFsQixFQUEyQkMsU0FBM0IsRUFBc0NDLFFBQXRDLEVBQWdERSxjQUFoRCxFQUFnRUMsU0FBaEUsRUFBMkUsQ0FBRTtBQUU3RTtBQUNGO0FBQ0E7QUFDQTs7QUFwQ0E7QUFBQTtBQUFBLFdBcUNFLHVCQUFjTCxPQUFkLEVBQXVCLENBQUU7QUFFekI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5Q0E7QUFBQTtBQUFBLFdBK0NFLHlCQUFnQkEsT0FBaEIsRUFBeUIsQ0FBRTtBQUUzQjtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXJEQTtBQUFBO0FBQUEsV0FzREUseUJBQWdCQSxPQUFoQixFQUF5QixDQUFFO0FBRTNCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlEQTtBQUFBO0FBQUEsV0ErREUsd0JBQWVNLFFBQWYsRUFBeUIsQ0FBRTtBQUUzQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbEZBO0FBQUE7QUFBQSxXQW1GRSx1QkFBY04sT0FBZCxFQUF1Qk8sT0FBdkIsRUFBZ0NDLGFBQWhDLEVBQStDLENBQUU7QUFFakQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5HQTtBQUFBO0FBQUEsV0FvR0UsOEJBQXFCUixPQUFyQixFQUE4Qk0sUUFBOUIsRUFBd0NDLE9BQXhDLEVBQWlELENBQUU7QUFwR3JEOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbi8qKlxuICogQGludGVyZmFjZVxuICovXG5leHBvcnQgY2xhc3MgTXV0YXRvckludGVyZmFjZSB7XG4gIC8qKlxuICAgKiBSZXF1ZXN0cyB0aGUgcnVudGltZSB0byBjaGFuZ2UgdGhlIGVsZW1lbnQncyBzaXplLiBXaGVuIHRoZSBzaXplIGlzXG4gICAqIHN1Y2Nlc3NmdWxseSB1cGRhdGVkIHRoZW4gdGhlIG9wdF9jYWxsYmFjayBpcyBjYWxsZWQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBuZXdIZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBuZXdXaWR0aFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk9fSBvcHRfY2FsbGJhY2sgQSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHshLi4vbGF5b3V0LXJlY3QuTGF5b3V0TWFyZ2luc0NoYW5nZURlZj19IG9wdF9uZXdNYXJnaW5zXG4gICAqL1xuICBmb3JjZUNoYW5nZVNpemUoZWxlbWVudCwgbmV3SGVpZ2h0LCBuZXdXaWR0aCwgb3B0X2NhbGxiYWNrLCBvcHRfbmV3TWFyZ2lucykge31cblxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHJlcXVlc3RzIHRoZSBydW50aW1lIHRvIHVwZGF0ZSB0aGUgc2l6ZSBvZlxuICAgKiB0aGlzIGVsZW1lbnQgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICogVGhlIHJ1bnRpbWUgd2lsbCBzY2hlZHVsZSB0aGlzIHJlcXVlc3QgYW5kIGF0dGVtcHQgdG8gcHJvY2VzcyBpdFxuICAgKiBhcyBzb29uIGFzIHBvc3NpYmxlLiBIb3dldmVyLCB1bmxpa2UgaW4ge0BsaW5rIGZvcmNlQ2hhbmdlU2l6ZX0sIHRoZSBydW50aW1lXG4gICAqIG1heSByZWZ1c2UgdG8gbWFrZSBhIGNoYW5nZSBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmVqZWN0IHByb21pc2UsIGNhbGwgdGhlXG4gICAqIGBvdmVyZmxvd0NhbGxiYWNrYCBtZXRob2Qgb24gdGhlIHRhcmdldCByZXNvdXJjZSB3aXRoIHRoZSBoZWlnaHQgdmFsdWUuXG4gICAqIE92ZXJmbG93IGNhbGxiYWNrIGlzIGV4cGVjdGVkIHRvIHByb3ZpZGUgdGhlIHJlYWRlciB3aXRoIHRoZSB1c2VyIGFjdGlvblxuICAgKiB0byB1cGRhdGUgdGhlIGhlaWdodCBtYW51YWxseS5cbiAgICogTm90ZSB0aGF0IHRoZSBydW50aW1lIGRvZXMgbm90IGNhbGwgdGhlIGBvdmVyZmxvd0NhbGxiYWNrYCBtZXRob2QgaWYgdGhlXG4gICAqIHJlcXVlc3RlZCBoZWlnaHQgaXMgMCBvciBuZWdhdGl2ZS5cbiAgICogSWYgdGhlIGhlaWdodCBpcyBzdWNjZXNzZnVsbHkgdXBkYXRlZCB0aGVuIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gbmV3SGVpZ2h0XG4gICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gbmV3V2lkdGhcbiAgICogQHBhcmFtIHshLi4vbGF5b3V0LXJlY3QuTGF5b3V0TWFyZ2luc0NoYW5nZURlZj19IG9wdF9uZXdNYXJnaW5zXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcGFyYW0gez9FdmVudD19IG9wdF9ldmVudFxuICAgKi9cbiAgcmVxdWVzdENoYW5nZVNpemUoZWxlbWVudCwgbmV3SGVpZ2h0LCBuZXdXaWR0aCwgb3B0X25ld01hcmdpbnMsIG9wdF9ldmVudCkge31cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGUgZWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgZXhwYW5kRWxlbWVudChlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgcmVxdWVzdHMgcnVudGltZSB0byBjb2xsYXBzZSB0aGlzIGVsZW1lbnQuXG4gICAqIFRoZSBydW50aW1lIHdpbGwgc2NoZWR1bGUgdGhpcyByZXF1ZXN0IGFuZCBmaXJzdCBhdHRlbXB0IHRvIHJlc2l6ZVxuICAgKiB0aGUgZWxlbWVudCB0byBoZWlnaHQgYW5kIHdpZHRoIDAuIElmIHN1Y2Nlc3MgcnVudGltZSB3aWxsIHNldCBlbGVtZW50XG4gICAqIGRpc3BsYXkgdG8gbm9uZSwgYW5kIG5vdGlmeSBlbGVtZW50IG93bmVyIG9mIHRoaXMgY29sbGFwc2UuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhdHRlbXB0Q29sbGFwc2UoZWxlbWVudCkge31cblxuICAvKipcbiAgICogQ29sbGFwc2VzIHRoZSBlbGVtZW50OiBlbnN1cmVzIHRoYXQgaXQncyBgZGlzcGxheTpub25lYCwgbm90aWZpZXMgaXRzXG4gICAqIG93bmVyIGFuZCB1cGRhdGVzIHRoZSBsYXlvdXQgYm94LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCkge31cblxuICAvKipcbiAgICogUnVucyB0aGUgc3BlY2lmaWVkIG1lYXN1cmUsIHdoaWNoIGlzIGNhbGxlZCBpbiB0aGUgXCJtZWFzdXJlXCIgdnN5bmMgcGhhc2UuXG4gICAqIFRoaXMgaXMgc2ltcGx5IGEgcHJveHkgdG8gdGhlIHByaXZpbGVnZWQgdnN5bmMgc2VydmljZS5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBtZWFzdXJlclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG1lYXN1cmVFbGVtZW50KG1lYXN1cmVyKSB7fVxuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBzcGVjaWZpZWQgbXV0YXRpb24gb24gdGhlIGVsZW1lbnQgYW5kIGVuc3VyZXMgdGhhdCByZW1lYXN1cmVzIGFuZFxuICAgKiBsYXlvdXRzIHBlcmZvcm1lZCBmb3IgdGhlIGFmZmVjdGVkIGVsZW1lbnRzLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBzaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIGEgc2lnbmlmaWNhbnQgbXV0YXRpb25zIGFyZSBkb25lXG4gICAqIG9uIHRoZSBET00gdGhhdCBjb3VsZCBhZmZlY3QgbGF5b3V0IG9mIGVsZW1lbnRzIGluc2lkZSB0aGlzIHN1YnRyZWUgb3JcbiAgICogaXRzIHNpYmxpbmdzLiBUaGUgdG9wLW1vc3QgYWZmZWN0ZWQgZWxlbWVudCBzaG91bGQgYmUgc3BlY2lmaWVkIGFzIHRoZVxuICAgKiBmaXJzdCBhcmd1bWVudCB0byB0aGlzIG1ldGhvZCBhbmQgYWxsIHRoZSBtdXRhdGlvbiB3b3JrIHNob3VsZCBiZSBkb25lXG4gICAqIGluIHRoZSBtdXRhdG9yIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBpbiB0aGUgXCJtdXRhdGlvblwiIHZzeW5jIHBoYXNlLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCBhbGwgbXV0YXRpb25zIGZvcmNlIGEgcmVtZWFzdXJlLiBJZiB5b3Uga25vdyB0aGF0IGEgbXV0YXRpb25cbiAgICogY2Fubm90IGNhdXNlIGEgY2hhbmdlIHRvIHRoZSBsYXlvdXQsIHlvdSBtYXkgdXNlIHRoZSBza2lwUmVtZWFzdXJlIGFyZy5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IG11dGF0b3JcbiAgICogQHBhcmFtIHtib29sZWFuPX0gc2tpcFJlbWVhc3VyZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG11dGF0ZUVsZW1lbnQoZWxlbWVudCwgbXV0YXRvciwgc2tpcFJlbWVhc3VyZSkge31cblxuICAvKipcbiAgICogUnVucyB0aGUgc3BlY2lmaWVkIG11dGF0aW9uIG9uIHRoZSBlbGVtZW50IGFuZCBlbnN1cmVzIHRoYXQgcmVtZWFzdXJlcyBhbmRcbiAgICogbGF5b3V0cyBwZXJmb3JtZWQgZm9yIHRoZSBhZmZlY3RlZCBlbGVtZW50cy5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBhIHNpZ25pZmljYW50IG11dGF0aW9ucyBhcmUgZG9uZVxuICAgKiBvbiB0aGUgRE9NIHRoYXQgY291bGQgYWZmZWN0IGxheW91dCBvZiBlbGVtZW50cyBpbnNpZGUgdGhpcyBzdWJ0cmVlIG9yXG4gICAqIGl0cyBzaWJsaW5ncy4gVGhlIHRvcC1tb3N0IGFmZmVjdGVkIGVsZW1lbnQgc2hvdWxkIGJlIHNwZWNpZmllZCBhcyB0aGVcbiAgICogZmlyc3QgYXJndW1lbnQgdG8gdGhpcyBtZXRob2QgYW5kIGFsbCB0aGUgbXV0YXRpb24gd29yayBzaG91bGQgYmUgZG9uZVxuICAgKiBpbiB0aGUgbXV0YXRvciBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgaW4gdGhlIFwibXV0YXRpb25cIiB2c3luYyBwaGFzZS5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0gez9mdW5jdGlvbigpfSBtZWFzdXJlclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IG11dGF0b3JcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBtZWFzdXJlTXV0YXRlRWxlbWVudChlbGVtZW50LCBtZWFzdXJlciwgbXV0YXRvcikge31cbn1cbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/mutator-interface.js