import * as fakeTimers from '@sinonjs/fake-timers';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';

import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {expandPolicyConfig} from '../consent-config';
import {
  CONSENT_ITEM_STATE,
  PURPOSE_CONSENT_STATE,
  constructConsentInfo,
  constructMetadata,
} from '../consent-info';
import {
  ConsentPolicyInstance,
  ConsentPolicyManager,
} from '../consent-policy-manager';

describes.realWin(
  'ConsentPolicyManager',
  {
    amp: {
      extensions: ['amp-consent'],
      ampdoc: 'single',
    },
  },
  (env) => {
    let win;
    let ampdoc;
    let consentManagerOnChangeSpy;
    let consentInfo;
    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      consentManagerOnChangeSpy = env.sandbox.spy();

      resetServiceForTesting(win, 'consentStateManager');
      registerServiceBuilder(win, 'consentStateManager', function () {
        return Promise.resolve({
          whenConsentReady: () => {
            return Promise.resolve();
          },
          onConsentStateChange: (handler) => {
            consentManagerOnChangeSpy(handler);
            handler(consentInfo);
          },
          whenHasAllPurposeConsents: () => {
            return Promise.resolve();
          },
          getConsentInstanceSharedData: () => {
            return Promise.resolve({
              'shared': 'test',
            });
          },
        });
      });
    });

    afterEach(() => {
      consentInfo = null;
    });

    describe('Consent Policy Manager', () => {
      let manager;
      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        consentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(CONSENT_STRING_TYPE.TCF_V1),
          {
            'purpose-foo': PURPOSE_CONSENT_STATE.ACCEPTED,
            'purpose-bar': PURPOSE_CONSENT_STATE.REJECTED,
          }
        );
        manager.setLegacyConsentInstanceId('ABC');
      });

      it('should initiate consent value', async () => {
        await macroTask();
        expect(consentManagerOnChangeSpy).to.be.called;
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        expect(manager.consentMetadata_).to.be.deep.equals(
          constructMetadata(CONSENT_STRING_TYPE.TCF_V1)
        );
        expect(manager.purposeConsents_).to.deep.equals({
          'purpose-foo': PURPOSE_CONSENT_STATE.ACCEPTED,
          'purpose-bar': PURPOSE_CONSENT_STATE.REJECTED,
        });
      });

      describe('Register policy instance', () => {
        it('should register valid consent policy', async () => {
          manager.registerConsentPolicyInstance('default', {
            'waitFor': {
              'ABC': undefined,
            },
          });
          await macroTask();
          const status = await manager.whenPolicyResolved('default');
          expect(status).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
        });

        it('Invalid consent policy', function* () {
          consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED);
          expectAsyncConsoleError(
            '[consent-policy-manager] ' +
              'invalid waitFor value, consent policy will never resolve'
          );
          manager.registerConsentPolicyInstance('default', {
            'waitFor': {
              'ABC': undefined,
              'invalid': undefined,
            },
          });
        });
      });

      it('Handle consent state change', () => {
        // UNKNOWN Init value
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
        expect(manager.consentState_).to.be.null;

        // Dismiss override unknown
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.DISMISSED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.UNKNOWN);

        // Not required override unknown
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.NOT_REQUIRED);

        // Accept
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.ACCEPTED);

        // UNKNOWN/NOT_REQUIRED/DISMISS cannot override ACCEPTED/REJECTED
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.ACCEPTED);
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.ACCEPTED);

        // Reject
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.REJECTED);

        // UNKNOWN/NOT_REQUIRED/DISMISS cannot override ACCEPTED/REJECTED
        manager.consentStateChangeHandler_(
          constructConsentInfo(CONSENT_ITEM_STATE.DISMISSED)
        );
        expect(manager.consentState_).to.equal(CONSENT_ITEM_STATE.REJECTED);
      });

      describe('whenPolicyResolved/Unblock', () => {
        it('Invalid policy value', () => {
          expectAsyncConsoleError(/only predefined policies are supported/, 2);
          return manager.whenPolicyResolved('invalid').then((state) => {
            expect(state).to.equal(CONSENT_POLICY_STATE.UNKNOWN);
            return manager
              .whenPolicyUnblock('invalid')
              .then((shouldUnblock) => {
                expect(shouldUnblock).to.be.false;
              });
          });
        });

        it('return promise when policy is resolved', () => {
          manager.registerConsentPolicyInstance('default', {
            'waitFor': {
              'ABC': undefined,
            },
          });
          return manager.whenPolicyResolved('default');
        });

        it('handle cases when requested before policy is registered', () => {
          const promise = manager.whenPolicyResolved('default');
          manager.registerConsentPolicyInstance('default', {
            'waitFor': {
              'ABC': undefined,
            },
          });
          return promise;
        });
      });

      describe('Predefined consent policy', () => {
        let policy;
        beforeEach(() => {
          manager = new ConsentPolicyManager(ampdoc);
          consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
          manager.setLegacyConsentInstanceId('ABC');
          policy = expandPolicyConfig({}, 'ABC');
          const keys = Object.keys(policy);
          for (let i = 0; i < keys.length; i++) {
            manager.registerConsentPolicyInstance(keys[i], policy[keys[i]]);
          }
        });

        it('Not required', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.NOT_REQUIRED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(
                CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(
                CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(
                CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(
                CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
              );
            })
          );

          // Unblock
          promises.push(
            manager.whenPolicyUnblock('default').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_accepted').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_responded').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_auto_reject').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );
          return Promise.all(promises);
        });

        it('Dismiss', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.DISMISSED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.UNKNOWN);
            })
          );

          // Unblock
          promises.push(
            manager.whenPolicyUnblock('default').then((toUnblock) => {
              expect(toUnblock).to.be.false;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_accepted').then((toUnblock) => {
              expect(toUnblock).to.be.false;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_responded').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_auto_reject').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );
          return Promise.all(promises);
        });

        it('Accept', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
            })
          );

          return Promise.all(promises);
        });

        it('Reject', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.REJECTED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(CONSENT_POLICY_STATE.INSUFFICIENT);
            })
          );

          promises.push(
            manager.whenPolicyUnblock('default').then((toUnblock) => {
              expect(toUnblock).to.be.false;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_accepted').then((toUnblock) => {
              expect(toUnblock).to.be.false;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_till_responded').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          promises.push(
            manager.whenPolicyUnblock('_auto_reject').then((toUnblock) => {
              expect(toUnblock).to.be.true;
            })
          );

          return Promise.all(promises);
        });
      });

      describe('setOnPolicyChange', () => {
        let policy;
        beforeEach(() => {
          manager = new ConsentPolicyManager(ampdoc);
          consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
          manager.setLegacyConsentInstanceId('ABC');
          policy = expandPolicyConfig({}, 'ABC');
          const keys = Object.keys(policy);
          for (let i = 0; i < keys.length; i++) {
            manager.registerConsentPolicyInstance(keys[i], policy[keys[i]]);
          }
        });

        it('will not fire, if not set', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'abc123')
          );
          expect(manager.tcfConsentChangeHandler_).is.null;
        });

        it('will fire only fire for a valid change', () => {
          const spy = env.sandbox.spy();
          manager.setOnPolicyChange(spy);
          expect(manager.tcfConsentChangeHandler_).to.not.be.null;

          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledOnce;

          // Unknown does not trigger change.
          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN, '321cba')
          );
          expect(spy).to.be.calledOnce;
        });

        it('will fire on multiple changes', () => {
          const spy = env.sandbox.spy();
          manager.setOnPolicyChange(spy);
          expect(manager.tcfConsentChangeHandler_).to.not.be.null;

          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledOnce;

          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledTwice;

          manager.consentStateChangeHandler_(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'xyz123')
          );
          expect(spy).to.be.calledThrice;
        });
      });
    });

    describe('Consent Policy Instance', () => {
      let instance;
      beforeEach(() => {
        const config = {
          'waitFor': {
            'ABC': [],
          },
        };
        instance = new ConsentPolicyInstance(config);
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
            'timeout': {
              'seconds': 1,
              'fallbackAction': 'reject',
            },
          };

          config2 = {
            'waitFor': {
              'ABC': [],
            },
            'timeout': {
              'seconds': 2,
              'fallbackAction': 'reject',
            },
          };

          clock = fakeTimers.withGlobal(ampdoc.win).install();
        });

        it('consent policy should resolve after timeout', function* () {
          instance = new ConsentPolicyInstance(config1);
          let ready = false;
          instance.getReadyPromise().then(() => (ready = true));
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
            CONSENT_POLICY_STATE.INSUFFICIENT
          );
        });

        it('consent policy resolve before timeout', function* () {
          instance = new ConsentPolicyInstance(config2);
          let ready = false;
          instance.getReadyPromise().then(() => (ready = true));
          instance.startTimeout(ampdoc.win);
          yield macroTask();
          expect(ready).to.be.false;
          clock.tick(1000);
          instance.evaluate(CONSENT_ITEM_STATE.DISMISSED);
          yield macroTask();
          expect(ready).to.be.true;
          clock.tick(1001);
          yield macroTask();
          expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN
          );
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
            CONSENT_POLICY_STATE.UNKNOWN
          );

          instance.evaluate(CONSENT_ITEM_STATE.REJECTED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.INSUFFICIENT
          );

          instance.evaluate(CONSENT_ITEM_STATE.ACCEPTED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.SUFFICIENT
          );

          instance.evaluate(CONSENT_ITEM_STATE.DISMISSED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN
          );

          instance.evaluate(CONSENT_ITEM_STATE.NOT_REQUIRED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
          );
        });
      });

      describe('shouldBlock', () => {
        it('default should block list', () => {
          instance = new ConsentPolicyInstance({
            'waitFor': {
              'ABC': [],
            },
          });
          instance.evaluate(CONSENT_ITEM_STATE.DISMISSED);
          expect(instance.shouldUnblock()).to.equal(false);

          instance.evaluate(CONSENT_ITEM_STATE.REJECTED);
          expect(instance.shouldUnblock()).to.equal(false);

          instance.evaluate(CONSENT_ITEM_STATE.ACCEPTED);
          expect(instance.shouldUnblock()).to.equal(true);
        });

        it('customized should block list', () => {
          instance = new ConsentPolicyInstance({
            'waitFor': {
              'ABC': [],
            },
            'unblockOn': [
              CONSENT_POLICY_STATE.UNKNOWN,
              CONSENT_POLICY_STATE.SUFFICIENT,
              CONSENT_POLICY_STATE.INSUFFICIENT,
              CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
            ],
          });
          instance.evaluate(CONSENT_ITEM_STATE.DISMISSED);
          expect(instance.shouldUnblock()).to.equal(true);

          instance.evaluate(CONSENT_ITEM_STATE.REJECTED);
          expect(instance.shouldUnblock()).to.equal(true);

          instance.evaluate(CONSENT_ITEM_STATE.ACCEPTED);
          expect(instance.shouldUnblock()).to.equal(true);
        });
      });
    });

    describe('getMergedSharedData', () => {
      let manager;

      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        env.sandbox
          .stub(ConsentPolicyInstance.prototype, 'getReadyPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.UNKNOWN);
        manager.setLegacyConsentInstanceId('ABC');
      });

      it('should return sharedData', function* () {
        manager.registerConsentPolicyInstance('default', {
          'waitFor': {
            'ABC': undefined,
          },
        });
        yield macroTask();
        return expect(
          manager.getMergedSharedData('default')
        ).to.eventually.deep.equal({
          'shared': 'test',
        });
      });
    });

    describe('getTcfPolicyVersion', () => {
      let manager;

      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        manager.setLegacyConsentInstanceId('ABC');
        env.sandbox
          .stub(ConsentPolicyInstance.prototype, 'getReadyPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        consentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          undefined,
          undefined,
          undefined,
          4
        );
      });

      it('should return tcf policy version value from state manager', async () => {
        manager.registerConsentPolicyInstance('default', {
          'waitFor': {
            'ABC': undefined,
          },
        });
        await macroTask();
        await expect(
          manager.getTcfPolicyVersion('default')
        ).to.eventually.be.equal(4);
      });
    });

    describe('getConsentMetadataInfo', () => {
      let manager;

      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        manager.setLegacyConsentInstanceId('ABC');
        env.sandbox
          .stub(ConsentPolicyInstance.prototype, 'getReadyPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        consentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          'test',
          constructMetadata(CONSENT_STRING_TYPE.TCF_V2, '1~1.10.14.103', false)
        );
      });

      it('should return metadata values from state manager', async () => {
        manager.registerConsentPolicyInstance('default', {
          'waitFor': {
            'ABC': undefined,
          },
        });
        await macroTask();
        await expect(
          manager.getConsentMetadataInfo('default')
        ).to.eventually.deep.equals(
          constructMetadata(CONSENT_STRING_TYPE.TCF_V2, '1~1.10.14.103', false)
        );
      });
    });

    describe('consent purposes', () => {
      let manager;

      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        manager.setLegacyConsentInstanceId('ABC');
        consentInfo = constructConsentInfo(
          CONSENT_ITEM_STATE.ACCEPTED,
          undefined,
          undefined,
          {
            'purpose-foo': PURPOSE_CONSENT_STATE.ACCEPTED,
            'purpose-bar': PURPOSE_CONSENT_STATE.ACCEPTED,
            'purpose-xyz': PURPOSE_CONSENT_STATE.REJECTED,
          }
        );
      });

      it('should unblock on purpose consents', async () => {
        manager.registerConsentPolicyInstance('default', {
          'waitFor': {
            'ABC': undefined,
          },
        });
        await macroTask();
        await expect(
          manager.whenPurposesUnblock(['purpose-foo', 'purpose-bar'])
        ).to.eventually.be.true;
      });

      it('should unblock on purpose consents', async () => {
        manager.registerConsentPolicyInstance('default', {
          'waitFor': {
            'ABC': undefined,
          },
        });
        await macroTask();
        await expect(
          manager.whenPurposesUnblock([
            'purpose-foo',
            'purpose-bar',
            'purpose-xyz',
          ])
        ).to.eventually.be.false;
      });
    });
  }
);
