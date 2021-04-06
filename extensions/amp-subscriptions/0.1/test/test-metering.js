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

describes.fakeWin('Metering', {amp: true}, () => {
  /** @type {!Metering} */
  let metering;

  beforeEach(() => {
    const platformKey = 'subscribe.google.com';

    metering = new Metering({
      platformKey,
    });
  });

  describe('saveMeteringState', () => {
    it('saves state', async () => {
      const newMeteringState = {new: true};

      await metering.saveMeteringState(newMeteringState);
      const savedMeteringState = await metering.loadMeteringState();

      expect(savedMeteringState).to.deep.equal(newMeteringState);
    });

    it('resets flag', async () => {
      metering.entitlementsWereFetchedWithCurrentMeteringState = true;

      await metering.saveMeteringState({new: true});

      expect(metering.entitlementsWereFetchedWithCurrentMeteringState).to.be
        .false;
    });
  });

  describe('loadMeteringState', () => {
    it('loads state', async () => {
      const newMeteringState = {new: true};

      await metering.saveMeteringState(newMeteringState);
      const savedMeteringState = await metering.loadMeteringState();

      expect(savedMeteringState).to.deep.equal(newMeteringState);
    });

    it('returns null if state is not defined', async () => {
      const meteringState = await metering.loadMeteringState();

      expect(meteringState).to.equal(null);
    });
  });
});
