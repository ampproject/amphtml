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
  setReportValiditySupportedForTesting,
  setCheckValiditySupportedForTesting,
} from '../form-validators';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';
import {timerFor} from '../../../../src/timer';
import '../../../amp-mustache/0.1/amp-mustache';
import {installTemplatesService} from '../../../../src/service/template-impl';
import {installDocService,} from
    '../../../../src/service/ampdoc-impl';
import {installActionServiceForDoc,} from
    '../../../../src/service/action-impl';
import {actionServiceForDoc} from '../../../../src/action';
import {
    installCidService,
} from '../../../../extensions/amp-analytics/0.1/cid-impl';
import {
    installCryptoService,
} from '../../../../extensions/amp-analytics/0.1/crypto-impl';

describe('amp-form', () => {

  let sandbox;
  const timer = timerFor(window);

  function getAmpForm(button1 = true, button2 = false, button3 = false) {
    return createIframePromise().then(iframe => {
      const docService = installDocService(iframe.win, /* isSingleDoc */ true);
      installActionServiceForDoc(docService.getAmpDoc());
      installTemplatesService(iframe.win);
      installAmpForm(iframe.win);
      installCidService(iframe.win);
      installCryptoService(iframe.win);
      toggleExperiment(iframe.win, 'amp-form-var-sub');
      const form = getForm(iframe.doc, button1, button2, button3);
      iframe.doc.body.appendChild(form);
      const ampForm = new AmpForm(form, 'amp-form-test-id');
      return ampForm;
    });
  }

  function getForm(doc = document, button1 = true, button2 = false,
                   button3 = false) {
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

    if (button3) {
      const submitBtn = doc.createElement('button');
      submitBtn.setAttribute('type', 'submit');
      form.appendChild(submitBtn);
    }

    return form;
  }

  beforeEach(() => {
    installTemplatesService(window);
    const docService = installDocService(window, /* isSingleDoc */ true);
    installActionServiceForDoc(docService.getAmpDoc());
    toggleExperiment(window, 'amp-form-var-sub');

    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    // Reset supported state for checkValidity and reportValidity.
    setCheckValiditySupportedForTesting(undefined);
    setReportValiditySupportedForTesting(undefined);
    sandbox.restore();
  });

  it('should assert valid action-xhr when provided', () => {
    const form = getForm();
    form.setAttribute('action-xhr', 'http://example.com');
    expect(() => new AmpForm(form)).to.throw(
        /form action-xhr must start with/);
    form.setAttribute('action-xhr', 'https://cdn.ampproject.org/example.com');
    expect(() => new AmpForm(form)).to.throw(
        /form action-xhr should not be on AMP CDN/);
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
    expect(form.addEventListener).to.be.called;
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
    sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
    sandbox.spy(form, 'checkValidity');
    ampForm.handleSubmit_(event);
    expect(event.stopImmediatePropagation).to.be.called;
    expect(form.checkValidity).to.not.be.called;
    expect(ampForm.xhr_.fetchJson).to.not.be.called;
  });

  it('should throw error if POST non-xhr', () => {
    const form = getForm();
    form.removeAttribute('action-xhr');
    const ampForm = new AmpForm(form);
    const event = {
      stopImmediatePropagation: sandbox.spy(),
      target: form,
      preventDefault: sandbox.spy(),
    };
    sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
    sandbox.spy(form, 'checkValidity');
    expect(() => ampForm.handleSubmit_(event)).to.throw(
        /Only XHR based \(via action-xhr attribute\) submissions are support/);
    expect(event.preventDefault).to.be.called;
  });

  it('should respect novalidate on a form', () => {
    setReportValiditySupportedForTesting(true);
    const form = getForm();
    form.setAttribute('novalidate', '');
    const emailInput = document.createElement('input');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('required', '');
    form.appendChild(emailInput);
    const ampForm = new AmpForm(form);
    sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
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

    ampForm.handleSubmit_(event);
    // Check validity should always be called regardless of novalidate.
    expect(form.checkValidity).to.be.called;

    // However reporting validity shouldn't happen when novalidate.
    expect(emailInput.reportValidity).to.not.be.called;
    expect(form.hasAttribute('amp-novalidate')).to.be.true;
  });

  it('should check validity and report when invalid', () => {
    setReportValiditySupportedForTesting(false);
    return getAmpForm().then(ampForm => {
      const form = ampForm.form_;
      const emailInput = document.createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      form.appendChild(emailInput);
      sandbox.spy(form, 'checkValidity');
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

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
      expect(event.stopImmediatePropagation).to.be.called;
      expect(form.checkValidity).to.be.called;
      expect(ampForm.xhr_.fetchJson).to.not.be.called;

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
      expect(ampForm.xhr_.fetchJson).to.not.be.called;

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
      return timer.promise(10).then(() => {
        expect(ampForm.xhr_.fetchJson).to.have.been.called;
      });
    });
  });

  it('should not check validity if .checkValidity is not supported', () => {
    setCheckValiditySupportedForTesting(false);
    return getAmpForm().then(ampForm => {
      const form = ampForm.form_;
      const emailInput = document.createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      form.appendChild(emailInput);
      sandbox.spy(form, 'checkValidity');
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());

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

      ampForm.handleSubmit_(event);
      return timer.promise(1).then(() => {
        expect(event.stopImmediatePropagation).to.not.be.called;
        expect(form.checkValidity).to.not.be.called;
        expect(ampForm.xhr_.fetchJson).to.be.called;
      });
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
      return timer.promise(1).then(() => {
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
  });

  it('should block multiple submissions and disable buttons', () => {
    return getAmpForm(true, true, true).then(ampForm => {
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
      const button3 = form.querySelectorAll('button[type=submit]')[0];
      expect(button1.hasAttribute('disabled')).to.be.false;
      expect(button2.hasAttribute('disabled')).to.be.false;
      expect(button3.hasAttribute('disabled')).to.be.false;
      ampForm.handleSubmit_(event);
      expect(ampForm.state_).to.equal('submitting');
      return timer.promise(1).then(() => {
        expect(ampForm.xhr_.fetchJson.calledOnce).to.be.true;
        expect(button1.hasAttribute('disabled')).to.be.true;
        expect(button2.hasAttribute('disabled')).to.be.true;
        ampForm.handleSubmit_(event);
        ampForm.handleSubmit_(event);
        expect(event.preventDefault.called).to.be.true;
        expect(event.preventDefault.callCount).to.equal(3);
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
  });

  it('should manage form state classes (submitting, success)', () => {
    return getAmpForm().then(ampForm => {
      let fetchJsonResolver;
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(new Promise(resolve => {
        fetchJsonResolver = resolve;
      }));
      sandbox.stub(ampForm, 'analyticsEvent_');
      sandbox.stub(ampForm.actions_, 'trigger');
      const form = ampForm.form_;
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      expect(event.preventDefault).to.be.called;
      expect(ampForm.state_).to.equal('submitting');
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonResolver();
      return timer.promise(5).then(() => {
        expect(ampForm.state_).to.equal('submit-success');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.contain('amp-form-submit-success');
        expect(ampForm.actions_.trigger).to.be.called;
        expect(ampForm.actions_.trigger.calledWith(
            form, 'submit-success', null)).to.be.true;
        expect(ampForm.analyticsEvent_).to.be.calledWith(
            'amp-form-submit-success');
      });
    });
  });

  it('should manage form state classes (submitting, error)', () => {
    return getAmpForm(true, true).then(ampForm => {
      let fetchJsonRejecter;
      sandbox.stub(ampForm, 'analyticsEvent_');
      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(new Promise((unusedResolve, reject) => {
            fetchJsonRejecter = reject;
          }));
      sandbox.stub(ampForm.actions_, 'trigger');
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
      expect(event.preventDefault).to.be.called;
      expect(event.stopImmediatePropagation).to.not.be.called;
      expect(ampForm.state_).to.equal('submitting');
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonRejecter();
      return timer.promise(5).then(() => {
        expect(button1.hasAttribute('disabled')).to.be.false;
        expect(button2.hasAttribute('disabled')).to.be.false;
        expect(ampForm.state_).to.equal('submit-error');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-success');
        expect(form.className).to.contain('amp-form-submit-error');
        expect(ampForm.actions_.trigger).to.be.called;
        expect(ampForm.actions_.trigger.calledWith(
            form, 'submit-error', null)).to.be.true;
        expect(ampForm.analyticsEvent_).to.be.calledWith(
            'amp-form-submit-error');
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
      let renderedTemplate = document.createElement('div');
      renderedTemplate.innerText = 'Error: hello there';
      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(Promise.reject({responseJson: {message: 'hello there'}}));
      sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
          .returns(Promise.resolve(renderedTemplate));
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };

      const errors = [];
      const realSetTimeout = window.setTimeout;
      sandbox.stub(window, 'setTimeout', (callback, delay) => {
        realSetTimeout(() => {
          try {
            callback();
          } catch (e) {
            errors.push(e);
          }
        }, delay);
      });
      ampForm.handleSubmit_(event);
      const findTemplateStub = ampForm.templates_.findAndRenderTemplate;
      return timer.promise(5).then(() => {
        expect(findTemplateStub).to.be.called;
        expect(findTemplateStub).to.have.been.calledWith(
            errorContainer, {message: 'hello there'});
        // Check that form has a rendered div with class .submit-error-message.
        renderedTemplate = form.querySelector('[i-amp-rendered]');
        expect(renderedTemplate).to.not.be.null;
        expect(errors.length).to.be.equal(1);
        expect(errors[0].message).to.match(/Form submission failed/);
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

      sandbox.stub(ampForm.xhr_, 'fetchJson')
          .returns(Promise.resolve({'message': 'What What'}));
      sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
          .returns(Promise.resolve(newRender));
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      ampForm.handleSubmit_(event);
      return timer.promise(5).then(() => {
        expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
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
        return timer.promise(1).then(() => {
          expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
          expect(ampForm.xhr_.fetchJson).to.be.calledWith(
              'https://example.com?name=John%20Miller');

          const xhrCall = ampForm.xhr_.fetchJson.getCall(0);
          const config = xhrCall.args[1];
          expect(config.body).to.be.undefined;
          expect(config.method).to.equal('GET');
          expect(config.credentials).to.equal('include');
          expect(config.requireAmpResponseSourceOrigin).to.be.true;
        });
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
        return timer.promise(1).then(() => {
          expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
          expect(ampForm.xhr_.fetchJson).to.be.calledWith(
              'https://example.com?name=John%20Miller&email=cool%40bea.ns');

          ampForm.setState_('submit-success');
          ampForm.xhr_.fetchJson.reset();
          usernameInput.removeAttribute('disabled');
          usernameInput.value = 'coolbeans';
          emailInput.value = 'cool@bea.ns';
          ampForm.handleSubmit_(event);
          return timer.promise(1).then(() => {
            expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
            expect(ampForm.xhr_.fetchJson).to.be.calledWith(
                'https://example.com?name=John%20Miller&email=cool%40bea.ns&' +
                'nickname=coolbeans');

            ampForm.setState_('submit-success');
            ampForm.xhr_.fetchJson.reset();
            fieldset.disabled = true;
            ampForm.handleSubmit_(event);

            return timer.promise(1).then(() => {
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
              return timer.promise(1).then(() => {
                expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
                expect(ampForm.xhr_.fetchJson).to.be.calledWith(
                    'https://example.com?name=John%20Miller&email=');
              });
            });
          });
        });
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
        return timer.promise(1).then(() => {
          expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
          expect(ampForm.xhr_.fetchJson).to.be.calledWith(
              'https://example.com?name=John%20Miller&name=&name=&' +
              'city=San%20Francisco');

          ampForm.setState_('submit-success');
          ampForm.xhr_.fetchJson.reset();
          foodCB.checked = true;
          footballCB.checked = true;
          ampForm.handleSubmit_(event);
          return timer.promise(1).then(() => {
            expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
            expect(ampForm.xhr_.fetchJson).to.be.calledWith(
                'https://example.com?name=John%20Miller&name=&name=' +
                '&interests=Football&interests=Food&city=San%20Francisco');

            ampForm.setState_('submit-success');
            femaleRadio.checked = true;
            otherName1Input.value = 'John Maller';
            ampForm.xhr_.fetchJson.reset();
            ampForm.handleSubmit_(event);
            return timer.promise(1).then(() => {
              expect(ampForm.xhr_.fetchJson).to.be.calledOnce;
              expect(ampForm.xhr_.fetchJson).to.be.calledWith(
                  'https://example.com?name=John%20Miller&name=John%20Maller' +
                  '&name=&gender=Female&interests=Football&interests=Food&' +
                  'city=San%20Francisco');
            });
          });
        });
      });
    });
  });

  describe('User Validity', () => {
    it('should manage valid/invalid on input/fieldset/form on submit', () => {
      setReportValiditySupportedForTesting(false);
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

        expect(form.checkValidity).to.be.called;
        expect(emailInput.checkValidity).to.be.called;
        expect(fieldset.checkValidity).to.be.called;
        expect(form.className).to.contain('user-invalid');
        expect(emailInput.className).to.contain('user-invalid');
        expect(event.preventDefault).to.be.called;
        expect(event.stopImmediatePropagation).to.be.called;

        emailInput.value = 'cool@bea.ns';
        ampForm.handleSubmit_(event);
        expect(form.className).to.contain('user-valid');
        expect(emailInput.className).to.contain('user-valid');
      });
    });

    it('should manage valid/invalid on input user interaction', () => {
      setReportValiditySupportedForTesting(false);
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
        expect(form.checkValidity).to.be.called;
        expect(emailInput.checkValidity).to.be.called;
        expect(fieldset.checkValidity).to.be.called;
        expect(form.className).to.contain('user-invalid');
        expect(emailInput.className).to.contain('user-invalid');

        // No interaction happened with usernameInput, so no user-class should
        // be added at this point.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');


        emailInput.value = 'cool@bea.ns';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-valid');
        expect(form.className).to.contain('user-invalid');

        // Still no interaction.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');

        // Both inputs back to invalid.
        emailInput.value = 'invalid-value';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-invalid');
        expect(form.className).to.contain('user-invalid');

        // Still no interaction.
        expect(usernameInput.className).to.not.contain('user-invalid');
        expect(usernameInput.className).to.not.contain('user-valid');

        // Only email input is invalid now.
        usernameInput.value = 'coolbeans';
        onInputInteraction_({target: usernameInput});
        expect(emailInput.className).to.contain('user-invalid');
        expect(form.className).to.contain('user-invalid');
        expect(usernameInput.className).to.contain('user-valid');

        // Both input are finally valid.
        emailInput.value = 'cool@bea.ns';
        onInputInteraction_({target: emailInput});
        expect(emailInput.className).to.contain('user-valid');
        expect(usernameInput.className).to.contain('user-valid');
        expect(form.className).to.contain('user-valid');
      });
    });

    it('should propagates user-valid only when going from invalid', () => {
      setReportValiditySupportedForTesting(false);
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

        expect(emailInput.checkValidity).to.be.called;
        expect(form.checkValidity).to.not.be.called;
        expect(fieldset.checkValidity).to.not.be.called;
        expect(emailInput.className).to.contain('user-valid');
        expect(form.className).to.not.contain('user-valid');
      });
    });
  });

  it('should install action handler and handle submit action', () => {
    const form = getForm();
    const actions = actionServiceForDoc(form.ownerDocument);
    sandbox.stub(actions, 'installActionHandler');
    const ampForm = new AmpForm(form);
    sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
    expect(actions.installActionHandler).to.be.calledWith(form);
    sandbox.spy(ampForm, 'handleSubmit_');
    ampForm.actionHandler_({method: 'anything'});
    expect(ampForm.handleSubmit_).to.have.not.been.called;
    ampForm.actionHandler_({method: 'submit'});
    expect(ampForm.handleSubmit_).to.have.been.called;
  });

  describe('Var Substitution', () => {

    it('should substitute hidden fields variables in XHR async', () => {
      return getAmpForm().then(ampForm => {
        const form = ampForm.form_;
        const clientIdField = document.createElement('input');
        clientIdField.setAttribute('name', 'clientId');
        clientIdField.setAttribute('type', 'hidden');
        clientIdField.setAttribute('default-value', 'CLIENT_ID(form)');
        form.appendChild(clientIdField);
        const canonicalUrlField = document.createElement('input');
        canonicalUrlField.setAttribute('name', 'clientId');
        canonicalUrlField.setAttribute('type', 'hidden');
        canonicalUrlField.setAttribute('default-value', 'CANONICAL_URL');
        form.appendChild(canonicalUrlField);
        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
        sandbox.spy(ampForm.urlReplacement_, 'expandStringAsync');
        sandbox.stub(ampForm.urlReplacement_, 'expandStringSync');
        ampForm.handleSubmit_();
        expect(ampForm.xhr_.fetchJson).to.have.not.been.called;
        expect(ampForm.urlReplacement_.expandStringSync)
            .to.not.have.been.called;
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledTwice;
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledWith('CLIENT_ID(form)');
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledWith('CANONICAL_URL');
        return timer.promise(10).then(() => {
          expect(ampForm.xhr_.fetchJson).to.be.called;
          expect(clientIdField.value).to.match(/amp-\w+/);
          expect(canonicalUrlField.value).to.equal('about%3Asrcdoc');
        });
      });
    });

    it('should send request if vars did not resolve after a timeout', () => {
      return getAmpForm().then(ampForm => {
        const expandAsyncStringResolvers = [];
        const form = ampForm.form_;
        const clientIdField = document.createElement('input');
        clientIdField.setAttribute('name', 'clientId');
        clientIdField.setAttribute('type', 'hidden');
        clientIdField.setAttribute('default-value', 'CLIENT_ID(form)');
        form.appendChild(clientIdField);
        const canonicalUrlField = document.createElement('input');
        canonicalUrlField.setAttribute('name', 'clientId');
        canonicalUrlField.setAttribute('type', 'hidden');
        canonicalUrlField.setAttribute('default-value', 'CANONICAL_URL');
        form.appendChild(canonicalUrlField);
        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
        sandbox.stub(ampForm.urlReplacement_, 'expandStringAsync')
            .returns(new Promise(resolve => {
              expandAsyncStringResolvers.push(resolve);
            }));
        sandbox.stub(ampForm.urlReplacement_, 'expandStringSync');
        ampForm.handleSubmit_();
        expect(ampForm.xhr_.fetchJson).to.have.not.been.called;
        expect(ampForm.urlReplacement_.expandStringSync)
            .to.not.have.been.called;
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledTwice;
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledWith(
            'CLIENT_ID(form)');
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.have.been.calledWith(
            'CANONICAL_URL');
        return timer.promise(210).then(() => {
          expect(ampForm.xhr_.fetchJson).to.be.called;
          expect(clientIdField.value).to.equal('');
          expect(canonicalUrlField.value).to.equal('');
        });
      });
    });

    it('should substitute hidden fields variables in non-XHR via sync', () => {
      return getAmpForm().then(ampForm => {
        const form = ampForm.form_;
        ampForm.method_ = 'GET';
        ampForm.xhrAction_ = null;
        const clientIdField = document.createElement('input');
        clientIdField.setAttribute('name', 'clientId');
        clientIdField.setAttribute('type', 'hidden');
        clientIdField.setAttribute('default-value', 'CLIENT_ID(form)');
        form.appendChild(clientIdField);
        const canonicalUrlField = document.createElement('input');
        canonicalUrlField.setAttribute('name', 'clientId');
        canonicalUrlField.setAttribute('type', 'hidden');
        canonicalUrlField.setAttribute('default-value', 'CANONICAL_URL');
        form.appendChild(canonicalUrlField);
        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
        sandbox.stub(ampForm.urlReplacement_, 'expandStringAsync');
        sandbox.spy(ampForm.urlReplacement_, 'expandStringSync');
        ampForm.handleSubmit_();
        expect(ampForm.urlReplacement_.expandStringAsync)
            .to.not.have.been.called;
        expect(ampForm.urlReplacement_.expandStringSync).to.have.been.called;
        expect(ampForm.urlReplacement_.expandStringSync)
            .to.have.been.calledWith('CLIENT_ID(form)');
        expect(ampForm.urlReplacement_.expandStringSync)
            .to.have.been.calledWith('CANONICAL_URL');
        return timer.promise(10).then(() => {
          expect(clientIdField.value).to.equal('');
          expect(canonicalUrlField.value).to.equal('about%3Asrcdoc');
        });
      });
    });
  });

});
