import '../amp-imgur';
import {createElementWithAttributes, waitForChildPromise} from '#core/dom';

import {user} from '#utils/log';

describes.realWin(
  'amp-imgur',
  {
    amp: {
      extensions: ['amp-imgur'],
    },
  },
  (env) => {
    let win, doc;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      clock = env.sandbox.useFakeTimers();
    });

    async function fakePostMessage(element, data = '{}') {
      const iframe = element.querySelector('iframe');
      (await element.getImpl(false)).handleImgurMessages_({
        data,
        origin: 'https://imgur.com',
        source: iframe.contentWindow,
      });
    }

    function getImgurElement(imgurId) {
      const element = createElementWithAttributes(doc, 'amp-imgur', {
        'data-imgur-id': imgurId,
        'width': '100',
        'height': '100',
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      return element.buildInternal().then(() => element);
    }

    async function getImgur(imgurId) {
      const element = await getImgurElement(imgurId);
      const laidOut = element.layoutCallback();

      // layoutCallback is not resolved until the first message is received
      fakePostMessage(element);

      await laidOut;
      return element;
    }

    function testIframe(iframe, id) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://imgur.com/' + id + '/embed?pub=true'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    }

    it('renders', async () => {
      const element = await getImgur('2CnX7');
      testIframe(element.querySelector('iframe'), '2CnX7');
    });

    it('renders a/ type urls', async () => {
      const element = await getImgur('a/ZF7NS3V');
      testIframe(element.querySelector('iframe'), 'a/ZF7NS3V');
    });

    // https://go.amp.dev/issue/28049
    it('falls back to adding a/ prefix when a message is not received', async () => {
      const warn = env.sandbox.stub(user(), 'warn');
      const element = await getImgurElement('ZF7NS3V');

      const laidOut = element.layoutCallback();

      // wait for first iframe to fail and the second to be added
      let firstIframe;
      let iframe;
      await waitForChildPromise(element, (element) => {
        iframe = element.querySelector('iframe');
        firstIframe = firstIframe || iframe;
        return iframe && iframe !== firstIframe;
      });

      fakePostMessage(element);
      await laidOut;

      testIframe(iframe, 'a/ZF7NS3V');

      expect(
        warn.withArgs(
          env.sandbox.match.any,
          env.sandbox.match(/id should be prefixed/)
        )
      ).to.have.been.calledOnce;
    });

    // https://go.amp.dev/issue/28049
    it("does not fall back to adding a/ prefix when it's already present", async () => {
      const error = env.sandbox.stub(user(), 'error');
      const element = await getImgurElement('a/000000');

      const laidOut = element.layoutCallback();

      clock.tick(500); // timeout waiting for message

      await laidOut;

      testIframe(element.querySelector('iframe'), 'a/000000');

      expect(
        error.withArgs(
          env.sandbox.match.any,
          env.sandbox.match(/Failed to load/)
        )
      ).to.have.been.calledOnce;
    });

    it('resizes with JSON String message', async () => {
      const element = await getImgur('2CnX7');
      const impl = await element.getImpl(false);
      const changeHeightSpy = env.sandbox.spy(impl, 'attemptChangeHeight');
      expect(changeHeightSpy).not.to.have.been.called;
      await fakePostMessage(
        element,
        JSON.stringify({
          'message': 'resize_imgur',
          'href': 'https://imgur.com/2CnX7/embed?pub=true',
          'height': 396,
          'width': 1400,
          'context': true,
        })
      );
      expect(changeHeightSpy).to.have.been.calledWith(396);
    });

    it('resizes with JSON Object message', async () => {
      const element = await getImgur('2CnX7');
      const impl = await element.getImpl(false);
      const changeHeightSpy = env.sandbox.spy(impl, 'attemptChangeHeight');
      expect(changeHeightSpy).not.to.have.been.called;
      await fakePostMessage(element, {
        'message': 'resize_imgur',
        'href': 'https://imgur.com/2CnX7/embed?pub=true',
        'height': 400,
        'width': 1400,
        'context': true,
      });
      expect(changeHeightSpy).to.have.been.calledWith(400);
    });
  }
);
