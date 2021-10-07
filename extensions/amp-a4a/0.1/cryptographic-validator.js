import {signingServerURLs} from '#ads/_a4a-config';

import {utf8Decode} from '#core/types/string/bytes';

import {user} from '#utils/log';

import {AdResponseType, Validator, ValidatorResult} from './amp-ad-type-defs';
import {getAmpAdMetadata} from './amp-ad-utils';
import {SignatureVerifier, VerificationStatus} from './signature-verifier';

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
          ? ValidatorResult.AMP
          : ValidatorResult.NON_AMP,
      adResponseType: AdResponseType.CRYPTO,
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
          case VerificationStatus.OK:
            return this.createOutput_(true, unvalidatedBytes);
          case VerificationStatus.UNVERIFIED:
          // TODO(levitzky) Preferential render without crypto in some
          // instances.
          case VerificationStatus.CRYPTO_UNAVAILABLE:
          // TODO(@taymonbeal, #9274): differentiate between these
          case VerificationStatus.ERROR_KEY_NOT_FOUND:
          case VerificationStatus.ERROR_SIGNATURE_MISMATCH:
            user().error(
              TAG,
              `Signature verification failed with status ${status}.`
            );
            return this.createOutput_(false, unvalidatedBytes);
        }
      });
  }
}
