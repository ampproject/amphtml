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

import {ActionTrust} from '../../../src/action-constants';
import {ConfigLoader} from './config-loader';
import {Layout} from '../../../src/layout';
import {PositionError} from './position-error';
import {Services} from '../../../src/services';
import {
  UserLocationConfigDef,
  UserLocationService,
} from './user-location-service';
import {createCustomEvent} from '../../../src/event-helper';
import {devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';

const TAG = 'amp-user-location';
const SERVICE_TAG = 'user-location';

/** @enum {string} */
export const AmpUserLocationEvent = {
  APPROVE: 'approve',
  DENY: 'deny',
  ERROR: 'error',
};

/** @enum {string} */
const AmpUserLocationAction = {
  REQUEST: 'request',
};

export class AmpUserLocation extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?ConfigLoader} */
    this.configLoader_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-user-location'),
      'The "amp-user-location" experiment must be enabled ' +
        'to use amp-user-location'
    );

    this.configLoader_ = new ConfigLoader(this.getAmpDoc(), this.element);

    this.action_ = Services.actionServiceForDoc(this.element);

    this.registerAction(
      AmpUserLocationAction.REQUEST,
      () => this.userLocationInteraction_(),
      ActionTrust.HIGH
    );
  }

  /** @override */
  layoutCallback() {
    devAssert(this.configLoader_, 'config loader has not been initialized');
    // When the framework calls layout on amp-user-location, the config
    // can be prefetched to improve latency.
    this.configLoader_.fetchConfig();

    return Promise.resolve();
  }

  /**
   * On user interaction, request the location
   * and fire the resulting AMP Events
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  userLocationInteraction_() {
    return Promise.all([
      Services.userLocationForDocOrNull(this.element),
      this.getConfig_(),
    ])
      .then(results => {
        const userLocationService = results[0];
        const config = results[1];
        return userLocationService.requestLocation(config);
      })
      .then(
        position => {
          this.triggerEvent_(AmpUserLocationEvent.APPROVE, position);
        },
        error => {
          switch (error.code) {
            case PositionError.PERMISSION_DENIED:
              this.triggerEvent_(
                AmpUserLocationEvent.DENY,
                dict({'fallback': error.fallback})
              );
              return;
            case PositionError.PLATFORM_UNSUPPORTED:
            case PositionError.POSITION_UNAVAILABLE:
            case PositionError.TIMEOUT:
            default:
              this.triggerEvent_(
                AmpUserLocationEvent.ERROR,
                dict({'fallback': error.fallback})
              );
          }
        }
      );
  }

  /**
   * Retrieve and normalize the element's config
   * @return {*} TODO(#23582): Specify return type
   */
  getConfig_() {
    return this.configLoader_
      .getConfig()
      .then(config => this.normalizeConfig_(config))
      .catch(() => {
        const error = new Error(
          'Failed to parse amp-user-location config. Is it valid JSON?'
        );
        this.user().error(TAG, error);
        throw error;
      });
  }

  /**
   * Turn a config json into a dict of approved properties only
   * @param {!JsonObject} json
   * @return {?./user-location-service.UserLocationConfigDef}
   */
  normalizeConfig_(json) {
    const jsonFallback = json['fallback'];
    let fallback;
    if (typeof jsonFallback === 'string') {
      const fallbackParts = jsonFallback.split(',');
      fallback = {lat: Number(fallbackParts[0]), lon: Number(fallbackParts[1])};
    }
    if (typeof jsonFallback === 'object') {
      fallback = {lat: jsonFallback['lat'], lon: jsonFallback['lon']};
    }

    return {
      fallback,
      maximumAge: json['maximumAge'],
      precision: json['precision'],
      timeout: json['timeout'],
    };
  }

  /**
   * Trigger the given AMP action. Triggered when the overlay opens or when
   * the static date picker should receive focus from the attached input.
   * @param {string} name
   * @param {JsonObject=} data
   * @private
   */
  triggerEvent_(name, data = undefined) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, data);
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }
}

AMP.extension('amp-user-location', '0.1', AMP => {
  AMP.registerElement(TAG, AmpUserLocation);
  AMP.registerServiceForDoc(SERVICE_TAG, UserLocationService);
});
