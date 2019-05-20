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

/** @enum {string} */
export const UserLocationSource = {
  DEBUG: 'debug',
  FALLBACK: 'fallback',
  GEOLOCATION: 'geolocation',
  UNAVAILABLE: 'unavailable',
  UNSUPPORTED: 'unsupported',
};

const LOCATION_SEPARATOR = ',';

/**
 *
 * @param {string} location
 * @return {{lat: number, lon: number}}
 */
export function parseLocationString(location) {
  const split = location.split(LOCATION_SEPARATOR);
  const lat = Number(split[0]);
  const lon = Number(split[1]);
  return {lat, lon};
}
