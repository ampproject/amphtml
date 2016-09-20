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
import {a4aRegistry} from '../../../../ads/_config';
import {AmpAd} from '../amp-ad';
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD

    describe('ad resize', () => {
      it('should listen for resize events', () => {
        const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          return new Promise((resolve, unusedReject) => {
            const impl = element.implementation_;
            impl.layoutCallback();
            impl.updateSize_ = (newHeight, newWidth) => {
              expect(newHeight).to.equal(217);
              expect(newWidth).to.equal(114);
              resolve(impl);
            };
            impl.iframe_.onload = function() {
              impl.iframe_.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 217,
                width: 114,
                amp3pSentinel:
                    impl.iframe_.getAttribute('data-amp-3p-sentinel'),
              }, '*');
            };
            impl.iframe_.src = iframeSrc;
=======
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
            handler.buildCallback();
            expect(childElement(element,
                c => {
                  return c.tagName.indexOf('NONEXISTENT-TAG-TYPE') >= 0;
                }))
                .to.be.null;
            expect(childElement(element,
                c => {
                  return c.tagName === 'AMP-AD-3P-IMPL';
                })).to.not.be.null;
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
          });
        });

<<<<<<< HEAD
      it('should resize height only', () => {
        const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          return new Promise((resolve, unusedReject) => {
            const impl = element.implementation_;
            impl.layoutCallback();
            impl.updateSize_ = (newHeight, newWidth) => {
              expect(newHeight).to.equal(217);
              expect(newWidth).to.be.undefined;
              resolve(impl);
            };
            impl.iframe_.onload = function() {
              impl.iframe_.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 217,
                amp3pSentinel:
                    impl.iframe_.getAttribute('data-amp-3p-sentinel'),
              }, '*');
=======
=======
          });
        });

>>>>>>> ampproject/master
=======
          });
        });

>>>>>>> ampproject/master
        it('falls back to 3p for registered, non-A4A type', () => {
          return createIframePromise().then(fixture => {
            const doc = fixture.doc;
            a4aRegistry['zort'] = function() {
              return false;
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
            };
            const element = doc.createElement(tag);
            element.setAttribute('type', 'zort');
            element.setAttribute('width', '300');
            element.setAttribute('height', '200');
            doc.body.appendChild(element);
            const handler = new AmpAd(element);
            handler.buildCallback();
            expect(childElement(element,
                c => {
                  return c.tagName.indexOf('ZORT') >= 0;
                })).to.be.null;
            const expectedChild = childElement(element,
                c => {
                  return c.tagName === 'AMP-AD-3P-IMPL';
                });
            expect(expectedChild).to.not.be.null;
            expect(expectedChild.getAttribute('type')).to.equal('zort');
            expect(expectedChild.getAttribute('width')).to.equal('300');
            expect(expectedChild.getAttribute('height')).to.equal('200');
          });
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        }).then(impl => {
          expect(impl.iframe_.height).to.equal('217');
        });
      });

      it('should fallback for resize with overflow', () => {
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          const impl = element.implementation_;
          impl.attemptChangeSize = sandbox.spy();
          impl.updateSize_(217, 114);
          expect(impl.attemptChangeSize.callCount).to.equal(1);
          expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
          expect(impl.attemptChangeSize.firstCall.args[1]).to.equal(114);
        });
      });

      it('should fallback for resize (height only) with overflow', () => {
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          const impl = element.implementation_;
          impl.attemptChangeSize = sandbox.spy();
          impl.updateSize_(217);
          expect(impl.attemptChangeSize.callCount).to.equal(1);
          expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
        });
      });
    });

    it('should require a canonical', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'a9',
      }, null)).to.be.rejectedWith(/canonical/);
    });

    it('should require a type', () => {
      return expect(getAd({
        width: 300,
        height: 250,
      }, null)).to.be.rejectedWith(/type/);
    });

    it('must not be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'a9',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        ad.style.position = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('parent must not be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'a9',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        const s = document.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        ad.ownerDocument.body.appendChild(s);
        const p = ad.ownerDocument.getElementById('parent');
        p.className = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('amp-lightbox can be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'a9',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        const lightbox = document.createElement('amp-lightbox');
        lightbox.style.position = 'fixed';
        const p = ad.ownerDocument.getElementById('parent');
        p.parentElement.appendChild(lightbox);
        p.parentElement.removeChild(p);
        lightbox.appendChild(p);
        return ad;
      })).to.be.not.be.rejected;
    });

    describe('has no-content', () => {
      it('should display fallback', () => {
        return getAd({
          width: 300,
          height: 250,
          type: 'a9',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          expect(ad).to.not.have.class('amp-notsupported');
          ad.implementation_.noContentHandler_();
          expect(ad).to.have.class('amp-notsupported');
        });
      });

      it('should collapse when attemptChangeHeight succeeds', () => {
        return getAd({
          width: 300,
          height: 750,
          type: 'a9',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          return ad;
        }).then(ad => {
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          sandbox.stub(ad.implementation_,
              'attemptChangeHeight',
              function(height, callback) {
                ad.style.height = height;
                callback();
              });
          ad.style.position = 'absolute';
          ad.style.top = '300px';
          ad.style.left = '50px';
          expect(ad.style.display).to.not.equal('none');
          ad.implementation_.noContentHandler_();
          expect(ad.style.display).to.equal('none');
        });
      });

      it('should hide placeholder when ad falls back', () => {
        return getAd({
          width: 300,
          height: 750,
          type: 'a9',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const placeholder = document.createElement('div');
          placeholder.setAttribute('placeholder', '');
          ad.appendChild(placeholder);
          expect(placeholder.classList.contains('amp-hidden')).to.be.false;

          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          const placeholderEl = ad.querySelector('[placeholder]');
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          ad.implementation_.noContentHandler_();
          expect(placeholderEl.classList.contains('amp-hidden')).to.be.true;
        });
      });

      it('should destroy non-master iframe', () => {
        return getAd({
          width: 300,
          height: 750,
          type: 'a9',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const placeholder = document.createElement('div');
          placeholder.setAttribute('placeholder', '');
          ad.appendChild(placeholder);
          expect(placeholder.classList.contains('amp-hidden')).to.be.false;

          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          ad.implementation_.iframe_.setAttribute(
              'name', 'frame_doubleclick_0');
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          ad.implementation_.noContentHandler_();
          expect(ad.implementation_.iframe_).to.be.null;
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
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
