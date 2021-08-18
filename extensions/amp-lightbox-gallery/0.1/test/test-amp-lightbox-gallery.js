

import {installLightboxGallery} from '../amp-lightbox-gallery';

const TAG = 'amp-lightbox-gallery';

describes.realWin(
  'amp-lightbox-gallery',
  {
    amp: {
      amp: true,
      ampdoc: 'single',
      extensions: [TAG],
    },
  },
  (env) => {
    let win, doc, gallery;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      return installLightboxGallery(env.ampdoc).then(() => {
        gallery = doc.getElementById(TAG);
      });
    });

    describe('basic functionality', function () {
      this.timeout(5000);
      it('should contain a container on build', (done) => {
        gallery.buildInternal().then(() => {
          const container = doc.getElementsByClassName('i-amphtml-lbg');
          expect(container.length).to.equal(1);
          expect(container[0].tagName).to.equal('DIV');
          done();
        });
      });
    });
  }
);
