import {CONSENT_STRING_TYPE} from '#core/constants/consent-state';

import {xhrServiceForTesting} from '#service/xhr-impl';

import {dev, user} from '#utils/log';

import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {removeSearch} from '../../../../src/url';
import {GEO_IN_GROUP} from '../../../amp-geo/0.1/amp-geo-in-group';
import {ACTION_TYPE, AmpConsent} from '../amp-consent';
import {
  CONSENT_ITEM_STATE,
  METADATA_STORAGE_KEY,
  PURPOSE_CONSENT_STATE,
  STORAGE_KEY,
  constructConsentInfo,
  constructMetadata,
  getConsentStateValue,
} from '../consent-info';
import {ConsentStateManager} from '../consent-state-manager';

describes.realWin(
  'amp-consent',
  {
    amp: {
      extensions: ['amp-consent'],
      ampdoc: 'single',
    },
  },
  (env) => {
    let win;
    let doc;
    let ampdoc;
    let jsonMockResponses;
    let storageValue;
    let requestBody;
    let ISOCountryGroups;
    let xhrServiceMock;
    let storageMock;

    beforeEach(() => {
      doc = env.win.document;
      ampdoc = env.ampdoc;
      win = env.win;

      storageValue = {};
      jsonMockResponses = {
        'https://response1/': '{"promptIfUnknown": true}',
        'https://response2/': '{}',
        'https://response3/': '{"promptIfUnknown": false}',
        'https://geo-override-check/': '{"consentRequired": false}',
        'https://geo-override-check2/': '{"consentRequired": true}',
        'http://www.origin.com/r/1': '{}',
        'https://invalid.response.com/': '{"consentRequired": 3}',
        'https://xssi-prefix/': 'while(1){"consentRequired": false}',
        'https://example.test/': '{}',
      };

      xhrServiceMock = {
        fetchJson: (url, init) => {
          requestBody = init.body;
          expect(init.credentials).to.equal('include');
          expect(init.method).to.equal('POST');
          url = removeSearch(url);
          return Promise.resolve({
            json() {
              return Promise.resolve(JSON.parse(jsonMockResponses[url]));
            },
            text() {
              return Promise.resolve(jsonMockResponses[url]);
            },
          });
        },
        xssiJson: xhrServiceForTesting(win).xssiJson,
      };

      storageMock = {
        setNonBoolean: (name, value) => {
          storageValue[name] = value;
          return Promise.resolve();
        },
        get: (name) => {
          return Promise.resolve(storageValue[name]);
        },
        set: (name, value) => {
          storageValue[name] = value;
          return Promise.resolve();
        },
      };

      resetServiceForTesting(win, 'xhr');
      registerServiceBuilder(win, 'xhr', function () {
        return xhrServiceMock;
      });

      resetServiceForTesting(win, 'geo');
      registerServiceBuilder(win, 'geo', function () {
        return Promise.resolve({
          isInCountryGroup: (group) =>
            ISOCountryGroups.indexOf(group) >= 0
              ? GEO_IN_GROUP.IN
              : GEO_IN_GROUP.NOT_IN,
        });
      });

      resetServiceForTesting(win, 'storage');
      registerServiceBuilder(win, 'storage', function () {
        return Promise.resolve(storageMock);
      });
    });

    describe('amp-consent', () => {
      describe('consent config', () => {
        let consentElement;

        it('get consent/policy/postPromptUI config', async () => {
          const config = {
            'consentInstanceId': 'test',
            'checkConsentHref': '/override',
            'consentRequired': true,
            'clientConfig': {
              'test': 'ABC',
            },
            'postPromptUI': 'test',
          };
          consentElement = createConsentElement(doc, config);
          const postPromptUI = document.createElement('div');
          postPromptUI.setAttribute('id', 'test');
          consentElement.appendChild(postPromptUI);
          doc.body.appendChild(consentElement);
          const ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();

          expect(ampConsent.postPromptUI_).to.not.be.null;
          expect(ampConsent.consentId_).to.equal('test');
          expect(ampConsent.consentConfig_).to.deep.equal(config);

          expect(Object.keys(ampConsent.policyConfig_)).to.have.length(4);
          expect(ampConsent.policyConfig_['default']).to.be.ok;
          expect(ampConsent.policyConfig_['_till_responded']).to.be.ok;
          expect(ampConsent.policyConfig_['_till_accepted']).to.be.ok;
          expect(ampConsent.policyConfig_['_auto_reject']).to.be.ok;
        });

        it('relative checkConsentHref is resolved', async () => {
          const fetchSpy = env.sandbox.spy(xhrServiceMock, 'fetchJson');
          consentElement = createConsentElement(doc, {
            'checkConsentHref': '/r/1',
            'consentInstanceId': 'XYZ',
          });
          const ampConsent = new AmpConsent(consentElement);
          doc.body.appendChild(consentElement);
          const getUrlStub = env.sandbox.stub(ampdoc, 'getUrl');
          // return a cache Url to test origin source being used to resolve.
          getUrlStub.callsFake(() => {
            return 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0#h';
          });
          await ampConsent.buildCallback();

          await macroTask();
          expect(fetchSpy).to.be.calledOnce;
          expect(win.testLocation.origin).not.to.be.empty;
          expect(fetchSpy).to.be.calledWith('http://www.origin.com/r/1');
        });

        it('supports checkConsentHref expansion', async () => {
          const fetchSpy = env.sandbox.spy(xhrServiceMock, 'fetchJson');
          consentElement = createConsentElement(doc, {
            'checkConsentHref': 'https://example.test?cid=CLIENT_ID&r=RANDOM',
            'consentInstanceId': 'test',
          });
          const ampConsent = new AmpConsent(consentElement);
          doc.body.appendChild(consentElement);
          await ampConsent.buildCallback();
          await macroTask();
          expect(fetchSpy).to.be.calledWithMatch(/cid=amp-.{22}&r=RANDOM/);
        });
      });
    });

    describe('server communication', () => {
      let defaultConfig;
      let ampConsent;
      let consentElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
            },
          },
        };
        consentElement = createConsentElement(doc, defaultConfig);
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
      });

      it('sends post request to server', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        expect(requestBody).to.jsonEqual({
          'consentInstanceId': 'ABC',
          'consentStateValue': 'unknown',
          'isDirty': false,
          'matchedGeoGroup': null,
        });
      });

      it('read promptIfUnknown from server response', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        return ampConsent
          .getConsentRequiredPromiseForTesting()
          .then((isRequired) => {
            expect(isRequired).to.be.true;
          });
      });

      it('respects the xssiPrefix option', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'checkConsentHref': 'https://xssi-prefix/',
          'xssiPrefix': 'while(1)',
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .false;
      });
    });

    describe('server communication', () => {
      let ampConsent;

      it('checks local storage before making sever request', async () => {
        const config = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://geo-override-check2/',
        };
        const localStorageSpy = env.sandbox.spy(storageMock, 'get');
        const fetchSpy = env.sandbox.spy(xhrServiceMock, 'fetchJson');

        ampConsent = getAmpConsent(doc, config);
        await ampConsent.buildCallback();
        await macroTask();
        expect(localStorageSpy).to.be.calledBefore(fetchSpy);
        expect(fetchSpy).to.be.calledOnce;
        const instanceInfo = await ampConsent
          .getConsentStateManagerForTesting()
          .getConsentInstanceInfo();

        expect(instanceInfo.consentState).to.equal(CONSENT_ITEM_STATE.UNKNOWN);
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .true;
      });

      it('respects existing local storage decision', async () => {
        const config = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://geo-override-false/',
        };
        storageValue = {
          'amp-consent:abc': false,
        };
        ampConsent = getAmpConsent(doc, config);

        await ampConsent.buildCallback();
        await macroTask();
        const instanceInfo = await ampConsent
          .getConsentStateManagerForTesting()
          .getConsentInstanceInfo();
        expect(instanceInfo.consentState).to.equal(CONSENT_ITEM_STATE.REJECTED);
      });

      it('sends post request to server when consentRequired is remote', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://geo-override-check/',
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .false;
      });

      it('resolves consentRequired to remote response with old format', async () => {
        const remoteConfig = {
          'consents': {
            'oldConsent': {
              'checkConsentHref': 'https://geo-override-check2/',
            },
          },
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .true;
      });

      it('fallsback to true with invalid remote reponse', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://invalid.response.com/',
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .true;
      });

      describe('geoOverride server communication', () => {
        it('sends post request to server with matched group', async () => {
          const remoteConfig = {
            'consentInstanceId': 'abc',
            'geoOverride': {
              'nafta': {
                'checkConsentHref': 'https://geo-override-check2/',
                'consentRequired': true,
              },
            },
          };
          ISOCountryGroups = ['nafta'];
          ampConsent = getAmpConsent(doc, remoteConfig);
          await ampConsent.buildCallback();
          await macroTask();
          expect(requestBody).to.jsonEqual({
            'consentInstanceId': 'abc',
            'consentStateValue': 'unknown',
            'isDirty': false,
            'matchedGeoGroup': 'nafta',
          });
        });

        it('only geoOverrides the first matched group', async () => {
          const remoteConfig = {
            'consentInstanceId': 'abc',
            'geoOverride': {
              'na': {
                'checkConsentHref': 'https://geo-override-check2/',
                'consentRequired': true,
              },
              'eea': {
                'consentRequired': false,
              },
            },
          };
          ISOCountryGroups = ['na', 'eea'];
          ampConsent = getAmpConsent(doc, remoteConfig);
          await ampConsent.buildCallback();
          await macroTask();
          expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
            .true;
          expect(ampConsent.matchedGeoGroup_).to.equal('na');
          expect(requestBody).to.jsonEqual({
            'consentInstanceId': 'abc',
            'consentStateValue': 'unknown',
            'consentString': undefined,
            'consentMetadata': undefined,
            'isDirty': false,
            'matchedGeoGroup': 'na',
          });
        });
      });

      describe('remote server response', () => {
        beforeEach(() => {
          jsonMockResponses = {
            'https://server-test-1/':
              '{"consentRequired": false, "consentStateValue": "unknown", "consentString": "hello"}',
            'https://server-test-2/':
              '{"consentRequired": true, "consentStateValue": "rejected", "consentString": "mystring", ' +
              '"consentMetadata":{"consentStringType": 3, "additionalConsent": "1~1.35.41.101", "gdprApplies": false, "purposeOne": true},' +
              '"purposeConsents": {"abc":true, "xyz": false}}',
            'https://server-test-3/':
              '{"consentRequired": true, "consentStateValue": "unknown"}',
            'https://geo-override-check2/': '{"consentRequired": true}',
            'https://gdpr-applies/':
              '{"consentRequired": true, "gdprApplies": false}',
          };
        });

        it('should not update local storage when response is false', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://server-test-1/',
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('unknown');
          // 3 is dismissed, 4 is not requried, and 5 is unknown.
          // All 3 turn into 'unknown'.
          expect(stateManagerInfo).to.jsonEqual(
            constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED)
          );
        });

        it('should not update local storage when consent value response is null', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://geo-override-check2/',
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('unknown');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
          );
          expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
            .true;
        });

        it('updates local storage and uses those values', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://server-test-2/',
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('rejected');
          expect(stateManagerInfo).to.deep.equal({
            'consentState': CONSENT_ITEM_STATE.REJECTED,
            'consentString': 'mystring',
            'consentMetadata': constructMetadata(
              CONSENT_STRING_TYPE.US_PRIVACY_STRING,
              '1~1.35.41.101',
              false,
              true
            ),
            'isDirty': undefined,
            'purposeConsents': {
              'abc': PURPOSE_CONSENT_STATE.ACCEPTED,
              'xyz': PURPOSE_CONSENT_STATE.REJECTED,
            },
            'tcfPolicyVersion': undefined,
          });
        });

        it('accepts unknown as a response', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://server-test-3/',
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('unknown');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
          );
        });
      });

      describe('syncing while local storage exists', () => {
        beforeEach(() => {
          jsonMockResponses = {
            'https://server-test-4/':
              '{"consentRequired": true, "consentStateValue": "accepted", "consentString": "newstring"}',
            'https://server-test-5/':
              '{"consentRequired": true, "consentStateValue": "accepted", "consentString": "newstring", "consentMetadata": {"consentStringType": 3, "additionalConsent": "1~1.35.41.101", "gdprApplies": true, "purposeOne": true}}',
            'https://server-test-6/':
              '{"consentRequired": true, "consentStateValue": "accepted", "consentString": "newstring"}',
            'https://server-test-7/':
              '{"consentRequired": true, "consentStateValue": "accepted", "consentString": "newstring", "purposeConsents": {"xyz": false}}',
            'https://geo-override-check2/': '{"consentRequired": true}',
          };
        });

        it('syncs data from server with existing local storage', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-4/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'oldstring',
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('accepted');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'newstring')
          );
        });

        it('syncs undefined values overriding', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-4/',
          };
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'oldstring',
              [STORAGE_KEY.METADATA]: {
                [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
                  CONSENT_STRING_TYPE.TCF_V2,
                [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '3~3.33.303',
              },
              [STORAGE_KEY.PURPOSE_CONSENTS]: {
                'abc': PURPOSE_CONSENT_STATE.ACCEPTED,
              },
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('accepted');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'newstring')
          );
        });

        it('syncs purposeConsents from server', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-7/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'oldstring',
              [STORAGE_KEY.PURPOSE_CONSENTS]: {
                'abc': PURPOSE_CONSENT_STATE.ACCEPTED,
              },
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('accepted');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(
              CONSENT_ITEM_STATE.ACCEPTED,
              'newstring',
              undefined,
              {'xyz': PURPOSE_CONSENT_STATE.REJECTED}
            )
          );
        });

        it('syncs metadata from server', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-5/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'oldstring',
              [STORAGE_KEY.METADATA]: {
                [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
                  CONSENT_STRING_TYPE.TCF_V2,
                [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '3~3.33.303',
              },
              [STORAGE_KEY.VERSION]: 4,
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('accepted');
          expect(stateManagerInfo).to.deep.equal({
            'consentState': CONSENT_ITEM_STATE.ACCEPTED,
            'consentString': 'newstring',
            'isDirty': undefined,
            'consentMetadata': constructMetadata(
              CONSENT_STRING_TYPE.US_PRIVACY_STRING,
              '1~1.35.41.101',
              true,
              true
            ),
            'purposeConsents': undefined,
            'tcfPolicyVersion': undefined,
          });
        });

        it('syncs data with no metadata', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-6/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'oldstring',
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('accepted');
          expect(stateManagerInfo).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'newstring')
          );
        });

        it('should validate purpose consents before syncing', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://server-test-7/',
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          const validationSpy = env.sandbox.spy(
            ampConsent,
            'validatePurposeConsents_'
          );
          await ampConsent.buildCallback();
          await macroTask();
          expect(validationSpy).to.be.calledOnce;
          expect(validationSpy).to.be.calledWith({'xyz': false});
        });

        it('should not sync data if response is null', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': true,
            'checkConsentHref': 'https://geo-override-check2/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'mystring',
              [STORAGE_KEY.METADATA]: {
                [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
                  CONSENT_STRING_TYPE.TCF_V2,
              },
              [STORAGE_KEY.VERSION]: 4,
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getConsentInstanceInfo();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('rejected');
          expect(stateManagerInfo).to.deep.equal({
            'consentState': CONSENT_ITEM_STATE.REJECTED,
            'consentString': 'mystring',
            'isDirty': undefined,
            'consentMetadata': constructMetadata(CONSENT_STRING_TYPE.TCF_V2),
            'purposeConsents': undefined,
            'tcfPolicyVersion': 4,
          });
        });
      });

      describe('expire cache', () => {
        beforeEach(() => {
          jsonMockResponses = {
            'https://expire-cache/':
              '{"expireCache": true,"consentRequired": true, "consentStateValue": null, "consentString": null}',
            'https://expire-cache-2/':
              '{"expireCache": true,"consentRequired": true, "consentStateValue": "invalidState"}',
          };
        });

        it('should set dirty bit', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://expire-cache/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'mystring',
              [STORAGE_KEY.METADATA]: {
                [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
                  CONSENT_STRING_TYPE.TCF_V2,
              },
              [STORAGE_KEY.PURPOSE_CONSENTS]: {'abc': 1},
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getSavedInstanceForTesting();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('rejected');
          expect(stateManagerInfo).to.deep.equal({
            'consentState': CONSENT_ITEM_STATE.REJECTED,
            'consentString': 'mystring',
            'isDirty': true,
            'consentMetadata': constructMetadata(CONSENT_STRING_TYPE.TCF_V2),
            'purposeConsents': {'abc': PURPOSE_CONSENT_STATE.ACCEPTED},
            'tcfPolicyVersion': undefined,
          });
        });

        it('should not update cache with invalid consent info', async () => {
          const inlineConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://expire-cache-2/',
          };
          // 0 represents 'rejected' in storage
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 0,
              [STORAGE_KEY.STRING]: 'mystring',
              [STORAGE_KEY.METADATA]: {
                [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
                  CONSENT_STRING_TYPE.TCF_V2,
              },
            },
          };
          ampConsent = getAmpConsent(doc, inlineConfig);
          await ampConsent.buildCallback();
          await macroTask();
          const stateManagerInfo = await ampConsent
            .getConsentStateManagerForTesting()
            .getSavedInstanceForTesting();
          const stateValue = getConsentStateValue(
            stateManagerInfo.consentState
          );

          expect(stateValue).to.equal('rejected');
          expect(stateManagerInfo).to.deep.equal({
            'consentState': CONSENT_ITEM_STATE.REJECTED,
            'consentString': 'mystring',
            'isDirty': true,
            'consentMetadata': constructMetadata(CONSENT_STRING_TYPE.TCF_V2),
            'purposeConsents': undefined,
            'tcfPolicyVersion': undefined,
          });
        });
      });
    });

    describe('TCF Policy version', () => {
      let ampConsent;

      beforeEach(() => {
        const defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
            },
          },
        };
        const consentElement = createConsentElement(doc, defaultConfig);
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
      });

      const invalidTCFPolicyVersionValues = [NaN, 2.2, 4.1, Infinity];

      invalidTCFPolicyVersionValues.forEach((invalidTCFPolicyVersionValue) => {
        it(
          'should error and return undefined on invalid tcfPolicyVersion test with: ' +
            invalidTCFPolicyVersionValue,
          () => {
            const spy = env.sandbox.stub(user(), 'error');
            const tcfPolicyVersion = ampConsent.validateTCFPolicyVersion_(
              invalidTCFPolicyVersionValue
            );
            expect(spy.args[0][1]).to.match(
              /CMP tcfPolicyVersion must be a valid number \(integer\)\./
            );
            expect(tcfPolicyVersion).to.be.equal(undefined);
          }
        );
      });

      it('should return the value on invalid tcfPolicyVersion test', () => {
        const tcfPolicyVersion = ampConsent.validateTCFPolicyVersion_(4);
        expect(tcfPolicyVersion).to.be.equal(4);
      });
    });

    describe('consent metadata', () => {
      let ampConsent;

      beforeEach(() => {
        const defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
            },
          },
        };
        const consentElement = createConsentElement(doc, defaultConfig);
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
      });

      it('should error and return undefined on invalid metadata', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const metadata = ampConsent.validateMetadata_('bad metadata');
        expect(spy.args[0][1]).to.match(/CMP metadata is not an object./);
        expect(metadata).to.be.undefined;
      });

      it('should work with no consent string', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const metadata = ampConsent.validateMetadata_({
          'gdprApplies': true,
        });
        expect(spy).to.not.be.called;
        expect(metadata).to.deep.equals(
          constructMetadata(undefined, undefined, true)
        );
      });

      it('should remove invalid consentStringType', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const responseMetadata = {'consentStringType': 4};
        expect(ampConsent.validateMetadata_(responseMetadata)).to.deep.equals(
          constructMetadata()
        );
        expect(spy.args[0][1]).to.match(
          /Consent metadata value "%s" is invalid./
        );
        expect(spy.args[0][2]).to.match(/consentStringType/);
        responseMetadata['consentStringType'] = CONSENT_STRING_TYPE.TCF_V2;
        expect(ampConsent.validateMetadata_(responseMetadata)).to.deep.equals(
          constructMetadata(2)
        );
      });

      it('should remove invalid additionalConsent', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const responseMetadata = {'additionalConsent': 4};
        expect(ampConsent.validateMetadata_(responseMetadata)).to.deep.equals(
          constructMetadata()
        );
        expect(spy.args[0][1]).to.match(
          /Consent metadata value "%s" is invalid./
        );
        expect(spy.args[0][2]).to.match(/additionalConsent/);
      });

      it('should remove invalid gdprApplies', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const responseMetadata = {'gdprApplies': 4};
        expect(ampConsent.validateMetadata_(responseMetadata)).to.deep.equals(
          constructMetadata()
        );
        expect(spy.args[0][1]).to.match(
          /Consent metadata value "%s" is invalid./
        );
        expect(spy.args[0][2]).to.match(/gdprApplies/);
      });

      it('should remove invalid purposeOne', () => {
        const spy = env.sandbox.stub(user(), 'error');
        const responseMetadata = {'purposeOne': 'accepted'};
        expect(ampConsent.validateMetadata_(responseMetadata)).to.deep.equals(
          constructMetadata()
        );
        expect(spy.args[0][1]).to.match(
          /Consent metadata value "%s" is invalid./
        );
        expect(spy.args[0][2]).to.match(/purposeOne/);
      });
    });

    describe('exposes api', () => {
      let ampConsent;
      let consentElement;

      describe('config', () => {
        it('shoud expose if in config', async () => {
          consentElement = createConsentElement(doc, {
            'consentInstanceId': 'abc',
            'checkConsentHref': 'https://response1',
            'exposesTcfApi': true,
          });
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          await macroTask();
          const {frames} = win;
          expect(frames[0].name).to.be.equal('__tcfapiLocator');
          expect(ampConsent.tcfApiCommandsManager_).to.not.be.null;
        });
      });

      describe('tcfPostMessageApi', () => {
        let iframe;
        let ampVideoIframe;
        let event;
        let listenerSpy;
        let msg;

        beforeEach(() => {
          jsonMockResponses = {
            'https://server-test-2/':
              '{"consentRequired": true, "consentStateValue": "accepted", "consentString": "mystring"}',
          };
          consentElement = createConsentElement(doc, {
            'consentInstanceId': 'abc',
            'checkConsentHref': 'https://server-test-2/',
            'exposesTcfApi': true,
          });
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          ampVideoIframe = document.createElement('amp-video-iframe');
          iframe = doc.createElement('iframe');
          ampVideoIframe.appendChild(iframe);
          doc.body.appendChild(ampVideoIframe);
          event = new Event('message');
          msg = {
            __tcfapiCall: {
              command: 'ping',
              version: 2,
              callId: 1,
            },
          };
        });

        it('installs __tcfapiLocator & 3p iframe can locate after amp-consent unblocks', async () => {
          await ampConsent.buildCallback();
          await macroTask();
          expect(iframe.contentWindow.parent.frames['__tcfapiLocator']).to.not
            .be.undefined;
          expect(win.frames['__tcfapiLocator']).to.deep.equals(
            iframe.contentWindow.parent.frames['__tcfapiLocator']
          );
          const frames = doc.querySelectorAll('iframe');
          for (let i = 0; i < frames.length; i++) {
            if (frames[i].name === '__tcfapiLocator') {
              expect(frames[i].hasAttribute('aria-hidden')).to.be.true;
              expect(frames[i].hasAttribute('hidden')).to.be.true;
            }
          }
        });

        it('installs window level event listener', async () => {
          event.data = msg;
          await ampConsent.buildCallback();
          await macroTask();
          listenerSpy = env.sandbox.stub(
            ampConsent.tcfApiCommandManager_,
            'handleTcfCommand'
          );
          win.dispatchEvent(event);
          expect(listenerSpy).to.be.calledOnce;
          expect(listenerSpy.args[0][0]).to.deep.equals(msg);
        });
      });
    });

    describe('amp-geo integration', () => {
      let defaultConfig;
      let ampConsent;
      let consentElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'promptIfUnknownForGeoGroup': 'testGroup',
            },
          },
        };
        consentElement = createConsentElement(doc, defaultConfig);
      });

      // GEO
      it('in geo group', async () => {
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        ISOCountryGroups = ['unknown', 'testGroup'];
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .true;
      });

      it('not in geo group', async () => {
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        ISOCountryGroups = ['unknown'];
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .false;
      });

      it('geo override promptIfUnknown', async () => {
        ISOCountryGroups = ['unknown'];
        consentElement = createConsentElement(doc, {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
              'promptIfUnknownForGeoGroup': 'testGroup',
            },
          },
        });
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromiseForTesting()).to.be
          .false;
      });
    });

    describe('external consent action', () => {
      let defaultConfig;
      let ampConsent;
      let actionSpy;
      let event;
      let ampIframe;
      let iframe;
      let consentElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
            },
          },
        };
        consentElement = createConsentElement(doc, defaultConfig);
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        actionSpy = env.sandbox.stub(ampConsent, 'handleAction_');
        env.sandbox.stub(ampConsent, 'isReadyToHandleAction_').returns(true);
        ampConsent.enableInteractions_();
        ampIframe = document.createElement('amp-iframe');
        iframe = doc.createElement('iframe');
        ampIframe.appendChild(iframe);
        ampConsent.element.appendChild(ampIframe);
        ampConsent.isPromptUiOn_ = true;
        event = new Event('message');
      });

      it('listen to external consent response msg', () => {
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
          'info': 'accept-string',
          'consentMetadata': {
            'consentStringType': CONSENT_STRING_TYPE.TCF_V1,
            'additionalConsent': '1~1.35.41.101',
            'gdprApplies': true,
            'purposeOne': true,
          },
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.be.calledWith(
          ACTION_TYPE.ACCEPT,
          'accept-string',
          constructMetadata(
            CONSENT_STRING_TYPE.TCF_V1,
            '1~1.35.41.101',
            true,
            true
          )
        );
      });

      describe('granularConsentExp', () => {
        let managerSpy;

        beforeEach(async () => {
          ampConsent.buildCallback();
          await macroTask();
          managerSpy = env.sandbox.spy(
            ampConsent.consentStateManager_,
            'updateConsentInstancePurposes'
          );
          event.data = {
            'type': 'consent-response',
            'action': 'accept',
            'info': 'accept-string',
            'purposeConsents': {
              'purpose-foo': true,
              'purpose-bar': false,
            },
          };
        });

        it('handles purposeConsentMap w/ accept', () => {
          event.source = iframe.contentWindow;
          win.dispatchEvent(event);

          expect(managerSpy).to.be.calledWith(event.data.purposeConsents);
          expect(actionSpy).to.be.calledWith(
            ACTION_TYPE.ACCEPT,
            'accept-string'
          );
        });

        it('handles purposeConsentMap w/ reject', () => {
          event.data.action = 'reject';
          delete event.data.info;
          event.source = iframe.contentWindow;
          win.dispatchEvent(event);

          expect(managerSpy).to.be.calledWith(event.data.purposeConsents);
          expect(actionSpy).to.be.calledWith(ACTION_TYPE.REJECT);
        });

        it('does not set purposeConsentMap with dismiss', () => {
          event.data.action = 'dismiss';
          event.source = iframe.contentWindow;
          win.dispatchEvent(event);

          expect(managerSpy).to.not.be.called;
          expect(actionSpy).to.be.calledWith(ACTION_TYPE.DISMISS);
        });

        it('does not set purposeConsentMap with empty consent map', () => {
          event.data.purposeConsents = {};
          event.source = iframe.contentWindow;
          win.dispatchEvent(event);

          expect(managerSpy).to.not.be.called;
          expect(actionSpy).to.be.calledWith(
            ACTION_TYPE.ACCEPT,
            'accept-string'
          );
        });
      });

      it('ignore info when prompt UI is not displayed', () => {
        ampConsent.isPromptUiOn_ = false;
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
          'info': 'accept-string',
          'consentMetadata': {'consentStringType': CONSENT_STRING_TYPE.TCF_V1},
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.not.be.called;
      });

      it('ignore msg from incorrect source', () => {
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
        };
        event.source = null;
        win.dispatchEvent(event);
        expect(actionSpy).to.not.be.called;
      });

      it('ignore info with action dismiss', () => {
        expectAsyncConsoleError(
          '[amp-consent] ' +
            'Consent string value %s not applicable on user dismiss, ' +
            'stored value will be kept and used '
        );
        event.data = {
          'type': 'consent-response',
          'action': 'dismiss',
          'info': 'test',
          'consentMetadata': {'consentStringType': CONSENT_STRING_TYPE.TCF_V1},
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.be.calledWith(ACTION_TYPE.DISMISS);
      });
    });

    describe('UI', () => {
      let uiElement;
      let defaultConfig;
      let ampConsent;
      let updateConsentInstanceStateSpy;
      let consentElement;
      let postPromptUI;

      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'https://response1',
              'promptUI': '123',
            },
          },
          'postPromptUI': 'test',
        };
        consentElement = createConsentElement(doc, defaultConfig);
        uiElement = document.createElement('div');
        uiElement.setAttribute('id', '123');
        consentElement.appendChild(uiElement);
        postPromptUI = document.createElement('div');
        postPromptUI.setAttribute('id', 'test');
        consentElement.appendChild(postPromptUI);
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        env.sandbox.stub(ampConsent.vsync_, 'mutate').callsFake((fn) => {
          fn();
        });
        env.sandbox.stub(ampConsent, 'mutateElement').callsFake((fn) => {
          fn();
        });
      });

      it('should not show promptUI if local storage has decision', async () => {
        const config = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://geo-override-check2/',
          'promptUI': '123',
        };
        storageValue = {
          'amp-consent:abc': true,
        };

        ampConsent = getAmpConsent(doc, config);
        await ampConsent.buildCallback();
        await macroTask();
        const instanceInfo = await ampConsent
          .getConsentStateManagerForTesting()
          .getConsentInstanceInfo();

        expect(instanceInfo.consentState).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        expect(ampConsent.isPromptUiOn_).to.be.false;
      });

      it('update current displaying status', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        updateConsentInstanceStateSpy = env.sandbox.spy(
          ampConsent.consentStateManager_,
          'updateConsentInstanceState'
        );
        await macroTask();
        expect(ampConsent.isPromptUiOn_).to.be.true;
        await macroTask();
        ampConsent.handleAction_(ACTION_TYPE.ACCEPT);
        await macroTask();
        expect(updateConsentInstanceStateSpy).to.be.calledWith(
          CONSENT_ITEM_STATE.ACCEPTED
        );
        await macroTask();
        expect(ampConsent.isPromptUiOn_).to.be.false;
      });

      it('ignore action when no consent prompt is displaying', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        updateConsentInstanceStateSpy = env.sandbox.spy(
          ampConsent.consentStateManager_,
          'updateConsentInstanceState'
        );
        // Hide gets called
        ampConsent.handleAction_(ACTION_TYPE.DISMISS);
        await macroTask();
        expect(updateConsentInstanceStateSpy).to.be.calledOnce;
        updateConsentInstanceStateSpy.resetHistory();
        expect(ampConsent.isPromptUiOn_).to.be.false;
        // isReadyToHandleAction_() should return false
        ampConsent.handleClosingUiAction_(ACTION_TYPE.DISMISS);
        await macroTask();
        expect(updateConsentInstanceStateSpy).to.not.be.called;
      });

      describe('schedule display', () => {
        it('should check for pending consent UI', async () => {
          await ampConsent.buildCallback();
          await macroTask();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
          ampConsent.scheduleDisplay_();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
          ampConsent.hide_();
          await macroTask();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(0);
          ampConsent.scheduleDisplay_();
          ampConsent.scheduleDisplay_();
          ampConsent.scheduleDisplay_();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
        });
      });

      describe('postPromptUI', () => {
        let postPromptUI;

        beforeEach(() => {
          postPromptUI = doc.getElementById('test');
        });

        it('handle postPromptUI', async () => {
          storageValue = {
            'amp-consent:ABC': true,
          };

          // Build the amp consent, and check that everything is
          // initialized correctly
          await ampConsent.buildCallback();
          ampConsent.element.classList.remove('i-amphtml-notbuilt');
          expect(ampConsent.postPromptUI_).to.not.be.null;
          expect(ampConsent.element).to.have.display('none');
          expect(postPromptUI).to.have.display('none');

          // Wait for all modifications to the element to be applied.
          // Then make more assertions.
          await macroTask();
          expect(ampConsent.element).to.not.have.display('none');
          expect(ampConsent.element.classList.contains('amp-active')).to.be
            .true;
          expect(ampConsent.element.classList.contains('amp-hidden')).to.be
            .false;
          expect(postPromptUI).to.not.have.display('none');

          // Schedule the display of the element
          ampConsent.scheduleDisplay_();

          // Wait for the element to be displayed,
          // And the postPrompt to be hidden.
          await macroTask();
          expect(postPromptUI).to.have.display('none');
        });

        it('postPromptUI to accept expireCache arg', async () => {
          storageValue = {
            'amp-consent:ABC': true,
          };
          await ampConsent.buildCallback();
          ampConsent.handleReprompt_({args: {'expireCache': true}});
          await macroTask();
          expect(storageValue['amp-consent:ABC']['d']).to.equal(1);
        });

        describe('hide/show postPromptUI with local storage', () => {
          beforeEach(() => {
            defaultConfig = {
              'consentInstanceId': 'ABC',
              'consentRequired': true,
              'postPromptUI': 'test2',
            };
            consentElement = createConsentElement(doc, defaultConfig);
            postPromptUI = doc.createElement('div');
            postPromptUI.setAttribute('id', 'test2');
            consentElement.appendChild(postPromptUI);
            doc.body.appendChild(consentElement);
            ampConsent = new AmpConsent(consentElement);
          });

          it('hides postPromptUI with no local storage decision', async () => {
            await ampConsent.buildCallback();
            expect(postPromptUI).to.have.display('none');
          });

          it('shows postPromptUI with local storage decision', async () => {
            const scheduleDisplaySpy = env.sandbox.spy(
              ampConsent,
              'scheduleDisplay_'
            );

            storageValue = {
              'amp-consent:ABC': true,
            };
            await ampConsent.buildCallback();
            ampConsent.element.classList.remove('i-amphtml-notbuilt');
            await macroTask();
            const instanceInfo = await ampConsent
              .getConsentStateManagerForTesting()
              .getConsentInstanceInfo();

            expect(instanceInfo.consentState).to.equal(
              CONSENT_ITEM_STATE.ACCEPTED
            );
            expect(scheduleDisplaySpy).to.not.be.called;
            expect(postPromptUI).to.not.be.null;
            expect(postPromptUI).to.not.have.display('none');
          });
        });

        describe('hide/show postPromptUI', () => {
          beforeEach(() => {
            defaultConfig = {
              'consents': {
                'ABC': {
                  'checkConsentHref': 'https://response3',
                },
              },
              // There's already an amp-consent from a parent beforeEach with a
              // test postPromptUI
              'postPromptUI': 'test2',
            };
            consentElement = createConsentElement(doc, defaultConfig);
            postPromptUI = doc.createElement('div');
            postPromptUI.setAttribute('id', 'test2');
            consentElement.appendChild(postPromptUI);
            doc.body.appendChild(consentElement);
            ampConsent = new AmpConsent(consentElement);
          });

          it('hide postPromptUI with no local storage', async () => {
            await ampConsent.buildCallback();
            ampConsent.element.classList.remove('i-amphtml-notbuilt');
            await macroTask();

            expect(postPromptUI).to.not.be.null;
            expect(postPromptUI).to.have.display('none');
          });

          it('show postPromptUI', async () => {
            storageValue = {
              'amp-consent:ABC': true,
            };
            await ampConsent.buildCallback();
            ampConsent.element.classList.remove('i-amphtml-notbuilt');
            await macroTask();

            expect(postPromptUI).to.not.be.null;
            expect(postPromptUI).to.not.have.display('none');
          });
        });
      });
    });

    describe('granular consent experiment', () => {
      let defaultConfig;
      let ampConsent;
      let consentElement;

      beforeEach(() => {
        jsonMockResponses = {
          'https://server-test-1/':
            '{"consentRequired": true, "purposeConsentRequired": ["abc", "bcd"]}',
          'https://server-test-2/': '{"consentRequired": true}',
          'https://server-test-3/':
            '{"consentRequired": true, "purposeConsentRequired": "verybad"}',
        };
        defaultConfig = {
          'consentInstanceId': 'abc',
        };
      });

      describe('purposeConsentRequired', () => {
        it('uses inline purposeConsentRequired', async () => {
          defaultConfig['purposeConsentRequired'] = ['zyx', 'yxw'];
          defaultConfig['consentRequired'] = true;
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          expect(await ampConsent.getPurposeConsentRequired_()).to.deep.equal(
            defaultConfig['purposeConsentRequired']
          );
        });

        it('uses purposeConsentRequired from remote if not inlined', async () => {
          defaultConfig['consentRequired'] = 'remote';
          defaultConfig['checkConsentHref'] = 'https://server-test-1/';
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          expect(await ampConsent.getPurposeConsentRequired_()).to.deep.equal([
            'abc',
            'bcd',
          ]);
        });

        it('returns null if no purposeConsentsRequired are found', async () => {
          defaultConfig['consentRequired'] = 'remote';
          defaultConfig['checkConsentHref'] = 'https://server-test-2/';
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          expect(await ampConsent.getPurposeConsentRequired_()).to.null;
        });

        it(
          'will only look at purposeConsentRequired if we have ' +
            'global consent (state or tcString)',
          async () => {
            defaultConfig['purposeConsentRequired'] = ['zyx', 'yxw'];
            defaultConfig['consentRequired'] = true;
            consentElement = createConsentElement(doc, defaultConfig);
            doc.body.appendChild(consentElement);
            ampConsent = new AmpConsent(consentElement);
            await ampConsent.buildCallback();
            env.sandbox
              .stub(ampConsent.consentStateManager_, 'getConsentInstanceInfo')
              .returns(Promise.resolve({}));
            const spy = env.sandbox.spy(
              ampConsent,
              'checkGranularConsentRequired_'
            );

            expect(await ampConsent.hasRequiredConsents_()).to.be.false;
            expect(spy).to.not.be.called;
          }
        );

        it('returns null if no purposeConsentsRequired are found', async () => {
          defaultConfig['consentRequired'] = 'remote';
          defaultConfig['checkConsentHref'] = 'https://server-test-2/';
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          expect(await ampConsent.getPurposeConsentRequired_()).to.be.null;
        });

        it('handles non-array purposeConsentsRequired', async () => {
          defaultConfig['purposeConsentRequired'] = 'BAD';
          defaultConfig['consentRequired'] = 'remote';
          defaultConfig['checkConsentHref'] = 'https://server-test-3/';
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();
          // Returned null so must've failed both inline and remote
          expect(await ampConsent.getPurposeConsentRequired_()).to.be.null;
        });
      });

      describe('promptUI', () => {
        let updateConsentInstancePurposeSpy;

        beforeEach(() => {
          defaultConfig['purposeConsentRequired'] = ['zyx', 'yxw'];
          defaultConfig['consentRequired'] = true;
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          env.sandbox.stub(ampConsent.vsync_, 'mutate').callsFake((fn) => {
            fn();
          });
          env.sandbox.stub(ampConsent, 'mutateElement').callsFake((fn) => {
            fn();
          });
        });

        it('generates default map from purposeConsentDefault', async () => {
          const mockInvocation = {args: {purposeConsentDefault: true}};
          await ampConsent.buildCallback();
          await macroTask();
          updateConsentInstancePurposeSpy = env.sandbox.spy(
            ampConsent.consentStateManager_,
            'updateConsentInstancePurposes'
          );
          ampConsent.handleClosingUiAction_(ACTION_TYPE.ACCEPT, mockInvocation);
          await macroTask();
          expect(updateConsentInstancePurposeSpy).to.be.calledWith(
            {
              'zyx': true,
              'yxw': true,
            },
            true
          );
          expect(ampConsent.isPromptUiOn_).to.be.false;
        });

        it('purposeConsentDefault handles empty and null purposeConsentRequired', async () => {
          const mockInvocation = {args: {purposeConsentDefault: true}};
          ampConsent.purposeConsentRequired_ = Promise.resolve();
          env.sandbox.stub(ampConsent, 'hide_').callsFake(() => {});
          await ampConsent.buildCallback();
          await macroTask();
          updateConsentInstancePurposeSpy = env.sandbox.spy(
            ampConsent.consentStateManager_,
            'updateConsentInstancePurposes'
          );

          ampConsent.handleClosingUiAction_(ACTION_TYPE.ACCEPT, mockInvocation);
          await macroTask();
          expect(updateConsentInstancePurposeSpy).to.not.be.called;
          // reset
          ampConsent.purposeConsentRequired_ = Promise.resolve([]);
          ampConsent.handleClosingUiAction_(ACTION_TYPE.REJECT, mockInvocation);
          await macroTask();
          expect(updateConsentInstancePurposeSpy).to.not.be.called;
        });

        it('ACTION_TYPE.SET_PURPOSE is accepted', async () => {
          const mockInvocation = {
            args: {'purpose-foo': true, 'purpose-bar': false},
          };
          await ampConsent.buildCallback();
          await macroTask();
          updateConsentInstancePurposeSpy = env.sandbox.spy(
            ampConsent.consentStateManager_,
            'updateConsentInstancePurposes'
          );

          ampConsent.handleSetPurpose_(mockInvocation);
          await macroTask();
          expect(updateConsentInstancePurposeSpy).to.be.calledWith(
            mockInvocation.args
          );
        });

        it('handles setPurpose with no args', async () => {
          const mockInvocation = {args: null};
          const devSpy = env.sandbox.spy(dev(), 'error');
          await ampConsent.buildCallback();
          await macroTask();
          updateConsentInstancePurposeSpy = env.sandbox.spy(
            ampConsent.consentStateManager_,
            'updateConsentInstancePurposes'
          );

          ampConsent.handleSetPurpose_(mockInvocation);
          await macroTask();
          expect(devSpy.args[0][1]).to.match(
            /Must have arugments for `setPurpose`./
          );
          expect(devSpy).to.be.calledOnce;
          expect(updateConsentInstancePurposeSpy).not.be.called;
        });
      });

      describe('server communication', () => {
        beforeEach(() => {
          jsonMockResponses = {
            'https://server-test-1/':
              '{"consentRequired": true, "consentStateValue": "accepted", "purposeConsentRequired": ["abc","xyz"]}',
          };
          defaultConfig = {
            'consentInstanceId': 'abc',
            'consentRequired': 'remote',
            'checkConsentHref': 'https://server-test-1/',
          };
        });

        it('checks global consent and then purpose consents', async () => {
          const localStorageSpy = env.sandbox.spy(storageMock, 'get');
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          const checkGranularConsentSpy = env.sandbox.spy(
            ampConsent,
            'checkGranularConsentRequired_'
          );
          await ampConsent.buildCallback();
          await macroTask();

          expect(localStorageSpy).to.be.calledBefore(checkGranularConsentSpy);
          expect(checkGranularConsentSpy).to.be.calledOnce;
        });

        it('returns true if all purpose consents are stored', async () => {
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 1,
              [STORAGE_KEY.PURPOSE_CONSENTS]: {
                'abc': 1,
                'hij': 1,
                'xyz': 0,
              },
            },
          };
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          const hasRequiredConsentsSpy = env.sandbox.spy(
            ampConsent,
            'hasRequiredConsents_'
          );
          await ampConsent.buildCallback();
          await macroTask();
          expect(await hasRequiredConsentsSpy.returnValues[0]).to.equal(true);
        });

        it('returns false if not all purpose consents are stored', async () => {
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 1,
              [STORAGE_KEY.PURPOSE_CONSENTS]: {
                'abc': 1,
                'hij': 1,
                'zzz': 0,
              },
            },
          };
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          const hasRequiredConsentsSpy = env.sandbox.spy(
            ampConsent,
            'hasRequiredConsents_'
          );
          await ampConsent.buildCallback();
          await macroTask();
          expect(await hasRequiredConsentsSpy.returnValues[0]).to.equal(false);
        });

        it('informs consent state manager if all purpose consents are collected', async () => {
          storageValue = {
            'amp-consent:abc': {
              [STORAGE_KEY.STATE]: 1,
              [STORAGE_KEY.PURPOSE_CONSENTS]: {
                'abc': 1,
                'hij': 1,
                'xyz': 0,
              },
            },
          };
          consentElement = createConsentElement(doc, defaultConfig);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
          const consentStateManagerSpy = env.sandbox.spy(
            ConsentStateManager.prototype,
            'hasAllPurposeConsents'
          );
          await ampConsent.buildCallback();
          await macroTask();
          // Once for remote sync, once for showing UI flow
          expect(consentStateManagerSpy).to.be.calledTwice;
        });

        it(
          'does not inform consent state manager if not all' +
            'purpose consents are collected',
          async () => {
            storageValue = {
              'amp-consent:abc': {
                [STORAGE_KEY.STATE]: 1,
                [STORAGE_KEY.PURPOSE_CONSENTS]: {
                  'abc': 1,
                  'hij': 1,
                },
              },
            };
            consentElement = createConsentElement(doc, defaultConfig);
            doc.body.appendChild(consentElement);
            ampConsent = new AmpConsent(consentElement);
            const consentStateManagerSpy = env.sandbox.spy(
              ConsentStateManager.prototype,
              'hasAllPurposeConsents'
            );
            await ampConsent.buildCallback();
            await macroTask();
            // Only once b/c of sync flow
            expect(consentStateManagerSpy).to.be.calledOnce;
          }
        );
      });
    });
  }
);

/**
 * Create an <amp-consent> element from config for testing
 * @param {Document} doc
 * @param {!JsonObject} config
 * @param {string=} opt_type
 * @return {Element}
 */
export function createConsentElement(doc, config, opt_type) {
  const consentElement = doc.createElement('amp-consent');
  consentElement.setAttribute('id', 'amp-consent');
  consentElement.setAttribute('layout', 'nodisplay');
  if (opt_type) {
    consentElement.setAttribute('type', opt_type);
  }
  const scriptElement = doc.createElement('script');
  scriptElement.setAttribute('type', 'application/json');
  scriptElement.textContent = JSON.stringify(config);
  consentElement.appendChild(scriptElement);
  return consentElement;
}

/**
 * Create an <amp-consent> element and return AmpConsent object.
 * @param {Document} doc
 * @param {!JsonObject} config
 * @param {string=} opt_type
 * @return {Element}
 */
export function getAmpConsent(doc, config) {
  const consentElement = createConsentElement(doc, config);
  doc.body.appendChild(consentElement);
  return new AmpConsent(consentElement);
}
