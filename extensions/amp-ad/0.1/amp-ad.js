/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {AmpAd3PImpl} from './amp-ad-3p-impl';
import {a4aRegistry} from '../../../ads/_a4a-config';
import {dev, user} from '../../../src/log';
import {extensionsFor} from '../../../src/extensions';
import {userNotificationManagerFor} from '../../../src/user-notification';


/**
 * Construct ad network type-specific tag and script name.  Note that this
 * omits the version number and '.js' suffix for the extension script, which
 * will be handled by the extension loader.
 *
 * @param {!string} type
 * @return !string
 * @private
 */
function networkImplementationTag(type) {
  return `amp-ad-network-${type}-impl`;
}

export class AmpAd extends AMP.BaseElement {

  /** @override */
  upgradeCallback() {
    // Block whole ad load if a consent is needed.
    /** @const {string} */
    const consentId = this.element.getAttribute('data-consent-notification-id');
    const consent = consentId
        ? userNotificationManagerFor(this.win)
            .then(service => service.get(consentId))
        : Promise.resolve();

    return consent.then(() => {
      const type = this.element.getAttribute('type');
      if (!type) {
        // Unspecified or empty type.  Nothing to do here except bail out.
        return null;
      }
      // TODO(tdrl): Check amp-ad registry to see if they have this already.
      if (!a4aRegistry[type] ||
          !a4aRegistry[type](this.win, this.element)) {
        // Network either has not provided any A4A implementation or the
        // implementation exists, but has explicitly chosen not to handle this
        // tag as A4A.  Fall back to the 3p implementation.
        return new AmpAd3PImpl(this.element);
      }
      const extensionTagName = networkImplementationTag(type);
      this.element.setAttribute('data-a4a-upgrade-type', extensionTagName);
      return extensionsFor(this.win).loadElementClass(extensionTagName)
        .then(ctor => new ctor(this.element))
        .catch(error => {
          // Work around presubmit restrictions.
          const TAG = this.element.tagName;
          // Report error and fallback to 3p
          user().error(TAG, 'Unable to load ad implementation for type ', type,
              ', falling back to 3p, error: ', error);
          return new AmpAd3PImpl(this.element);
        });
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    // This is only called when no type was set on the element and thus
    // upgrade element fell through.
    dev().assert(this.element.getAttribute('type'), 'Required attribute type');
  }
}

AMP.registerElement('amp-ad', AmpAd);
AMP.registerElement('amp-embed', AmpAd);
