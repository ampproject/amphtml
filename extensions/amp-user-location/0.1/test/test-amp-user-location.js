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

import {AmpUserLocationEvent} from '../amp-user-location';
import {PositionError} from '../position-error';
import {Services} from '../../../../src/services';
import {UserLocationSource} from '../user-location';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-user-location',
  {
    amp: {
      extensions: ['amp-user-location'],
    },
  },
  env => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'amp-user-location', true);
    });

    function newUserLocation(opt_config) {
      const userLocation = doc.createElement('amp-user-location');
      doc.body.appendChild(userLocation);

      if (opt_config) {
        const configElement = win.document.createElement('script');
        configElement.setAttribute('type', 'application/json');
        if (typeof opt_config == 'string') {
          configElement.textContent = opt_config;
        } else {
          configElement.textContent = JSON.stringify(opt_config);
        }
        userLocation.appendChild(configElement);
      }

      return userLocation.build().then(() => userLocation);
    }

    it('should build if experiment is on', () => {
      const element = newUserLocation();
      return element.catch(unused => {
        throw new Error('component should have built');
      });
    });

    it('should not build if experiment is off', () => {
      return allowConsoleError(() => {
        toggleExperiment(env.win, 'amp-user-location', false);
        return newUserLocation().catch(err => {
          expect(err.message).to.include('experiment must be enabled');
        });
      });
    });

    it('should parse config when built, if present', () => {
      return Promise.all([
        newUserLocation()
          .then(element => element.getImpl())
          .then(impl => {
            expect(impl.config_).to.be.null;
          }),
        newUserLocation({})
          .then(element => element.getImpl())
          .then(impl => {
            expect(impl.config_).to.not.be.null;
          }),
      ]);
    });

    it('should error with invalid config', () => {
      return allowConsoleError(() => {
        return newUserLocation('this is not valid json').catch(err => {
          expect(err.message).to.include(
            'Failed to parse amp-user-location config'
          );
        });
      });
    });

    it('should parse recognized fields in the config', () => {
      const testConfig = {
        fallback: '40,-22',
        maximumAge: 60000,
        precision: 'low',
        timeout: 10000,
        doNotExpose: 'wow',
      };

      return newUserLocation(testConfig)
        .then(element => {
          return element.getImpl();
        })
        .then(impl => {
          expect(impl.config_).to.deep.include({
            fallback: {source: 'fallback', lat: 40, lon: -22},
            maximumAge: 60000,
            timeout: 10000,
          });
          expect(impl.config_).to.not.have.property('doNotExpose');
        });
    });

    it('should trigger the "approve" event if user approves geolocation', () => {
      class UserLocationFake {}
      UserLocationFake.prototype.requestLocation = sandbox.stub().resolves({
        lat: 10,
        lon: -10,
      });
      sandbox
        .stub(Services, 'userLocationForDocOrNull')
        .resolves(new UserLocationFake());

      let triggerSpy;
      return newUserLocation()
        .then(element => element.getImpl())
        .then(impl => {
          triggerSpy = sandbox.spy(impl, 'triggerEvent_');
          return impl.userLocationInteraction_();
        })
        .then(() => {
          expect(triggerSpy).to.have.been.calledWith(
            AmpUserLocationEvent.APPROVE,
            {lat: 10, lon: -10}
          );
        });
    });

    it('should trigger the "deny" event if user denies geolocation', () => {
      class UserLocationFake {}
      UserLocationFake.prototype.requestLocation = sandbox.stub().rejects({
        code: PositionError.PERMISSION_DENIED,
      });
      sandbox
        .stub(Services, 'userLocationForDocOrNull')
        .resolves(new UserLocationFake());

      let triggerSpy;
      return newUserLocation()
        .then(element => element.getImpl())
        .then(impl => {
          triggerSpy = sandbox.spy(impl, 'triggerEvent_');
          return impl.userLocationInteraction_();
        })
        .then(() => {
          expect(triggerSpy).to.have.been.calledWith(AmpUserLocationEvent.DENY);
        });
    });

    it(
      'should trigger the "deny" event with fallback if user' +
        ' denies geolocation',
      () => {
        class UserLocationFake {}
        UserLocationFake.prototype.requestLocation = sandbox.stub().rejects({
          code: PositionError.PERMISSION_DENIED,
          fallback: {source: UserLocationSource.FALLBACK, lat: 20, lon: -20},
        });
        sandbox
          .stub(Services, 'userLocationForDocOrNull')
          .resolves(new UserLocationFake());

        let triggerSpy;
        return newUserLocation({fallback: '20,-20'})
          .then(element => element.getImpl())
          .then(impl => {
            triggerSpy = sandbox.spy(impl, 'triggerEvent_');
            return impl.userLocationInteraction_();
          })
          .then(() => {
            expect(triggerSpy).to.have.been.calledWith(
              AmpUserLocationEvent.DENY,
              {
                'fallback': {
                  'source': UserLocationSource.FALLBACK,
                  'lat': 20,
                  'lon': -20,
                },
              }
            );
          });
      }
    );

    it('should trigger the "error" event if geolocation timeouts', () => {
      class UserLocationFake {}
      UserLocationFake.prototype.requestLocation = sandbox.stub().rejects({
        code: PositionError.TIMEOUT,
      });
      sandbox
        .stub(Services, 'userLocationForDocOrNull')
        .resolves(new UserLocationFake());

      let triggerSpy;
      return newUserLocation()
        .then(element => element.getImpl())
        .then(impl => {
          triggerSpy = sandbox.spy(impl, 'triggerEvent_');
          return impl.userLocationInteraction_();
        })
        .then(() => {
          expect(triggerSpy).to.have.been.calledWith(
            AmpUserLocationEvent.ERROR
          );
        });
    });

    it(
      'should trigger the "error" event with fallback if ' +
        'geolocation timeouts',
      () => {
        class UserLocationFake {}
        UserLocationFake.prototype.requestLocation = sandbox.stub().rejects({
          code: PositionError.TIMEOUT,
          fallback: {source: UserLocationSource.FALLBACK, lat: 20, lon: -20},
        });
        sandbox
          .stub(Services, 'userLocationForDocOrNull')
          .resolves(new UserLocationFake());

        let triggerSpy;
        return newUserLocation({fallback: '20,-20'})
          .then(element => element.getImpl())
          .then(impl => {
            triggerSpy = sandbox.spy(impl, 'triggerEvent_');
            return impl.userLocationInteraction_();
          })
          .then(() => {
            expect(triggerSpy).to.have.been.calledWith(
              AmpUserLocationEvent.ERROR,
              {
                'fallback': {
                  'source': UserLocationSource.FALLBACK,
                  'lat': 20,
                  'lon': -20,
                },
              }
            );
          });
      }
    );

    it('should trigger the "error" event if geolocation is unavailable', () => {
      class UserLocationFake {}
      UserLocationFake.prototype.requestLocation = sandbox
        .stub()
        .rejects({code: PositionError.POSITION_UNAVAILABLE});
      sandbox
        .stub(Services, 'userLocationForDocOrNull')
        .resolves(new UserLocationFake());

      let triggerSpy;
      return newUserLocation()
        .then(element => element.getImpl())
        .then(impl => {
          triggerSpy = sandbox.spy(impl, 'triggerEvent_');
          return impl.userLocationInteraction_();
        })
        .then(() => {
          expect(triggerSpy).to.have.been.calledWith(
            AmpUserLocationEvent.ERROR
          );
        });
    });

    it(
      'should trigger the "error" event if the platform ' +
        'does not support geolocation',
      () => {
        class UserLocationFake {}
        UserLocationFake.prototype.requestLocation = sandbox
          .stub()
          .rejects({code: PositionError.PLATFORM_UNSUPPORTED});
        sandbox
          .stub(Services, 'userLocationForDocOrNull')
          .resolves(new UserLocationFake());

        let triggerSpy;
        return newUserLocation()
          .then(element => element.getImpl())
          .then(impl => {
            triggerSpy = sandbox.spy(impl, 'triggerEvent_');
            return impl.userLocationInteraction_();
          })
          .then(() => {
            expect(triggerSpy).to.have.been.calledWith(
              AmpUserLocationEvent.ERROR
            );
          });
      }
    );
  }
);
