import '../amp-embedly-card';

describes.realWin(
  'amp-embedly-card',
  {
    amp: {
      extensions: ['amp-embedly-card'],
    },
  },
  (env) => {
    let win;

    beforeEach(() => {
      win = env.win;
    });

    function createEmbedlyCard(dataUrl) {
      const element = win.document.createElement('amp-embedly-card');
      element.setAttribute('layout', 'nodisplay');

      element.setAttribute('data-url', dataUrl);
      element.setAttribute('height', '100');

      win.document.body.appendChild(element);

      return element
        .buildInternal()
        .then(() => element.layoutCallback())
        .then(() => element);
    }

    it('renders responsively', () => {
      return createEmbedlyCard(
        'https://twitter.com/AMPhtml/status/986750295077040128'
      ).then((element) => {
        const iframe = element.querySelector('iframe');

        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('throws when data-url is not given', () => {
      allowConsoleError(() =>
        expect(createEmbedlyCard('')).to.be.rejectedWith(
          /The data-url attribute is required for/
        )
      );
    });

    it('removes iframe after unlayoutCallback', async () => {
      const element = await createEmbedlyCard('https://twitter.com/AMPhtml');
      const instance = await element.getImpl();

      const iframe = element.querySelector('iframe');
      expect(iframe).to.not.be.null;

      instance.unlayoutCallback();

      expect(element.querySelector('iframe')).to.be.null;
      expect(instance.iframe_).to.be.null;
    });
  }
);
