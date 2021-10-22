import '../amp-recaptcha-input';
import {createElementWithAttributes} from '#core/dom';

describes.realWin(
  'amp-recaptcha-input',
  {
    amp: {
      /* amp spec */
      runtimeOn: false,
      extensions: ['amp-recaptcha-input'],
    },
  },
  (env) => {
    let win;
    let doc;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    const ampRecaptchaInputAttributes = {
      'layout': 'nodisplay',
      'name': 'recaptcha-test',
      'data-sitekey': 'fake-sitekey-fortesting',
      'data-action': 'unit-test',
    };

    function getRecaptchaInput(config = ampRecaptchaInputAttributes) {
      const ampRecaptchaInput = createElementWithAttributes(
        doc,
        'amp-recaptcha-input',
        config
      );

      doc.body.appendChild(ampRecaptchaInput);

      return ampRecaptchaInput
        .buildInternal()
        .then(() => {
          return ampRecaptchaInput.layoutCallback();
        })
        .then(() => {
          return ampRecaptchaInput;
        });
    }

    describe('amp-recaptcha-input', () => {
      it('Rejects because data-name is missing', () => {
        const ampRecaptchaInputConfig = {...ampRecaptchaInputAttributes};
        delete ampRecaptchaInputConfig['name'];

        return allowConsoleError(() => {
          return getRecaptchaInput(
            ampRecaptchaInputConfig
          ).should.eventually.be.rejectedWith(
            /The name attribute is required for/
          );
        });
      });

      it('Rejects because data-sitekey is missing', () => {
        const ampRecaptchaInputConfig = {...ampRecaptchaInputAttributes};
        delete ampRecaptchaInputConfig['data-sitekey'];

        return allowConsoleError(() => {
          return getRecaptchaInput(
            ampRecaptchaInputConfig
          ).should.eventually.be.rejectedWith(
            /The data-sitekey attribute is required for/
          );
        });
      });

      it('Rejects because data-action is missing', () => {
        const ampRecaptchaInputConfig = {...ampRecaptchaInputAttributes};
        delete ampRecaptchaInputConfig['data-action'];

        return allowConsoleError(() => {
          return getRecaptchaInput(
            ampRecaptchaInputConfig
          ).should.eventually.be.rejectedWith(
            /The data-action attribute is required for/
          );
        });
      });

      it('Should be visible after built', () => {
        return getRecaptchaInput().then((ampRecaptchaInput) => {
          expect(ampRecaptchaInput).to.not.have.display('none');
        });
      });

      it('Should apply styles after build', () => {
        return getRecaptchaInput().then((ampRecaptchaInput) => {
          expect(win.getComputedStyle(ampRecaptchaInput).position).to.equal(
            'absolute'
          );
          expect(win.getComputedStyle(ampRecaptchaInput).visibility).to.equal(
            'hidden'
          );
        });
      });

      it('Should register with the recaptcha service after layout', async () => {
        const ampRecaptchaInput = await getRecaptchaInput();
        const impl = await ampRecaptchaInput.getImpl(false);
        expect(impl.registerPromise_).to.be.ok;
        expect(impl.recaptchaService_.registeredElementCount_).to.equal(1);
      });

      it('Should unregister with the recaptcha service after unlayout', async () => {
        const ampRecaptchaInput = await getRecaptchaInput();
        const impl = await ampRecaptchaInput.getImpl(false);
        expect(impl.registerPromise_).to.be.ok;
        expect(impl.recaptchaService_.registeredElementCount_).to.equal(1);

        ampRecaptchaInput.unlayoutCallback();
        expect(impl.recaptchaService_.registeredElementCount_).to.equal(0);
      });

      it(
        'Should not register with the recaptcha service' +
          ' if already registered',
        async () => {
          const ampRecaptchaInput = await getRecaptchaInput();
          const impl = await ampRecaptchaInput.getImpl(false);
          expect(impl.registerPromise_).to.be.ok;
          expect(impl.recaptchaService_.registeredElementCount_).to.equal(1);
          impl.layoutCallback();
          expect(impl.recaptchaService_.registeredElementCount_).to.equal(1);
        }
      );

      it(
        'Should not unregister with the recaptcha service' +
          ' if not already registered',
        async () => {
          const ampRecaptchaInput = await getRecaptchaInput();
          const impl = await ampRecaptchaInput.getImpl(false);
          expect(impl.registerPromise_).to.be.ok;
          expect(impl.recaptchaService_.registeredElementCount_).to.equal(1);
          ampRecaptchaInput.unlayoutCallback();
          expect(impl.registerPromise_).to.not.be.ok;
          expect(impl.recaptchaService_.registeredElementCount_).to.equal(0);
          ampRecaptchaInput.unlayoutCallback();
          expect(impl.recaptchaService_.registeredElementCount_).to.equal(0);
        }
      );
    });
  }
);
