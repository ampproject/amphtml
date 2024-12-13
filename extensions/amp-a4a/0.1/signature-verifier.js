import {isArray} from '#core/types';
import {base64DecodeToBytes} from '#core/types/string/base64';

import {Services} from '#service';

import {dev, devAssert, user} from '#utils/log';

/** @visibleForTesting */
export const AMP_SIGNATURE_HEADER = 'AMP-Fast-Fetch-Signature';

/**
 * The result of an attempt to verify a Fast Fetch signature. The different
 * error statuses are used for reporting errors to the ad network.
 *
 * @enum {number}
 */
export const VerificationStatus = {
  /** The ad was successfully verified as AMP. */
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

  /**
   * Verification failed because the page does not have web crypto available,
   * i.e. is not SSL.
   */
  CRYPTO_UNAVAILABLE: 4,
};

/**
 * A window-level object that encapsulates the logic for obtaining public keys
 * from Fast Fetch signing services and cryptographically verifying signatures
 * of AMP creatives.
 *
 * Unlike an AMP service, a signature verifier is **stateful**. It maintains a
 * cache of all public keys that it has previously downloaded and imported, and
 * also keeps track of which keys and signing services have already had
 * unsuccessful download or import attempts and should not be attempted again.
 *
 * This entire class is currently dead code in production, but will soon be
 * introduced as an experiment.
 */
