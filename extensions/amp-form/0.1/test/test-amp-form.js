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
import {
  AmpForm,
  installAmpForm,
  onInputInteraction_,
} from '../amp-form';
import {
  setReportValiditySupported,
} from '../form-validators';
import * as sinon from 'sinon';
import {timerFor} from '../../../../src/timer';
import '../../../amp-mustache/0.1/amp-mustache';
import {installTemplatesService} from '../../../../src/service/template-impl';
import {toggleExperiment} from '../../../../src/experiments';
import {installDocService,} from
    '../../../../src/service/ampdoc-impl';
import {installActionServiceForDoc,} from
    '../../../../src/service/action-impl';

describe('amp-form', () => {

  let sandbox;
  const timer = timerFor(window);

  function getAmpForm(button1 = true, button2 = false) {
    return createIframePromise().then(iframe => {
      const docService = installDocService(iframe.win, /* isSingleDoc */ true);
      installActionServiceForDoc(docService.getAmpDoc());
      toggleExperiment(iframe.win, 'amp-form', true);
      installTemplatesService(iframe.win);
      installAmpForm(iframe.win);
      const form = getForm(iframe.doc, button1, button2);
      const ampForm = new AmpForm(form);
      return ampForm;
    });
  }

  function getForm(doc = document, button1 = true, button2 = false) {
    const form = doc.createElement('form');
    form.setAttribute('method', 'POST');

    const nameInput = doc.createElement('input');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Miller');
    form.appendChild(nameInput);
    form.setAttribute('action-xhr', 'https://example.com');
    form.setAttribute('action', 'https://example.com');

    if (button1) {
      const submitBtn = doc.createElement('input');
      submitBtn.setAttribute('type', 'submit');
      form.appendChild(submitBtn);
    }

    if (button2) {
      const submitBtn = doc.createElement('input');
      submitBtn.setAttribute('type', 'submit');
      form.appendChild(submitBtn);
    }

    return form;
  }

  beforeEach(() => {
    installTemplatesService(window);
    const docService = installDocService(window, /* isSingleDoc */ true);
    installActionServiceForDoc(docService.getAmpDoc());

    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should assert form has at least 1 submit button', () => {
    let form = getForm(document, false, false);
    expect(() => new AmpForm(form)).to.throw(
        /form requires at least one <input type=submit>/);
    form = getForm(document, true, false);
    expect(() => new AmpForm(form)).to.not.throw;
  });

  it('should assert valid action-xhr when provided', () => {
    const form = getForm();
    form.setAttribute('action-xhr', 'http://example.com');
    expect(() => new AmpForm(form)).to.throw(
        /form action-xhr must start with/);
    form.setAttribute('action-xhr', 'https://cdn.ampproject.org/example.com');
    expect(() => new AmpForm(form)).to.throw(
        /form action-xhr should not be on cdn\.ampproject\.org/);
    form.setAttribute('action-xhr', 'https://example.com');
    expect(() => new AmpForm(form)).to.not.throw;
  });

  it('should assert none of the inputs named __amp_source_origin', () => {
    const form = getForm(document, true, false);
    const illegalInput = document.createElement('input');
    illegalInput.setAttribute('type', 'hidden');
    illegalInput.setAttribute('name', '__amp_source_origin');
    illegalInput.value = 'https://example.com';
    form.appendChild(illegalInput);
    expect(() => new AmpForm(form)).to.throw(
        /Illegal input name, __amp_source_origin found/);
  });

  it('should listen to submit, blur and input events', () => {
    const form = getForm();
    form.addEventListener = sandbox.spy();
    form.setAttribute('action-xhr', 'https://example.com');
    new AmpForm(form);
    expect(form.addEventListener.called).to.be.true;
    expect(form.addEventListener).to.be.calledWith('submit');
    expect(form.addEventListener).to.be.calledWith('blur');
    expect(form.addEventListener).to.be.calledWith('input');
    expect(form.className).to.contain('-amp-form');
  });

  it('should do nothing if already submitted', () => {
    const form = getForm();
    const ampForm = new AmpForm(form);
    ampForm.state_ = 'submitting';
    const event = {
      stopImmediatePropagation: sandbox.spy(),
      target: form,
      preventDefault: sandbox.spy(),
    };
    sandbox.spy(ampForm.xhr_, 'fetchJson');
    sandbox.spy(form, 'checkValidity');
    ampForm.handleSubmit_(event);
    expect(event.stopImmediatePropagation.called).to.be.true;
    expect(form.checkValidity.called).to.be.false;
    expect(ampForm.xhr_.fetchJson.called).to.be.false;
  });

  it('should respect novalidate on a form', () => {
    setReportValiditySupported(true);
    const form = getForm();
    form.setAttribute('novalidate', '');
    const emailInput = document.createElement('input');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('required', '');
    form.appendChild(emailInput);
    const ampForm = new AmpForm(form);
    const event = {
      stopImmediatePropagation: sandbox.spy(),
      target: form,
      preventDefault: sandbox.spy(),
    };
    ampForm.vsync_ = {
      run: (task, state) => {
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
      },
    };
    sandbox.spy(form, 'checkValidity');
    sandbox.spy(emailInput, 'reportValidity');
    ampForm.xhrAction_ = null;
    ampForm.handleSubmit_(event);
    // Check validity should always be called regardless of novalidate.
    expect(form.checkValidity.called).to.be.true;

    // However reporting validity shouldn't happen when novalidate.
    expect(emailInput.reportValidity.called).to.be.false;
    expect(event.preventDefault.called).to.be.false;
    expect(form.hasAttribute('amp-novalidate')).to.be.true;
  });

  it('should check validity and report when invalid', () => {
    setReportValiditySupported(false);
    return getAmpForm().then(ampForm => {
      const form = ampForm.form_;
      const emailInput = document.createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      form.appendChild(emailInput);
      sandbox.spy(form, 'checkValidity');
      sandbox.spy(ampForm.xhr_, 'fetchJson');

      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: ampForm.form_,
        preventDefault: sandbox.spy(),
      };

      ampForm.vsync_ = {
        run: (task, state) => {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
        },
      };

      const bubbleEl = ampForm.win_.document.querySelector(
          '.-amp-validation-bubble');
      const validationBubble = bubbleEl['__BUBBLE_OBJ'];
      sandbox.spy(validationBubble, 'show');
      sandbox.spy(validationBubble, 'hide');
      ampForm.handleSubmit_(event);
      expect(event.stopImmediatePropagation.called).to.be.true;
      expect(form.checkValidity.called).to.be.true;
      expect(ampForm.xhr_.fetchJson.called).to.be.false;

      const showCall1 = validationBubble.show.getCall(0);
      expect(showCall1.args[0]).to.equal(emailInput);
      expect(showCall1.args[1]).to.not.be.null;

      // Check bubble would show with a new message when user
      // change its content.
      emailInput.value = 'cool';
      ampForm.validator_.onInput({target: emailInput});
      const showCall2 = validationBubble.show.getCall(1);
      expect(showCall2.args[0]).to.equal(emailInput);
      expect(showCall2.args[1]).to.not.be.null;
      expect(showCall2.args[1]).to.not.equal(showCall1.args[0]);
      expect(ampForm.xhr_.fetchJson.called).to.be.false;

      // Check bubble would hide when input becomes valid.
      emailInput.value = 'cool@bea.ns';
      ampForm.validator_.onInput({target: emailInput});
      expect(validationBubble.hide.calledOnce).to.be.true;
      expect(validationBubble.show.calledTwice).to.be.true;

      // Check that we'd hide the bubble when user move out.
      ampForm.validator_.onBlur({target: emailInput});
      expect(validationBubble.hide.calledTwice).to.be.true;

      ampForm.validator_.onInput({target: emailInput});
      expect(validationBubble.show.calledThrice).to.be.false;

      // Check xhr goes through when form is valid.
      emailInput.value = 'cool@bea.ns';
      ampForm.handleSubmit_(event);
      expect(ampForm.xhr_.fetchJson.called).to.be.true;
    });
  });

  it('should call fetchJson with the xhr action and form data', () => {
    return getAmpForm().then(ampForm => {
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: ampForm.form_,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      expect(event.preventDefault).to.be.calledOnce;
      expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
      expect(ampForm.xhr_.fetchJson).to.be.calledWith('https://example.com');

      const xhrCall = ampForm.xhr_.fetchJson.getCall(0);
      const config = xhrCall.args[1];
      expect(config.body).to.not.be.null;
      expect(config.method).to.equal('POST');
      expect(config.credentials).to.equal('include');
      expect(config.requireAmpResponseSourceOrigin).to.be.true;
    });
  });

  it('should block multiple submissions and disable buttons', () => {
    return getAmpForm(true, true).then(ampForm => {
      let fetchJsonResolver;
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(new Promise(resolve => {
        fetchJsonResolver = resolve;
      }));
      const form = ampForm.form_;
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      const button1 = form.querySelectorAll('input[type=submit]')[0];
      const button2 = form.querySelectorAll('input[type=submit]')[1];
      expect(button1.hasAttribute('disabled')).to.be.false;
      expect(button2.hasAttribute('disabled')).to.be.false;
      ampForm.handleSubmit_(event);
      expect(ampForm.state_).to.equal('submitting');
      expect(ampForm.xhr_.fetchJson.calledOnce).to.be.true;
      expect(button1.hasAttribute('disabled')).to.be.true;
      expect(button2.hasAttribute('disabled')).to.be.true;
      ampForm.handleSubmit_(event);
      ampForm.handleSubmit_(event);
      expect(event.preventDefault.called).to.be.true;
      expect(event.preventDefault.callCount).to.equal(1);
      expect(event.stopImmediatePropagation.callCount).to.equal(2);
      expect(ampForm.xhr_.fetchJson.calledOnce).to.be.true;
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonResolver();
      return timer.promise(20).then(() => {
        expect(button1.hasAttribute('disabled')).to.be.false;
        expect(button2.hasAttribute('disabled')).to.be.false;
        expect(ampForm.state_).to.equal('submit-success');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.contain('amp-form-submit-success');
      });
    });
  });

  it('should manage form state classes (submitting, success)', () => {
    return getAmpForm().then(ampForm => {
      let fetchJsonResolver;
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(new Promise(resolve => {
        fetchJsonResolver = resolve;
      }));
      sandbox.spy(ampForm.actions_, 'trigger');
      const form = ampForm.form_;
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      expect(event.preventDefault.called).to.be.true;
      expect(ampForm.state_).to.equal('submitting');
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonResolver();
      return timer.promise(0).then(() => {
        expect(ampForm.state_).to.equal('submit-success');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.contain('amp-form-submit-success');
        expect(ampForm.actions_.trigger.called).to.be.true;
        expect(ampForm.actions_.trigger.calledWith(
            form, 'submit-success', null)).to.be.true;
      });
    });
  });

  it('should manage form state classes (submitting, error)', () => {
    return getAmpForm(true, true).then(ampForm => {
      let fetchJsonRejecter;
      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(new Promise((unusedResolve, reject) => {
            fetchJsonRejecter = reject;
          }));
      sandbox.spy(ampForm.actions_, 'trigger');
      const form = ampForm.form_;
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      const button1 = form.querySelectorAll('input[type=submit]')[0];
      const button2 = form.querySelectorAll('input[type=submit]')[1];
      expect(button1.hasAttribute('disabled')).to.be.false;
      expect(button2.hasAttribute('disabled')).to.be.false;
      ampForm.handleSubmit_(event);
      expect(button1.hasAttribute('disabled')).to.be.true;
      expect(button2.hasAttribute('disabled')).to.be.true;
      expect(event.preventDefault.called).to.be.true;
      expect(ampForm.state_).to.equal('submitting');
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonRejecter();
      return timer.promise(0).then(() => {
        expect(button1.hasAttribute('disabled')).to.be.false;
        expect(button2.hasAttribute('disabled')).to.be.false;
        expect(ampForm.state_).to.equal('submit-error');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-success');
        expect(form.className).to.contain('amp-form-submit-error');
        expect(ampForm.actions_.trigger.called).to.be.true;
        expect(ampForm.actions_.trigger.calledWith(
            form, 'submit-error', null)).to.be.true;
      });
    });
  });

  it('should allow rendering responses through templates', () => {
    return getAmpForm(true).then(ampForm => {
      const form = ampForm.form_;
      // Add a div[submit-error] with a template child.
      const errorContainer = document.createElement('div');
      errorContainer.setAttribute('submit-error', '');
      form.appendChild(errorContainer);
      const errorTemplate = document.createElement('template');
      errorTemplate.setAttribute('type', 'amp-mustache');
      errorTemplate.content.appendChild(
          document.createTextNode('Error: {{message}}'));
      errorContainer.appendChild(errorTemplate);
      const renderedTemplate = document.createElement('div');
      renderedTemplate.innerText = 'Error: hello there';
      let fetchJsonRejecter;
      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(new Promise((unusedResolve, reject) => {
            fetchJsonRejecter = reject;
          }));
      sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
          .returns(new Promise(resolve => {
            resolve(renderedTemplate);
          }));
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      fetchJsonRejecter({responseJson: {message: 'hello there'}});
      return timer.promise(0).then(() => {
        expect(ampForm.templates_.findAndRenderTemplate.called).to.be.true;
        expect(ampForm.templates_.findAndRenderTemplate.calledWith(
            errorContainer, {message: 'hello there'})).to.be.true;
        // Check that form has a rendered div with class .submit-error-message.
        const renderedTemplate = form.querySelector('[i-amp-rendered]');
        expect(renderedTemplate).to.not.be.null;
      });
    });
  });

  it('should replace previously rendered responses', () => {
    return getAmpForm(true).then(ampForm => {
      const form = ampForm.form_;
      const successContainer = document.createElement('div');
      successContainer.setAttribute('submit-success', '');
      form.appendChild(successContainer);
      const successTemplate = document.createElement('template');
      successTemplate.setAttribute('type', 'amp-mustache');
      successTemplate.content.appendChild(
          document.createTextNode('Success: {{message}}'));
      successContainer.appendChild(successTemplate);
      const renderedTemplate = document.createElement('div');
      renderedTemplate.innerText = 'Success: hello';
      renderedTemplate.setAttribute('i-amp-rendered', '');
      successContainer.appendChild(renderedTemplate);
      ampForm.state_ = 'submit-success';

      const newRender = document.createElement('div');
      newRender.innerText = 'New Success: What What';

      let fetchJsonResolver;
      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(new Promise(resolve => {
            fetchJsonResolver = resolve;
          }));
      sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
          .returns(new Promise(resolve => {
            resolve(newRender);
          }));
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      fetchJsonResolver({'message': 'What What'});
      return timer.promise(0).then(() => {
        expect(ampForm.templates_.findAndRenderTemplate.called).to.be.true;
        expect(ampForm.templates_.findAndRenderTemplate.calledWith(
            successContainer, {'message': 'What What'})).to.be.true;
        const renderedTemplates = form.querySelectorAll('[i-amp-rendered]');
        expect(renderedTemplates[0]).to.not.be.null;
        expect(renderedTemplates.length).to.equal(1);
        expect(renderedTemplates[0]).to.equal(newRender);
      });
    });
  });

  describe('GET requests', () => {
    it('should allow GET submissions', () => {
      return getAmpForm().then(ampForm => {
        ampForm.method_ = 'GET';
        ampForm.form_.setAttribute('method', 'GET');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmit_(event);
        expect(event.preventDefault).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller');

        const xhrCall = ampForm.xhr_.fetchJson.getCall(0);
        const config = xhrCall.args[1];
        expect(config.body).to.be.null;
        expect(config.method).to.equal('GET');
        expect(config.credentials).to.equal('include');
        expect(config.requireAmpResponseSourceOrigin).to.be.true;
      });
    });

    it('should not send disabled or nameless inputs', () => {
      return getAmpForm().then(ampForm => {
        const form = ampForm.form_;
        ampForm.method_ = 'GET';
        form.setAttribute('method', 'GET');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
        const fieldset = document.createElement('fieldset');
        const emailInput = document.createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        fieldset.appendChild(emailInput);
        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('name', 'nickname');
        usernameInput.setAttribute('required', '');
        fieldset.appendChild(usernameInput);
        form.appendChild(fieldset);
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };

        usernameInput.disabled = true;
        usernameInput.value = 'coolbeans';
        emailInput.value = 'cool@bea.ns';
        ampForm.handleSubmit_(event);
        expect(event.preventDefault).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&email=cool%40bea.ns');

        ampForm.setState_('submit-success');
        ampForm.xhr_.fetchJson.reset();
        usernameInput.removeAttribute('disabled');
        usernameInput.value = 'coolbeans';
        emailInput.value = 'cool@bea.ns';
        ampForm.handleSubmit_(event);
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&email=cool%40bea.ns&' +
            'nickname=coolbeans');

        ampForm.setState_('submit-success');
        ampForm.xhr_.fetchJson.reset();
        fieldset.disabled = true;
        ampForm.handleSubmit_(event);
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller');

        ampForm.setState_('submit-success');
        ampForm.xhr_.fetchJson.reset();
        fieldset.removeAttribute('disabled');
        usernameInput.removeAttribute('name');
        emailInput.removeAttribute('required');
        emailInput.value = '';
        ampForm.handleSubmit_(event);
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&email=');
      });
    });


    it('should properly serialize inputs to query params', () => {
      return getAmpForm().then(ampForm => {
        const form = ampForm.form_;
        ampForm.method_ = 'GET';
        form.setAttribute('method', 'GET');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

        const otherNamesFS = document.createElement('fieldset');
        const otherName1Input = document.createElement('input');
        otherName1Input.setAttribute('name', 'name');
        otherNamesFS.appendChild(otherName1Input);
        const otherName2Input = document.createElement('input');
        otherName2Input.setAttribute('name', 'name');
        otherNamesFS.appendChild(otherName2Input);
        form.appendChild(otherNamesFS);

        // Group of Radio buttons.
        const genderFS = document.createElement('fieldset');
        const maleRadio = document.createElement('input');
        maleRadio.setAttribute('type', 'radio');
        maleRadio.setAttribute('name', 'gender');
        maleRadio.setAttribute('value', 'Male');
        genderFS.appendChild(maleRadio);
        const femaleRadio = document.createElement('input');
        femaleRadio.setAttribute('type', 'radio');
        femaleRadio.setAttribute('name', 'gender');
        femaleRadio.setAttribute('value', 'Female');
        genderFS.appendChild(femaleRadio);
        form.appendChild(genderFS);

        // Group of Checkboxes.
        const interestsFS = document.createElement('fieldset');
        const basketballCB = document.createElement('input');
        basketballCB.setAttribute('type', 'checkbox');
        basketballCB.setAttribute('name', 'interests');
        basketballCB.setAttribute('value', 'Basketball');
        interestsFS.appendChild(basketballCB);
        const footballCB = document.createElement('input');
        footballCB.setAttribute('type', 'checkbox');
        footballCB.setAttribute('name', 'interests');
        footballCB.setAttribute('value', 'Football');
        interestsFS.appendChild(footballCB);
        const foodCB = document.createElement('input');
        foodCB.setAttribute('type', 'checkbox');
        foodCB.setAttribute('name', 'interests');
        foodCB.setAttribute('value', 'Food');
        interestsFS.appendChild(foodCB);
        form.appendChild(interestsFS);

        // Select w/ options.
        const citySelect = document.createElement('select');
        citySelect.setAttribute('name', 'city');
        const sfOption = document.createElement('option');
        sfOption.setAttribute('value', 'San Francisco');
        citySelect.appendChild(sfOption);
        const mtvOption = document.createElement('option');
        mtvOption.setAttribute('value', 'Mountain View');
        citySelect.appendChild(mtvOption);
        const nyOption = document.createElement('option');
        nyOption.setAttribute('value', 'New York');
        citySelect.appendChild(nyOption);
        form.appendChild(citySelect);

        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };

        ampForm.handleSubmit_(event);
        expect(event.preventDefault).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&name=&name=&' +
            'city=San%20Francisco');

        ampForm.setState_('submit-success');
        ampForm.xhr_.fetchJson.reset();
        foodCB.checked = true;
        footballCB.checked = true;
        ampForm.handleSubmit_(event);
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&name=&name=' +
            '&interests=Football&interests=Food&city=San%20Francisco');

        ampForm.setState_('submit-success');
        femaleRadio.checked = true;
        otherName1Input.value = 'John Maller';
        ampForm.xhr_.fetchJson.reset();
        ampForm.handleSubmit_(event);
        expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
        expect(ampForm.xhr_.fetchJson).to.be.calledWith(
            'https://example.com?name=John%20Miller&name=John%20Maller&name=&' +
            'gender=Female&interests=Football&interests=Food&' +
            'city=San%20Francisco');
      });
    });
  });

  describe('User Validity', () => {
    it('should manage valid/invalid on input/fieldset/form on submit', () => {
      setReportValiditySupported(false);
      return getAmpForm(true).then(ampForm => {
        const form = ampForm.form_;
        const fieldset = document.createElement('fieldset');
        const emailInput = document.createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        fieldset.appendChild(emailInput);
        form.appendChild(fieldset);
        sandbox.spy(form, 'checkValidity');
        sandbox.spy(emailInput, 'checkValidity');
        sandbox.spy(fieldset, 'checkValidity');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

        const event = {
          target: ampForm.form_,
          stopImmediatePropagation: sandbox.spy(),
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmit_(event);

        expect(form.checkValidity.called).to.be.true;
        expect(emailInput.checkValidity.called).to.be.true;
        expect(fieldset.checkValidity.called).to.be.true;
        expect(form.className).to.contain('user-invalid');
        expect(emailInput.className).to.contain('user-invalid');
        expect(fieldset.className).to.contain('user-invalid');

        emailInput.value = 'cool@bea.ns';
        ampForm.handleSubmit_(event);
        expect(form.className).to.contain('user-valid');
        expect(emailInput.className).to.contain('user-valid');
        expect(fieldset.className).to.contain('user-valid');
      });
    });

    it('should manage valid/invalid on input user interaction', () => {
      setReportValiditySupported(false);
      return getAmpForm(true).then(ampForm => {
        const form = ampForm.form_;
        const fieldset = document.createElement('fieldset');
        const emailInput = document.createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        fieldset.appendChild(emailInput);
        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('name', 'nickname');
        usernameInput.setAttribute('required', '');
        fieldset.appendChild(usernameInput);
        form.appendChild(fieldset);
        sandbox.spy(form, 'checkValidity');
        sandbox.spy(emailInput, 'checkValidity');
        sandbox.spy(fieldset, 'checkValidity');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

        onInputInteraction_({target: emailInput});
        expect(form.checkValidity.called).to.be.true;
        expect(emailInput.checkValidity.called).to.be.true;
        expect(fieldset.checkValidity.called).to.be.true;
        expect(form.className).to.contain('user-invalid');
        expect(emailInput.className).to.contain('user-invalid');
        expect(fieldset.className).to.contain('user-invalid');

        // No interaction happened with usernameInput, so no user-class should
        // be added at this point.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');


        emailInput.value = 'cool@bea.ns';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-valid');
        expect(form.className).to.contain('user-invalid');
        expect(fieldset.className).to.contain('user-invalid');

        // Still no interaction.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');

        // Both inputs back to invalid.
        emailInput.value = 'invalid-value';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-invalid');
        expect(form.className).to.contain('user-invalid');
        expect(fieldset.className).to.contain('user-invalid');

        // Still no interaction.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');

        // Only email input is invalid now.
        usernameInput.value = 'coolbeans';
        onInputInteraction_({target: usernameInput});
        expect(emailInput.className).to.contain('user-invalid');
        expect(form.className).to.contain('user-invalid');
        expect(usernameInput.className).to.contain('user-valid');
        expect(fieldset.className).to.contain('user-invalid');

        // Both input are finally valid.
        emailInput.value = 'cool@bea.ns';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-valid');
        expect(usernameInput.className).to.contain('user-valid');
        expect(form.className).to.contain('user-valid');
        expect(fieldset.className).to.contain('user-valid');
      });
    });

    it('should propagates user-valid only when going from invalid', () => {
      setReportValiditySupported(false);
      return getAmpForm(true).then(ampForm => {
        const form = ampForm.form_;
        const fieldset = document.createElement('fieldset');
        const emailInput = document.createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        fieldset.appendChild(emailInput);
        form.appendChild(fieldset);
        sandbox.spy(form, 'checkValidity');
        sandbox.spy(emailInput, 'checkValidity');
        sandbox.spy(fieldset, 'checkValidity');
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

        emailInput.value = 'cool@bea.ns';
        const event = {target: emailInput};
        onInputInteraction_(event);

        expect(emailInput.checkValidity.called).to.be.true;
        expect(form.checkValidity.called).to.be.false;
        expect(fieldset.checkValidity.called).to.be.false;
        expect(emailInput.className).to.contain('user-valid');
        expect(form.className).to.not.contain('user-valid');
        expect(fieldset.className).to.not.contain('user-valid');
      });
    });
  });

});
