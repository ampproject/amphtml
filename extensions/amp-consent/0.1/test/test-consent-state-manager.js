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
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    storageValue = {};
    storageGetSpy = sandbox.spy();
    storageSetSpy = sandbox.spy();

    resetServiceForTesting(win, 'storage');
    registerServiceBuilder(win, 'storage', function() {
      return Promise.resolve({
        get: name => {
          storageGetSpy(name);
          return Promise.resolve(storageValue[name]);
        },
        set: (name, value) => {
          storageSetSpy(name, value);
          storageValue[name] = value;
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

    it('registerConsentInstance', () => {
      const consentReadyPromise = manager.whenConsentReady('test');
      manager.registerConsentInstance('test', {});
      manager.registerConsentInstance('test1', {});
      return consentReadyPromise.then(() => {
        return manager.whenConsentReady('test1');
      });
    });

    it.skip('should not register consent instance twice', () => {
      manager.registerConsentInstance('test', {});
      allowConsoleError(() => {
        expect(() => manager.registerConsentInstance('test', {})).to.throw(
            'CONSENT-STATE-MANAGER: instance already registered');
      });
    });

    it('get consent state', function* () {
      manager.registerConsentInstance('test', {});
      let value;
      const p = manager.getConsentInstanceState('test').then(v => value = v);
      yield p;
      expect(value).to.equal(CONSENT_ITEM_STATE.UNKNOWN);

      let value1;
      manager.updateConsentInstanceState('test', CONSENT_ITEM_STATE.ACCEPTED);
      const p1 = manager.getConsentInstanceState('test').then(v => value1 = v);
      yield p1;
      expect(value1).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
    });

    describe('update consent', () => {
      let spy;

      beforeEach(() => {
        manager.registerConsentInstance('test', {});
        spy = sandbox.spy();
      });

      it('should call handler when consent state changes', () => {
        manager.onConsentStateChange('test', spy);
        manager.updateConsentInstanceState('test', CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledWith(CONSENT_ITEM_STATE.REJECTED);
      });

      it('should call handler when consent is ignored', () => {
        manager.onConsentStateChange('test', spy);
        manager.updateConsentInstanceState('test',
            CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(spy).to.be.calledWith(CONSENT_ITEM_STATE.NOT_REQUIRED);
      });

      it('should call handler when register observable', function*() {
        manager.onConsentStateChange('test', spy);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(CONSENT_ITEM_STATE.UNKNOWN);
      });

      it('handles race condition', function* () {
        manager.onConsentStateChange('test', spy);
        manager.updateConsentInstanceState('test', CONSENT_ITEM_STATE.REJECTED);
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWith(CONSENT_ITEM_STATE.REJECTED);
      });
    });
  });

  describe('ConsentInstance', () => {
    let instance;

    beforeEach(() => {
      instance = new ConsentInstance(ampdoc, 'test', {});
    });

    describe('update', () => {
      it('should be able to update local value', function* () {
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
        expect(storageSetSpy).to.be.calledWith('amp-consent:test', true);
        storageSetSpy.resetHistory();
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith('amp-consent:test', false);
        storageSetSpy.resetHistory();
        instance.update(-1);
        yield macroTask();
        expect(storageSetSpy).to.not.be.called;
      });

      it('should not write localStorage with same value', function* () {
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(storageSetSpy).to.be.calledOnce;
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
        instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield macroTask();
        expect(requestSpy).to.be.calledOnce;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentInstanceId).to.equal('test');
        expect(requestBody.consentState).to.equal(true);
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(requestSpy).to.be.calledTwice;
        expect(requestSpy).to.be.calledWith('//updateHref');
        expect(requestBody.consentState).to.equal(false);
      });

      it('do not send update request on dismiss/notRequied', function* () {
        instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
        instance.update(CONSENT_ITEM_STATE.NOT_REQUIRED);
        yield macroTask();
        expect(requestSpy).to.not.be.called;
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
      it('should be able to get stored value', () => {
        storageValue['amp-consent:test'] = true;
        return instance.get().then(value => {
          expect(value).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        });
      });

      it('should be able to get local value', function* () {
        let value;
        yield instance.get().then(v => value = v);
        expect(value).to.equal(CONSENT_ITEM_STATE.UNKNOWN);
        yield instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield instance.get().then(v => value = v);
        expect(value).to.equal(CONSENT_ITEM_STATE.UNKNOWN);
        yield instance.update(CONSENT_ITEM_STATE.ACCEPTED);
        yield instance.get().then(v => value = v);
        expect(value).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        yield instance.update(CONSENT_ITEM_STATE.DISMISSED);
        yield instance.get().then(v => value = v);
        expect(value).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        yield instance.update(CONSENT_ITEM_STATE.REJECTED);
        yield instance.get().then(v => value = v);
        expect(value).to.equal(CONSENT_ITEM_STATE.REJECTED);
      });

      it('should return unknown value with error', () => {
        storageGetSpy = () => {
          const e = new Error('intentional');
          throw e;
        };
        sandbox.stub(dev(), 'error');
        storageValue['amp-consent:test'] = true;
        return instance.get().then(value => {
          expect(value).to.equal(CONSENT_ITEM_STATE.UNKNOWN);
        });
      });

      it('should handle race condition return latest value', function* () {
        let value1, value2;
        storageValue['amp-consent:test'] = true;
        instance.get().then(v => value1 = v);
        instance.update(CONSENT_ITEM_STATE.REJECTED);
        instance.get().then(v => value2 = v);
        yield macroTask();
        expect(value1).to.equal(CONSENT_ITEM_STATE.REJECTED);
        expect(value2).to.equal(CONSENT_ITEM_STATE.REJECTED);
      });
    });
  });
});
