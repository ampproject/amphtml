/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';
import {
  setReportValiditySupportedForTesting,
  getFormValidator,
  DefaultValidator,
  PolyfillDefaultValidator,
  AsYouGoValidator,
  ShowAllOnSubmitValidator,
  ShowFirstOnSubmitValidator,
} from '../form-validators';
import {ValidationBubble} from '../validation-bubble';


describe('form-validators', () => {

  let sandbox;
  const emailTypeValidationMsg = 'Yo! That email does not look so.. email-y';

  // Stub validation message for predictable message on any platform.
  function stubValidationMessage(input) {
    Object.defineProperty(input, 'validationMessage', {
      get: function() {
        return this.fakeValidationMessage_;
      },
      set: function(value) {
        this.fakeValidationMessage_ = value;
      },
    });
  }

  function getTestingIframe() {
    return createIframePromise().then(iframe => {
      return iframe;
    });
  }

  function getForm(doc = document, isCustomValidations = false) {
    const form = doc.createElement('form');
    form.setAttribute('method', 'POST');

    const nameInput = doc.createElement('input');
    stubValidationMessage(nameInput);
    nameInput.id = 'name1';
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('required', '');
    form.appendChild(nameInput);

    const emailInput = doc.createElement('input');
    stubValidationMessage(emailInput);
    emailInput.id = 'email1';
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('required', '');
    form.appendChild(emailInput);

    const submitBtn = doc.createElement('input');
    submitBtn.setAttribute('type', 'submit');
    form.appendChild(submitBtn);
    doc.body.appendChild(form);

    if (isCustomValidations) {
      const requiredNameMsg = doc.createElement('div');
      requiredNameMsg.setAttribute('visible-when-invalid', 'valueMissing');
      requiredNameMsg.setAttribute('validation-for', 'name1');
      doc.body.appendChild(requiredNameMsg);

      const requiredEmailMsg = doc.createElement('div');
      requiredEmailMsg.setAttribute('visible-when-invalid', 'valueMissing');
      requiredEmailMsg.setAttribute('validation-for', 'email1');
      doc.body.appendChild(requiredEmailMsg);

      const emailInvalidMsg = doc.createElement('div');
      emailInvalidMsg.setAttribute('visible-when-invalid', 'typeMismatch');
      emailInvalidMsg.setAttribute('validation-for', 'email1');
      emailInvalidMsg.textContent = emailTypeValidationMsg;
      doc.body.appendChild(emailInvalidMsg);
    }

    return form;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getFormValidator', () => {
    it('should return default or polyfill instance', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        setReportValiditySupportedForTesting(true);
        expect(getFormValidator(form)).to.be.instanceOf(DefaultValidator);
        setReportValiditySupportedForTesting(false);
        expect(getFormValidator(form)).to.be.instanceOf(
            PolyfillDefaultValidator);
      });
    });

    it('should return custom validator instances', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        form.setAttribute('custom-validation-reporting', 'as-you-go');
        expect(getFormValidator(form)).to.be.instanceOf(AsYouGoValidator);
        form.setAttribute(
            'custom-validation-reporting', 'show-all-on-submit');
        expect(getFormValidator(form)).to.be.instanceOf(
            ShowAllOnSubmitValidator);
        form.setAttribute(
            'custom-validation-reporting', 'show-first-on-submit');
        expect(getFormValidator(form)).to.be.instanceOf(
            ShowFirstOnSubmitValidator);
      });
    });
  });

  describe('DefaultValidator', () => {
    it('should reports form validity', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        const validator = new DefaultValidator(form);
        sandbox.stub(form, 'reportValidity');
        validator.report();
        expect(form.reportValidity).to.have.been.called;
      });
    });
  });

  describe('PolyfillDefaultValidator', () => {
    it('should reports form validity', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        const validator = new PolyfillDefaultValidator(form);
        expect(validator.validationBubble_).to.be.instanceOf(ValidationBubble);
        sandbox.stub(validator.validationBubble_, 'show');
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validator.validationBubble_.show).to.be.calledOnce;
        expect(validator.validationBubble_.show).to.be.calledWith(
            form.elements[0], form.elements[0].validationMessage);
      });
    });

    it('should hide validation bubble onblur', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        const validator = new PolyfillDefaultValidator(form);
        sandbox.stub(validator.validationBubble_, 'hide');
        validator.onBlur();
        expect(validator.validationBubble_.hide).to.be.calledOnce;
      });
    });

    it('should re-validate on input if is is actively reported', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc);
        const validator = new PolyfillDefaultValidator(form);
        sandbox.stub(validator.validationBubble_, 'show');
        sandbox.stub(validator.validationBubble_, 'hide');
        validator.onInput({target: form.elements[0]});
        expect(validator.validationBubble_.hide).to.not.be.called;
        expect(validator.validationBubble_.show).to.not.be.called;
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validator.validationBubble_.show).to.be.calledOnce;
        expect(validator.validationBubble_.hide).to.not.be.called;
        expect(validator.validationBubble_.show).to.be.calledWith(
            form.elements[0], form.elements[0].validationMessage);

        sandbox.stub(validator.validationBubble_, 'isActiveOn').returns(true);
        validator.onInput({target: form.elements[0]});
        expect(form.elements[0].getAttribute('aria-invalid')).to.equal('true');
        expect(validator.validationBubble_.show).to.be.calledTwice;
        form.elements[0].value = 'Hello';
        validator.onInput({target: form.elements[0]});
        expect(form.elements[0].hasAttribute('aria-invalid')).to.be.false;
        expect(validator.validationBubble_.hide).to.be.calledOnce;
      });
    });
  });

  describe('ShowFirstOnSubmitValidator', () => {
    it('should show first validation message', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowFirstOnSubmitValidator(form);
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validations[0].className).to.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });

    it('should not report on interaction for non-active inputs', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowFirstOnSubmitValidator(form);
        validator.onBlur({target: form.elements[0]});
        expect(doc.activeElement).to.not.equal(form.elements[0]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        validator.onInput({target: form.elements[0]});
        expect(doc.activeElement).to.not.equal(form.elements[0]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });

    it('should not report on interaction for non-active inputs', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowFirstOnSubmitValidator(form);
        form.elements[0].validationMessage = 'Name is required';
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validations[0].className).to.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        expect(validations[0].textContent).to.equal('Name is required');

        form.elements[0].value = 'John Miller';
        validator.onBlur({target: form.elements[0]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');

        form.elements[1].validationMessage = 'Email is required';
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[1]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        expect(validations[1].textContent).to.equal('Email is required');

        form.elements[1].value = 'invalidemail';
        form.elements[1].validationMessage = 'Email format is wrong';
        validator.onInput({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.contain('visible');
        expect(validations[2].textContent).to.not.equal(
            'Email format is wrong');
        expect(validations[2].textContent).to.equal(emailTypeValidationMsg);
      });
    });
  });

  describe('ShowAllOnSubmitValidator', () => {
    it('should show validation messages for all inputs', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowAllOnSubmitValidator(form);
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validations[0].className).to.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });

    it('should not report on interaction for non-active inputs', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowAllOnSubmitValidator(form);
        validator.onBlur({target: form.elements[0]});
        expect(doc.activeElement).to.not.equal(form.elements[0]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        validator.onInput({target: form.elements[0]});
        expect(doc.activeElement).to.not.equal(form.elements[0]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });

    it('should re-validate and report on interaction for active inputs', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new ShowAllOnSubmitValidator(form);
        form.elements[0].validationMessage = 'Name is required';
        form.elements[1].validationMessage = 'Email is required';
        validator.report();
        expect(doc.activeElement).to.equal(form.elements[0]);
        expect(validations[0].className).to.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        expect(validations[0].textContent).to.equal('Name is required');
        expect(validations[1].textContent).to.equal('Email is required');

        form.elements[0].value = 'John Miller';
        validator.onBlur({target: form.elements[0]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');

        validator.report();
        expect(doc.activeElement).to.equal(form.elements[1]);
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        expect(validations[1].textContent).to.equal('Email is required');

        form.elements[1].value = 'invalidemail';
        form.elements[1].validationMessage = 'Email format is wrong';
        validator.onInput({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.contain('visible');
        expect(validations[2].textContent).to.not.equal(
            'Email format is wrong');
        expect(validations[2].textContent).to.equal(emailTypeValidationMsg);

        form.elements[1].value = 'valid@email.com';
        validator.onBlur({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });
  });

  describe('AsYouGoValidator', () => {
    it('should report validation for input on interaction', () => {
      return getTestingIframe().then(iframe => {
        const doc = iframe.doc;
        const form = getForm(doc, true);
        const validations = doc.querySelectorAll('[visible-when-invalid]');
        const validator = new AsYouGoValidator(form);
        form.elements[0].validationMessage = 'Name is required';
        form.elements[1].validationMessage = 'Email is required';

        validator.onBlur({target: form.elements[0]});
        expect(validations[0].className).to.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');

        form.elements[0].value = 'John Miller';
        validator.onInput({target: form.elements[0]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');

        validator.onInput({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
        expect(validations[1].textContent).to.equal('Email is required');

        form.elements[1].value = 'invalidemail';
        form.elements[1].validationMessage = 'Email format is wrong';
        validator.onInput({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.contain('visible');
        expect(validations[2].textContent).to.not.equal(
            'Email format is wrong');
        expect(validations[2].textContent).to.equal(emailTypeValidationMsg);

        form.elements[1].value = 'valid@email.com';
        validator.onBlur({target: form.elements[1]});
        expect(validations[0].className).to.not.contain('visible');
        expect(validations[1].className).to.not.contain('visible');
        expect(validations[2].className).to.not.contain('visible');
      });
    });
  });

});
