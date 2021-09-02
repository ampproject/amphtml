import {AmpInstagram} from '../amp-instagram';

describes.realWin(
  'amp-instagram',
  {
    amp: {
      extensions: ['amp-instagram'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getIns(
      shortcode,
      opt_responsive,
      opt_beforeLayoutCallback,
      opt_captioned,
      opt_visibilityPromise
    ) {
      const ins = doc.createElement('amp-instagram');
      ins.setAttribute('data-shortcode', shortcode);
      ins.setAttribute('width', '111');
      ins.setAttribute('height', '222');
      ins.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        ins.setAttribute('layout', 'responsive');
      }
      if (opt_captioned) {
        ins.setAttribute('data-captioned', '');
      }
      const visibilityPromise = env.sandbox.stub(
        env.ampdoc,
        'whenFirstVisible'
      );
      visibilityPromise.returns(
        opt_visibilityPromise ||
          new Promise((resolve) => {
            resolve();
          })
      );
      env.sandbox.stub(AmpInstagram.prototype, 'getVsync').returns({
        mutate(cb) {
          cb();
        },
        measure(cb) {
          cb();
        },
        runPromise(task, state = {}) {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
          return Promise.resolve();
        },
      });
      doc.body.appendChild(ins);
      await ins.buildInternal();
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(ins);
      }
      await ins.layoutCallback();
      return ins;
    }

    function testIframe(iframe) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.instagram.com/p/fBwFP/embed/?cr=1&v=12'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
    }

    function testIframeCaptioned(iframe) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.instagram.com/p/fBwFP/embed/captioned/?cr=1&v=12'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
    }

    it('renders', async () => {
      const ins = await getIns('fBwFP');
      testIframe(ins.querySelector('iframe'));
    });

    it('renders captioned', async () => {
      const ins = await getIns('fBwFP', undefined, undefined, true);
      testIframeCaptioned(ins.querySelector('iframe'));
    });

    it('removes iframe after unlayoutCallback', async () => {
      const ins = await getIns('fBwFP');
      const obj = await ins.getImpl(false);
      testIframe(ins.querySelector('iframe'));
      obj.unlayoutCallback();
      expect(ins.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.be.null;
    });

    it('renders responsively', async () => {
      const ins = await getIns('fBwFP', true);
      expect(ins.className).to.match(/i-amphtml-layout-responsive/);
    });

    it('requires data-shortcode', () => {
      allowConsoleError(() => {
        expect(getIns('')).to.be.rejectedWith(
          /The data-shortcode attribute is required for/
        );
      });
    });

    it('resizes in response to messages from Instagram iframe', async () => {
      const ins = await getIns('fBwFP', true);
      const impl = await ins.getImpl(false);
      const iframe = ins.querySelector('iframe');
      const forceChangeHeight = env.sandbox.spy(impl, 'forceChangeHeight');
      const newHeight = 977;
      expect(iframe).to.not.be.null;
      await sendFakeMessage(ins, iframe, 'MEASURE', {
        height: newHeight,
      });
      expect(forceChangeHeight).to.be.calledOnce;
      // Height minus padding
      expect(forceChangeHeight.firstCall.args[0]).to.equal(newHeight);
    });

    async function sendFakeMessage(ins, iframe, type, details) {
      const impl = await ins.getImpl(false);
      impl.handleInstagramMessages_({
        origin: 'https://www.instagram.com',
        source: iframe.contentWindow,
        data: JSON.stringify({
          type,
          details,
        }),
      });
    }
  }
);
