/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * The result of an attempt to verify a Fast Fetch signature. The different
 * error statuses are used for reporting errors to the ad network.
 *
 * @enum {number}
 */
export const VerificationStatus = {

  /** Verification succeeded. */
  OK: 0,

  /**
   * Verification failed because of a factor beyond the ad network's control,
   * such as a network connectivity failure, unavailability of Web Cryptography
   * in the current browsing context, or a misbehaving signing service.
   */
  UNVERIFIED: 1,

  /**
   * Verification failed because the keypair ID provided by the ad network did
   * not correspond to any public key offered by the signing service.
   */
  ERROR_KEY_NOT_FOUND: 2,

  /**
   * Verification failed because the signature provided by the ad network was
   * not the correct cryptographic signature for the given creative data and
   * public key.
   */
  ERROR_SIGNATURE_MISMATCH: 3,

};

/**
 * A window-level object that encapsulates the logic for obtaining public keys
 * from Fast Fetch signing services and cryptographically verifying signatures
 * of AMP creatives.
 *
 * Unlike an AMP service, a signature verifier is **stateful**. It maintains a
 * cache of all public keys that it has previously downloaded and imported.
 *
 * This interface is to facilitate the transition between the legacy Fast Fetch
 * signature scheme and the new one specified in #7618.
 *
 * @interface
 */
export class ISignatureVerifier {
  /**
   * Fetches and imports the public keyset for the named signing service.
   *
   * @param {string} unusedSigningServiceName
   * @param {!Promise<undefined>} unusedWaitFor a promise that must resolve
   *     before the keys are fetched
   */
  loadKeyset(unusedSigningServiceName, unusedWaitFor) {}

  /**
   * Extracts a cryptographic signature from `headers` and attempts to verify
   * that it's the correct cryptographic signature for `creative`.
   *
   * As a precondition, `loadKeyset` must have already been called on the
   * signing service that was used.
   *
   * @param {!ArrayBuffer} unusedCreative
   * @param {!Headers} unusedHeaders
   * @param {function(string, !Object)} unusedLifecycleCallback called for each
   *     AMP lifecycle event triggered during verification
   * @return {!Promise<!VerificationStatus>}
   */
  verify(unusedCreative, unusedHeaders, unusedLifecycleCallback) {}
}
