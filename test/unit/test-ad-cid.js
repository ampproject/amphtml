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

import * as fakeTimers from '@sinonjs/fake-timers';
import {Services} from '../../src/services';
import {adConfig} from '../../ads/_config';
import {cidServiceForDocForTesting} from '../../src/service/cid-impl';
import {getAdCid} from '../../src/ad-cid';

describes.realWin('ad-cid', {amp: true}, (env) => {
  const cidScope = 'cid-in-ads-test';
  const config = adConfig['_ping_'];

  let cidService;
  let clock;
  let element;
  let adElement;
  let win;

  beforeEach(() => {
    win = env.win;
    clock = fakeTimers.withGlobal(win).install({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });
    element = env.win.document.createElement('amp-ad');
    element.setAttribute('type', '_ping_');
    const {ampdoc} = env;
    cidService = cidServiceForDocForTesting(ampdoc);
    adElement = {
      getAmpDoc: () => ampdoc,
      element,
      win,
    };
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should get correct cid', () => {
    config.clientIdScope = cidScope;

    let getCidStruct;
    env.sandbox.stub(cidService, 'get').callsFake((struct) => {
      getCidStruct = struct;
      return Promise.resolve('test123');
    });
    return getAdCid(adElement).then((cid) => {
      expect(cid).to.equal('test123');
      expect(getCidStruct).to.deep.equal({
        scope: cidScope,
        createCookieIfNotPresent: true,
        cookieName: undefined,
      });
    });
  });

  it('should respect clientIdCookieName field', () => {
    config.clientIdScope = cidScope;
    config.clientIdCookieName = 'different-cookie-name';

    let getCidStruct;
    env.sandbox.stub(cidService, 'get').callsFake((struct) => {
      getCidStruct = struct;
      return Promise.resolve('test123');
    });
    return getAdCid(adElement).then((cid) => {
      expect(cid).to.equal('test123');
      expect(getCidStruct).to.deep.equal({
        scope: cidScope,
        createCookieIfNotPresent: true,
        cookieName: 'different-cookie-name',
      });
    });
  });

  it('should return on timeout', () => {
    config.clientIdScope = cidScope;
    env.sandbox.stub(cidService, 'get').callsFake(() => {
      return Services.timerFor(win).promise(2000);
    });
    const p = getAdCid(adElement).then((cid) => {
      expect(cid).to.be.undefined;
      expect(win.Date.now()).to.equal(1000);
    });
    clock.tick(999);
    // Let promises resolve before ticking 1 more ms.
    Promise.resolve().then(() => {
      clock.tick(1);
    });
    return p;
  });

  it('should return undefined on failed CID', () => {
    expectAsyncConsoleError(/nope/);
    config.clientIdScope = cidScope;
    env.sandbox.stub(cidService, 'get').callsFake(() => {
      return Promise.reject(new Error('nope'));
    });
    return expect(getAdCid(adElement)).to.eventually.be.undefined;
  });
});
