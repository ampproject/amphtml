import {Services} from '#service';

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
import {ValidationBubble} from '../validation-bubble';

describes.realWin('form-validators', {amp: true}, (env) => {
  const emailTypeValidationMsg = 'Yo! That email does not look so.. email-y';
  const textPatternValidationMsg = 'Yo! No blank emails';

  // Stub validation message for predictable message on any platform.
  function stubValidationMessage(input) {
    env.sandbox.defineProperty(input, 'validationMessage', {
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

    const {email, name, submit, text} = getInputs(doc);
    [name, email, text, submit].forEach((c) => form.appendChild(c));

    if (isCustomValidations) {
      const {invalidEmail, invalidText, noEmail, noName} =
        getCustomValidations(doc);
      [noName, noEmail, invalidEmail, invalidText].forEach((c) =>
        doc.body.appendChild(c)
      );
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

    const text = doc.createElement('textarea');
    text.id = 'text1';
    text.setAttribute('pattern', '.*[^\\s]+.*'); // Must be non-empty.

    const submit = doc.createElement('input');
    submit.setAttribute('type', 'submit');

    return {name, email, text, submit};
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
    invalidEmail.setAttribute('id', 'invalidformat-for-email1');
    invalidEmail.textContent = emailTypeValidationMsg;

    const invalidText = doc.createElement('div');
    invalidText.setAttribute('visible-when-invalid', 'patternMismatch');
    invalidText.setAttribute('validation-for', 'text1');
    invalidText.textContent = textPatternValidationMsg;

    return {noName, noEmail, invalidEmail, invalidText};
  }

  beforeEach(() => {
    // Force sync mutateElement to make testing easier.
    const mutator = Services.mutatorForDoc(env.ampdoc);
    env.sandbox.stub(mutator, 'mutateElement').callsArg(1);
  });

  describe('getFormValidator', () => {
    it('should return default or polyfill instance', () => {
      const doc = env.win.document;
      const form = getForm(doc);
      setReportValiditySupportedForTesting(true);
      expect(getFormValidator(form)).to.be.instanceOf(DefaultValidator);
      setReportValiditySupportedForTesting(false);
      expect(getFormValidator(form)).to.be.instanceOf(PolyfillDefaultValidator);
    });

    it('should return custom validator instances', () => {
      const doc = env.win.document;
      const form = getForm(doc);
      form.setAttribute('custom-validation-reporting', 'as-you-go');
      expect(getFormValidator(form)).to.be.instanceOf(AsYouGoValidator);
      form.setAttribute('custom-validation-reporting', 'show-all-on-submit');
      expect(getFormValidator(form)).to.be.instanceOf(ShowAllOnSubmitValidator);
      form.setAttribute('custom-validation-reporting', 'interact-and-submit');
      expect(getFormValidator(form)).to.be.instanceOf(
        InteractAndSubmitValidator
      );
      form.setAttribute('custom-validation-reporting', 'show-first-on-submit');
      expect(getFormValidator(form)).to.be.instanceOf(
        ShowFirstOnSubmitValidator
      );
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
      env.sandbox.stub(form, 'checkValidity').returns(false);
      env.sandbox.stub(form, 'dispatchEvent');

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
      env.sandbox.stub(form, 'reportValidity');
      validator.report();
      expect(form.reportValidity).to.have.been.called;
    });

    it('should fire events on report()', () => {
      env.sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });

    it('should validate <textarea> on report()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      // Invalid because textarea is empty.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;
    });

    it('should not override other custom errors on <textarea>', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      textarea.value = 'valid, non-empty text';
      textarea.setCustomValidity('other classes can use this API too');

      // Invalid (despite pattern match success) due to existing custom error.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;
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
      env.sandbox.stub(validator.validationBubble_, 'show');
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validator.validationBubble_.show).to.be.calledOnce;
      expect(validator.validationBubble_.show).to.be.calledWith(
        form.elements[0],
        form.elements[0].validationMessage
      );
    });

    it('should hide validation bubble onblur', () => {
      const mockEvent = {
        target: {},
      };
      env.sandbox.stub(validator.validationBubble_, 'hide');
      validator.onBlur(mockEvent);
      expect(validator.validationBubble_.hide).to.be.calledOnce;
    });

    it('should re-validate on input if is is actively reported', () => {
      env.sandbox.stub(validator.validationBubble_, 'show');
      env.sandbox.stub(validator.validationBubble_, 'hide');
      validator.onInput({target: form.elements[0]});
      expect(validator.validationBubble_.hide).to.not.be.called;
      expect(validator.validationBubble_.show).to.not.be.called;
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validator.validationBubble_.show).to.be.calledOnce;
      expect(validator.validationBubble_.hide).to.not.be.called;
      expect(validator.validationBubble_.show).to.be.calledWith(
        form.elements[0],
        form.elements[0].validationMessage
      );

      env.sandbox.stub(validator.validationBubble_, 'isActiveOn').returns(true);
      validator.onInput({target: form.elements[0]});
      expect(form.elements[0].getAttribute('aria-invalid')).to.equal('true');
      expect(validator.validationBubble_.show).to.be.calledTwice;
      form.elements[0].value = 'Hello';
      validator.onInput({target: form.elements[0]});
      expect(form.elements[0].hasAttribute('aria-invalid')).to.be.false;
      expect(validator.validationBubble_.hide).to.be.calledOnce;
    });

    it('should fire events on report()', () => {
      env.sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });

    it('should validate <textarea> on report()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      // Invalid because textarea is empty.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;
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
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should set aria-describedby to the first validation message (generated ID)', () => {
      validator.report();
      expect(validations[0].getAttribute('id')).to.be.a('string');
      expect(form.elements[0].getAttribute('aria-describedby')).to.equal(
        validations[0].getAttribute('id')
      );
    });

    it('should set aria-describedby to the second validation message (existing ID)', () => {
      form.elements[0].value = 'John Miller';
      form.elements[1].value = 'invalidemail';
      form.elements[1].validationMessage = 'Email format is wrong';
      validator.report();
      validator.onInput({target: form.elements[1]});
      expect(form.elements[1].getAttribute('aria-describedby')).to.equal(
        'invalidformat-for-email1'
      );
    });

    it('should not report on interaction for non-active inputs', () => {
      validator.onBlur({target: form.elements[0]});
      expect(doc.activeElement).to.not.equal(form.elements[0]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onInput({target: form.elements[0]});
      expect(doc.activeElement).to.not.equal(form.elements[0]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should report on interaction for active inputs', () => {
      form.elements[0].validationMessage = 'Name is required';
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[0].textContent).to.equal('Name is required');

      form.elements[0].value = 'John Miller';
      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      form.elements[1].validationMessage = 'Email is required';
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[1]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[1].textContent).to.equal('Email is required');

      form.elements[1].value = 'invalidemail';
      form.elements[1].validationMessage = 'Email format is wrong';
      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.contain('visible');
      expect(validations[2].textContent).to.not.equal('Email format is wrong');
      expect(validations[2].textContent).to.equal(emailTypeValidationMsg);
      expect(validations[3].className).to.not.contain('visible');

      form.elements[1].value = 'valid@email.com';
      validator.report();
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');
      expect(validations[3].textContent).to.equal(textPatternValidationMsg);

      form.elements[2].value = 'valid, non-empty text';
      validator.onInput({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should fire events on report()', () => {
      env.sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });

    it('should validate <textarea> on report()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      // Invalid because textarea is empty.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;
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
      expect(validations[3].className).to.contain('visible');
    });

    it('should not report on interaction for non-active inputs', () => {
      validator.onBlur({target: form.elements[0]});
      expect(doc.activeElement).to.not.equal(form.elements[0]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onInput({target: form.elements[0]});
      expect(doc.activeElement).to.not.equal(form.elements[0]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should re-validate and report on interaction for active inputs', () => {
      form.elements[0].validationMessage = 'Name is required';
      form.elements[1].validationMessage = 'Email is required';
      validator.report();
      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');
      expect(validations[0].textContent).to.equal('Name is required');
      expect(validations[1].textContent).to.equal('Email is required');
      expect(validations[3].textContent).to.equal(textPatternValidationMsg);

      form.elements[0].value = 'John Miller';
      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');

      validator.report();
      expect(doc.activeElement).to.equal(form.elements[1]);
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');
      expect(validations[1].textContent).to.equal('Email is required');

      form.elements[1].value = 'invalidemail';
      form.elements[1].validationMessage = 'Email format is wrong';
      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.contain('visible');
      expect(validations[3].className).to.contain('visible');
      expect(validations[2].textContent).to.not.equal('Email format is wrong');
      expect(validations[2].textContent).to.equal(emailTypeValidationMsg);

      form.elements[1].value = 'valid@email.com';
      validator.onBlur({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');

      form.elements[2].value = 'valid, non-empty text';
      validator.onInput({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should fire events on report()', () => {
      env.sandbox.stub(form, 'dispatchEvent');

      validator.onBlur({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.onInput({target: form.elements[0]});
      expect(form.dispatchEvent).to.not.be.called;

      validator.report();
      expect(form.dispatchEvent).calledOnce;
    });

    it('should validate <textarea> on report()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      // Invalid because textarea is empty.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;
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
      expect(validations[3].className).to.not.contain('visible');

      form.elements[0].value = 'John Miller';
      validator.onInput({target: form.elements[0]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[1].textContent).to.equal('Email is required');

      form.elements[1].value = 'invalidemail';
      form.elements[1].validationMessage = 'Email format is wrong';
      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[2].textContent).to.not.equal('Email format is wrong');
      expect(validations[2].textContent).to.equal(emailTypeValidationMsg);

      form.elements[1].value = 'valid@email.com';
      validator.onBlur({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onBlur({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');

      form.elements[2].value = 'valid, non-empty text';
      validator.onInput({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should fire events on onBlur() and onInput()', () => {
      env.sandbox.stub(validator, 'fireValidityEventIfNecessary');

      validator.report();
      expect(validator.fireValidityEventIfNecessary).to.not.be.called;

      validator.onBlur({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledOnce;

      validator.onInput({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledTwice;
    });

    it('should validate <textarea> on onBlur() and onInput()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      textarea.value = 'valid, non-empty text';
      validator.onBlur({target: textarea});
      expect(textarea.checkValidity()).to.be.true;

      textarea.value = ' '; // Invalid because it's whitespace.
      validator.onInput({target: textarea});
      expect(textarea.checkValidity()).to.be.false;
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
      expect(validations[3].className).to.not.contain('visible');

      form.elements[0].value = 'John Miller';
      validator.onInput({target: form.elements[0]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[1].textContent).to.equal('Email is required');

      form.elements[1].value = 'invalidemail';
      form.elements[1].validationMessage = 'Email format is wrong';
      validator.onInput({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
      expect(validations[2].textContent).to.not.equal('Email format is wrong');
      expect(validations[2].textContent).to.equal(emailTypeValidationMsg);

      form.elements[1].value = 'valid@email.com';
      validator.onBlur({target: form.elements[1]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      validator.onBlur({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');

      form.elements[2].value = 'valid, non-empty text';
      validator.onInput({target: form.elements[2]});
      expect(validations[0].className).to.not.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should report on interaction for non-active inputs on submit', () => {
      validator.report();

      expect(doc.activeElement).to.equal(form.elements[0]);
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.contain('visible');
    });

    it('should work after input and validation elements are replaced', () => {
      form.elements[0].validationMessage = 'Name is required';
      form.elements[1].validationMessage = 'Email is required';

      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');

      // Simulate a dynamic content event e.g. amp-list re-render.
      const {email, name, submit} = getInputs(doc);
      while (form.firstChild) {
        form.removeChild(form.firstChild);
      }
      [name, email, submit].forEach((c) => form.appendChild(c));

      validations.forEach((v) => v.parentNode.removeChild(v));
      const {invalidEmail, invalidText, noEmail, noName} =
        getCustomValidations(doc);
      [noName, noEmail, invalidEmail, invalidText].forEach((c) =>
        doc.body.appendChild(c)
      );
      validations = doc.querySelectorAll('[visible-when-invalid]');

      // Test that validation still works.
      validator.onBlur({target: form.elements[0]});
      expect(validations[0].className).to.contain('visible');
      expect(validations[1].className).to.not.contain('visible');
      expect(validations[2].className).to.not.contain('visible');
      expect(validations[3].className).to.not.contain('visible');
    });

    it('should fire events on report(), onBlur() and onInput()', () => {
      env.sandbox.stub(validator, 'fireValidityEventIfNecessary');

      validator.onBlur({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledOnce;

      validator.onInput({target: form.elements[0]});
      expect(validator.fireValidityEventIfNecessary).calledTwice;

      validator.report();
      expect(validator.fireValidityEventIfNecessary).calledThrice;
    });

    it('should validate <textarea> on report(), onBlur() and onInput()', () => {
      const textarea = form.querySelector('textarea');
      expect(textarea.checkValidity()).to.be.true;

      // Invalid because textarea is empty.
      validator.report();
      expect(textarea.checkValidity()).to.be.false;

      textarea.value = 'valid, non-empty text';
      validator.onBlur({target: textarea});
      expect(textarea.checkValidity()).to.be.true;

      textarea.value = ' '; // Invalid because it's whitespace.
      validator.onInput({target: textarea});
      expect(textarea.checkValidity()).to.be.false;
    });
  });
});
