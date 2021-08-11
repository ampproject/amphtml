function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { dict, recreateNonProtoObject } from "../core/types/object";
import { parseJson } from "../core/types/object/json";

import { Services } from "./";

import { dev, devAssert } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { getSourceOrigin } from "../url";

/** @const */
var TAG = 'Storage';

/** @const */
var MAX_VALUES_PER_ORIGIN = 8;

/**
 * The storage API. This is an API equivalent to the Web LocalStorage API but
 * extended to all AMP embedding scenarios.
 *
 * The storage is done per source origin. See `get`, `set` and `remove` methods
 * for more info.
 *
 * @see https://html.spec.whatwg.org/multipage/webstorage.html
 * @private Visible for testing only.
 */
export var Storage = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!../service/viewer-interface.ViewerInterface} viewer
   * @param {!StorageBindingDef} binding
   */
  function Storage(ampdoc, viewer, binding) {_classCallCheck(this, Storage);
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!../service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;

    /** @private @const {!StorageBindingDef} */
    this.binding_ = binding;

    /** @private @const {boolean} */
    this.isViewerStorage_ = binding instanceof ViewerStorageBinding;

    /** @const @private {string} */
    this.origin_ = getSourceOrigin(this.ampdoc.win.location);

    /** @private {?Promise<!Store>} */
    this.storePromise_ = null;
  }

  /**
   * @return {!Storage}
   * @protected
   */_createClass(Storage, [{ key: "start_", value:
    function start_() {
      this.listenToBroadcasts_();
      return this;
    }

    /**
     * Returns the promise that yields the value of the property for the specified
     * key.
     * @param {string} name
     * @param {number=} opt_duration
     * @return {!Promise<*>}
     */ }, { key: "get", value:
    function get(name, opt_duration) {
      return this.getStore_().then(function (store) {return store.get(name, opt_duration);});
    }

    /**
     * Saves the value (restricted to boolean value) of the specified property.
     * Returns the promise that's resolved when the operation completes.
     * @param {string} name
     * @param {*} value
     * @param {boolean=} opt_isUpdate
     * @return {!Promise}
     */ }, { key: "set", value:
    function set(name, value, opt_isUpdate) {
      devAssert(typeof value == 'boolean');
      return this.setNonBoolean(name, value, opt_isUpdate);
    }

    /**
     * Saves the value of the specified property. Returns the promise that's
     * resolved when the operation completes.
     * Note: More restrict privacy review is required to store non boolean value.
     * @param {string} name
     * @param {*} value
     * @param {boolean=} opt_isUpdate
     * @return {!Promise}
     */ }, { key: "setNonBoolean", value:
    function setNonBoolean(name, value, opt_isUpdate) {
      return this.saveStore_(function (store) {return store.set(name, value, opt_isUpdate);});
    }

    /**
     * Removes the specified property. Returns the promise that's resolved when
     * the operation completes.
     * @param {string} name
     * @return {!Promise}
     */ }, { key: "remove", value:
    function remove(name) {
      return this.saveStore_(function (store) {return store.remove(name);});
    }

    /**
     * Returns if this.binding is an instance of ViewerStorageBinding
     * @return {boolean}
     */ }, { key: "isViewerStorage", value:
    function isViewerStorage() {
      return this.isViewerStorage_;
    }

    /**
     * @return {!Promise<!Store>}
     * @private
     */ }, { key: "getStore_", value:
    function getStore_() {
      if (!this.storePromise_) {
        this.storePromise_ = this.binding_.
        loadBlob(this.origin_).
        then(function (blob) {return (blob ? parseJson(atob(blob)) : {});}).
        catch(function (reason) {
          dev().expectedError(TAG, 'Failed to load store: ', reason);
          return {};
        }).
        then(function (obj) {return new Store(obj);});
      }
      return this.storePromise_;
    }

    /**
     * @param {function(!Store)} mutator
     * @return {!Promise}
     * @private
     */ }, { key: "saveStore_", value:
    function saveStore_(mutator) {var _this = this;
      return this.getStore_().
      then(function (store) {
        mutator(store);
        // Need to encode stored object to avoid plain text,
        // but doesn't need to be base64encode. Can convert to some other
        // encoding method for further improvement.
        var blob = btoa(JSON.stringify(store.obj));
        return _this.binding_.saveBlob(_this.origin_, blob);
      }).
      then(this.broadcastReset_.bind(this));
    }

    /** @private */ }, { key: "listenToBroadcasts_", value:
    function listenToBroadcasts_() {var _this2 = this;
      this.viewer_.onBroadcast(function (message) {
        if (
        message['type'] == 'amp-storage-reset' &&
        message['origin'] == _this2.origin_)
        {
          dev().fine(TAG, 'Received reset message');
          _this2.storePromise_ = null;
        }
      });
    }

    /** @private */ }, { key: "broadcastReset_", value:
    function broadcastReset_() {
      dev().fine(TAG, 'Broadcasted reset message');
      this.viewer_.broadcast(
      /** @type {!JsonObject} */({
        'type': 'amp-storage-reset',
        'origin': this.origin_ }));


    } }]);return Storage;}();


