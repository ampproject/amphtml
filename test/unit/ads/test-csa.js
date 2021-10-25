import * as _3p from '#3p/3p';

import {
  AD_TYPE,
  callbackWithBackfill,
  callbackWithNoBackfill,
  csa,
  resizeIframe,
} from '#ads/vendors/csa';

import {createIframePromise} from '#testing/iframe';

function getAds(type) {
  const generic = {ampSlotIndex: '0', height: 300, type: 'csa'};
  const afsObj = {
    afsPageOptions: '{"pubId": "gtech-codegen", "query": "flowers"}',
    afsAdblockOptions: '{"width": "auto", "maxTop": 1}',
  };
  const afshObj = {
    afshPageOptions: '{"pubId": "vert-pla-test1-srp", "query": "flowers"}',
    afshAdblockOptions: '{"width": "auto", "height": 300}',
  };
  switch (type) {
    case AD_TYPE.AFS:
      return Object.assign(generic, afsObj);
    case AD_TYPE.AFSH:
      return Object.assign(generic, afshObj);
    case AD_TYPE.AFSH_BACKFILL:
      return Object.assign(generic, afsObj, afshObj);
    default:
      return {};
  }
}

describes.fakeWin('amp-ad-csa-impl', {}, (env) => {
  let win;

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
    });
  });

  afterEach(() => {
    win.context = {};
  });

  describe('inputs', () => {
    it('should create a csa container', () => {
      csa(win, getAds(AD_TYPE.AFS));
      const container = win.document.getElementById('csacontainer');
      expect(container).not.to.be.null;
    });
  });

  describe('ad request', () => {
    let googCsaSpy;

    beforeEach(() => {
      // Stub everything out
      env.sandbox.stub(_3p, 'loadScript').callsFake((global, url, callback) => {
        callback();
      });
      win._googCsa = function () {};
      googCsaSpy = env.sandbox.stub(win, '_googCsa');
    });

    it('should request AFS', () => {
      csa(win, getAds(AD_TYPE.AFS));
      expect(googCsaSpy.args[0][0]).to.equal('ads');
    });

    it('should request AFSh', () => {
      csa(win, getAds(AD_TYPE.AFSH));
      expect(googCsaSpy.args[0][0]).to.equal('plas');
    });

    it('should request AFSh (backfill)', () => {
      csa(win, getAds(AD_TYPE.AFSH_BACKFILL));
      expect(googCsaSpy.args[0][0]).to.equal('plas');
    });
  });

  describe('callback', () => {
    beforeEach(() => {
      // Create container and iframe
      const div = win.document.createElement('div');
      div.id = 'csacontainer';
      const iframe = win.document.createElement('iframe');
      iframe.id = 'csaiframe';
      div.appendChild(iframe);
      win.document.body.appendChild(div);
      // Reset window properties
      win.context = {
        initialIntersection: {
          boundingClientRect: {
            height: 0,
          },
        },
        requestResize() {
          return Promise.resolve();
        },
        noContentAvailable() {},
        referrer: null,
      };
    });

    afterEach(() => {
      // Get rid of the ad container
      const div = win.document.getElementById('csacontainer');
      if (div) {
        div.parentNode.removeChild(div);
      }
      // Get rid of overflow if it exists
      const overflow = win.document.getElementById('overflow');
      if (overflow) {
        overflow.parentNode.removeChild(overflow);
      }
      // Reset window properties
      win.context = {};
    });

    function setContainerHeight(height) {
      const div = win.document.getElementById('csacontainer');
      div.style.height = height;
      const iframe = win.document.getElementById('csaiframe');
      iframe.style.height = height;
    }

    function setContextHeight(h) {
      win.context.initialIntersection.boundingClientRect.height = h;
    }

    it('when ads are ATF and CSA container > AMP container', () => {
      // Fake CSA ads are 300px, AMP container is 100px
      setContainerHeight('300px');
      setContextHeight(100);

      const requestResizeSpy = env.sandbox
        .stub(win.context, 'requestResize')
        .returns(Promise.reject());

      // Try to resize when ads are loaded
      resizeIframe(win, 'csacontainer');

      return Promise.resolve().then(() => {
        const overflow = win.document.getElementById('overflow');
        const container = win.document.getElementById('csacontainer');
        const requestedHeight = requestResizeSpy.args[0][1];

        // Overflow should exist and be displayed
        expect(overflow).to.not.be.null;
        expect(overflow).not.to.have.display('none');
        // We should have tried to resize to 300 px
        expect(requestedHeight).to.equal(300);
        // Container should be set to AMP height (100) - overflow height (40)
        expect(container.style.height).to.equal('60px');
      });
    });

    it('when ads are ATF and CSA container < AMP container', () => {
      // Fake CSA ads are 300px, AMP container is 400px
      setContainerHeight('300px');
      setContextHeight(400);

      // Set up
      const requestResizeSpy = env.sandbox
        .stub(win.context, 'requestResize')
        .returns(Promise.reject());
      // Try to resize when ads are loaded
      resizeIframe(win, 'csacontainer');

      return Promise.resolve().then(() => {
        const overflow = win.document.getElementById('overflow');
        const container = win.document.getElementById('csacontainer');
        const requestedHeight = requestResizeSpy.args[0][1];

        // Overflow should NOT be present
        expect(overflow).to.be.null;
        // We should have tried to resize to 300 px
        expect(requestedHeight).to.equal(300);
        // Container should not have been changed
        expect(container.style.height).to.equal('300px');
      });
    });

    it('when ads are BTF and CSA container > AMP container', () => {
      // Fake CSA ads are 300px, AMP container is 100px
      setContainerHeight('300px');
      setContextHeight(100);

      // Set up
      const requestResizeSpy = env.sandbox
        .stub(win.context, 'requestResize')
        .returns(Promise.resolve());
      // Try to resize when ads are loaded
      resizeIframe(win, 'csacontainer');

      return Promise.resolve().then(() => {
        // Resize requests below the fold succeeed
        const requestedHeight = requestResizeSpy.args[0][1];

        const overflow = win.document.getElementById('overflow');
        const container = win.document.getElementById('csacontainer');

        // Overflow should be present, but hidden
        expect(overflow).to.have.display('none');
        // We should have tried to resize to 300 px
        expect(requestedHeight).to.equal(300);
        // Container should be set to full CSA height
        expect(container.style.height).to.equal('300px');
      });
    });

    it('when ads are BTF and CSA container < AMP container', () => {
      // Fake CSA ads are 300px, AMP container is 400px
      setContainerHeight('300px');
      setContextHeight(400);

      // Set up
      const requestResizeSpy = env.sandbox
        .stub(win.context, 'requestResize')
        .returns(Promise.resolve());
      // Try to resize when ads are loaded
      resizeIframe(win, 'csacontainer');

      return Promise.resolve().then(() => {
        // Resize requests below the fold succeed
        const requestedHeight = requestResizeSpy.args[0][1];

        const overflow = win.document.getElementById('overflow');
        const container = win.document.getElementById('csacontainer');

        // Overflow should not exist
        expect(overflow).to.be.null;
        // We should have tried to resize to 300 px
        expect(requestedHeight).to.equal(300);
        // Container should be set to full CSA height
        expect(container.style.height).to.equal('300px');
      });
    });

    it('when ads do not load', () => {
      setContainerHeight('0px');
      setContextHeight(400);

      // Set up
      const noAdsSpy = env.sandbox.stub(win.context, 'noContentAvailable');
      // No backfill, ads don't load
      callbackWithNoBackfill(win, 'csacontainer', false);

      expect(noAdsSpy).to.be.called;
    });

    it('when ads do not load but there is backfill', () => {
      setContainerHeight('0px');
      setContextHeight(400);

      // Set up stubs and spys
      const noAdsSpy = env.sandbox.stub(win.context, 'noContentAvailable');
      win._googCsa = function () {};
      const _googCsaSpy = env.sandbox.stub(win, '_googCsa').callsFake(() => {});

      // Ads don't load but there is backfill
      callbackWithBackfill(win, {}, {}, 'csacontainer', false);

      // Should not tell AMP we have no ads
      expect(noAdsSpy).not.to.be.called;
      // Should make a new request for ads
      expect(_googCsaSpy.args[0][0]).to.equal('ads');
    });
  });
});
