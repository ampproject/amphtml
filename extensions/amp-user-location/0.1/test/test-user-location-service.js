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
import {
  PermissionStatus,
  UserLocationService,
  UserLocationSource,
} from '../user-location-service';
import {PositionError} from '../position-error';
import {Services} from '../../../../src/services';

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
    it('should return location when user approves', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(location => {
        expect(location).to.include({lat: 10, lon: -10});
      });
    });

    it('should return location when user requests a second time', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service
        .requestLocation({})
        .then(location => {
          expect(location).to.include({lat: 10, lon: -10});
          return service.requestLocation({});
        })
        .then(location => {
          expect(win.navigator.geolocation.getCurrentPosition).to.have.been
            .calledTwice;
          expect(location).to.include({lat: 10, lon: -10});
        });
    });

    it('should not return location when user denies', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.PERMISSION_DENIED)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.PERMISSION_DENIED);
        }
      );
    });

    it('should not return location when geolocation timeouts', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.TIMEOUT)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.TIMEOUT);
        }
      );
    });

    it('should not return location when geolocation is unavailable', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.POSITION_UNAVAILABLE)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.POSITION_UNAVAILABLE);
        }
      );
    });

    it('should not return location when an unknown error occurs', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(-1)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(null);
        }
      );
    });

    it('should not return location when geolocation is not supported', () => {
      platformService.isChrome.returns(true);
      viewerService.isEmbedded.returns(true);
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.PLATFORM_UNSUPPORTED);
        }
      );
    });

    it('should not return location when geolocation is not available', () => {
      delete win.navigator.geolocation;

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.PLATFORM_UNSUPPORTED);
        }
      );
    });

    it('should return location when override is specified', () => {
      const userLocationOverride = '10,-10';
      getModeStub.returns({userLocationOverride, localDev: true});

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(location => {
        expect(win.navigator.geolocation.getCurrentPosition).to.not.have.been
          .called;
        expect(location).to.include({lat: 10, lon: -10});
      });
    });

    it('should not return location when override error is specified', () => {
      const error = 'error';
      getModeStub.returns({userLocationOverride: error, localDev: true});

      const service = new UserLocationService(new FakeAmpdoc());
      return service.requestLocation({}).then(
        () => {
          throw new Error('should not succeed');
        },
        err => {
          expect(err).to.equal(PositionError.POSITION_UNAVAILABLE);
        }
      );
    });
  });

  describe('exposed location information', () => {
    it('should return a value even if none are available', () => {
      const service = new UserLocationService(new FakeAmpdoc());

      return service.getLocation().then(position => {
        expect(position).to.include({source: UserLocationSource.UNAVAILABLE});
      });
    });

    it('should return results after the user approves geolocation', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service
        .requestLocation({})
        .then(() => {
          return service.getLocation();
        })
        .then(position => {
          expect(position).to.include({lat: 10, lon: -10});
        });
    });

    it(
      'should poll and return results if called before ' +
        'the user approves geolocation',
      () => {
        win.navigator.geolocation.getCurrentPosition.callsArgWith(
          0,
          getFakePosition(10, -10)
        );

        const service = new UserLocationService(new FakeAmpdoc());
        const results = service
          .getLocation(/*opt_poll*/ true)
          .then(position => {
            expect(position).to.include({lat: 10, lon: -10});
          });

        service.requestLocation({});
        return results;
      }
    );

    it('should return unavailable after the user denies geolocation', () => {
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        1,
        getFakeError(PositionError.PERMISSION_DENIED)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service
        .requestLocation({})
        .catch(error => {
          // swallow the error
          expect(error).to.equal(PositionError.PERMISSION_DENIED);
        })
        .then(() => {
          return service.getLocation();
        })
        .then(result => {
          expect(result).to.include({source: UserLocationSource.UNAVAILABLE});
        });
    });

    it('should return unavailable after the user removes approval', () => {
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
      return service
        .requestLocation({})
        .then(location => {
          expect(location).to.include({lat: 10, lon: -10});

          // Set up the event listener to respond as if the user
          // manually edited their settings to remove location
          // permission
          const fakeEvent = {
            target: {
              state: PermissionStatus.DENIED,
            },
          };
          // This should cause purge to be called.
          listener(fakeEvent);

          return service.getLocation({});
        })
        .then(result => {
          expect(result).to.include({source: UserLocationSource.UNAVAILABLE});
        });
    });

    it('should return unavailable if the platform does not support', () => {
      platformService.isChrome.returns(true);
      viewerService.isEmbedded.returns(true);
      win.navigator.geolocation.getCurrentPosition.callsArgWith(
        0,
        getFakePosition(10, -10)
      );

      const service = new UserLocationService(new FakeAmpdoc());
      return service.getLocation({}).then(location => {
        expect(location).to.include({
          source: UserLocationSource.UNSUPPORTED,
        });
      });
    });
  });
});
