function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { iterateCursor } from "./core/dom";
import { map } from "./core/types/object";
import { getFormAsObject, getSubmitButtonUsed } from "./form";
import { Services } from "./service";

/**
 * Create a form data wrapper. The wrapper is necessary to provide a common
 * API for FormData objects on all browsers. For example, not all browsers
 * support the FormData#entries or FormData#delete functions.
 *
 * @param {!Window} win
 * @param {!HTMLFormElement=} opt_form
 * @return {!FormDataWrapperInterface}
 */
export function createFormDataWrapper(win, opt_form) {
  var platform = Services.platformFor(win);

  if (platform.isIos() && platform.getMajorVersion() == 11) {
    return new Ios11NativeFormDataWrapper(opt_form);
  } else if (FormData.prototype.entries && FormData.prototype.delete) {
    return new NativeFormDataWrapper(opt_form);
  } else {
    return new PolyfillFormDataWrapper(opt_form);
  }
}

/**
 * Check if the given object is a FormDataWrapper instance
 * @param {*} o
 * @return {boolean} True if the object is a FormDataWrapper instance.
 */
export function isFormDataWrapper(o) {
  // instanceof doesn't work as expected, so we detect with duck-typing.
  return !!o && typeof o.getFormData == 'function';
}

/**
 * A polyfill wrapper for a `FormData` object.
 *
 * If there's no native `FormData#entries`, chances are there are no native
 * methods to read the content of the `FormData` after construction, so the
 * only way to implement `entries` in this class is to capture the fields in
 * the form passed to the constructor (and the arguments passed to the
 * `append` method).
 *
 * For more details on this, see http://mdn.io/FormData.
 *
 * @implements {FormDataWrapperInterface}
 * @visibleForTesting
 */
export var PolyfillFormDataWrapper = /*#__PURE__*/function () {
  /** @override */
  function PolyfillFormDataWrapper(opt_form) {
    if (opt_form === void 0) {
      opt_form = undefined;
    }

    _classCallCheck(this, PolyfillFormDataWrapper);

    /** @private @const {!Object<string, !Array<string>>} */
    this.fieldValues_ = opt_form ? getFormAsObject(opt_form) : map();
  }

  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */
  _createClass(PolyfillFormDataWrapper, [{
    key: "append",
    value: function append(name, value, opt_filename) {
      // Coercion to string is required to match
      // the native FormData.append behavior
      var nameString = String(name);
      this.fieldValues_[nameString] = this.fieldValues_[nameString] || [];
      this.fieldValues_[nameString].push(String(value));
    }
    /** @override */

  }, {
    key: "delete",
    value: function _delete(name) {
      delete this.fieldValues_[name];
    }
    /** @override */

  }, {
    key: "entries",
    value: function entries() {
      var _this = this;

      var fieldEntries = [];
      Object.keys(this.fieldValues_).forEach(function (name) {
        var values = _this.fieldValues_[name];
        values.forEach(function (value) {
          return fieldEntries.push([name, value]);
        });
      });
      // Generator functions are not supported by the current Babel configuration,
      // so we must manually implement the iterator interface.
      var nextIndex = 0;
      return (
        /** @type {!Iterator<!Array<string>>} */
        {
          next: function next() {
            return nextIndex < fieldEntries.length ? {
              value: fieldEntries[nextIndex++],
              done: false
            } : {
              value: undefined,
              done: true
            };
          }
        }
      );
    }
    /** @override */

  }, {
    key: "getFormData",
    value: function getFormData() {
      var _this2 = this;

      var formData = new FormData();
      Object.keys(this.fieldValues_).forEach(function (name) {
        var values = _this2.fieldValues_[name];
        values.forEach(function (value) {
          return formData.append(name, value);
        });
      });
      return formData;
    }
  }]);

  return PolyfillFormDataWrapper;
}();

/**
 * Wrap the native `FormData` implementation.
 *
 * NOTE: This differs from the standard `FormData` constructor. This constructor
 * includes a submit button if it was used to submit the `opt_form`, where
 * the native `FormData` constructor does not include the submit button used to
 * submit the form.
 * {@link https://xhr.spec.whatwg.org/#dom-formdata}
 * @implements {FormDataWrapperInterface}
 */
