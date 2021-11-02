import {signingServerURLs} from '#ads/_a4a-config';

import {utf8Decode} from '#core/types/string/bytes';

import {user} from '#utils/log';

import {
  AD_RESPONSE_TYPE_ENUM,
  VALIDATOR_RESULT_ENUM,
  Validator,
} from './amp-ad-type-defs';
import {getAmpAdMetadata} from './amp-ad-utils';
import {
  SignatureVerifier,
  VERIFICATION_STATUS_ENUM,
} from './signature-verifier';

export const SIGNATURE_VERIFIER_PROPERTY_NAME =
  'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';

const TAG = 'amp-ad-cryptographic-validator';

export class CryptographicValidator extends Validator {
  /**
   * @param {!Window} win
   * @return {!SignatureVerifier}
   */
  getSignatureVerifier_(win) {
    // TODO(levitzky) extract this into a service registered to ampdoc.
    return (
      win[SIGNATURE_VERIFIER_PROPERTY_NAME] ||
      (win[SIGNATURE_VERIFIER_PROPERTY_NAME] = new SignatureVerifier(
        win,
        signingServerURLs
      ))
    );
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
      type:
        verificationSucceeded && !!creativeData.creativeMetadata
          ? VALIDATOR_RESULT_ENUM.AMP
          : VALIDATOR_RESULT_ENUM.NON_AMP,
      adResponseType: AD_RESPONSE_TYPE_ENUM.CRYPTO,
      creativeData,
    });
  }

  /** @override */
  validate(context, containerElement, unvalidatedBytes, headers) {
    return this.getSignatureVerifier_(context.win)
      .verify(
        unvalidatedBytes,
        headers /* lifecycleCallback */,
        (unusedEventName, unusedExtraVariables) => {}
      )
      .then((status) => {
        switch (status) {
          case VERIFICATION_STATUS_ENUM.OK:
            return this.createOutput_(true, unvalidatedBytes);
          case VERIFICATION_STATUS_ENUM.UNVERIFIED:
          // TODO(levitzky) Preferential render without crypto in some
          // instances.
          case VERIFICATION_STATUS_ENUM.CRYPTO_UNAVAILABLE:
          // TODO(@taymonbeal, #9274): differentiate between these
          case VERIFICATION_STATUS_ENUM.ERROR_KEY_NOT_FOUND:
          case VERIFICATION_STATUS_ENUM.ERROR_SIGNATURE_MISMATCH:
            user().error(
              TAG,
              `Signature verification failed with status ${status}.`
            );
            return this.createOutput_(false, unvalidatedBytes);
        }
      });
  }
}
