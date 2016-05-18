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
import {setCookie} from '../../src/cookies';
import * as sinon from 'sinon';


describe('ad-cid', tests('amp-ad'));
describe('ad-cid-embed', tests('amp-embed'));

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
        delete clientIdScope['with_cid'];
        setCookie(window, cidScope, '', new Date().getTime() - 5000);
      });

      it('provides cid to ad', () => {
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          setCookie(window, cidScope, 'sentinel123',
              new Date().getTime() + 5000);
          installCidService(win);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('sentinel123');
        });
      });

      it('waits for consent', () => {
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
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
          type: 'with_cid',
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
          type: 'with_cid',
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
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          setCookie(window, cidScope, 'XXX',
              new Date().getTime() + 5000);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.be.null;
        });
      });
    });
  };
}