/**
 * The implementation of store logic for get, set and remove.
 *
 * The structure of the store is equivalent to the following typedef:
 * ```
 * {
 *   vv: !Object<key(string), !{
 *     v: *,
 *     t: time
 *   }>
 * }
 * ```
 *
 * @private Visible for testing only.
 */
export var Store = /*#__PURE__*/function () {
  /**
   * @param {!JsonObject} obj
   * @param {number=} opt_maxValues
   */
  function Store(obj, opt_maxValues) {_classCallCheck(this, Store);
    /** @const {!JsonObject} */
    this.obj = /** @type {!JsonObject} */(recreateNonProtoObject(obj));

    /** @private @const {number} */
    this.maxValues_ = opt_maxValues || MAX_VALUES_PER_ORIGIN;

    /** @private @const {!Object<string, !JsonObject>} */
    this.values_ = this.obj['vv'] || Object.create(null);
    if (!this.obj['vv']) {
      this.obj['vv'] = this.values_;
    }
  }

  /**
   * @param {string} name
   * @param {number|undefined} opt_duration
   * @return {*|undefined}
   */_createClass(Store, [{ key: "get", value:
    function get(name, opt_duration) {
      // The structure is {key: {v: *, t: time}}
      var item = this.values_[name];
      var timestamp = item ? item['t'] : undefined;
      var isNotExpired =
      opt_duration && timestamp != undefined ?
      timestamp + opt_duration > Date.now() :
      true;
      var value = item && isNotExpired ? item['v'] : undefined;
      return value;
    }

    /**
     * Set the storage value along with the current timestamp.
     * When opt_isUpdated is true, timestamp will be the creation timestamp,
     * the stored value will be updated w/o updating timestamp.
     * @param {string} name
     * @param {*} value
     * @param {boolean=} opt_isUpdate
     */ }, { key: "set", value:
    function set(name, value, opt_isUpdate) {
      devAssert(
      name != '__proto__' && name != 'prototype');



      // The structure is {key: {v: *, t: time}}
      if (this.values_[name] !== undefined) {
        var item = this.values_[name];
        var timestamp = Date.now();
        if (opt_isUpdate) {
          // Update value w/o timestamp
          timestamp = item['t'];
        }
        item['v'] = value;
        item['t'] = timestamp;
      } else {
        this.values_[name] = dict({
          'v': value,
          't': Date.now() });

      }

      // Purge old values.
      var keys = Object.keys(this.values_);
      if (keys.length > this.maxValues_) {
        var minTime = Infinity;
        var minKey = null;
        for (var i = 0; i < keys.length; i++) {
          var _item = this.values_[keys[i]];
          if (_item['t'] < minTime) {
            minKey = keys[i];
            minTime = _item['t'];
          }
        }
        if (minKey) {
          delete this.values_[minKey];
        }
      }
    }

    /**
     * @param {string} name
     */ }, { key: "remove", value:
    function remove(name) {
      // The structure is {key: {v: *, t: time}}
      delete this.values_[name];
    } }]);return Store;}();


/**
 * A binding provides the specific implementation of storage technology.
 * @interface
 */var
