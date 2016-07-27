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
import {AmpAd} from '../amp-ad';
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {childElement} from '../../../../src/dom';
import {extensionsFor} from '../../../../src/extensions';
import * as sinon from 'sinon';

describe('A4A loader', () => {
  let sandbox;
  let registryBackup;
  const tagNames = ['amp-ad', 'amp-embed'];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    registryBackup = Object.create(null);
    Object.keys(a4aRegistry).forEach(k => {
      registryBackup[k] = a4aRegistry[k];
      delete a4aRegistry[k];
    });
  });

  afterEach(() => {
    Object.keys(registryBackup).forEach(k => {
      a4aRegistry[k] = registryBackup[k];
    });
    registryBackup = null;
    sandbox.restore();
  });

  tagNames.forEach(tag => {

    describe(tag, () => {
      let iframePromise;
      let ampAdElement;
      let ampAd;

      beforeEach(() => {
        iframePromise = createIframePromise().then(fixture => {
          const doc = fixture.doc;
          ampAdElement = doc.createElement(tag);
          ampAdElement.setAttribute('type', 'nonexistent-tag-type');
          ampAdElement.setAttribute('width', '300');
          ampAdElement.setAttribute('height', '200');
          doc.body.appendChild(ampAdElement);
          ampAd = new AmpAd(ampAdElement);
          return fixture;
        });
      });

      describe('#upgradeCallback', () => {
        it('falls back to 3p for unregistered type', () => {
          return iframePromise.then(() => {
            expect(ampAd.upgradeCallback()).to.be.instanceof(AmpAd3PImpl);
          });
        });

        it('falls back to 3p for registered, non-A4A type', () => {
          return iframePromise.then(() => {
            a4aRegistry['zort'] = function() {
              return false;
            };
            ampAdElement.setAttribute('type', 'zort');
            ampAd = new AmpAd(ampAdElement);
            expect(ampAd.upgradeCallback()).to.be.instanceof(AmpAd3PImpl);
          });
        });
      });

      it('upgrades to registered, A4A type network-specific element', () => {
        return iframePromise.then(fixture => {
          const extensionsMock = sandbox.mock(extensionsFor(fixture.win));
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          const zortInstance = {};
          const zortConstructor = function() { return zortInstance; };
          extensionsMock.expects('loadElementClass')
              .withExactArgs('amp-ad-network-zort-impl')
              .returns(Promise.resolve(zortConstructor)).once();
          ampAd = new AmpAd(ampAdElement);
          const upgradedElementPromise = ampAd.upgradeCallback();
          extensionsMock.verify();
          expect(upgradedElementPromise).not.to.be.null;
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          return upgradedElementPromise.then(baseElement => {
            expect(baseElement).to.equal(zortInstance);
          });
        });
      });

      it('falls back to 3p impl on upgrade with loadElementClass error', () => {
        return iframePromise.then(fixture => {
          const extensionsMock = sandbox.mock(extensionsFor(fixture.win));
          a4aRegistry['zort'] = function() {
            return true;
          };
          ampAdElement.setAttribute('type', 'zort');
          extensionsMock.expects('loadElementClass')
              .withExactArgs('amp-ad-network-zort-impl')
              .returns(Promise.resolve(new Error('I failed!')))
              .once();
          ampAd = new AmpAd(ampAdElement);
          const upgradedElementPromise = ampAd.upgradeCallback();
          extensionsMock.verify();
          expect(ampAdElement.getAttribute(
              'data-a4a-upgrade-type')).to.equal('amp-ad-network-zort-impl');
          return upgradedElementPromise.then(baseElement => {
            expect(baseElement instanceof AmpAd3PImpl).to.be.true;
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
          expect(ampAd.upgradeCallback()).to.not.be.null;
          expect(childElement(fixture.doc.head,
              c => {
                return c.tagName == 'SCRIPT' &&
                    c.getAttribute('custom-element') ===
                    'amp-ad-network-zort-impl';
              })).to.not.be.null;
        });
      });
    });
  });
});
