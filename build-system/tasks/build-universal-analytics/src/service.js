/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {once} from './once';
import {Crypto} from '#service/crypto-impl';
import timerImpl from './timer-impl';
import ampdocImpl from './ampdoc-impl';
import urlImpl from './url-impl';
import {
  GlobalVariableSource,
  UrlReplacements,
} from '#service/url-replacements-impl.js';
import extensionsImpl from './extensions-impl';

/**
 * @param {string} objectName
 * @return {!Object}
 */
function passthrough(objectName) {
  return new Proxy(
    {},
    {
      get(target, name) {
        try {
          throw new Error(
            `[universal] Attempted to use property ${objectName}(...).${name} on unimplemented service.`
          );
        } catch (e) {
          console.warn(e.stack);
        }
        return () => {};
      },
    }
  );
}

const unavailable = once(() => Promise.resolve(null));

export const Services = {
  ampdoc: () => ampdocImpl,
  timerFor: () => timerImpl,
  urlForDoc: () => urlImpl,
  extensionsFor: () => extensionsImpl,

  // Same implementations as core, but with injected dependencies or a forced
  // global window.
  urlReplacementsForDoc: once(
    () => new UrlReplacements(ampdocImpl, new GlobalVariableSource(ampdocImpl))
  ),
  cryptoFor: once(() => new Crypto(self)),

  // Passthrough placeholders for services that aren't yet known to be required
  // for the supported codepaths.
  viewerPromiseForDoc: once(() =>
    Promise.resolve(passthrough('viewerPromiseForDoc'))
  ),
  viewportForDoc: once(() => passthrough('viewportForDoc')),
  formSubmitForDoc: once(() => passthrough('formSubmitForDoc')),
  preconnectFor: once(() => passthrough('preconnectFor')),
  // eslint-disable-next-line local/no-forbidden-terms
  storageForDoc: () => once(() => passthrough('storageForDoc')),
  xhrFor: () => once(() => passthrough('xhrFor')),

  // These can be null since they're optional.
  // For now, we assume that their interoperability is unavailable.
  geoForDocOrNull: unavailable,
  consentPolicyServiceForDocOrNull: unavailable,
};
