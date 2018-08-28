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

import {
  AsYouGoValidator,
  DefaultValidator,
  FormValidator,
  InteractAndSubmitValidator,
  PolyfillDefaultValidator,
  ShowAllOnSubmitValidator,
  ShowFirstOnSubmitValidator,
  getFormValidator,
  setReportValiditySupportedForTesting,
} from '../form-validators';
import {Services} from '../../../../src/services';
import {ValidationBubble} from '../validation-bubble';

describes.realWin('form-validators', {amp: true}, env => {
  let sandbox;
  const emailTypeValidationMsg = 'Yo! That email does not look so.. email-y';

  // Stub validation message for predictable message on any platform.
  function stubValidationMessage(input) {
    Object.defineProperty(input, 'validationMessage', {
      get() {
        return this.fakeValidationMessage_;
      },
      set(value) {
        this.fakeValidationMessage_ = value;
      },
    });
  }

  function getForm(doc, isCustomValidations = false) {
    const form = doc.createElement('form');
    form.setAttribute('method', 'POST');
    doc.body.appendChild(form);

    const {name, email, submit} = getInputs(doc);
    [name, email, submit].forEach(c => form.appendChild(c));

    if (isCustomValidations) {
      const {noName, noEmail, invalidEmail} = getCustomValidations(doc);
      [noName, noEmail, invalidEmail].forEach(c => doc.body.appendChild(c));
    }

    return form;
  }

  function getInputs(doc) {
    const name = doc.createElement('input');
    stubValidationMessage(name);
    name.id = 'name1';
    name.setAttribute('name', 'name');
    name.setAttribute('required', '');

    const email = doc.createElement('input');
    stubValidationMessage(email);
    email.id = 'email1';
    email.setAttribute('name', 'email');
    email.setAttribute('type', 'email');
    email.setAttribute('required', '');

    const submit = doc.createElement('input');
    submit.setAttribute('type', 'submit');

    return {name, email, submit};
  }

  function getCustomValidations(doc) {
    const noName = doc.createElement('div');
    noName.setAttribute('visible-when-invalid', 'valueMissing');
    noName.setAttribute('validation-for', 'name1');

    const noEmail = doc.createElement('div');
    noEmail.setAttribute('visible-when-invalid', 'valueMissing');
    noEmail.setAttribute('validation-for', 'email1');

    const invalidEmail = doc.createElement('div');
    invalidEmail.setAttribute('visible-when-invalid', 'typeMismatch');
    invalidEmail.setAttribute('validation-for', 'email1');
    invalidEmail.textContent = emailTypeValidationMsg;

    return {noName, noEmail, invalidEmail};
  }

  beforeEach(() => {
    sandbox = env.sandbox;

    // Force sync mutateElement to make testing easier.
    const resources = Services.resourcesForDoc(env.ampdoc);
    sandbox.stub(resources, 'mutateElement').callsArg(1);
  });

  describe('getFormValidator', () => {
    it('should return default or polyfill instance', () => {
      const doc = env.win.document;
      const form = getForm(doc);
      setReportValiditySupportedForTesting(true);
      expect(getFormValidator(form)).to.be.instanceOf(DefaultValidator);
      setReportValiditySupportedForTesting(false);
      expect(getFormValidator(form)).to.be.instanceOf(
          PolyfillDefaultValidator);
    });

    it('should return custom validator instances', () => {
      const doc = env.win.document;
      const form = getForm(doc);
      form.setAttribute('custom-validation-reporting', 'as-you-go');
      expect(getFormValidator(form)).to.be.instanceOf(AsYouGoValidator);
      form.setAttribute(
          'custom-validation-reporting', 'show-all-on-submit');
      expect(getFormValidator(form)).to.be.instanceOf(
          ShowAllOnSubmitValidator);
      form.setAttribute(
          'custom-validation-reporting', 'interact-and-submit');
      expect(getFormValidator(form)).to.be.instanceOf(
          InteractAndSubmitValidator);
      form.setAttribute(
          'custom-validation-reporting', 'show-first-on-submit');
      expect(getFormValidator(form)).to.be.instanceOf(
          ShowFirstOnSubmitValidator);
    });
  });

  describe('FormValidator', () => {
    let form, validator;

    beforeEach(() => {
      const doc = env.win.document;
      form = getForm(doc);
      validator = new FormValidator(form);
    });

    it('fireValidityEventIfNecessary()', () => {
      sandbox.stub(form, 'checkValidity').returns(false);
      sandbox.stub(form, 'dispatchEvent');

      validator.fireValidityEventIfNecessary();
      expect(form.dispatchEvent).calledOnce;
      expect(form.dispatchEvent).calledWithMatch({type: 'invalid'});

      // Should not fire if validity hasn't changed.
      validator.fireValidityEventIfNecessary();
      expect(form.dispatchEvent).calledOnce;

      form.checkValidity.returns(true);

      // Should fire now that validity has changed.
      validator.fireValidityEventIfNecessary();
      expect(form.dispatchEvent).calledTwice;
      expect(form.dispatchEvent).calledWithMatch({type: 'valid'});

      validator.fireValidityEventIfNecessary();
      expect(form.dispatchEvent).calledTwice;
    });
  });

  describe('DefaultValidator', () => {
    let form, validator;

    beforeEach(() => {
      const doc = env.win.document;
      form = getForm(doc);
      validator = new DefaultValidator(form);
    });

    it('should reports form validity', () => {
      sandbox.stub(form, 'reportValidity');
      validator.report();
      expect(form.reportValidity).to.have.been.called;
    });

    it('should fire events on report()', () => {
      sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });
  });

  describe('PolyfillDefaultValidator', () => {
    let doc, form, validator;

    beforeEach(() => {
      doc = env.win.document;
      form = getForm(doc);
      validator = new PolyfillDefaultValidator(form);
    });

    it('should reports form validity', () => {
      expect(validator.validationBubble_).to.be.instanceOf(ValidationBubble);
      sandbox.stub(validator.validationBubble_, 'show');
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validator.validationBubble_.show).to.be.calledOnce;
      expect(validator.validationBubble_.show).to.be.calledWith(
          form.elements[0], form.elements[0].validationMessage);
    });

    it('should hide validation bubble onblur', () => {
      sandbox.stub(validator.validationBubble_, 'hide');
      validator.onBlur();
      expect(validator.validationBubble_.hide).to.be.calledOnce;
    });

    it('should re-validate on input if is is actively reported', () => {
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

    it('should fire events on report()', () => {
      sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });
  });

  describe('ShowFirstOnSubmitValidator', () => {
    let doc, form, validations, validator;

    beforeEach(() => {
      doc = env.win.document;
      form = getForm(doc, true);
      validations = doc.querySelectorAll('[visible-when-invalid]');
      validator = new ShowFirstOnSubmitValidator(form);
    });

    it('should show first validation message', () => {
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
    });

    it('should not report on interaction for non-active inputs', () => {
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

    it('should report on interaction for active inputs', () => {
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

    it('should fire events on report()', () => {
      sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });
  });

  describe('ShowAllOnSubmitValidator', () => {
    let doc, form, validations, validator;

    beforeEach(() => {
      doc = env.win.document;
      form = getForm(doc, true);
      validations = doc.querySelectorAll('[visible-when-invalid]');
      validator = new ShowAllOnSubmitValidator(form);
    });

    it('should show validation messages for all inputs', () => {
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
    });

    it('should not report on interaction for non-active inputs', () => {
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

    it('should re-validate and report on interaction for active inputs', () => {
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

    it('should fire events on report()', () => {
      sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });
  });

  describe('AsYouGoValidator', () => {
    let doc, form, validations, validator;

    beforeEach(() => {
      doc = env.win.document;
      form = getForm(doc, true);
      validations = doc.querySelectorAll('[visible-when-invalid]');
      validator = new AsYouGoValidator(form);
    });

    it('should report validation for input on interaction', () => {
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

    it('should fire events on onBlur() and onInput()', () => {
      sandbox.stub(validator, 'fireValidityEventIfNecessary');

      validator.report();
      expect(validator.fireValidityEventIfNecessary).to.not.be.called;

      validator.onBlur({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledOnce;

      validator.onInput({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledTwice;
    });
  });

  describe('InteractAndSubmitValidator', () => {
    let doc, form, validations, validator;

    beforeEach(() => {
      doc = env.win.document;
      form = getForm(doc, true);
      validations = doc.querySelectorAll('[visible-when-invalid]');
      validator = new InteractAndSubmitValidator(form);
    });

    it('should report validation for input on interaction', () => {
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

    it('should report on interaction for non-active inputs on submit', () => {
      validator.report();

      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');

      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
    });

    it('should work after input and validation elements are replaced', () => {
      form.elements[0].validationMessage = 'Name is required';
      form.elements[1].validationMessage = 'Email is required';

      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');

      // Simulate a dynamic content event e.g. amp-list re-render.
      const {name, email, submit} = getInputs(doc);
      while (form.firstChild) {
        form.removeChild(form.firstChild);
      }
      [name, email, submit].forEach(c => form.appendChild(c));

      validations.forEach(v => v.parentNode.removeChild(v));
      const {noName, noEmail, invalidEmail} = getCustomValidations(doc);
      [noName, noEmail, invalidEmail].forEach(c => doc.body.appendChild(c));
      validations = doc.querySelectorAll('[visible-when-invalid]');

      // Test that validation still works.
      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
    });

    it('should fire events on report(), onBlur() and onInput()', () => {
      sandbox.stub(validator, 'fireValidityEventIfNecessary');

      validator.onBlur({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledOnce;

      validator.onInput({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledTwice;

      validator.report();
      expect(validator.fireValidityEventIfNecessary).calledThrice;
    });

  });
});
