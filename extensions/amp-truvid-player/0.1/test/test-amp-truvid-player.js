import '../amp-truvid-player';

describes.realWin(
  'amp-truvid-player',
  {
    amp: {
      extensions: ['amp-truvid-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getTruvidPlayer(attributes, opt_responsive) {
      const bc = doc.createElement('amp-truvid-player');

      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '640');
      bc.setAttribute('height', '360');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }

      doc.body.appendChild(bc);
      return bc
        .buildInternal()
        .then(() => {
          bc.layoutCallback();
        })
        .then(() => bc);
    }

    it('requires data-org-id', () => {
      return allowConsoleError(() => {
        return getTruvidPlayer({
          'layout': 'responsive',
          'data-playlist-id': '229',
          'data-widget-id': '442',
        }).should.eventually.be.rejectedWith(
          /the data-org-id attribute is required for <amp-truvidplayer> amp-truvid-player/
        );
      });
    });

    it('requires data-widget-id', () => {
      return allowConsoleError(() => {
        return getTruvidPlayer({
          'layout': 'responsive',
          'data-org-id': '73',
          'data-playlist-id': '229',
        }).should.eventually.be.rejectedWith(
          /the data-widget-id attribute is required for <amp-truvidplayer> amp-truvid-player/
        );
      });
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getTruvidPlayer({
          'data-org-id': '73',
          'layout': 'responsive',
          'data-playlist-id': '229',
          'data-widget-id': '442',
        }).then((truvid) => {
          const img = truvid.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://cnt.trvdp.com/truvid_default/640X480.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('alt')).to.equal('Loading video');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        });
      });
      it('should propagate aria label for placeholder image', () => {
        return getTruvidPlayer({
          'data-org-id': '73',
          'data-playlist-id': '229',
          'data-widget-id': '442',
          'aria-label': 'truvid video',
          'layout': 'responsive',
        }).then((truvid) => {
          const img = truvid.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('alt')).to.equal(
            'Loading video - truvid video'
          );
        });
      });
    });
  }
);
