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
  function Storage(ampdoc, viewer, binding) {
    _classCallCheck(this, Storage);

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
   */
  _createClass(Storage, [{
    key: "start_",
    value: function start_() {
      this.listenToBroadcasts_();
      return this;
    }
    /**
     * Returns the promise that yields the value of the property for the specified
     * key.
     * @param {string} name
     * @param {number=} opt_duration
     * @return {!Promise<*>}
     */

  }, {
    key: "get",
    value: function get(name, opt_duration) {
      return this.getStore_().then(function (store) {
        return store.get(name, opt_duration);
      });
    }
    /**
     * Saves the value (restricted to boolean value) of the specified property.
     * Returns the promise that's resolved when the operation completes.
     * @param {string} name
     * @param {*} value
     * @param {boolean=} opt_isUpdate
     * @return {!Promise}
     */

  }, {
    key: "set",
    value: function set(name, value, opt_isUpdate) {
      devAssert(typeof value == 'boolean', 'Only boolean values accepted');
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
     */

  }, {
    key: "setNonBoolean",
    value: function setNonBoolean(name, value, opt_isUpdate) {
      return this.saveStore_(function (store) {
        return store.set(name, value, opt_isUpdate);
      });
    }
    /**
     * Removes the specified property. Returns the promise that's resolved when
     * the operation completes.
     * @param {string} name
     * @return {!Promise}
     */

  }, {
    key: "remove",
    value: function remove(name) {
      return this.saveStore_(function (store) {
        return store.remove(name);
      });
    }
    /**
     * Returns if this.binding is an instance of ViewerStorageBinding
     * @return {boolean}
     */

  }, {
    key: "isViewerStorage",
    value: function isViewerStorage() {
      return this.isViewerStorage_;
    }
    /**
     * @return {!Promise<!Store>}
     * @private
     */

  }, {
    key: "getStore_",
    value: function getStore_() {
      if (!this.storePromise_) {
        this.storePromise_ = this.binding_.loadBlob(this.origin_).then(function (blob) {
          return blob ? parseJson(atob(blob)) : {};
        }).catch(function (reason) {
          dev().expectedError(TAG, 'Failed to load store: ', reason);
          return {};
        }).then(function (obj) {
          return new Store(obj);
        });
      }

      return this.storePromise_;
    }
    /**
     * @param {function(!Store)} mutator
     * @return {!Promise}
     * @private
     */

  }, {
    key: "saveStore_",
    value: function saveStore_(mutator) {
      var _this = this;

      return this.getStore_().then(function (store) {
        mutator(store);
        // Need to encode stored object to avoid plain text,
        // but doesn't need to be base64encode. Can convert to some other
        // encoding method for further improvement.
        var blob = btoa(JSON.stringify(store.obj));
        return _this.binding_.saveBlob(_this.origin_, blob);
      }).then(this.broadcastReset_.bind(this));
    }
    /** @private */

  }, {
    key: "listenToBroadcasts_",
    value: function listenToBroadcasts_() {
      var _this2 = this;

      this.viewer_.onBroadcast(function (message) {
        if (message['type'] == 'amp-storage-reset' && message['origin'] == _this2.origin_) {
          dev().fine(TAG, 'Received reset message');
          _this2.storePromise_ = null;
        }
      });
    }
    /** @private */

  }, {
    key: "broadcastReset_",
    value: function broadcastReset_() {
      dev().fine(TAG, 'Broadcasted reset message');
      this.viewer_.broadcast(
      /** @type {!JsonObject} */
      {
        'type': 'amp-storage-reset',
        'origin': this.origin_
      });
    }
  }]);

  return Storage;
}();

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
  function Store(obj, opt_maxValues) {
    _classCallCheck(this, Store);

    /** @const {!JsonObject} */
    this.obj =
    /** @type {!JsonObject} */
    recreateNonProtoObject(obj);

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
   */
  _createClass(Store, [{
    key: "get",
    value: function get(name, opt_duration) {
      // The structure is {key: {v: *, t: time}}
      var item = this.values_[name];
      var timestamp = item ? item['t'] : undefined;
      var isNotExpired = opt_duration && timestamp != undefined ? timestamp + opt_duration > Date.now() : true;
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
     */

  }, {
    key: "set",
    value: function set(name, value, opt_isUpdate) {
      devAssert(name != '__proto__' && name != 'prototype', 'Name is not allowed: %s', name);

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
          't': Date.now()
        });
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
     */

  }, {
    key: "remove",
    value: function remove(name) {
      // The structure is {key: {v: *, t: time}}
      delete this.values_[name];
    }
  }]);

  return Store;
}();

/**
 * A binding provides the specific implementation of storage technology.
 * @interface
 */
var StorageBindingDef = /*#__PURE__*/function () {
  function StorageBindingDef() {
    _classCallCheck(this, StorageBindingDef);
  }

  _createClass(StorageBindingDef, [{
    key: "loadBlob",
    value:
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
     */

  }, {
    key: "saveBlob",
    value: function saveBlob(unusedOrigin, unusedBlob) {}
  }]);

  return StorageBindingDef;
}();

/**
 * Storage implementation using Web LocalStorage API.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export var LocalStorageBinding = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function LocalStorageBinding(win) {
    _classCallCheck(this, LocalStorageBinding);

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
   */
  _createClass(LocalStorageBinding, [{
    key: "checkIsLocalStorageSupported_",
    value: function checkIsLocalStorageSupported_() {
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
     */

  }, {
    key: "getKey_",
    value: function getKey_(origin) {
      return "amp-store:" + origin;
    }
    /** @override */

  }, {
    key: "loadBlob",
    value: function loadBlob(origin) {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (!_this3.isLocalStorageSupported_) {
          resolve(null);
          return;
        }

        resolve(_this3.win.localStorage.getItem(_this3.getKey_(origin)));
      });
    }
    /** @override */

  }, {
    key: "saveBlob",
    value: function saveBlob(origin, blob) {
      var _this4 = this;

      return new Promise(function (resolve) {
        if (!_this4.isLocalStorageSupported_) {
          resolve();
          return;
        }

        _this4.win.localStorage.setItem(_this4.getKey_(origin), blob);

        resolve();
      });
    }
  }]);

  return LocalStorageBinding;
}();

