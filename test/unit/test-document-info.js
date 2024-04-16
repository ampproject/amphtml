import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import * as CID from '#service/cid-impl';
import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';

import {FakePerformance} from '#testing/fake-dom';
import {createIframePromise} from '#testing/iframe';

describes.sandboxed('document-info', {}, (env) => {
  beforeEach(() => {
    env.sandbox.stub(CID, 'getRandomString64').returns('abcdef');
  });

  function getWin(links, metas) {
    return createIframePromise().then((iframe) => {
      if (links) {
        for (const rel in links) {
          const hrefs = links[rel];
          for (let i = 0; i < hrefs.length; i++) {
            const link = iframe.doc.createElement('link');
            link.setAttribute('rel', rel);
            link.setAttribute('href', hrefs[i]);
            iframe.doc.head.appendChild(link);
          }
        }
      }
      if (metas) {
        for (const name in metas) {
          const contents = metas[name];
          for (let i = 0; i < contents.length; i++) {
            const meta = iframe.doc.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', contents[i]);
            iframe.doc.head.appendChild(meta);
          }
        }
      }
      const {win} = iframe;
      installDocService(win, /* isSingleDoc */ true);
      env.sandbox.stub(win.Math, 'random').callsFake(() => 0.123456789);
      win.__AMP_SERVICES.documentInfo = null;
      installDocumentInfoServiceForDoc(win.document);
      return iframe.win;
    });
  }

  it('should provide the canonicalUrl', () => {
    return getWin({'canonical': ['https://twitter.com/']}).then((win) => {
      expect(Services.documentInfoForDoc(win.document).canonicalUrl).to.equal(
        'https://twitter.com/'
      );
    });
  });

  it('should provide the sourceUrl', () => {
    const win = {
      document: {
        nodeType: /* DOCUMENT */ 9,
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector() {
            return null;
          },
          querySelectorAll() {
            return [];
          },
        },
        querySelector() {
          return 'http://www.origin.com/foo/?f=0';
        },
        getRootNode() {
          return win.document;
        },
      },
      Math: {
        random() {
          return 0.123456789;
        },
      },
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      performance: new FakePerformance(window),
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(Services.documentInfoForDoc(win.document).sourceUrl).to.equal(
      'http://www.origin.com/foo/?f=0'
    );
  });

  it('should provide the updated sourceUrl', () => {
    const win = {
      document: {
        nodeType: /* document */ 9,
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector() {
            return null;
          },
          querySelectorAll() {
            return [];
          },
        },
        querySelector() {
          return 'http://www.origin.com/foo/?f=0';
        },
        getRootNode() {
          return win.document;
        },
      },
      Math: {
        random() {
          return 0.123456789;
        },
      },
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      performance: new FakePerformance(window),
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(Services.documentInfoForDoc(win.document).sourceUrl).to.equal(
      'http://www.origin.com/foo/?f=0'
    );
    win.location.href = 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=1';
    expect(Services.documentInfoForDoc(win.document).sourceUrl).to.equal(
      'http://www.origin.com/foo/?f=1'
    );
  });

  it('should provide the pageViewId', () => {
    return getWin({'canonical': ['https://twitter.com/']}).then((win) => {
      expect(Services.documentInfoForDoc(win.document).pageViewId).to.equal(
        '1234'
      );
      expect(Services.documentInfoForDoc(win.document).pageViewId).to.equal(
        '1234'
      );
    });
  });

  it('should provide the pageViewId64', () => {
    return getWin({'canonical': ['https://twitter.com/']}).then((win) => {
      expect(Services.documentInfoForDoc(win.document).pageViewId64).to.equal(
        'abcdef'
      );
      expect(Services.documentInfoForDoc(win.document).pageViewId64).to.equal(
        'abcdef'
      );
    });
  });

  it('should provide the relative canonicalUrl as absolute', () => {
    return getWin({'canonical': ['./foo.html']}).then((win) => {
      expect(Services.documentInfoForDoc(win.document).canonicalUrl).to.equal(
        'http://localhost:' + location.port + '/foo.html'
      );
    });
  });

  it('should provide the linkRels containing link tag rels', () => {
    return getWin({
      'canonical': ['https://twitter.com/'],
      'icon': ['https://foo.html/bar.gif'],
    }).then((win) => {
      expect(
        Services.documentInfoForDoc(win.document).linkRels['canonical']
      ).to.equal('https://twitter.com/');
      expect(
        Services.documentInfoForDoc(win.document).linkRels['icon']
      ).to.equal('https://foo.html/bar.gif');
    });
  });

  it('should provide empty linkRels if there are no link tags', () => {
    return getWin().then((win) => {
      expect(Services.documentInfoForDoc(win.document).linkRels).to.be.empty;
    });
  });

  it('should provide the linkRels containing link tag rels as absolute', () => {
    return getWin({
      'canonical': ['./foo.html'],
      'icon': ['./bar.gif'],
    }).then((win) => {
      expect(
        Services.documentInfoForDoc(win.document).linkRels['canonical']
      ).to.equal('http://localhost:' + location.port + '/foo.html');
      expect(
        Services.documentInfoForDoc(win.document).linkRels['icon']
      ).to.equal('http://localhost:' + location.port + '/bar.gif');
    });
  });

  it(
    'should provide the linkRels containing link tag rels with ' +
      'space in rel',
    () => {
      return getWin({
        'sharelink canonical': ['https://twitter.com/'],
        'icon': ['https://foo.html/bar.gif'],
      }).then((win) => {
        expect(
          Services.documentInfoForDoc(win.document).linkRels['sharelink']
        ).to.equal('https://twitter.com/');
        expect(
          Services.documentInfoForDoc(win.document).linkRels['canonical']
        ).to.equal('https://twitter.com/');
        expect(
          Services.documentInfoForDoc(win.document).linkRels['icon']
        ).to.equal('https://foo.html/bar.gif');
      });
    }
  );

  it(
    'should provide the linkRels containing link tag rels with multiple ' +
      'hrefs',
    () => {
      return getWin({
        'canonical': ['https://twitter.com/'],
        'icon': ['https://foo.html/bar.gif'],
        'stylesheet': [
          'https://foo.html/style1.css',
          'https://foo.html/style2.css',
        ],
      }).then((win) => {
        const documentInfo = Services.documentInfoForDoc(win.document);
        expect(documentInfo.linkRels['canonical']).to.equal(
          'https://twitter.com/'
        );
        expect(documentInfo.linkRels['icon']).to.equal(
          'https://foo.html/bar.gif'
        );
        expect(documentInfo.linkRels['stylesheet'].length).to.equal(2);
        expect(documentInfo.linkRels['stylesheet'][0]).to.equal(
          'https://foo.html/style1.css'
        );
        expect(documentInfo.linkRels['stylesheet'][1]).to.equal(
          'https://foo.html/style2.css'
        );
      });
    }
  );

  it(
    'should provide the linkRels containing link tag rels but drop ' +
      'prefetch/preload/preconnect rels',
    () => {
      return getWin({
        'canonical': ['https://twitter.com/'],
        'icon': ['https://foo.html/bar.gif'],
        'prefetch': ['https://foo1.com'],
        'preload': ['https://foo2.com'],
        'preconnect': ['https://foo3.com'],
      }).then((win) => {
        expect(
          Services.documentInfoForDoc(win.document).linkRels['canonical']
        ).to.equal('https://twitter.com/');
        expect(
          Services.documentInfoForDoc(win.document).linkRels['icon']
        ).to.equal('https://foo.html/bar.gif');
        expect(Services.documentInfoForDoc(win.document).linkRels['prefetch'])
          .to.be.undefined;
        expect(Services.documentInfoForDoc(win.document).linkRels['preload']).to
          .be.undefined;
        expect(Services.documentInfoForDoc(win.document).linkRels['preconnect'])
          .to.be.undefined;
      });
    }
  );

  it('should provide the viewport', () => {
    return getWin(
      {},
      {
        'viewport': ['width=device-width'],
      }
    ).then((win) => {
      expect(Services.documentInfoForDoc(win.document).viewport).to.equal(
        'width=device-width'
      );
    });
  });

  it('should provide the replaceParams for an AMP landing page', () => {
    const base = 'https://cdn.ampproject.org/a/www.origin.com/foo/';
    const win = {
      document: {
        nodeType: /* document */ 9,
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector() {
            return null;
          },
          querySelectorAll() {
            return [];
          },
        },
        querySelector() {
          return 'http://www.origin.com/foo/?f=0';
        },
        getRootNode() {
          return win.document;
        },
      },
      Math: {
        random() {
          return 0.123456789;
        },
      },
      location: {
        href: base + '?f=0&amp_r=test%3Dhello%20world',
      },
      performance: new FakePerformance(window),
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(
      Services.documentInfoForDoc(win.document).replaceParams
    ).to.deep.equal({'test': 'hello world'});
  });

  it('should not have replaceParams for non-AMP landing page', () => {
    const base = 'https://cdn.ampproject.org/v/www.origin.com/foo/';
    const win = {
      document: {
        nodeType: /* document */ 9,
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector() {
            return null;
          },
          querySelectorAll() {
            return [];
          },
        },
        querySelector() {
          return 'http://www.origin.com/foo/?f=0';
        },
        getRootNode() {
          return win.document;
        },
      },
      Math: {
        random() {
          return 0.123456789;
        },
      },
      location: {
        href: base + '?f=0&amp_r=test%3Dhello%20world',
      },
      performance: new FakePerformance(window),
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(Services.documentInfoForDoc(win.document).replaceParams).to.be.null;
  });

  it('should not provide the replaceParams if invalid', () => {
    const base = 'https://cdn.ampproject.org/a/www.origin.com/foo/';
    const win = {
      document: {
        nodeType: /* document */ 9,
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector() {
            return null;
          },
          querySelectorAll() {
            return [];
          },
        },
        querySelector() {
          return 'http://www.origin.com/foo/?f=0';
        },
        getRootNode() {
          return win.document;
        },
      },
      Math: {
        random() {
          return 0.123456789;
        },
      },
      location: {
        href: base + '?f=0&amp_r=%3Dinvalid',
      },
      performance: new FakePerformance(window),
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(
      Services.documentInfoForDoc(win.document).replaceParams
    ).to.deep.equal({});
  });
});
