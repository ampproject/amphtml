import '../amp-font';
import {FontLoader} from '../fontloader';

describes.repeated(
  '',
  {
    'single ampdoc': {ampdoc: 'single'},
    'shadow ampdoc': {ampdoc: 'shadow'},
  },
  (name, variant) => {
    describes.realWin(
      'amp-font',
      {
        amp: {
          ampdoc: variant.ampdoc,
          extensions: ['amp-font'],
        },
      },
      function (env) {
        let ampdoc, doc, root, body;

        beforeEach(() => {
          ampdoc = env.ampdoc;
          doc = env.win.document;
          root =
            variant.ampdoc === 'single'
              ? doc.documentElement
              : ampdoc.getBody();
          body = variant.ampdoc === 'single' ? doc.body : root;
        });

        function getAmpFont() {
          root.classList.add('comic-amp-font-loading');
          const font = doc.createElement('amp-font');
          font.setAttribute('layout', 'nodisplay');
          font.setAttribute('font-family', 'Comic AMP');
          font.setAttribute('timeout', '1000');
          font.setAttribute('while-loading-class', '');
          font.setAttribute('on-error-add-class', 'comic-amp-font-missing');
          font.setAttribute('on-load-add-class', 'comic-amp-font-loaded');
          font.setAttribute('on-error-remove-class', 'comic-amp-font-loading');
          font.setAttribute('on-load-remove-class', 'comic-amp-font-loading');
          body.appendChild(font);
          return font
            .buildInternal()
            .then(() => font.layoutCallback())
            .then(() => font);
        }

        it('should timeout while loading custom font', function () {
          env.sandbox
            .stub(FontLoader.prototype, 'load')
            .returns(Promise.reject('mock rejection'));
          return getAmpFont().then(() => {
            expect(root).to.have.class('comic-amp-font-missing');
            expect(root).to.not.have.class('comic-amp-font-loading');
          });
        });

        it('should load custom font', function () {
          env.sandbox
            .stub(FontLoader.prototype, 'load')
            .returns(Promise.resolve());
          return getAmpFont().then(() => {
            expect(root).to.have.class('comic-amp-font-loaded');
            expect(root).to.not.have.class('comic-amp-font-loading');
          });
        });
      }
    );
  }
);
