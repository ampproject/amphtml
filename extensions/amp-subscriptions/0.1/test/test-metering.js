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

import {Metering} from '../metering';

describes.fakeWin('Metering', {amp: true}, (env) => {
  /** @type {!Metering} */
  let metering;
  let savedMeteringState;
  let mockStorageService;

  beforeEach(() => {
    const {ampdoc} = env;
    const platformKey = 'subscribe.google.com';

    metering = new Metering({
      ampdoc,
      platformKey,
    });

    savedMeteringState = {key: 'value'};

    mockStorageService = {
      get: env.sandbox.fake(() => JSON.stringify(savedMeteringState)),
      setNonBoolean: env.sandbox.fake((storageKeyUnused, meteringState) => {
        savedMeteringState = JSON.parse(meteringState);
      }),
    };

    metering.storagePromise_ = Promise.resolve(mockStorageService);
  });

  describe('saveMeteringState', () => {
    it('saves state', async () => {
      const newMeteringState = {new: true};

      await metering.saveMeteringState(newMeteringState);

      expect(savedMeteringState).to.deep.equal(newMeteringState);
    });

    it('resets flag', async () => {
      metering.entitlementsWereFetchedWithCurrentMeteringState = true;

      await metering.saveMeteringState({new: true});

      expect(metering.entitlementsWereFetchedWithCurrentMeteringState).to.be
        .false;
    });

    it('avoids redundant saves', async () => {
      await metering.saveMeteringState(savedMeteringState);

      expect(mockStorageService.setNonBoolean).to.not.be.called;
    });

    it('handles failure', async () => {
      mockStorageService.setNonBoolean = env.sandbox.fake.throws('Fail whale');

      await metering.saveMeteringState({});

      expect(mockStorageService.setNonBoolean).to.be.calledOnce;
    });
  });

  describe('loadMeteringState', () => {
    it('loads state', async () => {
      const meteringState = await metering.loadMeteringState();

      expect(meteringState).to.deep.equal(savedMeteringState);
      expect(mockStorageService.get).to.be.calledOnce;
    });

    it('handles failure', async () => {
      expectAsyncConsoleError(/Fail whale/);

      mockStorageService.get = env.sandbox.fake.throws('Fail whale');

      const meteringState = await metering.loadMeteringState();

      expect(meteringState).to.equal(null);
      expect(mockStorageService.get).to.be.calledOnce;
    });
  });
});
