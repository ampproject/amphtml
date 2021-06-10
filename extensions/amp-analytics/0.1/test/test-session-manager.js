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
  composeStorageSessionValue,
  installSessionServiceForTesting,
} from '../session-manager';
import {expect} from 'chai';
import {installVariableServiceForTesting} from '../variables';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {user} from '../../../../src/log';

describes.realWin('Session Manager', {amp: true}, (env) => {
  let win;
  let storageValue;
  let storageGetSpy, storageSetSpy, storageRemoveSpy;
  let sessionManager;
  let clock, randomVal;

  beforeEach(() => {
    win = env.win;

    storageValue = {};
    storageGetSpy = env.sandbox.spy();
    storageSetSpy = env.sandbox.spy();
    storageRemoveSpy = env.sandbox.spy();

    randomVal = 0.5;
    env.sandbox.stub(Math, 'random').callsFake(() => randomVal);
    clock = env.sandbox.useFakeTimers(1555555555555);

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
      const vendorType = 'myVendorType';
      const session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
      clock.tick(1);
      randomVal = 0.6;
      const vendorType2 = 'myVendorType2';
      const session2 = {
        'sessionId': 6000,
        'creationTimestamp': 1555555555556,
        'lastAccessTimestamp': 1555555555556,
        'count': 1,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType2)).to.deep.equals(session2);
      expect(sessionManager.sessions_[vendorType2]).to.deep.equals(session2);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(2);
    });

    it('should update existing session lastAccessTimestamp in memory and storage', async () => {
      const vendorType = 'myVendorType';
      const session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      clock.tick(1);
      session.lastAccessTimestamp = 1555555555556;
      // Get again, extend the session
      storageSetSpy.resetHistory();
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should not change creationTimestamp on update', async () => {
      const vendorType = 'myVendorType';
      const session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
      };
      await sessionManager.get(vendorType);

      clock.tick(1);
      session.lastAccessTimestamp = 1555555555556;

      storageSetSpy.resetHistory();
      const storedSession = await sessionManager.get(vendorType);
      expect(storedSession['creationTimestamp']).to.equal(
        session.creationTimestamp
      );
      expect(
        sessionManager.sessions_[vendorType]['creationTimestamp']
      ).to.equal(session.creationTimestamp);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should create a new session for an expired session', async () => {
      const vendorType = 'myVendorType';
      let session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      storageSetSpy.resetHistory();
      session = {
        'sessionId': 6000,
        'creationTimestamp': 1555557355556,
        'lastAccessTimestamp': 1555557355556,
        'count': 2,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should update count for a newly created a new session for an expired session', async () => {
      const vendorType = 'myVendorType';
      let storedSession = await sessionManager.get(vendorType);
      expect(storedSession['count']).to.equal(1);

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);

      storedSession = await sessionManager.get(vendorType);
      expect(storedSession['count']).to.equal(2);
      expect(sessionManager.sessions_[vendorType]['count']).to.equal(2);
    });

    it('should retrieve a non-expired session from storage', async () => {
      const vendorType = 'myVendorType';
      storageValue = {
        ['amp-session:' + vendorType]: {
          'ssid': 5000,
          'ct': 1555555555555,
          'lat': 1555555555555,
          'c': 1,
        },
      };

      clock.tick(1);
      const parsedSession = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555556,
        'count': 1,
        'lastEventTimestamp': undefined,
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
      const vendorType = 'myVendorType';
      storageValue = {
        ['amp-session:' + vendorType]: {
          'ssid': 5000,
          'ct': 1555555555555,
          'lat': 1555555555555,
          'c': 1,
        },
      };

      randomVal = 0.7;
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      const parsedSession = {
        'sessionId': 7000,
        'creationTimestamp': 1555557355556,
        'lastAccessTimestamp': 1555557355556,
        'count': 2,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);
    });

    // Not expected to be called
    it('should set count for a session without a count', async () => {
      const vendorType = 'myVendorType';
      storageValue = {
        ['amp-session:' + vendorType]: {
          'ssid': 5000,
          'ct': 1555555555555,
          'lat': 1555555555555,
        },
      };

      randomVal = 0.7;
      const parsedSession = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': undefined,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(
        parsedSession
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(
        parsedSession
      );
    });
  });

  describe('lastEventTimestamp', () => {
    let vendorType, session;

    beforeEach(() => {
      vendorType = 'myVendorType';
    });

    it('should return no lastEventTimestamp when first time calling', async () => {
      const lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      expect(lastEventTimestamp).to.be.undefined;
    });

    it('should persist the lastEventTimestamp', async () => {
      session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': 1555555555555,
      };
      const lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      expect(lastEventTimestamp).to.be.undefined;

      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should return no lastEventTimestamp when session has expired', async () => {
      // Returned undefined, stores LET in LS
      await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      storageSetSpy.resetHistory();
      // Expired session resets LET, returns undefined and persists
      expect(
        await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.LAST_EVENT_TIMESTAMP,
          true
        )
      ).to.be.undefined;
      session = {
        'sessionId': 6000,
        'creationTimestamp': 1555557355556,
        'lastAccessTimestamp': 1555557355556,
        'count': 2,
        'lastEventTimestamp': 1555557355556,
      };
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.7;

      storageSetSpy.resetHistory();
      // Expired session resets LET, returns undefined and does not persist
      expect(
        await sessionManager.getSessionValue(
          vendorType,
          SESSION_VALUES.LAST_EVENT_TIMESTAMP,
          false
        )
      ).to.be.undefined;
      session = {
        'sessionId': 7000,
        'creationTimestamp': 1555559155557,
        'lastAccessTimestamp': 1555559155557,
        'count': 3,
        'lastEventTimestamp': undefined,
      };
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);

      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should return persisted lastEventTimestamp from memory', async () => {
      session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
        'count': 1,
        'lastEventTimestamp': 1555555555555,
      };
      // Returns undefined and persists
      await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      clock.tick(1);
      const lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      // Returns persisted value
      expect(lastEventTimestamp).to.equal(session.lastEventTimestamp);

      // Persists new values
      session.lastEventTimestamp = session.lastEventTimestamp + 1;
      session.lastAccessTimestamp = session.lastAccessTimestamp + 1;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
    });

    it('should return persisted lastEventTimestamp from storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          'ssid': 5000,
          'ct': 1555555555555,
          'lat': 1555555555555,
          'c': 1,
          'let': 1555555555555,
        },
      };
      session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555556,
        'count': 1,
        'lastEventTimestamp': 1555555555556,
      };

      clock.tick(1);

      const lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      expect(lastEventTimestamp).to.equal(1555555555555);

      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      // Once to store session in memeory and once more to update LET
      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );
    });

    it('should reset lastEventTimestamp from expired session in storage', async () => {
      storageValue = {
        ['amp-session:' + vendorType]: {
          'ssid': 5000,
          'ct': 1555555555555,
          'lat': 1555555555555,
          'c': 1,
          'let': 1555555555555,
        },
      };
      session = {
        'sessionId': 5000,
        'creationTimestamp': 1555557355556,
        'lastAccessTimestamp': 1555557355556,
        'count': 2,
        'lastEventTimestamp': undefined,
      };

      clock.tick(SESSION_MAX_AGE_MILLIS + 1);

      let lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        false
      );
      expect(lastEventTimestamp).to.equal(undefined);

      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(storageSetSpy).to.be.calledOnce;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
      );

      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      storageSetSpy.resetHistory();

      lastEventTimestamp = await sessionManager.getSessionValue(
        vendorType,
        SESSION_VALUES.LAST_EVENT_TIMESTAMP,
        true
      );
      expect(lastEventTimestamp).to.equal(undefined);
      session = {
        'sessionId': 5000,
        'creationTimestamp': 1555559155557,
        'lastAccessTimestamp': 1555559155557,
        'count': 3,
        'lastEventTimestamp': 1555559155557,
      };
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(storageSetSpy).to.be.calledTwice;
      expect(storageSetSpy).to.be.calledWith(
        'amp-session:' + vendorType,
        composeStorageSessionValue(session)
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

    it('should return SESSION_VALUE.TIMESTAMP', async () => {
      let timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.TIMESTAMP
      );
      expect(timestamp).to.equal(1555555555555);

      clock.tick(1);
      timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.TIMESTAMP
      );
      expect(timestamp).to.equal(1555555555555);

      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      timestamp = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.TIMESTAMP
      );
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
