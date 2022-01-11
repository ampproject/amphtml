import '../amp-mathml';

describes.realWin(
  'amp-mathml',
  {
    amp: {
      extensions: ['amp-mathml'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  (env) => {
    let win, doc;
    const title = 'My MathML formula';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAmpMathml() {
      const ampMathml = doc.createElement('amp-mathml');
      ampMathml.setAttribute('layout', 'container');
      ampMathml.setAttribute(
        'data-formula',
        '[x = {-b pm sqrt{b^2-4ac} over 2a}.]'
      );
      ampMathml.setAttribute('title', title);
      doc.body.appendChild(ampMathml);
      await ampMathml.buildInternal();
      await ampMathml.layoutCallback();
      return ampMathml;
    }

    it('renders iframe with title', async () => {
      const ampMathml = await getAmpMathml();
      const iframe = ampMathml.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.title).to.equal(title);
    });

    it('removes iframe on unlayout', async () => {
      const ampMathml = await getAmpMathml();
      const iframe = ampMathml.firstChild;
      expect(iframe).to.not.be.null;
      ampMathml.unlayoutCallback();
      expect(ampMathml.querySelector('iframe')).to.be.null;
    });
  }
);
