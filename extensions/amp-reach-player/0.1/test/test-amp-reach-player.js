import '../amp-reach-player';

describes.realWin(
  'amp-reach-player',
  {
    amp: {
      extensions: ['amp-reach-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getReach(attributes, opt_responsive) {
      const reach = doc.createElement('amp-reach-player');
      for (const key in attributes) {
        reach.setAttribute(key, attributes[key]);
      }
      reach.setAttribute('width', '560');
      reach.setAttribute('height', '315');
      if (opt_responsive) {
        reach.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(reach);
      return reach
        .buildInternal()
        .then(() => {
          reach.layoutCallback();
        })
        .then(() => reach);
    }

    it('renders', () => {
      return getReach({
        'data-embed-id': 'default',
      }).then((reach) => {
        const iframe = reach.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://player-cdn.beachfrontmedia.com/playerapi/v1/frame/player/?embed_id=default'
        );
      });
    });

    it('renders responsively', () => {
      return getReach(
        {
          'data-embed-id': 'default',
        },
        true
      ).then((reach) => {
        const iframe = reach.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('unlayout and relayout', async () => {
      const reach = await getReach({
        'data-embed-id': 'default',
      });
      expect(reach.querySelector('iframe')).to.exist;

      const unlayoutResult = reach.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(reach.querySelector('iframe')).to.not.exist;

      await reach.layoutCallback();
      expect(reach.querySelector('iframe')).to.exist;
    });
  }
);
