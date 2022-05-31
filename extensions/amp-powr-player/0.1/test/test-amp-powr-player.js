import '../amp-powr-player';
import {listenOncePromise} from '#utils/event-helper';

import {parseUrlDeprecated} from '../../../../src/url';
import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-powr-player',
  {
    amp: {
      extensions: ['amp-powr-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getPowrPlayer(attributes, opt_responsive) {
      const bc = doc.createElement('amp-powr-player');
      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '111');
      bc.setAttribute('height', '222');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(bc);
      return bc
        .buildInternal()
        .then(() => bc.getImpl(false))
        .then((impl) => {
          impl.playerReadyResolver_(impl.iframe_);
          return bc.layoutCallback();
        })
        .then(() => bc);
    }

    async function fakePostMessage(bc, info) {
      const impl = await bc.getImpl(false);
      impl.handlePlayerMessage_({
        origin: 'https://player.powr.com',
        source: bc.querySelector('iframe').contentWindow,
        data: JSON.stringify(info),
      });
    }

    it('renders', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'amp-test-video',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=amp-test-video&playsinline=true'
        );
      });
    });

    it('renders responsively', () => {
      return getPowrPlayer(
        {
          'data-account': '945',
          'data-player': '1',
          'data-video': 'amp-test-video',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-account', () => {
      expectAsyncConsoleError(/The data-account attribute is required for/, 1);
      return getPowrPlayer({}).should.eventually.be.rejectedWith(
        /The data-account attribute is required for/
      );
    });

    it('requires data-player', () => {
      expectAsyncConsoleError(/The data-player attribute is required for/, 1);
      return getPowrPlayer({
        'data-account': '945',
      }).should.eventually.be.rejectedWith(
        /The data-player attribute is required for/
      );
    });

    it('removes iframe after unlayoutCallback', async () => {
      const bc = await getPowrPlayer(
        {
          'data-account': '945',
          'data-player': '1',
          'data-video': 'amp-test-video',
        },
        true
      );
      const obj = await bc.getImpl(false);
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(bc.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });

    it('should pass data-param-* attributes to the iframe src', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'amp-test-video',
        'data-param-foo': 'bar',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        expect(params).to.contain('foo=bar');
      });
    });

    it('should propagate mutated attributes', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=ZNImchutXk&playsinline=true'
        );

        bc.setAttribute('data-account', '945');
        bc.setAttribute('data-player', '1');
        bc.setAttribute('data-video', 'ZNImchutXk');
        bc.mutatedAttributesCallback({
          'data-account': '945',
          'data-player': '1',
          'data-video': 'ZNImchutXk',
        });

        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=ZNImchutXk&playsinline=true'
        );
      });
    });

    it('should pass referrer', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
        'data-referrer': 'COUNTER',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('referrer=1');
      });
    });

    it('should force playsinline', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
        'data-param-playsinline': 'false',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('playsinline=true');
      });
    });

    it('should forward events', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
      }).then((bc) => {
        return Promise.resolve()
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.LOAD);
            await fakePostMessage(bc, {
              event: 'ready',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.AD_START);
            await fakePostMessage(bc, {
              event: 'ads-ad-started',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.AD_END);
            await fakePostMessage(bc, {
              event: 'ads-ad-ended',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.PLAYING);
            await fakePostMessage(bc, {
              event: 'playing',
              muted: false,
              playing: true,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.MUTED);
            await fakePostMessage(bc, {
              event: 'volumechange',
              muted: true,
              playing: true,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.UNMUTED);
            await fakePostMessage(bc, {
              event: 'volumechange',
              muted: false,
              playing: true,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.PAUSE);
            await fakePostMessage(bc, {
              event: 'pause',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(bc, VideoEvents_Enum.ENDED);
            await fakePostMessage(bc, {
              event: 'ended',
              muted: false,
              playing: false,
            });
            return p;
          });
      });
    });
  }
);
