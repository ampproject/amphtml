/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../../../testing/iframe';
import {a4aRegistry} from '../../../../ads/_a4a-config';
import {adConfig} from '../../../../ads/_config';
import {AmpAd} from '../amp-ad';
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {extensionsFor} from '../../../../src/services';
import {stubService} from '../../../../testing/test-helper';
import {timerFor} from '../../../../src/services';
import * as sinon from 'sinon';

describe('Ad loader', () => {
  let sandbox;
  let a4aRegistryBackup;
  let registryBackup;
  const tagNames = ['amp-ad', 'amp-embed'];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    a4aRegistryBackup = Object.create(null);
    Object.keys(a4aRegistry).forEach(k => {
      a4aRegistryBackup[k] = a4aRegistry[k];
      delete a4aRegistry[k];
    });
    registryBackup = Object.create(null);
    Object.keys(adConfig).forEach(k => {
      registryBackup[k] = adConfig[k];
    });
  });

  afterEach(() => {
    Object.keys(a4aRegistryBackup).forEach(k => {
      a4aRegistry[k] = a4aRegistryBackup[k];
    });
    a4aRegistryBackup = null;
    Object.keys(registryBackup).forEach(k => {
      adConfig[k] = registryBackup[k];
    });
    registryBackup = null;
    sandbox.restore();
  });

  tagNames.forEach(tag => {

    describe(tag, () => {
      let iframePromise;
      let ampAdElement;
      let ampAd;
      let userNotificationResolver;

      beforeEach(() => {
        iframePromise = createIframePromise().then(fixture => {
          const doc = fixture.doc;
          const getUserNotificationStub = stubService(
              sandbox, fixture.win, 'userNotificationManager', 'get');
          getUserNotificationStub.withArgs('notif')
              .returns(new Promise(resolve => {
                userNotificationResolver = resolve;
              }));

          ampAdElement = doc.createElement(tag);
          ampAdElement.setAttribute('type', '_ping_');
          ampAdElement.setAttribute('width', '300');
          ampAdElement.setAttribute('height', '200');
          doc.body.appendChild(ampAdElement);
          ampAd = new AmpAd(ampAdElement);
          return fixture;
        });
      });

      describe('with consent-notification-id, upgradeCallback', () => {
        it('should block for notification dismissal', () => {
          return iframePromise.then(fixture => {
            ampAdElement.setAttribute('data-consent-notification-id', 'notif');

            return Promise.race([
              ampAd.upgradeCallback().then(() => {
                throw new Error('upgradeCallback should not resolve without ' +
                  'notification dismissal');
              }),
              timerFor(fixture.win).promise(25),
            ]);
          });
        });

        it('should resolve once notification is dismissed', () => {
          return iframePromise.then(() => {
            ampAdElement.setAttribute('data-consent-notification-id', 'notif');

            setTimeout(userNotificationResolver, 25);
            return ampAd.upgradeCallback();
          });
        });
      });

      describe('#upgradeCallback', () => {
        it('fails upgrade on unregistered type', () => {
          return iframePromise.then(() => {
            ampAdElement.setAttribute('type', 'zort');
            return expect(ampAd.upgradeCallback()).to.eventually.be.rejected;
          });
        });

        it('falls back to 3p for registered, non-A4A type', () => {
          return iframePromise.then(() => {
            ampAd = new AmpAd(ampAdElement);
            return expect(ampAd.upgradeCallback())
                .to.eventually.be.instanceof(AmpAd3PImpl);
          });
        });
      });

      it('fails upgrade on A4A upgrade with loadElementClass error', () => {
        return iframePromise.then(fixture => {
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          const extensions = extensionsFor(fixture.win);
          const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
              .withArgs('amp-ad-network-zort-impl')
              .returns(Promise.reject(new Error('I failed!')));
          ampAd = new AmpAd(ampAdElement);
          return ampAd.upgradeCallback().then(baseElement => {
            expect(extensionsStub).to.be.calledAtLeastOnce;
            expect(ampAdElement.getAttribute(
                'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
            expect(baseElement).to.be.instanceof(AmpAd3PImpl);
          });
        });
      });

      it('falls back to Delayed Fetch if remote.html is used', () => {
        return iframePromise.then(({doc}) => {
          const meta = doc.createElement('meta');
          meta.setAttribute('name', 'amp-3p-iframe-src');
          meta.setAttribute('content', 'https://example.com/remote.html');
          doc.head.appendChild(meta);
          a4aRegistry['zort'] = () => {
            throw new Error('predicate should not execute if remote.html!');
          };
          ampAdElement.setAttribute('type', 'zort');
          const upgraded = new AmpAd(ampAdElement).upgradeCallback();
          return expect(upgraded).to.eventually.be.instanceof(AmpAd3PImpl);
        });
      });

      it('uses Fast Fetch if remote.html is used but disabled', () => {
        return iframePromise.then(fixture => {
          const meta = fixture.doc.createElement('meta');
          meta.setAttribute('name', 'amp-3p-iframe-src');
          meta.setAttribute('content', 'https://example.com/remote.html');
          fixture.doc.head.appendChild(meta);
          adConfig['zort'] = {remoteHTMLDisabled: true};
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          const zortInstance = {};
          const zortConstructor = function() { return zortInstance; };
          const extensions = extensionsFor(fixture.win);
          const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
              .withArgs('amp-ad-network-zort-impl')
              .returns(Promise.resolve(zortConstructor));
          ampAd = new AmpAd(ampAdElement);
          return ampAd.upgradeCallback().then(baseElement => {
            expect(extensionsStub).to.be.calledAtLeastOnce;
            expect(ampAdElement.getAttribute(
                'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
            expect(baseElement).to.equal(zortInstance);
          });
        });
      });

      it('upgrades to registered, A4A type network-specific element', () => {
        return iframePromise.then(fixture => {
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          const zortInstance = {};
          const zortConstructor = function() { return zortInstance; };
          const extensions = extensionsFor(fixture.win);
          const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
              .withArgs('amp-ad-network-zort-impl')
              .returns(Promise.resolve(zortConstructor));
          ampAd = new AmpAd(ampAdElement);
          return ampAd.upgradeCallback().then(baseElement => {
            expect(extensionsStub).to.be.calledAtLeastOnce;
            expect(ampAdElement.getAttribute(
                'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
            expect(baseElement).to.equal(zortInstance);
          });
        });
      });

      it('adds script to header for registered, A4A type', () => {
        return iframePromise.then(fixture => {
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          ampAd = new AmpAd(ampAdElement);
          ampAd.upgradeCallback().then(element => {
            expect(element).to.not.be.null;
            expect(fixture.doc.head.querySelector(
                'script[custom-element="amp-ad-network-zort-impl"]'))
                .to.not.be.null;
          });
        });
      });
    });
  });
});
