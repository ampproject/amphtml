import '../../../amp-mustache/0.2/amp-mustache';
import {tryParseJson} from '#core/types/object/json';
import {utf8Encode} from '#core/types/string/bytes';

import {getAmpAdTemplateHelper} from '../../../amp-a4a/0.1/amp-ad-template-helper';
import {AMP_TEMPLATED_CREATIVE_HEADER_NAME} from '../../../amp-a4a/0.1/template-validator';
import {data} from '../../../amp-a4a/0.1/test/testdata/valid_css_at_rules_amp.reserialized';
import {AmpAdTemplate} from '../amp-ad-custom';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateRenderer', realWinConfig, (env) => {
  const templateUrl = '/adzerk/1';

  let doc, ampdoc;
  let containerElement;
  let impl;

  beforeEach(() => {
    doc = env.win.document;
    ampdoc = env.ampdoc;
    containerElement = doc.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.setAttribute('src', templateUrl);
    containerElement.signals = () => ({
      signal: () => {},
      reset: () => {},
      whenSignal: () => Promise.resolve(),
    });
    containerElement.renderStarted = () => {};
    containerElement.getLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getIntersectionChangeEntry = () => ({
      rootBounds: {},
      intersectionRect: {},
      boundingClientRect: {},
    });
    containerElement.isInViewport = () => true;
    containerElement.getAmpDoc = () => env.ampdoc;
    doc.body.appendChild(containerElement);

    impl = new AmpAdTemplate(containerElement);
    impl.attemptChangeSize = (width, height) => {
      impl.element.style.width = width;
      impl.element.style.height = height;
    };

    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
  });

  afterEach(() => {
    doc.body.removeChild(containerElement);
  });

  describe('Iframe Rendering', () => {
    it('should load AMP ad in friendly frame', () => {
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () =>
          Promise.resolve(
            utf8Encode(
              JSON.stringify({
                templateUrl,
                data: {
                  url: 'https://www.google.com',
                },
              })
            )
          ),
        headers: {
          get: (header) => {
            switch (header) {
              case AMP_TEMPLATED_CREATIVE_HEADER_NAME:
                return 'amp-mustache';
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      env.sandbox
        .stub(getAmpAdTemplateHelper(ampdoc), 'fetch')
        .callsFake((url) => {
          expect(url).to.equal(templateUrl);
          return Promise.resolve(data.adTemplate);
        });

      impl.buildCallback();
      impl.getRequestUrl();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        expect(iframe.contentWindow.document.body.innerHTML.trim()).to.equal(
          '<div>\n      <p>ipsum lorem</p>\n      <a target="_top"' +
            ' href="https://www.google.com/">Click for ad!</a>\n    ' +
            '</div>'
        );
      });
    });

    it('should load non-AMP ad in nameframe', () => {
      const mockCreative = '<html><body>Ipsum Lorem</body></html>';
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () => Promise.resolve(utf8Encode(mockCreative)),
        headers: {
          get: (header) => {
            switch (header) {
              case AMP_TEMPLATED_CREATIVE_HEADER_NAME:
                return 'amp-mustache';
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      impl.buildCallback();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        const nameAttr = tryParseJson(iframe.getAttribute('name'));
        expect(nameAttr).to.be.ok;
        expect(nameAttr.creative).to.equal(mockCreative);
      });
    });

    it('should load non-AMP ad in nameframe if missing mustache header', () => {
      const mockCreative = '<html><body>Ipsum Lorem</body></html>';
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () => Promise.resolve(utf8Encode(mockCreative)),
        headers: {
          get: (header) => {
            switch (header) {
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      impl.buildCallback();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        const nameAttr = tryParseJson(iframe.getAttribute('name'));
        expect(nameAttr).to.be.ok;
        expect(nameAttr.creative).to.equal(mockCreative);
      });
    });
  });

  describe('#getRequestUrl', () => {
    it('should add url to context', () => {
      impl.buildCallback();
      impl.getRequestUrl();
      expect(impl.getContext().adUrl).to.equal(templateUrl);
    });
    it('should expand url', () => {
      impl.buildCallback();
      impl.element.setAttribute('data-request-param-bar', '123');
      impl.element.setAttribute('data-request-param-baz', '456');
      impl.element.setAttribute('data-request-param-camel-case', '789');
      impl.baseRequestUrl_ = 'https://foo.com';
      expect(impl.getRequestUrl()).to.equal(
        'https://foo.com?bar=123&baz=456&camelCase=789'
      );
    });
    it('should substitute macros', () => {
      impl.buildCallback();
      impl.baseRequestUrl_ = 'https://foo.com?location=CANONICAL_URL';
      expect(impl.getRequestUrl()).to.equal(
        'https://foo.com?location=' +
          'http%3A%2F%2Flocalhost%3A9876%2Fcontext.html'
      );
    });
  });

  describe('mandatory fields', () => {
    it('should throw if missing src attribute', () => {
      containerElement.removeAttribute('src');
      allowConsoleError(() => {
        expect(() => new AmpAdTemplate(containerElement)).to.throw(
          'Invalid network configuration: no request URL specified'
        );
      });
    });
  });
});
