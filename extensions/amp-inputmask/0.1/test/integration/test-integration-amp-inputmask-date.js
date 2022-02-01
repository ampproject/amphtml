import {simulateKeyboardInteraction} from './utils';

const config = describes.sandboxed.configure().ifChrome();
config.skip('amp-inputmask', {}, () => {
  const {testServerPort} = window.ampTestRuntimeConfig;

  describes.integration(
    'attributes',
    {
      body: `
    <form method="post" action-xhr="http://localhost:${testServerPort}/form/post" target="_blank">
      <input name="birthday" mask="date-mm-dd-yyyy" value="02/29">
    </form>
  `,
      extensions: ['amp-form', 'amp-inputmask'],
    },
    (env) => {
      let win, doc;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
      });

      describe('date attribute', () => {
        it('should allow entering incomplete years', () => {
          const input = doc.querySelector('[name="birthday"]');

          return simulateKeyboardInteraction(win, input, '2').then(() => {
            expect(input.value).to.equal('02/29/2');
          });
        });

        it('should allow entering valid leap years', () => {
          const input = doc.querySelector('[name="birthday"]');

          return simulateKeyboardInteraction(win, input, '2')
            .then(() => simulateKeyboardInteraction(win, input, '0'))
            .then(() => simulateKeyboardInteraction(win, input, '1'))
            .then(() => simulateKeyboardInteraction(win, input, '2'))
            .then(() => {
              expect(input.value).to.equal('02/29/2012');
            });
        });

        it('should prevent entering non-leap years', () => {
          const input = doc.querySelector('[name="birthday"]');

          return simulateKeyboardInteraction(win, input, '2')
            .then(() => simulateKeyboardInteraction(win, input, '0'))
            .then(() => simulateKeyboardInteraction(win, input, '1'))
            .then(() => simulateKeyboardInteraction(win, input, '3'))
            .then(() => {
              expect(input.value).to.equal('02/29/201');
            });
        });
      });
    }
  );
});
