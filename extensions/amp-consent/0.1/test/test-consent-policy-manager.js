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

import * as lolex from 'lolex';
import {CONSENT_ITEM_STATE} from '../consent-state-manager';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {
  ConsentPolicyInstance,
  ConsentPolicyManager,
  MULTI_CONSENT_EXPERIMENT,
} from '../consent-policy-manager';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('ConsentStateManager', {amp: 1}, env => {
  let win;
  let ampdoc;
  let consentManagerOnChangeSpy;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    consentManagerOnChangeSpy = sandbox.spy();
    toggleExperiment(win, MULTI_CONSENT_EXPERIMENT, true);

    resetServiceForTesting(win, 'consentStateManager');
    registerServiceBuilder(win, 'consentStateManager', function() {
      return Promise.resolve({
        whenConsentReady: () => {return Promise.resolve();},
        onConsentStateChange: (id, handler) => {
          consentManagerOnChangeSpy(id, handler);
        },
        getConsentInstanceSharedData: id => {
          const sharedData = {
            common: id,
          };
          sharedData[id] = true;
          return Promise.resolve(sharedData);
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
      const config = {
        'waitFor': {
          'ABC': [],
          'DEF': [],
        },
      };
      instance = new ConsentPolicyInstance(config);
    });

    it('on consent state change', () => {
      instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('ABC',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
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

    it('on consent ignored', () => {
      instance.consentStateChangeHandler('ABC',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.NOT_REQUIRED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('ABC',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.UNKNOWN);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': null,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.DISMISSED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.UNKNOWN,
      });
      instance.consentStateChangeHandler('DEF',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.NOT_REQUIRED,
      });
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.DISMISSED);
      expect(instance.itemToConsentState_).to.deep.equal({
        'ABC': CONSENT_ITEM_STATE.GRANTED,
        'DEF': CONSENT_ITEM_STATE.NOT_REQUIRED,
      });

    });

    describe('getReadyPromise', () => {
      let config;

      beforeEach(() => {
        config = {
          'waitFor': {
            'ABC': [],
          },
        };
      });

      it('promise should resolve when all consents are gathered', function* () {
        instance = new ConsentPolicyInstance(config);
        let ready = false;
        instance.getReadyPromise().then(() => ready = true);
        yield macroTask();
        expect(ready).to.be.false;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.REJECTED);
        yield macroTask();
        expect(ready).to.be.true;
        ready = false;
        instance = new ConsentPolicyInstance(config);
        instance.getReadyPromise().then(() => ready = true);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
        yield macroTask();
        expect(ready).to.be.true;
      });

      it('promise should resolve when consents are dimissed', function* () {
        instance = new ConsentPolicyInstance(config);
        let ready = false;
        instance.getReadyPromise().then(() => ready = true);
        yield macroTask();
        expect(ready).to.be.false;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.UNKNOWN);
        yield macroTask();
        expect(ready).to.be.false;
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.DISMISSED);
        yield macroTask();
        expect(ready).to.be.true;
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN);
      });
    });

    describe('timeout', () => {
      let config1;
      let config2;
      let clock;

      beforeEach(() => {
        config1 = {
          'waitFor': {
            'ABC': [],
          },
          'timeout': 1,
        };

        config2 = {
          'waitFor': {
            'ABC': [],
          },
          'timeout': {
            'seconds': 2,
            'fallbackState': 'rejected',
          },
        };

        clock = lolex.install({target: ampdoc.win});
      });

      it('consent policy should resolve after timeout', function* () {
        instance = new ConsentPolicyInstance(config1);
        let ready = false;
        instance.getReadyPromise().then(() => ready = true);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.UNKNOWN);
        instance.startTimeout(ampdoc.win);
        yield macroTask();
        expect(ready).to.be.false;
        clock.tick(999);
        yield macroTask();
        expect(ready).to.be.false;
        clock.tick(1);
        yield macroTask();
        expect(ready).to.be.true;
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN);
      });

      it('promise should resolve when consents are dimissed', function* () {
        instance = new ConsentPolicyInstance(config2);
        let ready = false;
        instance.getReadyPromise().then(() => ready = true);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.UNKNOWN);
        instance.startTimeout(ampdoc.win);
        yield macroTask();
        expect(ready).to.be.false;
        clock.tick(1999);
        yield macroTask();
        expect(ready).to.be.false;
        clock.tick(1);
        yield macroTask();
        expect(ready).to.be.true;
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.INSUFFICIENT);
      });
    });


    describe('getCurrentPolicyStatus', () => {
      it('should return current policy state', function* () {
        instance = new ConsentPolicyInstance({
          'waitFor': {
            'ABC': [],
          },
        });
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_ITEM_STATE.UNKNOWN);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.DISMISSED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN);
        instance.consentStateChangeHandler('ABC',
            CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.REJECTED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.INSUFFICIENT);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.SUFFICIENT);
        instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.DISMISSED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.SUFFICIENT);
        instance.consentStateChangeHandler('ABC',
            CONSENT_ITEM_STATE.NOT_REQUIRED);
        expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.SUFFICIENT);
      });
    });

    it('policy status when there are multiple items to wait', () => {
      instance = new ConsentPolicyInstance({
        'waitFor': {
          'ABC': [],
          'DEF': [],
        },
      });
      // single unknown
      instance.consentStateChangeHandler('ABC',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
      expect(instance.getCurrentPolicyStatus()).to.equal(
          CONSENT_POLICY_STATE.UNKNOWN);
      // All ignored
      instance.consentStateChangeHandler('DEF',
          CONSENT_ITEM_STATE.NOT_REQUIRED);
      expect(instance.getCurrentPolicyStatus()).to.equal(
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);
      // Single ignored
      instance.consentStateChangeHandler('DEF', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.getCurrentPolicyStatus()).to.equal(
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);
      // All granted
      instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.GRANTED);
      expect(instance.getCurrentPolicyStatus()).to.equal(
          CONSENT_POLICY_STATE.SUFFICIENT);
      // Single rejected
      instance.consentStateChangeHandler('ABC', CONSENT_ITEM_STATE.REJECTED);
      expect(instance.getCurrentPolicyStatus()).to.equal(
          CONSENT_POLICY_STATE.INSUFFICIENT);
    });
  });

  describe('getMergedSharedData', () => {
    let manager;

    beforeEach(() => {
      manager = new ConsentPolicyManager(ampdoc);
      sandbox.stub(ConsentPolicyInstance.prototype, 'getReadyPromise')
          .callsFake(() => {return Promise.resolve();});
    });

    it('should return merged sharedData', function*() {
      manager.registerConsentPolicyInstance('test', {
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
      yield macroTask();
      return expect(manager.getMergedSharedData('test'))
          .to.eventually.deep.equal({
            common: 'DEF',
            ABC: true,
            DEF: true,
          });
    });
  });
});