/**
 * Storage implementation delegated to the Viewer.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export var ViewerStorageBinding = /*#__PURE__*/function () {
  /**
   * @param {!../service/viewer-interface.ViewerInterface} viewer
   */
  function ViewerStorageBinding(viewer) {
    _classCallCheck(this, ViewerStorageBinding);

    /** @private @const {!../service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /** @override */
  _createClass(ViewerStorageBinding, [{
    key: "loadBlob",
    value: function loadBlob(origin) {
      return this.viewer_.sendMessageAwaitResponse('loadStore', dict({
        'origin': origin
      })).then(function (response) {
        return response['blob'];
      });
    }
    /** @override */

  }, {
    key: "saveBlob",
    value: function saveBlob(origin, blob) {
      return (
        /** @type {!Promise} */
        this.viewer_.sendMessageAwaitResponse('saveStore', dict({
          'origin': origin,
          'blob': blob
        })).catch(function (reason) {
          throw dev().createExpectedError(TAG, 'Failed to save store: ', reason);
        })
      );
    }
  }]);

  return ViewerStorageBinding;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStorageServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'storage', function () {
    var viewer = Services.viewerForDoc(ampdoc);
    var overrideStorage = parseInt(viewer.getParam('storage'), 10);
    var binding = overrideStorage ? new ViewerStorageBinding(viewer) : new LocalStorageBinding(ampdoc.win);
    return new Storage(ampdoc, viewer, binding).start_();
  },
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3JhZ2UtaW1wbC5qcyJdLCJuYW1lcyI6WyJkaWN0IiwicmVjcmVhdGVOb25Qcm90b09iamVjdCIsInBhcnNlSnNvbiIsIlNlcnZpY2VzIiwiZGV2IiwiZGV2QXNzZXJ0IiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsImdldFNvdXJjZU9yaWdpbiIsIlRBRyIsIk1BWF9WQUxVRVNfUEVSX09SSUdJTiIsIlN0b3JhZ2UiLCJhbXBkb2MiLCJ2aWV3ZXIiLCJiaW5kaW5nIiwidmlld2VyXyIsImJpbmRpbmdfIiwiaXNWaWV3ZXJTdG9yYWdlXyIsIlZpZXdlclN0b3JhZ2VCaW5kaW5nIiwib3JpZ2luXyIsIndpbiIsImxvY2F0aW9uIiwic3RvcmVQcm9taXNlXyIsImxpc3RlblRvQnJvYWRjYXN0c18iLCJuYW1lIiwib3B0X2R1cmF0aW9uIiwiZ2V0U3RvcmVfIiwidGhlbiIsInN0b3JlIiwiZ2V0IiwidmFsdWUiLCJvcHRfaXNVcGRhdGUiLCJzZXROb25Cb29sZWFuIiwic2F2ZVN0b3JlXyIsInNldCIsInJlbW92ZSIsImxvYWRCbG9iIiwiYmxvYiIsImF0b2IiLCJjYXRjaCIsInJlYXNvbiIsImV4cGVjdGVkRXJyb3IiLCJvYmoiLCJTdG9yZSIsIm11dGF0b3IiLCJidG9hIiwiSlNPTiIsInN0cmluZ2lmeSIsInNhdmVCbG9iIiwiYnJvYWRjYXN0UmVzZXRfIiwiYmluZCIsIm9uQnJvYWRjYXN0IiwibWVzc2FnZSIsImZpbmUiLCJicm9hZGNhc3QiLCJvcHRfbWF4VmFsdWVzIiwibWF4VmFsdWVzXyIsInZhbHVlc18iLCJPYmplY3QiLCJjcmVhdGUiLCJpdGVtIiwidGltZXN0YW1wIiwidW5kZWZpbmVkIiwiaXNOb3RFeHBpcmVkIiwiRGF0ZSIsIm5vdyIsImtleXMiLCJsZW5ndGgiLCJtaW5UaW1lIiwiSW5maW5pdHkiLCJtaW5LZXkiLCJpIiwiU3RvcmFnZUJpbmRpbmdEZWYiLCJ1bnVzZWRPcmlnaW4iLCJ1bnVzZWRCbG9iIiwiTG9jYWxTdG9yYWdlQmluZGluZyIsImlzTG9jYWxTdG9yYWdlU3VwcG9ydGVkXyIsImNoZWNrSXNMb2NhbFN0b3JhZ2VTdXBwb3J0ZWRfIiwiZXJyb3IiLCJFcnJvciIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJlIiwib3JpZ2luIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRLZXlfIiwic2V0SXRlbSIsInNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZSIsInJlc3BvbnNlIiwiY3JlYXRlRXhwZWN0ZWRFcnJvciIsImluc3RhbGxTdG9yYWdlU2VydmljZUZvckRvYyIsInZpZXdlckZvckRvYyIsIm92ZXJyaWRlU3RvcmFnZSIsInBhcnNlSW50IiwiZ2V0UGFyYW0iLCJzdGFydF8iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLElBQVIsRUFBY0Msc0JBQWQ7QUFDQSxTQUFRQyxTQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLDRCQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBLElBQU1DLEdBQUcsR0FBRyxTQUFaOztBQUVBO0FBQ0EsSUFBTUMscUJBQXFCLEdBQUcsQ0FBOUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxPQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNFLG1CQUFZQyxNQUFaLEVBQW9CQyxNQUFwQixFQUE0QkMsT0FBNUIsRUFBcUM7QUFBQTs7QUFDbkM7QUFDQSxTQUFLRixNQUFMLEdBQWNBLE1BQWQ7O0FBRUE7QUFDQSxTQUFLRyxPQUFMLEdBQWVGLE1BQWY7O0FBRUE7QUFDQSxTQUFLRyxRQUFMLEdBQWdCRixPQUFoQjs7QUFFQTtBQUNBLFNBQUtHLGdCQUFMLEdBQXdCSCxPQUFPLFlBQVlJLG9CQUEzQzs7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QUFoQixDQUFELEVBQTZCLEVBQTdCLENBQWhDO0FBQ0EsUUFBTWpGLE9BQU8sR0FBRytFLGVBQWUsR0FDM0IsSUFBSTNFLG9CQUFKLENBQXlCTCxNQUF6QixDQUQyQixHQUUzQixJQUFJOEQsbUJBQUosQ0FBd0IvRCxNQUFNLENBQUNRLEdBQS9CLENBRko7QUFHQSxXQUFPLElBQUlULE9BQUosQ0FBWUMsTUFBWixFQUFvQkMsTUFBcEIsRUFBNEJDLE9BQTVCLEVBQXFDa0YsTUFBckMsRUFBUDtBQUNELEdBVnlCO0FBVzFCO0FBQXNCLE1BWEksQ0FBNUI7QUFhRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RpY3QsIHJlY3JlYXRlTm9uUHJvdG9PYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2dldFNvdXJjZU9yaWdpbn0gZnJvbSAnLi4vdXJsJztcblxuLyoqIEBjb25zdCAqL1xuY29uc3QgVEFHID0gJ1N0b3JhZ2UnO1xuXG4vKiogQGNvbnN0ICovXG5jb25zdCBNQVhfVkFMVUVTX1BFUl9PUklHSU4gPSA4O1xuXG4vKipcbiAqIFRoZSBzdG9yYWdlIEFQSS4gVGhpcyBpcyBhbiBBUEkgZXF1aXZhbGVudCB0byB0aGUgV2ViIExvY2FsU3RvcmFnZSBBUEkgYnV0XG4gKiBleHRlbmRlZCB0byBhbGwgQU1QIGVtYmVkZGluZyBzY2VuYXJpb3MuXG4gKlxuICogVGhlIHN0b3JhZ2UgaXMgZG9uZSBwZXIgc291cmNlIG9yaWdpbi4gU2VlIGBnZXRgLCBgc2V0YCBhbmQgYHJlbW92ZWAgbWV0aG9kc1xuICogZm9yIG1vcmUgaW5mby5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3dlYnN0b3JhZ2UuaHRtbFxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RvcmFnZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IS4uL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9IHZpZXdlclxuICAgKiBAcGFyYW0geyFTdG9yYWdlQmluZGluZ0RlZn0gYmluZGluZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jLCB2aWV3ZXIsIGJpbmRpbmcpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vc2VydmljZS92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdlcl8gPSB2aWV3ZXI7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshU3RvcmFnZUJpbmRpbmdEZWZ9ICovXG4gICAgdGhpcy5iaW5kaW5nXyA9IGJpbmRpbmc7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNWaWV3ZXJTdG9yYWdlXyA9IGJpbmRpbmcgaW5zdGFuY2VvZiBWaWV3ZXJTdG9yYWdlQmluZGluZztcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLm9yaWdpbl8gPSBnZXRTb3VyY2VPcmlnaW4odGhpcy5hbXBkb2Mud2luLmxvY2F0aW9uKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2U8IVN0b3JlPn0gKi9cbiAgICB0aGlzLnN0b3JlUHJvbWlzZV8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFTdG9yYWdlfVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBzdGFydF8oKSB7XG4gICAgdGhpcy5saXN0ZW5Ub0Jyb2FkY2FzdHNfKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHlpZWxkcyB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5IGZvciB0aGUgc3BlY2lmaWVkXG4gICAqIGtleS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZHVyYXRpb25cbiAgICogQHJldHVybiB7IVByb21pc2U8Kj59XG4gICAqL1xuICBnZXQobmFtZSwgb3B0X2R1cmF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmVfKCkudGhlbigoc3RvcmUpID0+IHN0b3JlLmdldChuYW1lLCBvcHRfZHVyYXRpb24pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlcyB0aGUgdmFsdWUgKHJlc3RyaWN0ZWQgdG8gYm9vbGVhbiB2YWx1ZSkgb2YgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eS5cbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0J3MgcmVzb2x2ZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaXNVcGRhdGVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBzZXQobmFtZSwgdmFsdWUsIG9wdF9pc1VwZGF0ZSkge1xuICAgIGRldkFzc2VydCh0eXBlb2YgdmFsdWUgPT0gJ2Jvb2xlYW4nLCAnT25seSBib29sZWFuIHZhbHVlcyBhY2NlcHRlZCcpO1xuICAgIHJldHVybiB0aGlzLnNldE5vbkJvb2xlYW4obmFtZSwgdmFsdWUsIG9wdF9pc1VwZGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZXMgdGhlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkuIFJldHVybnMgdGhlIHByb21pc2UgdGhhdCdzXG4gICAqIHJlc29sdmVkIHdoZW4gdGhlIG9wZXJhdGlvbiBjb21wbGV0ZXMuXG4gICAqIE5vdGU6IE1vcmUgcmVzdHJpY3QgcHJpdmFjeSByZXZpZXcgaXMgcmVxdWlyZWQgdG8gc3RvcmUgbm9uIGJvb2xlYW4gdmFsdWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzVXBkYXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgc2V0Tm9uQm9vbGVhbihuYW1lLCB2YWx1ZSwgb3B0X2lzVXBkYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2F2ZVN0b3JlXygoc3RvcmUpID0+IHN0b3JlLnNldChuYW1lLCB2YWx1ZSwgb3B0X2lzVXBkYXRlKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHByb3BlcnR5LiBSZXR1cm5zIHRoZSBwcm9taXNlIHRoYXQncyByZXNvbHZlZCB3aGVuXG4gICAqIHRoZSBvcGVyYXRpb24gY29tcGxldGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHJlbW92ZShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2F2ZVN0b3JlXygoc3RvcmUpID0+IHN0b3JlLnJlbW92ZShuYW1lKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGlzLmJpbmRpbmcgaXMgYW4gaW5zdGFuY2Ugb2YgVmlld2VyU3RvcmFnZUJpbmRpbmdcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVmlld2VyU3RvcmFnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1ZpZXdlclN0b3JhZ2VfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFTdG9yZT59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRTdG9yZV8oKSB7XG4gICAgaWYgKCF0aGlzLnN0b3JlUHJvbWlzZV8pIHtcbiAgICAgIHRoaXMuc3RvcmVQcm9taXNlXyA9IHRoaXMuYmluZGluZ19cbiAgICAgICAgLmxvYWRCbG9iKHRoaXMub3JpZ2luXylcbiAgICAgICAgLnRoZW4oKGJsb2IpID0+IChibG9iID8gcGFyc2VKc29uKGF0b2IoYmxvYikpIDoge30pKVxuICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xuICAgICAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHLCAnRmFpbGVkIHRvIGxvYWQgc3RvcmU6ICcsIHJlYXNvbik7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigob2JqKSA9PiBuZXcgU3RvcmUob2JqKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0b3JlUHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbighU3RvcmUpfSBtdXRhdG9yXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2F2ZVN0b3JlXyhtdXRhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmVfKClcbiAgICAgIC50aGVuKChzdG9yZSkgPT4ge1xuICAgICAgICBtdXRhdG9yKHN0b3JlKTtcbiAgICAgICAgLy8gTmVlZCB0byBlbmNvZGUgc3RvcmVkIG9iamVjdCB0byBhdm9pZCBwbGFpbiB0ZXh0LFxuICAgICAgICAvLyBidXQgZG9lc24ndCBuZWVkIHRvIGJlIGJhc2U2NGVuY29kZS4gQ2FuIGNvbnZlcnQgdG8gc29tZSBvdGhlclxuICAgICAgICAvLyBlbmNvZGluZyBtZXRob2QgZm9yIGZ1cnRoZXIgaW1wcm92ZW1lbnQuXG4gICAgICAgIGNvbnN0IGJsb2IgPSBidG9hKEpTT04uc3RyaW5naWZ5KHN0b3JlLm9iaikpO1xuICAgICAgICByZXR1cm4gdGhpcy5iaW5kaW5nXy5zYXZlQmxvYih0aGlzLm9yaWdpbl8sIGJsb2IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHRoaXMuYnJvYWRjYXN0UmVzZXRfLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGxpc3RlblRvQnJvYWRjYXN0c18oKSB7XG4gICAgdGhpcy52aWV3ZXJfLm9uQnJvYWRjYXN0KChtZXNzYWdlKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIG1lc3NhZ2VbJ3R5cGUnXSA9PSAnYW1wLXN0b3JhZ2UtcmVzZXQnICYmXG4gICAgICAgIG1lc3NhZ2VbJ29yaWdpbiddID09IHRoaXMub3JpZ2luX1xuICAgICAgKSB7XG4gICAgICAgIGRldigpLmZpbmUoVEFHLCAnUmVjZWl2ZWQgcmVzZXQgbWVzc2FnZScpO1xuICAgICAgICB0aGlzLnN0b3JlUHJvbWlzZV8gPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGJyb2FkY2FzdFJlc2V0XygpIHtcbiAgICBkZXYoKS5maW5lKFRBRywgJ0Jyb2FkY2FzdGVkIHJlc2V0IG1lc3NhZ2UnKTtcbiAgICB0aGlzLnZpZXdlcl8uYnJvYWRjYXN0KFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHtcbiAgICAgICAgJ3R5cGUnOiAnYW1wLXN0b3JhZ2UtcmVzZXQnLFxuICAgICAgICAnb3JpZ2luJzogdGhpcy5vcmlnaW5fLFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGltcGxlbWVudGF0aW9uIG9mIHN0b3JlIGxvZ2ljIGZvciBnZXQsIHNldCBhbmQgcmVtb3ZlLlxuICpcbiAqIFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHN0b3JlIGlzIGVxdWl2YWxlbnQgdG8gdGhlIGZvbGxvd2luZyB0eXBlZGVmOlxuICogYGBgXG4gKiB7XG4gKiAgIHZ2OiAhT2JqZWN0PGtleShzdHJpbmcpLCAhe1xuICogICAgIHY6ICosXG4gKiAgICAgdDogdGltZVxuICogICB9PlxuICogfVxuICogYGBgXG4gKlxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gb2JqXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X21heFZhbHVlc1xuICAgKi9cbiAgY29uc3RydWN0b3Iob2JqLCBvcHRfbWF4VmFsdWVzKSB7XG4gICAgLyoqIEBjb25zdCB7IUpzb25PYmplY3R9ICovXG4gICAgdGhpcy5vYmogPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAocmVjcmVhdGVOb25Qcm90b09iamVjdChvYmopKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge251bWJlcn0gKi9cbiAgICB0aGlzLm1heFZhbHVlc18gPSBvcHRfbWF4VmFsdWVzIHx8IE1BWF9WQUxVRVNfUEVSX09SSUdJTjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhSnNvbk9iamVjdD59ICovXG4gICAgdGhpcy52YWx1ZXNfID0gdGhpcy5vYmpbJ3Z2J10gfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBpZiAoIXRoaXMub2JqWyd2diddKSB7XG4gICAgICB0aGlzLm9ialsndnYnXSA9IHRoaXMudmFsdWVzXztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBvcHRfZHVyYXRpb25cbiAgICogQHJldHVybiB7Knx1bmRlZmluZWR9XG4gICAqL1xuICBnZXQobmFtZSwgb3B0X2R1cmF0aW9uKSB7XG4gICAgLy8gVGhlIHN0cnVjdHVyZSBpcyB7a2V5OiB7djogKiwgdDogdGltZX19XG4gICAgY29uc3QgaXRlbSA9IHRoaXMudmFsdWVzX1tuYW1lXTtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBpdGVtID8gaXRlbVsndCddIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGlzTm90RXhwaXJlZCA9XG4gICAgICBvcHRfZHVyYXRpb24gJiYgdGltZXN0YW1wICE9IHVuZGVmaW5lZFxuICAgICAgICA/IHRpbWVzdGFtcCArIG9wdF9kdXJhdGlvbiA+IERhdGUubm93KClcbiAgICAgICAgOiB0cnVlO1xuICAgIGNvbnN0IHZhbHVlID0gaXRlbSAmJiBpc05vdEV4cGlyZWQgPyBpdGVtWyd2J10gOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc3RvcmFnZSB2YWx1ZSBhbG9uZyB3aXRoIHRoZSBjdXJyZW50IHRpbWVzdGFtcC5cbiAgICogV2hlbiBvcHRfaXNVcGRhdGVkIGlzIHRydWUsIHRpbWVzdGFtcCB3aWxsIGJlIHRoZSBjcmVhdGlvbiB0aW1lc3RhbXAsXG4gICAqIHRoZSBzdG9yZWQgdmFsdWUgd2lsbCBiZSB1cGRhdGVkIHcvbyB1cGRhdGluZyB0aW1lc3RhbXAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzVXBkYXRlXG4gICAqL1xuICBzZXQobmFtZSwgdmFsdWUsIG9wdF9pc1VwZGF0ZSkge1xuICAgIGRldkFzc2VydChcbiAgICAgIG5hbWUgIT0gJ19fcHJvdG9fXycgJiYgbmFtZSAhPSAncHJvdG90eXBlJyxcbiAgICAgICdOYW1lIGlzIG5vdCBhbGxvd2VkOiAlcycsXG4gICAgICBuYW1lXG4gICAgKTtcbiAgICAvLyBUaGUgc3RydWN0dXJlIGlzIHtrZXk6IHt2OiAqLCB0OiB0aW1lfX1cbiAgICBpZiAodGhpcy52YWx1ZXNfW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnZhbHVlc19bbmFtZV07XG4gICAgICBsZXQgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgIGlmIChvcHRfaXNVcGRhdGUpIHtcbiAgICAgICAgLy8gVXBkYXRlIHZhbHVlIHcvbyB0aW1lc3RhbXBcbiAgICAgICAgdGltZXN0YW1wID0gaXRlbVsndCddO1xuICAgICAgfVxuICAgICAgaXRlbVsndiddID0gdmFsdWU7XG4gICAgICBpdGVtWyd0J10gPSB0aW1lc3RhbXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudmFsdWVzX1tuYW1lXSA9IGRpY3Qoe1xuICAgICAgICAndic6IHZhbHVlLFxuICAgICAgICAndCc6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBQdXJnZSBvbGQgdmFsdWVzLlxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnZhbHVlc18pO1xuICAgIGlmIChrZXlzLmxlbmd0aCA+IHRoaXMubWF4VmFsdWVzXykge1xuICAgICAgbGV0IG1pblRpbWUgPSBJbmZpbml0eTtcbiAgICAgIGxldCBtaW5LZXkgPSBudWxsO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnZhbHVlc19ba2V5c1tpXV07XG4gICAgICAgIGlmIChpdGVtWyd0J10gPCBtaW5UaW1lKSB7XG4gICAgICAgICAgbWluS2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBtaW5UaW1lID0gaXRlbVsndCddO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWluS2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnZhbHVlc19bbWluS2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICovXG4gIHJlbW92ZShuYW1lKSB7XG4gICAgLy8gVGhlIHN0cnVjdHVyZSBpcyB7a2V5OiB7djogKiwgdDogdGltZX19XG4gICAgZGVsZXRlIHRoaXMudmFsdWVzX1tuYW1lXTtcbiAgfVxufVxuXG4vKipcbiAqIEEgYmluZGluZyBwcm92aWRlcyB0aGUgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gb2Ygc3RvcmFnZSB0ZWNobm9sb2d5LlxuICogQGludGVyZmFjZVxuICovXG5jbGFzcyBTdG9yYWdlQmluZGluZ0RlZiB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9taXNlIHRoYXQgeWllbGRzIHRoZSBzdG9yZSBibG9iIGZvciB0aGUgc3BlY2lmaWVkIG9yaWdpbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZE9yaWdpblxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTw/c3RyaW5nPn1cbiAgICovXG4gIGxvYWRCbG9iKHVudXNlZE9yaWdpbikge31cblxuICAvKipcbiAgICogU2F2ZXMgdGhlIHN0b3JlIGJsb2IgZm9yIHRoZSBzcGVjaWZpZWQgb3JpZ2luIGFuZCByZXR1cm5zIHRoZSBwcm9taXNlXG4gICAqIHRoYXQncyByZXNvbHZlZCB3aGVuIHRoZSBvcGVyYXRpb24gY29tcGxldGVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkT3JpZ2luXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRCbG9iXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgc2F2ZUJsb2IodW51c2VkT3JpZ2luLCB1bnVzZWRCbG9iKSB7fVxufVxuXG4vKipcbiAqIFN0b3JhZ2UgaW1wbGVtZW50YXRpb24gdXNpbmcgV2ViIExvY2FsU3RvcmFnZSBBUEkuXG4gKiBAaW1wbGVtZW50cyB7U3RvcmFnZUJpbmRpbmdEZWZ9XG4gKiBAcHJpdmF0ZSBWaXNpYmxlIGZvciB0ZXN0aW5nIG9ubHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFN0b3JhZ2VCaW5kaW5nIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzTG9jYWxTdG9yYWdlU3VwcG9ydGVkXyA9IHRoaXMuY2hlY2tJc0xvY2FsU3RvcmFnZVN1cHBvcnRlZF8oKTtcblxuICAgIGlmICghdGhpcy5pc0xvY2FsU3RvcmFnZVN1cHBvcnRlZF8pIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdsb2NhbFN0b3JhZ2Ugbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciBsb2NhbFN0b3JhZ2UgQVBJIGlzIHN1cHBvcnRlZCBieSBlbnN1cmluZyBpdCBpcyBkZWNsYXJlZFxuICAgKiBhbmQgZG9lcyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gdXNlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNoZWNrSXNMb2NhbFN0b3JhZ2VTdXBwb3J0ZWRfKCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoISgnbG9jYWxTdG9yYWdlJyBpbiB0aGlzLndpbikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBkbyBub3QgY2FyZSBhYm91dCB0aGUgdmFsdWUgZmV0Y2hlZCBmcm9tIGxvY2FsIHN0b3JhZ2U7IHdlIG9ubHkgY2FyZVxuICAgICAgLy8gd2hldGhlciB0aGUgY2FsbCB0aHJvd3MgYW4gZXhjZXB0aW9uIG9yIG5vdC4gIEFzIHN1Y2gsIHdlIGNhbiBsb29rIHVwXG4gICAgICAvLyBhbnkgYXJiaXRyYXJ5IGtleS5cbiAgICAgIHRoaXMud2luLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0ZXN0Jyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0S2V5XyhvcmlnaW4pIHtcbiAgICByZXR1cm4gYGFtcC1zdG9yZToke29yaWdpbn1gO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsb2FkQmxvYihvcmlnaW4pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICghdGhpcy5pc0xvY2FsU3RvcmFnZVN1cHBvcnRlZF8pIHtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZSh0aGlzLndpbi5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmdldEtleV8ob3JpZ2luKSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzYXZlQmxvYihvcmlnaW4sIGJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICghdGhpcy5pc0xvY2FsU3RvcmFnZVN1cHBvcnRlZF8pIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLndpbi5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldEtleV8ob3JpZ2luKSwgYmxvYik7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTdG9yYWdlIGltcGxlbWVudGF0aW9uIGRlbGVnYXRlZCB0byB0aGUgVmlld2VyLlxuICogQGltcGxlbWVudHMge1N0b3JhZ2VCaW5kaW5nRGVmfVxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgVmlld2VyU3RvcmFnZUJpbmRpbmcge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vc2VydmljZS92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gdmlld2VyXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih2aWV3ZXIpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vc2VydmljZS92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdlcl8gPSB2aWV3ZXI7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGxvYWRCbG9iKG9yaWdpbikge1xuICAgIHJldHVybiB0aGlzLnZpZXdlcl9cbiAgICAgIC5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UoJ2xvYWRTdG9yZScsIGRpY3QoeydvcmlnaW4nOiBvcmlnaW59KSlcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2VbJ2Jsb2InXSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNhdmVCbG9iKG9yaWdpbiwgYmxvYikge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlfSAqLyAoXG4gICAgICB0aGlzLnZpZXdlcl9cbiAgICAgICAgLnNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZShcbiAgICAgICAgICAnc2F2ZVN0b3JlJyxcbiAgICAgICAgICBkaWN0KHsnb3JpZ2luJzogb3JpZ2luLCAnYmxvYic6IGJsb2J9KVxuICAgICAgICApXG4gICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZGV2KCkuY3JlYXRlRXhwZWN0ZWRFcnJvcihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICdGYWlsZWQgdG8gc2F2ZSBzdG9yZTogJyxcbiAgICAgICAgICAgIHJlYXNvblxuICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxTdG9yYWdlU2VydmljZUZvckRvYyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBhbXBkb2MsXG4gICAgJ3N0b3JhZ2UnLFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2MpO1xuICAgICAgY29uc3Qgb3ZlcnJpZGVTdG9yYWdlID0gcGFyc2VJbnQodmlld2VyLmdldFBhcmFtKCdzdG9yYWdlJyksIDEwKTtcbiAgICAgIGNvbnN0IGJpbmRpbmcgPSBvdmVycmlkZVN0b3JhZ2VcbiAgICAgICAgPyBuZXcgVmlld2VyU3RvcmFnZUJpbmRpbmcodmlld2VyKVxuICAgICAgICA6IG5ldyBMb2NhbFN0b3JhZ2VCaW5kaW5nKGFtcGRvYy53aW4pO1xuICAgICAgcmV0dXJuIG5ldyBTdG9yYWdlKGFtcGRvYywgdmlld2VyLCBiaW5kaW5nKS5zdGFydF8oKTtcbiAgICB9LFxuICAgIC8qIG9wdF9pbnN0YW50aWF0ZSAqLyB0cnVlXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/storage-impl.js