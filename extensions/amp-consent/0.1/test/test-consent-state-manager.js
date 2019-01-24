/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {
  CONSENT_ITEM_STATE,
  composeStoreValue,
  constructConsentInfo,
} from '../consent-info';
import {
  ConsentInstance,
  ConsentStateManager,
} from '../consent-state-manager';
import {dev} from '../../../../src/log';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';



describes.realWin('ConsentStateManager', {amp: 1}, env => {
  let win;
  let ampdoc;
  let storageValue;
  let storageGetSpy;
  let storageSetSpy;
  let storageRemoveSpy;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    storageValue = {};
    storageGetSpy = sandbox.spy();
    storageSetSpy = sandbox.spy();
    storageRemoveSpy = sandbox.spy();

    resetServiceForTesting(win, 'storage');
    registerServiceBuilder(win, 'storage', function() {
      return Promise.resolve({
        get: name => {
          storageGetSpy(name);
          return Promise.resolve(storageValue[name]);
        },
        setNonBoolean: (name, value) => {
          storageSetSpy(name, value);
          storageValue[name] = value;
          return Promise.resolve();
        },
        remove: name => {
          storageRemoveSpy(name);
          return Promise.resolve();
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
      it('get initial default consentInfo value', function* () {
        manager.registerConsentInstance('test', {});
        let value;
        const p = manager.getConsentInstanceInfo().then(v => value = v);
        yield p;
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
      });

      it('update/get consent state', function* () {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.ACCEPTED);
        let value;
        const p = manager.getConsentInstanceInfo().then(v => value = v);
        yield p;
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED));
      });

      it('update/get consent string', function* () {
        manager.registerConsentInstance('test', {});
        manager.updateConsentInstanceState(
            CONSENT_ITEM_STATE.ACCEPTED, 'test-string');
        let value;
        const p = manager.getConsentInstanceInfo().then(v => value = v);
        yield p;
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test-string'));
      });

      it('update consent string that exceeds max size', function* () {
        expectAsyncConsoleError(/Cannot store consentString/);
        manager.registerConsentInstance('test', {});
        const MAX_LENGTH = 150;
        let testStr = 'a';
        for (let i = 0; i < MAX_LENGTH; i++) {
          testStr += 'a';
        }
        manager.updateConsentInstanceState(
            CONSENT_ITEM_STATE.ACCEPTED, testStr);
        let value;
        const p = manager.getConsentInstanceInfo().then(v => value = v);
        yield p;
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, testStr));
      });
    });

    describe('onConsentStateChange', () => {
      let spy;

      beforeEach(() => {
        manager.registerConsentInstance('test', {});
        spy = sandbox.spy();
      });

      it('should call handler when consent state changes', () => {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledWith(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
      });

      it('should call handler when consent is ignored', () => {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(
            CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(spy).to.be.calledWith(
            constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED));
      });

      it('should call handler when register observable', function*() {
        manager.onConsentStateChange(spy);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
      });

      it('handles race condition', function* () {
        manager.onConsentStateChange(spy);
        manager.updateConsentInstanceState(CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
        yield macroTask();
        // Called with updated state value REJECT instead of UNKNOWN
        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWith(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
      });
    });
  });

  describe('ConsentInstance', () => {
    let instance;

    beforeEach(() => {
      instance = new ConsentInstance(ampdoc, 'test', {});
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
          expect(storageSetSpy).to.be.calledOnce;

          // legacy boolean consent state value
          expect(storageSetSpy).to.be.calledWith('amp-consent:test', true);
          storageSetSpy.resetHistory();
          instance.update(CONSENT_ITEM_STATE.REJECTED);
          yield macroTask();
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith('amp-consent:test', false);
        });

        it('update consent info with consent string', function* () {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'accept');
          yield macroTask();
          let consentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'accept');
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
              'amp-consent:test', composeStoreValue(consentInfo));
          storageSetSpy.resetHistory();

          instance.update(CONSENT_ITEM_STATE.REJECTED, 'reject');
          yield macroTask();
          consentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.REJECTED, 'reject');
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
              'amp-consent:test', composeStoreValue(consentInfo));
        });

        it('remove consetninfo when consentStr length exceeds', function* () {
          expectAsyncConsoleError(/Cannot store consentString/);
          const MAX_LENGTH = 150;
          let testStr = 'a';
          for (let i = 0; i < MAX_LENGTH; i++) {
            testStr += 'a';
          }
          instance.update(
              CONSENT_ITEM_STATE.ACCEPTED, testStr);
          yield macroTask();
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
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old');
          yield macroTask();
          storageSetSpy.resetHistory();
          instance.update(CONSENT_ITEM_STATE.REJECTED);
          yield macroTask();
          const consentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.REJECTED);
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
              'amp-consent:test', composeStoreValue(consentInfo));
        });

        it('new consent string override old one', function* () {
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old');
          yield macroTask();
          storageSetSpy.resetHistory();
          // override old value
          instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'new');
          yield macroTask();
          let consentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'new');
          expect(storageSetSpy).to.be.calledOnce;
          expect(storageSetSpy).to.be.calledWith(
              'amp-consent:test', composeStoreValue(consentInfo));
          // empty consent string erase old value
          storageSetSpy.resetHistory();
          yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, '');
          consentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED);
          expect(storageSetSpy).to.be.calledWith(
              'amp-consent:test', composeStoreValue(consentInfo));
        });
      });

      it('should not write localStorage with same value', function* () {
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'test');
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
        instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'test');
        yield macroTask();
        expect(storageSetSpy).to.be.calledTwice;
      });

      it('should handle race condition store latest value', function* () {
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith('amp-consent:test', false);
      });
    });

    describe('update request', () => {
      let requestBody;
      let requestSpy;
      beforeEach(() => {
        requestSpy = sandbox.spy();
        resetServiceForTesting(win, 'xhr');
        registerServiceBuilder(win, 'xhr', function() {
          return {fetchJson: (url, init) => {
            requestSpy(url);
            requestBody = init.body;
            expect(init.credentials).to.equal('include');
            expect(init.method).to.equal('POST');
          }};
        });

        instance = new ConsentInstance(ampdoc, 'test', {
          'onUpdateHref': '//updateHref',
        });
      });

      it('send update request on reject/accept', function* () {
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentInstanceId).to.equal('test');
        expect(requestBody.consentState).to.equal(true);
        expect(requestBody.consentString).to.be.undefined;
        yield instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentState).to.equal(false);
        expect(requestBody.consentString).to.be.undefined;
      });

      it('send update request on consentString change', function* () {
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'old');
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentString).to.equal('old');
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'new');
        yield macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestBody.consentState).to.be.true;
        expect(requestBody.consentString).to.equal('new');
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
      });
    });

    describe('get', () => {
      describe('should be able to read from stored value', () => {
        it('legacy boolean value', function* () {
          yield instance.get().then(value => {
            expect(value).to.deep.equal(
                constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
          });
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = true;
          yield instance.get().then(value => {
            expect(value).to.deep.equal(
                constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED));
          });
          instance.localConsentInfo_ = null;
          storageValue['amp-consent:test'] = false;
          yield instance.get().then(value => {
            expect(value).to.deep.equal(
                constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
          });
        });

        it('consentInfo value', function* () {
          instance.localConsentInfo_ = null;
          const testConsentInfo =
              constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test');
          storageValue['amp-consent:test'] = composeStoreValue(testConsentInfo);
          yield instance.get().then(value => {

            expect(value).to.deep.equal(testConsentInfo);
          });
        });

        it('unsupporte stored value', function* () {
          expectAsyncConsoleError(/Invalid stored consent value/);
          storageValue['amp-consent:test'] = 'invalid';
          yield instance.get().then(value => {
            expect(value).to.deep.equal(
                constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
          });
        });
      });

      it('should be able to get local value', function* () {
        let value;
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
        yield instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED));
        yield instance.update(CONSENT_ITEM_STATE.REJECTED, 'test1');
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED, 'test1'));
        yield instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED, 'test1'));
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED, 'test2');
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test2'));
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield instance.get().then(v => value = v);
        expect(value).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED));
      });

      it('should return unknown value with error', () => {
        storageGetSpy = () => {
          const e = new Error('intentional');
          throw e;
        };
        sandbox.stub(dev(), 'error');
        storageValue['amp-consent:test'] = true;
        return instance.get().then(value => {
          expect(value).to.deep.equal(
              constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN));
        });
      });

      it('should handle race condition return latest value', function* () {
        let value1, value2;
        storageValue['amp-consent:test'] = true;
        instance.get().then(v => value1 = v);
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        instance.get().then(v => value2 = v);
        yield macroTask();
        expect(value1).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
        expect(value2).to.deep.equal(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED));
      });
    });
  });
});
