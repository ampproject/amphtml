import {CONSENT_STRING_TYPE} from '#core/constants/consent-state';

import {Services} from '#service';

import {dev} from '#utils/log';

import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {
  CONSENT_ITEM_STATE,
  PURPOSE_CONSENT_STATE,
  composeStoreValue,
  constructConsentInfo,
  constructMetadata,
} from '../consent-info';
import {ConsentInstance, ConsentStateManager} from '../consent-state-manager';

describes.realWin('ConsentStateManager', {amp: 1}, (env) => {
  let win;
  let ampdoc;
  let storageValue;
  let storageGetSpy;
  let storageSetSpy;
  let storageRemoveSpy;
  let usesViewer;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    storageValue = {};
    storageGetSpy = env.sandbox.spy();
    storageSetSpy = env.sandbox.spy();
    storageRemoveSpy = env.sandbox.spy();
    usesViewer = true;

    resetServiceForTesting(win, 'storage');
    registerServiceBuilder(win, 'storage', function () {
      return Promise.resolve({
        get: (name) => {
          storageGetSpy(name);
          return Promise.resolve(storageValue[name]);
        },
        setNonBoolean: (name, value) => {
          storageSetSpy(name, value);
          storageValue[name] = value;
          return Promise.resolve();
        },
        remove: (name) => {
          storageValue[name] = null;
          storageRemoveSpy(name);
          return Promise.resolve();
        },
        isViewerStorage: () => {
          return usesViewer;
        },
      });
    });
  });

  describe('Consent State Manager', () => {
    let manager;
    beforeEach(() => {
      manager = new ConsentStateManager(ampdoc);
    });

    // TODO (zhouyx@) Assert on multiple consent instance
    it('registerConsentInstance', () => {
      const consentReadyPromise = manager.whenConsentReady('test');
      manager.registerConsentInstance('test', {});
      return consentReadyPromise;
    });

    it('registerConsentInstance', () => {
      expectAsyncConsoleError(/Cannot register consent instance/);
      manager.registerConsentInstance('test', {});
      manager.registerConsentInstance('test1', {});
    });

    it('should not register consent instance twice', () => {
      expectAsyncConsoleError(/Cannot register consent instance/);
      manager.registerConsentInstance('test', {});
      manager.registerConsentInstance('test', {});
    });

    describe('update/get consentInfo', () => {
      it('get initial default consentInfo value', async () => {
        manager.registerConsentInstance('test', {});
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
      });

      it('update/get consent state', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.ACCEPTED);
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
        );
      });

      it('update/get consent string', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test-string'
        );
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test-string')
        );
      });

      it('update/get consentMetadata', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test-string',
          constructMetadata(CONSENT_STRING_TYPE.US_PRIVACY_STRING)
        );
        expect(await manager.getConsentInstanceInfo()).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test-string',
            constructMetadata(CONSENT_STRING_TYPE.US_PRIVACY_STRING)
          )
        );
      });

      it('update/get purpose consents', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstancePurposes({
          'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED,
        });
        manager.updateConsentInstanceState(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test-string'
        );
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test-string',
            undefined,
            {'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED}
          )
        );
      });

      it('getConsentInstanceInfo getLastConsentInstanceInfo', function* () {
        let currentValue;
        let lastValue;
        manager.registerConsentInstance('test', {});
        const testConsentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(),
          {'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED},
          true
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        yield manager.getConsentInstanceInfo().then((v) => (currentValue = v));
        yield manager.getLastConsentInstanceInfo().then((v) => (lastValue = v));
        expect(currentValue).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
        expect(lastValue).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata(),
            {'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED},
            true
          )
        );
      });
    });

    describe('onConsentStateChange', () => {
      let spy;

      beforeEach(() => {
        manager.registerConsentInstance('test', {});
        spy = env.sandbox.spy();
      });

      it('should call handler when consent state changes', () => {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledWith(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
      });

      it('should call handler when consent is ignored', () => {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(spy).to.be.calledWith(
          constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED)
        );
      });

      it('should call handler when register observable', function* () {
        manager.onConsentStateChange(spy);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
      });

      it('should call purpose consent resolver on update', () => {
        const resolverSpy = env.sandbox.spy(manager, 'hasAllPurposeConsents');
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.REJECTED);
        expect(resolverSpy).to.be.calledAfter(spy);
        expect(resolverSpy).to.be.calledOnce;
        resolverSpy.resetHistory();

        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(resolverSpy).to.be.calledAfter(spy);
        expect(resolverSpy).to.be.calledOnce;
      });

      it('handles race condition', function* () {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
        yield macroTask();
        // Called with updated state value REJECT instead of UNKNOWN
        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWith(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
      });
    });

    describe('updatePurposes', () => {
      it('updates purpose consents', () => {
        expect(manager.purposeConsents_).to.be.undefined;
        manager.updateConsentInstancePurposes({'a': true, 'b': false});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PURPOSE_CONSENT_STATE.ACCEPTED,
          'b': PURPOSE_CONSENT_STATE.REJECTED,
        });

        // new values
        manager.updateConsentInstancePurposes({'c': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PURPOSE_CONSENT_STATE.ACCEPTED,
          'b': PURPOSE_CONSENT_STATE.REJECTED,
          'c': PURPOSE_CONSENT_STATE.ACCEPTED,
        });

        // overrides
        manager.updateConsentInstancePurposes({'c': false, 'd': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PURPOSE_CONSENT_STATE.ACCEPTED,
          'b': PURPOSE_CONSENT_STATE.REJECTED,
          'c': PURPOSE_CONSENT_STATE.REJECTED,
          'd': PURPOSE_CONSENT_STATE.ACCEPTED,
        });
      });

      it('opt_defaultsOnly', () => {
        manager.updateConsentInstancePurposes({'a': true, 'b': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PURPOSE_CONSENT_STATE.ACCEPTED,
          'b': PURPOSE_CONSENT_STATE.ACCEPTED,
        });

        manager.updateConsentInstancePurposes(
          {'a': false, 'b': false, 'c': false},
          true
        );
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PURPOSE_CONSENT_STATE.ACCEPTED,
          'b': PURPOSE_CONSENT_STATE.ACCEPTED,
          'c': PURPOSE_CONSENT_STATE.REJECTED,
        });
      });
    });
  });

  describe('ConsentInstance', () => {
    let instance;

    beforeEach(() => {
      instance = new ConsentInstance(ampdoc, 'test', {});
    });

    it('instantiates storage with the top level document', async () => {
      const spy = env.sandbox.stub(Services, 'storageForTopLevelDoc');
      new ConsentInstance(ampdoc, 'test', {});
      expect(spy.calledOnceWith(ampdoc)).to.be.true;
    });

    describe('update', () => {
      describe('update value', () => {
        it('invalid consent state', function* () {
          instance.update(-1);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;

          instance.update(-1, 'test');
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
        });

        it('single consent state value', function* () {
          instance.update(CONSENT_ITEM_STATE.UNKNOWN);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(CONSENT_ITEM_STATE.DISMISSED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(CONSENT_ITEM_STATE.NOT_REQUIRED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(CONSENT_ITEM_STATE.ACCEPTED);
          yield macroTask();

          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED))
          );
          expect(storageSetSpy).to.be.calledOnce;
          storageSetSpy.resetHistory();
          instance.update(CONSENT_ITEM_STATE.REJECTED);
          yield macroTask();
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(constructConsentInfo(CONSENT_ITEM_STATE.REJECTED))
          );
        });

        it('update consent info with consentString and metadata', function* () {
          instance.update(
            CONSENT_ITEM_STATE.ACCEPTED,
            'accept',
            undefined,
            constructMetadata(
              CONSENT_STRING_TYPE.US_PRIVACY_STRING,
              '1~1.35.41.101'
            )
          );
          yield macroTask();
          let consentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'accept',
            constructMetadata(
              CONSENT_STRING_TYPE.US_PRIVACY_STRING,
              '1~1.35.41.101'
            )
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
          storageSetSpy.resetHistory();

          instance.update(
            CONSENT_ITEM_STATE.REJECTED,
            'reject',
            undefined,
            constructMetadata(CONSENT_STRING_TYPE.TCF_V1, '3~3.33.33.303')
          );
          yield macroTask();
          consentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.REJECTED,
            'reject',
            constructMetadata(CONSENT_STRING_TYPE.TCF_V1, '3~3.33.33.303')
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );

          instance.update(CONSENT_ITEM_STATE.DISMISS);
          yield macroTask();
          storageSetSpy.resetHistory();
          storageRemoveSpy.resetHistory();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.not.be.called;

          instance.update(
            CONSENT_ITEM_STATE.UNKNOWN,
            'test',
            undefined,
            constructMetadata(CONSENT_STRING_TYPE.TCF_V2)
          );
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.be.calledOnce;
        });

        it('update consent info w/ purpose consents', async () => {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'accept', {
            'purpose-abc': PURPOSE_CONSENT_STATE.REJECTED,
          });
          await macroTask();
          let consentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'accept',
            undefined,
            {'purpose-abc': PURPOSE_CONSENT_STATE.REJECTED}
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
          storageSetSpy.resetHistory();

          instance.update(CONSENT_ITEM_STATE.REJECTED, 'reject', {
            'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED,
          });
          await macroTask();
          consentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.REJECTED,
            'reject',
            undefined,
            {'purpose-abc': PURPOSE_CONSENT_STATE.ACCEPTED}
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );

          instance.update(CONSENT_ITEM_STATE.DISMISS);
          await macroTask();
          storageSetSpy.resetHistory();
          storageRemoveSpy.resetHistory();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.not.be.called;

          instance.update(CONSENT_ITEM_STATE.UNKNOWN, 'test', {
            'purpose-xyz': PURPOSE_CONSENT_STATE.ACCEPTED,
          });
          await macroTask();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.be.calledOnce;
        });
      });

      describe('should override stored value correctly', () => {
        it('other state cannot override accept/reject', function* () {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED);
          yield macroTask();
          storageSetSpy.resetHistory();
          instance.update(CONSENT_ITEM_STATE.UNKNOWN);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(CONSENT_ITEM_STATE.DISMISSED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(CONSENT_ITEM_STATE.NOT_REQUIRED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
        });

        it('undefined consent string', function* () {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old', {});
          yield macroTask();
          storageSetSpy.resetHistory();
          instance.update(CONSENT_ITEM_STATE.REJECTED);
          yield macroTask();
          const consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.REJECTED);
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
        });

        it('new consent string and consent type override old ones', function* () {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old');
          yield macroTask();
          storageSetSpy.resetHistory();
          // override old value
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'new');
          yield macroTask();
          let consentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'new'
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
          // empty consent string erase old value
          storageSetSpy.resetHistory();
          yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, '');
          consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED);
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
        });
      });

      it('should not write localStorage with same value', function* () {
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          {'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED},
          constructMetadata(CONSENT_STRING_TYPE.TCF_V2)
        );
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
        instance.update(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          {'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED},
          constructMetadata(CONSENT_STRING_TYPE.TCF_V2)
        );
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
      });

      it('should handle race condition store latest value', function* () {
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-consent:test',
          composeStoreValue(constructConsentInfo(CONSENT_ITEM_STATE.REJECTED))
        );
      });
    });

    describe('update request', () => {
      let requestBody;
      let requestSpy;
      beforeEach(() => {
        requestSpy = env.sandbox.spy();
        resetServiceForTesting(win, 'xhr');
        registerServiceBuilder(win, 'xhr', function () {
          return {
            fetchJson: (url, init) => {
              requestSpy(url);
              requestBody = init.body;
              expect(init.credentials).to.equal('include');
              expect(init.method).to.equal('POST');
            },
          };
        });
        instance = new ConsentInstance(ampdoc, 'test', {
          'onUpdateHref': '//updateHref',
        });
      });

      it('send update request on reject/accept', function* () {
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentInstanceId).to.equal('test');
        expect(requestBody.consentState).to.equal(true);
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.be.undefined;
        yield instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentState).to.equal(false);
        expect(requestBody.consentStateValue).to.equal('rejected');
        expect(requestBody.consentString).to.be.undefined;
        expect(requestBody.consentMetadata).to.be.undefined;
        expect(requestBody.purposeConsents).to.be.undefined;
      });

      it('send update request on consentString change', async () => {
        await instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old');
        await macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.equal('old');
        expect(requestBody.consentMetadata).to.be.undefined;
        await instance.update(
          CONSENT_ITEM_STATE.ACCEPTED,
          'new',
          {'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED},
          constructMetadata(
            CONSENT_STRING_TYPE.US_PRIVACY_STRING,
            '3~3.33.33.303'
          ),
          undefined,
          4
        );
        await macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.equal('new');
        expect(requestBody.purposeConsents).to.deep.equal({
          'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED,
        });
        expect(requestBody.consentMetadata).to.deep.equal(
          constructMetadata(
            CONSENT_STRING_TYPE.US_PRIVACY_STRING,
            '3~3.33.33.303'
          )
        );
        expect(requestBody.tcfPolicyVersion).to.equal(4);
      });

      it('support onUpdateHref expansion', function* () {
        instance = new ConsentInstance(ampdoc, 'test', {
          'onUpdateHref': 'https://example.test?cid=CLIENT_ID&r=RANDOM',
        });
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.be.calledWithMatch(/cid=amp-.{22}&r=RANDOM/);
      });

      it('do not send update request on dismiss/notRequied', function* () {
        instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(CONSENT_ITEM_STATE.NOT_REQUIRED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
      });

      it('do not send update request when no change', function* () {
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'abc');
        yield macroTask();
        expect(requestSpy).to.calledOnce;
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'abc');
        yield macroTask();
        expect(requestSpy).to.calledOnce;
      });

      it('send update request on local storage state change', function* () {
        storageValue['amp-consent:test'] = true;
        instance.get();
        yield macroTask();
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentState).to.equal(false);
        expect(requestBody.consentStateValue).to.equal('rejected');
        expect(requestBody.consentString).to.undefined;
      });

      it('send update request on local storage removal', async () => {
        const testConsentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(undefined, '3~3.33.33.303'),
          {'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED},
          true
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        await instance.get();
        expect(storageRemoveSpy).to.be.calledOnce;
        await macroTask();
        await macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentStateValue).to.equal('unknown');
        expect(requestBody.consentString).to.be.undefined;
        expect(requestBody.purposeConsents).to.be.undefined;
        expect(requestBody.consentMetadata).to.be.undefined;
      });

      it('do not send update request with dirtyBit', async () => {
        instance.setDirtyBit();
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        await macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        await macroTask();
        expect(requestSpy).to.not.be.called;
      });
    });

    describe('get', () => {
      describe('should be able to read from stored value', () => {
        it('legacy boolean value', async () => {
          await instance.get().then((value) => {
            expect(value).to.deep.equal(
              constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
            );
          });
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = true;
          let value = await instance.get();
          expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
          );
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = false;
          value = await instance.get();
          expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
          );
        });

        it('consentInfo value', async () => {
          instance.localConsentInfo_ = null;
          const testConsentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata(),
            {'purpose-a': PURPOSE_CONSENT_STATE.ACCEPTED}
          );
          storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
          expect(await instance.get()).to.deep.equal(testConsentInfo);
        });

        it('unsupported stored value', async () => {
          expectAsyncConsoleError(/Invalid stored consent value/);
          storageValue['amp-consent:test'] = 'invalid';
          expect(await instance.get()).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
          );
        });

        it('erase stored value with dirtyBit', async () => {
          instance.localConsentInfo_ = null;
          const testConsentInfo = constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata(),
            undefined,
            true
          );
          storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
          let value = await instance.get();
          expect(value).to.deep.equal(testConsentInfo);
          expect(storageValue['amp-consent:test']).to.be.null;
          expect(storageRemoveSpy).to.be.calledOnce;
          value = await instance.get();
          expect(value).to.deep.equal(testConsentInfo);
          expect(storageRemoveSpy).to.be.calledOnce;
        });
      });

      it('should be able to get local value', async () => {
        let value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
        await instance.update(CONSENT_ITEM_STATE.DISMISSED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
        await instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
        );
        await instance.update(CONSENT_ITEM_STATE.REJECTED, 'test1');
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED, 'test1')
        );
        await instance.update(CONSENT_ITEM_STATE.DISMISSED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED, 'test1')
        );
        await instance.update(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test2',
          {'purpose-b': PURPOSE_CONSENT_STATE.REJECTED},
          constructMetadata()
        );
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test2',
            constructMetadata(),
            {'purpose-b': PURPOSE_CONSENT_STATE.REJECTED}
          )
        );
        await instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
        );
      });

      it('should return unknown value with error', () => {
        storageGetSpy = () => {
          const e = new Error('intentional');
          throw e;
        };
        env.sandbox.stub(dev(), 'error');
        storageValue['amp-consent:test'] = true;
        return instance.get().then((value) => {
          expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
          );
        });
      });

      it('should handle race condition return latest value', function* () {
        let value1, value2;
        storageValue['amp-consent:test'] = true;
        instance.get().then((v) => (value1 = v));
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        instance.get().then((v) => (value2 = v));
        yield macroTask();
        expect(value1).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
        expect(value2).to.deep.equal(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
      });
    });

    describe('dirtyBit storage value', () => {
      it('remove dirtyBit after user update', async () => {
        const testConsentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(),
          undefined,
          true
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        let v = await instance.get();
        expect(v).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata(),
            undefined,
            true
          )
        );

        instance.update(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          undefined,
          constructMetadata()
        );
        await macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-consent:test',
          composeStoreValue(
            constructConsentInfo(
              CONSENT_ITEM_STATE.ACCEPTED,
              'test',
              constructMetadata()
            )
          )
        );
        v = await instance.get();
        expect(v).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata()
          )
        );
      });

      it('refresh stored consent info when setting dirtyBit', async () => {
        const testConsentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(),
          undefined
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        instance.setDirtyBit();
        await macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-consent:test',
          composeStoreValue(
            constructConsentInfo(
              CONSENT_ITEM_STATE.ACCEPTED,
              'test',
              constructMetadata(),
              undefined,
              true
            )
          )
        );
        expect(await instance.get()).to.deep.equal(
          constructConsentInfo(
            CONSENT_ITEM_STATE.ACCEPTED,
            'test',
            constructMetadata()
          )
        );
      });
    });
  });
});
