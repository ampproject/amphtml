import * as _3p from '#3p/3p';

import {neuwo} from '#ads/vendors/neuwo';

import {createIframePromise} from '#testing/iframe';

describes.fakeWin('amp-ad-neuwo', {}, (env) => {
  let sandbox;
  let win;

  beforeEach(() => {
    sandbox = env.sandbox;

    return createIframePromise(true).then((iframe) => {
      // Simulate the iframe that neuwo will be called inside.
      win = iframe.win;
      win.context = {
        renderStart: sandbox.spy(),
        noContentAvailable: sandbox.spy(),
        referrer: null,
      };
    });
  });

  it('should require the scriptid parameter', () => {
    allowConsoleError(() => {
      expect(() => neuwo(win, {})).to.throw(/scriptid/);
    });
  });

  it('should load the Neuwo static loader with the given scriptid', () => {
    const writeScript = sandbox.stub(_3p, 'writeScript');
    neuwo(win, {'scriptid': '91'});
    expect(writeScript).to.be.calledOnce;
    expect(writeScript.firstCall.args[1]).to.contain(
      'ads.neuwo.ai/loader/neuwo-ad.js?staticTagId=91'
    );
  });

  it('should bridge neuwoAdRender to renderStart()', () => {
    sandbox.stub(_3p, 'writeScript');
    neuwo(win, {'scriptid': '91'});
    win.dispatchEvent(new win.Event('neuwoAdRender'));
    expect(win.context.renderStart).to.be.calledOnce;
  });

  it('should bridge neuwoAdNoFill to noContentAvailable()', () => {
    sandbox.stub(_3p, 'writeScript');
    neuwo(win, {'scriptid': '91'});
    win.dispatchEvent(new win.Event('neuwoAdNoFill'));
    expect(win.context.noContentAvailable).to.be.calledOnce;
  });
});
