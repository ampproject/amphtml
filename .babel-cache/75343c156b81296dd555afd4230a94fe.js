function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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

/**
 * @fileoverview This is a layer that allows a call to action in a story page.
 * With this, a user could link to an external site from inside a story using
 * the call to action layer, for example.
 *
 * Example:
 * ...
 * <amp-story-page>
 *   <amp-story-cta-layer>
 *     <a href="wwww.google.com"> Visit my site! </a>
 *   </amp-story-cta-layer>
 * <amp-story-page>
 * ...
 */
import { AmpStoryBaseLayer } from "./amp-story-base-layer";
import { addAttributesToElement, removeElement } from "../../../src/core/dom";
import { dict } from "../../../src/core/types/object";
import { matches } from "../../../src/core/dom/query";
import { user } from "../../../src/log";

/**
 * @type {string}
 * @const
 */
var TAG = 'amp-story-cta-layer';

/**
 * Call to action button layer template.
 *
 * No pre-rendering to let more computing-intensive elements (like
 * videos) get pre-rendered first. Since this layer will not contain
 * computing-intensive resources such as videos, we can just risk rendering
 * while the user is looking.
 */
export var AmpStoryCtaLayer = /*#__PURE__*/function (_AmpStoryBaseLayer) {
  _inherits(AmpStoryCtaLayer, _AmpStoryBaseLayer);

  var _super = _createSuper(AmpStoryCtaLayer);

  function AmpStoryCtaLayer() {
    _classCallCheck(this, AmpStoryCtaLayer);

    return _super.apply(this, arguments);
  }

  _createClass(AmpStoryCtaLayer, [{
    key: "buildCallback",
    value:
    /** @override */
    function buildCallback() {
      _get(_getPrototypeOf(AmpStoryCtaLayer.prototype), "buildCallback", this).call(this);

      this.setOrOverwriteAttributes_();
      this.checkAndRemoveLayerIfOnFirstPage_();
    }
    /**
     * Overwrite or set target attributes that are cta-layer-specific.
     * @private
     */

  }, {
    key: "setOrOverwriteAttributes_",
    value: function setOrOverwriteAttributes_() {
      var ctaLinks = this.element.querySelectorAll('a');

      for (var i = 0; i < ctaLinks.length; i++) {
        addAttributesToElement(ctaLinks[i], dict({
          'target': '_blank'
        }));

        if (!ctaLinks[i].getAttribute('role')) {
          addAttributesToElement(ctaLinks[i], dict({
            'role': 'link'
          }));
        }
      }

      var ctaButtons = this.element.querySelectorAll('button');

      for (var _i = 0; _i < ctaButtons.length; _i++) {
        if (!ctaButtons[_i].getAttribute('role')) {
          addAttributesToElement(ctaButtons[_i], dict({
            'role': 'button'
          }));
        }
      }
    }
    /**
     * CTA links or buttons are not allowed on the first amp-story page. Remove
     * the amp-story-cta-layer if it is found on the first page of the story.
     * @private
     */

  }, {
    key: "checkAndRemoveLayerIfOnFirstPage_",
    value: function checkAndRemoveLayerIfOnFirstPage_() {
      if (matches(this.element, 'amp-story-page:first-of-type > amp-story-cta-layer')) {
        removeElement(this.element);
        user().error(TAG, 'amp-story-cta-layer is not allowed on the first page' + ' of an amp-story.');
      }
    }
  }]);

  return AmpStoryCtaLayer;
}(AmpStoryBaseLayer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1jdGEtbGF5ZXIuanMiXSwibmFtZXMiOlsiQW1wU3RvcnlCYXNlTGF5ZXIiLCJhZGRBdHRyaWJ1dGVzVG9FbGVtZW50IiwicmVtb3ZlRWxlbWVudCIsImRpY3QiLCJtYXRjaGVzIiwidXNlciIsIlRBRyIsIkFtcFN0b3J5Q3RhTGF5ZXIiLCJzZXRPck92ZXJ3cml0ZUF0dHJpYnV0ZXNfIiwiY2hlY2tBbmRSZW1vdmVMYXllcklmT25GaXJzdFBhZ2VfIiwiY3RhTGlua3MiLCJlbGVtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImkiLCJsZW5ndGgiLCJnZXRBdHRyaWJ1dGUiLCJjdGFCdXR0b25zIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsaUJBQVI7QUFDQSxTQUFRQyxzQkFBUixFQUFnQ0MsYUFBaEM7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLElBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxHQUFHLEdBQUcscUJBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGdCQUFiO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUNFO0FBQ0EsNkJBQWdCO0FBQ2Q7O0FBQ0EsV0FBS0MseUJBQUw7QUFDQSxXQUFLQyxpQ0FBTDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBWEE7QUFBQTtBQUFBLFdBWUUscUNBQTRCO0FBQzFCLFVBQU1DLFFBQVEsR0FBRyxLQUFLQyxPQUFMLENBQWFDLGdCQUFiLENBQThCLEdBQTlCLENBQWpCOztBQUNBLFdBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0gsUUFBUSxDQUFDSSxNQUE3QixFQUFxQ0QsQ0FBQyxFQUF0QyxFQUEwQztBQUN4Q1osUUFBQUEsc0JBQXNCLENBQUNTLFFBQVEsQ0FBQ0csQ0FBRCxDQUFULEVBQWNWLElBQUksQ0FBQztBQUFDLG9CQUFVO0FBQVgsU0FBRCxDQUFsQixDQUF0Qjs7QUFFQSxZQUFJLENBQUNPLFFBQVEsQ0FBQ0csQ0FBRCxDQUFSLENBQVlFLFlBQVosQ0FBeUIsTUFBekIsQ0FBTCxFQUF1QztBQUNyQ2QsVUFBQUEsc0JBQXNCLENBQUNTLFFBQVEsQ0FBQ0csQ0FBRCxDQUFULEVBQWNWLElBQUksQ0FBQztBQUFDLG9CQUFRO0FBQVQsV0FBRCxDQUFsQixDQUF0QjtBQUNEO0FBQ0Y7O0FBRUQsVUFBTWEsVUFBVSxHQUFHLEtBQUtMLE9BQUwsQ0FBYUMsZ0JBQWIsQ0FBOEIsUUFBOUIsQ0FBbkI7O0FBQ0EsV0FBSyxJQUFJQyxFQUFDLEdBQUcsQ0FBYixFQUFnQkEsRUFBQyxHQUFHRyxVQUFVLENBQUNGLE1BQS9CLEVBQXVDRCxFQUFDLEVBQXhDLEVBQTRDO0FBQzFDLFlBQUksQ0FBQ0csVUFBVSxDQUFDSCxFQUFELENBQVYsQ0FBY0UsWUFBZCxDQUEyQixNQUEzQixDQUFMLEVBQXlDO0FBQ3ZDZCxVQUFBQSxzQkFBc0IsQ0FBQ2UsVUFBVSxDQUFDSCxFQUFELENBQVgsRUFBZ0JWLElBQUksQ0FBQztBQUFDLG9CQUFRO0FBQVQsV0FBRCxDQUFwQixDQUF0QjtBQUNEO0FBQ0Y7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBbENBO0FBQUE7QUFBQSxXQW1DRSw2Q0FBb0M7QUFDbEMsVUFDRUMsT0FBTyxDQUNMLEtBQUtPLE9BREEsRUFFTCxvREFGSyxDQURULEVBS0U7QUFDQVQsUUFBQUEsYUFBYSxDQUFDLEtBQUtTLE9BQU4sQ0FBYjtBQUNBTixRQUFBQSxJQUFJLEdBQUdZLEtBQVAsQ0FDRVgsR0FERixFQUVFLHlEQUNFLG1CQUhKO0FBS0Q7QUFDRjtBQWpESDs7QUFBQTtBQUFBLEVBQXNDTixpQkFBdEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgYSBsYXllciB0aGF0IGFsbG93cyBhIGNhbGwgdG8gYWN0aW9uIGluIGEgc3RvcnkgcGFnZS5cbiAqIFdpdGggdGhpcywgYSB1c2VyIGNvdWxkIGxpbmsgdG8gYW4gZXh0ZXJuYWwgc2l0ZSBmcm9tIGluc2lkZSBhIHN0b3J5IHVzaW5nXG4gKiB0aGUgY2FsbCB0byBhY3Rpb24gbGF5ZXIsIGZvciBleGFtcGxlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiAuLi5cbiAqIDxhbXAtc3RvcnktcGFnZT5cbiAqICAgPGFtcC1zdG9yeS1jdGEtbGF5ZXI+XG4gKiAgICAgPGEgaHJlZj1cInd3d3cuZ29vZ2xlLmNvbVwiPiBWaXNpdCBteSBzaXRlISA8L2E+XG4gKiAgIDwvYW1wLXN0b3J5LWN0YS1sYXllcj5cbiAqIDxhbXAtc3RvcnktcGFnZT5cbiAqIC4uLlxuICovXG5cbmltcG9ydCB7QW1wU3RvcnlCYXNlTGF5ZXJ9IGZyb20gJy4vYW1wLXN0b3J5LWJhc2UtbGF5ZXInO1xuaW1wb3J0IHthZGRBdHRyaWJ1dGVzVG9FbGVtZW50LCByZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHttYXRjaGVzfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQGNvbnN0XG4gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnktY3RhLWxheWVyJztcblxuLyoqXG4gKiBDYWxsIHRvIGFjdGlvbiBidXR0b24gbGF5ZXIgdGVtcGxhdGUuXG4gKlxuICogTm8gcHJlLXJlbmRlcmluZyB0byBsZXQgbW9yZSBjb21wdXRpbmctaW50ZW5zaXZlIGVsZW1lbnRzIChsaWtlXG4gKiB2aWRlb3MpIGdldCBwcmUtcmVuZGVyZWQgZmlyc3QuIFNpbmNlIHRoaXMgbGF5ZXIgd2lsbCBub3QgY29udGFpblxuICogY29tcHV0aW5nLWludGVuc2l2ZSByZXNvdXJjZXMgc3VjaCBhcyB2aWRlb3MsIHdlIGNhbiBqdXN0IHJpc2sgcmVuZGVyaW5nXG4gKiB3aGlsZSB0aGUgdXNlciBpcyBsb29raW5nLlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlDdGFMYXllciBleHRlbmRzIEFtcFN0b3J5QmFzZUxheWVyIHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHN1cGVyLmJ1aWxkQ2FsbGJhY2soKTtcbiAgICB0aGlzLnNldE9yT3ZlcndyaXRlQXR0cmlidXRlc18oKTtcbiAgICB0aGlzLmNoZWNrQW5kUmVtb3ZlTGF5ZXJJZk9uRmlyc3RQYWdlXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0ZSBvciBzZXQgdGFyZ2V0IGF0dHJpYnV0ZXMgdGhhdCBhcmUgY3RhLWxheWVyLXNwZWNpZmljLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0T3JPdmVyd3JpdGVBdHRyaWJ1dGVzXygpIHtcbiAgICBjb25zdCBjdGFMaW5rcyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdGFMaW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgYWRkQXR0cmlidXRlc1RvRWxlbWVudChjdGFMaW5rc1tpXSwgZGljdCh7J3RhcmdldCc6ICdfYmxhbmsnfSkpO1xuXG4gICAgICBpZiAoIWN0YUxpbmtzW2ldLmdldEF0dHJpYnV0ZSgncm9sZScpKSB7XG4gICAgICAgIGFkZEF0dHJpYnV0ZXNUb0VsZW1lbnQoY3RhTGlua3NbaV0sIGRpY3Qoeydyb2xlJzogJ2xpbmsnfSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGN0YUJ1dHRvbnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdGFCdXR0b25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWN0YUJ1dHRvbnNbaV0uZ2V0QXR0cmlidXRlKCdyb2xlJykpIHtcbiAgICAgICAgYWRkQXR0cmlidXRlc1RvRWxlbWVudChjdGFCdXR0b25zW2ldLCBkaWN0KHsncm9sZSc6ICdidXR0b24nfSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDVEEgbGlua3Mgb3IgYnV0dG9ucyBhcmUgbm90IGFsbG93ZWQgb24gdGhlIGZpcnN0IGFtcC1zdG9yeSBwYWdlLiBSZW1vdmVcbiAgICogdGhlIGFtcC1zdG9yeS1jdGEtbGF5ZXIgaWYgaXQgaXMgZm91bmQgb24gdGhlIGZpcnN0IHBhZ2Ugb2YgdGhlIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tBbmRSZW1vdmVMYXllcklmT25GaXJzdFBhZ2VfKCkge1xuICAgIGlmIChcbiAgICAgIG1hdGNoZXMoXG4gICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgJ2FtcC1zdG9yeS1wYWdlOmZpcnN0LW9mLXR5cGUgPiBhbXAtc3RvcnktY3RhLWxheWVyJ1xuICAgICAgKVxuICAgICkge1xuICAgICAgcmVtb3ZlRWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgICdhbXAtc3RvcnktY3RhLWxheWVyIGlzIG5vdCBhbGxvd2VkIG9uIHRoZSBmaXJzdCBwYWdlJyArXG4gICAgICAgICAgJyBvZiBhbiBhbXAtc3RvcnkuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-cta-layer.js