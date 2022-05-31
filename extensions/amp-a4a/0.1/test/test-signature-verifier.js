// TODO(@jridgewell, #11081): fix linter to allow fixing weird indentation

import {base64EncodeFromBytes} from '#core/types/string/base64';
import {utf8Encode} from '#core/types/string/bytes';

import {dev, user} from '#utils/log';

import {SignatureVerifier, VerificationStatus} from '../signature-verifier';

const networkFailure = {throws: new TypeError('Failed to fetch')};

describes.fakeWin('SignatureVerifier', {amp: true}, (env) => {
  let mockDevError;
  beforeEach(() => {
    mockDevError = env.sandbox.mock(dev()).expects('error');
    mockDevError.never();
  });
  afterEach(() => {
    mockDevError.verify();
  });

  /** @param {string} signingServiceName */
  const expectSigningServiceError = (signingServiceName) => {
    mockDevError
      .withExactArgs('AMP-A4A', env.sandbox.match(signingServiceName))
      .once();
  };

  const creative1 = utf8Encode('Hello world!');
  const creative2 = utf8Encode('This is a <em>test</em> creative.');

  // TODO(bradfrizzell, #12476): Make this test work with sinon 4.0.
  it.skip('should make no network requests when crypto is unavailable', () => {
    env.sandbox.stub(env.win, 'crypto').callsFake(undefined);
    env.expectFetch('*', {throws: new Error('no network requests allowed')});
    const verifier = new SignatureVerifier(env.win);
    verifier.loadKeyset('service-1');
    return verifier
      .verifyCreativeAndSignature(
        'service-1',
        'key-1',
        creative1,
        new Uint8Array(256)
      )
      .then((status) => {
        expect(status).to.equal(VerificationStatus.CRYPTO_UNAVAILABLE);
        expect(env.fetchMock.called()).to.be.false;
      });
  });

  const crypto = window.crypto || window.msCrypto;
  if (!crypto) {
    return;
  }
  const subtle = crypto.subtle || crypto.webkitSubtle;
  if (!subtle) {
    return;
  }

  describe('when crypto is available', () => {
    const Keypair = class {
      /** @param {string} kid */
      constructor(kid) {
        /** @const {string} */
        this.kid = kid;
        /** @const {!Promise<{privateKey: !webCrypto.CryptoKey, publicKey: !webCrypto.CryptoKey}>} */
        this.keysPromise = subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: Uint8Array.of(1, 0, 1),
            hash: {name: 'SHA-256'},
          },
          true,
          ['sign', 'verify']
        );
      }

      /**
       * @param {!Uint8Array} data
       * @return {!Promise<!Uint8Array>}
       */
      sign(data) {
        return this.keysPromise
          .then(({privateKey}) =>
            subtle.sign(
              {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
              privateKey,
              data
            )
          )
          .then((signature) => new Uint8Array(signature));
      }

      /** @return {!Promise<!JsonObject>} */
      jwk() {
        return this.keysPromise
          .then(({publicKey}) => subtle.exportKey('jwk', publicKey))
          .then((jwk) => {
            jwk['kid'] = this.kid;
            return jwk;
          });
      }
    };

    const headers = {'Content-Type': 'application/jwk-set+json'};

    /**
     * @param {!Array<!Keypair>} keys
     * @return {!Promise<!JsonObject>}
     */
    const jwkSet = (keys) =>
      Promise.all(keys.map((key) => key.jwk())).then((jwks) => ({
        body: {'keys': jwks},
        headers,
      }));

    const key1 = new Keypair('key-1');
    const key2 = new Keypair('key-2');

    let verifier;

    beforeEach(() => {
      verifier = new SignatureVerifier(env.win, {
        'service-1': 'https://signingservice1.net/keyset.json',
        'service-2': 'https://signingservice2.net/keyset.json',
      });
    });

    afterEach(() => {
      expect(env.fetchMock.done()).to.be.true;
    });

    it('should verify a signature', () =>
      key1.sign(creative1).then((signature) => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.OK);
      }));

    it('should verify multiple signatures with only one network request', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            jwkSet([key1])
          );
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.OK);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.OK);
            });
        })
      ));

    it('should verify signatures from multiple signing services', () =>
      key1.sign(creative1).then((signature1) =>
        key2.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            jwkSet([key1])
          );
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.OK);
              env.fetchMock.getOnce(
                'https://signingservice2.net/keyset.json',
                jwkSet([key2])
              );
              verifier.loadKeyset('service-2');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-2',
                  'key-2',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.OK);
            });
        })
      ));

    it('should verify signatures when different signing services share a kid', () =>
      key1.sign(creative1).then((signature1) => {
        const key1FromService2 = new Keypair('key-1');
        return key1FromService2.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            jwkSet([key1])
          );
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.OK);
              env.fetchMock.getOnce(
                'https://signingservice2.net/keyset.json',
                jwkSet([key1FromService2])
              );
              verifier.loadKeyset('service-2');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-2',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.OK);
            });
        });
      }));

    it('should verify a signature from a newly added key', () =>
      key2.sign(creative1).then((signature) => {
        env.fetchMock.getOnce('https://signingservice1.net/keyset.json', () => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json?kid=key-2',
            jwkSet([key2])
          );
          return jwkSet([key1]);
        });
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-2',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.OK);
      }));

    it('should return ERROR_KEY_NOT_FOUND for a nonexistent kid', () =>
      key1.sign(creative1).then((signature) => {
        env.fetchMock.getOnce('https://signingservice1.net/keyset.json', () => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json?kid=key-1',
            jwkSet([])
          );
          return jwkSet([]);
        });
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.ERROR_KEY_NOT_FOUND);
      }));

    it('should not make more network requests retrying a nonexistent kid', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            () => {
              env.fetchMock.getOnce(
                'https://signingservice1.net/keyset.json?kid=key-1',
                jwkSet([])
              );
              return jwkSet([]);
            }
          );
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.ERROR_KEY_NOT_FOUND);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.ERROR_KEY_NOT_FOUND);
            });
        })
      ));

    it('should return ERROR_SIGNATURE_MISMATCH for a wrong signature', () =>
      key2.sign(creative1).then((signature) => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.ERROR_SIGNATURE_MISMATCH);
      }));

    it('should return UNVERIFIED and report on Web Cryptography error', () =>
      key1.sign(creative1).then((signature) => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        const errorMessage = 'Web Cryptography failed';
        env
          .stubService('crypto', 'verifyPkcs')
          .returns(Promise.reject(new Error(errorMessage)));
        mockDevError
          .withExactArgs('AMP-A4A', env.sandbox.match(errorMessage))
          .once();
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.UNVERIFIED);
      }));

    it('should return UNVERIFIED on network connectivity error', () =>
      key1.sign(creative1).then((signature) => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          networkFailure
        );
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.UNVERIFIED);
      }));

    it('should not retry for same service on network connectivity error', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            networkFailure
          );
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.UNVERIFIED);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.UNVERIFIED);
            });
        })
      ));

    it('should return UNVERIFIED, report, and not retry on malformed JSON', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce('https://signingservice1.net/keyset.json', {
            body: '{"keys":',
            headers,
          });
          expectSigningServiceError('service-1');
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.UNVERIFIED);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.UNVERIFIED);
            });
        })
      ));

    it('should return UNVERIFIED, report, and not retry on non-JWK Set JSON', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce('https://signingservice1.net/keyset.json', {
            body: '{"foo":"bar"}',
            headers,
          });
          expectSigningServiceError('service-1');
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.UNVERIFIED);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.UNVERIFIED);
            });
        })
      ));

    it('should report on extraneous malformed data', () =>
      key1.sign(creative1).then((signature) => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1]).then((keyset) => {
            keyset.body['keys'].push({'foo': 'bar'});
            return keyset;
          })
        );
        expectSigningServiceError('service-1');
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verifyCreativeAndSignature(
            'service-1',
            'key-1',
            signature,
            creative1
          )
        ).to.eventually.equal(VerificationStatus.OK);
      }));

    it('should return UNVERIFIED, report, and not retry on malformed key', () =>
      key1.sign(creative1).then((signature1) =>
        key1.sign(creative2).then((signature2) => {
          env.fetchMock.getOnce('https://signingservice1.net/keyset.json', {
            body: {'keys': [{'kid': 'key-1', 'foo': 'bar'}]},
            headers,
          });
          expectSigningServiceError('service-1');
          verifier.loadKeyset('service-1');
          return verifier
            .verifyCreativeAndSignature(
              'service-1',
              'key-1',
              signature1,
              creative1
            )
            .then((status) => {
              expect(status).to.equal(VerificationStatus.UNVERIFIED);
              verifier.loadKeyset('service-1');
              return expect(
                verifier.verifyCreativeAndSignature(
                  'service-1',
                  'key-1',
                  signature2,
                  creative2
                )
              ).to.eventually.equal(VerificationStatus.UNVERIFIED);
            });
        })
      ));

    describe('#verify', () => {
      it('should verify a signature header', () =>
        key1.sign(creative1).then((signature) => {
          env.fetchMock.getOnce(
            'https://signingservice1.net/keyset.json',
            jwkSet([key1])
          );
          verifier.loadKeyset('service-1');
          return expect(
            verifier.verify(
              creative1,
              new Headers({
                'AMP-Fast-Fetch-Signature': `service-1:key-1:${base64EncodeFromBytes(
                  signature
                )}`,
              })
            )
          ).to.eventually.equal(VerificationStatus.OK);
        }));

      it('should return UNVERIFIED on no header', () => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verify(creative1, new Headers())
        ).to.eventually.equal(VerificationStatus.UNVERIFIED);
      });

      it('should return UNVERIFIED on no header when crypto unavailable', () => {
        env.sandbox.stub(env.win, 'crypto').callsFake(undefined);
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verify(creative1, new Headers())
        ).to.eventually.equal(VerificationStatus.UNVERIFIED);
      });

      it('should return ERROR_SIGNATURE_MISMATCH on malformed header', () => {
        env.fetchMock.getOnce(
          'https://signingservice1.net/keyset.json',
          jwkSet([key1])
        );
        env.sandbox.stub(user(), 'error');
        verifier.loadKeyset('service-1');
        return expect(
          verifier.verify(
            creative1,
            new Headers({
              'AMP-Fast-Fetch-Signature': 'service-1:key-1:Invalid base64!',
            })
          )
        ).to.eventually.equal(VerificationStatus.ERROR_SIGNATURE_MISMATCH);
      });
    });
  });
});
