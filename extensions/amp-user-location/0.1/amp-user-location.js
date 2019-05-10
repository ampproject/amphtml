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
import {UserLocationService} from './user-location-service';
import {createCustomEvent} from '../../../src/event-helper';
import {isExperimentOn} from '../../../src/experiments';
import {isJsonScriptTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

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

    /** @private {?./user-location-service.UserLocationConfigDef} */
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
   * @return {?./user-location-service.UserLocationConfigDef}
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
      return null;
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
    const servicePromise = Services.userLocationForDocOrNull(this.element);

    return servicePromise.then(userLocationService => {
      const config = this.config_ ||
      /** @type {./user-location-service.UserLocationConfigDef} */ ({});
      return userLocationService.requestLocation(config);
    }).then(location => {
      this.triggerEvent_(AmpUserLocationEvent.APPROVE, location);
    }).catch(error => {
      if (error == PositionError.PERMISSION_DENIED) {
        this.triggerEvent_(AmpUserLocationEvent.DENY);
        return;
      }

      if (error == PositionError.PLATFORM_UNSUPPORTED ||
          error == PositionError.POSITION_UNAVAILABLE ||
          error == PositionError.TIMEOUT) {
        this.triggerEvent_(AmpUserLocationEvent.ERROR);
      }
    });
  }

  /**
   * Trigger the given AMP action. Triggered when the overlay opens or when
   * the static date picker should receive focus from the attached input.
   * @param {string} name
   * @param {!./user-location-service.UserLocation=} data
   * @private
   */
  triggerEvent_(name, data = undefined) {
    const event = createCustomEvent(
        this.win, `${TAG}.${name}`, data);
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }
}

AMP.extension('amp-user-location', '0.1', AMP => {
  AMP.registerElement(TAG, AmpUserLocation);
  AMP.registerServiceForDoc(SERVICE_TAG, UserLocationService);
});
