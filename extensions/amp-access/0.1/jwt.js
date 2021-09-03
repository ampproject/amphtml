import {tryParseJson} from '#core/types/object/json';
import {
  base64DecodeToBytes,
  base64UrlDecodeToBytes,
} from '#core/types/string/base64';
import {stringToBytes, utf8Decode} from '#core/types/string/bytes';

/**
 * @typedef {{
 *   header: (?JsonObject|undefined),
 *   payload: (?JsonObject|undefined),
 *   verifiable: string,
 *   sig: string,
 * }}
 */
let JwtTokenInternalDef;

/**
 * Converts a text in PEM format into a binary array buffer.
 * @param {string} pem
 * @return {!Uint8Array}
 * @visibleForTesting
 */
export function pemToBytes(pem) {
  const key = pem
    .trim()
    // Remove pem prefix, e.g. "----BEGIN PUBLIC KEY----".
    .replace(/^-+BEGIN[^-]*-+/, '')
    // Remove pem suffix, e.g. "----END PUBLIC KEY----".
    .replace(/-+END[^-]*-+$/, '')
    // Remove line breaks.
    .replace(/[\r\n]/g, '')
    // Remove surrounding whitespace.
    .trim();
  return base64DecodeToBytes(key);
}

/**
 * Provides helper methods to decode and verify JWT tokens.
 */
export class JwtHelper {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /**
     * Might be `null` if the platform does not support Crypto Subtle.
     * @const @private {?webCrypto.SubtleCrypto}
     */
    this.subtle_ =
      (win.crypto && (win.crypto.subtle || win.crypto.webkitSubtle)) || null;
  }

  /**
   * Decodes JWT token and returns its payload.
   * @param {string} encodedToken
   * @return {?JsonObject|undefined}
   */
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }

  /**
   * Whether the signature-verification supported on this platform.
   * @return {boolean}
   */
  isVerificationSupported() {
    return !!this.subtle_;
  }

  /**
   * Decodes HWT token and verifies its signature.
   * @param {string} encodedToken
   * @param {!Promise<string>} pemPromise
   * @return {!Promise<!JsonObject>}
   */
  decodeAndVerify(encodedToken, pemPromise) {
    if (!this.subtle_) {
      throw new Error('Crypto is not supported on this platform');
    }
    const decodedPromise = new Promise((resolve) =>
      resolve(this.decodeInternal_(encodedToken))
    );
    return decodedPromise.then((decoded) => {
      const alg = decoded.header['alg'];
      if (!alg || alg != 'RS256') {
        // TODO(dvoytenko@): Support other RS* algos.
        throw new Error('Only alg=RS256 is supported');
      }
      return this.importKey_(pemPromise)
        .then((key) => {
          const sig = base64UrlDecodeToBytes(decoded.sig);
          return this.subtle_.verify(
            /* options */ {name: 'RSASSA-PKCS1-v1_5'},
            key,
            sig,
            stringToBytes(decoded.verifiable)
          );
        })
        .then((isValid) => {
          if (isValid) {
            return decoded.payload;
          }
          throw new Error('Signature verification failed');
        });
    });
  }

  /**
   * @param {string} encodedToken
   * @return {!JwtTokenInternalDef}
   * @private
   */
  decodeInternal_(encodedToken) {
    /**
     * See https://jwt.io/introduction/
     */
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }

    // Encoded token has three parts: header.payload.sig
    // Note! The padding is not allowed by JWT spec:
    // http://self-issued.info/docs/draft-goland-json-web-token-00.html#rfc.section.5
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidToken();
    }
    const headerUtf8Bytes = base64UrlDecodeToBytes(parts[0]);
    const payloadUtf8Bytes = base64UrlDecodeToBytes(parts[1]);
    return {
      header: tryParseJson(utf8Decode(headerUtf8Bytes), invalidToken),
      payload: tryParseJson(utf8Decode(payloadUtf8Bytes), invalidToken),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: parts[2],
    };
  }

  /**
   * @param {!Promise<string>} pemPromise
   * @return {!Promise<!webCrypto.CryptoKey>}
   */
  importKey_(pemPromise) {
    return pemPromise.then((pem) => {
      return this.subtle_.importKey(
        /* format */ 'spki',
        pemToBytes(pem),
        /* algo options */ {
          name: 'RSASSA-PKCS1-v1_5',
          hash: {name: 'SHA-256'},
        },
        /* extractable */ false,
        /* uses */ ['verify']
      );
    });
  }
}
