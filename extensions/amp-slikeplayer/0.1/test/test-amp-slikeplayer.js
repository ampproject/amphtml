import '../amp-slikeplayer';
describes.realWin(
  'amp-slikeplayer-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-slikeplayer:0.1'],
    },
  },
  (env) => {
    let win, doc;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getSlike(attributes, opt_responsive) {
      const slikeplayer = doc.createElement('amp-slikeplayer');
      for (const key in attributes) {
        slikeplayer.setAttribute(key, attributes[key]);
      }
      slikeplayer.setAttribute('width', '320');
      slikeplayer.setAttribute('height', '180');
      if (opt_responsive) {
        slikeplayer.setAttribute('layout', 'responsive');
      }

      doc.body.appendChild(slikeplayer);
      await slikeplayer.buildInternal();
      await slikeplayer.layoutCallback();
      return slikeplayer;
    }

    it('renders', async () => {
      const slikeplayer = await getSlike(
        {
          'data-apikey': 'slike373googleamp5accuzkglo',
          'data-videoid': '1xp5a1wkul',
          'data-config': 'skipad=true',
        },
        true
      );
      const iframe = slikeplayer.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://tvid.in/sdk/amp/ampembed.html#apikey=slike373googleamp5accuzkglo&videoid=1xp5a1wkul&skipad=true&baseurl=' +
          window.location.origin
      );
    });

    it('renders responsively', async () => {
      const slikeplayer = await getSlike(
        {
          'data-apikey': 'slike373googleamp5accuzkglo',
          'data-videoid': '1xp5a1wkul',
        },
        true
      );
      const iframe = slikeplayer.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://tvid.in/sdk/amp/ampembed.html#apikey=slike373googleamp5accuzkglo&videoid=1xp5a1wkul&baseurl=' +
          window.location.origin
      );
    });

    it('requires data-videoid', () => {
      return getSlike(
        {
          'data-apikey': 'slike373googleamp5accuzkglo',
        },
        true
      ).should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/
      );
    });

    it('requires data-apikey', () => {
      return getSlike(
        {
          'data-videoid': '1xp5a1wkul',
        },
        true
      ).should.eventually.be.rejectedWith(
        /The data-apikey attribute is required for/
      );
    });
  }
);
