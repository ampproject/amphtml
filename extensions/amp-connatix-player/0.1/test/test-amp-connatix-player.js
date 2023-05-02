import '../amp-connatix-player';

describes.realWin(
  'amp-connatix-player',
  {
    amp: {
      extensions: ['amp-connatix-player'],
    },
  },
  (env) => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getConnatixPlayer(attributes) {
      const cnx = doc.createElement('amp-connatix-player');
      for (const key in attributes) {
        cnx.setAttribute(key, attributes[key]);
      }
      cnx.setAttribute('width', '480');
      cnx.setAttribute('height', '270');
      cnx.setAttribute('layout', 'responsive');

      doc.body.appendChild(cnx);
      return cnx.buildInternal().then(() => {
        cnx.layoutCallback();
        return cnx;
      });
    }

    it('renders', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://amp.cntxcdm.com/amp-embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&url=about%3Asrcdoc'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with a mediaId', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
        'data-media-id': '527207df-2007-43c4-b87a-f90814bafd2e',
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://amp.cntxcdm.com/amp-embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&mediaId=527207df-2007-43c4-b87a-f90814bafd2e&url=about%3Asrcdoc'
      );
    });
    it('renders when data-elements-player is set', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
        'data-elements-player': true,
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cdm.elements.video/amp-embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&url=about%3Asrcdoc'
      );
    });
    it('should pass data-param-* attributes to the iframe src', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
        'data-param-my-param': 17,
      });
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://amp.cntxcdm.com/amp-embed/index.html?playerId=f721b0d8-7a79-42b6-b637-fa4e86138ed9&url=about%3Asrcdoc&myParam=17'
      );
    });

    it('fails if no playerId is specified', () => {
      return allowConsoleError(() => {
        return getConnatixPlayer({
          'data-media-id': '527207df-2007-43c4-b87a-f90814bafd2e',
        }).should.eventually.be.rejectedWith(
          /The data-player-id attribute is required for/
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const cnx = await getConnatixPlayer({
        'data-player-id': 'f721b0d8-7a79-42b6-b637-fa4e86138ed9',
      });
      const obj = await cnx.getImpl();
      const iframe = cnx.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(cnx.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });
  }
);
