import {expect} from 'chai';

import {VisibilityState_Enum} from '#core/constants/visibility-state';

import * as Listen from '#utils/event-helper';
import {user} from '#utils/log';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {
  SESSION_MAX_AGE_MILLIS,
  SESSION_VALUES,
  SessionManager,
  installSessionServiceForTesting,
} from '../session-manager';
import {installVariableServiceForTesting} from '../variables';

describes.realWin('Session Manager', {amp: true}, (env) => {
  let win;
  let storageValue;
  let storageGetSpy, storageSetSpy, storageRemoveSpy;
  let sessionManager;
  let clock, randomVal, defaultTime;
  let vendorType, session;

  beforeEach(() => {
    win = env.win;

    storageValue = {};
    storageGetSpy = env.sandbox.spy();
    storageSetSpy = env.sandbox.spy();
    storageRemoveSpy = env.sandbox.spy();

    randomVal = 0.5;
    env.sandbox.stub(Math, 'random').callsFake(() => randomVal);
    defaultTime = 1555555555555;
    clock = env.sandbox.useFakeTimers(defaultTime);
    vendorType = 'myVendorType';
    env.sandbox.defineProperty(win.document, 'hasFocus', {
      value: () => true,
    });

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
      });
    });

    installVariableServiceForTesting(env.ampdoc);
    installSessionServiceForTesting(env.ampdoc);
    sessionManager = new SessionManager(env.ampdoc);
  });

  describe('get', () => {
    it('should assert on type', async () => {
      const errorSpy = env.sandbox.stub(user(), 'error');
      expect(await sessionManager.get()).to.equal(null);
      expect(errorSpy).to.be.calledOnce;
      expect(errorSpy.args[0][1]).to.match(
        /Sessions can only be accessed with a vendor type./
      );
    });

    it('should create new sessions', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
      clock.tick(1);
      randomVal = 0.6;
      const vendorType2 = 'myVendorType2';
      const session2 = {
        [SESSION_VALUES.SESSION_ID]: 6000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: 1555555555556,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: 1555555555556,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType2)).to.deep.equals(session2);
      expect(sessionManager.sessions_[vendorType2]).to.deep.equals(session2);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(2);
    });

    it('should update an existing session in memory and storage', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      clock.tick(1);
      session[SESSION_VALUES.ACCESS_TIMESTAMP] = 1555555555556;
      // Get again, extend the session
      storageSetSpy.resetHistory();
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should not change creationTimestamp on update', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      await sessionManager.get(vendorType);

      clock.tick(1);
      session[SESSION_VALUES.ACCESS_TIMESTAMP] = 1555555555556;

      storageSetSpy.resetHistory();
      const storedSession = await sessionManager.get(vendorType);
      expect(storedSession[SESSION_VALUES.CREATION_TIMESTAMP]).to.equal(
        session[SESSION_VALUES.CREATION_TIMESTAMP]
      );
      expect(
        sessionManager.sessions_[vendorType][SESSION_VALUES.CREATION_TIMESTAMP]
      ).to.equal(session[SESSION_VALUES.CREATION_TIMESTAMP]);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should create a new session for an expired session', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      storageSetSpy.resetHistory();
      session = {
        [SESSION_VALUES.SESSION_ID]: 6000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: 1555557355556,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: 1555557355556,
        [SESSION_VALUES.COUNT]: 2,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should update count for a newly created a new session for an expired session', async () => {
      let storedSession = await sessionManager.get(vendorType);
      expect(storedSession[SESSION_VALUES.COUNT]).to.equal(1);

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);

      storedSession = await sessionManager.get(vendorType);
      expect(storedSession[SESSION_VALUES.COUNT]).to.equal(2);
      expect(
        sessionManager.sessions_[vendorType][SESSION_VALUES.COUNT]
      ).to.equal(2);
    });

    it('should retrieve a non-expired session from storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
        },
      };

      clock.tick(1);
      const parsedSession = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: 1555555555556,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
    });

    it('should retrieve an expired session from storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
        },
      };

      randomVal = 0.7;
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      const parsedSession = {
        [SESSION_VALUES.SESSION_ID]: 7000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: 1555557355556,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: 1555557355556,
        [SESSION_VALUES.COUNT]: 2,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: true,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
    });
  });

  describe('eventTimestamp', () => {
    let vendorType, session;

    beforeEach(() => {
      vendorType = 'myVendorType';
    });

    describe('updateEvent', () => {
      it('should handle first update', async () => {
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ENGAGED]: true,
        };

        expect(Object.keys(sessionManager.sessions_).length).to.equal(0);
        await sessionManager.updateEvent(vendorType);

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        expect(await sessionManager.get(vendorType)).to.deep.equals(session);
        expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
        expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
      });

      it('should handle subsequent updates', async () => {
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime + 1,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime + 1,
          [SESSION_VALUES.ENGAGED]: true,
        };

        await sessionManager.updateEvent(vendorType);
        clock.tick(1);
        storageSetSpy.resetHistory();
        await sessionManager.updateEvent(vendorType);

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
        expect(await sessionManager.get(vendorType)).to.deep.equals(session);

        storageSetSpy.resetHistory();
        await sessionManager.updateEvent(vendorType);

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
        expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      });

      it('should handle updates from continued session', async () => {
        storageValue = {
          ['amp-session:' + vendorType]: {
            [SESSION_VALUES.SESSION_ID]: 5000,
            [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.COUNT]: 1,
            [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ENGAGED]: true,
          },
        };

        clock.tick(1);
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime + 1,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime + 1,
          [SESSION_VALUES.ENGAGED]: true,
        };
        await sessionManager.updateEvent(vendorType);

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
        expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      });

      it('should handle updates from restarted session', async () => {
        storageValue = {
          ['amp-session:' + vendorType]: {
            [SESSION_VALUES.SESSION_ID]: 5000,
            [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.COUNT]: 1,
            [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ENGAGED]: true,
          },
        };

        clock.tick(SESSION_MAX_AGE_MILLIS + 1);
        randomVal = 0.6;
        const pastExpiration = 1555557355556;

        session = {
          [SESSION_VALUES.SESSION_ID]: 6000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: pastExpiration,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: pastExpiration,
          [SESSION_VALUES.COUNT]: 2,
          [SESSION_VALUES.EVENT_TIMESTAMP]: pastExpiration,
          [SESSION_VALUES.ENGAGED]: true,
        };
        await sessionManager.updateEvent(vendorType);

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
        expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      });
    });
  });

  describe('engaged', () => {
    let vendorType, session;

    beforeEach(() => {
      vendorType = 'myVendorType';
    });

    describe('engaged signal listeners', () => {
      it('should set initial values and listeners', () => {
        expect(sessionManager.isVisible_).to.be.true;
        expect(sessionManager.isFocused_).to.be.true;
        expect(sessionManager.isOpen_).to.be.true;

        expect(sessionManager.unlisteners_.length).to.equal(5);
      });

      it('should dispose correctly', () => {
        const unlistenSpy = env.sandbox.spy();
        env.sandbox.stub(Listen, 'listen').returns(unlistenSpy);
        env.sandbox
          .stub(env.ampdoc, 'onVisibilityChanged')
          .returns(unlistenSpy);
        sessionManager = new SessionManager(env.ampdoc);
        sessionManager.dispose();

        expect(sessionManager.unlisteners_.length).to.equal(0);
        expect(unlistenSpy.callCount).to.equal(5);
      });

      it('should change engaged singals with listeners', async () => {
        const updateEngagedSpy = env.sandbox.spy(
          sessionManager,
          'updateEngagedForSessions_'
        );
        win.dispatchEvent(new Event('blur'));
        expect(sessionManager.isFocused_).to.be.false;
        win.dispatchEvent(new Event('focus'));
        expect(sessionManager.isFocused_).to.be.true;
        win.dispatchEvent(new Event('pagehide'));
        expect(sessionManager.isOpen_).to.be.false;
        win.dispatchEvent(new Event('pageshow'));
        expect(sessionManager.isOpen_).to.be.true;

        env.sandbox.defineProperty(win.document, 'hidden', {
          value: true,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        expect(sessionManager.isVisible_).to.be.false;
        env.sandbox.defineProperty(win.document, 'hidden', {
          value: false,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.VISIBLE);
        expect(sessionManager.isVisible_).to.be.true;

        expect(updateEngagedSpy.callCount).to.equal(6);
      });

      it('should calculate engaged correctly', () => {
        sessionManager.isVisible_ = true;
        sessionManager.isOpen_ = true;
        sessionManager.isFocused_ = true;

        expect(sessionManager.getEngagedValue_()).to.be.true;

        sessionManager.isVisible_ = false;
        expect(sessionManager.getEngagedValue_()).to.be.false;

        sessionManager.isVisible_ = true;
        sessionManager.isOpen_ = false;
        expect(sessionManager.getEngagedValue_()).to.be.false;

        sessionManager.isOpen_ = true;
        sessionManager.isFocused_ = false;
        expect(sessionManager.getEngagedValue_()).to.be.false;
      });

      it('should update sessions when all engaged signal changes', async () => {
        await sessionManager.get(vendorType);
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
          [SESSION_VALUES.ENGAGED]: true,
        };

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        win.dispatchEvent(new Event('blur'));
        session[SESSION_VALUES.ENGAGED] = false;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        win.dispatchEvent(new Event('focus'));
        session[SESSION_VALUES.ENGAGED] = true;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        win.dispatchEvent(new Event('pagehide'));
        session[SESSION_VALUES.ENGAGED] = false;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        win.dispatchEvent(new Event('pageshow'));
        session[SESSION_VALUES.ENGAGED] = true;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );
        env.sandbox.defineProperty(win.document, 'hidden', {
          value: true,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        session[SESSION_VALUES.ENGAGED] = false;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );

        env.sandbox.defineProperty(win.document, 'hidden', {
          value: false,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.VISIBLE);
        session[SESSION_VALUES.ENGAGED] = true;

        expect(storageSetSpy).to.be.calledOnce;
        expect(storageSetSpy).to.be.calledWith(
          'amp-session:' + vendorType,
          session
        );
      });

      it('should update all sessions in memory', async () => {
        const vendorType2 = vendorType + '2';
        await sessionManager.get(vendorType);
        await sessionManager.get(vendorType2);

        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
          [SESSION_VALUES.ENGAGED]: false,
        };
        expect(storageSetSpy.callCount).to.equal(2);
        win.dispatchEvent(new Event('blur'));
        expect(sessionManager.sessions_[vendorType]).to.deep.equal(session);
        expect(sessionManager.sessions_[vendorType2]).to.deep.equal(session);
      });

      it('use persisted engaged value', async () => {
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ENGAGED]: true,
        };
        storageValue = {
          ['amp-session:' + vendorType]: session,
        };

        env.sandbox.defineProperty(win.document, 'hidden', {
          value: true,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        expect(sessionManager.isVisible_).to.be.false;

        // Uses the `true` engaged value
        const persistedSession = await sessionManager.get(vendorType);
        expect(persistedSession).to.deep.equal(session);
        expect(sessionManager.sessions_[vendorType]).to.deep.equal(session);
      });

      it('use resets engaged value to current engaged value', async () => {
        // New session
        session = {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]:
            defaultTime + SESSION_MAX_AGE_MILLIS + 1,
          [SESSION_VALUES.ACCESS_TIMESTAMP]:
            defaultTime + SESSION_MAX_AGE_MILLIS + 1,
          [SESSION_VALUES.COUNT]: 2,
          [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
          [SESSION_VALUES.ENGAGED]: false,
        };
        // Old session
        storageValue = {
          ['amp-session:' + vendorType]: {
            [SESSION_VALUES.SESSION_ID]: 5000,
            [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.COUNT]: 1,
            [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ENGAGED]: true,
          },
        };

        clock.tick(SESSION_MAX_AGE_MILLIS + 1);
        env.sandbox.defineProperty(win.document, 'hidden', {
          value: true,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.HIDDEN);
        expect(sessionManager.isVisible_).to.be.false;

        const persistedSession = await sessionManager.get(vendorType);
        expect(persistedSession).to.deep.equal(session);
        expect(sessionManager.sessions_[vendorType]).to.deep.equal(session);
      });
    });

    describe('retrieving and persisting engaged', () => {
      it('should return current engaged value', async () => {
        const engaged = await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.ENGAGED
        );
        expect(engaged).to.be.true;
      });

      it('should return persisted engaged from storage if true', async () => {
        storageValue = {
          ['amp-session:' + vendorType]: {
            [SESSION_VALUES.SESSION_ID]: 5000,
            [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.COUNT]: 1,
            [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ENGAGED]: true,
          },
        };

        // Set the document to hidden so that our current engaged is false.
        env.sandbox.defineProperty(win.document, 'hidden', {
          value: true,
        });
        env.ampdoc.overrideVisibilityState(VisibilityState_Enum.HIDDEN);

        const engaged = await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.ENGAGED
        );
        // Engaged is true b/c it's the persisted value
        expect(engaged).to.be.true;
      });

      it('should not use persisted engaged from storage if false', async () => {
        storageValue = {
          ['amp-session:' + vendorType]: {
            [SESSION_VALUES.SESSION_ID]: 5000,
            [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.COUNT]: 1,
            [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
            [SESSION_VALUES.ENGAGED]: false,
          },
        };

        const engaged = await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.ENGAGED
        );
        // Engaged is true current document state is engaged
        expect(engaged).to.be.true;
      });
    });
  });

  describe('getSessionValue', () => {
    it('should return undefined on no type', async () => {
      const id = await sessionManager.getSessionValue(
        undefined,
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.be.undefined;
    });

    it('should return SESSION_VALUE.SESSION_ID', async () => {
      let id = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.equal(5000);

      randomVal = 0.7;
      clock.tick(1);
      id = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.equal(5000);

      randomVal = 0.9;
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      id = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.equal(9000);
    });

    it('should return SESSION_VALUE.CREATION_TIMESTAMP', async () => {
      let timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.CREATION_TIMESTAMP
      );
      expect(timestamp).to.equal(defaultTime);

      clock.tick(1);
      timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.CREATION_TIMESTAMP
      );
      expect(timestamp).to.equal(defaultTime);

      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.CREATION_TIMESTAMP
      );
      // defaultTime + SESSION_MAX_AGE_MILLIS + 1
      expect(timestamp).to.equal(1555557355557);
    });

    it('should return SESSION_VALUE.COUNT', async () => {
      let count = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.COUNT
      );
      expect(count).to.equal(1);

      clock.tick(1);
      count = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.COUNT
      );
      expect(count).to.equal(1);

      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      count = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.COUNT
      );
      expect(count).to.equal(2);
    });
  });
});
