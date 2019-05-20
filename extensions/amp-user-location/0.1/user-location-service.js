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
import {devAssert, user, userAssert} from '../../../src/log';
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
 *   maximumAge: number,
 *   precision: string,
 *   timeout: number
 * }}
 */
export let UserLocationConfigDef;

/** @dict */
class PositionOptionsDef {
  /**
   * Define the parameters of the config object for navigator.getCurrentPosition
   * https://w3c.github.io/geolocation-api/#dom-positionoptions
   * @param {boolean=} enableHighAccuracy
   * @param {number=} maximumAge
   * @param {number=} timeout
   */
  constructor(
    enableHighAccuracy = undefined,
    maximumAge = undefined,
    timeout = undefined
  ) {
    /** @const */
    this['maximumAge'] = maximumAge;
    /** @const */
    this['enableHighAccuracy'] = enableHighAccuracy;
    /** @const */
    this['timeout'] = timeout;
  }
}

/**
 * @enum {string}
 * @private visible for testing
 */
export const PermissionStatus = {
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

    const {win} = ampdoc;
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
    this.firstRequestedDeferred_ = null; // After purge, do not allow polling
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
    if (
      !getMode(this.win_).userLocationOverride ||
      !(isCanary(this.win_) || getMode(this.win_).localDev) ||
      !/^[\w-,]+$/.test(getMode(this.win_).userLocationOverride)
    ) {
      return null;
    }

    if (includes(getMode(this.win_).userLocationOverride, LOCATION_SEPARATOR)) {
      const split = getMode(this.win_).userLocationOverride.split(
        LOCATION_SEPARATOR
      );
      const lat = Number(split[0]);
      const lon = Number(split[1]);
      return new UserLocation(UserLocationSource.DEBUG, lat, lon);
    }

    return getMode(this.win_).userLocationOverride;
  }

  /**
   * Called to retrieve the user location after the user has requested it.
   * This will wait for the location to become available if necessary.
   * @param {boolean=} poll
   * @return {!Promise<!UserLocation>}
   */
  getLocation(poll = false) {
    const staticResult = this.maybeGetStaticResult_();
    if (staticResult) {
      return staticResult.catch(err => {
        if (err == PositionError.PLATFORM_UNSUPPORTED) {
          return new UserLocation(UserLocationSource.UNSUPPORTED);
        }
        return new UserLocation(UserLocationSource.UNAVAILABLE);
      });
    }

    if (poll && this.firstRequestedDeferred_) {
      return this.firstRequestedDeferred_.promise;
    }

    // NOTE: This may be reached with a `null` cachedLocation if the user
    // removes geolocation permission after allowing it.
    return Promise.resolve(this.cachedLocation_); // TODO(cvializ): add fallback here, when present
  }

  /**
   * @param {string} expr
   * @param {string} type
   * @param {boolean=} poll
   */
  getReplacementLocation(expr, type, poll = false) {
    return this.getLocation(poll).then(position => {
      if (type === 'SOURCE') {
        return position['source'];
      }
      if (type === 'LAT') {
        return position['lat'];
      }
      if (type === 'LON') {
        return position['lon'];
      }
      userAssert(
        type === '' || typeof type === 'undefined',
        'The value passed to %s is not valid: %s',
        expr,
        type
      );

      if (position['source'] !== 'geolocation') {
        return '';
      }
      return `${position['lat']},${position['lon']}`;
    });
  }

  /**
   * Specifically requests the user's location from the HTML Standard
   * Geolocation API. Causes a browser prompt ot appear if the user
   * has not approved the domain for Geolocation permission.
   *
   * The promise from this method resolves for the requesting component, but
   * not for other amp-user-location elements or for runtime services
   * like variable substitution. The reject case behaves the same way.
   *
   * Variable substitution is notified through the `getLocation` method.
   *
   * @param {!UserLocationConfigDef} config
   * @return {!Promise<!UserLocation>}
   */
  requestLocation(config) {
    const staticResult = this.maybeGetStaticResult_();
    if (staticResult) {
      return staticResult;
    }

    // We only need to initialize the permission listener
    // if we expect that to change. If override is specified,
    // we do not expect the permission listener to change.
    if (!this.initialized_) {
      this.initialize_();
    }

    const result = getCurrentPosition(
      this.win_,
      /** @type {!PositionOptionsDef} */ ({
        enableHighAccuracy: config.precision == 'high',
        maximumAge: config.maximumAge || DEFAULT_MAXIMUM_AGE,
        timeout: config.timeout || DEFAULT_TIMEOUT,
      })
    );

    const observable = this.requestedObservable_;
    result.then(
      position => observable.fire(position),
      () => observable.fire(new UserLocation(UserLocationSource.UNAVAILABLE))
    );

    return result;
  }

  /**
   * If a result can be known without asking the user, for example
   * in the debug case, return that result promise.
   * Otherwise, return null.
   * @return {?Promise<!UserLocation>}
   */
  maybeGetStaticResult_() {
    if (!this.geolocationSupported_) {
      return Promise.reject(PositionError.PLATFORM_UNSUPPORTED);
    }

    const override = this.getOverride_();
    if (override) {
      return override == 'error'
        ? Promise.reject(PositionError.POSITION_UNAVAILABLE)
        : Promise.resolve(override);
    }

    return null;
  }
}

/**
 * A promise-based wrapper for navigator.geolocation.getCurrentPosition
 * @param {Window} win
 * @param {!PositionOptionsDef} config
 * @return {!Promise<!UserLocation>}
 */
function getCurrentPosition(win, config) {
  return new Promise((resolve, reject) => {
    win.navigator.geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve(
          new UserLocation(UserLocationSource.GEOLOCATION, latitude, longitude)
        );
      },
      error => {
        const {code} = error;
        switch (code) {
          case error.POSITION_UNAVAILABLE:
            return reject(PositionError.POSITION_UNAVAILABLE);
          case error.PERMISSION_DENIED:
            return reject(PositionError.PERMISSION_DENIED);
          case error.TIMEOUT:
            return reject(PositionError.TIMEOUT);
          default:
            user().error('unknown geolocation error');
            reject(null);
        }
      },
      config
    );
  });
}
