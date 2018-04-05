/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  AdResponseType,
  Validator,
  ValidatorResult,
} from './amp-ad-type-defs';
import {SignatureVerifier, VerificationStatus} from './signature-verifier';
import {getAmpAdMetadata} from './amp-ad-utils';
import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {signingServerURLs} from '../../../ads/_a4a-config';
import {user} from '../../../src/log';
import {utf8Decode} from '../../../src/utils/bytes';

export const SIGNATURE_VERIFIER_PROPERTY_NAME =
    'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';

const TAG = 'amp-ad-render';

export class CryptographicValidator extends Validator {
  /** @param {!Window} win */
  getSignatureVerifier_(win) {
    return win[SIGNATURE_VERIFIER_PROPERTY_NAME] ||
        (win[SIGNATURE_VERIFIER_PROPERTY_NAME] =
         new SignatureVerifier(win, signingServerURLs));
  }

  /**
   * @param {boolean} verificationSucceeded
   * @param {!ArrayBuffer} bytes
   * @return {!./amp-ad-type-defs.ValidatorOutput}
   */
  createOutput_(verificationSucceeded, bytes) {
    const creativeData = {
      creativeMetadata: getAmpAdMetadata(utf8Decode(bytes)),
    };
    return /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
      type: verificationSucceeded ?
        ValidatorResult.AMP : ValidatorResult.NON_AMP,
      adResponseType: AdResponseType.CRYPTO,
      creativeData,
    });
  }

  /** @override */
  validate(context, unvalidatedBytes, headers) {
    return this.getSignatureVerifier_(context.win)
        .verify(unvalidatedBytes, headers, /* lifecycleCallback */
            (unusedEventName, unusedExtraVariables) => {})
        .then(status => {
          switch (status) {
            case VerificationStatus.OK:
              return this.createOutput_(true, unvalidatedBytes);
            case VerificationStatus.UNVERIFIED:
            // TODO(levitzky) Preferential render without crypto in some
            // instances.
            case VerificationStatus.CRYPTO_UNAVAILABLE:
            // TODO(@taymonbeal, #9274): differentiate between these
            case VerificationStatus.ERROR_KEY_NOT_FOUND:
            case VerificationStatus.ERROR_SIGNATURE_MISMATCH:
              user().error(TAG,
                  `Signature verification failed with status ${status}.`);
              return this.createOutput_(false, unvalidatedBytes);
          }
        });
  }
}
