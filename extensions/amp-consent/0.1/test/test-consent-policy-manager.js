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

import {CONSENT_ITEM_STATE} from '../consent-state-manager';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {
  ConsentPolicyInstance,
  ConsentPolicyManager,
} from '../consent-policy-manager';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';

describes.realWin('ConsentStateManager', {amp: 1}, env => {
  let win;
  let ampdoc;
  let consentManagerOnChangeSpy;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    consentManagerOnChangeSpy = sandbox.spy();

    resetServiceForTesting(win, 'consentStateManager');
    registerServiceBuilder(win, 'consentStateManager', function() {
      return Promise.resolve({
        whenConsentReady: () => {return Promise.resolve();},
        onConsentStateChange: (id, handler) => {
          consentManagerOnChangeSpy(id, handler);
        },
      });
    });
  });

  describe('Consent Policy Manager', () => {
    let manager;
    beforeEach(() => {
      manager = new ConsentPolicyManager(ampdoc);
      sandbox.stub(ConsentPolicyInstance.prototype, 'getReadyPromise')
          .callsFake(() => {return Promise.resolve();});
    });

    it('register policy instance correctly', function* () {
      manager.registerConsentPolicyInstance('test', {
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
      yield macroTask();
      expect(consentManagerOnChangeSpy).to.be.calledTwice;
      expect(consentManagerOnChangeSpy.args[0][0]).to.equal('ABC');
      expect(consentManagerOnChangeSpy.args[1][0]).to.equal('DEF');
    });

    describe('whenPolicyResolved', () => {
      it('return promise when policy is resolved', () => {
        manager.registerConsentPolicyInstance('test', {});
        return manager.whenPolicyResolved('test');
      });

      it('handle cases when requested before policy is registered', () => {
        const promise = manager.whenPolicyResolved('test');
        manager.registerConsentPolicyInstance('test', {});
        return promise;
      });
    });
  });

  describe('Consent Policy Instance', () => {
    let instance;
    beforeEach(() => {
      instance = new ConsentPolicyInstance(['ABC', 'DEF']);
    });

    it('on consent state change', () => {
      instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.DISMISSED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.UNKNOWN,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.GRANTED,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.REJECTED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.REJECTED,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.DISMISSED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.REJECTED,
      });
    });

    describe('getReadyPromise', () => {
      it('promise should resolve when all consents are gathered', function* () {
        instance = new ConsentPolicyInstance(['ABC']);
        let policyState = null;
        instance.getReadyPromise().then(state => policyState = state);
        yield macroTask();
        expect(policyState).to.be.null;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(policyState).to.equal(CONSENT_POLICY_STATE.INSUFFICIENT);
        instance = new ConsentPolicyInstance(['ABC']);
        instance.getReadyPromise().then(state => policyState = state);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
        yield macroTask();
        expect(policyState).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
      });

      it('promise should resolve when consents are dimissed', function* () {
        instance = new ConsentPolicyInstance(['ABC']);
        let policyState = null;
        instance.getReadyPromise().then(state => policyState = state);
        yield macroTask();
        expect(policyState).to.be.null;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.UNKNOWN);
        yield macroTask();
        expect(policyState).to.be.null;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.DISMISSED);
        yield macroTask();
        expect(policyState).to.equal(CONSENT_POLICY_STATE.INSUFFICIENT);
      });
    });
  });
});
