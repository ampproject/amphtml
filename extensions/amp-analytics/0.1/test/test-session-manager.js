/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
  SESSION_MAX_AGE_MILLIS,
  SESSION_VALUES,
  SessionManager,
  installSessionServiceForTesting,
} from '../session-manager';
import {expect} from 'chai';
import {installVariableServiceForTesting} from '../variables';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {user} from '../../../../src/log';

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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
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
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
    });

    // Not expected to be called (i.e for testing)
    it('should set count for a session without a count', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        },
      };

      randomVal = 0.7;
      const parsedSession = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
    });
  });

  describe('eventTimestamp', () => {
    let vendorType, session;

    beforeEach(() => {
      vendorType = 'myVendorType';
    });

    it('should return no eventTimestamp when first time calling', async () => {
      const eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      expect(eventTimestamp).to.be.undefined;
    });

    it('should persist the eventTimestamp', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      const eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      expect(eventTimestamp).to.be.undefined;

      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should return no eventTimestamp when session has expired', async () => {
      // Returned undefined, stores eventTimestamp in LocalStorage
      await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      storageSetSpy.resetHistory();
      // Expired session resets eventTimestamp, returns undefined and persists
      expect(
        await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.EVENT_TIMESTAMP,
          true
        )
      ).to.be.undefined;

      let pastExpiration = 1555557355556;
      session = {
        [SESSION_VALUES.SESSION_ID]: 6000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.COUNT]: 2,
        [SESSION_VALUES.EVENT_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.7;

      storageSetSpy.resetHistory();
      // Expired session resets eventTimestamp, returns undefined and does not persist
      expect(
        await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.EVENT_TIMESTAMP,
          false
        )
      ).to.be.undefined;

      pastExpiration = 1555559155557;
      session = {
        [SESSION_VALUES.SESSION_ID]: 7000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.COUNT]: 3,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should return persisted eventTimestamp from memory', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      // Returns undefined and persists
      await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      clock.tick(1);
      const eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      // Returns persisted value
      expect(eventTimestamp).to.equal(session.eventTimestamp);

      // Check that new values have been persisted
      session[SESSION_VALUES.EVENT_TIMESTAMP] += 1;
      session[SESSION_VALUES.ACCESS_TIMESTAMP] += 1;

      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
    });

    it('should return persisted eventTimestamp from storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
        },
      };

      clock.tick(1);

      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime + 1,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime + 1,
        [SESSION_VALUES.ENGAGED]: undefined,
      };

      const eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      expect(eventTimestamp).to.equal(defaultTime);

      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      // Once to store session in memeory and once more to update eventTimestamp
      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });

    it('should reset eventTimestamp from expired session in storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          [SESSION_VALUES.SESSION_ID]: 5000,
          [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
          [SESSION_VALUES.COUNT]: 1,
          [SESSION_VALUES.EVENT_TIMESTAMP]: defaultTime,
        },
      };

      let pastExpiration = 1555557355556;
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      session = {
        [SESSION_VALUES.SESSION_ID]: 6000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.COUNT]: 2,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: undefined,
      };

      let eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        false
      );
      expect(eventTimestamp).to.equal(undefined);

      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );

      randomVal = 0.7;
      pastExpiration = 1555559155557;
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      storageSetSpy.resetHistory();

      session = {
        [SESSION_VALUES.SESSION_ID]: 7000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.COUNT]: 3,
        [SESSION_VALUES.EVENT_TIMESTAMP]: pastExpiration,
        [SESSION_VALUES.ENGAGED]: undefined,
      };

      eventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.EVENT_TIMESTAMP,
        true
      );
      expect(eventTimestamp).to.equal(undefined);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
    });
  });

  describe('engage', () => {
    it('should not be engaged for first creation', async () => {
      const engaged = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.ENGAGED
      );
      expect(engaged).to.be.false;
      // Gets set to true after first use
      expect(sessionManager.sessions_[vendorType][SESSION_VALUES.ENGAGED]).to.be
        .true;
    });

    it('should not be engaged for same session, but window closed/reopened', async () => {
      await sessionManager.getSessionValue(vendorType, SESSION_VALUES.ENGAGED);

      // Simulate closing window
      const sessionManager2 = new SessionManager(env.ampdoc);

      const engaged = await sessionManager2.getSessionValue(
        vendorType,
        SESSION_VALUES.ENGAGED
      );
      expect(engaged).to.be.false;
      // Set to true after being returning false once.
      expect(sessionManager2.sessions_[vendorType][SESSION_VALUES.ENGAGED]).to
        .be.true;
    });

    it('should not be engaged new session (session count 2)', async () => {
      await sessionManager.getSessionValue(vendorType, SESSION_VALUES.ENGAGED);

      // Expire session
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);

      const engaged = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.ENGAGED
      );
      expect(engaged).to.be.false;
      // Set to true after being returning false once.
      expect(sessionManager.sessions_[vendorType][SESSION_VALUES.ENGAGED]).to.be
        .true;
    });

    it('should be engaged on future calls', async () => {
      await sessionManager.getSessionValue(vendorType, SESSION_VALUES.ENGAGED);
      clock.tick(1);
      const engaged = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.ENGAGED
      );
      expect(engaged).to.be.true;
      expect(sessionManager.sessions_[vendorType][SESSION_VALUES.ENGAGED]).to.be
        .true;
    });

    it('should not persist storage for session in LocalStorage', async () => {
      session = {
        [SESSION_VALUES.SESSION_ID]: 5000,
        [SESSION_VALUES.CREATION_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.ACCESS_TIMESTAMP]: defaultTime,
        [SESSION_VALUES.COUNT]: 1,
        [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
        [SESSION_VALUES.ENGAGED]: undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        session
      );
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
