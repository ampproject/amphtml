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
import {
  resetExtensionScriptInsertedOrPresentForTesting,
} from '../../../../src/insert-extension';
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
    resetExtensionScriptInsertedOrPresentForTesting();
    Object.keys(registryBackup).forEach(k => {
      a4aRegistry[k] = registryBackup[k];
    });
    registryBackup = null;
    sandbox.restore();
  });

  tagNames.forEach(tag => {

    describe(tag, () => {

      describe('#buildCallback', () => {
        it('falls back to 3p for unregistered type', () => {
          return createIframePromise().then(fixture => {
            const doc = fixture.doc;
            const element = doc.createElement(tag);
            element.setAttribute('type', 'nonexistent-tag-type');
            element.setAttribute('width', '300');
            element.setAttribute('height', '200');
            doc.body.appendChild(element);
            const handler = new AmpAd(element);
            const impl = handler.upgradeCallback();
            expect(impl).to.be.instanceof(AmpAd3PImpl);
            expect(childElement(element,
                c => {
                  return c.tagName.indexOf('NONEXISTENT-TAG-TYPE') >= 0;
                }))
                .to.be.null;
          });
        });

        it('falls back to 3p for registered, non-A4A type', () => {
          return createIframePromise().then(fixture => {
            const doc = fixture.doc;
            a4aRegistry['zort'] = function() {
              return false;
            };
            const element = doc.createElement(tag);
            element.setAttribute('type', 'zort');
            element.setAttribute('width', '300');
            element.setAttribute('height', '200');
            doc.body.appendChild(element);
            const handler = new AmpAd(element);
            const impl = handler.upgradeCallback();
            expect(impl).to.be.instanceof(AmpAd3PImpl);
            expect(childElement(element,
                c => {
                  return c.tagName.indexOf('ZORT') >= 0;
                })).to.be.null;
          });
        });
      });

      it('adds network-specific child for registered, A4A type', () => {
        return createIframePromise().then(fixture => {
          const doc = fixture.doc;
          a4aRegistry['zort'] = function() {
            return true;
          };
          const element = doc.createElement(tag);
          element.setAttribute('type', 'zort');
          element.setAttribute('width', '300');
          element.setAttribute('height', '200');
          doc.body.appendChild(element);
          const handler = new AmpAd(element);
          expect(handler.upgradeCallback()).to.be.null;
          handler.buildCallback();
          const expectedChild = childElement(element,
              c => {
                return c.tagName.indexOf('ZORT') >= 0;
              });
          expect(expectedChild).to.not.be.null;
          expect(childElement(element,
              c => {
                return c.tagName === 'AMP-AD-3P-IMPL';
              })).to.be.null;
          expect(expectedChild).to.not.be.null;
          expect(expectedChild.getAttribute('type')).to.equal('zort');
          expect(expectedChild.getAttribute('width')).to.equal('300');
          expect(expectedChild.getAttribute('height')).to.equal('200');
        });
      });

      it('adds script to header for registered, A4A type', () => {
        return createIframePromise().then(fixture => {
          const doc = fixture.doc;
          a4aRegistry['zort'] = function() {
            return true;
          };
          const element = doc.createElement(tag);
          element.setAttribute('type', 'zort');
          element.setAttribute('width', '300');
          element.setAttribute('height', '200');
          doc.body.appendChild(element);
          const handler = new AmpAd(element);
          expect(handler.upgradeCallback()).to.be.null;
          handler.buildCallback();
          expect(childElement(doc.head,
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
