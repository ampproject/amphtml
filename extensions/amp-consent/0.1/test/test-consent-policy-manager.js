import * as fakeTimers from '@sinonjs/fake-timers';
import {
  ConsentItemState_Enum,
  PurposeConsentState_Enum,
  constructConsentInfo,
  constructMetadata,
} from '../consent-info';
import {
  ConsentPolicyState_Enum,
  ConsentStringType_Enum,
} from '#core/constants/consent-state';
import {
  ConsentPolicyInstance,
  ConsentPolicyManager,
} from '../consent-policy-manager';
import {dict} from '#core/types/object';
import {expandPolicyConfig} from '../consent-config';
import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';

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
            return Promise.resolve(
              dict({
                'shared': 'test',
              })
            );
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
          ConsentItemState_Enum.ACCEPTED,
          'test',
          constructMetadata(ConsentStringType_Enum.TCF_V1),
          {
            'purpose-foo': PurposeConsentState_Enum.ACCEPTED,
            'purpose-bar': PurposeConsentState_Enum.REJECTED,
          }
        );
        manager.setLegacyConsentInstanceId('ABC');
      });

      it('should initiate consent value', async () => {
        await macroTask();
        expect(consentManagerOnChangeSpy).to.be.called;
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.ACCEPTED);
        expect(manager.consentMetadata_).to.be.deep.equals(
          constructMetadata(ConsentStringType_Enum.TCF_V1)
        );
        expect(manager.purposeConsents_).to.deep.equals({
          'purpose-foo': PurposeConsentState_Enum.ACCEPTED,
          'purpose-bar': PurposeConsentState_Enum.REJECTED,
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
          expect(status).to.equal(ConsentPolicyState_Enum.SUFFICIENT);
        });

        it('Invalid consent policy', function* () {
          consentInfo = constructConsentInfo(ConsentItemState_Enum.ACCEPTED);
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
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
        expect(manager.consentState_).to.be.null;

        // Dismiss override unknown
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.DISMISSED)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.UNKNOWN);

        // Not required override unknown
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.NOT_REQUIRED)
        );
        expect(manager.consentState_).to.equal(
          ConsentItemState_Enum.NOT_REQUIRED
        );

        // Accept
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.ACCEPTED);

        // UNKNOWN/NOT_REQUIRED/DISMISS cannot override ACCEPTED/REJECTED
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.NOT_REQUIRED)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.ACCEPTED);
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.UNKNOWN)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.ACCEPTED);

        // Reject
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.REJECTED)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.REJECTED);

        // UNKNOWN/NOT_REQUIRED/DISMISS cannot override ACCEPTED/REJECTED
        manager.consentStateChangeHandler_(
          constructConsentInfo(ConsentItemState_Enum.DISMISSED)
        );
        expect(manager.consentState_).to.equal(ConsentItemState_Enum.REJECTED);
      });

      describe('whenPolicyResolved/Unblock', () => {
        it('Invalid policy value', () => {
          expectAsyncConsoleError(/only predefined policies are supported/, 2);
          return manager.whenPolicyResolved('invalid').then((state) => {
            expect(state).to.equal(ConsentPolicyState_Enum.UNKNOWN);
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
          consentInfo = constructConsentInfo(ConsentItemState_Enum.UNKNOWN);
          manager.setLegacyConsentInstanceId('ABC');
          policy = expandPolicyConfig(dict({}), 'ABC');
          const keys = Object.keys(policy);
          for (let i = 0; i < keys.length; i++) {
            manager.registerConsentPolicyInstance(keys[i], policy[keys[i]]);
          }
        });

        it('Not required', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.NOT_REQUIRED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(
                ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(
                ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(
                ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED
              );
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(
                ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED
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
            constructConsentInfo(ConsentItemState_Enum.DISMISSED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.UNKNOWN);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.UNKNOWN);
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
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_accepted').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_till_responded').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.SUFFICIENT);
            })
          );
          promises.push(
            manager.whenPolicyResolved('_auto_reject').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.SUFFICIENT);
            })
          );

          return Promise.all(promises);
        });

        it('Reject', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.REJECTED)
          );
          const promises = [];
          promises.push(
            manager.whenPolicyResolved('default').then((status) => {
              expect(status).to.equal(ConsentPolicyState_Enum.INSUFFICIENT);
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
          consentInfo = constructConsentInfo(ConsentItemState_Enum.UNKNOWN);
          manager.setLegacyConsentInstanceId('ABC');
          policy = expandPolicyConfig(dict({}), 'ABC');
          const keys = Object.keys(policy);
          for (let i = 0; i < keys.length; i++) {
            manager.registerConsentPolicyInstance(keys[i], policy[keys[i]]);
          }
        });

        it('will not fire, if not set', () => {
          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'abc123')
          );
          expect(manager.tcfConsentChangeHandler_).is.null;
        });

        it('will fire only fire for a valid change', () => {
          const spy = env.sandbox.spy();
          manager.setOnPolicyChange(spy);
          expect(manager.tcfConsentChangeHandler_).to.not.be.null;

          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledOnce;

          // Unknown does not trigger change.
          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.UNKNOWN, '321cba')
          );
          expect(spy).to.be.calledOnce;
        });

        it('will fire on multiple changes', () => {
          const spy = env.sandbox.spy();
          manager.setOnPolicyChange(spy);
          expect(manager.tcfConsentChangeHandler_).to.not.be.null;

          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledOnce;

          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'abc123')
          );
          expect(spy).to.be.calledTwice;

          manager.consentStateChangeHandler_(
            constructConsentInfo(ConsentItemState_Enum.ACCEPTED, 'xyz123')
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
            ConsentPolicyState_Enum.INSUFFICIENT
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
          instance.evaluate(ConsentItemState_Enum.DISMISSED);
          yield macroTask();
          expect(ready).to.be.true;
          clock.tick(1001);
          yield macroTask();
          expect(instance.getCurrentPolicyStatus()).to.equal(
            ConsentPolicyState_Enum.UNKNOWN
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
            ConsentPolicyState_Enum.UNKNOWN
          );

          instance.evaluate(ConsentItemState_Enum.REJECTED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            ConsentPolicyState_Enum.INSUFFICIENT
          );

          instance.evaluate(ConsentItemState_Enum.ACCEPTED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            ConsentPolicyState_Enum.SUFFICIENT
          );

          instance.evaluate(ConsentItemState_Enum.DISMISSED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            ConsentPolicyState_Enum.UNKNOWN
          );

          instance.evaluate(ConsentItemState_Enum.NOT_REQUIRED);
          expect(instance.getCurrentPolicyStatus()).to.equal(
            ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED
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
          instance.evaluate(ConsentItemState_Enum.DISMISSED);
          expect(instance.shouldUnblock()).to.equal(false);

          instance.evaluate(ConsentItemState_Enum.REJECTED);
          expect(instance.shouldUnblock()).to.equal(false);

          instance.evaluate(ConsentItemState_Enum.ACCEPTED);
          expect(instance.shouldUnblock()).to.equal(true);
        });

        it('customized should block list', () => {
          instance = new ConsentPolicyInstance({
            'waitFor': {
              'ABC': [],
            },
            'unblockOn': [
              ConsentPolicyState_Enum.UNKNOWN,
              ConsentPolicyState_Enum.SUFFICIENT,
              ConsentPolicyState_Enum.INSUFFICIENT,
              ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED,
            ],
          });
          instance.evaluate(ConsentItemState_Enum.DISMISSED);
          expect(instance.shouldUnblock()).to.equal(true);

          instance.evaluate(ConsentItemState_Enum.REJECTED);
          expect(instance.shouldUnblock()).to.equal(true);

          instance.evaluate(ConsentItemState_Enum.ACCEPTED);
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
        consentInfo = constructConsentInfo(ConsentItemState_Enum.UNKNOWN);
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
          ConsentItemState_Enum.ACCEPTED,
          'test',
          constructMetadata(
            ConsentStringType_Enum.TCF_V2,
            '1~1.10.14.103',
            false
          )
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
          constructMetadata(
            ConsentStringType_Enum.TCF_V2,
            '1~1.10.14.103',
            false
          )
        );
      });
    });

    describe('consent purposes', () => {
      let manager;

      beforeEach(() => {
        manager = new ConsentPolicyManager(ampdoc);
        manager.setLegacyConsentInstanceId('ABC');
        consentInfo = constructConsentInfo(
          ConsentItemState_Enum.ACCEPTED,
          undefined,
          undefined,
          {
            'purpose-foo': PurposeConsentState_Enum.ACCEPTED,
            'purpose-bar': PurposeConsentState_Enum.ACCEPTED,
            'purpose-xyz': PurposeConsentState_Enum.REJECTED,
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
