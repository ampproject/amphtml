import helpersMaker from './test-helpers';

import {getConfigOpts} from '../config-options';
import {LinkRewriter} from '../link-rewriter';
import {getScopeElements} from '../scope';

describes.fakeWin(
  'amp-link-rewriter',
  {
    win: {
      location: 'http://partnersite.com/123',
    },
    amp: {
      extensions: ['amp-link-rewriter'],
    },
  },
  (env) => {
    let config, helpers, mockedHtml, win;

    beforeEach(() => {
      win = env.win;

      helpers = helpersMaker();

      config = {
        'output':
          'https://visit.foo.net/visit?pid=110&url=${href}&cid=${customerId}&ref=DOCUMENT_REFERRER&location=SOURCE_URL&rel=${rel}&productId=${eventId}',
        'section': ['#track-section'],
        'attribute': {
          'class': 'sidebar',
          'href': '((?!\\bskip\\.com\\b).)*',
        },
        'vars': {
          'customerId': '12345',
        },
      };

      mockedHtml =
        '<div>' +
        '<a class="sidebar" href="http://example.com">Example</a>' +
        '</div>' +
        '<div id="track-section">' +
        '<a class="sidebar" href="http://retailer1.com">Retailer 1</a>' +
        '<a class="sidebar" href="https://skip.com">Retailer 2</a>' +
        '</div>';
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    it('Should match the built url', () => {
      const linkRewriterElement = helpers.createLinkRewriterElement(config);
      env.ampdoc.getRootNode().body.appendChild(linkRewriterElement);

      const rewriter = new LinkRewriter('', linkRewriterElement, env.ampdoc);

      const anchorElement = win.document.createElement('a');

      anchorElement.href = 'http://example.com';
      anchorElement.rel = '235';
      anchorElement.setAttribute('data-vars-event-id', '567');

      rewriter.handleClick(anchorElement);
      expect(anchorElement.href).to.equal(
        'https://visit.foo.net/visit?pid=110&url=http%3A%2F%2Fexample.com&cid=12345&ref=&location=http%3A%2F%2Fpartnersite.com%2F123&rel=235&productId=567'
      );
    });

    it('Should return the number of anchors that match the config', () => {
      const linkRewriterElement = helpers.createLinkRewriterElement(config);

      const doc = document.implementation.createHTMLDocument('test document');
      doc.body.appendChild(linkRewriterElement);
      doc.body.insertAdjacentHTML('afterbegin', mockedHtml);

      const configOpts_ = getConfigOpts(linkRewriterElement);

      const list = getScopeElements(doc, configOpts_);

      expect(list.length).to.equal(1);
    });
  }
);
