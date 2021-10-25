import '../amp-reddit';
import {reddit} from '#3p/reddit';

describes.realWin(
  'amp-reddit',
  {
    amp: {
      extensions: ['amp-reddit'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getReddit(src, type) {
      const ampReddit = doc.createElement('amp-reddit');
      ampReddit.setAttribute('height', 400);
      ampReddit.setAttribute('width', 400);
      ampReddit.setAttribute('data-src', src);
      ampReddit.setAttribute('data-embedtype', type);
      ampReddit.setAttribute('layout', 'responsive');

      doc.body.appendChild(ampReddit);
      await ampReddit.buildInternal();
      await ampReddit.layoutCallback();
      return ampReddit;
    }

    it('renders post iframe', async () => {
      const ampReddit = await getReddit(
        'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed',
        'post'
      );
      const iframe = ampReddit.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('400');
      expect(iframe.getAttribute('height')).to.equal('400');
    });

    it('adds post embed', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      reddit(win, {
        src: 'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed',
        embedtype: 'post',
        width: 400,
        height: 400,
      });

      const embedlyEmbed = doc.body.querySelector('.embedly-card');
      expect(embedlyEmbed).not.to.be.undefined;
    });

    it('renders comment iframe', async () => {
      const ampReddit = await getReddit(
        'https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw',
        'comment'
      );
      const iframe = ampReddit.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('400');
      expect(iframe.getAttribute('height')).to.equal('400');
    });

    it('adds comment embed', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      reddit(win, {
        src: 'https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw',
        embedtype: 'comment',
        width: 400,
        height: 400,
      });

      const redditEmbed = doc.body.querySelector('.reddit-embed');
      expect(redditEmbed).not.to.be.undefined;
    });

    it('requires data-src', () => {
      return getReddit('', 'post').should.eventually.be.rejectedWith(
        /The data-src attribute is required for/
      );
    });

    it('requires data-embedtype', () => {
      return getReddit(
        'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed',
        ''
      ).should.eventually.be.rejectedWith(
        /The data-embedtype attribute is required for/
      );
    });
  }
);
