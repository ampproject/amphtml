import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {GEO_IN_GROUP} from '../../../amp-geo/0.1/amp-geo-in-group';
import {
  ConsentConfig,
  expandConsentEndpointUrl,
  expandPolicyConfig,
} from '../consent-config';

const realWinConfig = {
  amp: {
    canonicalUrl: 'https://foobar.com/baz',
    runtimeOn: true,
    ampdoc: 'single',
  },
};

describes.realWin('ConsentConfig', realWinConfig, (env) => {
  let doc;
  let element;
  let defaultConfig;
  beforeEach(() => {
    doc = env.win.document;
    element = doc.createElement('div');
    defaultConfig = {
      'consentInstanceId': 'ABC',
      'checkConsentHref': 'https://response1',
    };
  });

  function appendConfigScriptElement(doc, element, config) {
    const scriptElement = doc.createElement('script');
    scriptElement.setAttribute('type', 'application/json');
    scriptElement.textContent = JSON.stringify(config);
    element.appendChild(scriptElement);
  }

  describe('read consent config', () => {
    it('read inline config', () => {
      appendConfigScriptElement(doc, element, defaultConfig);
      const consentConfig = new ConsentConfig(element);
      return expect(
        consentConfig.getConsentConfigPromise()
      ).to.eventually.deep.equal({
        'consentInstanceId': 'ABC',
        'checkConsentHref': 'https://response1',
        'consentRequired': 'remote',
      });
    });

    it('read cmp config', async () => {
      appendConfigScriptElement(doc, element, {});
      element.setAttribute('type', '_ping_');
      const consentConfig = new ConsentConfig(element);
      // Make a deep copy of the config to avoid error when deleting fields
      const config = JSON.parse(
        JSON.stringify(await consentConfig.getConsentConfigPromise())
      );
      expect(config['checkConsentHref']).to.match(/get-consent-v1/);
      expect(config['promptUISrc']).to.match(/diy-consent.html/);
      // Remove non deterministic field.
      delete config['checkConsentHref'];
      delete config['promptUISrc'];
      expect(config).to.deep.equal({
        'consentInstanceId': '_ping_',
        'consentRequired': 'remote',
      });
    });

    it('should ignore promptUISrc w/ amp-story-consent', async () => {
      appendConfigScriptElement(doc, element, {});
      element.setAttribute('type', '_ping_');
      element.appendChild(doc.createElement('amp-story-consent'));
      const expectedError =
        'amp-consent/consent-config: ' +
        '`promptUiSrc` cannot be specified while using' +
        ' amp-story-consent.';
      await expect(
        new ConsentConfig(element).getConsentConfigPromise()
      ).to.be.rejectedWith(expectedError);
    });

    it('converts deprecated format to new format', async () => {
      appendConfigScriptElement(doc, element, {
        'consents': {
          'ABC': {
            'promptIfUnknownForGeoGroup': 'eea',
            'checkConsentHref': '/href',
            'clientConfig': {
              'test': 'error',
            },
          },
        },
        'clientConfig': {
          'test': 'ABC',
        },
        'uiConfig': {
          'overlay': true,
        },
        'postPromptUI': 'test',
      });
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          isInCountryGroup() {
            return false;
          },
        })
      );
      const consentConfig = new ConsentConfig(element);
      expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
        'consentInstanceId': 'ABC',
        'promptIfUnknownForGeoGroup': 'eea',
        'checkConsentHref': '/href',
        'clientConfig': {
          'test': 'ABC',
        },
        'consentRequired': false,
        'uiConfig': {
          'overlay': true,
        },
        'postPromptUI': 'test',
      });
    });

    it('converts deprecated format to with consentRequired true', async () => {
      appendConfigScriptElement(doc, element, {
        'consents': {
          'ABC': {
            'promptIfUnknownForGeoGroup': 'eea',
            'checkConsentHref': '/href',
            'clientConfig': {
              'test': 'error',
            },
          },
        },
        'clientConfig': {
          'test': 'ABC',
        },
        'uiConfig': {
          'overlay': true,
        },
        'postPromptUI': 'test',
      });
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          isInCountryGroup() {
            return GEO_IN_GROUP.IN;
          },
        })
      );
      const consentConfig = new ConsentConfig(element);
      expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
        'consentInstanceId': 'ABC',
        'promptIfUnknownForGeoGroup': 'eea',
        'checkConsentHref': '/href',
        'clientConfig': {
          'test': 'ABC',
        },
        'consentRequired': true,
        'uiConfig': {
          'overlay': true,
        },
        'postPromptUI': 'test',
      });
    });

    it('merge inline config w/ cmp config', async () => {
      appendConfigScriptElement(doc, element, {
        'consentInstanceId': '_ping_',
        'promptIfUnknownForGeoGroup': 'eea',
        'checkConsentHref': '/override',
        'clientConfig': {
          'test': 'ABC',
        },
        'uiConfig': {
          'overlay': true,
        },
        'policy': {
          'default': {
            'waitFor': {},
          },
        },
        'postPromptUI': 'test',
      });
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          isInCountryGroup() {
            return false;
          },
        })
      );
      element.setAttribute('type', '_ping_');
      const consentConfig = new ConsentConfig(element);
      // Make a deep copy of the config to avoid error when deleting fields
      const config = JSON.parse(
        JSON.stringify(await consentConfig.getConsentConfigPromise())
      );
      expect(config['promptUISrc']).to.match(/diy-consent.html/);
      delete config['promptUISrc'];
      expect(config).to.deep.equal({
        'consentInstanceId': '_ping_',
        'checkConsentHref': '/override',
        'consentRequired': false,
        'promptIfUnknownForGeoGroup': 'eea',
        'postPromptUI': 'test',
        'clientConfig': {
          'test': 'ABC',
        },
        'uiConfig': {
          'overlay': true,
        },
        'policy': {
          'default': {
            'waitFor': {},
          },
        },
      });
    });

    describe('geoOverride config', () => {
      let geoConfig;
      beforeEach(() => {
        geoConfig = {
          'consentInstanceId': 'abc',
          'consentRequired': false,
          'checkConsentHref': '/override',
          'geoOverride': {
            'nafta': {
              'consentRequired': true,
            },
            'waldo': {
              'checkConsentHref': 'https://example.test/check-consent',
              'consentRequired': 'remote',
            },
            'geoGroupUnknown': {
              'checkConsentHref': 'https://example.test/check-consent',
              'consentRequired': true,
            },
            'invalid': {
              'consentInstanceId': 'error',
              'checkConsentHref': 'https://example.test/check-consent',
            },
          },
        };
      });

      it('should return the original config if no geo matches', async () => {
        appendConfigScriptElement(doc, element, geoConfig);
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup() {
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );

        const consentConfig = new ConsentConfig(element);
        return expect(
          consentConfig.getConsentConfigPromise()
        ).to.eventually.deep.equal({
          'consentInstanceId': 'abc',
          'consentRequired': false,
          'checkConsentHref': '/override',
        });
      });

      it('should work with single field override', async () => {
        appendConfigScriptElement(doc, element, geoConfig);
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup(geoGroup) {
              if (geoGroup === 'nafta') {
                return GEO_IN_GROUP.IN;
              }
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );

        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'consentRequired': true,
          'checkConsentHref': '/override',
        });
      });

      it('should work with multiple fields override', async () => {
        appendConfigScriptElement(doc, element, geoConfig);
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup(geoGroup) {
              if (geoGroup === 'waldo') {
                return GEO_IN_GROUP.IN;
              }
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );

        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'checkConsentHref': 'https://example.test/check-consent',
          'consentRequired': 'remote',
        });
      });

      it('should override undefined fields', async () => {
        geoConfig = {
          'consentInstanceId': 'abc',
          'geoOverride': {
            'geoGroupUnknown': {
              'checkConsentHref': 'https://example.test/check-consent',
              'consentRequired': true,
            },
          },
        };
        appendConfigScriptElement(doc, element, geoConfig);
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup(geoGroup) {
              if (geoGroup === 'geoGroupUnknown') {
                return GEO_IN_GROUP.IN;
              }
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );

        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'checkConsentHref': 'https://example.test/check-consent',
          'consentRequired': true,
        });
      });

      it('should have remote consentRequired if checkConsentHref', async () => {
        geoConfig = {
          'consentInstanceId': 'abc',
          'checkConsentHref': 'https://example.test/check-consent',
        };
        appendConfigScriptElement(doc, element, geoConfig);
        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'checkConsentHref': 'https://example.test/check-consent',
          'consentRequired': 'remote',
        });
      });

      it('should convert promptIfUnknownForGeoGroup', async () => {
        geoConfig = {
          'consentInstanceId': 'abc',
          'promptIfUnknownForGeoGroup': 'na',
        };
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup(geoGroup) {
              if (geoGroup === 'na') {
                return GEO_IN_GROUP.IN;
              }
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );
        appendConfigScriptElement(doc, element, geoConfig);
        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'consentRequired': true,
          'promptIfUnknownForGeoGroup': 'na',
        });
      });

      it('should not override consentInstanceId', async () => {
        expectAsyncConsoleError(/consentInstanceId/, 1);
        appendConfigScriptElement(doc, element, geoConfig);
        env.sandbox.stub(Services, 'geoForDocOrNull').returns(
          Promise.resolve({
            isInCountryGroup(geoGroup) {
              if (geoGroup === 'invalid') {
                return GEO_IN_GROUP.IN;
              }
              return GEO_IN_GROUP.NOT_IN;
            },
          })
        );
        const consentConfig = new ConsentConfig(element);
        expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
          'consentInstanceId': 'abc',
          'consentRequired': false,
          'checkConsentHref': 'https://example.test/check-consent',
        });
      });
    });

    it('assert valid config', async () => {
      const scriptTypeError =
        'amp-consent/consent-config: <script> child ' +
        'must have type="application/json"';
      const consentExistError =
        'amp-consent/consent-config: ' +
        'consentInstanceId to store consent info is required';
      const multiScriptError =
        'amp-consent/consent-config: Found 2 <script> children. Expected 1';
      const invalidJsonError =
        'amp-consent/consent-config: ' +
        'Failed to parse <script> contents. Is it valid JSON?';
      const invalidCMPError = 'amp-consent/consent-config: invalid CMP type';
      const multiConsentError =
        'amp-consent/consent-config: ' +
        'only single consent instance is supported';
      const checkConsentHrefError =
        'amp-consent/consent-config: ' +
        '`checkConsentHref` must be specified if `consentRequired` is remote';

      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          isInCountryGroup() {
            return false;
          },
        })
      );

      const scriptElement = doc.createElement('script');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      scriptElement.setAttribute('type', '');
      element.appendChild(scriptElement);

      const config = new ConsentConfig(element);
      expect(() => config.getConsentConfigPromise()).to.throw(scriptTypeError);

      // Check consent config exists
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify({});
      allowConsoleError(() => {
        expect(() =>
          new ConsentConfig(element).getConsentConfigPromise()
        ).to.throw(consentExistError);
      });

      scriptElement.textContent = JSON.stringify({
        'consents': {
          'ABC': {},
          'DEF': {},
        },
      });
      allowConsoleError(() => {
        expect(() =>
          new ConsentConfig(element).getConsentConfigPromise()
        ).to.throw(multiConsentError);
      });

      scriptElement.textContent = JSON.stringify({
        'consentInstanceId': 'abc',
        'geoOverride': {},
        'consentRequired': 'remote',
      });
      await expect(
        new ConsentConfig(element).getConsentConfigPromise()
      ).to.be.rejectedWith(checkConsentHrefError);

      // Check invalid CMP
      scriptElement.textContent = JSON.stringify({
        'clientConfig': 'test',
      });
      element.setAttribute('type', 'not_exist');
      allowConsoleError(() => {
        expect(() =>
          new ConsentConfig(element).getConsentConfigPromise()
        ).to.throw(invalidCMPError);
      });

      scriptElement.textContent = '"abc": {"a",}';
      expect(() =>
        new ConsentConfig(element).getConsentConfigPromise()
      ).to.throw(invalidJsonError);

      // Check there is only one script object
      scriptElement.textContent = JSON.stringify(defaultConfig);
      const script2 = doc.createElement('script');
      element.appendChild(script2);
      expect(() =>
        new ConsentConfig(element).getConsentConfigPromise()
      ).to.throw(multiScriptError);
    });

    it('remove not supported policy', async () => {
      appendConfigScriptElement(doc, element, {
        'consentInstanceId': 'ABC',
        'checkConsentHref': 'example.test/',
        'policy': {
          'ABC': undefined,
        },
      });
      const consentConfig = new ConsentConfig(element);
      expect(await consentConfig.getConsentConfigPromise()).to.deep.equal({
        'consentInstanceId': 'ABC',
        'checkConsentHref': 'example.test/',
        'consentRequired': 'remote',
        'policy': {},
      });
    });
  });

  describe('expandConsentEndpointUrl', () => {
    it('support expansion in allowed list', async () => {
      const url = await expandConsentEndpointUrl(
        doc.body,
        'https://example.test?' +
          // CANONICAL_URL is allowed
          'canonicalurl=CANONICAL_URL&' +
          // CLIENT_ID is allowed
          'cid=CLIENT_ID&' +
          // PAGE_VIEW_ID is allowed
          'pid=PAGE_VIEW_ID&' +
          // PAGE_VIEW_ID_64 is allowed
          'pid64=PAGE_VIEW_ID_64&' +
          // SOURCE_URL is allowed
          'sourceurl=SOURCE_URL&' +
          // RANDOM is not allowed
          'r=RANDOM'
      );

      expect(url).to.match(
        /canonicalurl=https%3A%2F%2Ffoobar.com%2Fbaz&cid=amp-.{22}&pid=[0-9]+&pid64=.{22}&sourceurl=about%3Asrcdoc&r=RANDOM/
      );
    });

    it('override CLIENT_ID scope', async () => {
      const u1 = await expandConsentEndpointUrl(
        doc.body,
        'https://example.test?cid=CLIENT_ID&pid=PAGE_VIEW_ID&clientconfig=CONSENT_INFO(clientConfig)&cpid='
      );

      const u2 = await expandConsentEndpointUrl(
        doc.body,
        'https://example.test?cid=CLIENT_ID()&pid=PAGE_VIEW_ID&clientconfig=CONSENT_INFO(clientConfig)&cpid='
      );

      const u3 = await expandConsentEndpointUrl(
        doc.body,
        'https://example.test?cid=CLIENT_ID(123)&pid=PAGE_VIEW_ID&clientconfig=CONSENT_INFO(clientConfig)&cpid='
      );

      const u4 = await expandConsentEndpointUrl(
        doc.body,
        'https://example.test?cid=CLIENT_ID(abc)&pid=PAGE_VIEW_ID&clientconfig=CONSENT_INFO(clientConfig)&cpid='
      );

      await macroTask();

      expect(u1).to.equal(u2).to.equal(u3).to.equal(u4);
    });
  });

  describe('expandPolicyConfig', () => {
    it('create default policy', () => {
      const policy = expandPolicyConfig({}, 'ABC');
      expect(policy['default']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
        },
      });
    });

    it('create predefined _till_responded policy', function* () {
      const policy = expandPolicyConfig({}, 'ABC');
      expect(policy['_till_responded']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
        },
        'unblockOn': [
          CONSENT_POLICY_STATE.UNKNOWN,
          CONSENT_POLICY_STATE.SUFFICIENT,
          CONSENT_POLICY_STATE.INSUFFICIENT,
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
        ],
      });
    });

    it('create predefined _till_accepted policy', function* () {
      const policy = expandPolicyConfig({}, 'ABC');
      expect(policy['_till_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
        },
      });
    });

    it('create default _auto_reject policy', function* () {
      const policy = expandPolicyConfig({}, 'ABC');
      expect(policy['_auto_reject']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
        },
        'timeout': {
          'seconds': 0,
          'fallbackAction': 'reject',
        },
        'unblockOn': [
          CONSENT_POLICY_STATE.UNKNOWN,
          CONSENT_POLICY_STATE.SUFFICIENT,
          CONSENT_POLICY_STATE.INSUFFICIENT,
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
        ],
      });
    });

    it('override default policy', function* () {
      const policy = expandPolicyConfig(
        {
          'default': {
            'waitFor': {
              'ABC': [],
            },
            'timeout': 2,
          },
        },
        'ABC'
      );
      expect(policy['default']).to.deep.equal({
        'waitFor': {
          'ABC': [],
        },
        'timeout': 2,
      });
      expect(policy['_till_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
        },
      });
    });
  });
});
