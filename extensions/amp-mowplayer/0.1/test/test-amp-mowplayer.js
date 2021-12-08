import '../amp-mowplayer';
import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {VideoEvents_Enum} from '../../../../src/video-interface';

const EXAMPLE_VIDEOID = 'v-myfwarfx4tb';
const EXAMPLE_VIDEOID_URL = 'https://mowplayer.com/watch/v-myfwarfx4tb';

describes.realWin(
  'amp-mowplayer',
  {
    amp: {
      extensions: ['amp-mowplayer'],
    },
  },
  function (env) {
    this.timeout(5000);
    let win, doc;
    let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
    });

    async function getMowPlayer(attributes) {
      const element = createElementWithAttributes(doc, 'amp-mowplayer', {
        width: 250,
        height: 180,
        ...attributes,
      });
      doc.body.appendChild(element);
      const impl = await element.getImpl(false);
      impl.baseURL_ =
        // Use a blank page, since these tests don't require an actual page.
        // hash # at the end so path is not affected by param concat
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`;
      return element
        .buildInternal()
        .then(() => element.layoutCallback())
        .then(() => {
          const iframe = element.querySelector('iframe');
          impl.handleMowMessage_({
            origin: 'https://mowplayer.com',
            source: iframe.contentWindow,
            data: JSON.stringify({event: 'onReady'}),
          });
          return element;
        });
    }

    describe('with data-mediaid', function () {
      runTestsForDatasource(EXAMPLE_VIDEOID);
    });

    /**
     * This function runs generic tests for components based on
     * data-videoid or data-live-channelid.
     * @param {string} datasource
     */
    function runTestsForDatasource(datasource) {
      it('renders', async () => {
        const element = await getMowPlayer({'data-mediaid': EXAMPLE_VIDEOID});
        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(EXAMPLE_VIDEOID_URL);
      });

      it('requires data-mediaid', () =>
        allowConsoleError(() =>
          getMowPlayer({}).should.eventually.be.rejectedWith(
            /The data-mediaid attribute is required for/
          )
        ));

      it('should send events from mowplayer to the amp element', () => {
        return getMowPlayer({'data-mediaid': datasource}).then((mp) => {
          const iframe = mp.querySelector('iframe');

          return Promise.resolve()
            .then(async () => {
              const p = listenOncePromise(mp, VideoEvents_Enum.MUTED);
              await sendFakeInfoDeliveryMessage(mp, iframe, {muted: true});
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(mp, VideoEvents_Enum.PLAYING);
              await sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 1});
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(mp, VideoEvents_Enum.PAUSE);
              await sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 2});
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(mp, VideoEvents_Enum.UNMUTED);
              await sendFakeInfoDeliveryMessage(mp, iframe, {muted: false});
              return p;
            })
            .then(async () => {
              // Should not send the unmute event twice if already sent once.
              const p = listenOncePromise(mp, VideoEvents_Enum.UNMUTED).then(
                () => {
                  assert.fail('Should not have dispatch unmute message twice');
                }
              );
              await sendFakeInfoDeliveryMessage(mp, iframe, {muted: false});
              const successTimeout = timer.promise(10);
              return Promise.race([p, successTimeout]);
            })
            .then(async () => {
              // Make sure pause and end are triggered when video ends.
              const pEnded = listenOncePromise(mp, VideoEvents_Enum.ENDED);
              const pPause = listenOncePromise(mp, VideoEvents_Enum.PAUSE);
              await sendFakeInfoDeliveryMessage(mp, iframe, {playerState: 0});
              return Promise.all([pEnded, pPause]);
            });
        });
      });
    }

    async function sendFakeInfoDeliveryMessage(mp, iframe, info) {
      const impl = await mp.getImpl(false);
      impl.handleMowMessage_({
        origin: 'https://mowplayer.com',
        source: iframe.contentWindow,
        data: JSON.stringify({
          event: 'infoDelivery',
          info,
        }),
      });
    }
  }
);
