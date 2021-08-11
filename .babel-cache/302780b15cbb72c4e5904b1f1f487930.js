function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import { isElement } from "./core/types";
import { dev } from "./log";
import { Services } from "./service";

/**
 * The interface that is implemented by all templates.
 * @abstract
 */
export var BaseTemplate = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  function BaseTemplate(element, win) {
    _classCallCheck(this, BaseTemplate);

    /** @public @const */
    this.element = element;

    /** @public @const {!Window} */
    this.win = element.ownerDocument.defaultView || win;

    /** @private @const */
    this.viewer_ = Services.viewerForDoc(this.element);
    this.compileCallback();
  }

  /**
   * Override in subclass if the element needs to compile the template.
   * @protected
   */
  _createClass(BaseTemplate, [{
    key: "compileCallback",
    value: function compileCallback() {// Subclasses may override.
    }
    /**
     * Bypasses template rendering and directly sets HTML. Should only be used
     * for server-side rendering case. To be implemented by subclasses.
     * @param {string} unusedData
     * @return {!Element|!Array<Element>}
     * @abstract
     */

  }, {
    key: "setHtml",
    value: function setHtml(unusedData) {}
    /**
     * To be implemented by subclasses.
     * @param {!JsonObject|string} unusedData
     * @return {!Element}
     * @abstract
     */

  }, {
    key: "render",
    value: function render(unusedData) {}
    /**
     * To be implemented by subclasses.
     * @param {!JsonObject|string} unusedData
     * @return {string}
     * @abstract
     */

  }, {
    key: "renderAsString",
    value: function renderAsString(unusedData) {}
    /**
     * Iterate through the child nodes of the given root, applying the
     * given callback to non-empty text nodes and elements.
     * @param {!Element} root
     * @param {function((!Element|string))} callback
     */

  }, {
    key: "visitChildren_",
    value: function visitChildren_(root, callback) {
      for (var n = root.firstChild; n != null; n = n.nextSibling) {
        if (n.nodeType ==
        /* TEXT */
        3) {
          var text = n.textContent.trim();

          if (text) {
            callback(text);
          }
        } else if (n.nodeType ==
        /* COMMENT */
        8) {// Ignore comments.
        } else if (isElement(n)) {
          callback(dev().assertElement(n));
        }
      }
    }
    /**
     * Unwraps the root element. If root has a single element child,
     * returns the child. Otherwise, returns root.
     * @param {!Element} root
     * @return {!Element}
     * @protected @final
     */

  }, {
    key: "tryUnwrap",
    value: function tryUnwrap(root) {
      var onlyChild;
      this.visitChildren_(root, function (c) {
        if (onlyChild === undefined && c.nodeType) {
          onlyChild = c;
        } else {
          onlyChild = null;
        }
      });
      return onlyChild || root;
    }
    /**
     * Unwraps the root element and returns any children in an array.
     * Text node children are normalized inside a <div>.
     * @param {!Element} root
     * @return {!Array<!Element>}
     * @protected @final
     */

  }, {
    key: "unwrapChildren",
    value: function unwrapChildren(root) {
      var _this = this;

      var children = [];
      this.visitChildren_(root, function (c) {
        if (typeof c == 'string') {
          var element = _this.win.document.createElement('div');

          element.textContent = c;
          children.push(element);
        } else {
          children.push(c);
        }
      });
      return children;
    }
    /**
     * @protected @final
     * @return {boolean}
     */

  }, {
    key: "viewerCanRenderTemplates",
    value: function viewerCanRenderTemplates() {
      return this.viewer_.hasCapability('viewerRenderTemplate');
    }
  }]);

  return BaseTemplate;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UtdGVtcGxhdGUuanMiXSwibmFtZXMiOlsiaXNFbGVtZW50IiwiZGV2IiwiU2VydmljZXMiLCJCYXNlVGVtcGxhdGUiLCJlbGVtZW50Iiwid2luIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3Iiwidmlld2VyXyIsInZpZXdlckZvckRvYyIsImNvbXBpbGVDYWxsYmFjayIsInVudXNlZERhdGEiLCJyb290IiwiY2FsbGJhY2siLCJuIiwiZmlyc3RDaGlsZCIsIm5leHRTaWJsaW5nIiwibm9kZVR5cGUiLCJ0ZXh0IiwidGV4dENvbnRlbnQiLCJ0cmltIiwiYXNzZXJ0RWxlbWVudCIsIm9ubHlDaGlsZCIsInZpc2l0Q2hpbGRyZW5fIiwiYyIsInVuZGVmaW5lZCIsImNoaWxkcmVuIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicHVzaCIsImhhc0NhcGFiaWxpdHkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFDQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsUUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLFlBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLHdCQUFZQyxPQUFaLEVBQXFCQyxHQUFyQixFQUEwQjtBQUFBOztBQUN4QjtBQUNBLFNBQUtELE9BQUwsR0FBZUEsT0FBZjs7QUFFQTtBQUNBLFNBQUtDLEdBQUwsR0FBV0QsT0FBTyxDQUFDRSxhQUFSLENBQXNCQyxXQUF0QixJQUFxQ0YsR0FBaEQ7O0FBRUE7QUFDQSxTQUFLRyxPQUFMLEdBQWVOLFFBQVEsQ0FBQ08sWUFBVCxDQUFzQixLQUFLTCxPQUEzQixDQUFmO0FBRUEsU0FBS00sZUFBTDtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBckJBO0FBQUE7QUFBQSxXQXNCRSwyQkFBa0IsQ0FDaEI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhDQTtBQUFBO0FBQUEsV0FpQ0UsaUJBQVFDLFVBQVIsRUFBb0IsQ0FBRTtBQUV0QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBeENBO0FBQUE7QUFBQSxXQXlDRSxnQkFBT0EsVUFBUCxFQUFtQixDQUFFO0FBRXJCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoREE7QUFBQTtBQUFBLFdBaURFLHdCQUFlQSxVQUFmLEVBQTJCLENBQUU7QUFFN0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhEQTtBQUFBO0FBQUEsV0F5REUsd0JBQWVDLElBQWYsRUFBcUJDLFFBQXJCLEVBQStCO0FBQzdCLFdBQUssSUFBSUMsQ0FBQyxHQUFHRixJQUFJLENBQUNHLFVBQWxCLEVBQThCRCxDQUFDLElBQUksSUFBbkMsRUFBeUNBLENBQUMsR0FBR0EsQ0FBQyxDQUFDRSxXQUEvQyxFQUE0RDtBQUMxRCxZQUFJRixDQUFDLENBQUNHLFFBQUY7QUFBYztBQUFXLFNBQTdCLEVBQWdDO0FBQzlCLGNBQU1DLElBQUksR0FBR0osQ0FBQyxDQUFDSyxXQUFGLENBQWNDLElBQWQsRUFBYjs7QUFDQSxjQUFJRixJQUFKLEVBQVU7QUFDUkwsWUFBQUEsUUFBUSxDQUFDSyxJQUFELENBQVI7QUFDRDtBQUNGLFNBTEQsTUFLTyxJQUFJSixDQUFDLENBQUNHLFFBQUY7QUFBYztBQUFjLFNBQWhDLEVBQW1DLENBQ3hDO0FBQ0QsU0FGTSxNQUVBLElBQUlqQixTQUFTLENBQUNjLENBQUQsQ0FBYixFQUFrQjtBQUN2QkQsVUFBQUEsUUFBUSxDQUFDWixHQUFHLEdBQUdvQixhQUFOLENBQW9CUCxDQUFwQixDQUFELENBQVI7QUFDRDtBQUNGO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5RUE7QUFBQTtBQUFBLFdBK0VFLG1CQUFVRixJQUFWLEVBQWdCO0FBQ2QsVUFBSVUsU0FBSjtBQUNBLFdBQUtDLGNBQUwsQ0FBb0JYLElBQXBCLEVBQTBCLFVBQUNZLENBQUQsRUFBTztBQUMvQixZQUFJRixTQUFTLEtBQUtHLFNBQWQsSUFBMkJELENBQUMsQ0FBQ1AsUUFBakMsRUFBMkM7QUFDekNLLFVBQUFBLFNBQVMsR0FBR0UsQ0FBWjtBQUNELFNBRkQsTUFFTztBQUNMRixVQUFBQSxTQUFTLEdBQUcsSUFBWjtBQUNEO0FBQ0YsT0FORDtBQU9BLGFBQU9BLFNBQVMsSUFBSVYsSUFBcEI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWpHQTtBQUFBO0FBQUEsV0FrR0Usd0JBQWVBLElBQWYsRUFBcUI7QUFBQTs7QUFDbkIsVUFBTWMsUUFBUSxHQUFHLEVBQWpCO0FBQ0EsV0FBS0gsY0FBTCxDQUFvQlgsSUFBcEIsRUFBMEIsVUFBQ1ksQ0FBRCxFQUFPO0FBQy9CLFlBQUksT0FBT0EsQ0FBUCxJQUFZLFFBQWhCLEVBQTBCO0FBQ3hCLGNBQU1wQixPQUFPLEdBQUcsS0FBSSxDQUFDQyxHQUFMLENBQVNzQixRQUFULENBQWtCQyxhQUFsQixDQUFnQyxLQUFoQyxDQUFoQjs7QUFDQXhCLFVBQUFBLE9BQU8sQ0FBQ2UsV0FBUixHQUFzQkssQ0FBdEI7QUFDQUUsVUFBQUEsUUFBUSxDQUFDRyxJQUFULENBQWN6QixPQUFkO0FBQ0QsU0FKRCxNQUlPO0FBQ0xzQixVQUFBQSxRQUFRLENBQUNHLElBQVQsQ0FBY0wsQ0FBZDtBQUNEO0FBQ0YsT0FSRDtBQVNBLGFBQU9FLFFBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQW5IQTtBQUFBO0FBQUEsV0FvSEUsb0NBQTJCO0FBQ3pCLGFBQU8sS0FBS2xCLE9BQUwsQ0FBYXNCLGFBQWIsQ0FBMkIsc0JBQTNCLENBQVA7QUFDRDtBQXRISDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7aXNFbGVtZW50fSBmcm9tICcuL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSB0aGF0IGlzIGltcGxlbWVudGVkIGJ5IGFsbCB0ZW1wbGF0ZXMuXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VUZW1wbGF0ZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCB3aW4pIHtcbiAgICAvKiogQHB1YmxpYyBAY29uc3QgKi9cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLyoqIEBwdWJsaWMgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnZpZXdlcl8gPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2ModGhpcy5lbGVtZW50KTtcblxuICAgIHRoaXMuY29tcGlsZUNhbGxiYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgaW4gc3ViY2xhc3MgaWYgdGhlIGVsZW1lbnQgbmVlZHMgdG8gY29tcGlsZSB0aGUgdGVtcGxhdGUuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGNvbXBpbGVDYWxsYmFjaygpIHtcbiAgICAvLyBTdWJjbGFzc2VzIG1heSBvdmVycmlkZS5cbiAgfVxuXG4gIC8qKlxuICAgKiBCeXBhc3NlcyB0ZW1wbGF0ZSByZW5kZXJpbmcgYW5kIGRpcmVjdGx5IHNldHMgSFRNTC4gU2hvdWxkIG9ubHkgYmUgdXNlZFxuICAgKiBmb3Igc2VydmVyLXNpZGUgcmVuZGVyaW5nIGNhc2UuIFRvIGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWREYXRhXG4gICAqIEByZXR1cm4geyFFbGVtZW50fCFBcnJheTxFbGVtZW50Pn1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBzZXRIdG1sKHVudXNlZERhdGEpIHt9XG5cbiAgLyoqXG4gICAqIFRvIGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzZXMuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R8c3RyaW5nfSB1bnVzZWREYXRhXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIHJlbmRlcih1bnVzZWREYXRhKSB7fVxuXG4gIC8qKlxuICAgKiBUbyBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzc2VzLlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fHN0cmluZ30gdW51c2VkRGF0YVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgcmVuZGVyQXNTdHJpbmcodW51c2VkRGF0YSkge31cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aHJvdWdoIHRoZSBjaGlsZCBub2RlcyBvZiB0aGUgZ2l2ZW4gcm9vdCwgYXBwbHlpbmcgdGhlXG4gICAqIGdpdmVuIGNhbGxiYWNrIHRvIG5vbi1lbXB0eSB0ZXh0IG5vZGVzIGFuZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCghRWxlbWVudHxzdHJpbmcpKX0gY2FsbGJhY2tcbiAgICovXG4gIHZpc2l0Q2hpbGRyZW5fKHJvb3QsIGNhbGxiYWNrKSB7XG4gICAgZm9yIChsZXQgbiA9IHJvb3QuZmlyc3RDaGlsZDsgbiAhPSBudWxsOyBuID0gbi5uZXh0U2libGluZykge1xuICAgICAgaWYgKG4ubm9kZVR5cGUgPT0gLyogVEVYVCAqLyAzKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBuLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICBjYWxsYmFjayh0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChuLm5vZGVUeXBlID09IC8qIENPTU1FTlQgKi8gOCkge1xuICAgICAgICAvLyBJZ25vcmUgY29tbWVudHMuXG4gICAgICB9IGVsc2UgaWYgKGlzRWxlbWVudChuKSkge1xuICAgICAgICBjYWxsYmFjayhkZXYoKS5hc3NlcnRFbGVtZW50KG4pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVW53cmFwcyB0aGUgcm9vdCBlbGVtZW50LiBJZiByb290IGhhcyBhIHNpbmdsZSBlbGVtZW50IGNoaWxkLFxuICAgKiByZXR1cm5zIHRoZSBjaGlsZC4gT3RoZXJ3aXNlLCByZXR1cm5zIHJvb3QuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHJvb3RcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqIEBwcm90ZWN0ZWQgQGZpbmFsXG4gICAqL1xuICB0cnlVbndyYXAocm9vdCkge1xuICAgIGxldCBvbmx5Q2hpbGQ7XG4gICAgdGhpcy52aXNpdENoaWxkcmVuXyhyb290LCAoYykgPT4ge1xuICAgICAgaWYgKG9ubHlDaGlsZCA9PT0gdW5kZWZpbmVkICYmIGMubm9kZVR5cGUpIHtcbiAgICAgICAgb25seUNoaWxkID0gYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9ubHlDaGlsZCA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9ubHlDaGlsZCB8fCByb290O1xuICB9XG5cbiAgLyoqXG4gICAqIFVud3JhcHMgdGhlIHJvb3QgZWxlbWVudCBhbmQgcmV0dXJucyBhbnkgY2hpbGRyZW4gaW4gYW4gYXJyYXkuXG4gICAqIFRleHQgbm9kZSBjaGlsZHJlbiBhcmUgbm9ybWFsaXplZCBpbnNpZGUgYSA8ZGl2Pi5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUVsZW1lbnQ+fVxuICAgKiBAcHJvdGVjdGVkIEBmaW5hbFxuICAgKi9cbiAgdW53cmFwQ2hpbGRyZW4ocm9vdCkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XG4gICAgdGhpcy52aXNpdENoaWxkcmVuXyhyb290LCAoYykgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjID09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndpbi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGM7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goZWxlbWVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJvdGVjdGVkIEBmaW5hbFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgdmlld2VyQ2FuUmVuZGVyVGVtcGxhdGVzKCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdlcl8uaGFzQ2FwYWJpbGl0eSgndmlld2VyUmVuZGVyVGVtcGxhdGUnKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/base-template.js