var NativeFormDataWrapper = /*#__PURE__*/function () {
  /** @override */
  function NativeFormDataWrapper(opt_form) {
    _classCallCheck(this, NativeFormDataWrapper);

    /** @private @const {!FormData} */
    this.formData_ = new FormData(opt_form);
    this.maybeIncludeSubmitButton_(opt_form);
  }

  /**
   * If a submit button is focused (because it was used to submit the form),
   * or was the first submit button present, add its name and value to the
   * `FormData`, since publishers expect the submit button to be present.
   * @param {!HTMLFormElement=} opt_form
   * @private
   */
  _createClass(NativeFormDataWrapper, [{
    key: "maybeIncludeSubmitButton_",
    value: function maybeIncludeSubmitButton_(opt_form) {
      // If a form is not passed to the constructor,
      // we are not in a submitting code path.
      if (!opt_form) {
        return;
      }

      var button = getSubmitButtonUsed(opt_form);

      if (button && button.name) {
        this.append(button.name, button.value);
      }
    }
    /**
     * @param {string} name
     * @param {string|!File} value
     * @param {string=} opt_filename
     * @override
     */

  }, {
    key: "append",
    value: function append(name, value, opt_filename) {
      this.formData_.append(name, value);
    }
    /** @override */

  }, {
    key: "delete",
    value: function _delete(name) {
      this.formData_.delete(name);
    }
    /** @override */

  }, {
    key: "entries",
    value: function entries() {
      return this.formData_.entries();
    }
    /** @override */

  }, {
    key: "getFormData",
    value: function getFormData() {
      return this.formData_;
    }
  }]);

  return NativeFormDataWrapper;
}();

/**
 * iOS 11 has a bug when submitting empty file inputs.
 * This works around the bug by replacing the empty files with Blob objects.
 */
var Ios11NativeFormDataWrapper = /*#__PURE__*/function (_NativeFormDataWrappe) {
  _inherits(Ios11NativeFormDataWrapper, _NativeFormDataWrappe);

  var _super = _createSuper(Ios11NativeFormDataWrapper);

  /** @override */
  function Ios11NativeFormDataWrapper(opt_form) {
    var _this3;

    _classCallCheck(this, Ios11NativeFormDataWrapper);

    _this3 = _super.call(this, opt_form);

    if (opt_form) {
      iterateCursor(opt_form.elements, function (input) {
        if (input.type == 'file' && input.files.length == 0) {
          _this3.formData_.delete(input.name);

          _this3.formData_.append(input.name, new Blob([]), '');
        }
      });
    }

    return _this3;
  }

  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */
  _createClass(Ios11NativeFormDataWrapper, [{
    key: "append",
    value: function append(name, value, opt_filename) {
      // Safari 11 breaks on submitting empty File values.
      if (value && typeof value == 'object' && isEmptyFile(value)) {
        this.formData_.append(name, new Blob([]), opt_filename || '');
      } else {
        this.formData_.append(name, value);
      }
    }
  }]);

  return Ios11NativeFormDataWrapper;
}(NativeFormDataWrapper);

/**
 * A wrapper for a native `FormData` object that allows the retrieval of entries
 * in the form data after construction even on browsers that don't natively
 * support `FormData.prototype.entries`.
 *
 * @interface
 * Subclassing `FormData` doesn't work in this case as the transpiler
 *     generates code that calls the super constructor directly using
 *     `Function.prototype.call`. WebKit (Safari) doesn't allow this and
 *     enforces that constructors be called with the `new` operator.
 */
