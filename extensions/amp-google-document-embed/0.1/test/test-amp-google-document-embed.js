import '../amp-google-document-embed';

describes.realWin(
  'amp-google-document-embed',
  {
    amp: {
      extensions: ['amp-google-document-embed'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getDriveViewer(src, opt_responsive) {
      const element = doc.createElement('amp-google-document-embed');
      element.setAttribute('width', '100');
      element.setAttribute('height', '100');
      if (src) {
        element.setAttribute('src', src);
      }
      if (opt_responsive) {
        element.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(element);

      return element
        .buildInternal()
        .then(() => element.layoutCallback())
        .then(() => element);
    }

    it('renders arbitrary documents', () => {
      return getDriveViewer('https://example.com/doc.pdf').then((element) => {
        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          'https://docs.google.com/gview?embedded=true&url=https%3A%2F%2Fexample.com%2Fdoc.pdf'
        );
      });
    });

    it('renders Google Docs documents', () => {
      const googleDocumentUrl =
        'https://docs.google.com/document/d/e/2PACX-1vQcy6GoJ2yCKMxe4SNALCPCYWV2Ufg-e6D3djyaJluQXubAfKA3toPqVxWaWK-lJFm4Nyxv-swrkvyN/pub';
      return getDriveViewer(googleDocumentUrl).then((element) => {
        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(googleDocumentUrl);
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const element = await getDriveViewer('https://example.com/doc.pdf');
      const impl = await element.getImpl();
      impl.unlayoutCallback();
      expect(element.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  }
);
