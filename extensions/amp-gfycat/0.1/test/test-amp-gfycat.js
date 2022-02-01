import '../amp-gfycat';
import {listenOncePromise} from '#utils/event-helper';

import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-gfycat',
  {
    amp: {
      extensions: ['amp-gfycat'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getGfycat(gfyId, opt_params) {
      const gfycat = doc.createElement('amp-gfycat');
      gfycat.setAttribute('data-gfyid', gfyId);
      gfycat.setAttribute('width', 640);
      gfycat.setAttribute('height', 640);
      if (opt_params && opt_params.withAlt) {
        gfycat.setAttribute('alt', 'test alt label');
      }
      if (opt_params && opt_params.withAria) {
        gfycat.setAttribute('aria-label', 'test aria label');
      }
      if (opt_params && opt_params.responsive) {
        gfycat.setAttribute('layout', 'responsive');
      }
      if (opt_params && opt_params.noautoplay) {
        gfycat.setAttribute('noautoplay', '');
      }
      doc.body.appendChild(gfycat);
      return gfycat
        .buildInternal()
        .then(() => {
          return gfycat.layoutCallback();
        })
        .then(() => gfycat);
    }

    it('renders', () => {
      return getGfycat('LeanMediocreBeardeddragon').then((gfycat) => {
        const iframe = gfycat.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://gfycat.com/ifr/LeanMediocreBeardeddragon'
        );
      });
    });

    it('renders responsively', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
        responsive: true,
      }).then((gfycat) => {
        const iframe = gfycat.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });
    it('noautoplay', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
        noautoplay: true,
      }).then((gfycat) => {
        const iframe = gfycat.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          'https://gfycat.com/ifr/LeanMediocreBeardeddragon?autoplay=0'
        );
      });
    });

    it('should forward events from gfycat player to the amp element', () => {
      return getGfycat('LeanMediocreBeardeddragon').then((gfycat) => {
        const iframe = gfycat.querySelector('iframe');
        return Promise.resolve()
          .then(async () => {
            const p = listenOncePromise(gfycat, VideoEvents_Enum.PLAYING);
            await sendFakeMessage(gfycat, iframe, 'playing');
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(gfycat, VideoEvents_Enum.PAUSE);
            await sendFakeMessage(gfycat, iframe, 'paused');
            return p;
          });
      });
    });

    async function sendFakeMessage(gfycat, iframe, command) {
      const impl = await gfycat.getImpl(false);
      impl.handleGfycatMessages_({
        origin: 'https://gfycat.com',
        source: iframe.contentWindow,
        data: command,
      });
    }

    it('requires data-gfyid', () => {
      return allowConsoleError(() => {
        return getGfycat('').should.eventually.be.rejectedWith(
          /The data-gfyid attribute is required for/
        );
      });
    });

    it('renders placeholder with an alt', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
        withAlt: true,
      }).then((gfycat) => {
        const placeHolder = gfycat.querySelector('img');
        expect(placeHolder).to.not.be.null;
        expect(placeHolder).to.have.attribute('placeholder');
        expect(placeHolder).to.have.class('i-amphtml-fill-content');
        expect(placeHolder.getAttribute('loading')).to.equal('lazy');
        expect(placeHolder.getAttribute('alt')).to.equal(
          'Loading gif test alt label'
        );
      });
    });
    it('renders placeholder with an aria-label', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
        withAria: true,
      }).then((gfycat) => {
        const placeHolder = gfycat.querySelector('img');
        expect(placeHolder).to.not.be.null;
        expect(placeHolder.getAttribute('alt')).to.equal(
          'Loading gif test aria label'
        );
      });
    });
  }
);
