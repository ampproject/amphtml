import {parseJson} from '#core/types/object/json';
import {bytesToString, stringToBytes} from '#core/types/string/bytes';

import {Services} from '#service';

import {user} from '#utils/log';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../service-helpers';
import {getSourceOrigin} from '../url';

/** @const {string} */
const TAG = 'OriginExperiments';

/** @const {!webCrypto.JsonWebKey} */
const PUBLIC_JWK = /** @type {!webCrypto.JsonWebKey} */ ({
  'alg': 'RS256',
  'e': 'AQAB',
  'ext': true,
  'key_ops': ['verify'],
  'kty': 'RSA',
  'n': 'uAGSMYKze8Fit508UaGHz1eZowfX4YsA0lmyi-65xQfjF7nMo61c4Iz4erdqgRp-ov662yVPquhPmTxgB-nzNcTPrj15Jo05Js78Q9hS2hrPIjKMlzcKSYQN_08QieWKOSmVbLSv_-4n9Ms5ta8nRs4pwc_2nX5n7m5B5GH4VerGbqIWIn9FRNYMShBRQ9TCHpb6BIUTwUn6iwmJLenq0A1xhGrQ9rswGC1QJhjotkeReKXZDLLWaFr0uRw-IyvRa5RiiEGntgOvcbvamM5TnbKavc2rxvg2TWTCNQnb7lWSAzldJA_yAOYet_MjnHMyj2srUdbQSDCk8kPWWuafiQ',
});

/**
 * Generates, signs and verifies origin experiments.
 */
export class OriginExperiments {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    /** @const @private {!./crypto-impl.Crypto} */
    this.crypto_ = Services.cryptoFor(ampdoc.win);

    /** @const @private {!./url-impl.Url} */
    this.url_ = Services.urlForDoc(ampdoc.getHeadNode());

    /** @const @private {!TokenMaster} */
    this.tokenMaster_ = new TokenMaster(this.crypto_, this.url_);

    /** @private {?Promise} */
    this.scanPromise_ = null;
  }

  /**
   * Async returns array of origin experiment IDs that are enabled.
   * @param {boolean=} opt_rescan
   * @param {!webCrypto.JsonWebKey=} publicJwk Overridable for testing.
   * @return {!Promise<!Array<string>>}
   */
  getExperiments(opt_rescan = false, publicJwk = PUBLIC_JWK) {
    if (!this.crypto_.isPkcsAvailable()) {
      user().error(TAG, 'Crypto is unavailable.');
      return Promise.resolve([]);
    }
    if (!this.scanPromise_ || opt_rescan) {
      this.scanPromise_ = this.scanForTokens_(publicJwk);
    }
    return this.scanPromise_;
  }

  /**
   * Scan the page for origin experiment tokens, verifies them, and enables
   * the corresponding experiments for verified tokens.
   * @param {!webCrypto.JsonWebKey} publicJwk
   * @return {!Promise}
   * @private
   */
  scanForTokens_(publicJwk) {
    const head = this.ampdoc_.getHeadNode();
    const metas = head.querySelectorAll('meta[name="amp-experiment-token"]');
    if (metas.length == 0) {
      return Promise.resolve();
    }
    const {win} = this.ampdoc_;
    const crypto = Services.cryptoFor(win);
    return crypto.importPkcsKey(publicJwk).then((publicKey) => {
      const promises = [];
      for (let i = 0; i < metas.length; i++) {
        const meta = metas[i];
        const token = meta.getAttribute('content');
        if (token) {
          const p = this.tokenMaster_
            .verifyToken(token, win.location, publicKey)
            .catch((error) => {
              user().error(TAG, 'Failed to verify experiment token:', error);
            });
          promises.push(p);
        } else {
          user().error(TAG, 'Missing content for experiment token: ', meta);
        }
      }
      return Promise.all(promises);
    });
  }
}

/**
 * Handles key generation and token signing/verifying.
 * @package
 */
export class TokenMaster {
  /**
   * @param {!./crypto-impl.Crypto} crypto
   * @param {!./url-impl.Url} url
   */
  constructor(crypto, url) {
    /** @const @private */
    this.crypto_ = crypto;

    /** @const @private */
    this.url_ = url;
  }

  /**
   * Generates an RSA public/private key pair for signing and verifying.
   * @return {!Promise}
   * @protected
   */
  generateKeys() {
    const generationAlgo = {
      modulusLength: 2048,
      publicExponent: Uint8Array.of(1, 0, 1),
      ...this.crypto_.pkcsAlgo,
    };
    return this.crypto_.subtle.generateKey(
      /** @type {{name: string}} */ (generationAlgo),
      /* extractable */ true,
      /* keyUsages */ ['sign', 'verify']
    );
  }