StorageBindingDef = /*#__PURE__*/function () {function StorageBindingDef() {_classCallCheck(this, StorageBindingDef);}_createClass(StorageBindingDef, [{ key: "loadBlob", value:
    /**
     * Returns the promise that yields the store blob for the specified origin.
     * @param {string} unusedOrigin
     * @return {!Promise<?string>}
     */
    function loadBlob(unusedOrigin) {}

    /**
     * Saves the store blob for the specified origin and returns the promise
     * that's resolved when the operation completes.
     * @param {string} unusedOrigin
     * @param {string} unusedBlob
     * @return {!Promise}
     */ }, { key: "saveBlob", value:
    function saveBlob(unusedOrigin, unusedBlob) {} }]);return StorageBindingDef;}();


/**
 * Storage implementation using Web LocalStorage API.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export var LocalStorageBinding = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function LocalStorageBinding(win) {_classCallCheck(this, LocalStorageBinding);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {boolean} */
    this.isLocalStorageSupported_ = this.checkIsLocalStorageSupported_();

    if (!this.isLocalStorageSupported_) {
      var error = new Error('localStorage not supported.');
      dev().expectedError(TAG, error);
    }
  }

  /**
   * Determines whether localStorage API is supported by ensuring it is declared
   * and does not throw an exception when used.
   * @return {boolean}
   * @private
   */_createClass(LocalStorageBinding, [{ key: "checkIsLocalStorageSupported_", value:
    function checkIsLocalStorageSupported_() {
      try {
        if (!('localStorage' in this.win)) {
          return false;
        }

        // We do not care about the value fetched from local storage; we only care
        // whether the call throws an exception or not.  As such, we can look up
        // any arbitrary key.
        this.win.localStorage.getItem('test');
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
     * @param {string} origin
     * @return {string}
     * @private
     */ }, { key: "getKey_", value:
    function getKey_(origin) {
      return "amp-store:".concat(origin);
    }

    /** @override */ }, { key: "loadBlob", value:
    function loadBlob(origin) {var _this3 = this;
      return new Promise(function (resolve) {
        if (!_this3.isLocalStorageSupported_) {
          resolve(null);
          return;
        }
        resolve(_this3.win.localStorage.getItem(_this3.getKey_(origin)));
      });
    }

    /** @override */ }, { key: "saveBlob", value:
    function saveBlob(origin, blob) {var _this4 = this;
      return new Promise(function (resolve) {
        if (!_this4.isLocalStorageSupported_) {
          resolve();
          return;
        }
        _this4.win.localStorage.setItem(_this4.getKey_(origin), blob);
        resolve();
      });
    } }]);return LocalStorageBinding;}();


/**
 * Storage implementation delegated to the Viewer.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export var ViewerStorageBinding = /*#__PURE__*/function () {
  /**
   * @param {!../service/viewer-interface.ViewerInterface} viewer
   */
  function ViewerStorageBinding(viewer) {_classCallCheck(this, ViewerStorageBinding);
    /** @private @const {!../service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /** @override */_createClass(ViewerStorageBinding, [{ key: "loadBlob", value:
    function loadBlob(origin) {
      return this.viewer_.
      sendMessageAwaitResponse('loadStore', dict({ 'origin': origin })).
      then(function (response) {return response['blob'];});
    }

    /** @override */ }, { key: "saveBlob", value:
    function saveBlob(origin, blob) {
      return (/** @type {!Promise} */(
        this.viewer_.
        sendMessageAwaitResponse(
        'saveStore',
        dict({ 'origin': origin, 'blob': blob })).

        catch(function (reason) {
          throw dev().createExpectedError(
          TAG,
          'Failed to save store: ',
          reason);

        })));

    } }]);return ViewerStorageBinding;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStorageServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
  ampdoc,
  'storage',
  function () {
    var viewer = Services.viewerForDoc(ampdoc);
    var overrideStorage = parseInt(viewer.getParam('storage'), 10);
    var binding = overrideStorage ?
    new ViewerStorageBinding(viewer) :
    new LocalStorageBinding(ampdoc.win);
    return new Storage(ampdoc, viewer, binding).start_();
  },
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/storage-impl.js