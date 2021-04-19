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

import {AmpAd3PImpl} from './amp-ad-3p-impl';
import {AmpAdCustom} from './amp-ad-custom';
import {CSS} from '../../../build/amp-ad-0.1.css';
import {Services} from '../../../src/services';
import {adConfig} from '../../../ads/_config';
import {getA4ARegistry} from '../../../ads/_a4a-config';
import {hasOwn} from '../../../src/core/types/object';
import {userAssert} from '../../../src/log';

/**
 * Construct ad network type-specific tag and script name.  Note that this
 * omits the version number and '.js' suffix for the extension script, which
 * will be handled by the extension loader.
 *
 * @param {string} type
 * @return {string}
 * @private
 */
function networkImplementationTag(type) {
  return `amp-ad-network-${type}-impl`;
}

export class AmpAd extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(unusedLayout) {
    // TODO(jridgewell, #5980, #8218): ensure that unupgraded calls are not
    // done for `isLayoutSupported`.
    return true;
  }

  /** @override */
  upgradeCallback() {
    const a4aRegistry = getA4ARegistry();
    // Block whole ad load if a consent is needed.
    /** @const {string} */
    const consentId = this.element.getAttribute('data-consent-notification-id');
    const consent = consentId
      ? Services.userNotificationManagerForDoc(this.element).then((service) =>
          service.get(consentId)
        )
      : Promise.resolve();
    const type = this.element.getAttribute('type');
    return consent.then(() => {
      const isCustom = type === 'custom';
      userAssert(
        isCustom || hasOwn(adConfig, type) || hasOwn(a4aRegistry, type),
        `Unknown ad type "${type}"`
      );

      // Check for the custom ad type (no ad network, self-service)
      if (isCustom) {
        return new AmpAdCustom(this.element);
      }

      this.win.ampAdSlotIdCounter = this.win.ampAdSlotIdCounter || 0;
      const slotId = this.win.ampAdSlotIdCounter++;

      return new Promise((resolve) => {
        this.getVsync().mutate(() => {
          this.element.setAttribute('data-amp-slot-index', slotId);

          const useRemoteHtml = this.element
            .getAmpDoc()
            .getMetaByName('amp-3p-iframe-src');
          // TODO(tdrl): Check amp-ad registry to see if they have this already.
          // TODO(a4a-cam): Shorten this predicate.
          if (
            !a4aRegistry[type] ||
            // Note that predicate execution may have side effects.
            !a4aRegistry[type](this.win, this.element, useRemoteHtml)
          ) {
            // Either this ad network doesn't support Fast Fetch, its Fast
            // Fetch implementation has explicitly opted not to handle this
            // tag, or this page uses remote.html which is inherently
            // incompatible with Fast Fetch. Fall back to Delayed Fetch.
            return resolve(new AmpAd3PImpl(this.element));
          }

          const extensionTagName = networkImplementationTag(type);
          this.element.setAttribute('data-a4a-upgrade-type', extensionTagName);
          resolve(
            Services.extensionsFor(this.win)
              .loadElementClass(extensionTagName)
              .then((ctor) => new ctor(this.element))
              .catch((error) => {
                // Work around presubmit restrictions.
                const TAG = this.element.tagName;
                // Report error and fallback to 3p
                this.user().error(
                  TAG,
                  'Unable to load ad implementation for type ',
                  type,
                  ', falling back to 3p, error: ',
                  error
                );
                return new AmpAd3PImpl(this.element);
              })
          );
        });
      });
    });
  }
}

AMP.extension('amp-ad', '0.1', (AMP) => {
  AMP.registerElement('amp-ad', AmpAd, CSS);
  AMP.registerElement('amp-embed', AmpAd);
});
