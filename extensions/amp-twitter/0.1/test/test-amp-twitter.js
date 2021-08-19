import '../amp-twitter';
import {cleanupTweetId_, twitter} from '#3p/twitter';

describes.realWin(
  'amp-twitter',
  {
    amp: {
      extensions: ['amp-twitter'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  (env) => {
    const tweetId = '585110598171631616';
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAmpTwitter(tweetid) {
      const ampTwitter = doc.createElement('amp-twitter');
      ampTwitter.setAttribute('data-tweetid', tweetid);
      ampTwitter.setAttribute('width', '111');
      ampTwitter.setAttribute('height', '222');
      doc.body.appendChild(ampTwitter);
      await ampTwitter.buildInternal();
      await ampTwitter.layoutCallback();
      return ampTwitter;
    }

    it('renders iframe in amp-twitter', async () => {
      const ampTwitter = await getAmpTwitter(tweetId);
      const iframe = ampTwitter.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
      expect(iframe.getAttribute('allowfullscreen')).to.equal('true');
    });

    it('adds tweet element correctly for a tweet', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      twitter(win, {
        tweetid: tweetId,
        width: 111,
        height: 222,
      });
      const tweet = doc.body.querySelector('#tweet');
      expect(tweet).not.to.be.undefined;
    });

    it('adds tweet element correctly for a moment', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      twitter(win, {
        momentid: tweetId,
        limit: 5,
        width: 111,
        height: 222,
      });
      const tweet = doc.body.querySelector('#tweet');
      expect(tweet).not.to.be.undefined;
    });

    it('adds tweet element correctly for a profile timeline', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      twitter(win, {
        timelineSourceType: 'profile',
        timelineScreenName: 'amphtml',
        width: 111,
        height: 222,
      });
      const tweet = doc.body.querySelector('#tweet');
      expect(tweet).not.to.be.undefined;
    });

    it('adds tweet element correctly for a likes timeline', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      twitter(win, {
        timelineSourceType: 'likes',
        timelineScreenName: 'amphtml',
        width: 111,
        height: 222,
      });
      const tweet = doc.body.querySelector('#tweet');
      expect(tweet).not.to.be.undefined;
    });

    it('removes iframe after unlayoutCallback', async () => {
      const ampTwitter = await getAmpTwitter(tweetId);
      const obj = await ampTwitter.getImpl(false);
      const iframe = ampTwitter.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(ampTwitter.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });

    it('should replace iframe after tweetid mutation', async () => {
      const newTweetId = '638793490521001985';
      const ampTwitter = await getAmpTwitter(tweetId);
      const impl = await ampTwitter.getImpl(false);
      const spy = env.sandbox.spy(impl, 'toggleLoading');
      const iframe = ampTwitter.querySelector('iframe');
      ampTwitter.setAttribute('data-tweetid', newTweetId);
      ampTwitter.mutatedAttributesCallback({'data-tweetid': newTweetId});
      expect(spy).to.be.calledWith(true);
      expect(ampTwitter.querySelector('iframe')).to.not.equal(iframe);
    });

    describe('cleanupTweetId_', () => {
      it('does not affect valid tweet ids', () => {
        const good = '585110598171631616';

        expect(cleanupTweetId_(good)).to.equal(tweetId);
      });

      it('does not affect valid tweet ids', () => {
        const good = '20';

        expect(cleanupTweetId_(good)).to.equal('20');
      });

      it('does not pick up random numbers', () => {
        const bad1 = '<div>123</div>';
        const bad2 = '123123junk123123';
        const bad3 = 'https://twitter.com/1cram2force/status?ref=';
        const bad4 = '<div>nonumber</div>';
        const bad5 = 'aa585110598171631616?ref=twsrc%5etfw';
        const bad6 = '';
        const bad7 = '  ';

        expect(cleanupTweetId_(bad1)).to.equal(bad1);
        expect(cleanupTweetId_(bad2)).to.equal(bad2);
        expect(cleanupTweetId_(bad3)).to.equal(bad3);
        expect(cleanupTweetId_(bad4)).to.equal(bad4);
        expect(cleanupTweetId_(bad5)).to.equal(bad5);
        expect(cleanupTweetId_(bad6)).to.equal(bad6);
        expect(cleanupTweetId_(bad7)).to.equal(bad7);
      });

      it('cleans up bad tweet id with ref query string at end', () => {
        const bad1 = '585110598171631616?ref=twsrc%5Etfw';
        const bad2 = '585110598171631616?ref_src=twsrc%5Etfw';
        expect(cleanupTweetId_(bad1)).to.equal(tweetId);
        expect(cleanupTweetId_(bad2)).to.equal(tweetId);
      });

      it('cleans up bad tweet full Url', () => {
        const bad =
          'https://twitter.com/cramforce/status/585110598171631616' +
          '?ref=twsrc%5Etfw&ref_url=https%3A%2F%2Fd-371701311371384053.amp' +
          'project.net%2F1507685388117%2Fframe.html';

        expect(cleanupTweetId_(bad)).to.equal(tweetId);
      });

      it('cleans up bad tweet Url with number in handle', () => {
        const bad =
          'https://twitter.com/cr123amforce/status/585110598171631616';

        expect(cleanupTweetId_(bad)).to.equal(tweetId);
      });

      it('cleans up bad tweet Url with numer query string and Case', () => {
        const bad =
          'htTps://tWitter.com/cE123amforce/stAtus/585110598171631616' +
          '?ref=twsrc%5Etfw';

        expect(cleanupTweetId_(bad)).to.equal(tweetId);
      });
    });
  }
);