var FormDataWrapperInterface = /*#__PURE__*/function () {
  /**
   * Creates a new wrapper for a `FormData` object.
   *
   * If there's no native `FormData#entries`, chances are there are no native
   * methods to read the content of the `FormData` after construction, so the
   * only way to implement `entries` in this class is to capture the fields in
   * the form passed to the constructor (and the arguments passed to the
   * `append` method).
   *
   * This constructor should also add the submitter element as defined in the
   * HTML spec for Form Submission Algorithm, but is not defined by the standard
   * when using the `FormData` constructor directly.
   *
   * For more details on this, see http://mdn.io/FormData.
   *
   * @param {!HTMLFormElement=} opt_form An HTML `<form>` element — when
   *     specified, the `FormData` object will be populated with the form's
   *     current keys/values using the name property of each element for the
   *     keys and their submitted value for the values. It will also encode file
   *     input content.
   */
  function FormDataWrapperInterface(opt_form) {
    _classCallCheck(this, FormDataWrapperInterface);
  }

  /**
   * Appends a new value onto an existing key inside a `FormData` object, or
   * adds the key if it does not already exist.
   *
   * Appending a `File` object is not yet supported and the `filename`
   * parameter is ignored for this wrapper.
   *
   * For more details on this, see http://mdn.io/FormData/append.
   *
   * TODO(cvializ): Update file support
   *
   * @param {string} unusedName The name of the field whose data is contained in
   *     `value`.
   * @param {string|!File} unusedValue The field's value.
   * @param {string=} opt_filename The filename to use if the value is a file.
   */
  _createClass(FormDataWrapperInterface, [{
    key: "append",
    value: function append(unusedName, unusedValue, opt_filename) {}
    /**
     * Remove the given value from the FormData.
     *
     * For more details on this, see http://mdn.io/FormData/delete.
     *
     * @param {string} unusedName The name of the field to remove from the FormData.
     */

  }, {
    key: "delete",
    value: function _delete(unusedName) {}
    /**
     * Returns an iterator of all key/value pairs contained in this object.
     *
     * For more details on this, see http://mdn.io/FormData/entries.
     *
     * @return {!Iterator<!Array<string|!File>>}
     */

  }, {
    key: "entries",
    value: function entries() {}
    /**
     * Returns the wrapped native `FormData` object.
     *
     * @return {!FormData}
     */

  }, {
    key: "getFormData",
    value: function getFormData() {}
  }]);

  return FormDataWrapperInterface;
}();

/**
 * Check if the given file is an empty file, which is the result of submitting
 * an empty `<input type="file">`. These cause errors when submitting forms
 * in Safari 11.
 *
 * @param {!File} file
 * @return {boolean}
 */
