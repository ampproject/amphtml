import {Services} from '../../../../../src/services';
import {listenOncePromise} from '../../../../../src/event-helper';
import {poll} from '../../../../../testing/iframe';

describes.integration('amp-inputmask', {
  body: `
  <form method="post" action-xhr="http://localhost:31862/form/post" target="_blank">
    <input name="alphabetic" mask="L">
    <input name="numeric" mask="0">
    <input name="mask-output-test" mask="(A)" mask-output="alphanumeric">
  </form>
`,
  extensions: ['amp-form', 'amp-inputmask'],
  experiments: ['amp-inputmask'],
}, env => {
  let win, doc, ampInputmask;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    return Services.inputmaskServiceForDoc(win.document).then(service => {
      ampInputmask = service;
      ampInputmask.install();
    });
  });

  afterEach(() => {
    ampInputmask.uninstall();
  });

  describe('mask attribute', () => {
    it('should allow input matching the mask', () => {
      const input = doc.querySelector('[name="alphabetic"]');

      return simulateKeyboardInteraction(input, 'A').then(() => {
        expect(input.value).to.equal('A');
      });
    });

    it('should prevent input not matching the mask', () => {
      const input = doc.querySelector('[name="numeric"]');

      return simulateKeyboardInteraction(input, 'A').then(() => {
        expect(input.value).to.equal('');
      });
    });
  });

  describe('form behavior', () => {
    it('should add hidden input to form before submit', () => {
      const input = doc.querySelector('[name="mask-output-test"]');
      const form = doc.querySelector('form');
      input.value = '(A)';

      const waitForInput =
          poll('hidden input to be added', () => {
            return doc.querySelector('input[type=hidden]');
          }, undefined, 2000, win);

      form.dispatchEvent(new Event('submit'));
      return waitForInput.then(hidden => {
        expect(form.hasAttribute('submit-success')).to.be.false;
        expect(hidden.name).to.equal('mask-output-test-unmasked');
        expect(hidden.value).to.equal('A');
      });
    });
  });
});


function simulateKeyboardInteraction(input, key) {
  const promise = listenOncePromise(input, 'keypress');
  const keyCode = key.charCodeAt(0);
  const keydown = new KeyboardEvent('keydown', {key, keyCode});
  const keypress = new KeyboardEvent('keypress', {key, keyCode});
  input.dispatchEvent(keydown);
  input.dispatchEvent(keypress);
  return promise;
}
