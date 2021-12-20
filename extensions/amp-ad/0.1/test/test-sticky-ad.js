import {BaseElement} from '../../../../src/base-element';
import {StickyAd} from '../sticky-ad';

describes.realWin(
  'Sticky ads handler',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let adImpl;
    let adElement;

    beforeEach(() => {
      adElement = env.win.document.createElement('amp-ad');
      adElement.ampdoc_ = env.win.document;
      adImpl = new BaseElement(adElement);
    });

    describe('sticky ads', () => {
      it('should reject invalid sticky type', () => {
        expectAsyncConsoleError(/Invalid sticky ad type: invalid/, 1);
        adElement.setAttribute('sticky', 'invalid');
        const handler = new StickyAd(adImpl);
        expect(handler.stickyAdPosition_).to.be.null;
      });

      it('should refuse to load the second sticky ads', () => {
        for (let i = 0; i < 2; i++) {
          const adElement = env.win.document.createElement('amp-ad');
          adElement.setAttribute('sticky', 'top');
          adElement.setAttribute('class', 'i-amphtml-built');
          env.win.document.body.insertBefore(adElement, null);
        }
        const handler = new StickyAd(adImpl);
        allowConsoleError(() => {
          expect(() => {
            handler.validate();
          }).to.throw();
        });
      });
    });
  }
);
