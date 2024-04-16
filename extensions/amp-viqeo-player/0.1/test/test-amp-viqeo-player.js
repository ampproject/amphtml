import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {
  PlayingStates_Enum,
  VideoEvents_Enum,
} from '../../../../src/video-interface';
import AmpViqeoPlayer from '../amp-viqeo-player';

describes.realWin(
  'amp-viqeo-player',
  {
    amp: {
      extensions: ['amp-viqeo-player'],
    },
    allowExternalResources: true,
  },
  function (env) {
    this.timeout(4000);
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function fakePostMessage(viqeoElement, info) {
      const impl = await viqeoElement.getImpl(false);
      impl.handleViqeoMessages_({
        source: viqeoElement.querySelector('iframe').contentWindow,
        data: {source: 'ViqeoPlayer', ...info},
      });
    }

    it('test-get-data', () => {
      return getViqeo().then((p) => {
        const {entry, viqeo, viqeoElement} = p;
        expect(entry.video.element).to.equal(viqeoElement);
        expect(entry.video instanceof AmpViqeoPlayer).to.equal(true);
        expect(entry.video).to.equal(viqeo);
        expect(viqeo instanceof AmpViqeoPlayer).to.equal(true);
      });
    });

    describe('test-requires-attributes', () => {
      it('requires data-videoid', () => {
        const error = /The data-videoid attribute is required for/;
        expectAsyncConsoleError(error);
        return getViqeo({viqeoId: null}).should.eventually.be.rejectedWith(
          error
        );
      });

      it('requires data-profileid', () => {
        const error = /The data-profileid attribute is required for/;
        expectAsyncConsoleError(error);
        return getViqeo({
          viqeoProfileId: null,
        }).should.eventually.be.rejectedWith(error);
      });
    });

    describe('test-playing-actions', () => {
      it('renders responsively', () => {
        return getViqeo().then((p) => {
          const iframe = p.viqeoElement.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        });
      });

      it('should propagate autoplay to ad iframe', () => {
        return getViqeo({opt_params: {autoplay: ''}}).then((p) => {
          const iframe = p.viqeoElement.querySelector('iframe');
          const data = JSON.parse(iframe.name).attributes;
          expect(data).to.be.ok;
          expect(data._context).to.be.ok;
          expect(data._context.autoplay).to.equal(true);
        });
      });

      it(
        'should propagate autoplay=false ' +
          'if element has not autoplay attribute to ad iframe',
        () => {
          return getViqeo().then((p) => {
            const iframe = p.viqeoElement.querySelector('iframe');
            const data = JSON.parse(iframe.name).attributes;
            expect(data).to.be.ok;
            expect(data._context).to.be.ok;
            return expect(data._context.autoplay).to.equal(false);
          });
        }
      );

      it('should paused without autoplay', () => {
        return getViqeo().then((p) => {
          const curState = p.videoManager.getPlayingState(p.viqeo);
          return expect(curState).to.equal(PlayingStates_Enum.PAUSED);
        });
      });
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getViqeo().then((p) => {
          const img = p.viqeoElement.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('loading')).to.equal('lazy');
          expect(img.getAttribute('src')).to.equal(
            'https://cdn.viqeo.tv/preview/922d04f30b66f1a32eb2.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
          expect(img.getAttribute('alt')).to.equal('Loading video');
        });
      });
    });

    it('should forward events', () => {
      return getViqeo().then(({viqeoElement}) => {
        return Promise.resolve()
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.LOAD);
            await fakePostMessage(viqeoElement, {action: 'ready'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.PLAYING);
            await fakePostMessage(viqeoElement, {action: 'play'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.PAUSE);
            await fakePostMessage(viqeoElement, {action: 'pause'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.MUTED);
            await fakePostMessage(viqeoElement, {action: 'mute'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.UNMUTED);
            await fakePostMessage(viqeoElement, {action: 'unmute'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.ENDED);
            await fakePostMessage(viqeoElement, {action: 'end'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(
              viqeoElement,
              VideoEvents_Enum.AD_START
            );
            await fakePostMessage(viqeoElement, {action: 'startAdvert'});
            return p;
          })
          .then(async () => {
            const p = listenOncePromise(viqeoElement, VideoEvents_Enum.AD_END);
            await fakePostMessage(viqeoElement, {action: 'endAdvert'});
            return p;
          });
      });
    });

    function getViqeo(params) {
      const {height, id, opt_params, viqeoId, viqeoProfileId, width} = {
        id: 'myVideo',
        viqeoProfileId: 184,
        viqeoId: '922d04f30b66f1a32eb2',
        width: 320,
        height: 180,
        opt_params: {},
        ...params,
      };

      const viqeoElement = doc.createElement('amp-viqeo-player');

      id && viqeoElement.setAttribute('id', id);
      viqeoProfileId &&
        viqeoElement.setAttribute('data-profileid', viqeoProfileId);

      viqeoId && viqeoElement.setAttribute('data-videoid', viqeoId);

      width && viqeoElement.setAttribute('width', width);
      height && viqeoElement.setAttribute('height', height);

      opt_params &&
        Object.keys(opt_params).forEach((key) => {
          viqeoElement.setAttribute(key, opt_params[key]);
        });

      doc.body.appendChild(viqeoElement);
      return viqeoElement
        .buildInternal()
        .then(() => viqeoElement.layoutCallback())
        .then(() => {
          const videoManager = Services.videoManagerForDoc(doc);
          const entry = videoManager.getEntry_(viqeoElement);
          return Promise.resolve({
            viqeoElement,
            videoManager,
            entry,
            viqeo: entry.video,
          });
        });
    }
  }
);
