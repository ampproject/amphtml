import * as _3p from '#3p/3p';

import {gsrv} from '#ads/vendors/gsrv';

import {createIframePromise} from '#testing/iframe';

describes.fakeWin('amp-ad-gsrv', {}, (env) => {
  let sandbox;
  let win;

  beforeEach(() => {
    sandbox = env.sandbox;
    return createIframePromise(true).then((iframe) => {
      // Simulate the 3p frame gsrv runs in.
      win = iframe.win;
      const c = win.document.createElement('div');
      c.id = 'c';
      win.document.body.appendChild(c);
      win.context = {
        renderStart: sandbox.spy(),
        noContentAvailable: sandbox.spy(),
        referrer: null,
      };
    });
  });

  const data = {
    'host': 'g2.gsrv.dev',
    'ctrl': '19460',
    'zone': '12512838',
  };

  it('should require host, ctrl and zone', () => {
    allowConsoleError(() => {
      expect(() => gsrv(win, {'ctrl': '1', 'zone': '2'})).to.throw(/host/);
      expect(() => gsrv(win, {'host': 'a.b', 'zone': '2'})).to.throw(/ctrl/);
      expect(() => gsrv(win, {'host': 'a.b', 'ctrl': '1'})).to.throw(/zone/);
    });
  });

  it('should refuse a host that is not a plain host name', () => {
    allowConsoleError(() => {
      for (const host of ['evil.com/x', 'a.b:8080', 'localhost', '"><x']) {
        expect(() => gsrv(win, {...data, host})).to.throw(/data-host/);
      }
      expect(() => gsrv(win, {...data, 'zone': '12a'})).to.throw(/data-zone/);
    });
  });

  it('should load the network controller and hand it the zone', () => {
    const loadScript = sandbox.stub(_3p, 'loadScript');
    gsrv(win, {...data, 'plugin': 'native', 'options': '{"rows":1}'});
    expect(loadScript).to.be.calledOnce;
    expect(loadScript.firstCall.args[1]).to.equal(
      'https://g2.gsrv.dev/ctrl/19460.js'
    );
    expect(win.gsrvAmp).to.deep.equal({
      zone: '12512838',
      plugin: 'native',
      display: 'gsrv-ad',
      extra: {rows: 1},
    });
    expect(win.document.getElementById('gsrv-ad').parentNode.id).to.equal('c');
  });

  it('should collapse when the controller cannot load', () => {
    const loadScript = sandbox.stub(_3p, 'loadScript');
    gsrv(win, data);
    loadScript.firstCall.args[3]();
    expect(win.context.noContentAvailable).to.be.calledOnce;
  });
});
