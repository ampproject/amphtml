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

import {adConfig} from '../../ads/_config';
import {createIframePromise} from '../../testing/iframe';
import {installCidService} from '../../extensions/amp-analytics/0.1/cid-impl';
import {
  installUserNotificationManager,
} from '../../extensions/amp-user-notification/0.1/amp-user-notification';
import {getAdCid} from '../../src/ad-cid';
import {setCookie} from '../../src/cookies';
import {timerFor} from '../../src/timer';
import * as sinon from 'sinon';

describe('ad-cid', () => {
  const cidScope = 'cid-in-ads-test';
  const config = adConfig['_ping_'];
  let sandbox;

  let cidService;
  let uidService;
  let clock;
  let element;
  let adElement;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    cidService = installCidService(window);
    uidService = installUserNotificationManager(window);
    element = document.createElement('amp-ad');
    element.setAttribute('type', '_ping_');
    adElement = {
      element,
      win: window,
    };
  });

  afterEach(() => {
    sandbox.restore();
    setCookie(window, cidScope, '', Date.now() - 5000);
  });

  it('should get correct cid', () => {
    config.clientIdScope = cidScope;

    sandbox.stub(cidService, 'get', scope => {
      expect(scope).to.equal(cidScope);
      return Promise.resolve('test123');
    });
    return getAdCid(adElement).then(cid => {
      expect(cid).to.equal('test123');
    });
  });

  it('should return on timeout', () => {
    config.clientIdScope = cidScope;
    sandbox.stub(cidService, 'get', scope => {
      expect(scope).to.equal(cidScope);
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

  it('should return undefined on failed CID', () => {
    config.clientIdScope = cidScope;
    sandbox.stub(cidService, 'get', () => {
      return Promise.reject(new Error('nope'));
    });
    return getAdCid(adElement).then(cid => {
      expect(cid).to.be.undefined;
    });
  });

  it('should wait for consent w/ cidScope', () => {
    config.clientIdScope = cidScope;
    adElement.element.setAttribute('data-consent-notification-id', 'uid');
    sandbox.stub(uidService, 'get', id => {
      expect(id).to.equal('uid');
      return Promise.resolve('consent');
    });
    sandbox.stub(cidService, 'get', (scope, consent) => {
      expect(scope).to.equal(cidScope);
      return consent.then(val => {
        console.log('val is', val);
        return val + '-cid';
      });
    });
    return getAdCid(adElement).then(cid => {
      expect(cid).to.equal('consent-cid');
    });
  });

  it('should wait for consent w/0 cidScope', () => {
    config.clientIdScope = null;
    adElement.element.setAttribute('data-consent-notification-id', 'uid');
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
    return getAdCid(adElement).then(cid => {
      expect(cid).to.equal('consent');
    });
  });

  it('should return undefined if notification and cid is not provided',
      () => {
        config.clientIdScope = null;
        sandbox.stub(cidService, 'get', (scope, consent) => {
          expect(scope).to.equal(cidScope);
          return consent.then(val => {
            return val + '-cid';
          });
        });
        const uidSpy = sandbox.spy(uidService, 'get');
        return getAdCid(adElement).then(cid => {
          expect(uidSpy).to.not.be.called;
          expect(cid).to.be.undefined;
        });
      });

  it('should return null if cid service not available', () => {
    config.clientIdScope = cidScope;
    return createIframePromise(true /* runtimeOff */).then(iframe => {
      adElement.win = iframe.win;
      return getAdCid(adElement).then(cid => {
        console.log('cid is ', cid);
        expect(cid).to.be.undefined;
      });
    });
  });
});
