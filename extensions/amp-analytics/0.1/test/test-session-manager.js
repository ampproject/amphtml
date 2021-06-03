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
      };
      expect(await sessionManager.get(vendorType2)).to.deep.equals(session2);
      expect(sessionManager.sessions_[vendorType2]).to.deep.equals(session2);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(2);
    });

    it('should update an existing session in memory and storage', async () => {
      const vendorType = 'myVendorType';
      const session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
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

    it('should create a new session for an expired session', async () => {
      const vendorType = 'myVendorType';
      let session = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555555,
      };
      expect(await sessionManager.get(vendorType)).to.deep.equals(session);
      expect(sessionManager.sessions_[vendorType]).to.deep.equals(session);
      expect(Object.keys(sessionManager.sessions_).length).to.equal(1);

      // Go past expiration
      clock.tick(SESSION_MAX_AGE_MILLIS + 1);
      randomVal = 0.6;

      // Clear local storage
      storageSetSpy.resetHistory();
      storageValue = {};
      session = {
        'sessionId': 6000,
        'creationTimestamp': 1555557355556,
        'lastAccessTimestamp': 1555557355556,
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

    it('should retrieve a non-expired session from storage', async () => {
      const vendorType = 'myVendorType';
      storageValue = {
        ['amp-session:' + vendorType]: {'ssid': 5000, 'ct': 1555555555555},
      };

      clock.tick(1);
      const parsedSession = {
        'sessionId': 5000,
        'creationTimestamp': 1555555555555,
        'lastAccessTimestamp': 1555555555556,
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

  describe('getSessionValue', () => {
    it('should return undefined on no type', async () => {
      const id = await sessionManager.getSessionValue(
        undefined,
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.be.undefined;
    });

    it('should return SESSION_VALUE.SESSION_ID', async () => {
      const id = await sessionManager.getSessionValue(
        'myVendorType',
        SESSION_VALUES.SESSION_ID
      );
      expect(id).to.equal(5000);
    });
  });
});