export class SignatureVerifier {
  /**
   * @param {!Window} win
   * @param {!{[key: string]: string}} signingServerURLs a map from the name of
   *    each trusted signing service to the URL of its public key endpoint
   */
  constructor(win, signingServerURLs) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!{[key: string]: string}} */
    this.signingServerURLs_ = signingServerURLs;

    /**
     * The cache where all the public keys are stored.
     *
     * This field has a lot of internal structure and its type's a little hairy,
     * so here's a rundown of what each piece means:
     *  - If Web Cryptography isn't available in the current browsing context,
     *    then the entire field is null. Since the keys are of no use, we don't
     *    fetch them.
     *  - Otherwise, it's a map-like `Object` from signing service names (as
     *    defined in the Fast Fetch config registry) to "signer" objects.
     *  - The `promise` property of each signer resolves to a boolean indicating
     *    whether the most recent attempt to fetch and import that signing
     *    service's public keys was successful. If the promise is still pending,
     *    then an attempt is currently in progress. This property is mutable;
     *    its value is replaced with a new promise when a new attempt is made.
     *    Invariant: only one attempt may be in progress at a time, so this
     *    property may not be mutated while the current promise is pending.
     *  - The `keys` property of each signer is a map-like `Object` from keypair
     *    IDs to nullable key promises. (This means that a property access on
     *    this object may evaluate to `undefined`, `null`, or a `Promise`
     *    object.) The `keys` object is internally mutable; new keys are added
     *    to it as they are fetched. Invariant: the `keys` object may be mutated
     *    only while the corresponding `promise` object is pending; this ensures
     *    that callbacks chained to `promise` may observe `keys` without being
     *    subject to race conditions.
     *  - If a key promise (i.e., the value of a property access on the `keys`
     *    object) is absent (i.e., `undefined`), then no key with that keypair
     *    ID is present (but this could be because of a stale cache). If it's
     *    null, then no key with that keypair ID could be found even after
     *    cachebusting. If it's a `Promise` that resolves to `null`, then key
     *    data for that keypair ID was found but could not be imported
     *    successfully; this most likely indicates signing service misbehavior.
     *    The success case is a `Promise` that resolves to a `CryptoKey`.
     *
     * @private @const {?{[key: string]: {promise: !Promise<boolean>, keys: !{[key: string]: ?Promise<?webCrypto.CryptoKey>}}}}
     */
    this.signers_ = Services.cryptoFor(win).isPkcsAvailable() ? {} : null;

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @protected @const {function(): number}
     */
    this.getNow_ =
      win.performance && win.performance.now
        ? win.performance.now.bind(win.performance)
        : Date.now;
  }

  /**
   * Fetches and imports the public keyset for the named signing service,
   * without any cachebusting. Hopefully, this will hit cache in many cases
   * and not make an actual network round-trip. This method should be called
   * as early as possible, once it's known which signing service is likely to
   * be used, so that the network request and key imports can execute in
   * parallel with other operations.
   *
   * @param {string} signingServiceName
   */
  loadKeyset(signingServiceName) {
    if (this.signers_ && !this.signers_[signingServiceName]) {
      const keys = {};
      const promise = this.fetchAndAddKeys_(keys, signingServiceName, null);
      this.signers_[signingServiceName] = {promise, keys};
    }
  }

  /**
   * Extracts a cryptographic signature from `headers` and attempts to verify
   * that it's the correct cryptographic signature for `creative`.
   *
   * As a precondition, `loadKeyset(signingServiceName)` must have already been
   * called.
   *
   * @param {!ArrayBuffer} creative
   * @param {!Headers} headers
   * @return {!Promise<!VerificationStatus>}
   */
  verify(creative, headers) {
    const signatureFormat =
      /^([A-Za-z0-9._-]+):([A-Za-z0-9._-]+):([A-Za-z0-9+/]{341}[AQgw]==)$/;
    if (!headers.has(AMP_SIGNATURE_HEADER)) {
      return Promise.resolve(VerificationStatus.UNVERIFIED);
    }
    const headerValue = headers.get(AMP_SIGNATURE_HEADER);
    const match = signatureFormat.exec(headerValue);
    if (!match) {
      // TODO(@taymonbeal, #9274): replace this with real error reporting
      user().error(
        'AMP-A4A',
        `Invalid signature header: ${headerValue.split(':')[0]}`
      );
      return Promise.resolve(VerificationStatus.ERROR_SIGNATURE_MISMATCH);
    }
    return this.verifyCreativeAndSignature(
      match[1],
      match[2],
      base64DecodeToBytes(match[3]),
      creative
    );
  }

  /**
   * Verifies that `signature` is the correct cryptographic signature for
   * `creative`, with the public key from the named signing service identified
   * by `keypairId`.
   *
   * As a precondition, `loadKeyset(signingServiceName)` must have already been
   * called.
   *
   * If the keyset for the named signing service was imported successfully but
   * did not include a key for `keypairId`, this may be the result of a stale
   * browser cache. To work around this, `keypairId` is added to the public key
   * endpoint URL as a query parameter and the keyset is re-fetched. Other kinds
   * of failures, including network connectivity failures, are not retried.
   *
   * @param {string} signingServiceName
   * @param {string} keypairId
   * @param {!Uint8Array} signature
   * @param {!ArrayBuffer} creative
   * @return {!Promise<!VerificationStatus>}
   * @visibleForTesting
   */
  verifyCreativeAndSignature(
    signingServiceName,
    keypairId,
    signature,
    creative
  ) {
    if (!this.signers_) {
      // Web Cryptography isn't available.
      return Promise.resolve(VerificationStatus.CRYPTO_UNAVAILABLE);
    }
    const signer = this.signers_[signingServiceName];
    devAssert(
      signer,
      'Keyset for service %s not loaded before verification',
      signingServiceName
    );
    return signer.promise.then((success) => {
      if (!success) {
        // The public keyset couldn't be fetched and imported. Probably a
        // network connectivity failure.
        return VerificationStatus.UNVERIFIED;
      }
      const keyPromise = signer.keys[keypairId];
      if (keyPromise === undefined) {
        // We don't have this key, but maybe the cache is stale; try
        // cachebusting.
        signer.promise = this.fetchAndAddKeys_(
          signer.keys,
          signingServiceName,
          keypairId
        ).then((success) => {
          if (signer.keys[keypairId] === undefined) {
            // We still don't have this key; make sure we never try
            // again.
            signer.keys[keypairId] = null;
          }
          return success;
        });
        // This "recursive" call can recurse at most once.
        return this.verifyCreativeAndSignature(
          signingServiceName,
          keypairId,
          signature,
          creative
        );
      } else if (keyPromise === null) {
        // We don't have this key and we already tried cachebusting.
        return VerificationStatus.ERROR_KEY_NOT_FOUND;
      } else {
        return keyPromise.then((key) => {
          if (!key) {
            // This particular public key couldn't be imported. Probably the
            // signing service's fault.
            return VerificationStatus.UNVERIFIED;
          }
          const crypto = Services.cryptoFor(this.win_);
          return crypto.verifyPkcs(key, signature, creative).then(
            (result) =>
              result
                ? VerificationStatus.OK
                : VerificationStatus.ERROR_SIGNATURE_MISMATCH,
            (err) => {
              // Web Cryptography rejected the verification attempt. This
              // hopefully won't happen in the wild, but browsers can be weird
              // about this, so we need to guard against the possibility.
              // Phone home to the AMP Project so that we can understand why
              // this occurred.
              const message = err && err.message;
              dev().error('AMP-A4A', `Failed to verify signature: ${message}`);
              return VerificationStatus.UNVERIFIED;
            }
          );
        });
      }
    });
  }

  /**
   * Try to download the keyset for the named signing service and add a promise
   * for each key to the `keys` object.
   *
   * @param {!{[key: string]: ?Promise<?webCrypto.CryptoKey>}} keys the object to
   *     add each key promise to. This is mutated while the returned promise is
   *     pending.
   * @param {string} signingServiceName
   * @param {?string} keypairId the keypair ID to include in the query string
   *     for cachebusting purposes, or `null` if no cachebusting is needed
   * @return {!Promise<boolean>} resolves after the mutation of `keys` is
   *     complete, to `true` if the keyset was downloaded and parsed
   *     successfully (even if some keys were malformed), or `false` if a
   *     keyset-level failure occurred
   * @private
   */
  fetchAndAddKeys_(keys, signingServiceName, keypairId) {
    let url = this.signingServerURLs_[signingServiceName];
    if (keypairId != null) {
      url += '?kid=' + encodeURIComponent(keypairId);
    }
    // TODO(@taymonbeal, #11088): consider a timeout on this fetch
    return Services.xhrFor(this.win_)
      .fetchJson(url, {
        mode: 'cors',
        method: 'GET',
        // This should be cached across publisher domains, so don't append
        // __amp_source_origin to the URL.
        ampCors: false,
        credentials: 'omit',
      })
      .then(
        (response) => {
          // These are assertions on signing service behavior required by
          // the spec. However, nothing terrible happens if they aren't met
          // and there's no meaningful error recovery to be done if they
          // fail, so we don't need to do them at runtime in production.
          // They're included in dev mode as a debugging aid.
          devAssert(
            response.status === 200,
            'Fast Fetch keyset spec requires status code 200'
          );
          devAssert(
            response.headers.get('Content-Type') == 'application/jwk-set+json',
            'Fast Fetch keyset spec requires Content-Type: ' +
              'application/jwk-set+json'
          );
          return response.json().then(
            (jsonResponse) => {
              const jwkSet = /** @type {!JsonObject} */ (jsonResponse);
              // This is supposed to be a JSON Web Key Set, as defined in
              // Section 5 of RFC 7517. However, the signing service could
              // misbehave and send an arbitrary JSON value, so we have to
              // type-check at runtime.
              if (!jwkSet || !isArray(jwkSet['keys'])) {
                signingServiceError(
                  signingServiceName,
                  `Key set (${JSON.stringify(jwkSet)}) has no "keys"`
                );
                return false;
              }
              /** @type {!Array} */ (jwkSet['keys']).forEach((jwk) => {
                if (!jwk || typeof jwk['kid'] != 'string') {
                  signingServiceError(
                    signingServiceName,
                    `Key (${JSON.stringify(jwk)}) has no "kid"`
                  );
                } else if (keys[jwk['kid']] === undefined) {
                  // We haven't seen this keypair ID before.
                  keys[jwk['kid']] = Services.cryptoFor(this.win_)
                    .importPkcsKey(jwk)
                    .catch((err) => {
                      // Web Cryptography rejected the key
                      // import attempt. Either the signing
                      // service sent a malformed key or the
                      // browser is doing something weird.
                      const jwkData = JSON.stringify(jwk);
                      const message = err && err.message;
                      signingServiceError(
                        signingServiceName,
                        `Failed to import key (${jwkData}): ${message}`
                      );
                      return null;
                    });
                }
              });
              return true;
            },
            (err) => {
              // The signing service didn't send valid JSON.
              signingServiceError(
                signingServiceName,
                `Failed to parse JSON: ${err && err.response}`
              );
              return false;
            }
          );
        },
        (err) => {
          // Some kind of error occurred during the XHR. This could be a lot
          // of things (and we have no type information), but if there's no
          // `response` it's probably a network connectivity failure, so we
          // ignore it. Unfortunately, we can't distinguish this from a CORS
          // problem.
          if (err && err.response) {
            // This probably indicates a non-2xx HTTP status code.
            signingServiceError(
              signingServiceName,
              `Status code ${err.response.status}`
            );
          }
          return false;
        }
      );
  }
}

/**
 * Report an error caused by a signing service. Since signing services currently
 * don't have their own error logging URLs, we just send everything to the AMP
 * Project.
 *
 * @param {string} signingServiceName
 * @param {string} message
 * @private
 */
function signingServiceError(signingServiceName, message) {
  dev().error(
    'AMP-A4A',
    `Signing service error for ${signingServiceName}: ${message}`
  );
}
