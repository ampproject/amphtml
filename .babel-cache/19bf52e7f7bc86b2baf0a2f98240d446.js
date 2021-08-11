function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function PolyfillFormDataWrapper() {var opt_form = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;_classCallCheck(this, PolyfillFormDataWrapper);
    /** @private @const {!Object<string, !Array<string>>} */
    this.fieldValues_ = opt_form ? getFormAsObject(opt_form) : map();
  }

  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */_createClass(PolyfillFormDataWrapper, [{ key: "append", value:
    function append(name, value, opt_filename) {
      // Coercion to string is required to match
      // the native FormData.append behavior
      var nameString = String(name);
      this.fieldValues_[nameString] = this.fieldValues_[nameString] || [];
      this.fieldValues_[nameString].push(String(value));
    }

    /** @override */ }, { key: "delete", value:
    function _delete(name) {
      delete this.fieldValues_[name];
    }

    /** @override */ }, { key: "entries", value:
    function entries() {var _this = this;
      var fieldEntries = [];
      Object.keys(this.fieldValues_).forEach(function (name) {
        var values = _this.fieldValues_[name];
        values.forEach(function (value) {return fieldEntries.push([name, value]);});
      });

      // Generator functions are not supported by the current Babel configuration,
      // so we must manually implement the iterator interface.
      var nextIndex = 0;
      return (/** @type {!Iterator<!Array<string>>} */({
          next: function next() {
            return nextIndex < fieldEntries.length ?
            { value: fieldEntries[nextIndex++], done: false } :
            { value: undefined, done: true };
          } }));

    }

    /** @override */ }, { key: "getFormData", value:
    function getFormData() {var _this2 = this;
      var formData = new FormData();

      Object.keys(this.fieldValues_).forEach(function (name) {
        var values = _this2.fieldValues_[name];
        values.forEach(function (value) {return formData.append(name, value);});
      });

      return formData;
    } }]);return PolyfillFormDataWrapper;}();


/**
 * Wrap the native `FormData` implementation.
 *
 * NOTE: This differs from the standard `FormData` constructor. This constructor
 * includes a submit button if it was used to submit the `opt_form`, where
 * the native `FormData` constructor does not include the submit button used to
 * submit the form.
 * {@link https://xhr.spec.whatwg.org/#dom-formdata}
 * @implements {FormDataWrapperInterface}
 */var
NativeFormDataWrapper = /*#__PURE__*/function () {
  /** @override */
  function NativeFormDataWrapper(opt_form) {_classCallCheck(this, NativeFormDataWrapper);
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
   */_createClass(NativeFormDataWrapper, [{ key: "maybeIncludeSubmitButton_", value:
    function maybeIncludeSubmitButton_(opt_form) {
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
     */ }, { key: "append", value:
    function append(name, value, opt_filename) {
      this.formData_.append(name, value);
    }

    /** @override */ }, { key: "delete", value:
    function _delete(name) {
      this.formData_.delete(name);
    }

    /** @override */ }, { key: "entries", value:
    function entries() {
      return this.formData_.entries();
    }

    /** @override */ }, { key: "getFormData", value:
    function getFormData() {
      return this.formData_;
    } }]);return NativeFormDataWrapper;}();


/**
 * iOS 11 has a bug when submitting empty file inputs.
 * This works around the bug by replacing the empty files with Blob objects.
 */var
Ios11NativeFormDataWrapper = /*#__PURE__*/function (_NativeFormDataWrappe) {_inherits(Ios11NativeFormDataWrapper, _NativeFormDataWrappe);var _super = _createSuper(Ios11NativeFormDataWrapper);
  /** @override */
  function Ios11NativeFormDataWrapper(opt_form) {var _this3;_classCallCheck(this, Ios11NativeFormDataWrapper);
    _this3 = _super.call(this, opt_form);

    if (opt_form) {
      iterateCursor(opt_form.elements, function (input) {
        if (input.type == 'file' && input.files.length == 0) {
          _this3.formData_.delete(input.name);
          _this3.formData_.append(input.name, new Blob([]), '');
        }
      });
    }return _this3;
  }

  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */_createClass(Ios11NativeFormDataWrapper, [{ key: "append", value:
    function append(name, value, opt_filename) {
      // Safari 11 breaks on submitting empty File values.
      if (value && _typeof(value) == 'object' && isEmptyFile(value)) {
        this.formData_.append(name, new Blob([]), opt_filename || '');
      } else {
        this.formData_.append(name, value);
      }
    } }]);return Ios11NativeFormDataWrapper;}(NativeFormDataWrapper);


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
 */var
FormDataWrapperInterface = /*#__PURE__*/function () {
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
  function FormDataWrapperInterface(opt_form) {_classCallCheck(this, FormDataWrapperInterface);}

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
   */_createClass(FormDataWrapperInterface, [{ key: "append", value:
    function append(unusedName, unusedValue, opt_filename) {}

    /**
     * Remove the given value from the FormData.
     *
     * For more details on this, see http://mdn.io/FormData/delete.
     *
     * @param {string} unusedName The name of the field to remove from the FormData.
     */ }, { key: "delete", value:
    function _delete(unusedName) {}

    /**
     * Returns an iterator of all key/value pairs contained in this object.
     *
     * For more details on this, see http://mdn.io/FormData/entries.
     *
     * @return {!Iterator<!Array<string|!File>>}
     */ }, { key: "entries", value:
    function entries() {}

    /**
     * Returns the wrapped native `FormData` object.
     *
     * @return {!FormData}
     */ }, { key: "getFormData", value:
    function getFormData() {} }]);return FormDataWrapperInterface;}();


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
// /Users/mszylkowski/src/amphtml/src/form-data-wrapper.js