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
import { dev } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { renderAsElement } from "./simple-template";

/** @const {string} */
var SPINNER_ACTIVE_ATTRIBUTE = 'active';

/** @private @const {!./simple-template.ElementDef} */
var SPINNER = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-spinner',
    'aria-hidden': 'true',
    'aria-label': 'Loading video'
  }),
  children: [{
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-spinner-container'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-spinner-layer'
      }),
      children: [{
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-spinner-circle-clipper left'
        })
      }, {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-spinner-circle-clipper right'
        })
      }]
    }]
  }]
};

/**
 * Loading spinner UI element.
 */
export var LoadingSpinner = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   */
  function LoadingSpinner(doc) {
    _classCallCheck(this, LoadingSpinner);

    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @public {?Element} */
    this.root_ = null;

    /** @private {boolean} */
    this.isActive_ = false;
  }

  /**
   * @return {!Element}
   */
  _createClass(LoadingSpinner, [{
    key: "build",
    value: function build() {
      if (this.root_) {
        return this.root_;
      }

      this.root_ = renderAsElement(this.doc_, SPINNER);
      return this.getRoot();
    }
    /** @return {!Element} */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return dev().assertElement(this.root_);
    }
    /** @param {boolean} isActive */

  }, {
    key: "toggle",
    value: function toggle(isActive) {
      if (isActive === this.isActive_) {
        return;
      }

      if (isActive) {
        this.root_.setAttribute(SPINNER_ACTIVE_ATTRIBUTE, '');
        this.root_.setAttribute('aria-hidden', 'false');
      } else {
        this.root_.removeAttribute(SPINNER_ACTIVE_ATTRIBUTE);
        this.root_.setAttribute('aria-hidden', 'true');
      }

      this.isActive_ = isActive;
    }
  }]);

  return LoadingSpinner;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRpbmctc3Bpbm5lci5qcyJdLCJuYW1lcyI6WyJkZXYiLCJkaWN0IiwicmVuZGVyQXNFbGVtZW50IiwiU1BJTk5FUl9BQ1RJVkVfQVRUUklCVVRFIiwiU1BJTk5FUiIsInRhZyIsImF0dHJzIiwiY2hpbGRyZW4iLCJMb2FkaW5nU3Bpbm5lciIsImRvYyIsImRvY18iLCJyb290XyIsImlzQWN0aXZlXyIsImdldFJvb3QiLCJhc3NlcnRFbGVtZW50IiwiaXNBY3RpdmUiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLEdBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBLElBQU1DLHdCQUF3QixHQUFHLFFBQWpDOztBQUVBO0FBQ0EsSUFBTUMsT0FBTyxHQUFHO0FBQ2RDLEVBQUFBLEdBQUcsRUFBRSxLQURTO0FBRWRDLEVBQUFBLEtBQUssRUFBRUwsSUFBSSxDQUFDO0FBQ1YsYUFBUyx5QkFEQztBQUVWLG1CQUFlLE1BRkw7QUFHVixrQkFBYztBQUhKLEdBQUQsQ0FGRztBQU9kTSxFQUFBQSxRQUFRLEVBQUUsQ0FDUjtBQUNFRixJQUFBQSxHQUFHLEVBQUUsS0FEUDtBQUVFQyxJQUFBQSxLQUFLLEVBQUVMLElBQUksQ0FBQztBQUNWLGVBQVM7QUFEQyxLQUFELENBRmI7QUFLRU0sSUFBQUEsUUFBUSxFQUFFLENBQ1I7QUFDRUYsTUFBQUEsR0FBRyxFQUFFLEtBRFA7QUFFRUMsTUFBQUEsS0FBSyxFQUFFTCxJQUFJLENBQUM7QUFDVixpQkFBUztBQURDLE9BQUQsQ0FGYjtBQUtFTSxNQUFBQSxRQUFRLEVBQUUsQ0FDUjtBQUNFRixRQUFBQSxHQUFHLEVBQUUsS0FEUDtBQUVFQyxRQUFBQSxLQUFLLEVBQUVMLElBQUksQ0FBQztBQUNWLG1CQUFTO0FBREMsU0FBRDtBQUZiLE9BRFEsRUFPUjtBQUNFSSxRQUFBQSxHQUFHLEVBQUUsS0FEUDtBQUVFQyxRQUFBQSxLQUFLLEVBQUVMLElBQUksQ0FBQztBQUNWLG1CQUFTO0FBREMsU0FBRDtBQUZiLE9BUFE7QUFMWixLQURRO0FBTFosR0FEUTtBQVBJLENBQWhCOztBQXVDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhTyxjQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsMEJBQVlDLEdBQVosRUFBaUI7QUFBQTs7QUFDZjtBQUNBLFNBQUtDLElBQUwsR0FBWUQsR0FBWjs7QUFFQTtBQUNBLFNBQUtFLEtBQUwsR0FBYSxJQUFiOztBQUVBO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixLQUFqQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQWpCQTtBQUFBO0FBQUEsV0FrQkUsaUJBQVE7QUFDTixVQUFJLEtBQUtELEtBQVQsRUFBZ0I7QUFDZCxlQUFPLEtBQUtBLEtBQVo7QUFDRDs7QUFFRCxXQUFLQSxLQUFMLEdBQWFULGVBQWUsQ0FBQyxLQUFLUSxJQUFOLEVBQVlOLE9BQVosQ0FBNUI7QUFFQSxhQUFPLEtBQUtTLE9BQUwsRUFBUDtBQUNEO0FBRUQ7O0FBNUJGO0FBQUE7QUFBQSxXQTZCRSxtQkFBVTtBQUNSLGFBQU9iLEdBQUcsR0FBR2MsYUFBTixDQUFvQixLQUFLSCxLQUF6QixDQUFQO0FBQ0Q7QUFFRDs7QUFqQ0Y7QUFBQTtBQUFBLFdBa0NFLGdCQUFPSSxRQUFQLEVBQWlCO0FBQ2YsVUFBSUEsUUFBUSxLQUFLLEtBQUtILFNBQXRCLEVBQWlDO0FBQy9CO0FBQ0Q7O0FBQ0QsVUFBSUcsUUFBSixFQUFjO0FBQ1osYUFBS0osS0FBTCxDQUFXSyxZQUFYLENBQXdCYix3QkFBeEIsRUFBa0QsRUFBbEQ7QUFDQSxhQUFLUSxLQUFMLENBQVdLLFlBQVgsQ0FBd0IsYUFBeEIsRUFBdUMsT0FBdkM7QUFDRCxPQUhELE1BR087QUFDTCxhQUFLTCxLQUFMLENBQVdNLGVBQVgsQ0FBMkJkLHdCQUEzQjtBQUNBLGFBQUtRLEtBQUwsQ0FBV0ssWUFBWCxDQUF3QixhQUF4QixFQUF1QyxNQUF2QztBQUNEOztBQUNELFdBQUtKLFNBQUwsR0FBaUJHLFFBQWpCO0FBQ0Q7QUE5Q0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtyZW5kZXJBc0VsZW1lbnR9IGZyb20gJy4vc2ltcGxlLXRlbXBsYXRlJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgU1BJTk5FUl9BQ1RJVkVfQVRUUklCVVRFID0gJ2FjdGl2ZSc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3NpbXBsZS10ZW1wbGF0ZS5FbGVtZW50RGVmfSAqL1xuY29uc3QgU1BJTk5FUiA9IHtcbiAgdGFnOiAnZGl2JyxcbiAgYXR0cnM6IGRpY3Qoe1xuICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc3Bpbm5lcicsXG4gICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxuICAgICdhcmlhLWxhYmVsJzogJ0xvYWRpbmcgdmlkZW8nLFxuICB9KSxcbiAgY2hpbGRyZW46IFtcbiAgICB7XG4gICAgICB0YWc6ICdkaXYnLFxuICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LXNwaW5uZXItY29udGFpbmVyJyxcbiAgICAgIH0pLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1zcGlubmVyLWxheWVyJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1zcGlubmVyLWNpcmNsZS1jbGlwcGVyIGxlZnQnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LXNwaW5uZXItY2lyY2xlLWNsaXBwZXIgcmlnaHQnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn07XG5cbi8qKlxuICogTG9hZGluZyBzcGlubmVyIFVJIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2FkaW5nU3Bpbm5lciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihkb2MpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2NfID0gZG9jO1xuXG4gICAgLyoqIEBwdWJsaWMgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucm9vdF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNBY3RpdmVfID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICBidWlsZCgpIHtcbiAgICBpZiAodGhpcy5yb290Xykge1xuICAgICAgcmV0dXJuIHRoaXMucm9vdF87XG4gICAgfVxuXG4gICAgdGhpcy5yb290XyA9IHJlbmRlckFzRWxlbWVudCh0aGlzLmRvY18sIFNQSU5ORVIpO1xuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpO1xuICB9XG5cbiAgLyoqIEByZXR1cm4geyFFbGVtZW50fSAqL1xuICBnZXRSb290KCkge1xuICAgIHJldHVybiBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucm9vdF8pO1xuICB9XG5cbiAgLyoqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBY3RpdmUgKi9cbiAgdG9nZ2xlKGlzQWN0aXZlKSB7XG4gICAgaWYgKGlzQWN0aXZlID09PSB0aGlzLmlzQWN0aXZlXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgIHRoaXMucm9vdF8uc2V0QXR0cmlidXRlKFNQSU5ORVJfQUNUSVZFX0FUVFJJQlVURSwgJycpO1xuICAgICAgdGhpcy5yb290Xy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdF8ucmVtb3ZlQXR0cmlidXRlKFNQSU5ORVJfQUNUSVZFX0FUVFJJQlVURSk7XG4gICAgICB0aGlzLnJvb3RfLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgICB0aGlzLmlzQWN0aXZlXyA9IGlzQWN0aXZlO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/loading-spinner.js