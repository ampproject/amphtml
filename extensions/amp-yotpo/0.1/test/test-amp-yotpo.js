import '../amp-yotpo';
import {yotpo} from '#3p/yotpo';

describes.realWin(
  'amp-yotpo',
  {
    amp: {
      extensions: ['amp-yotpo'],
    },
  },
  (env) => {
    let win, doc;

    const widgets = [
      {name: 'MainWidget', selector: '.yotpo.yotpo-main-widget'},
      {name: 'BottomLine', selector: '.yotpo.bottomLine'},
      {name: 'PicturesGallery', selector: '.yotpo.yotpo-pictures-gallery'},
      {name: 'ReviewsCarousel', selector: '.yotpo.yotpo-reviews-carousel'},
      {name: 'ReviewsTab', selector: '.yotpo.yotpo-modal'},
      {name: 'badge', selector: '.yotpo.badge,.yotpo.yotpo-badge'},
      {name: 'questions-bottomline', selector: '.yotpo.QABottomLine'},
      {name: 'slider', selector: '.yotpo.yotpo-slider'},
      {name: 'visual-carousel', selector: '.yotpo.yotpo-visual-carousel'},
      {name: 'pictures-widget', selector: '.yotpo.yotpo-pictures-widget'},
      {name: 'shoppable-gallery', selector: '.yotpo.yotpo-shoppable-gallery'},
    ];

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getYotpo(opts) {
      const ampYotpo = doc.createElement('amp-yotpo');
      ampYotpo.setAttribute('data-app-key', opts.appKey);
      ampYotpo.setAttribute('width', opts.width);
      ampYotpo.setAttribute('height', opts.height);
      ampYotpo.setAttribute('data-widget-type', opts.widgetType);
      doc.body.appendChild(ampYotpo);
      return ampYotpo
        .buildInternal()
        .then(() => ampYotpo.layoutCallback())
        .then(() => ampYotpo);
    }

    it('renders iframe in amp-yotpo', () => {
      const opts = {
        appKey: 1234,
        width: 100,
        height: 200,
        widgetType: 'BottomLine',
      };
      return getYotpo(opts).then((ampYotpo) => {
        const iframe = ampYotpo.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('width')).to.equal('100');
        expect(iframe.getAttribute('height')).to.equal('200');
      });
    });

    it('builds yotpo widgets element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      for (let i = 0; i < widgets.length; i++) {
        yotpo(win, {
          appKey: 1234,
          widgetType: widgets[i].name,
        });
        const ampYotpo = doc.body.getElementsByClassName(widgets[i].selector);
        expect(ampYotpo).not.to.be.undefined;
      }
    });
  }
);
