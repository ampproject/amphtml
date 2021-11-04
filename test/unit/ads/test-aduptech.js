import * as _3p from '#3p/3p';

import {
  ADUPTECH_API_URL,
  ADUPTECH_ELEMENT_ID,
  aduptech,
} from '#ads/vendors/aduptech';

import {createIframePromise} from '#testing/iframe';

describes.fakeWin('amp-ad-aduptech-impl', {}, (env) => {
  let win;
  let loadScriptSpy;

  beforeEach(() => {
    return createIframePromise(true).then((iframe) => {
      win = iframe.win;
      win.context = {
        initialIntersection: {
          boundingClientRect: {
            height: 0,
          },
        },
        requestResize() {},
        noContentAvailable() {},
        referrer: null,
      };
      const div = win.document.createElement('div');
      div.id = 'c';
      win.document.body.appendChild(div);

      // create and spy on fake aduptech api
      win.uAd = {
        embed: env.sandbox.spy(),
      };

      // spy on stub for loadScript
      loadScriptSpy = env.sandbox
        .stub(_3p, 'loadScript')
        .callsFake((_, __, callback) => {
          callback();
        });

      // just to be sure
      expect(win.document.getElementById(ADUPTECH_ELEMENT_ID)).to.be.null;
      expect(loadScriptSpy).not.to.have.been.called;
      expect(win.uAd.embed).not.to.have.been.called;
    });
  });

  it('should validate missing placementkey', () => {
    expect(() => aduptech(win, {})).to.throw(/Missing attribute/);
  });

  it('should add id to html container', () => {
    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.document.getElementById(ADUPTECH_ELEMENT_ID)).not.to.be.null;
  });

  it('should load api', () => {
    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(loadScriptSpy).to.have.been.calledOnceWith(
      win,
      ADUPTECH_API_URL,
      env.sandbox.match.func
    );
  });

  it('should call api with minimum attributes', () => {
    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.uAd.embed).to.have.been.calledOnceWith(ADUPTECH_ELEMENT_ID, {
      amp: true,
      onAds: env.sandbox.match.func,
      onNoAds: env.sandbox.match.func,
      placementkey: 'crazyPlacementKey',
      responsive: true,
    });
  });

  it('should call api with all attributes', () => {
    aduptech(win, {
      placementkey: 'crazyPlacementKey',
      mincpc: '0.33',
      query: 'foo;bar',
      pageurl: 'http://www.adup-tech.com',
      gdpr: '0',
      // eslint-disable-next-line local/camelcase
      gdpr_consent: 'crazyConsentString',
      adtest: '1',
    });

    expect(win.uAd.embed).to.have.been.calledOnceWith(ADUPTECH_ELEMENT_ID, {
      adtest: '1',
      amp: true,
      gdpr: '0',
      // eslint-disable-next-line local/camelcase
      gdpr_consent: 'crazyConsentString',
      mincpc: '0.33',
      onAds: env.sandbox.match.func,
      onNoAds: env.sandbox.match.func,
      pageurl: 'http://www.adup-tech.com',
      placementkey: 'crazyPlacementKey',
      query: 'foo;bar',
      responsive: true,
    });
  });

  it('should call api with "context.sourceUrl" as fallback for "pageurl"', () => {
    win.context.sourceUrl = 'http://www.source.url';

    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.uAd.embed).to.have.been.calledOnce;
    expect(win.uAd.embed.getCall(0).args[1].pageurl).to.equal(
      win.context.sourceUrl
    );
  });

  it('should call api with "context.location.href" as fallback for "pageurl"', () => {
    win.context.sourceUrl = null;
    win.context.location = {href: 'http://www.win.location.href'};

    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.uAd.embed).to.have.been.calledOnce;
    expect(win.uAd.embed.getCall(0).args[1].pageurl).to.equal(
      win.context.location.href
    );
  });

  it('should call api with prefered "context.consentSharedData.consentString" as "gdpr_consent"', () => {
    win.context.consentSharedData = {
      consentString: 'realConsentString',
    };

    aduptech(win, {
      placementkey: 'crazyPlacementKey',
      gdpr: true,
      // eslint-disable-next-line local/camelcase
      gdpr_consent: 'customConsentString',
    });

    expect(win.uAd.embed).to.have.been.calledOnce;
    expect(win.uAd.embed.getCall(0).args[1].gdpr).to.be.true;
    expect(win.uAd.embed.getCall(0).args[1].gdpr_consent).to.equal(
      'realConsentString'
    );
  });

  it('should call "context.renderStart()" on "onAds" callback', () => {
    win.context.renderStart = env.sandbox.spy();
    win.context.noContentAvailable = env.sandbox.spy();

    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.uAd.embed).to.have.been.calledOnce;
    win.uAd.embed.getCall(0).args[1].onAds();

    expect(win.context.renderStart).to.have.been.calledOnce;
    expect(win.context.noContentAvailable).not.to.have.been.called;
  });

  it('should call "context.noContentAvailable()" on "onNoAds" callback', () => {
    win.context.renderStart = env.sandbox.spy();
    win.context.noContentAvailable = env.sandbox.spy();

    aduptech(win, {placementkey: 'crazyPlacementKey'});

    expect(win.uAd.embed).to.have.been.calledOnce;
    win.uAd.embed.getCall(0).args[1].onNoAds();

    expect(win.context.renderStart).not.to.have.been.called;
    expect(win.context.noContentAvailable).to.have.been.calledOnce;
  });
});
