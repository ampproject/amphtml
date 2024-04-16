import '../amp-dynamic-css-classes';
import {Services} from '#service';
import {vsyncForTesting} from '#service/vsync-impl';

const tcoReferrer = 'http://t.co/xyzabc123';
const PinterestUA =
  'Mozilla/5.0 (Linux; Android 5.1.1; SM-G920F' +
  ' Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0' +
  ' Chrome/47.0.2526.100 Mobile Safari/537.36 [Pinterest/Android]';

describes.fakeWin(
  'dynamic classes are inserted at runtime',
  {
    amp: true, // Extension will be installed manually in tests.
    location: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
  },
  (env) => {
    let win, doc, ampdoc;
    let body;
    let viewer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      body = doc.body;
    });

    function setup(embeded, userAgent, referrer) {
      const vsync = vsyncForTesting(win);
      vsync.schedule_ = () => {
        vsync.runScheduledTasks_();
      };
      viewer = Services.viewerForDoc(ampdoc);
      viewer.isEmbedded = () => !!embeded;
      if (userAgent !== undefined) {
        win.navigator.userAgent = userAgent;
      }
      if (referrer !== undefined) {
        env.sandbox
          .stub(viewer, 'getUnconfirmedReferrerUrl')
          .callsFake(() => referrer);
      }
      env.installExtension('amp-dynamic-css-classes');
    }

    describe('when embedded', () => {
      beforeEach(() => {
        setup(true);
      });

      it('should include viewer class', () => {
        expect(body).to.have.class('amp-viewer');
      });
    });

    describe('Normalizing Referrers', () => {
      it('should normalize twitter shortlinks to twitter', () => {
        setup(false, '', tcoReferrer);
        expect(body).to.have.class('amp-referrer-com');
        expect(body).to.have.class('amp-referrer-twitter-com');
      });

      it('should normalize pinterest on android', () => {
        setup(false, PinterestUA, '');
        expect(body).to.have.class('amp-referrer-com');
        expect(body).to.have.class('amp-referrer-pinterest-com');
        expect(body).to.have.class('amp-referrer-www-pinterest-com');
      });
    });
  }
);
