/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as mode from '../../../../src/mode';
import {PermissionStatus, UserLocationService} from '../user-location-service';
import {PositionError} from '../position-error';
import {Services} from '../../../../src/services';
import {UserLocationSource} from '../user-location';

describes.sandboxed('user-location-service', {}, () => {
  let win;
  let platformService;
  let viewerService;
  let getModeStub;

  class FakeAmpdoc {}
  class FakeViewerService {}
  class FakePlatformService {}
  class FakePermissionStatus {}

  function getFakePosition(lat, lon) {
    return {coords: {latitude: lat, longitude: lon}};
  }

  function getFakeError(code) {
    return {
      code,
      PERMISSION_DENIED: PositionError.PERMISSION_DENIED,
      POSITION_UNAVAILABLE: PositionError.POSITION_UNAVAILABLE,
      TIMEOUT: PositionError.TIMEOUT,
    };
  }

  beforeEach(() => {
    win = {
      navigator: {
        geolocation: {getCurrentPosition: sandbox.stub()},
        permissions: {
          query: sandbox.stub().resolves(new FakePermissionStatus()),
        },
      },
    };

    FakeAmpdoc.prototype.win = win;
    FakeViewerService.prototype.isEmbedded = sandbox.stub().returns(false);
    FakePlatformService.prototype.isChrome = sandbox.stub().returns(false);
    FakePermissionStatus.prototype.addEventListener = sandbox.stub();

    platformService = new FakePlatformService();
    viewerService = new FakeViewerService();
    sandbox.stub(Services, 'platformFor').returns(platformService);
    sandbox.stub(Services, 'viewerForDoc').returns(viewerService);
    getModeStub = sandbox.stub(mode, 'getMode').returns({});
  });

  describe('location requests', () => {
    it('should return location when user approves', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      const position = await service.requestLocation({});
      expect(position).to.include({lat: 10, lon: -10});
    });

    it('should return location when user requests a second time', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      const position = await service.requestLocation({});
      expect(position).to.include({lat: 10, lon: -10});

      const secondPosition = await service.requestLocation({});
      expect(win.navigator.geolocation.getCurrentPosition).to.have.been
        .calledTwice;
      expect(secondPosition).to.include({lat: 10, lon: -10});
    });

    it('should not return location when user denies', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.PERMISSION_DENIED)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PERMISSION_DENIED);
      }
    });

    it('should return fallback when user denies with fallback', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.PERMISSION_DENIED)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PERMISSION_DENIED);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should not return location when geolocation timeouts', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.TIMEOUT)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.TIMEOUT);
      }
    });

    it('should return fallback when geolocation timeouts with fallback', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.TIMEOUT)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.TIMEOUT);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should not return location when geolocation is unavailable', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.POSITION_UNAVAILABLE)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.POSITION_UNAVAILABLE);
      }
    });

    it('should return fallback when geolocation is unavailable with fallback', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.POSITION_UNAVAILABLE)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.POSITION_UNAVAILABLE);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should not return location when an unknown error occurs', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(-1)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(undefined);
      }
    });

    it('should return fallback when an unknown error occurs with fallback', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(-1)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(undefined);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should not return location when geolocation is not supported', async () => {
      platformService.isChrome.returns(true);
      viewerService.isEmbedded.returns(true);
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PLATFORM_UNSUPPORTED);
      }
    });

    it('should return fallback when geolocation is not supported with fallback', async () => {
      platformService.isChrome.returns(true);
      viewerService.isEmbedded.returns(true);
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PLATFORM_UNSUPPORTED);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should not return location when geolocation is not available', async () => {
      delete win.navigator.geolocation;

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PLATFORM_UNSUPPORTED);
      }
    });

    it('should return fallback when geolocation is not available with fallback', async () => {
      delete win.navigator.geolocation;

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({fallback: {lat: 20, lon: -20}});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.PLATFORM_UNSUPPORTED);
        expect(e.fallback).to.deep.include({
          source: UserLocationSource.FALLBACK,
          lat: 20,
          lon: -20,
        });
      }
    });

    it('should return override when override is specified', async () => {
      const userLocationOverride = '10,-10';
      getModeStub.returns({userLocationOverride, localDev: true});

      const service = new UserLocationService(new FakeAmpdoc());
      const position = await service.requestLocation({});

      expect(win.navigator.geolocation.getCurrentPosition).to.not.have.been
        .called;
      expect(position).to.include({lat: 10, lon: -10});
    });

    it('should not return location when override error is specified', async () => {
      const error = 'error';
      getModeStub.returns({userLocationOverride: error, localDev: true});

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        await service.requestLocation({});
        throw new Error('should not succeed');
      } catch (e) {
        expect(e).to.match(/geolocation/);
        expect(e.code).to.equal(PositionError.POSITION_UNAVAILABLE);
      }
    });
  });

  describe('exposed location information', () => {
    it('should return a value even if none are available', async () => {
      const service = new UserLocationService(new FakeAmpdoc());

      const position = await service.getLocation();
      expect(position).to.include({source: UserLocationSource.UNAVAILABLE});
    });

    it('should return results after the user approves geolocation', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      await service.requestLocation({});

      const position = await service.getLocation();
      expect(position).to.include({lat: 10, lon: -10});
    });

    it(
      'should poll and return results if called before ' +
        'the user approves geolocation',
      async () => {
        win.navigator.geolocation.getCurrentPosition.callsArgWith(
          0,
          getFakePosition(10, -10)
        );

        const service = new UserLocationService(new FakeAmpdoc());
        const result = await Promise.all([
          service.getLocation(/*opt_poll*/ true),
          service.requestLocation({}),
        ]);

        const position = result[0];
        expect(position).to.include({lat: 10, lon: -10});
      }
    );

    it('should return unavailable after the user denies geolocation', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.PERMISSION_DENIED)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      try {
        service.requestLocation({});
      } catch (e) {
        expect(e).to.match(/geolocation/);
        // swallow the error
        expect(e.code).to.equal(PositionError.PERMISSION_DENIED);
      }

      const position = await service.getLocation();
      expect(position).to.include({source: UserLocationSource.UNAVAILABLE});
    });

    it('should return unavailable after the user removes approval', async () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      // Save a reference to the permission change listener
      // so we can manually trigger it.
      const fakeStatus = new FakePermissionStatus();
      let listener;
      fakeStatus.addEventListener.callsFake((unusedName, cb) => {
        listener = cb;
      });
      win.navigator.permissions.query.resolves(fakeStatus);

      const service = new UserLocationService(new FakeAmpdoc());
      const position = await service.requestLocation({});
      expect(position).to.include({lat: 10, lon: -10});

      // Set up the event listener to respond as if the user
      // manually edited their settings to remove location
      // permission
      const fakeEvent = {target: {state: PermissionStatus.DENIED}};
      // This causes purge() to be called.
      listener(fakeEvent);

      const clearedPosition = await service.getLocation();
      expect(clearedPosition).to.include({
        source: UserLocationSource.UNAVAILABLE,
      });
    });

    it('should return unsupported if the platform does not support', async () => {
      platformService.isChrome.returns(true);
      viewerService.isEmbedded.returns(true);
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      const position = await service.getLocation();
      expect(position).to.include({source: UserLocationSource.UNSUPPORTED});
    });
  });
});
