/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AsyncVerifier,
  DefaultVerifier,
  getFormVerifier,
} from '../form-verifiers';

describes.fakeWin('amp-form async verification', {}, env => {
  function stubValidationMessage(input) {
    Object.defineProperty(input, 'validationMessage', {
      get() {
        return this.fakeValidationMessage_;
      },
      set(value) {
        this.fakeValidationMessage_ = value;
      },
    });

    const originalSetCustomValidity = input.setCustomValidity.bind(input);
    Object.defineProperty(input, 'setCustomValidity', {
      value(message) {
        this.validationMessage = message;
        originalSetCustomValidity(message);
      },
    });
  }

  function getForm(doc, opt_verifyXhr = true) {
    const form = doc.createElement('form');
    form.setAttribute('method', 'POST');

    if (opt_verifyXhr === true) {
      form.setAttribute('verify-xhr', '');
    }

    const nameInput = doc.createElement('input');
    stubValidationMessage(nameInput);
    nameInput.id = 'name1';
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('required', '');
    form.appendChild(nameInput);

    const emailInput = doc.createElement('input');
    stubValidationMessage(emailInput);
    emailInput.id = 'emailId';
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('required', '');
    form.appendChild(emailInput);

    const cityInput = doc.createElement('input');
    stubValidationMessage(cityInput);
    cityInput.id = 'cityId';
    cityInput.setAttribute('name', 'city');
    cityInput.setAttribute('type', 'text');
    cityInput.setAttribute('required', '');
    form.appendChild(cityInput);

    const zipInput = doc.createElement('input');
    stubValidationMessage(zipInput);
    zipInput.id = 'zipId';
    zipInput.setAttribute('name', 'zip');
    zipInput.setAttribute('type', 'tel');
    zipInput.setAttribute('pattern', '[0-9]{5}');
    zipInput.setAttribute('required', '');
    form.appendChild(zipInput);

    const addressInput = doc.createElement('input');
    stubValidationMessage(addressInput);
    addressInput.id = 'addressLine2Id';
    addressInput.setAttribute('name', 'addressLine2');
    addressInput.setAttribute('type', 'text');
    form.appendChild(addressInput); // This one is not required

    const submitBtn = doc.createElement('input');
    submitBtn.setAttribute('type', 'submit');
    form.appendChild(submitBtn);
    doc.body.appendChild(form);

    return form;
  }

  describe('getFormVerifier', () => {
    it('returns a DefaultVerifier without the verify-xhr attribute', () => {
      const form = getForm(env.win.document, false);
      const verifier = getFormVerifier(form, () => {});
      expect(verifier instanceof DefaultVerifier).to.be.true;
    });

    it('returns an AsyncVerifier with the verify-xhr attribute', () => {
      const form = getForm(env.win.document);
      const verifier = getFormVerifier(form, () => {});
      expect(verifier instanceof AsyncVerifier).to.be.true;
    });
  });

  describe('AsyncVerifier', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = env.sandbox;
    });

    it('should not submit when no element has a value', () => {
      const xhrSpy = sandbox.spy(() => Promise.resolve());
      const form = getForm(env.win.document);
      const verifier = getFormVerifier(form, xhrSpy);
      return verifier.onCommit().then(() => {
        expect(xhrSpy).to.not.be.called;
      });
    });

    it(
      'should submit when an element is filled out, mutated, ' +
        'and committed',
      () => {
        const xhrSpy = sandbox.spy(() => Promise.resolve());
        const form = getForm(env.win.document);
        const verifier = getFormVerifier(form, xhrSpy);

        form.email.value = 'test@example.com';

        return verifier.onCommit().then(() => {
          expect(xhrSpy).to.be.calledOnce;
        });
      }
    );

    it(
      'should assign an error to elements that the server ' + 'fails to verify',
      () => {
        const errorMessage = 'Zip code and city do not match';
        const errorResponse = {
          json() {
            return Promise.resolve({
              verifyErrors: [
                {
                  name: 'zip',
                  message: errorMessage,
                },
              ],
            });
          },
        };
        const xhrSpy = sandbox.spy(() =>
          Promise.reject({
            response: errorResponse,
          })
        );
        const form = getForm(env.win.document);
        const verifier = getFormVerifier(form, xhrSpy);

        form.city.value = 'Mountain View';
        form.zip.value = '94043';
        return verifier.onCommit().then(() => {
          expect(form.zip.validity.customError).to.be.true;
          expect(form.zip.validationMessage).to.equal(errorMessage);
        });
      }
    );

    it(
      'should clear errors when any sibling of an input with an error ' +
        'is mutated',
      () => {
        const errorMessage = 'Zip code and city do not match';
        const errorResponse = {
          json() {
            return Promise.resolve({
              verifyErrors: [
                {
                  name: 'zip',
                  message: errorMessage,
                },
              ],
            });
          },
        };
        const xhrStub = sandbox.stub();
        xhrStub.onCall(0).returns(Promise.reject({response: errorResponse}));
        xhrStub.onCall(1).returns(Promise.resolve());

        const form = getForm(env.win.document);
        const verifier = getFormVerifier(form, xhrStub);
        form.city.value = 'Palo Alto';
        form.zip.value = '94043';

        return verifier
          .onCommit()
          .then(() => {
            expect(form.zip.validity.customError).to.be.true;
            expect(form.zip.validationMessage).to.equal(errorMessage);
            form.city.value = 'Mountain View';
            return verifier.onCommit();
          })
          .then(() => {
            expect(form.zip.validity.customError).to.be.false;
            expect(form.zip.validationMessage).to.be.empty;
          });
      }
    );

    it(
      'should not assign verification errors to elements ' +
        'that are not valid',
      () => {
        const zipMessage = 'Zip code and city do not match.';
        const emailMessage = 'This email is already taken.';
        const errorResponse = {
          json() {
            return Promise.resolve({
              verifyErrors: [
                {
                  name: 'zip',
                  message: zipMessage,
                },
                {
                  name: 'email',
                  message: emailMessage,
                },
              ],
            });
          },
        };
        const xhrSpy = sandbox.spy(() =>
          Promise.reject({
            response: errorResponse,
          })
        );
        const form = getForm(env.win.document);
        const verifier = getFormVerifier(form, xhrSpy);

        form.city.value = 'Mountain View';
        form.zip.value = '94043';
        return verifier.onCommit().then(() => {
          expect(form.zip.validity.customError).to.be.true;
          expect(form.zip.validationMessage).to.equal(zipMessage);
          expect(form.email.validity.customError).to.be.false;
          expect(form.email.validationMessage).to.not.equal(emailMessage);
        });
      }
    );
  });
});
