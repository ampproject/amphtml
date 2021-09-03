import {LinkRewriter} from '../link-rewriter';

const helpersMaker = () => {
  return {
    createLinkRewriterElement(config) {
      const element = document.createElement('amp-link-rewriter');
      element.setAttribute('layout', 'nodisplay');

      const script = document.createElement('script');
      script.setAttribute('type', 'application/json');
      script.innerHTML = JSON.stringify(config);

      element.append(script);
      return element;
    },
    createConfig(config = {}) {
      const defaults = {
        'output':
          'https://visit.foo.net/visit?pid=110&url=${href}&cid=${customerId}&ref=DOCUMENT_REFERRER&location=SOURCE_URL&rel=${rel}&productId=${eventId}',
        'section': ['#in-scope'],
        'attribute': {
          'class': 'sidebar',
          'href': '(https:\\/\\/(www\\.)?retailer-example\\.local).*',
        },
        'vars': {
          'customerId': '12345',
        },
      };

      return Object.assign(defaults, config);
    },
    assertLinksRewritten(urlsList, template, config, env) {
      const rootNode = env.ampdoc.getRootNode();
      const linkRewriterElement = this.createLinkRewriterElement(config);
      rootNode.body.appendChild(linkRewriterElement);
      rootNode.body.insertAdjacentHTML('afterbegin', template);

      const rewriter = new LinkRewriter('', linkRewriterElement, env.ampdoc);

      const links = rootNode.body.querySelectorAll('a');

      expect(links.length).to.equal(urlsList.length);

      for (let i = 0; i < links.length; i++) {
        rewriter.handleClick(links[i]);
        expect(links[i].href).to.equal(urlsList[i]);
      }
    },
  };
};

export default helpersMaker;
