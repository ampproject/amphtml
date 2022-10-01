import '../amp-playbuzz';

describes.realWin(
  'amp-playbuzz',
  {
    amp: {
      extensions: ['amp-playbuzz'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function createOptionalParams(
      displayInfo,
      displayShareBar,
      displayComments
    ) {
      return {
        displayItemInfo: displayInfo,
        displayShareBar,
        displayComments,
      };
    }

    function createItemSrc() {
      return {
        withUrl(itemUrl) {
          this.itemUrl = itemUrl;
          return this;
        },
        withItemId(itemId) {
          this.itemId = itemId;
          return this;
        },
      };
    }

    function getIns(itemSrc, params, opt_responsive, opt_beforeLayoutCallback) {
      const ins = doc.createElement('amp-playbuzz');
      if (itemSrc.itemUrl) {
        ins.setAttribute('src', itemSrc.itemUrl);
      }
      if (itemSrc.itemId) {
        ins.setAttribute('data-item', itemSrc.itemId);
      }
      ins.setAttribute('height', '222');
      ins.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        ins.setAttribute('width', '111');
        ins.setAttribute('layout', 'responsive');
      } else {
        ins.setAttribute('layout', 'fixed-height');
      }
      if (params && typeof params.displayItemInfo === 'boolean') {
        ins.setAttribute('data-item-info', params.displayItemInfo);
      }
      if (params && typeof params.displayShareBar === 'boolean') {
        ins.setAttribute('data-share-buttons', params.displayShareBar);
      }
      if (params && typeof params.displayComments === 'boolean') {
        ins.setAttribute('data-comments', params.displayComments);
      }
      if (params && params.arialabel) {
        ins.setAttribute('aria-label', params.arialabel);
      }
      doc.body.appendChild(ins);
      return ins
        .buildInternal()
        .then(() => {
          if (opt_beforeLayoutCallback) {
            opt_beforeLayoutCallback(ins);
          }
          return ins.layoutCallback();
        })
        .then(() => ins);
    }

    function testIframe(iframe, itemSrcUrl) {
      expect(iframe).to.not.be.null;
      expect(iframe.src.startsWith(itemSrcUrl)).to.be.true;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      // This is important to avoid sizing issues.
      expect(iframe.getAttribute('scrolling')).to.equal('no');
    }

    it('renders', () => {
      const src = createItemSrc().withUrl(
        'https://app.ex.co/stories/bob/bobs-life'
      );
      return getIns(src).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/bob/bobs-life');
        // TODO: test playbuzz placeholder loader
      });
    });

    it('renders with old url', () => {
      const src = createItemSrc().withUrl(
        'https://www.playbuzz.com/bob/bobs-life'
      );
      return getIns(src).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/bob/bobs-life');
      });
    });

    it('renders with false for each optional param', () => {
      const src = createItemSrc().withUrl(
        'https://app.ex.co/stories/bob/bobs-life'
      );
      return getIns(src).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/bob/bobs-life');
        expect(iframe.src)
          .to.contain('&useComments=false')
          .and.to.contain('&gameInfo=false')
          .and.to.contain('&useShares=false');
      });
    });

    it('renders with item id instead of src', () => {
      const src = createItemSrc().withItemId('some-item-id');
      return getIns(src).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/item/some-item-id');
      });
    });

    it('renders with item id when submitted both with item url & item id', () => {
      const src = createItemSrc()
        .withUrl('https://app.ex.co/stories/bob/bobs-life')
        .withItemId('some-item-id');

      return getIns(src).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/item/some-item-id');
      });
    });

    it('renders with true for each true optional param', () => {
      const src = createItemSrc().withUrl(
        'https:///app.ex.co/stories/bob/bobs-life'
      );
      return getIns(src, createOptionalParams(true, true, true)).then((ins) => {
        const iframe = ins.querySelector('iframe');
        testIframe(iframe, '//app.ex.co/stories/bob/bobs-life');
        expect(iframe.src)
          .to.contain('&useComments=true')
          .and.to.contain('&gameInfo=true')
          .and.to.contain('&useShares=true');
      });
    });

    it('propagates aria label to placeholder', () => {
      const src = createItemSrc().withUrl(
        'https://app.ex.co/stories/bob/bobs-life'
      );
      return getIns(src, {'arialabel': 'captivating quiz'}, true, (ins) => {
        // console.log(ins);
        const placeholder = ins.querySelector('[placeholder]');
        expect(placeholder.getAttribute('aria-label')).to.equal(
          'Loading - captivating quiz'
        );
      });
    });
    it('requires item attribute', () => {
      const src = createItemSrc().withUrl('');
      allowConsoleError(() => {
        expect(getIns(src)).to.be.rejectedWith(
          /The item attribute is required for/
        );
      });
    });
  }
);
