import * as fakeTimers from '@sinonjs/fake-timers';

import {adConfig} from '#ads/_config';

import {Services} from '#service';
import {cidServiceForDocForTesting} from '#service/cid-impl';

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
