import '../amp-brid-player';
import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-brid-player',
  {
    amp: {
      extensions: ['amp-brid-player'],
    },
  },
  (env) => {
    let win, doc;
    let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
    });

    function getBridPlayer(attributes, opt_responsive, config) {
      const bc = doc.createElement('amp-brid-player');

      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '640');
      bc.setAttribute('height', '360');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }

      // create config element if provided
      if (config) {
        const configElement = doc.createElement('script');
        configElement.setAttribute('type', 'application/json');
        if (typeof config == 'string') {
          configElement.textContent = config;
        } else {
          configElement.textContent = JSON.stringify(config);
        }
        bc.appendChild(configElement);
      }

      // see yt test implementation
      timer
        .promise(50)
        .then(() => bc.getImpl())
        .then((impl) => {
          const bridTimerIframe = bc.querySelector('iframe');

          impl.handleBridMessage_({
            origin: 'https://services.brid.tv',
            source: bridTimerIframe.contentWindow,
            data: 'Brid|0|trigger|ready',
          });
        });
      doc.body.appendChild(bc);
      return bc
        .buildInternal()
        .then(() => {
          bc.layoutCallback();
        })
        .then(() => bc);
    }

    it('renders', () => {
      return getBridPlayer({
        'data-partner': '264',
        'data-player': '4144',
        'data-video': '13663',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://services.brid.tv/services/iframe/video/13663/264/4144/0/1/?amp=1'
        );
      });
    });

    it('renders responsively', () => {
      return getBridPlayer(
        {
          'data-partner': '1177',
          'data-player': '979',
          'data-video': '5204',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-partner', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-player': '4144',
          'data-video': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-partner': '264',
          'data-video': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('requires data-partner for playlists', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-player': '4144',
          'data-playlist': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player for playlists', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-partner': '264',
          'data-playlist': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('requires data-partner for carousels', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-player': '4144',
          'data-carousel': '459',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player for carousels', () => {
      return allowConsoleError(() => {
        return getBridPlayer({
          'data-partner': '264',
          'data-carousel': '459',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('config is passed', () => {
      return getBridPlayer(
        {
          'data-partner': '264',
          'data-player': '4144',
          'data-video': '13663',
        },
        null,
        {
          'debug': 1,
        }
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://services.brid.tv/services/iframe/video/13663/264/4144/0/1/?amp=1&cust_config={%22debug%22:1}'
        );
      });
    });

    it('should forward events from brid-player to the amp element', async () => {
      const bc = await getBridPlayer(
        {
          'data-partner': '1177',
          'data-player': '979',
          'data-video': '5204',
        },
        true
      );
      const impl = await bc.getImpl();

      const iframe = bc.querySelector('iframe');
      return Promise.resolve()
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.PLAYING);
          sendFakeMessage(impl, iframe, 'trigger|play');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.MUTED);
          sendFakeMessage(impl, iframe, 'volume|0');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.PAUSE);
          sendFakeMessage(impl, iframe, 'trigger|pause');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents_Enum.UNMUTED);
          sendFakeMessage(impl, iframe, 'volume|1');
          return p;
        });
    });

    function sendFakeMessage(impl, iframe, command) {
      impl.handleBridMessage_({
        origin: 'https://services.brid.tv',
        source: iframe.contentWindow,
        data: 'Brid|0|' + command,
      });
    }

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getBridPlayer({
          'data-partner': '264',
          'data-player': '979',
          'data-video': '13663',
        }).then((brid) => {
          const img = brid.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://cdn.brid.tv/live/partners/264/snapshot/13663.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('alt')).to.equal('Loading video');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        });
      });
      it('should propagate aria label for placeholder image', () => {
        return getBridPlayer({
          'data-partner': '264',
          'data-player': '979',
          'data-video': '13663',
          'aria-label': 'great video',
        }).then((brid) => {
          const img = brid.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('alt')).to.equal(
            'Loading video - great video'
          );
        });
      });
    });
  }
);
