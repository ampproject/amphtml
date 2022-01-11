import '../amp-hulu';

describes.realWin(
  'amp-hulu',
  {
    amp: {
      extensions: ['amp-hulu'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getHulu(eid, opt_responsive) {
      const hulu = doc.createElement('amp-hulu');
      hulu.setAttribute('data-eid', eid);
      hulu.setAttribute('width', '111');
      hulu.setAttribute('height', '222');
      if (opt_responsive) {
        hulu.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(hulu);
      return hulu.buildInternal().then(() => {
        hulu.layoutCallback();
        return hulu;
      });
    }

    it('renders', () => {
      return getHulu('4Dk5F2PYTtrgciuvloH3UA').then((hulu) => {
        const iframe = hulu.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://player.hulu.com/site/dash/mobile_embed.html?amp=1&eid=4Dk5F2PYTtrgciuvloH3UA'
        );
      });
    });

    it('renders responsively', () => {
      return getHulu('4Dk5F2PYTtrgciuvloH3UA', true).then((hulu) => {
        const iframe = hulu.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-eid', () => {
      return allowConsoleError(() => {
        return getHulu('').should.eventually.be.rejectedWith(
          /The data-eid attribute is required for/
        );
      });
    });
  }
);
