import '../amp-nexxtv-player';
import {createElementWithAttributes} from '#core/dom';

import {listenOncePromise} from '#utils/event-helper';

import * as consent from '../../../../src/consent';
import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-nexxtv-player',
  {
    amp: {
      extensions: ['amp-nexxtv-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getNexxtvPlayer(attributes) {
      const element = createElementWithAttributes(doc, 'amp-nexxtv-player', {
        width: 111,
        height: 222,
        ...attributes,
        // Use a blank page, since these tests don't require an actual page.
        // hash # at the end so path is not affected by param concat
        'data-origin': `http://localhost:${location.port}/test/fixtures/served/blank.html#`,
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const iframe = element.querySelector('iframe');
      impl.handleNexxMessage_({
        origin: 'https://embed.nexx.cloud',
        source: iframe.contentWindow,
        data: JSON.stringify({cmd: 'onload'}),
      });
      return element;
    }

    it('renders nexxtv video player', async () => {
      const element = await getNexxtvPlayer({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
        'data-streamtype': 'video',
      });
      const playerIframe = element.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src)
        .to.be.a('string')
        .and.match(
          new RegExp(
            element.getAttribute('data-client') +
              '/video/' +
              element.getAttribute('data-mediaid') +
              '\\?platform=amp' +
              '$' // suffix
          )
        );
    });

    it('removes iframe after unlayoutCallback', async () => {
      const nexxtv = await getNexxtvPlayer({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const playerIframe = nexxtv.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const obj = await nexxtv.getImpl(false);
      obj.unlayoutCallback();
      expect(nexxtv.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });

    it('should forward events from nexxtv-player to the amp element', async () => {
      const nexxtv = await getNexxtvPlayer({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
      });
      const iframe = nexxtv.querySelector('iframe');
      await Promise.resolve();
      const p1 = listenOncePromise(nexxtv, VideoEvents_Enum.PLAYING);
      await sendFakeMessage(nexxtv, iframe, {event: 'play'});
      await p1;
      const p2 = listenOncePromise(nexxtv, VideoEvents_Enum.MUTED);
      await sendFakeMessage(nexxtv, iframe, {event: 'mute'});
      await p2;
      const p3 = listenOncePromise(nexxtv, VideoEvents_Enum.PAUSE);
      await sendFakeMessage(nexxtv, iframe, {event: 'pause'});
      await p3;
      const p4 = listenOncePromise(nexxtv, VideoEvents_Enum.UNMUTED);
      await sendFakeMessage(nexxtv, iframe, {event: 'unmute'});
      return p4;
    });

    it('should pass consent value to iframe', () => {
      env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('testinfo');

      return getNexxtvPlayer({
        'data-mediaid': '71QQG852413DU7J',
        'data-client': '761',
        'data-block-on-consent': '_till_accepted',
      }).then((nexxplayer) => {
        const iframe = nexxplayer.querySelector('iframe');

        expect(iframe.src).to.contain('consentString=testinfo');
      });
    });

    async function sendFakeMessage(nexxtv, iframe, command) {
      const impl = await nexxtv.getImpl(false);
      impl.handleNexxMessage_({
        origin: 'https://embed.nexx.cloud',
        source: iframe.contentWindow,
        data: command,
      });
    }
  }
);
