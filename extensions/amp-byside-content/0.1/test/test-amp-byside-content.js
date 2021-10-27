import '../amp-byside-content';
import {mockServiceForDoc} from '#testing/helpers/service';

describes.realWin(
  'amp-byside-content',
  {
    amp: {
      extensions: ['amp-byside-content'],
    },
    ampAdCss: true,
  },
  (env) => {
    let win, doc, urlMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      urlMock = mockServiceForDoc(env.sandbox, env.ampdoc, 'url-replace', [
        'expandUrlAsync',
      ]);
    });

    function getElement(attributes, opt_responsive, opt_beforeLayoutCallback) {
      const elem = doc.createElement('amp-byside-content');

      for (const key in attributes) {
        elem.setAttribute(key, attributes[key]);
      }

      elem.setAttribute('width', '640');
      elem.setAttribute('height', '360');
      if (opt_responsive) {
        elem.setAttribute('layout', 'responsive');
      }

      doc.body.appendChild(elem);
      return elem
        .buildInternal()
        .then(() => elem.getImpl())
        .then((impl) => {
          urlMock.expandUrlAsync
            .returns(Promise.resolve(impl.baseUrl_))
            .withArgs(env.sandbox.match.any);
          if (opt_beforeLayoutCallback) {
            opt_beforeLayoutCallback(elem);
          }

          return elem.layoutCallback();
        })
        .then(() => elem);
    }

    function testIframe(elem, impl) {
      const iframe = elem.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('frameborder')).to.equal('0');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      expect(iframe.fakeSrc).to.satisfy((src) => {
        return src.startsWith(impl.baseUrl_);
      });
    }

    it('renders', async () => {
      const elem = await getElement({
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'amp-simple',
      });
      const impl = await elem.getImpl();
      testIframe(elem, impl);
    });

    it('requires data-label', () => {
      return allowConsoleError(() => {
        return getElement({
          'data-webcare-id': 'D6604AE5D0',
        }).should.eventually.be.rejectedWith(
          /The data-label attribute is required for/
        );
      });
    });

    it('requires data-webcare-id', () => {
      return allowConsoleError(() => {
        return getElement({
          'data-label': 'placeholder-label',
        }).should.eventually.be.rejectedWith(
          /The data-webcare-id attribute is required for/
        );
      });
    });

    it('generates correct default origin', async () => {
      const elem = await getElement({
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
      });
      const impl = await elem.getImpl();
      expect(impl.origin_).to.equal('https://webcare.byside.com');
    });

    it('generates correct provided webcare zone', async () => {
      const webcareZone = 'sa1';

      const elem = await getElement({
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
        'data-webcare-zone': webcareZone,
      });
      const impl = await elem.getImpl();
      expect(impl.origin_).to.equal('https://' + webcareZone + '.byside.com');
    });

    it('should create a loading animation', () => {
      return getElement({
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
      }).then((elem) => {
        const loader = elem.querySelector(
          '.i-amphtml-byside-content-loading-animation'
        );
        expect(loader).to.not.be.null;
      });
    });

    it('builds a placeholder loading animation without inserting iframe', async () => {
      const attributes = {
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
      };

      const elem = await getElement(attributes, true, (elem) => {
        const placeholder = elem.querySelector('[placeholder]');
        const iframe = elem.querySelector('iframe');
        expect(iframe).to.be.null;
        expect(placeholder).to.not.have.display('none');
      });
      const impl = await elem.getImpl();

      elem.getVsync = () => {
        return {
          mutate: (fn) => fn(),
        };
      };

      // test iframe
      testIframe(elem, impl);

      // test placeholder too
      await impl.iframePromise_;
    });

    it('passes down sandbox attribute to iframe', () => {
      const sandbox = 'allow-scripts allow-same-origin allow-popups';
      const attributes = {
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
      };

      return getElement(attributes, false).then((elem) => {
        const iframe = elem.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.getAttribute('sandbox')).to.equal(sandbox);
      });
    });

    it('sets scrollable atribute in iframe', () => {
      const attributes = {
        'data-webcare-id': 'D6604AE5D0',
        'data-label': 'placeholder-label',
      };

      return getElement(attributes, false).then((elem) => {
        const iframe = elem.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.getAttribute('scrolling')).to.equal('no');
      });
    });
  }
);
