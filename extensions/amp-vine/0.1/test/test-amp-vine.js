import '../amp-vine';

describes.realWin(
  'amp-vine',
  {
    amp: {
      extensions: ['amp-vine'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getVine(vineId, opt_responsive) {
      const vine = doc.createElement('amp-vine');
      vine.setAttribute('data-vineid', vineId);
      vine.setAttribute('width', 400);
      vine.setAttribute('height', 400);
      if (opt_responsive) {
        vine.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(vine);
      return vine
        .buildInternal()
        .then(() => vine.layoutCallback())
        .then(() => vine);
    }

    it('renders', () => {
      return getVine('MdKjXez002d').then((vine) => {
        const iframe = vine.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://vine.co/v/MdKjXez002d/embed/simple'
        );
      });
    });

    it('renders responsively', () => {
      return getVine('MdKjXez002d', true).then((vine) => {
        const iframe = vine.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-vineid', () => {
      return getVine('').should.eventually.be.rejectedWith(
        /The data-vineid attribute is required for/
      );
    });

    it('unlayout and relayout', async () => {
      const vine = await getVine('MdKjXez002d', true);
      expect(vine.querySelector('iframe')).to.exist;

      const unlayoutResult = vine.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(vine.querySelector('iframe')).to.not.exist;

      await vine.layoutCallback();
      expect(vine.querySelector('iframe')).to.exist;
    });
  }
);
