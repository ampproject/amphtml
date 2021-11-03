import {
  ConsentItemState_Enum,
  PurposeConsentState_Enum,
  composeStoreValue,
  constructConsentInfo,
  constructMetadata,
} from '../consent-info';
import {ConsentStringType_Enum} from '#core/constants/consent-state';
import {ConsentInstance, ConsentStateManager} from '../consent-state-manager';
import {Services} from '#service';
import {dev} from '#utils/log';
import {macroTask} from '#testing/helpers';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';

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
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
      });

      it('update/get consent state', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(ConsentItemState_Enum.ACCEPTED);
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
        );
      });

      it('update/get consent string', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(
          ConsentItemState_Enum.ACCEPTED,
          'test-string'
        );
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'test-string')
        );
      });

      it('update/get consentMetadata', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(
          ConsentItemState_Enum.ACCEPTED,
          'test-string',
          constructMetadata(ConsentStringType_Enum.US_PRIVACY_STRING)
        );
        expect(await manager.getConsentInstanceInfo()).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test-string',
            constructMetadata(ConsentStringType_Enum.US_PRIVACY_STRING)
          )
        );
      });

      it('update/get purpose consents', async () => {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstancePurposes({
          'purpose-abc': PurposeConsentState_Enum.ACCEPTED,
        });
        manager.updateConsentInstanceState(
          ConsentItemState_Enum.ACCEPTED,
          'test-string'
        );
        const value = await manager.getConsentInstanceInfo();
        expect(value).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test-string',
            undefined,
            {'purpose-abc': PurposeConsentState_Enum.ACCEPTED}
          )
        );
      });

      it('getConsentInstanceInfo getLastConsentInstanceInfo', function* () {
        let currentValue;
        let lastValue;
        manager.registerConsentInstance('test', {});
        const testConsentInfo = constructConsentInfo(
          ConsentItemState_Enum.ACCEPTED,
          'test',
          constructMetadata(),
          {'purpose-abc': PurposeConsentState_Enum.ACCEPTED},
          true
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        yield manager.getConsentInstanceInfo().then((v) => (currentValue = v));
        yield manager.getLastConsentInstanceInfo().then((v) => (lastValue = v));
        expect(currentValue).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
        expect(lastValue).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test',
            constructMetadata(),
            {'purpose-abc': PurposeConsentState_Enum.ACCEPTED},
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
        manager.updateConsentInstanceState(ConsentItemState_Enum.REJECTED);
        expect(spy).to.be.calledWith(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
      });

      it('should call handler when consent is ignored', () => {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(ConsentItemState_Enum.NOT_REQUIRED);
        expect(spy).to.be.calledWith(
          constructConsentInfo(ConsentItemState_Enum.NOT_REQUIRED)
        );
      });

      it('should call handler when register observable', function* () {
        manager.onConsentStateChange(spy);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
      });

      it('should call purpose consent resolver on update', () => {
        const resolverSpy = env.sandbox.spy(manager, 'hasAllPurposeConsents');
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(ConsentItemState_Enum.REJECTED);
        expect(resolverSpy).to.be.calledAfter(spy);
        expect(resolverSpy).to.be.calledOnce;
        resolverSpy.resetHistory();

        manager.updateConsentInstanceState(ConsentItemState_Enum.NOT_REQUIRED);
        expect(resolverSpy).to.be.calledAfter(spy);
        expect(resolverSpy).to.be.calledOnce;
      });

      it('handles race condition', function* () {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(ConsentItemState_Enum.REJECTED);
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
        yield macroTask();
        // Called with updated state value REJECT instead of UNKNOWN
        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWith(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
      });
    });

    describe('updatePurposes', () => {
      it('updates purpose consents', () => {
        expect(manager.purposeConsents_).to.be.undefined;
        manager.updateConsentInstancePurposes({'a': true, 'b': false});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PurposeConsentState_Enum.ACCEPTED,
          'b': PurposeConsentState_Enum.REJECTED,
        });

        // new values
        manager.updateConsentInstancePurposes({'c': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PurposeConsentState_Enum.ACCEPTED,
          'b': PurposeConsentState_Enum.REJECTED,
          'c': PurposeConsentState_Enum.ACCEPTED,
        });

        // overrides
        manager.updateConsentInstancePurposes({'c': false, 'd': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PurposeConsentState_Enum.ACCEPTED,
          'b': PurposeConsentState_Enum.REJECTED,
          'c': PurposeConsentState_Enum.REJECTED,
          'd': PurposeConsentState_Enum.ACCEPTED,
        });
      });

      it('opt_defaultsOnly', () => {
        manager.updateConsentInstancePurposes({'a': true, 'b': true});
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PurposeConsentState_Enum.ACCEPTED,
          'b': PurposeConsentState_Enum.ACCEPTED,
        });

        manager.updateConsentInstancePurposes(
          {'a': false, 'b': false, 'c': false},
          true
        );
        expect(manager.purposeConsents_).to.deep.equal({
          'a': PurposeConsentState_Enum.ACCEPTED,
          'b': PurposeConsentState_Enum.ACCEPTED,
          'c': PurposeConsentState_Enum.REJECTED,
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
          instance.update(ConsentItemState_Enum.UNKNOWN);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(ConsentItemState_Enum.DISMISSED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(ConsentItemState_Enum.NOT_REQUIRED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(ConsentItemState_Enum.ACCEPTED);
          yield macroTask();

          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(
              constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
            )
          );
          expect(storageSetSpy).to.be.calledOnce;
          storageSetSpy.resetHistory();
          instance.update(ConsentItemState_Enum.REJECTED);
          yield macroTask();
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(
              constructConsentInfo(ConsentItemState_Enum.REJECTED)
            )
          );
        });

        it('update consent info with consentString and metadata', function* () {
          instance.update(
            ConsentItemState_Enum.ACCEPTED,
            'accept',
            undefined,
            constructMetadata(
              ConsentStringType_Enum.US_PRIVACY_STRING,
              '1~1.35.41.101'
            )
          );
          yield macroTask();
          let consentInfo = constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'accept',
            constructMetadata(
              ConsentStringType_Enum.US_PRIVACY_STRING,
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
            ConsentItemState_Enum.REJECTED,
            'reject',
            undefined,
            constructMetadata(ConsentStringType_Enum.TCF_V1, '3~3.33.33.303')
          );
          yield macroTask();
          consentInfo = constructConsentInfo(
            ConsentItemState_Enum.REJECTED,
            'reject',
            constructMetadata(ConsentStringType_Enum.TCF_V1, '3~3.33.33.303')
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );

          instance.update(ConsentItemState_Enum.DISMISS);
          yield macroTask();
          storageSetSpy.resetHistory();
          storageRemoveSpy.resetHistory();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.not.be.called;

          instance.update(
            ConsentItemState_Enum.UNKNOWN,
            'test',
            undefined,
            constructMetadata(ConsentStringType_Enum.TCF_V2)
          );
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.be.calledOnce;
        });

        it('update consent info w/ purpose consents', async () => {
          instance.update(ConsentItemState_Enum.ACCEPTED, 'accept', {
            'purpose-abc': PurposeConsentState_Enum.REJECTED,
          });
          await macroTask();
          let consentInfo = constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'accept',
            undefined,
            {'purpose-abc': PurposeConsentState_Enum.REJECTED}
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
          storageSetSpy.resetHistory();

          instance.update(ConsentItemState_Enum.REJECTED, 'reject', {
            'purpose-abc': PurposeConsentState_Enum.ACCEPTED,
          });
          await macroTask();
          consentInfo = constructConsentInfo(
            ConsentItemState_Enum.REJECTED,
            'reject',
            undefined,
            {'purpose-abc': PurposeConsentState_Enum.ACCEPTED}
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );

          instance.update(ConsentItemState_Enum.DISMISS);
          await macroTask();
          storageSetSpy.resetHistory();
          storageRemoveSpy.resetHistory();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.not.be.called;

          instance.update(ConsentItemState_Enum.UNKNOWN, 'test', {
            'purpose-xyz': PurposeConsentState_Enum.ACCEPTED,
          });
          await macroTask();
          expect(storageSetSpy).to.not.be.called;
          expect(storageRemoveSpy).to.be.calledOnce;
        });
      });

      describe('should override stored value correctly', () => {
        it('other state cannot override accept/reject', function* () {
          instance.update(ConsentItemState_Enum.ACCEPTED);
          yield macroTask();
          storageSetSpy.resetHistory();
          instance.update(ConsentItemState_Enum.UNKNOWN);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(ConsentItemState_Enum.DISMISSED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
          instance.update(ConsentItemState_Enum.NOT_REQUIRED);
          yield macroTask();
          expect(storageSetSpy).to.not.be.called;
        });

        it('undefined consent string', function* () {
          instance.update(ConsentItemState_Enum.ACCEPTED, 'old', {});
          yield macroTask();
          storageSetSpy.resetHistory();
          instance.update(ConsentItemState_Enum.REJECTED);
          yield macroTask();
          const consentInfo = constructConsentInfo(
            ConsentItemState_Enum.REJECTED
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
        });

        it('new consent string and consent type override old ones', function* () {
          instance.update(ConsentItemState_Enum.ACCEPTED, 'old');
          yield macroTask();
          storageSetSpy.resetHistory();
          // override old value
          instance.update(ConsentItemState_Enum.ACCEPTED, 'new');
          yield macroTask();
          let consentInfo = constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'new'
          );
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
          // empty consent string erase old value
          storageSetSpy.resetHistory();
          yield instance.update(ConsentItemState_Enum.ACCEPTED, '');
          consentInfo = constructConsentInfo(ConsentItemState_Enum.ACCEPTED);
          expect(storageSetSpy).to.be.calledWith(
            'amp-consent:test',
            composeStoreValue(consentInfo)
          );
        });
      });

      it('should not write localStorage with same value', function* () {
        instance.update(ConsentItemState_Enum.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(ConsentItemState_Enum.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(
          ConsentItemState_Enum.ACCEPTED,
          'test',
          {'purpose-a': PurposeConsentState_Enum.ACCEPTED},
          constructMetadata(ConsentStringType_Enum.TCF_V2)
        );
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
        instance.update(
          ConsentItemState_Enum.ACCEPTED,
          'test',
          {'purpose-a': PurposeConsentState_Enum.ACCEPTED},
          constructMetadata(ConsentStringType_Enum.TCF_V2)
        );
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
      });

      it('should handle race condition store latest value', function* () {
        instance.update(ConsentItemState_Enum.ACCEPTED);
        instance.update(ConsentItemState_Enum.REJECTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-consent:test',
          composeStoreValue(
            constructConsentInfo(ConsentItemState_Enum.REJECTED)
          )
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
        yield instance.update(ConsentItemState_Enum.ACCEPTED);
        yield macroTask();
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentInstanceId).to.equal('test');
        expect(requestBody.consentState).to.equal(true);
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.be.undefined;
        yield instance.update(ConsentItemState_Enum.REJECTED);
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
        await instance.update(ConsentItemState_Enum.ACCEPTED, 'old');
        await macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.equal('old');
        expect(requestBody.consentMetadata).to.be.undefined;
        await instance.update(
          ConsentItemState_Enum.ACCEPTED,
          'new',
          {'purpose-a': PurposeConsentState_Enum.ACCEPTED},
          constructMetadata(
            ConsentStringType_Enum.US_PRIVACY_STRING,
            '3~3.33.33.303'
          )
        );
        await macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentStateValue).to.equal('accepted');
        expect(requestBody.consentString).to.equal('new');
        expect(requestBody.purposeConsents).to.deep.equal({
          'purpose-a': PurposeConsentState_Enum.ACCEPTED,
        });
        expect(requestBody.consentMetadata).to.deep.equal(
          constructMetadata(
            ConsentStringType_Enum.US_PRIVACY_STRING,
            '3~3.33.33.303'
          )
        );
      });

      it('support onUpdateHref expansion', function* () {
        instance = new ConsentInstance(ampdoc, 'test', {
          'onUpdateHref': 'https://example.test?cid=CLIENT_ID&r=RANDOM',
        });
        yield instance.update(ConsentItemState_Enum.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.be.calledWithMatch(/cid=amp-.{22}&r=RANDOM/);
      });

      it('do not send update request on dismiss/notRequied', function* () {
        instance.update(ConsentItemState_Enum.DISMISSED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(ConsentItemState_Enum.NOT_REQUIRED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
      });

      it('do not send update request when no change', function* () {
        yield instance.update(ConsentItemState_Enum.ACCEPTED, 'abc');
        yield macroTask();
        expect(requestSpy).to.calledOnce;
        yield instance.update(ConsentItemState_Enum.ACCEPTED, 'abc');
        yield macroTask();
        expect(requestSpy).to.calledOnce;
      });

      it('send update request on local storage state change', function* () {
        storageValue['amp-consent:test'] = true;
        instance.get();
        yield macroTask();
        instance.update(ConsentItemState_Enum.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(ConsentItemState_Enum.REJECTED);
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentState).to.equal(false);
        expect(requestBody.consentStateValue).to.equal('rejected');
        expect(requestBody.consentString).to.undefined;
      });

      it('send update request on local stroage removal', async () => {
        const testConsentInfo = constructConsentInfo(
          ConsentItemState_Enum.ACCEPTED,
          'test',
          constructMetadata(undefined, '3~3.33.33.303'),
          {'purpose-a': PurposeConsentState_Enum.ACCEPTED},
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
        instance.update(ConsentItemState_Enum.ACCEPTED);
        await macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(ConsentItemState_Enum.REJECTED);
        await macroTask();
        expect(requestSpy).to.not.be.called;
      });
    });

    describe('get', () => {
      describe('should be able to read from stored value', () => {
        it('legacy boolean value', async () => {
          await instance.get().then((value) => {
            expect(value).to.deep.equal(
              constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
            );
          });
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = true;
          let value = await instance.get();
          expect(value).to.deep.equal(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
          );
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = false;
          value = await instance.get();
          expect(value).to.deep.equal(
            constructConsentInfo(ConsentItemState_Enum.REJECTED)
          );
        });

        it('consentInfo value', async () => {
          instance.localConsentInfo_ = null;
          const testConsentInfo = constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test',
            constructMetadata(),
            {'purpose-a': PurposeConsentState_Enum.ACCEPTED}
          );
          storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
          expect(await instance.get()).to.deep.equal(testConsentInfo);
        });

        it('unsupported stored value', async () => {
          expectAsyncConsoleError(/Invalid stored consent value/);
          storageValue['amp-consent:test'] = 'invalid';
          expect(await instance.get()).to.deep.equal(
            constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
          );
        });

        it('erase stored value with dirtyBit', async () => {
          instance.localConsentInfo_ = null;
          const testConsentInfo = constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
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
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
        await instance.update(ConsentItemState_Enum.DISMISSED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
        await instance.update(ConsentItemState_Enum.ACCEPTED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
        );
        await instance.update(ConsentItemState_Enum.REJECTED, 'test1');
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.REJECTED, 'test1')
        );
        await instance.update(ConsentItemState_Enum.DISMISSED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.REJECTED, 'test1')
        );
        await instance.update(
          ConsentItemState_Enum.ACCEPTED,
          'test2',
          {'purpose-b': PurposeConsentState_Enum.REJECTED},
          constructMetadata()
        );
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test2',
            constructMetadata(),
            {'purpose-b': PurposeConsentState_Enum.REJECTED}
          )
        );
        await instance.update(ConsentItemState_Enum.ACCEPTED);
        value = await instance.get();
        expect(value).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
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
            constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
          );
        });
      });

      it('should handle race condition return latest value', function* () {
        let value1, value2;
        storageValue['amp-consent:test'] = true;
        instance.get().then((v) => (value1 = v));
        instance.update(ConsentItemState_Enum.REJECTED);
        instance.get().then((v) => (value2 = v));
        yield macroTask();
        expect(value1).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
        expect(value2).to.deep.equal(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
      });
    });

    describe('dirtyBit storage value', () => {
      it('remove dirtyBit after user update', async () => {
        const testConsentInfo = constructConsentInfo(
          ConsentItemState_Enum.ACCEPTED,
          'test',
          constructMetadata(),
          undefined,
          true
        );
        storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
        let v = await instance.get();
        expect(v).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test',
            constructMetadata(),
            undefined,
            true
          )
        );

        instance.update(
          ConsentItemState_Enum.ACCEPTED,
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
              ConsentItemState_Enum.ACCEPTED,
              'test',
              constructMetadata()
            )
          )
        );
        v = await instance.get();
        expect(v).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test',
            constructMetadata()
          )
        );
      });

      it('refresh stored consent info when setting dirtyBit', async () => {
        const testConsentInfo = constructConsentInfo(
          ConsentItemState_Enum.ACCEPTED,
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
              ConsentItemState_Enum.ACCEPTED,
              'test',
              constructMetadata(),
              undefined,
              true
            )
          )
        );
        expect(await instance.get()).to.deep.equal(
          constructConsentInfo(
            ConsentItemState_Enum.ACCEPTED,
            'test',
            constructMetadata()
          )
        );
      });
    });
  });
});
