import '../amp-beopinion';
import {beopinion} from '#3p/beopinion';

describes.realWin(
  'amp-beopinion',
  {
    amp: {
      extensions: ['amp-beopinion'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  (env) => {
    const accountId = '589446dd42ee0d6fdd9c3dfd';
    const contentId = '5a703a2f46e0fb00016d51b3';
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getAmpBeOpinion(accountId) {
      const ampBeOpinion = doc.createElement('amp-beopinion');
      ampBeOpinion.setAttribute('data-account', accountId);
      ampBeOpinion.setAttribute('data-content', contentId);
      ampBeOpinion.setAttribute('width', '111');
      ampBeOpinion.setAttribute('height', '222');
      doc.body.appendChild(ampBeOpinion);
      return ampBeOpinion
        .buildInternal()
        .then(() => ampBeOpinion.layoutCallback())
        .then(() => ampBeOpinion);
    }

    it('renders iframe in amp-beopinion', () => {
      return getAmpBeOpinion(accountId).then((ampBeOpinion) => {
        const iframe = ampBeOpinion.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('width')).to.equal('111');
        expect(iframe.getAttribute('height')).to.equal('222');
      });
    });

    it('adds container element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);
      win.context = {
        canonicalUrl: 'https://foo.bar/baz',
        tagName: 'AMP-BEOPINION',
      };

      beopinion(win, {
        account: accountId,
        content: contentId,
        width: 111,
        height: 222,
      });
      const content = doc.body.querySelector('.BeOpinionWidget');
      expect(content).not.to.be.undefined;
    });

    it('removes iframe after unlayoutCallback', async () => {
      const ampBeOpinion = await getAmpBeOpinion(accountId);
      const obj = await ampBeOpinion.getImpl();

      const iframe = ampBeOpinion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      obj.unlayoutCallback();
      expect(ampBeOpinion.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });
  }
);
