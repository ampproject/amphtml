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

import {registerServiceBuilderForDoc} from '../service';
import {getSourceOrigin} from '../url';
import {dev} from '../log';
import {dict} from '../utils/object';
import {parseJson, recreateNonProtoObject} from '../json';
import {viewerForDoc} from '../services';

/** @const */
const TAG = 'Storage';

/** @const */
const MAX_VALUES_PER_ORIGIN = 8;


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
export class Storage {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!../service/viewer-impl.Viewer} viewer
   * @param {!StorageBindingDef} binding
   */
  constructor(ampdoc, viewer, binding) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!../service/viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private @const {!StorageBindingDef} */
    this.binding_ = binding;

    /** @const @private {string} */
    this.origin_ = getSourceOrigin(this.ampdoc.win.location);

    /** @private {?Promise<!Store>} */
    this.storePromise_ = null;
  }

  /**
   * @return {!Storage}
   * @private
   */
  start_() {
    this.listenToBroadcasts_();
    return this;
  }

  /**
   * Returns the promise that yields the value of the property for the specified
   * key.
   * @param {string} name
   * @return {!Promise<*>}
   */
  get(name) {
    return this.getStore_().then(store => store.get(name));
  }

  /**
   * Saves the value of the specified property. Returns the promise that's
   * resolved when the operation completes.
   * @param {string} name
   * @param {*} value
   * @return {!Promise}
   */
  set(name, value) {
    dev().assert(typeof value == 'boolean', 'Only boolean values accepted');
    return this.saveStore_(store => store.set(name, value));
  }

  /**
   * Removes the specified property. Returns the promise that's resolved when
   * the operation completes.
   * @param {string} name
   * @return {!Promise}
   */
  remove(name) {
    return this.saveStore_(store => store.remove(name));
  }

  /**
   * @return {!Promise<!Store>}
   * @private
   */
  getStore_() {
    if (!this.storePromise_) {
      this.storePromise_ = this.binding_.loadBlob(this.origin_)
          .then(blob => blob ? parseJson(atob(blob)) : {})
          .catch(reason => {
            dev().expectedError(TAG, 'Failed to load store: ', reason);
            return {};
          })
          .then(obj => new Store(obj));
    }
    return this.storePromise_;
  }

  /**
   * @param {function(!Store)} mutator
   * @return {!Promise}
   * @private
   */
  saveStore_(mutator) {
    return this.getStore_()
        .then(store => {
          mutator(store);
          const blob = btoa(JSON.stringify(store.obj));
          return this.binding_.saveBlob(this.origin_, blob);
        })
        .then(this.broadcastReset_.bind(this));
  }

  /** @private */
  listenToBroadcasts_() {
    this.viewer_.onBroadcast(message => {
      if (message['type'] == 'amp-storage-reset' &&
              message['origin'] == this.origin_) {
        dev().fine(TAG, 'Received reset message');
        this.storePromise_ = null;
      }
    });
  }

  /** @private */
  broadcastReset_() {
    dev().fine(TAG, 'Broadcasted reset message');
    this.viewer_.broadcast(/** @type {!JsonObject} */ ({
      'type': 'amp-storage-reset',
      'origin': this.origin_,
    }));
  }
}


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
export class Store {
  /**
   * @param {!JsonObject} obj
   * @param {number=} opt_maxValues
   */
  constructor(obj, opt_maxValues) {
    /** @const {!JsonObject} */
    this.obj = /** @type {!JsonObject} */ (recreateNonProtoObject(obj));

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
   * @return {*|undefined}
   */
  get(name) {
    // The structure is {key: {v: *, t: time}}
    const item = this.values_[name];
    return item ? item['v'] : undefined;
  }

  /**
   * @param {string} name
   * @param {*} value
   */
  set(name, value) {
    dev().assert(name != '__proto__' && name != 'prototype',
        'Name is not allowed: %s', name);
    // The structure is {key: {v: *, t: time}}
    if (this.values_[name] !== undefined) {
      const item = this.values_[name];
      item['v'] = value;
      item['t'] = Date.now();
    } else {
      this.values_[name] = dict({
        'v': value,
        't': Date.now(),
      });
    }

    // Purge old values.
    const keys = Object.keys(this.values_);
    if (keys.length > this.maxValues_) {
      let minTime = Infinity;
      let minKey = null;
      for (let i = 0; i < keys.length; i++) {
        const item = this.values_[keys[i]];
        if (item['t'] < minTime) {
          minKey = keys[i];
          minTime = item['t'];
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
  remove(name) {
    // The structure is {key: {v: *, t: time}}
    delete this.values_[name];
  }
}


/**
 * A binding provides the specific implementation of storage technology.
 * @interface
 */
class StorageBindingDef {

  /**
   * Returns the promise that yields the store blob for the specified origin.
   * @param {string} unusedOrigin
   * @return {!Promise<?string>}
   */
  loadBlob(unusedOrigin) {}

  /**
   * Saves the store blob for the specified origin and returns the promise
   * that's resolved when the operation completes.
   * @param {string} unusedOrigin
   * @param {string} unusedBlob
   * @return {!Promise}
   */
  saveBlob(unusedOrigin, unusedBlob) {}
}


/**
 * Storage implementation using Web LocalStorage API.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export class LocalStorageBinding {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {boolean} */
    this.isLocalStorageSupported_ = this.checkIsLocalStorageSupported_();

    if (!this.isLocalStorageSupported_) {
      const error = new Error('localStorage not supported.');
      dev().expectedError(TAG, error);
    }
  }

  /**
   * Determines whether localStorage API is supported by ensuring it is declared
   * and does not throw an exception when used.
   * @return {boolean}
   * @private
   */
  checkIsLocalStorageSupported_() {
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
  getKey_(origin) {
    return `amp-store:${origin}`;
  }

  /** @override */
  loadBlob(origin) {
    return new Promise(resolve => {
      if (!this.isLocalStorageSupported_) {
        resolve(null);
        return;
      }
      resolve(this.win.localStorage.getItem(this.getKey_(origin)));
    });
  }

  /** @override */
  saveBlob(origin, blob) {
    return new Promise(resolve => {
      if (!this.isLocalStorageSupported_) {
        resolve();
        return;
      }
      this.win.localStorage.setItem(this.getKey_(origin), blob);
      resolve();
    });
  }
}


/**
 * Storage implementation delegated to the Viewer.
 * @implements {StorageBindingDef}
 * @private Visible for testing only.
 */
export class ViewerStorageBinding {

  /**
   * @param {!../service/viewer-impl.Viewer} viewer
   */
  constructor(viewer) {
    /** @private @const {!../service/viewer-impl.Viewer} */
    this.viewer_ = viewer;
  }

  /** @override */
  loadBlob(origin) {
    return this.viewer_.sendMessageAwaitResponse('loadStore',
        dict({'origin': origin})).then(response => response['blob']);
  }

  /** @override */
  saveBlob(origin, blob) {
    return /** @type {!Promise} */ (this.viewer_.sendMessageAwaitResponse(
        'saveStore', dict({'origin': origin, 'blob': blob})));
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStorageServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      'storage',
      function() {
        const viewer = viewerForDoc(ampdoc);
        const overrideStorage = parseInt(viewer.getParam('storage'), 10);
        const binding = overrideStorage ?
            new ViewerStorageBinding(viewer) :
            new LocalStorageBinding(ampdoc.win);
        return new Storage(ampdoc, viewer, binding).start_();
      },
      /* opt_instantiate */ true);
}