  /**
   * Generates an origin experiment token given a config json.
   * @param {number} version
   * @param {!JsonObject} json
   * @param {!webCrypto.CryptoKey} privateKey
   * @return {!Promise<string>}
   * @protected
   */
  generateToken(version, json, privateKey) {
    const config = stringToBytes(JSON.stringify(json));
    const data = this.prepend_(version, config);
    return this.sign_(data, privateKey).then((signature) => {
      return this.append_(data, new Uint8Array(signature));
    });
  }

  /**
   * Verifies an origin experiment token given a public key.
   * @param {string} token
   * @param {!Location} location
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise<string>} If token is valid, resolves with the
   *     experiment ID. Otherwise, rejects with validation error.
   * @protected
   */
  verifyToken(token, location, publicKey) {
    return new Promise((resolve) => {
      let i = 0;
      const bytes = stringToBytes(atob(token));

      // Parse version.
      const version = bytes[i];
      if (version !== 0) {
        throw new Error(`Unrecognized token version: ${version}`);
      }
      i += 1;

      // Parse config length.
      const length = new DataView(bytes.buffer).getUint32(i);
      i += 4; // Number of bytes in Uint32 config length.
      if (length > bytes.length - i) {
        throw new Error(`Unexpected config length: ${length}`);
      }

      // Parse config itself.
      const configBytes = bytes.subarray(i, i + length);
      i += length;

      // Parse unsigned data and its signature.
      const data = bytes.subarray(0, i);
      const signature = bytes.subarray(i);

      resolve(
        this.verify_(signature, data, publicKey).then((verified) => {
          if (!verified) {
            throw new Error('Failed to verify token signature.');
          }
          // Convert config from bytes to JS object.
          const configStr = bytesToString(configBytes);
          const config = parseJson(configStr);

          // Check token experiment origin against `location`.
          const approvedOrigin = this.url_.parse(config['origin']).origin;
          const sourceOrigin = getSourceOrigin(location);
          if (approvedOrigin !== sourceOrigin) {
            throw new Error(
              `Config origin (${approvedOrigin}) does not match ` +
                `window (${sourceOrigin}).`
            );
          }

          // Check token expiration date.
          const experimentId = config['experiment'];
          const expiration = config['expiration'];
          if (expiration >= Date.now()) {
            return experimentId;
          } else {
            throw new Error(`Experiment "${experimentId}" has expired.`);
          }
        })
      );
    });
  }

  /**
   * Returns a byte array: (version + config.length + config)
   * @param {number} version
   * @param {!Uint8Array} config
   * @return {!Uint8Array}
   * @private
   */
  prepend_(version, config) {
    const data = new Uint8Array(config.length + 5);
    data[0] = version;
    // Insert config length into bytes 1 through 5.
    new DataView(data.buffer).setUint32(1, config.length, false);
    data.set(config, 5);
    return data;
  }

  /**
   * Returns base64(data + signature).
   * @param {!Uint8Array} data
   * @param {!Uint8Array} signature
   * @return {string}
   * @private
   */
  append_(data, signature) {
    const string = bytesToString(data) + bytesToString(signature);
    return btoa(string);
  }

  /**
   * Wraps SubtleCrypto.sign().
   * @param {!Uint8Array} data
   * @param {!webCrypto.CryptoKey} privateKey
   * @return {!Promise}
   * @private
   */
  sign_(data, privateKey) {
    return this.crypto_.subtle.sign(this.crypto_.pkcsAlgo, privateKey, data);
  }

  /**
   * Wraps SubtleCrypto.verify().
   * @param {!Uint8Array} signature
   * @param {!Uint8Array} data
   * @param {!webCrypto.CryptoKey} publicKey
   * @return {!Promise<boolean>}
   * @private
   */
  verify_(signature, data, publicKey) {
    return this.crypto_.verifyPkcs(publicKey, signature, data);
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOriginExperimentsForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'origin-experiments', OriginExperiments);
}

/**
 * Doesn't live in services.js to avoid bundling into v0.js.
 * Be sure to call installOriginExperimentsForDoc() before using.
 * @param {!Element|!ShadowRoot} element
 * @return {!OriginExperiments}
 */
export function originExperimentsForDoc(element) {
  return /** @type {!OriginExperiments} */ (
    getServiceForDoc(element, 'origin-experiments')
  );
}
