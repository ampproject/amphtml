/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';
import {Observable} from '../../../src/observable';
import {PositionError} from './position-error';
import {Services} from '../../../src/services';
import {devAssert} from '../../../src/log';

/**
 * @typedef {{
 *   lat: number,
 *   lon: number
 * }}
 */
export let UserLocationDef;

/**
 * @typedef {{
 *   fallback: UserLocationDef=,
 *   maxAge: number=,
 *   precision: string=,
 *   timeout: number=
 * }}
 */
export let UserLocationConfigDef;

/**
 * The reported position will be at most this many milliseconds old.
 */
const DEFAULT_MAXIMUM_AGE = 60000;

/**
 * The timeout attribute denotes the maximum length of time that is allowed to
 * pass between calling getCurrentPosition and calling its success callback.
 * At this time, the error callback will be called with code TIMEOUT.
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * For now, precision should remain 'low', since 'high' precision typically
 * requires more battery-intensive hardware to be activated, and is not
 * needed for the use-cases we currently support, like "deals near me".
 */
const DEFAULT_PRECISION = 'low';

export class UserLocationService {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private */
    this.initialized_ = false;

    /** @private {?UserLocationDef} */
    this.cachedLocation_ = null;

    /** @private */
    this.requestedObservable_ = this.createRequestedObservable_();

    /** @private */
    this.firstRequestedDeferred_ = new Deferred();

    const win = ampdoc.getWin();
    /** @private @const */
    this.win_ = win;

    const viewer = Services.viewerForDoc(ampdoc);
    const platform = Services.platformFor(win);
    const viewerSupportsGeolocation =
        !(viewer.isEmbedded() && platform.isChrome());

    /** @private @const */
    this.geolocationSupported_ = viewerSupportsGeolocation &&
        ('geolocation' in win.navigator);

    /** @private @const */
    this.supportsPermissions_ = 'permissions' in win.navigator;
  }

  /**
   * @return {!Observable}
   * @private
   */
  createRequestedObservable_() {
    const observable = new Observable();
    observable.add(
        (position, error) => this.handleLocationAvailable_(position, error));
    return observable;
  }

  /**
   *
   * @param {?UserLocationDef} position
   * @param {PositionError=} error
   * @private
   */
  handleLocationAvailable_(position, error) {
    if (position) {
      this.cachedLocation_ = position;
    }
    this.handleFirstRequested_(position, error);
  }

  /**
   * Exposes the location data or error condition to async AMP services like
   * variable substitution. Those services call `getLocation`, which returns
   * the `firstRequestedDeferred.promise`, and this method resolves
   * that Promise.
   *
   * TODO(cvializ)
   * If the user purges their location permission from allowed
   * If the user purges their location permission from blocked to prompt
   * etc
   *
   * @param {?UserLocationDef} position
   * @param {PositionError=} error
   * @private
   */
  handleFirstRequested_(position, error) {
    if (!this.firstRequestedDeferred_) {
      return;
    }

    if (error) {
      // TODO(cvializ): should we not expose the error code?
      this.firstRequestedDeferred_.reject(error);
      return;
    }

    this.firstRequestedDeferred_.resolve(position);
  }

  /**
   * @private
   */
  initialize_() {
    this.initialized_ = true;
    this.setupPermissionListener_();
  }

  /**
   * Listen for changes in the geolocation permission.
   * @private
   */
  setupPermissionListener_() {
    if (!this.supportsPermissions_) {
      return;
    }

    const {navigator} = this.win_;
    const permissionQuery = navigator.permissions.query({name: 'geolocation'});
    permissionQuery.then(permissionStatus => {

      permissionStatus.addEventListener('change', e => {
        const permissionStatus = devAssert(e.target);

        const {state} = permissionStatus;
        if (state === PermissionStatus.GRANTED) {
          return;
        }

        this.purge();
      });
    });
  }

  /**
   * Remove variables from global AMP state.
   */
  purge() {
    this.cachedLocation_ = null;
    this.firstRequestedDeferred_ = this.createRequestedObservable_();
  }

  /**
   * Called to retrieve the user location after the user has requested it.
   * This will wait for the location to become available if necessary.
   * @return {!Promise<?UserLocationDef>}
   */
  getLocation() {
    if (!this.geolocationSupported_) {
      return Promise.reject(PositionError.PLATFORM_UNSUPPORTED);
    }

    if (this.firstRequestedDeferred_) {
      return this.firstRequestedDeferred_.promise;
    }

    // NOTE: This may be reached with a `null` cachedLocation if the user
    // removes geolocation permission after allowing it.
    return Promise.resolve(this.cachedLocation_);
  }

  /**
   * Specifically requests the user's location from the HTML Standard
   * Geolocation API. Causes a browser prompt ot appear if the user
   * has not approved the domain for Geolocation permission.
   *
   * The promise from this method resolves for the requesting component, but
   * not for other amp-user-location elements or for runtime services
   * like variable substitution.
   *
   * Variable substitution is notified through the `getLocation` method.
   *
   * @param {!UserLocationConfigDef} config
   * @param {(!UserLocationDef|string)=} opt_override
   * @return {!Promise<!UserLocationDef>}
   */
  requestLocation(config, opt_override) {
    const observable = this.requestedObservable_;
    const locationDeferred = new Deferred();
    const {promise} = locationDeferred;

    const resolve = location => {
      observable.fire(location);
      locationDeferred.resolve(location);
    };

    const reject = error => {
      observable.fire(null, error);
      locationDeferred.reject(error);
    };

    if (!this.geolocationSupported_) {
      reject(PositionError.PLATFORM_UNSUPPORTED);
      return promise;
    }

    if (opt_override === 'error') {
      reject(PositionError.POSITION_UNAVAILABLE);
      return promise;
    }

    if (!this.initialized_) {
      this.initialize_();
    }

    if (opt_override) {
      resolve(opt_override);
      return promise;
    }

    const {navigator} = this.win_;
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude: lat, longitude: lon} = position.coords;
      resolve({lat, lon});
    }, error => {
      const {code} = error;
      if (code == error.POSITION_UNAVAILABLE) {
        reject(PositionError.POSITION_UNAVAILABLE);
        return;
      }
      if (code == error.PERMISSION_DENIED) {
        reject(PositionError.PERMISSION_DENIED);
        return;
      }
      // TODO(cvializ): On Chrome the latency for this can be really high!
      // Do we need a first-class intermediate state,
      // or is on="deny: ..." enough?
      if (code == error.TIMEOUT) {
        reject(PositionError.TIMEOUT);
        return;
      }

      reject();
    }, {
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maximumAge: config.maximumAge || DEFAULT_MAXIMUM_AGE,
      precision: config.precision || DEFAULT_PRECISION,
    });

    return promise;
  }
}