function isEmptyFile(file) {
  return file.name == '' && file.size == 0;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0tZGF0YS13cmFwcGVyLmpzIl0sIm5hbWVzIjpbIml0ZXJhdGVDdXJzb3IiLCJtYXAiLCJnZXRGb3JtQXNPYmplY3QiLCJnZXRTdWJtaXRCdXR0b25Vc2VkIiwiU2VydmljZXMiLCJjcmVhdGVGb3JtRGF0YVdyYXBwZXIiLCJ3aW4iLCJvcHRfZm9ybSIsInBsYXRmb3JtIiwicGxhdGZvcm1Gb3IiLCJpc0lvcyIsImdldE1ham9yVmVyc2lvbiIsIklvczExTmF0aXZlRm9ybURhdGFXcmFwcGVyIiwiRm9ybURhdGEiLCJwcm90b3R5cGUiLCJlbnRyaWVzIiwiZGVsZXRlIiwiTmF0aXZlRm9ybURhdGFXcmFwcGVyIiwiUG9seWZpbGxGb3JtRGF0YVdyYXBwZXIiLCJpc0Zvcm1EYXRhV3JhcHBlciIsIm8iLCJnZXRGb3JtRGF0YSIsInVuZGVmaW5lZCIsImZpZWxkVmFsdWVzXyIsIm5hbWUiLCJ2YWx1ZSIsIm9wdF9maWxlbmFtZSIsIm5hbWVTdHJpbmciLCJTdHJpbmciLCJwdXNoIiwiZmllbGRFbnRyaWVzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJ2YWx1ZXMiLCJuZXh0SW5kZXgiLCJuZXh0IiwibGVuZ3RoIiwiZG9uZSIsImZvcm1EYXRhIiwiYXBwZW5kIiwiZm9ybURhdGFfIiwibWF5YmVJbmNsdWRlU3VibWl0QnV0dG9uXyIsImJ1dHRvbiIsImVsZW1lbnRzIiwiaW5wdXQiLCJ0eXBlIiwiZmlsZXMiLCJCbG9iIiwiaXNFbXB0eUZpbGUiLCJGb3JtRGF0YVdyYXBwZXJJbnRlcmZhY2UiLCJ1bnVzZWROYW1lIiwidW51c2VkVmFsdWUiLCJmaWxlIiwic2l6ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLGVBQVIs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VCxDQUFxQkksSUFBckIsRUFBMkI7QUFDekIsU0FBT0EsSUFBSSxDQUFDN0IsSUFBTCxJQUFhLEVBQWIsSUFBbUI2QixJQUFJLENBQUNDLElBQUwsSUFBYSxDQUF2QztBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7aXRlcmF0ZUN1cnNvcn0gZnJvbSAnLi9jb3JlL2RvbSc7XG5pbXBvcnQge21hcH0gZnJvbSAnLi9jb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldEZvcm1Bc09iamVjdCwgZ2V0U3VibWl0QnV0dG9uVXNlZH0gZnJvbSAnLi9mb3JtJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5cbi8qKlxuICogQ3JlYXRlIGEgZm9ybSBkYXRhIHdyYXBwZXIuIFRoZSB3cmFwcGVyIGlzIG5lY2Vzc2FyeSB0byBwcm92aWRlIGEgY29tbW9uXG4gKiBBUEkgZm9yIEZvcm1EYXRhIG9iamVjdHMgb24gYWxsIGJyb3dzZXJzLiBGb3IgZXhhbXBsZSwgbm90IGFsbCBicm93c2Vyc1xuICogc3VwcG9ydCB0aGUgRm9ybURhdGEjZW50cmllcyBvciBGb3JtRGF0YSNkZWxldGUgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFIVE1MRm9ybUVsZW1lbnQ9fSBvcHRfZm9ybVxuICogQHJldHVybiB7IUZvcm1EYXRhV3JhcHBlckludGVyZmFjZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvcm1EYXRhV3JhcHBlcih3aW4sIG9wdF9mb3JtKSB7XG4gIGNvbnN0IHBsYXRmb3JtID0gU2VydmljZXMucGxhdGZvcm1Gb3Iod2luKTtcblxuICBpZiAocGxhdGZvcm0uaXNJb3MoKSAmJiBwbGF0Zm9ybS5nZXRNYWpvclZlcnNpb24oKSA9PSAxMSkge1xuICAgIHJldHVybiBuZXcgSW9zMTFOYXRpdmVGb3JtRGF0YVdyYXBwZXIob3B0X2Zvcm0pO1xuICB9IGVsc2UgaWYgKEZvcm1EYXRhLnByb3RvdHlwZS5lbnRyaWVzICYmIEZvcm1EYXRhLnByb3RvdHlwZS5kZWxldGUpIHtcbiAgICByZXR1cm4gbmV3IE5hdGl2ZUZvcm1EYXRhV3JhcHBlcihvcHRfZm9ybSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQb2x5ZmlsbEZvcm1EYXRhV3JhcHBlcihvcHRfZm9ybSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgRm9ybURhdGFXcmFwcGVyIGluc3RhbmNlXG4gKiBAcGFyYW0geyp9IG9cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9iamVjdCBpcyBhIEZvcm1EYXRhV3JhcHBlciBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRm9ybURhdGFXcmFwcGVyKG8pIHtcbiAgLy8gaW5zdGFuY2VvZiBkb2Vzbid0IHdvcmsgYXMgZXhwZWN0ZWQsIHNvIHdlIGRldGVjdCB3aXRoIGR1Y2stdHlwaW5nLlxuICByZXR1cm4gISFvICYmIHR5cGVvZiBvLmdldEZvcm1EYXRhID09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSBwb2x5ZmlsbCB3cmFwcGVyIGZvciBhIGBGb3JtRGF0YWAgb2JqZWN0LlxuICpcbiAqIElmIHRoZXJlJ3Mgbm8gbmF0aXZlIGBGb3JtRGF0YSNlbnRyaWVzYCwgY2hhbmNlcyBhcmUgdGhlcmUgYXJlIG5vIG5hdGl2ZVxuICogbWV0aG9kcyB0byByZWFkIHRoZSBjb250ZW50IG9mIHRoZSBgRm9ybURhdGFgIGFmdGVyIGNvbnN0cnVjdGlvbiwgc28gdGhlXG4gKiBvbmx5IHdheSB0byBpbXBsZW1lbnQgYGVudHJpZXNgIGluIHRoaXMgY2xhc3MgaXMgdG8gY2FwdHVyZSB0aGUgZmllbGRzIGluXG4gKiB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yIChhbmQgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlXG4gKiBgYXBwZW5kYCBtZXRob2QpLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcywgc2VlIGh0dHA6Ly9tZG4uaW8vRm9ybURhdGEuXG4gKlxuICogQGltcGxlbWVudHMge0Zvcm1EYXRhV3JhcHBlckludGVyZmFjZX1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgUG9seWZpbGxGb3JtRGF0YVdyYXBwZXIge1xuICAvKiogQG92ZXJyaWRlICovXG4gIGNvbnN0cnVjdG9yKG9wdF9mb3JtID0gdW5kZWZpbmVkKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFBcnJheTxzdHJpbmc+Pn0gKi9cbiAgICB0aGlzLmZpZWxkVmFsdWVzXyA9IG9wdF9mb3JtID8gZ2V0Rm9ybUFzT2JqZWN0KG9wdF9mb3JtKSA6IG1hcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFGaWxlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdF9maWxlbmFtZVxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGFwcGVuZChuYW1lLCB2YWx1ZSwgb3B0X2ZpbGVuYW1lKSB7XG4gICAgLy8gQ29lcmNpb24gdG8gc3RyaW5nIGlzIHJlcXVpcmVkIHRvIG1hdGNoXG4gICAgLy8gdGhlIG5hdGl2ZSBGb3JtRGF0YS5hcHBlbmQgYmVoYXZpb3JcbiAgICBjb25zdCBuYW1lU3RyaW5nID0gU3RyaW5nKG5hbWUpO1xuICAgIHRoaXMuZmllbGRWYWx1ZXNfW25hbWVTdHJpbmddID0gdGhpcy5maWVsZFZhbHVlc19bbmFtZVN0cmluZ10gfHwgW107XG4gICAgdGhpcy5maWVsZFZhbHVlc19bbmFtZVN0cmluZ10ucHVzaChTdHJpbmcodmFsdWUpKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGVsZXRlKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5maWVsZFZhbHVlc19bbmFtZV07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGVudHJpZXMoKSB7XG4gICAgY29uc3QgZmllbGRFbnRyaWVzID0gW107XG4gICAgT2JqZWN0LmtleXModGhpcy5maWVsZFZhbHVlc18pLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZmllbGRWYWx1ZXNfW25hbWVdO1xuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlKSA9PiBmaWVsZEVudHJpZXMucHVzaChbbmFtZSwgdmFsdWVdKSk7XG4gICAgfSk7XG5cbiAgICAvLyBHZW5lcmF0b3IgZnVuY3Rpb25zIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjdXJyZW50IEJhYmVsIGNvbmZpZ3VyYXRpb24sXG4gICAgLy8gc28gd2UgbXVzdCBtYW51YWxseSBpbXBsZW1lbnQgdGhlIGl0ZXJhdG9yIGludGVyZmFjZS5cbiAgICBsZXQgbmV4dEluZGV4ID0gMDtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshSXRlcmF0b3I8IUFycmF5PHN0cmluZz4+fSAqLyAoe1xuICAgICAgbmV4dCgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRJbmRleCA8IGZpZWxkRW50cmllcy5sZW5ndGhcbiAgICAgICAgICA/IHt2YWx1ZTogZmllbGRFbnRyaWVzW25leHRJbmRleCsrXSwgZG9uZTogZmFsc2V9XG4gICAgICAgICAgOiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRGb3JtRGF0YSgpIHtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5maWVsZFZhbHVlc18pLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZmllbGRWYWx1ZXNfW25hbWVdO1xuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlKSA9PiBmb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsdWUpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmb3JtRGF0YTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgdGhlIG5hdGl2ZSBgRm9ybURhdGFgIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIE5PVEU6IFRoaXMgZGlmZmVycyBmcm9tIHRoZSBzdGFuZGFyZCBgRm9ybURhdGFgIGNvbnN0cnVjdG9yLiBUaGlzIGNvbnN0cnVjdG9yXG4gKiBpbmNsdWRlcyBhIHN1Ym1pdCBidXR0b24gaWYgaXQgd2FzIHVzZWQgdG8gc3VibWl0IHRoZSBgb3B0X2Zvcm1gLCB3aGVyZVxuICogdGhlIG5hdGl2ZSBgRm9ybURhdGFgIGNvbnN0cnVjdG9yIGRvZXMgbm90IGluY2x1ZGUgdGhlIHN1Ym1pdCBidXR0b24gdXNlZCB0b1xuICogc3VibWl0IHRoZSBmb3JtLlxuICoge0BsaW5rIGh0dHBzOi8veGhyLnNwZWMud2hhdHdnLm9yZy8jZG9tLWZvcm1kYXRhfVxuICogQGltcGxlbWVudHMge0Zvcm1EYXRhV3JhcHBlckludGVyZmFjZX1cbiAqL1xuY2xhc3MgTmF0aXZlRm9ybURhdGFXcmFwcGVyIHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb25zdHJ1Y3RvcihvcHRfZm9ybSkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFGb3JtRGF0YX0gKi9cbiAgICB0aGlzLmZvcm1EYXRhXyA9IG5ldyBGb3JtRGF0YShvcHRfZm9ybSk7XG5cbiAgICB0aGlzLm1heWJlSW5jbHVkZVN1Ym1pdEJ1dHRvbl8ob3B0X2Zvcm0pO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGEgc3VibWl0IGJ1dHRvbiBpcyBmb2N1c2VkIChiZWNhdXNlIGl0IHdhcyB1c2VkIHRvIHN1Ym1pdCB0aGUgZm9ybSksXG4gICAqIG9yIHdhcyB0aGUgZmlyc3Qgc3VibWl0IGJ1dHRvbiBwcmVzZW50LCBhZGQgaXRzIG5hbWUgYW5kIHZhbHVlIHRvIHRoZVxuICAgKiBgRm9ybURhdGFgLCBzaW5jZSBwdWJsaXNoZXJzIGV4cGVjdCB0aGUgc3VibWl0IGJ1dHRvbiB0byBiZSBwcmVzZW50LlxuICAgKiBAcGFyYW0geyFIVE1MRm9ybUVsZW1lbnQ9fSBvcHRfZm9ybVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVJbmNsdWRlU3VibWl0QnV0dG9uXyhvcHRfZm9ybSkge1xuICAgIC8vIElmIGEgZm9ybSBpcyBub3QgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvcixcbiAgICAvLyB3ZSBhcmUgbm90IGluIGEgc3VibWl0dGluZyBjb2RlIHBhdGguXG4gICAgaWYgKCFvcHRfZm9ybSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbiA9IGdldFN1Ym1pdEJ1dHRvblVzZWQob3B0X2Zvcm0pO1xuICAgIGlmIChidXR0b24gJiYgYnV0dG9uLm5hbWUpIHtcbiAgICAgIHRoaXMuYXBwZW5kKGJ1dHRvbi5uYW1lLCBidXR0b24udmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ3whRmlsZX0gdmFsdWVcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfZmlsZW5hbWVcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBhcHBlbmQobmFtZSwgdmFsdWUsIG9wdF9maWxlbmFtZSkge1xuICAgIHRoaXMuZm9ybURhdGFfLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRlbGV0ZShuYW1lKSB7XG4gICAgdGhpcy5mb3JtRGF0YV8uZGVsZXRlKG5hbWUpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmZvcm1EYXRhXy5lbnRyaWVzKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEZvcm1EYXRhKCkge1xuICAgIHJldHVybiB0aGlzLmZvcm1EYXRhXztcbiAgfVxufVxuXG4vKipcbiAqIGlPUyAxMSBoYXMgYSBidWcgd2hlbiBzdWJtaXR0aW5nIGVtcHR5IGZpbGUgaW5wdXRzLlxuICogVGhpcyB3b3JrcyBhcm91bmQgdGhlIGJ1ZyBieSByZXBsYWNpbmcgdGhlIGVtcHR5IGZpbGVzIHdpdGggQmxvYiBvYmplY3RzLlxuICovXG5jbGFzcyBJb3MxMU5hdGl2ZUZvcm1EYXRhV3JhcHBlciBleHRlbmRzIE5hdGl2ZUZvcm1EYXRhV3JhcHBlciB7XG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY29uc3RydWN0b3Iob3B0X2Zvcm0pIHtcbiAgICBzdXBlcihvcHRfZm9ybSk7XG5cbiAgICBpZiAob3B0X2Zvcm0pIHtcbiAgICAgIGl0ZXJhdGVDdXJzb3Iob3B0X2Zvcm0uZWxlbWVudHMsIChpbnB1dCkgPT4ge1xuICAgICAgICBpZiAoaW5wdXQudHlwZSA9PSAnZmlsZScgJiYgaW5wdXQuZmlsZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICB0aGlzLmZvcm1EYXRhXy5kZWxldGUoaW5wdXQubmFtZSk7XG4gICAgICAgICAgdGhpcy5mb3JtRGF0YV8uYXBwZW5kKGlucHV0Lm5hbWUsIG5ldyBCbG9iKFtdKSwgJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd8IUZpbGV9IHZhbHVlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2ZpbGVuYW1lXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgYXBwZW5kKG5hbWUsIHZhbHVlLCBvcHRfZmlsZW5hbWUpIHtcbiAgICAvLyBTYWZhcmkgMTEgYnJlYWtzIG9uIHN1Ym1pdHRpbmcgZW1wdHkgRmlsZSB2YWx1ZXMuXG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiBpc0VtcHR5RmlsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuZm9ybURhdGFfLmFwcGVuZChuYW1lLCBuZXcgQmxvYihbXSksIG9wdF9maWxlbmFtZSB8fCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybURhdGFfLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGZvciBhIG5hdGl2ZSBgRm9ybURhdGFgIG9iamVjdCB0aGF0IGFsbG93cyB0aGUgcmV0cmlldmFsIG9mIGVudHJpZXNcbiAqIGluIHRoZSBmb3JtIGRhdGEgYWZ0ZXIgY29uc3RydWN0aW9uIGV2ZW4gb24gYnJvd3NlcnMgdGhhdCBkb24ndCBuYXRpdmVseVxuICogc3VwcG9ydCBgRm9ybURhdGEucHJvdG90eXBlLmVudHJpZXNgLlxuICpcbiAqIEBpbnRlcmZhY2VcbiAqIFN1YmNsYXNzaW5nIGBGb3JtRGF0YWAgZG9lc24ndCB3b3JrIGluIHRoaXMgY2FzZSBhcyB0aGUgdHJhbnNwaWxlclxuICogICAgIGdlbmVyYXRlcyBjb2RlIHRoYXQgY2FsbHMgdGhlIHN1cGVyIGNvbnN0cnVjdG9yIGRpcmVjdGx5IHVzaW5nXG4gKiAgICAgYEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsYC4gV2ViS2l0IChTYWZhcmkpIGRvZXNuJ3QgYWxsb3cgdGhpcyBhbmRcbiAqICAgICBlbmZvcmNlcyB0aGF0IGNvbnN0cnVjdG9ycyBiZSBjYWxsZWQgd2l0aCB0aGUgYG5ld2Agb3BlcmF0b3IuXG4gKi9cbmNsYXNzIEZvcm1EYXRhV3JhcHBlckludGVyZmFjZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHdyYXBwZXIgZm9yIGEgYEZvcm1EYXRhYCBvYmplY3QuXG4gICAqXG4gICAqIElmIHRoZXJlJ3Mgbm8gbmF0aXZlIGBGb3JtRGF0YSNlbnRyaWVzYCwgY2hhbmNlcyBhcmUgdGhlcmUgYXJlIG5vIG5hdGl2ZVxuICAgKiBtZXRob2RzIHRvIHJlYWQgdGhlIGNvbnRlbnQgb2YgdGhlIGBGb3JtRGF0YWAgYWZ0ZXIgY29uc3RydWN0aW9uLCBzbyB0aGVcbiAgICogb25seSB3YXkgdG8gaW1wbGVtZW50IGBlbnRyaWVzYCBpbiB0aGlzIGNsYXNzIGlzIHRvIGNhcHR1cmUgdGhlIGZpZWxkcyBpblxuICAgKiB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yIChhbmQgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlXG4gICAqIGBhcHBlbmRgIG1ldGhvZCkuXG4gICAqXG4gICAqIFRoaXMgY29uc3RydWN0b3Igc2hvdWxkIGFsc28gYWRkIHRoZSBzdWJtaXR0ZXIgZWxlbWVudCBhcyBkZWZpbmVkIGluIHRoZVxuICAgKiBIVE1MIHNwZWMgZm9yIEZvcm0gU3VibWlzc2lvbiBBbGdvcml0aG0sIGJ1dCBpcyBub3QgZGVmaW5lZCBieSB0aGUgc3RhbmRhcmRcbiAgICogd2hlbiB1c2luZyB0aGUgYEZvcm1EYXRhYCBjb25zdHJ1Y3RvciBkaXJlY3RseS5cbiAgICpcbiAgICogRm9yIG1vcmUgZGV0YWlscyBvbiB0aGlzLCBzZWUgaHR0cDovL21kbi5pby9Gb3JtRGF0YS5cbiAgICpcbiAgICogQHBhcmFtIHshSFRNTEZvcm1FbGVtZW50PX0gb3B0X2Zvcm0gQW4gSFRNTCBgPGZvcm0+YCBlbGVtZW50IOKAlCB3aGVuXG4gICAqICAgICBzcGVjaWZpZWQsIHRoZSBgRm9ybURhdGFgIG9iamVjdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIHRoZSBmb3JtJ3NcbiAgICogICAgIGN1cnJlbnQga2V5cy92YWx1ZXMgdXNpbmcgdGhlIG5hbWUgcHJvcGVydHkgb2YgZWFjaCBlbGVtZW50IGZvciB0aGVcbiAgICogICAgIGtleXMgYW5kIHRoZWlyIHN1Ym1pdHRlZCB2YWx1ZSBmb3IgdGhlIHZhbHVlcy4gSXQgd2lsbCBhbHNvIGVuY29kZSBmaWxlXG4gICAqICAgICBpbnB1dCBjb250ZW50LlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0X2Zvcm0pIHt9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYSBuZXcgdmFsdWUgb250byBhbiBleGlzdGluZyBrZXkgaW5zaWRlIGEgYEZvcm1EYXRhYCBvYmplY3QsIG9yXG4gICAqIGFkZHMgdGhlIGtleSBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuICAgKlxuICAgKiBBcHBlbmRpbmcgYSBgRmlsZWAgb2JqZWN0IGlzIG5vdCB5ZXQgc3VwcG9ydGVkIGFuZCB0aGUgYGZpbGVuYW1lYFxuICAgKiBwYXJhbWV0ZXIgaXMgaWdub3JlZCBmb3IgdGhpcyB3cmFwcGVyLlxuICAgKlxuICAgKiBGb3IgbW9yZSBkZXRhaWxzIG9uIHRoaXMsIHNlZSBodHRwOi8vbWRuLmlvL0Zvcm1EYXRhL2FwcGVuZC5cbiAgICpcbiAgICogVE9ETyhjdmlhbGl6KTogVXBkYXRlIGZpbGUgc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkTmFtZSBUaGUgbmFtZSBvZiB0aGUgZmllbGQgd2hvc2UgZGF0YSBpcyBjb250YWluZWQgaW5cbiAgICogICAgIGB2YWx1ZWAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFGaWxlfSB1bnVzZWRWYWx1ZSBUaGUgZmllbGQncyB2YWx1ZS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIHVzZSBpZiB0aGUgdmFsdWUgaXMgYSBmaWxlLlxuICAgKi9cbiAgYXBwZW5kKHVudXNlZE5hbWUsIHVudXNlZFZhbHVlLCBvcHRfZmlsZW5hbWUpIHt9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gdmFsdWUgZnJvbSB0aGUgRm9ybURhdGEuXG4gICAqXG4gICAqIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcywgc2VlIGh0dHA6Ly9tZG4uaW8vRm9ybURhdGEvZGVsZXRlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkTmFtZSBUaGUgbmFtZSBvZiB0aGUgZmllbGQgdG8gcmVtb3ZlIGZyb20gdGhlIEZvcm1EYXRhLlxuICAgKi9cbiAgZGVsZXRlKHVudXNlZE5hbWUpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaXRlcmF0b3Igb2YgYWxsIGtleS92YWx1ZSBwYWlycyBjb250YWluZWQgaW4gdGhpcyBvYmplY3QuXG4gICAqXG4gICAqIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcywgc2VlIGh0dHA6Ly9tZG4uaW8vRm9ybURhdGEvZW50cmllcy5cbiAgICpcbiAgICogQHJldHVybiB7IUl0ZXJhdG9yPCFBcnJheTxzdHJpbmd8IUZpbGU+Pn1cbiAgICovXG4gIGVudHJpZXMoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3cmFwcGVkIG5hdGl2ZSBgRm9ybURhdGFgIG9iamVjdC5cbiAgICpcbiAgICogQHJldHVybiB7IUZvcm1EYXRhfVxuICAgKi9cbiAgZ2V0Rm9ybURhdGEoKSB7fVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBmaWxlIGlzIGFuIGVtcHR5IGZpbGUsIHdoaWNoIGlzIHRoZSByZXN1bHQgb2Ygc3VibWl0dGluZ1xuICogYW4gZW1wdHkgYDxpbnB1dCB0eXBlPVwiZmlsZVwiPmAuIFRoZXNlIGNhdXNlIGVycm9ycyB3aGVuIHN1Ym1pdHRpbmcgZm9ybXNcbiAqIGluIFNhZmFyaSAxMS5cbiAqXG4gKiBAcGFyYW0geyFGaWxlfSBmaWxlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5RmlsZShmaWxlKSB7XG4gIHJldHVybiBmaWxlLm5hbWUgPT0gJycgJiYgZmlsZS5zaXplID09IDA7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/form-data-wrapper.js