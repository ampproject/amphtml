/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {clientIdScope} from '../../ads/_config';
import {createAdPromise} from '../../testing/ad-iframe';
import {installCidService} from '../../extensions/amp-analytics/0.1/cid-impl';
import {
  installUserNotificationManager,
} from '../../extensions/amp-user-notification/0.1/amp-user-notification';
import {getAdCid} from '../../src/ad-cid';
import {setCookie} from '../../src/cookies';
import {timerFor} from '../../src/timer';
import * as sinon from 'sinon';


// TODO: I'm not sure if this is fully kosher.  This test asks, 'does the
// CID get written to the element properly?'  When amp-ad is actually a delegate
// to either amp-a4a or amp-ad-3p-impl, the CID gets written only to the
// 3p-impl child Element.  Changing the test in this way checks that the CID
// appears on the 3p-impl child, rather than the (delegating) parent.  That
// should (?) be enough to ensure that it's propagated forward to the ad in the
// 3p iframe.
// describe('ad-cid-embed', tests('amp-embed'));
describe('ad-cid', tests('amp-ad'));

function tests(name) {
  function getAd(attributes, canonical, opt_handleElement,
                 opt_beforeLayoutCallback) {
    return createAdPromise(name, attributes, canonical,
                           opt_handleElement, opt_beforeLayoutCallback);
  }

  return () => {
    describe('cid-ad support', () => {
      const cidScope = 'cid-in-ads-test';
      let sandbox;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });

      afterEach(() => {
        sandbox.restore();
        delete clientIdScope['_ping_'];
        setCookie(window, cidScope, '', Date.now() - 5000);
      });

      describe('unit test', () => {
        let clock;
        let element;
        let adElement;
        beforeEach(() => {
          clock = sandbox.useFakeTimers();
          element = document.createElement('amp-ad');
          element.setAttribute('type', '_ping_');
          adElement = {
            element,
            win: window,
          };
        });

        it('provides cid to ad', () => {
          clientIdScope['_ping_'] = cidScope;
          const s = installCidService(window);
          sandbox.stub(s, 'get', scope => {
            expect(scope).to.be.equal(cidScope);
            return Promise.resolve('test123');
          });
          return getAdCid(adElement).then(cid => {
            expect(cid).to.equal('test123');
          });
        });

        it('times out', () => {
          clientIdScope['_ping_'] = cidScope;
          const s = installCidService(window);
          sandbox.stub(s, 'get', scope => {
            expect(scope).to.be.equal(cidScope);
            return timerFor(window).promise(2000);
          });
          const p = getAdCid(adElement).then(cid => {
            expect(cid).to.be.undefined;
            expect(Date.now()).to.equal(1000);
          });
          clock.tick(999);
          // Let promises resolve before ticking 1 more ms.
          Promise.resolve().then(() => {
            clock.tick(1);
          });
          return p;
        });
      });

      it('provides cid to ad', () => {
        clientIdScope['_ping_'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          setCookie(window, cidScope, 'sentinel123',
              Date.now() + 5000);
          installCidService(win);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('sentinel123');
        });
      });

      it('proceeds on failed CID', () => {
        clientIdScope['_ping_'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          const service = installCidService(win);
          sandbox.stub(service, 'get',
              () => Promise.reject(new Error('nope')));
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.be.null;
        });
      });

      it('waits for consent', () => {
        clientIdScope['_ping_'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
          'data-consent-notification-id': 'uid',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          const cidService = installCidService(win);
          const uidService = installUserNotificationManager(win);
          sandbox.stub(uidService, 'get', id => {
            expect(id).to.equal('uid');
            return Promise.resolve('consent');
          });
          sandbox.stub(cidService, 'get', (scope, consent) => {
            expect(scope).to.equal(cidScope);
            return consent.then(val => {
              return val + '-cid';
            });
          });
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('consent-cid');
        });
      });

      it('waits for consent w/o cidScope', () => {
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
          'data-consent-notification-id': 'uid',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          const cidService = installCidService(win);
          const uidService = installUserNotificationManager(win);
          sandbox.stub(uidService, 'get', id => {
            expect(id).to.equal('uid');
            return Promise.resolve('consent');
          });
          sandbox.stub(cidService, 'get', (scope, consent) => {
            expect(scope).to.equal(cidScope);
            return consent.then(val => {
              return val + '-cid';
            });
          });
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('consent');
        });
      });

      it('provide null if notification and cid is not provided', () => {
        let uidSpy = null;
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          const cidService = installCidService(win);
          const uidService = installUserNotificationManager(win);
          uidSpy = sandbox.spy(uidService, 'get');
          sandbox.stub(cidService, 'get', (scope, consent) => {
            expect(scope).to.equal(cidScope);
            return consent.then(val => {
              return val + '-cid';
            });
          });
          return ad;
        }).then(ad => {
          expect(uidSpy.callCount).to.equal(0);
          expect(ad.getAttribute('ampcid')).to.be.null;
        });
      });

      it('provides null if cid service not available', () => {
        clientIdScope['_ping_'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          setCookie(window, cidScope, 'XXX',
              Date.now() + 5000);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.be.null;
        });
      });
    });
  };
}
