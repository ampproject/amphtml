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

import {AmpAd} from '../amp-ad';
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {Services} from '../../../../src/services';
import {adConfig} from '../../../../ads/_config';
import {getA4ARegistry} from '../../../../ads/_a4a-config';
import {stubService} from '../../../../testing/test-helper';
import {toggleExperiment} from '../../../../src/experiments';


describes.realWin('Ad loader', {amp: true}, env => {
  let win, doc;
  const a4aRegistry = getA4ARegistry();
  let a4aRegistryBackup;
  let registryBackup;
  const tagNames = ['amp-ad', 'amp-embed'];

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    a4aRegistryBackup = Object.create(null);
    Object.keys(a4aRegistry).forEach(k => {
      a4aRegistryBackup[k] = a4aRegistry[k];
      delete a4aRegistry[k];
    });
    registryBackup = Object.create(null);
    Object.keys(adConfig).forEach(k => {
      registryBackup[k] = adConfig[k];
      delete adConfig[k];
    });
    adConfig['_ping_'] = {};
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
  });

  tagNames.forEach(tag => {

    describe(tag, () => {
      let ampAdElement;
      let ampAd;
      let userNotificationResolver;

      beforeEach(() => {
        const getUserNotificationStub = stubService(
            sandbox, win, 'userNotificationManager', 'get');
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
      });

      describe('with consent-notification-id, upgradeCallback', () => {
        it('should block for notification dismissal', () => {
          ampAdElement.setAttribute('data-consent-notification-id', 'notif');

          return Promise.race([
            ampAd.upgradeCallback().then(() => {
              throw new Error('upgradeCallback should not resolve without ' +
                'notification dismissal');
            }),
            Services.timerFor(win).promise(25),
          ]);
        });

        it('should resolve once notification is dismissed', () => {
          ampAdElement.setAttribute('data-consent-notification-id', 'notif');

          setTimeout(userNotificationResolver, 25);
          return ampAd.upgradeCallback();
        });
      });

      describe('#upgradeCallback', () => {
        it('fails upgrade on unregistered type', () => {
          ampAdElement.setAttribute('type', 'zort');
          return expect(ampAd.upgradeCallback()).to.eventually.be.rejected;
        });

        it('falls back to 3p for registered, non-A4A type', () => {
          ampAd = new AmpAd(ampAdElement);
          return expect(ampAd.upgradeCallback())
              .to.eventually.be.instanceof(AmpAd3PImpl);
        });

        it('selects into dblclick DF white list deprecation exp', () => {
          ampAdElement.setAttribute('type', 'doubleclick');
          toggleExperiment(win, 'dcdf-whitelist-deprecation');
          new AmpAd(ampAdElement).upgradeCallback().then(() => {
            expect(ampAdElement
                .getAttribute('data-amp-is-in-dcdfwld-experiment')).to.be.ok;
            expect(ampAdElement.getAttribute('experimentId')).to.be.ok;
          });
        });
      });

      it('fails upgrade on A4A upgrade with loadElementClass error', () => {
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        const extensions = Services.extensionsFor(win);
        const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
            .withArgs('amp-ad-network-zort-impl')
            .returns(Promise.reject(new Error('I failed!')));
        ampAd = new AmpAd(ampAdElement);
        return ampAd.upgradeCallback().then(baseElement => {
          expect(extensionsStub).to.be.called;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          expect(baseElement).to.be.instanceof(AmpAd3PImpl);
        });
      });

      it('falls back to Delayed Fetch if remote.html is used', () => {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', 'https://example.com/remote.html');
        doc.head.appendChild(meta);
        a4aRegistry['zort'] = (win, element, useRemoteHtml) => {
          return !useRemoteHtml;
        };
        ampAdElement.setAttribute('type', 'zort');
        const upgraded = new AmpAd(ampAdElement).upgradeCallback();
        return expect(upgraded).to.eventually.be.instanceof(AmpAd3PImpl);
      });

      it('uses Fast Fetch if just RTC is used', () => {
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        ampAdElement.setAttribute('type', 'zort');
        ampAdElement.setAttribute('rtc-config', '{"urls": ["https://a.qqq"]}');
        const zortInstance = {};
        const zortConstructor = function() { return zortInstance; };
        const extensions = Services.extensionsFor(win);
        const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
            .withArgs('amp-ad-network-zort-impl')
            .returns(Promise.resolve(zortConstructor));
        ampAd = new AmpAd(ampAdElement);
        return ampAd.upgradeCallback().then(baseElement => {
          expect(extensionsStub).to.be.called;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          expect(baseElement).to.equal(zortInstance);
        });
      });

      it('uses Fast Fetch if remote.html and RTC are used', () => {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', 'https://example.com/remote.html');
        doc.head.appendChild(meta);
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        ampAdElement.setAttribute('rtc-config', '{"urls": ["https://a.qqq"]}');
        const zortInstance = {};
        const zortConstructor = function() { return zortInstance; };
        const extensions = Services.extensionsFor(win);
        const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
            .withArgs('amp-ad-network-zort-impl')
            .returns(Promise.resolve(zortConstructor));
        ampAd = new AmpAd(ampAdElement);
        return ampAd.upgradeCallback().then(baseElement => {
          expect(extensionsStub).to.be.called;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          expect(baseElement).to.equal(zortInstance);
        });
      });

      it('uses Fast Fetch if remote.html is used but disabled', () => {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', 'https://example.com/remote.html');
        doc.head.appendChild(meta);
        adConfig['zort'] = {remoteHTMLDisabled: true};
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        const zortInstance = {};
        const zortConstructor = function() { return zortInstance; };
        const extensions = Services.extensionsFor(win);
        const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
            .withArgs('amp-ad-network-zort-impl')
            .returns(Promise.resolve(zortConstructor));
        ampAd = new AmpAd(ampAdElement);
        return ampAd.upgradeCallback().then(baseElement => {
          expect(extensionsStub).to.be.called;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          expect(baseElement).to.equal(zortInstance);
        });
      });

      it('upgrades to registered, A4A type network-specific element', () => {
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        const zortInstance = {};
        const zortConstructor = function() { return zortInstance; };
        const extensions = Services.extensionsFor(win);
        const extensionsStub = sandbox.stub(extensions, 'loadElementClass')
            .withArgs('amp-ad-network-zort-impl')
            .returns(Promise.resolve(zortConstructor));
        ampAd = new AmpAd(ampAdElement);
        return ampAd.upgradeCallback().then(baseElement => {
          expect(extensionsStub).to.be.called;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          expect(baseElement).to.equal(zortInstance);
        });
      });

      it('adds script to header for registered, A4A type', () => {
        a4aRegistry['zort'] = function() {
          return true;
        };
        ampAdElement.setAttribute('type', 'zort');
        ampAd = new AmpAd(ampAdElement);
        const upgradePromise = ampAd.upgradeCallback();
        Promise.resolve().then(() => {
          Services.vsyncFor(win).mutate(() => {
            const zortInstance = {};
            const zortConstructor = function() { return zortInstance; };
            const extensions = Services.extensionsFor(win);
            extensions.registerExtension_('amp-ad-network-zort-impl', () => {
              extensions.addElement_('amp-ad-network-zort-impl',
                  zortConstructor);
            }, {});
          });
        });
        return upgradePromise.then(element => {
          expect(element).to.not.be.null;
          expect(doc.head.querySelector(
              'script[custom-element="amp-ad-network-zort-impl"]'))
              .to.not.be.null;
        });
      });
    });
  });
});
