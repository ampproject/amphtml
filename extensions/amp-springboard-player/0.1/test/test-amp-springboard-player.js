import '../amp-springboard-player';

describes.realWin(
  'amp-springboard-player',
  {
    amp: {
      extensions: ['amp-springboard-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getSpringboardPlayer(attributes) {
      const sp = doc.createElement('amp-springboard-player');
      for (const key in attributes) {
        sp.setAttribute(key, attributes[key]);
      }
      sp.setAttribute('width', '480');
      sp.setAttribute('height', '270');
      sp.setAttribute('layout', 'responsive');
      doc.body.appendChild(sp);
      return sp
        .buildInternal()
        .then(() => {
          sp.layoutCallback();
        })
        .then(() => sp);
    }

    it('renders', () => {
      return getSpringboardPlayer({
        'data-site-id': '261',
        'data-mode': 'video',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://cms.springboardplatform.com/' +
            'embed_iframe/261/video/1578473/test401/test.com/10'
        );
      });
    });

    it('renders responsively', () => {
      return getSpringboardPlayer({
        'data-site-id': '261',
        'data-mode': 'video',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-site-id', () => {
      return getSpringboardPlayer({
        'data-mode': 'video',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).should.eventually.be.rejectedWith(
        /The data-site-id attribute is required for/
      );
    });

    it('requires data-mode', () => {
      return getSpringboardPlayer({
        'data-site-id': '261',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).should.eventually.be.rejectedWith(
        /The data-mode attribute is required for/
      );
    });

    it('requires data-content-id', () => {
      return getSpringboardPlayer({
        'data-mode': 'video',
        'data-site-id': '261',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).should.eventually.be.rejectedWith(
        /The data-content-id attribute is required for/
      );
    });

    it('requires data-player-id', () => {
      return getSpringboardPlayer({
        'data-mode': 'video',
        'data-site-id': '261',
        'data-content-id': '1578473',
        'data-domain': 'test.com',
        'data-items': '10',
      }).should.eventually.be.rejectedWith(
        /The data-player-id attribute is required for/
      );
    });

    it('requires data-domain', () => {
      return getSpringboardPlayer({
        'data-mode': 'video',
        'data-site-id': '261',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-items': '10',
      }).should.eventually.be.rejectedWith(
        /The data-domain attribute is required for/
      );
    });

    it('unlayout and relayout', async () => {
      const bc = await getSpringboardPlayer({
        'data-site-id': '261',
        'data-mode': 'video',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      });
      expect(bc.querySelector('iframe')).to.exist;

      const unlayoutResult = bc.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(bc.querySelector('iframe')).to.not.exist;

      await bc.layoutCallback();
      expect(bc.querySelector('iframe')).to.exist;
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getSpringboardPlayer({
          'data-site-id': '261',
          'data-mode': 'video',
          'data-content-id': '1578473',
          'data-player-id': 'test401',
          'data-domain': 'test.com',
          'data-items': '10',
        }).then((kp) => {
          const img = kp.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://www.springboardplatform.com/storage/test.com' +
              '/snapshots/1578473.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
          expect(img.getAttribute('alt')).to.equal('Loading video');
        });
      });
      it('should propagate aria-label for placeholder image', () => {
        return getSpringboardPlayer({
          'data-site-id': '261',
          'data-mode': 'video',
          'data-content-id': '1578473',
          'data-player-id': 'test401',
          'data-domain': 'test.com',
          'data-items': '10',
          'aria-label': 'sporty video',
        }).then((kp) => {
          const img = kp.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://www.springboardplatform.com/storage/test.com' +
              '/snapshots/1578473.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
          expect(img.getAttribute('aria-label')).to.equal('sporty video');
          expect(img.getAttribute('alt')).to.equal(
            'Loading video - sporty video'
          );
        });
      });

      it('should use default snapshot for playlist image', () => {
        return getSpringboardPlayer({
          'data-site-id': '261',
          'data-mode': 'playlist',
          'data-content-id': '1578473',
          'data-player-id': 'test401',
          'data-domain': 'test.com',
          'data-items': '10',
        }).then((kp) => {
          const img = kp.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://www.springboardplatform.com/storage/default/' +
              'snapshots/default_snapshot.png'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        });
      });
    });
  }
);
