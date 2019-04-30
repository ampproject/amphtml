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
import {Layout} from '../../../src/layout';
import {PositionError} from './position-error';
import {Services} from '../../../src/services';
import {
  UserLocationConfigDef,
  UserLocationDef,
  UserLocationService,
} from './user-location-service';
import {createCustomEvent} from '../../../src/event-helper';
import {getMode} from '../../../src/mode';
import {isCanary, isExperimentOn} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

const TAG = 'amp-user-location';
const SERVICE_TAG = 'user-location';


const LOCATION_SEPARATOR = ',';


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

    /** @private {?UserLocationConfigDef} */
    this.config_ = null;

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
        'to use amp-user-location');
    this.config_ = this.parse_();

    this.action_ = Services.actionServiceForDoc(this.element);

    this.registerAction(
        AmpUserLocationAction.REQUEST,
        () => this.userLocationInteraction_(),
        ActionTrust.HIGH);
  }

  /**
   * Parse a JSON script tag for configuration, if present.
   * @return {?UserLocationConfigDef}
   */
  parse_() {
    const {children} = this.element;
    if (children.length != 1) {
      return null;
    }

    const firstChild = children[0];
    if (!isJsonScriptTag(firstChild)) {
      this.user().error(TAG,
          'amp-user-location config should be in a <script> tag ' +
          'with type="application/json".');
      return;
    }

    const json = tryParseJson(firstChild.textContent, e => {
      this.user().error(TAG,
          'Failed to parse amp-user-location config. ' +
          'Is it valid JSON?', e);
    });
    if (json === null) {
      return null;
    }

    return {
      fallback: json['fallback'],
      maxAge: json['maxAge'],
      precision: json['precision'],
      timeout: json['timeout'],
    };
  }

  /**
   * On user interaction, request the location
   * and fire the resulting AMP Events
   * @private
   */
  userLocationInteraction_() {
    let override = null;
    const {localDev, userLocationOverride} = getMode(this.win);
    if (userLocationOverride && (isCanary(this.win) || localDev) &&
      /^[\w-,]+$/.test(userLocationOverride)) {
      // Debug override case, only works in canary or localdev and matches
      // numeric and limited symbolic characters only to prevent xss vector.
      // The regex is not trying to ensure correctness.
      const split = userLocationOverride.split(LOCATION_SEPARATOR);
      const lat = Number(split[0]);
      const lon = Number(split[1]);
      override = {lat, lon};
    }

    const servicePromise = Services.userLocationForDocOrNull(this.element);

    return servicePromise.then(userLocationService => {
      const config = this.config_ || {};
      return userLocationService.requestLocation(config, override);
    }).then(location => {
      this.triggerEvent_(AmpUserLocationEvent.APPROVE, location);
    }).catch(error => {
      const {code} = error;
      if (code == PositionError.PERMISSION_DENIED) {
        this.triggerEvent_(AmpUserLocationEvent.DENY);
        return;
      }

      if (code == PositionError.PLATFORM_UNSUPPORTED ||
          code == PositionError.POSITION_UNAVAILABLE ||
          code == PositionError.TIMEOUT) {
        this.triggerEvent_(AmpUserLocationEvent.ERROR);
      }
    });
  }

  /**
   * Trigger the given AMP action. Triggered when the overlay opens or when
   * the static date picker should receive focus from the attached input.
   * @param {string} name
   * @param {UserLocationDef=} opt_data
   * @private
   */
  triggerEvent_(name, opt_data = null) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, opt_data);
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }
}

AMP.extension('amp-user-location', '0.1', AMP => {
  AMP.registerElement(TAG, AmpUserLocation);
  AMP.registerServiceForDoc(SERVICE_TAG, UserLocationService);
});
