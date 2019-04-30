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

import {PositionError} from '../position-error';
import {Services} from '../../../../src/services';
import {UserLocationService} from '../user-location-service';

describes.sandboxed('amp-user-location', {}, () => {
  let win;
  let platformService;
  let viewerService;

  class FakeAmpdoc {}
  class FakeViewerService {}
  class FakePlatformService {}

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
    win = {navigator: {geolocation: {getCurrentPosition: sandbox.stub()}}};

    FakeAmpdoc.prototype.getWin = sandbox.stub().returns(win);
    FakeViewerService.prototype.isEmbedded = sandbox.stub().returns(false);
    FakePlatformService.prototype.isChrome = sandbox.stub().returns(false);

    platformService = new FakePlatformService();
    viewerService = new FakeViewerService();
    sandbox.stub(Services, 'platformFor').returns(platformService);
    sandbox.stub(Services, 'viewerForDoc').returns(viewerService);
  });

  it('should return location when user approves', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(0, getFakePosition(10, -10));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(location => {
      expect(location).to.include({lat: 10, lon: -10});
    });
  });

  it('should return location when user requests a second time', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(0, getFakePosition(10, -10));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(location => {
      expect(location).to.include({lat: 10, lon: -10});
      return service.requestLocation({});
    }).then(location => {
      expect(win.navigator.geolocation.getCurrentPosition)
          .to.have.been.calledTwice;
      expect(location).to.include({lat: 10, lon: -10});
    });
  });

  it('should not return location when user denies', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(1, getFakeError(PositionError.PERMISSION_DENIED));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    }, err => {
      expect(err).to.equal(PositionError.PERMISSION_DENIED);
    });
  });

  it('should not return location when geolocation timeouts', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(1, getFakeError(PositionError.TIMEOUT));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    }, err => {
      expect(err).to.equal(PositionError.TIMEOUT);
    });
  });

  it('should not return location when geolocatiom is unavailable', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(1, getFakeError(PositionError.POSITION_UNAVAILABLE));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    }, err => {
      expect(err).to.equal(PositionError.POSITION_UNAVAILABLE);
    });
  });

  it('should not return location when an unknown error occurs', () => {
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(1, getFakeError(-1));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    }, err => {
      expect(err).to.equal(undefined);
    });
  });

  it('should not return location when geolocation is not supported', () => {
    platformService.isChrome.returns(true);
    viewerService.isEmbedded.returns(true);
    win.navigator.geolocation.getCurrentPosition
        .callsArgWith(0, getFakePosition(10, -10));

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    },err => {
      expect(err).to.equal(PositionError.PLATFORM_UNSUPPORTED);
    });
  });

  it('should not return location when geolocation is not available', () => {
    delete win.navigator.geolocation;

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}).then(() => {
      throw new Error('should not succeed');
    },err => {
      expect(err).to.equal(PositionError.PLATFORM_UNSUPPORTED);
    });
  });

  it('should return location when override is specified', () => {
    const fakeUserLocationDef = {lat: 10, lon: -10};

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}, fakeUserLocationDef).then(location => {
      expect(win.navigator.geolocation.getCurrentPosition)
          .to.not.have.been.called;
      expect(location).to.include({lat: 10, lon: -10});
    });
  });

  it('should not return location when override error is specified', () => {
    const error = 'error';

    const service = new UserLocationService(new FakeAmpdoc());
    return service.requestLocation({}, error).then(() => {
      throw new Error('should not succeed');
    }, err => {
      expect(win.navigator.geolocation.getCurrentPosition)
          .to.not.have.been.called;
      expect(err).to.equal(PositionError.POSITION_UNAVAILABLE);
    });
  });
});
