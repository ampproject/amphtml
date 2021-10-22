import '../amp-kaltura-player';

describes.realWin(
  'amp-kaltura-player',
  {
    amp: {
      extensions: ['amp-kaltura-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getKaltura(attributes, opt_responsive) {
      const kalturaPlayer = doc.createElement('amp-kaltura-player');
      for (const key in attributes) {
        kalturaPlayer.setAttribute(key, attributes[key]);
      }
      kalturaPlayer.setAttribute('width', '111');
      kalturaPlayer.setAttribute('height', '222');
      if (opt_responsive) {
        kalturaPlayer.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(kalturaPlayer);
      return kalturaPlayer
        .buildInternal()
        .then(() => {
          return kalturaPlayer.layoutCallback();
        })
        .then(() => kalturaPlayer);
    }

    it('renders', () => {
      return getKaltura({
        'data-partner': '1281471',
        'data-entryid': '1_3ts1ms9c',
        'data-uiconf': '33502051',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://cdnapisec.kaltura.com/p/1281471/sp/128147100/embedIframeJs/uiconf_id/33502051/partner_id/1281471?iframeembed=true&playerId=kaltura_player_amp&entry_id=1_3ts1ms9c'
        );
      });
    });

    it('renders with service-url', () => {
      return getKaltura({
        'data-service-url': 'front.video.funke.press',
        'data-partner': '106',
        'data-entryid': '0_b87xdluw',
        'data-uiconf': '23464665',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://front.video.funke.press/p/106/sp/10600/embedIframeJs/uiconf_id/23464665/partner_id/106?iframeembed=true&playerId=kaltura_player_amp&entry_id=0_b87xdluw'
        );
      });
    });

    it('renders responsively', () => {
      return getKaltura(
        {
          'data-partner': '1281471',
          'data-entryid': '1_3ts1ms9c',
          'data-uiconf': '33502051',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-account', () => {
      return allowConsoleError(() => {
        return getKaltura({})
          .then((kp) => {
            kp.buildInternal();
          })
          .should.eventually.be.rejectedWith(
            /The data-partner attribute is required for/
          );
      });
    });

    it('should pass data-param-* attributes to the iframe src', () => {
      return getKaltura({
        'data-partner': '1281471',
        'data-entryid': '1_3ts1ms9c',
        'data-uiconf': '33502051',
        'data-param-my-param': 'hello world',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe.src).to.contain('flashvars%5BmyParam%5D=hello%20world');
      });
    });

    it('unlayout and relayout', async () => {
      const kp = await getKaltura({
        'data-partner': '1281471',
        'data-entryid': '1_3ts1ms9c',
        'data-uiconf': '33502051',
        'data-param-my-param': 'hello world',
      });
      expect(kp.querySelector('iframe')).to.exist;

      const unlayoutResult = kp.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(kp.querySelector('iframe')).to.not.exist;

      await kp.layoutCallback();
      expect(kp.querySelector('iframe')).to.exist;
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getKaltura({
          'data-partner': '1281471',
          'data-entryid': '1_3ts1ms9c',
          'data-uiconf': '33502051',
        }).then((kp) => {
          const img = kp.querySelector('img');
          expect(img).to.not.be.null;
          expect(img).to.have.attribute('placeholder');
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img.getAttribute('loading')).to.equal('lazy');
          expect(img.getAttribute('src')).to.equal(
            'https://cdnapisec.kaltura.com/p/1281471/thumbnail/entry_id/' +
              '1_3ts1ms9c/width/111/height/222'
          );
          expect(img.hasAttribute('placeholder')).to.be.true;
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
          expect(img.getAttribute('alt')).to.equal('Loading video');
        });
      });
      it('should propagate aria label to placeholder image', () => {
        return getKaltura({
          'data-partner': '1281471',
          'data-entryid': '1_3ts1ms9c',
          'data-uiconf': '33502051',
          'aria-label': 'great video',
        }).then((kp) => {
          const img = kp.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('aria-label')).to.equal('great video');
          expect(img.getAttribute('alt')).to.equal(
            'Loading video - great video'
          );
        });
      });
    });
  }
);
