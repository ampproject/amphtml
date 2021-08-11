function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { devAssert } from "../assert";
import { map } from "../types/object";

/** @template STATE */
export var FiniteStateMachine = /*#__PURE__*/function () {
  /**
   * Constructs a FSM using the bits defined in initialState as changeable
   * states.
   * @param {STATE} initialState
   */
  function FiniteStateMachine(initialState) {
    _classCallCheck(this, FiniteStateMachine);

    /**
     * The current state of the FSM
     * @private {STATE}
     */
    this.state_ = initialState;

    /**
     * Callbacks that are invoked when transitioning from an old state
     * to the new.
     * @private {Object<string, function()>}
     */
    this.transitions_ = map();
  }

  /**
   * Adds a transition callback that will be called when the oldState
   * transitions to the newState.
   * @param {STATE} oldState
   * @param {STATE} newState
   * @param {function()} callback
   */
  _createClass(FiniteStateMachine, [{
    key: "addTransition",
    value: function addTransition(oldState, newState, callback) {
      var transition = this.statesToTransition_(oldState, newState);
      devAssert(!this.transitions_[transition], 'cannot define a duplicate transition callback');
      this.transitions_[transition] = callback;
    }
    /**
     * Transitions to the newState and invokes the registered transition
     * callback, if one is defined.
     * @param {STATE} newState
     */

  }, {
    key: "setState",
    value: function setState(newState) {
      var oldState = this.state_;
      this.state_ = newState;
      var transition = this.statesToTransition_(oldState, newState);
      var callback = this.transitions_[transition];
      callback == null ? void 0 : callback();
    }
    /**
     * Transforms the state transition into a key which identifies a callback.
     * @private
     * @param {STATE} oldState
     * @param {STATE} newState
     * @return {string}
     */

  }, {
    key: "statesToTransition_",
    value: function statesToTransition_(oldState, newState) {
      return oldState + "|" + newState;
    }
  }]);

  return FiniteStateMachine;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbml0ZS1zdGF0ZS1tYWNoaW5lLmpzIl0sIm5hbWVzIjpbImRldkFzc2VydCIsIm1hcCIsIkZpbml0ZVN0YXRlTWFjaGluZSIsImluaXRpYWxTdGF0ZSIsInN0YXRlXyIsInRyYW5zaXRpb25zXyIsIm9sZFN0YXRlIiwibmV3U3RhdGUiLCJjYWxsYmFjayIsInRyYW5zaXRpb24iLCJzdGF0ZXNUb1RyYW5zaXRpb25fIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxTQUFSO0FBQ0EsU0FBUUMsR0FBUjs7QUFFQTtBQUNBLFdBQWFDLGtCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNFLDhCQUFZQyxZQUFaLEVBQTBCO0FBQUE7O0FBQ3hCO0FBQ0o7QUFDQTtBQUNBO0FBQ0ksU0FBS0MsTUFBTCxHQUFjRCxZQUFkOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLRSxZQUFMLEdBQW9CSixHQUFHLEVBQXZCO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUEzQkE7QUFBQTtBQUFBLFdBNEJFLHVCQUFjSyxRQUFkLEVBQXdCQyxRQUF4QixFQUFrQ0MsUUFBbEMsRUFBNEM7QUFDMUMsVUFBTUMsVUFBVSxHQUFHLEtBQUtDLG1CQUFMLENBQXlCSixRQUF6QixFQUFtQ0MsUUFBbkMsQ0FBbkI7QUFDQVAsTUFBQUEsU0FBUyxDQUNQLENBQUMsS0FBS0ssWUFBTCxDQUFrQkksVUFBbEIsQ0FETSxFQUVQLCtDQUZPLENBQVQ7QUFJQSxXQUFLSixZQUFMLENBQWtCSSxVQUFsQixJQUFnQ0QsUUFBaEM7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBekNBO0FBQUE7QUFBQSxXQTBDRSxrQkFBU0QsUUFBVCxFQUFtQjtBQUNqQixVQUFNRCxRQUFRLEdBQUcsS0FBS0YsTUFBdEI7QUFDQSxXQUFLQSxNQUFMLEdBQWNHLFFBQWQ7QUFFQSxVQUFNRSxVQUFVLEdBQUcsS0FBS0MsbUJBQUwsQ0FBeUJKLFFBQXpCLEVBQW1DQyxRQUFuQyxDQUFuQjtBQUNBLFVBQU1DLFFBQVEsR0FBRyxLQUFLSCxZQUFMLENBQWtCSSxVQUFsQixDQUFqQjtBQUNBRCxNQUFBQSxRQUFRLFFBQVIsWUFBQUEsUUFBUTtBQUNUO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBekRBO0FBQUE7QUFBQSxXQTBERSw2QkFBb0JGLFFBQXBCLEVBQThCQyxRQUE5QixFQUF3QztBQUN0QyxhQUFVRCxRQUFWLFNBQXNCQyxRQUF0QjtBQUNEO0FBNURIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJyNjb3JlL2Fzc2VydCc7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuLyoqIEB0ZW1wbGF0ZSBTVEFURSAqL1xuZXhwb3J0IGNsYXNzIEZpbml0ZVN0YXRlTWFjaGluZSB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgRlNNIHVzaW5nIHRoZSBiaXRzIGRlZmluZWQgaW4gaW5pdGlhbFN0YXRlIGFzIGNoYW5nZWFibGVcbiAgICogc3RhdGVzLlxuICAgKiBAcGFyYW0ge1NUQVRFfSBpbml0aWFsU3RhdGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxTdGF0ZSkge1xuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBGU01cbiAgICAgKiBAcHJpdmF0ZSB7U1RBVEV9XG4gICAgICovXG4gICAgdGhpcy5zdGF0ZV8gPSBpbml0aWFsU3RhdGU7XG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFja3MgdGhhdCBhcmUgaW52b2tlZCB3aGVuIHRyYW5zaXRpb25pbmcgZnJvbSBhbiBvbGQgc3RhdGVcbiAgICAgKiB0byB0aGUgbmV3LlxuICAgICAqIEBwcml2YXRlIHtPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbigpPn1cbiAgICAgKi9cbiAgICB0aGlzLnRyYW5zaXRpb25zXyA9IG1hcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSB0cmFuc2l0aW9uIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgb2xkU3RhdGVcbiAgICogdHJhbnNpdGlvbnMgdG8gdGhlIG5ld1N0YXRlLlxuICAgKiBAcGFyYW0ge1NUQVRFfSBvbGRTdGF0ZVxuICAgKiBAcGFyYW0ge1NUQVRFfSBuZXdTdGF0ZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNhbGxiYWNrXG4gICAqL1xuICBhZGRUcmFuc2l0aW9uKG9sZFN0YXRlLCBuZXdTdGF0ZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCB0cmFuc2l0aW9uID0gdGhpcy5zdGF0ZXNUb1RyYW5zaXRpb25fKG9sZFN0YXRlLCBuZXdTdGF0ZSk7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIXRoaXMudHJhbnNpdGlvbnNfW3RyYW5zaXRpb25dLFxuICAgICAgJ2Nhbm5vdCBkZWZpbmUgYSBkdXBsaWNhdGUgdHJhbnNpdGlvbiBjYWxsYmFjaydcbiAgICApO1xuICAgIHRoaXMudHJhbnNpdGlvbnNfW3RyYW5zaXRpb25dID0gY2FsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNpdGlvbnMgdG8gdGhlIG5ld1N0YXRlIGFuZCBpbnZva2VzIHRoZSByZWdpc3RlcmVkIHRyYW5zaXRpb25cbiAgICogY2FsbGJhY2ssIGlmIG9uZSBpcyBkZWZpbmVkLlxuICAgKiBAcGFyYW0ge1NUQVRFfSBuZXdTdGF0ZVxuICAgKi9cbiAgc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICBjb25zdCBvbGRTdGF0ZSA9IHRoaXMuc3RhdGVfO1xuICAgIHRoaXMuc3RhdGVfID0gbmV3U3RhdGU7XG5cbiAgICBjb25zdCB0cmFuc2l0aW9uID0gdGhpcy5zdGF0ZXNUb1RyYW5zaXRpb25fKG9sZFN0YXRlLCBuZXdTdGF0ZSk7XG4gICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLnRyYW5zaXRpb25zX1t0cmFuc2l0aW9uXTtcbiAgICBjYWxsYmFjaz8uKCk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyB0aGUgc3RhdGUgdHJhbnNpdGlvbiBpbnRvIGEga2V5IHdoaWNoIGlkZW50aWZpZXMgYSBjYWxsYmFjay5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTVEFURX0gb2xkU3RhdGVcbiAgICogQHBhcmFtIHtTVEFURX0gbmV3U3RhdGVcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGVzVG9UcmFuc2l0aW9uXyhvbGRTdGF0ZSwgbmV3U3RhdGUpIHtcbiAgICByZXR1cm4gYCR7b2xkU3RhdGV9fCR7bmV3U3RhdGV9YDtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/data-structures/finite-state-machine.js