import '../amp-vk';
import {Layout_Enum} from '#core/dom/layout';

import {Resource} from '#service/resource';

const POST_PARAMS = {
  'embedtype': 'post',
  'hash': 'Yc8_Z9pnpg8aKMZbVcD-jK45eAk',
  'owner-id': '1',
  'post-id': '45616',
};

const POLL_PARAMS = {
  'embedtype': 'poll',
  'api-id': '6183531',
  'poll-id': '274086843_1a2a465f60fff4699f',
};

describes.realWin(
  'amp-vk',
  {
    amp: {
      extensions: ['amp-vk'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function createAmpVkElement(dataParams, layout) {
      const element = doc.createElement('amp-vk');

      for (const param in dataParams) {
        element.setAttribute(`data-${param}`, dataParams[param]);
      }

      element.setAttribute('width', 500);
      element.setAttribute('height', 300);

      if (layout) {
        element.setAttribute('layout', layout);
      }

      doc.body.appendChild(element);

      await element.buildInternal();
      const resource = Resource.forElement(element);
      resource.measure();
      await element.layoutCallback();
      return element;
    }

    it('requires data-embedtype', () => {
      const params = {...POST_PARAMS};
      delete params['embedtype'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-embedtype attribute is required for/
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const vkPost = await createAmpVkElement(POST_PARAMS);
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = await vkPost.getImpl(false);
      obj.unlayoutCallback();
      expect(vkPost.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });

    // Post tests

    it('post::requires data-hash', () => {
      const params = {...POST_PARAMS};
      delete params['hash'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-hash attribute is required for/
        );
      });
    });

    it('post::requires data-owner-id', () => {
      const params = {...POST_PARAMS};
      delete params['owner-id'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-owner-id attribute is required for/
        );
      });
    });

    it('post::requires data-post-id', () => {
      const params = {...POST_PARAMS};
      delete params['post-id'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-post-id attribute is required for/
        );
      });
    });

    it('post::renders iframe in amp-vk', async () => {
      const vkPost = await createAmpVkElement(POST_PARAMS);
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('post::renders responsively', async () => {
      const vkPost = await createAmpVkElement(
        POST_PARAMS,
        Layout_Enum.RESPONSIVE
      );
      const iframe = vkPost.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('post::sets correct src url to the vk iFrame', async () => {
      const vkPost = await createAmpVkElement(
        POST_PARAMS,
        Layout_Enum.RESPONSIVE
      );
      const impl = await vkPost.getImpl(false);
      const iframe = vkPost.querySelector('iframe');
      const referrer = encodeURIComponent(vkPost.ownerDocument.referrer);
      const url = encodeURIComponent(
        vkPost.ownerDocument.location.href.replace(/#.*$/, '')
      );
      impl.onLayoutMeasure();
      const startWidth = vkPost.getLayoutSize().width;
      const correctIFrameSrc = `https://vk.com/widget_post.php?app=0&width=100%25&_ver=1&owner_id=1&post_id=45616&hash=Yc8_Z9pnpg8aKMZbVcD-jK45eAk&amp=1&startWidth=${startWidth}&url=${url}&referrer=${referrer}&title=AMP%20Post`;
      expect(iframe).to.not.be.null;
      const timeArgPosition = iframe.src.lastIndexOf('&');
      const iframeSrcWithoutTime = iframe.src.substr(0, timeArgPosition);
      expect(iframeSrcWithoutTime).to.equal(correctIFrameSrc);
    });

    // Poll tests

    it('poll::requires data-api-id', () => {
      const params = {...POLL_PARAMS};
      delete params['api-id'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-api-id attribute is required for/
        );
      });
    });

    it('poll::requires data-poll-id', () => {
      const params = {...POLL_PARAMS};
      delete params['poll-id'];
      return allowConsoleError(() => {
        return createAmpVkElement(params).should.eventually.be.rejectedWith(
          /The data-poll-id attribute is required for/
        );
      });
    });

    it('poll::renders iframe in amp-vk', async () => {
      const vkPoll = await createAmpVkElement(POLL_PARAMS);
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('poll::renders responsively', async () => {
      const vkPoll = await createAmpVkElement(
        POLL_PARAMS,
        Layout_Enum.RESPONSIVE
      );
      const iframe = vkPoll.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('poll::sets correct src url to the vk iFrame', async () => {
      const vkPoll = await createAmpVkElement(
        POLL_PARAMS,
        Layout_Enum.RESPONSIVE
      );
      const iframe = vkPoll.querySelector('iframe');
      const referrer = encodeURIComponent(vkPoll.ownerDocument.referrer);
      const url = encodeURIComponent(
        vkPoll.ownerDocument.location.href.replace(/#.*$/, '')
      );
      const correctIFrameSrc = `https://vk.com/al_widget_poll.php?app=6183531&width=100%25&_ver=1&poll_id=274086843_1a2a465f60fff4699f&amp=1&url=${url}&title=AMP%20Poll&description=&referrer=${referrer}`;
      expect(iframe).to.not.be.null;
      const timeArgPosition = iframe.src.lastIndexOf('&');
      const iframeSrcWithoutTime = iframe.src.substr(0, timeArgPosition);
      expect(iframeSrcWithoutTime).to.equal(correctIFrameSrc);
    });

    it('both::resizes amp-vk element in response to postmessages', async () => {
      const vkPoll = await createAmpVkElement(POLL_PARAMS);
      const impl = await vkPoll.getImpl(false);
      const iframe = vkPoll.querySelector('iframe');
      const forceChangeHeight = env.sandbox.spy(impl, 'forceChangeHeight');
      const fakeHeight = 555;
      expect(iframe).to.not.be.null;
      await generatePostMessage(vkPoll, iframe, fakeHeight);
      expect(forceChangeHeight).to.be.calledOnce;
      expect(forceChangeHeight.firstCall.args[0]).to.equal(fakeHeight);
    });

    async function generatePostMessage(ins, iframe, height) {
      const impl = await ins.getImpl(false);
      impl.handleVkIframeMessage_({
        origin: 'https://vk.com',
        source: iframe.contentWindow,
        data: JSON.stringify(['resize', [height]]),
      });
    }
  }
);
