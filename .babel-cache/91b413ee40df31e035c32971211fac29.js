function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import { map } from "../core/types/object";

import { Xhr } from "./xhr-impl";

import { getService, registerServiceBuilder } from "../service-helpers";
import { getSourceOrigin, removeFragment, resolveRelativeUrl } from "../url";

/**
 * A wrapper around the Xhr service which batches the result of GET requests
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export var BatchedXhr = /*#__PURE__*/function (_Xhr) {_inherits(BatchedXhr, _Xhr);var _super = _createSuper(BatchedXhr);
  /**
   * @param {!Window} win
   */
  function BatchedXhr(win) {var _this;_classCallCheck(this, BatchedXhr);
    _this = _super.call(this, win);

    /** @const {!Object<!Promise<!Response>>} */
    _this.fetchPromises_ = map();return _this;
  }

  /**
   * Fetch and batch the requests if possible.
   *
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   * @override
   */_createClass(BatchedXhr, [{ key: "fetch", value:
    function fetch(input, opt_init) {var _this2 = this;
      var accept =
      (opt_init && opt_init.headers && opt_init.headers['Accept']) || '';
      var isBatchable =
      !opt_init || !opt_init.method || opt_init.method === 'GET';
      var key = this.getMapKey_(input, accept);
      var isBatched = !!this.fetchPromises_[key];

      if (isBatchable && isBatched) {
        return this.fetchPromises_[key].then(function (response) {return response.clone();});
      }

      var fetchPromise = _get(_getPrototypeOf(BatchedXhr.prototype), "fetch", this).call(this, input, opt_init);

      if (isBatchable) {
        this.fetchPromises_[key] = fetchPromise.then(
        function (response) {
          delete _this2.fetchPromises_[key];
          return response.clone();
        },
        function (err) {
          delete _this2.fetchPromises_[key];
          throw err;
        });

      }

      return fetchPromise;
    }

    /**
     * Creates a map key for a fetch.
     *
     * @param {string} input URL
     * @param {string} responseType
     * @return {string}
     * @private
     */ }, { key: "getMapKey_", value:
    function getMapKey_(input, responseType) {
      var absoluteUrl = resolveRelativeUrl(
      input,
      getSourceOrigin(this.win.location));

      return removeFragment(absoluteUrl) + responseType;
    } }]);return BatchedXhr;}(Xhr);


/**
 * @param {!Window} window
 * @return {!BatchedXhr}
 */
export function batchedXhrServiceForTesting(window) {
  installBatchedXhrService(window);
  return getService(window, 'batched-xhr');
}

/**
 * @param {!Window} window
 */
export function installBatchedXhrService(window) {
  registerServiceBuilder(window, 'batched-xhr', BatchedXhr);
}
// /Users/mszylkowski/src/amphtml/src/service/batched-xhr-impl.js