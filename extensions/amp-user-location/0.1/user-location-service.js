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
import {getMode} from '../../../src/mode';
import {includes} from '../../../src/string';
import {isCanary} from '../../../src/experiments';

/** @dict @extends {JsonObject} */
export class UserLocation {
  /**
   * @param {UserLocationSource} source
   * @param {number=} lat
   * @param {number=} lon
   */
  constructor(source, lat = undefined, lon = undefined) {
    /** @const */
    this['lat'] = lat;

    /** @const */
    this['lon'] = lon;

    /** @const */
    this['source'] = source;
  }
}

/**
 * @typedef {{
 *   fallback: UserLocation,
 *   maxAge: number,
 *   precision: string,
 *   timeout: number
 * }}
 */
export let UserLocationConfigDef;

/** @enum {string} */
const PermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
};

/** @enum {string} */
export const UserLocationSource = {
  DEBUG: 'debug',
  FALLBACK: 'fallback',
  GEOLOCATION: 'geolocation',
  UNAVAILABLE: 'unavailable',
  UNSUPPORTED: 'unsupported',
};

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

const LOCATION_SEPARATOR = ',';

export class UserLocationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private */
    this.initialized_ = false;

    /** @private {!UserLocation} */
    this.cachedLocation_ = new UserLocation(UserLocationSource.UNAVAILABLE);

    /** @private */
    this.requestedObservable_ = this.createRequestedObservable_();

    /** @private */
    this.firstRequestedDeferred_ = new Deferred();

    const win = ampdoc.getWin();
    /** @private @const */
    this.win_ = win;

    const viewer = Services.viewerForDoc(ampdoc);
    const platform = Services.platformFor(win);
    const viewerSupportsGeolocation = !(
      viewer.isEmbedded() && platform.isChrome()
    );

    /** @private @const */
    this.geolocationSupported_ =
      viewerSupportsGeolocation && 'geolocation' in win.navigator;

    /** @private @const */
    this.supportsPermissions_ = 'permissions' in win.navigator;
  }

  /**
   * @return {!Observable<!UserLocation>}
   * @private
   */
  createRequestedObservable_() {
    const observable = new Observable();
    observable.add(position => this.handleLocationAvailable_(position));
    return observable;
  }

  /**
   *
   * @param {!UserLocation} position
   * @private
   */
  handleLocationAvailable_(position) {
    this.cachedLocation_ = position;
    this.handleFirstRequested_(position);
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
   * @param {!UserLocation} position
   * @private
   */
  handleFirstRequested_(position) {
    if (!this.firstRequestedDeferred_) {
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
    this.cachedLocation_ = new UserLocation(UserLocationSource.UNAVAILABLE);
    this.requestedObservable_ = this.createRequestedObservable_();
  }

  /**
   * Debug override case, only works in canary or localdev and matches
   * numeric and limited symbolic characters only to prevent xss vector.
   * The regex is not trying to ensure correctness.
   * @return {?UserLocation|string}
   * @private
   */
  getOverride_() {
    const {localDev, userLocationOverride} = getMode(this.win_);
    if (
      !userLocationOverride ||
      !(isCanary(this.win_) || localDev) ||
      !/^[\w-,]+$/.test(userLocationOverride)
    ) {
      return null;
    }

    if (includes(userLocationOverride, LOCATION_SEPARATOR)) {
      const split = userLocationOverride.split(LOCATION_SEPARATOR);
      const lat = Number(split[0]);
      const lon = Number(split[1]);
      return new UserLocation(UserLocationSource.DEBUG, lat, lon);
    }

    return userLocationOverride;
  }

  /**
   * Called to retrieve the user location after the user has requested it.
   * This will wait for the location to become available if necessary.
   * @param {boolean=} opt_poll
   * @return {!Promise<!UserLocation>}
   */
  getLocation(opt_poll) {
    if (!this.geolocationSupported_) {
      return Promise.resolve(new UserLocation(UserLocationSource.UNSUPPORTED));
    }

    if (opt_poll && this.firstRequestedDeferred_) {
      return this.firstRequestedDeferred_.promise;
    }

    // NOTE: This may be reached with a `null` cachedLocation if the user
    // removes geolocation permission after allowing it.
    return Promise.resolve(this.cachedLocation_); // TODO(cvializ): add fallback here, when present
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
   * @param {UserLocationConfigDef} config
   * @return {!Promise<!UserLocation>}
   */
  requestLocation(config) {
    const observable = this.requestedObservable_;
    const locationDeferred = new Deferred();
    const {promise} = locationDeferred;

    const resolve = position => {
      observable.fire(position);
      locationDeferred.resolve(position);
    };

    const reject = error => {
      let position;
      if (error == PositionError.PLATFORM_UNSUPPORTED) {
        position = new UserLocation(UserLocationSource.UNSUPPORTED);
      }
      if (
        error == PositionError.POSITION_UNAVAILABLE ||
        error == PositionError.PERMISSION_DENIED ||
        error == PositionError.TIMEOUT
      ) {
        position = new UserLocation(UserLocationSource.UNAVAILABLE);
      }
      observable.fire(position);
      locationDeferred.reject(error);
    };

    if (!this.geolocationSupported_) {
      reject(PositionError.PLATFORM_UNSUPPORTED);
      return promise;
    }

    const override = this.getOverride_();
    if (override === 'error') {
      reject(PositionError.POSITION_UNAVAILABLE);
      return promise;
    }

    if (!this.initialized_) {
      this.initialize_();
    }

    if (override) {
      resolve(override);
      return promise;
    }

    const {navigator} = this.win_;
    navigator.geolocation.getCurrentPosition(
      position => {
        const {latitude: lat, longitude: lon} = position.coords;
        resolve(new UserLocation(UserLocationSource.GEOLOCATION, lat, lon));
      },
      error => {
        const {code} = error;
        if (code == error.POSITION_UNAVAILABLE) {
          reject(PositionError.POSITION_UNAVAILABLE);
          return;
        }
        if (code == error.PERMISSION_DENIED) {
          reject(PositionError.PERMISSION_DENIED);
          return;
        }
        if (code == error.TIMEOUT) {
          reject(PositionError.TIMEOUT);
          return;
        }

        reject(null);
      },
      {
        timeout: config.timeout || DEFAULT_TIMEOUT,
        maximumAge: config.maximumAge || DEFAULT_MAXIMUM_AGE,
        precision: config.precision || DEFAULT_PRECISION,
      }
    );

    return promise;
  }
}
