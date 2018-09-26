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

import '../../../amp-mustache/0.1/amp-mustache';
import '../../../amp-selector/0.1/amp-selector';
import * as xhrUtils from '../../../../src/utils/xhr-utils';
import {AmpEvents} from '../../../../src/amp-events';
import {
  AmpForm,
  AmpFormService,
  checkUserValidityAfterInteraction_,
} from '../amp-form';
import {FormDataWrapper} from '../../../../src/form-data-wrapper';
import {Services} from '../../../../src/services';
import {
  cidServiceForDocForTesting,
} from '../../../../src/service/cid-impl';
import {fromIterator} from '../../../../src/utils/array';
import {
  setCheckValiditySupportedForTesting,
  setReportValiditySupportedForTesting,
} from '../form-validators';
import {user} from '../../../../src/log';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.repeated('', {
  'single ampdoc': {ampdoc: 'single'},
  'shadow ampdoc': {ampdoc: 'shadow'},
}, (name, variant) => {

  describes.realWin('amp-form', {
    amp: {
      runtimeOn: true,
      ampdoc: variant.ampdoc,
      extensions: ['amp-form', 'amp-selector'], // amp-form is installed as service.
    },
  }, env => {

    let sandbox;
    let document;
    let timer;
    let createElement;
    let createTextNode;

    beforeEach(() => {
      sandbox = env.sandbox;
      document = env.ampdoc.getRootNode();
      timer = Services.timerFor(env.win);
      const ownerDoc = document.ownerDocument || document;
      createElement = ownerDoc.createElement.bind(ownerDoc);
      createTextNode = ownerDoc.createTextNode.bind(ownerDoc);

      // Force sync mutateElement to make testing easier.
      const resources = Services.resourcesForDoc(env.ampdoc);
      sandbox.stub(resources, 'mutateElement').callsArg(1);
    });

    afterEach(() => sandbox.restore());

    function getAmpForm(form, canonical = 'https://example.com/amps.html') {
      new AmpFormService(env.ampdoc);
      Services.documentInfoForDoc(env.ampdoc).canonicalUrl = canonical;
      cidServiceForDocForTesting(env.ampdoc);
      env.ampdoc.getBody().appendChild(form);
      const ampForm = new AmpForm(form, 'amp-form-test-id');
      sandbox.stub(ampForm.ssrTemplateHelper_, 'isSupported').returns(false);
      return Promise.resolve(ampForm);
    }

    function getForm(button1 = true, button2 = false,
      button3 = false) {
      const form = createElement('form');
      form.setAttribute('method', 'POST');

      const nameInput = createElement('input');
      nameInput.setAttribute('name', 'name');
      nameInput.setAttribute('value', 'John Miller');
      form.appendChild(nameInput);
      form.setAttribute('action-xhr', 'https://example.com');
      form.setAttribute('action', 'https://example.com');

      if (button1) {
        const submitBtn = createElement('input');
        submitBtn.setAttribute('type', 'submit');
        form.appendChild(submitBtn);
      }

      if (button2) {
        const submitBtn = createElement('input');
        submitBtn.setAttribute('type', 'submit');
        form.appendChild(submitBtn);
      }

      if (button3) {
        const submitBtn = createElement('button');
        submitBtn.setAttribute('type', 'submit');
        form.appendChild(submitBtn);
      }

      return form;
    }

    function getVerificationForm() {
      const form = getForm();
      form.setAttribute('verify-xhr', '');
      return form;
    }

    afterEach(() => {
      // Reset supported state for checkValidity and reportValidity.
      setCheckValiditySupportedForTesting(undefined);
      setReportValiditySupportedForTesting(undefined);
    });

    describe('Server side template rendering', () => {
      let ampForm;
      let event;
      beforeEach(() => {
        ampForm = getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          form.id = 'registration';
          event = {
            stopImmediatePropagation: sandbox.spy(),
            target: form,
            preventDefault: sandbox.spy(),
          };
          const emailInput = createElement('input');
          emailInput.setAttribute('name', 'email');
          emailInput.setAttribute('type', 'email');
          emailInput.setAttribute('value', 'j@hnmiller.com');
          form.appendChild(emailInput);

          ampForm.method_ = 'GET';
          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm, 'analyticsEvent_');
          sandbox.stub(ampForm.ssrTemplateHelper_, 'isSupported').returns(true);

          return ampForm;
        });
      });

      it('should throw error if using non-xhr get', () => {
        ampForm.then(ampForm => {
          ampForm.xhrAction_ = null;
          const errorRe =
            /Non-XHR GETs not supported./;
          allowConsoleError(() => {
            expect(() => ampForm.handleSubmitEvent_(event)).to.throw(errorRe);
          });
        });
      });

      it('should server side render templates if enabled', () => {
        const setupAMPCors = sandbox.spy(xhrUtils, 'setupAMPCors');
        const fromStructuredCloneable =
            sandbox.spy(xhrUtils, 'fromStructuredCloneable');
        const verifyAmpCORSHeaders =
            sandbox.spy(xhrUtils, 'verifyAmpCORSHeaders');
        ampForm.then(ampForm => {
          const form = ampForm.form_;
          const template = createElement('template');
          template.setAttribute('type', 'amp-mustache');
          template.content.appendChild(createTextNode('Some {{template}}'));
          form.id = 'registration';
          const event = {
            stopImmediatePropagation: sandbox.spy(),
            target: form,
            preventDefault: sandbox.spy(),
          };
          const successTemplateContainer = createElement('div');
          successTemplateContainer.setAttribute('submit-success', '');
          successTemplateContainer.appendChild(template);

          form.appendChild(successTemplateContainer);

          form.xhrAction_ = 'https://www.xhr-action.org';

          sandbox.stub(form.viewer_, 'sendMessageAwaitResponse')
              .returns(
                  Promise.resolve({
                    data: '<div>much success</div>',
                  }));
          const renderedTemplate = createElement('div');
          renderedTemplate.innerText = 'much success';
          sandbox.stub(form.ssrTemplateHelper_.templates_, 'findTemplate')
              .returns(template);
          const fetchAndRenderTemplate = sandbox.stub(
              form.ssrTemplateHelper_, 'fetchAndRenderTemplate');
          sandbox.stub(form.templates_, 'findAndRenderTemplate')
              .onFirstCall().returns(Promise.resolve(renderedTemplate))
              .onSecondCall().returns(Promise.resolve(template));
          ampForm.handleSubmitEvent_(event);
          return whenCalled(fetchAndRenderTemplate)
              .then(() => {
                expect(ampForm.ssrTemplateHelper_.fetchAndRenderTemplate)
                    .to.have.been.called;
                expect(ampForm.ssrTemplateHelper_.fetchAndRenderTemplate)
                    .to.have.been.calledWith(
                        form, sinon.match.func, sinon.match.func);
                sinon.assert.callOrder(
                    setupAMPCors,
                    fromStructuredCloneable,
                    verifyAmpCORSHeaders);
              });
        });
      });
    });

    it('should assert valid action-xhr when provided', () => {
      const form = getForm();
      document.body.appendChild(form);
      form.setAttribute('action-xhr', 'http://example.com');
      allowConsoleError(() => {
        expect(() => new AmpForm(form)).to.throw(
            /form action-xhr must start with/);
      });
      form.setAttribute('action-xhr', 'https://cdn.ampproject.org/example.com');
      allowConsoleError(() => {
        expect(() => new AmpForm(form)).to.throw(
            /form action-xhr should not be on AMP CDN/);
      });
      form.setAttribute('action-xhr', 'https://example.com');
      expect(() => new AmpForm(form)).to.not.throw;
      document.body.removeChild(form);
    });

    it('should assert none of the inputs named __amp_source_origin', () => {
      const form = getForm(/*button1*/ true, /*button2*/ false);
      document.body.appendChild(form);
      const illegalInput = createElement('input');
      illegalInput.setAttribute('type', 'hidden');
      illegalInput.setAttribute('name', '__amp_source_origin');
      illegalInput.value = 'https://example.com';
      form.appendChild(illegalInput);
      allowConsoleError(() => {
        expect(() => new AmpForm(form)).to.throw(
            /Illegal input name, __amp_source_origin found/);
      });
      document.body.removeChild(form);
    });

    it('should listen to submit, blur and input events', () => {
      const form = getForm();
      document.body.appendChild(form);
      form.addEventListener = sandbox.spy();
      form.setAttribute('action-xhr', 'https://example.com');
      new AmpForm(form);
      expect(form.addEventListener).to.be.called;
      expect(form.addEventListener).to.be.calledWith('submit');
      expect(form.addEventListener).to.be.calledWith('blur');
      expect(form.addEventListener).to.be.calledWith('input');
      expect(form.className).to.contain('i-amphtml-form');
      document.body.removeChild(form);
    });

    it('should autofocus elements with the autofocus attribute', () => {
      const form = getForm();
      document.body.appendChild(form);
      sandbox.stub(form, 'addEventListener');
      form.setAttribute('action-xhr', 'https://example.com');
      const button1 = form.querySelector('input');
      button1.setAttribute('autofocus', '');
      new AmpForm(form);

      const viewer = Services.viewerForDoc(env.ampdoc);
      let resolve_ = null;
      sandbox.stub(viewer, 'whenNextVisible').returns(new Promise(resolve => {
        resolve_ = resolve;
      }));

      expect(document.activeElement).to.not.equal(button1);
      resolve_();
      return viewer.whenNextVisible().then(() => {
        expect(document.activeElement).to.equal(button1);
      });
    });

    it('should install proxy', () => {
      const form = getForm();
      document.body.appendChild(form);
      form.setAttribute('action-xhr', 'https://example.com');
      new AmpForm(form);
      expect(form.$p).to.be.ok;
      expect(form.$p.getAttribute('action-xhr')).to.equal(
          'https://example.com');
      document.body.removeChild(form);
    });

    it('should do nothing if already submitted', () => {
      const form = getForm();
      document.body.appendChild(form);
      const ampForm = new AmpForm(form);
      ampForm.state_ = 'submitting';
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };

      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
      sandbox.spy(form, 'checkValidity');
      ampForm.handleSubmitEvent_(event);
      expect(event.stopImmediatePropagation).to.be.called;
      expect(form.checkValidity).to.not.be.called;
      expect(ampForm.xhr_.fetch).to.not.be.called;
      document.body.removeChild(form);
    });

    it('should not trigger amp-form-submit analytics event', () => {
      const form = getForm();
      form.removeAttribute('action-xhr');
      document.body.appendChild(form);
      const ampForm = new AmpForm(form);
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
      sandbox.stub(ampForm, 'analyticsEvent_');
      sandbox.spy(form, 'checkValidity');
      const errorRe =
        /Only XHR based \(via action-xhr attribute\) submissions are supported/;
      allowConsoleError(() => {
        expect(() => ampForm.handleSubmitEvent_(event)).to.throw(errorRe);
      });
      expect(event.preventDefault).to.be.called;
      expect(ampForm.analyticsEvent_).to.have.not.been.called;
      document.body.removeChild(form);
    });

    it('should respect novalidate on a form', () => {
      setReportValiditySupportedForTesting(true);
      const form = getForm();
      document.body.appendChild(form);
      form.setAttribute('novalidate', '');
      const emailInput = createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      form.appendChild(emailInput);
      const ampForm = new AmpForm(form);
      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };

      sandbox.spy(form, 'checkValidity');
      sandbox.spy(emailInput, 'reportValidity');
      ampForm.handleSubmitEvent_(event);
      // Check validity should always be called regardless of novalidate.
      expect(form.checkValidity).to.be.called;

      // However reporting validity shouldn't happen when novalidate.
      expect(emailInput.reportValidity).to.not.be.called;
      expect(form.hasAttribute('amp-novalidate')).to.be.true;
      document.body.removeChild(form);
    });

    it('should throw error if POST non-xhr', () => {
      const form = getForm();
      document.body.appendChild(form);
      form.removeAttribute('action-xhr');
      document.body.appendChild(form);
      const ampForm = new AmpForm(form);
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
      sandbox.spy(form, 'checkValidity');
      const submitErrorRe =
        /Only XHR based \(via action-xhr attribute\) submissions are supported/;
      allowConsoleError(() => {
        expect(() => ampForm.handleSubmitEvent_(event)).to.throw(submitErrorRe);
      });
      expect(event.preventDefault).to.be.called;
      document.body.removeChild(form);
    });

    it('should respect novalidate on a form', () => {
      setReportValiditySupportedForTesting(true);
      const form = getForm();
      document.body.appendChild(form);
      form.setAttribute('novalidate', '');
      const emailInput = createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      form.appendChild(emailInput);
      const ampForm = new AmpForm(form);
      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
      const event = {
        stopImmediatePropagation: sandbox.spy(),
        target: form,
        preventDefault: sandbox.spy(),
      };
      sandbox.spy(form, 'checkValidity');
      sandbox.spy(emailInput, 'reportValidity');

      ampForm.handleSubmitEvent_(event);
      // Check validity should always be called regardless of novalidate.
      expect(form.checkValidity).to.be.called;

      // However reporting validity shouldn't happen when novalidate.
      expect(emailInput.reportValidity).to.not.be.called;
      expect(form.hasAttribute('amp-novalidate')).to.be.true;
      document.body.removeChild(form);
    });

    it('should check validity and report when invalid', () => {
      setReportValiditySupportedForTesting(false);
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        const emailInput = createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        form.appendChild(emailInput);
        sandbox.spy(form, 'checkValidity');
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };

        const bubbleEl = env.ampdoc.getRootNode().querySelector(
            '.i-amphtml-validation-bubble');
        const validationBubble = bubbleEl['__BUBBLE_OBJ'];
        sandbox.spy(validationBubble, 'show');
        sandbox.spy(validationBubble, 'hide');
        ampForm.handleSubmitEvent_(event);
        expect(event.stopImmediatePropagation).to.be.called;
        expect(form.checkValidity).to.be.called;
        expect(ampForm.xhr_.fetch).to.not.be.called;

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
        expect(ampForm.xhr_.fetch).to.not.be.called;

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
        ampForm.handleSubmitEvent_(event);

        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(ampForm.xhr_.fetch).to.have.been.calledOnce;
        });
      });
    });

    it('should not check validity if .checkValidity is not supported', () => {
      setCheckValiditySupportedForTesting(false);
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        const emailInput = createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('required', '');
        form.appendChild(emailInput);
        sandbox.spy(form, 'checkValidity');
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };


        ampForm.handleSubmitEvent_(event);
        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(event.stopImmediatePropagation).to.not.be.called;
          expect(form.checkValidity).to.not.be.called;
          expect(ampForm.xhr_.fetch).to.be.called;
        });
      });
    });

    it('should allow verifying elements with a presubmit request', () => {
      const formPromise = getAmpForm(getVerificationForm());
      const fetchRejectPromise = Promise.reject({
        response: {
          status: 400,
          json() {
            return Promise.resolve({
              verifyErrors: [{
                name: 'name',
                message: 'This name is just wrong.',
              }],
            });
          },
        },
      });

      return formPromise.then(ampForm => {
        sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchRejectPromise);

        const form = ampForm.form_;
        const input = form.name;
        form.name.value = 'Frank';

        return ampForm.verifier_.onCommit().then(() => {
          expect(input.validity.customError).to.be.true;
          expect(input.validationMessage).to.equal('This name is just wrong.');
        });
      });
    });

    it('should only use the more recent verify request', () => {
      const formPromise = getAmpForm(getVerificationForm());

      return formPromise.then(ampForm => {
        const xhrStub = sandbox.stub(ampForm.xhr_, 'fetch');
        xhrStub.onCall(0).returns(Promise.reject({
          response: {
            status: 400,
            json() {
              return Promise.resolve({
                verifyErrors: [{name: 'name', message: 'First request error'}],
              });
            },
          },
        }));
        xhrStub.onCall(1).returns(new Promise((res, reject) => {
          setTimeout(() => {
            reject({
              response: {
                status: 400,
                json() {
                  return Promise.resolve({
                    verifyErrors: [{
                      name: 'name',
                      message: 'Second request error',
                    }],
                  });
                },
              },
            });
          }, 10);
        }));
        const form = ampForm.form_;
        const input = form.name;
        input.value = 'Carlos';

        return ampForm.verifier_.onCommit().then(() => {
          input.value = 'Frank';
          return ampForm.verifier_.onCommit();
        }).then(() => {
          expect(input.validity.customError).to.be.true;
          expect(input.validationMessage).to.equal('Second request error');
        });
      });
    });

    it('should allow rendering responses through inlined templates', () => {
      return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
        const form = ampForm.form_;
        // Add a div[submit-error] with a template child.
        const errorContainer = createElement('div');
        errorContainer.setAttribute('submit-error', '');
        form.appendChild(errorContainer);
        const errorTemplate = createElement('template');
        errorTemplate.setAttribute('type', 'amp-mustache');
        errorTemplate.content.appendChild(createTextNode('Error: {{message}}'));
        errorContainer.appendChild(errorTemplate);
        let renderedTemplate = createElement('div');
        renderedTemplate.innerText = 'Error: hello there';
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.reject({
          response: {
            status: 400,
            json() {
              return Promise.resolve({message: 'hello there'});
            },
          },
        }));
        sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
            .returns(Promise.resolve(renderedTemplate));
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        const findTemplateStub = ampForm.templates_.findAndRenderTemplate;
        expect(ampForm.xhrSubmitPromiseForTesting()).to.eventually.be.rejected;
        return ampForm.xhrSubmitPromiseForTesting().catch(() => {
          expect(findTemplateStub).to.be.called;
          // Template should have rendered an error
          expect(findTemplateStub).to.have.been.calledWith(
              errorContainer, {message: 'hello there'});
          // Check that form has a rendered div with class
          // .submit-error-message.
          renderedTemplate = form.querySelector('[i-amphtml-rendered]');
          expect(renderedTemplate).to.not.be.null;
        });
      });
    });

    it('should allow rendering responses through referenced templates', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;

        const successTemplate = createElement('template');
        successTemplate.id = 'successTemplate';
        successTemplate.setAttribute('type', 'amp-mustache');
        successTemplate.content.appendChild(createTextNode('Hello, {{name}}'));
        form.appendChild(successTemplate);

        const messageContainer = createElement('div');
        messageContainer.id = 'message';
        messageContainer.setAttribute('submit-success', '');
        messageContainer.setAttribute('template', 'successTemplate');
        form.appendChild(messageContainer);
        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(Promise.resolve({
              json: () => {
                return Promise.resolve({'name': 'John Smith'});
              },
            }));
        const renderedTemplate = createElement('div');
        renderedTemplate.innerText = 'Hello, John Smith';
        sandbox.stub(ampForm.templates_, 'findAndRenderTemplate')
            .returns(Promise.resolve(renderedTemplate));
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        return whenCalled(ampForm.templates_.findAndRenderTemplate).then(() => {
          return ampForm.renderTemplatePromiseForTesting();
        }).then(() => {
          expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
          expect(ampForm.templates_.findAndRenderTemplate.calledWith(
              messageContainer, {'name': 'John Smith'})).to.be.true;
          expect(messageContainer.firstChild).to.equal(renderedTemplate);
        });
      });
    });

    it('should replace previously rendered responses', () => {
      return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
        const form = ampForm.form_;
        const successContainer = createElement('div');
        successContainer.setAttribute('submit-success', '');
        form.appendChild(successContainer);
        const successTemplate = createElement('template');
        successTemplate.setAttribute('type', 'amp-mustache');
        successTemplate.content.appendChild(
            createTextNode('Success: {{message}}'));
        successContainer.appendChild(successTemplate);
        const renderedTemplate = createElement('div');
        renderedTemplate.innerText = 'Success: hello';
        renderedTemplate.setAttribute('i-amphtml-rendered', '');
        successContainer.appendChild(renderedTemplate);
        ampForm.state_ = 'submit-success';

        const newRender = createElement('div');
        newRender.innerText = 'New Success: What What';

        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(Promise.resolve({
              json: () => {
                return Promise.resolve({'message': 'What What'});
              },
            }));
        const findAndRenderTemplateStub = sandbox.stub(ampForm.templates_,
            'findAndRenderTemplate');
        findAndRenderTemplateStub.returns(Promise.resolve(newRender));
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        return whenCalled(findAndRenderTemplateStub).then(() => {
          return ampForm.renderTemplatePromiseForTesting();
        }).then(() => {
          expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
          expect(ampForm.templates_.findAndRenderTemplate.calledWith(
              successContainer, {'message': 'What What'})).to.be.true;
          const renderedTemplates = form.querySelectorAll(
              '[i-amphtml-rendered]');
          expect(renderedTemplates[0]).to.not.be.null;
          expect(renderedTemplates.length).to.equal(1);
          expect(renderedTemplates[0]).to.equal(newRender);
        });
      });
    });

    it('should dispatch "amp:template-rendered" event after render', () => {
      return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
        const form = ampForm.form_;

        const successContainer = createElement('div');
        successContainer.setAttribute('submit-success', '');
        form.appendChild(successContainer);
        const successTemplate = createElement('template');
        successTemplate.setAttribute('type', 'amp-mustache');
        successContainer.appendChild(successTemplate);
        const renderedTemplate = createElement('div');

        const spy = sandbox.spy(successContainer, 'dispatchEvent');
        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(Promise.resolve({
              json() {
                return Promise.resolve({'message': 'What What'});
              },
            }));
        const findAndRenderTemplateStub = sandbox.stub(ampForm.templates_,
            'findAndRenderTemplate');
        findAndRenderTemplateStub.returns(Promise.resolve(renderedTemplate));

        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);

        return ampForm.xhrSubmitPromiseForTesting().then(() => {
          return ampForm.renderTemplatePromiseForTesting();
        }).then(() => {
          expect(spy.calledOnce).to.be.true;
          expect(spy).calledWithMatch({
            type: AmpEvents.DOM_UPDATE,
            bubbles: true,
          });
        });
      });
    });

    it('should call fetch with the xhr action and form data', () => {
      return getAmpForm(getForm()).then(ampForm => {
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());

        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        expect(event.preventDefault).to.be.calledOnce;
        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(ampForm.xhr_.fetch).to.be.calledOnce;
          expect(ampForm.xhr_.fetch).to.be.calledWith('https://example.com');

          const xhrCall = ampForm.xhr_.fetch.getCall(0);
          const config = xhrCall.args[1];
          expect(config.body).to.be.an.instanceof(FormDataWrapper);
          const entriesInForm =
              fromIterator(new FormDataWrapper(getForm()).entries());
          expect(fromIterator(config.body.entries())).to.have.deep.members(
              entriesInForm);
          expect(config.method).to.equal('POST');
          expect(config.credentials).to.equal('include');
        });
      });
    });

    it('should trigger amp-form-submit analytics event with form data', () => {
      return getAmpForm(getForm()).then(ampForm => {
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        sandbox.stub(ampForm, 'analyticsEvent_');

        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: ampForm.form_,
          preventDefault: sandbox.spy(),
        };
        const expectedFormData = {
          'formId': '',
          'formFields[name]': 'John Miller',
        };
        ampForm.handleSubmitEvent_(event);
        expect(event.preventDefault).to.be.calledOnce;
        whenCalled(ampForm.doVarSubs_).then(() => {
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit',
              expectedFormData
          ) ;
        });
        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(ampForm.xhr_.fetch).to.be.calledOnce;
          expect(ampForm.xhr_.fetch).to.be.calledWith('https://example.com');

          const xhrCall = ampForm.xhr_.fetch.getCall(0);
          const config = xhrCall.args[1];
          expect(config.body).to.not.be.null;
          expect(config.method).to.equal('POST');
          expect(config.credentials).to.equal('include');
        });
      });
    });

    it('should trigger amp-form-submit after variables substitution', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        const clientIdField = createElement('input');
        clientIdField.setAttribute('name', 'clientId');
        clientIdField.setAttribute('type', 'hidden');
        clientIdField.value = 'CLIENT_ID(form)';
        clientIdField.setAttribute('data-amp-replace', 'CLIENT_ID');
        form.appendChild(clientIdField);
        const canonicalUrlField = createElement('input');
        canonicalUrlField.setAttribute('name', 'canonicalUrl');
        canonicalUrlField.setAttribute('type', 'hidden');
        canonicalUrlField.value = 'CANONICAL_URL';
        canonicalUrlField.setAttribute('data-amp-replace', 'CANONICAL_URL');
        form.appendChild(canonicalUrlField);

        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        sandbox.spy(ampForm.urlReplacement_, 'expandInputValueAsync');
        sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');
        sandbox.stub(ampForm, 'analyticsEvent_');

        ampForm.submit_();
        const expectedFormData = {
          'formId': '',
          'formFields[name]': 'John Miller',
          'formFields[clientId]': sinon.match(/amp-.+/),
          'formFields[canonicalUrl]': 'https%3A%2F%2Fexample.com%2Famps.html',
        };
        expect(ampForm.xhr_.fetch).to.have.not.been.called;
        expect(ampForm.urlReplacement_.expandInputValueSync)
            .to.not.have.been.called;
        expect(ampForm.urlReplacement_.expandInputValueAsync)
            .to.have.been.calledTwice;
        expect(ampForm.urlReplacement_.expandInputValueAsync)
            .to.have.been.calledWith(clientIdField);
        expect(ampForm.urlReplacement_.expandInputValueAsync)
            .to.have.been.calledWith(canonicalUrlField);
        whenCalled(ampForm.doVarSubs_).then(() => {
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit',
              expectedFormData
          ) ;
        });
        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(ampForm.xhr_.fetch).to.be.called;
          expect(clientIdField.value).to.match(/amp-.+/);
          expect(canonicalUrlField.value).to.equal(
              'https%3A%2F%2Fexample.com%2Famps.html');
        });
      });
    });

    it('should block multiple submissions and disable buttons', () => {
      const formPromise = getAmpForm(
          getForm(/*button1*/ true, /*button2*/ true, /*button3*/true));
      return formPromise.then(ampForm => {
        let fetchResolver;
        sandbox.stub(ampForm.xhr_, 'fetch').returns(
            new Promise(resolve => fetchResolver = resolve));

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

        ampForm.handleSubmitEvent_(event);
        expect(ampForm.state_).to.equal('submitting');

        return whenCalled(ampForm.xhr_.fetch).then(() => {
          expect(ampForm.xhr_.fetch.calledOnce).to.be.true;
          expect(button1.hasAttribute('disabled')).to.be.true;
          expect(button2.hasAttribute('disabled')).to.be.true;

          ampForm.handleSubmitEvent_(event);
          ampForm.handleSubmitEvent_(event);
          expect(event.preventDefault.called).to.be.true;
          expect(event.preventDefault).to.have.callCount(3);
          expect(event.stopImmediatePropagation).to.have.callCount(2);
          expect(ampForm.xhr_.fetch.calledOnce).to.be.true;
          expect(form.className).to.contain('amp-form-submitting');
          expect(form.className).to.not.contain('amp-form-submit-error');
          expect(form.className).to.not.contain('amp-form-submit-success');
          fetchResolver({json: () => Promise.resolve()});
          sandbox.stub(ampForm, 'maybeHandleRedirect_');

          return whenCalled(ampForm.maybeHandleRedirect_).then(() => {
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
      return getAmpForm(getForm()).then(ampForm => {
        let fetchResolver;
        sandbox.stub(ampForm.xhr_, 'fetch').returns(new Promise(resolve => {
          fetchResolver = resolve;
        }));
        sandbox.stub(ampForm, 'analyticsEvent_');
        sandbox.stub(ampForm.actions_, 'trigger');
        const form = ampForm.form_;
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        expect(event.preventDefault).to.be.called;
        expect(ampForm.state_).to.equal('submitting');
        expect(form.className).to.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.not.contain('amp-form-submit-success');
        fetchResolver({json: () => Promise.resolve()});

        return ampForm.xhrSubmitPromiseForTesting().then(() => {
          expect(ampForm.actions_.trigger).to.be.called;
          expect(ampForm.actions_.trigger).to.be.calledWith(form, 'submit');
          expect(ampForm.state_).to.equal('submit-success');
          expect(form.className).to.not.contain('amp-form-submitting');
          expect(form.className).to.not.contain('amp-form-submit-error');
          expect(form.className).to.contain('amp-form-submit-success');
          expect(ampForm.actions_.trigger).to.be.called;
          expect(ampForm.actions_.trigger).to.be.calledWith(
              form, 'submit-success',
              /** CustomEvent */ sinon.match.has('detail'));
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit-success');
        }, () => {
          assert.fail('Submit should have succeeded.');
        });
      });
    });

    it('should manage form state classes (submitting, error)', () => {
      return getAmpForm(getForm(
          /*button1*/ true, /*button2*/ true)).then(ampForm => {
        let fetchRejecter;
        sandbox.stub(ampForm, 'analyticsEvent_');
        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(new Promise((unusedResolve, reject) => {
              fetchRejecter = reject;
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
        ampForm.handleSubmitEvent_(event);
        expect(button1.hasAttribute('disabled')).to.be.true;
        expect(button2.hasAttribute('disabled')).to.be.true;
        expect(event.preventDefault).to.be.called;
        expect(event.stopImmediatePropagation).to.not.be.called;
        expect(ampForm.state_).to.equal('submitting');
        expect(form.className).to.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.not.contain('amp-form-submit-success');
        fetchRejecter();

        return ampForm.xhrSubmitPromiseForTesting().then(() => {
          assert.fail('Submit should have failed.');
        }, () => {
          expect(button1.hasAttribute('disabled')).to.be.false;
          expect(button2.hasAttribute('disabled')).to.be.false;
          expect(ampForm.state_).to.equal('submit-error');
          expect(form.className).to.not.contain('amp-form-submitting');
          expect(form.className).to.not.contain('amp-form-submit-success');
          expect(form.className).to.contain('amp-form-submit-error');
          expect(ampForm.actions_.trigger).to.be.called;
          expect(ampForm.actions_.trigger.calledWith(
              form,
              'submit-error',
              /** CustomEvent */ sinon.match.has('detail'))).to.be.true;
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit-error');
        });
      });
    });

    describe('GET requests', () => {
      it('should allow GET submissions', () => {
        return getAmpForm(getForm()).then(ampForm => {
          ampForm.method_ = 'GET';
          ampForm.form_.setAttribute('method', 'GET');

          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          const event = {
            stopImmediatePropagation: sandbox.spy(),
            target: ampForm.form_,
            preventDefault: sandbox.spy(),
          };
          ampForm.handleSubmitEvent_(event);
          expect(event.preventDefault).to.be.calledOnce;
          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.xhr_.fetch).to.be.calledOnce;
            expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com?name=John%20Miller');

            const xhrCall = ampForm.xhr_.fetch.getCall(0);
            const config = xhrCall.args[1];
            expect(config.body).to.be.undefined;
            expect(config.method).to.equal('GET');
            expect(config.credentials).to.equal('include');
          });
        });
      });

      it('should not send disabled or nameless inputs', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          form.setAttribute('method', 'GET');

          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          const fieldset = createElement('fieldset');
          const emailInput = createElement('input');
          emailInput.setAttribute('name', 'email');
          emailInput.setAttribute('type', 'email');
          emailInput.setAttribute('required', '');
          fieldset.appendChild(emailInput);
          const usernameInput = createElement('input');
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
          ampForm.handleSubmitEvent_(event);
          expect(event.preventDefault).to.be.calledOnce;
          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.xhr_.fetch).to.be.calledOnce;
            expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com?name=John%20Miller&email=cool%40bea.ns');

            ampForm.setState_('submit-success');

            ampForm.xhr_.fetch.reset();
            usernameInput.removeAttribute('disabled');
            usernameInput.value = 'coolbeans';
            emailInput.value = 'cool@bea.ns';
            ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                  'https://example.com?name=John%20Miller&email=cool%40bea.ns&' +
                  'nickname=coolbeans');

              ampForm.setState_('submit-success');
              ampForm.xhr_.fetch.reset();
              fieldset.disabled = true;
              ampForm.handleSubmitEvent_(event);

              return whenCalled(ampForm.xhr_.fetch).then(() => {
                expect(ampForm.xhr_.fetch).to.be.calledOnce;
                expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller');

                ampForm.setState_('submit-success');
                ampForm.xhr_.fetch.reset();

                fieldset.removeAttribute('disabled');
                usernameInput.removeAttribute('name');
                emailInput.removeAttribute('required');
                emailInput.value = '';
                ampForm.handleSubmitEvent_(event);

                return whenCalled(ampForm.xhr_.fetch).then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                      'https://example.com?name=John%20Miller&email=');
                });
              });
            });
          });
        });
      });


      it('should properly serialize inputs to query params', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          form.setAttribute('method', 'GET');

          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());

          const otherNamesFS = createElement('fieldset');
          const otherName1Input = createElement('input');
          otherName1Input.setAttribute('name', 'name');
          otherNamesFS.appendChild(otherName1Input);
          const otherName2Input = createElement('input');
          otherName2Input.setAttribute('name', 'name');
          otherNamesFS.appendChild(otherName2Input);
          form.appendChild(otherNamesFS);

          // Group of Radio buttons.
          const genderFS = createElement('fieldset');
          const maleRadio = createElement('input');
          maleRadio.setAttribute('type', 'radio');
          maleRadio.setAttribute('name', 'gender');
          maleRadio.setAttribute('value', 'Male');
          genderFS.appendChild(maleRadio);
          const femaleRadio = createElement('input');
          femaleRadio.setAttribute('type', 'radio');
          femaleRadio.setAttribute('name', 'gender');
          femaleRadio.setAttribute('value', 'Female');
          genderFS.appendChild(femaleRadio);
          form.appendChild(genderFS);

          // Group of Checkboxes.
          const interestsFS = createElement('fieldset');
          const basketballCB = createElement('input');
          basketballCB.setAttribute('type', 'checkbox');
          basketballCB.setAttribute('name', 'interests');
          basketballCB.setAttribute('value', 'Basketball');
          interestsFS.appendChild(basketballCB);
          const footballCB = createElement('input');
          footballCB.setAttribute('type', 'checkbox');
          footballCB.setAttribute('name', 'interests');
          footballCB.setAttribute('value', 'Football');
          interestsFS.appendChild(footballCB);
          const foodCB = createElement('input');
          foodCB.setAttribute('type', 'checkbox');
          foodCB.setAttribute('name', 'interests');
          foodCB.setAttribute('value', 'Food');
          interestsFS.appendChild(foodCB);
          form.appendChild(interestsFS);

          // Select w/ options.
          const citySelect = createElement('select');
          citySelect.setAttribute('name', 'city');
          const sfOption = createElement('option');
          sfOption.setAttribute('value', 'San Francisco');
          citySelect.appendChild(sfOption);
          const mtvOption = createElement('option');
          mtvOption.setAttribute('value', 'Mountain View');
          citySelect.appendChild(mtvOption);
          const nyOption = createElement('option');
          nyOption.setAttribute('value', 'New York');
          citySelect.appendChild(nyOption);
          form.appendChild(citySelect);

          const event = {
            stopImmediatePropagation: sandbox.spy(),
            target: ampForm.form_,
            preventDefault: sandbox.spy(),
          };

          ampForm.handleSubmitEvent_(event);
          expect(event.preventDefault).to.be.calledOnce;

          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.xhr_.fetch).to.be.calledOnce;
            expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com?name=John%20Miller&name=&name=&' +
                'city=San%20Francisco');

            ampForm.setState_('submit-success');
            ampForm.xhr_.fetch.reset();
            foodCB.checked = true;
            footballCB.checked = true;
            ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                  'https://example.com?name=John%20Miller&name=&name=' +
                  '&interests=Football&interests=Food&city=San%20Francisco');

              ampForm.setState_('submit-success');
              femaleRadio.checked = true;
              otherName1Input.value = 'John Maller';
              ampForm.xhr_.fetch.reset();

              ampForm.handleSubmitEvent_(event);
              return whenCalled(ampForm.xhr_.fetch).then(() => {
                expect(ampForm.xhr_.fetch).to.be.calledOnce;
                expect(ampForm.xhr_.fetch).to.be.calledWith(
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
        expectAsyncConsoleError(/Form submission failed/);
        setReportValiditySupportedForTesting(false);
        return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
          const form = ampForm.form_;
          const fieldset = createElement('fieldset');
          const emailInput = createElement('input');
          emailInput.setAttribute('name', 'email');
          emailInput.setAttribute('type', 'email');
          emailInput.setAttribute('required', '');
          fieldset.appendChild(emailInput);
          form.appendChild(fieldset);
          sandbox.spy(form, 'checkValidity');
          sandbox.spy(emailInput, 'checkValidity');
          sandbox.spy(fieldset, 'checkValidity');

          const event = {
            target: ampForm.form_,
            stopImmediatePropagation: sandbox.spy(),
            preventDefault: sandbox.spy(),
          };
          ampForm.handleSubmitEvent_(event);

          expect(form.checkValidity).to.be.called;
          expect(emailInput.checkValidity).to.be.called;
          expect(fieldset.checkValidity).to.be.called;
          expect(form.className).to.contain('user-invalid');
          expect(emailInput.className).to.contain('user-invalid');
          expect(event.preventDefault).to.be.called;
          expect(event.stopImmediatePropagation).to.be.called;

          emailInput.value = 'cool@bea.ns';
          ampForm.handleSubmitEvent_(event);
          expect(form.className).to.contain('user-valid');
          expect(emailInput.className).to.contain('user-valid');
        });
      });

      it('should manage valid/invalid on input user interaction', () => {
        setReportValiditySupportedForTesting(false);
        return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
          const form = ampForm.form_;
          const fieldset = createElement('fieldset');
          const emailInput = createElement('input');
          emailInput.setAttribute('name', 'email');
          emailInput.setAttribute('type', 'email');
          emailInput.setAttribute('required', '');
          fieldset.appendChild(emailInput);
          const usernameInput = createElement('input');
          usernameInput.setAttribute('name', 'nickname');
          usernameInput.setAttribute('required', '');
          fieldset.appendChild(usernameInput);
          form.appendChild(fieldset);
          sandbox.spy(form, 'checkValidity');
          sandbox.spy(emailInput, 'checkValidity');
          sandbox.spy(fieldset, 'checkValidity');
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());

          checkUserValidityAfterInteraction_(emailInput);
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
          checkUserValidityAfterInteraction_(emailInput);
          expect(emailInput.className).to.contain('user-valid');
          expect(form.className).to.contain('user-invalid');

          // Still no interaction.
          expect(usernameInput.className).to.not.contain('user-invalid');
          expect(usernameInput.className).to.not.contain('user-valid');

          // Both inputs back to invalid.
          emailInput.value = 'invalid-value';
          checkUserValidityAfterInteraction_(emailInput);
          expect(emailInput.className).to.contain('user-invalid');
          expect(form.className).to.contain('user-invalid');

          // Still no interaction.
          expect(usernameInput.className).to.not.contain('user-invalid');
          expect(usernameInput.className).to.not.contain('user-valid');

          // Only email input is invalid now.
          usernameInput.value = 'coolbeans';
          checkUserValidityAfterInteraction_(usernameInput);
          expect(emailInput.className).to.contain('user-invalid');
          expect(form.className).to.contain('user-invalid');
          expect(usernameInput.className).to.contain('user-valid');

          // Both input are finally valid.
          emailInput.value = 'cool@bea.ns';
          checkUserValidityAfterInteraction_(emailInput);
          expect(emailInput.className).to.contain('user-valid');
          expect(usernameInput.className).to.contain('user-valid');
          expect(form.className).to.contain('user-valid');
        });
      });

      it('should propagates user-valid only when going from invalid', () => {
        setReportValiditySupportedForTesting(false);
        return getAmpForm(getForm(/*button1*/ true)).then(ampForm => {
          const form = ampForm.form_;
          const fieldset = createElement('fieldset');
          const emailInput = createElement('input');
          emailInput.setAttribute('name', 'email');
          emailInput.setAttribute('type', 'email');
          emailInput.setAttribute('required', '');
          fieldset.appendChild(emailInput);
          form.appendChild(fieldset);
          sandbox.spy(form, 'checkValidity');
          sandbox.spy(emailInput, 'checkValidity');
          sandbox.spy(fieldset, 'checkValidity');
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());

          emailInput.value = 'cool@bea.ns';
          checkUserValidityAfterInteraction_(emailInput);

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
      document.body.appendChild(form);
      const actions = Services.actionServiceForDoc(env.ampdoc);

      sandbox.stub(actions, 'installActionHandler');
      const ampForm = new AmpForm(form);
      sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());

      expect(actions.installActionHandler).to.be.calledWith(form);
      sandbox.spy(ampForm, 'handleSubmitAction_');
      ampForm.actionHandler_({method: 'anything'});
      expect(ampForm.handleSubmitAction_).to.have.not.been.called;
      ampForm.actionHandler_({method: 'submit'});

      return whenCalled(ampForm.xhr_.fetch).then(() => {
        expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;
        document.body.removeChild(form);
      });
    });

    it('should handle clear action and restore initial values', () => {
      const form = getForm();
      document.body.appendChild(form);

      const emailInput = createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('id', 'email');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('value', 'jack@poc.com');
      form.appendChild(emailInput);

      return getAmpForm(form).then(ampForm => {
        const initalFormValues = ampForm.getFormAsObject_();

        ampForm.form_.elements.name.value = 'Jack Sparrow';

        sandbox.spy(ampForm, 'handleClearAction_');
        ampForm.actionHandler_({method: 'anything'});
        expect(ampForm.handleClearAction_).to.have.not.been.called;

        expect(ampForm.getFormAsObject_()).to.not.deep.equal(initalFormValues);
        ampForm.actionHandler_({method: 'clear'});
        expect(ampForm.handleClearAction_).to.have.been.called;

        expect(ampForm.getFormAsObject_()).to.deep.equal(initalFormValues);
      });
    });

    it('should remove all form state classes when form is cleared', () => {
      const form = getForm();
      form.setAttribute('method', 'GET');
      document.body.appendChild(form);

      form.setAttribute('custom-validation-reporting', 'show-all-on-submit');

      const fieldset = createElement('fieldset');
      const usernameInput = createElement('input');
      usernameInput.setAttribute('name', 'username');
      usernameInput.setAttribute('id', 'username');
      usernameInput.setAttribute('type', 'text');
      usernameInput.setAttribute('required', '');
      usernameInput.setAttribute('value', 'Jack Sparrow');
      fieldset.appendChild(usernameInput);

      const emailInput = createElement('input');
      emailInput.setAttribute('name', 'email');
      emailInput.setAttribute('id', 'email1');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('required', '');
      emailInput.setAttribute('value', '');
      fieldset.appendChild(emailInput);

      const validationMessage = createElement('span');
      validationMessage.setAttribute('visible-when-invalid', 'valueMissing');
      validationMessage.setAttribute('validation-for', 'email1');
      fieldset.appendChild(validationMessage);

      form.appendChild(fieldset);

      return getAmpForm(form).then(ampForm => {
        // trigger form validations
        ampForm.checkValidity_();
        const formValidator = ampForm.validator_;
        // show validity message
        formValidator.report();

        expect(usernameInput.className).to.contain('user-valid');
        expect(emailInput.className).to.contain('user-invalid');
        expect(emailInput.className).to.contain('valueMissing');
        expect(fieldset.className).to.contain('user-valid');
        expect(ampForm.form_.className).to.contain('user-invalid');
        expect(validationMessage.className).to.contain('visible');

        ampForm.handleClearAction_();

        expect(usernameInput.className).to.not.contain('user-valid');
        expect(emailInput.className).to.not.contain('user-invalid');
        expect(emailInput.className).to.not.contain('valueMissing');
        expect(fieldset.className).to.not.contain('user-valid');
        expect(ampForm.form_.className).to.contain('amp-form-initial');
        expect(validationMessage.className).to.not.contain('visible');
      });
    });

    it('should submit after timeout of waiting for amp-selector', function() {
      expectAsyncConsoleError(/Form submission failed/);
      this.timeout(3000);
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        const selector = createElement('amp-selector');
        selector.setAttribute('name', 'color');
        form.appendChild(selector);

        sandbox.stub(selector, 'whenBuilt')
            .returns(new Promise(unusedResolve => {}));
        sandbox.spy(ampForm, 'handleSubmitAction_');

        ampForm.actionHandler_({method: 'submit'});
        expect(ampForm.handleSubmitAction_).to.have.not.been.called;
        return timer.promise(1).then(() => {
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;
          return timer.promise(2000);
        }).then(() => {
          expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;
        });
      });
    });

    it('should wait for amp-selector to build before submitting', () => {
      return getAmpForm(getForm()).then(ampForm => {
        let builtPromiseResolver_;
        const form = ampForm.form_;
        const selector = createElement('amp-selector');
        selector.setAttribute('name', 'color');
        form.appendChild(selector);

        sandbox.stub(selector, 'whenBuilt').returns(new Promise(resolve => {
          builtPromiseResolver_ = resolve;
        }));
        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(Promise.resolve());
        sandbox.spy(ampForm, 'handleSubmitAction_');

        ampForm.actionHandler_({method: 'submit'});
        expect(ampForm.handleSubmitAction_).to.have.not.been.called;
        return timer.promise(1).then(() => {
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;
          return timer.promise(100);
        }).then(() => {
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;
          builtPromiseResolver_();
          return timer.promise(1);
        }).then(() => {
          expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;
        });
      });
    });

    describe('Var Substitution', () => {
      it('should substitute hidden fields variables in XHR async', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          const clientIdField = createElement('input');
          clientIdField.setAttribute('name', 'clientId');
          clientIdField.setAttribute('type', 'hidden');
          clientIdField.value = 'CLIENT_ID(form)';
          clientIdField.setAttribute('data-amp-replace', 'CLIENT_ID');
          form.appendChild(clientIdField);
          const canonicalUrlField = createElement('input');
          canonicalUrlField.setAttribute('name', 'clientId');
          canonicalUrlField.setAttribute('type', 'hidden');
          canonicalUrlField.value = 'CANONICAL_URL';
          canonicalUrlField.setAttribute('data-amp-replace', 'CANONICAL_URL');
          form.appendChild(canonicalUrlField);

          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          sandbox.stub(ampForm, 'handleSubmitSuccess_');
          sandbox.spy(ampForm.urlReplacement_, 'expandInputValueAsync');
          sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');

          ampForm.submit_();
          expect(ampForm.xhr_.fetch).to.have.not.been.called;
          expect(ampForm.urlReplacement_.expandInputValueSync)
              .to.not.have.been.called;
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledTwice;
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledWith(clientIdField);
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledWith(canonicalUrlField);
          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.xhr_.fetch).to.be.called;
            expect(clientIdField.value).to.match(/amp-.+/);
            expect(canonicalUrlField.value).to.equal(
                'https%3A%2F%2Fexample.com%2Famps.html');
          });
        });
      });

      it('should send request if vars did not resolve after a timeout', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const expandAsyncStringResolvers = [];
          const form = ampForm.form_;
          const clientIdField = createElement('input');
          clientIdField.setAttribute('name', 'clientId');
          clientIdField.setAttribute('type', 'hidden');
          clientIdField.setAttribute('data-amp-replace', 'CLIENT_ID');
          clientIdField.value = 'CLIENT_ID(form)';
          form.appendChild(clientIdField);
          const canonicalUrlField = createElement('input');
          canonicalUrlField.setAttribute('name', 'clientId');
          canonicalUrlField.setAttribute('type', 'hidden');
          canonicalUrlField.setAttribute('data-amp-replace', 'CANONICAL_URL');
          canonicalUrlField.value = 'CANONICAL_URL';
          form.appendChild(canonicalUrlField);

          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          sandbox.stub(ampForm, 'handleSubmitSuccess_');
          sandbox.stub(ampForm.urlReplacement_, 'expandInputValueAsync')
              .returns(new Promise(resolve => {
                expandAsyncStringResolvers.push(resolve);
              }));
          sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');

          ampForm.submit_();
          expect(ampForm.xhr_.fetch).to.have.not.been.called;
          expect(ampForm.urlReplacement_.expandInputValueSync)
              .to.not.have.been.called;
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledTwice;
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledWith(clientIdField);
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.have.been.calledWith(canonicalUrlField);

          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.xhr_.fetch).to.be.called;
            expect(clientIdField.value).to.equal('CLIENT_ID(form)');
            expect(canonicalUrlField.value).to.equal('CANONICAL_URL');
          });
        });
      });

      it('should substitute hidden fields variables ' +
          'in non-XHR via sync', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          ampForm.xhrAction_ = null;
          const clientIdField = createElement('input');
          clientIdField.setAttribute('name', 'clientId');
          clientIdField.setAttribute('type', 'hidden');
          clientIdField.setAttribute('data-amp-replace', 'CLIENT_ID');
          clientIdField.value = 'CLIENT_ID(form)';
          form.appendChild(clientIdField);
          const canonicalUrlField = createElement('input');
          canonicalUrlField.setAttribute('name', 'clientId');
          canonicalUrlField.setAttribute('type', 'hidden');
          canonicalUrlField.setAttribute('data-amp-replace', 'CANONICAL_URL');
          canonicalUrlField.value = 'CANONICAL_URL';
          form.appendChild(canonicalUrlField);

          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm, 'handleSubmitSuccess_');
          sandbox.stub(ampForm.urlReplacement_, 'expandInputValueAsync');
          sandbox.spy(ampForm.urlReplacement_, 'expandInputValueSync');

          ampForm.handleSubmitAction_(/* invocation */ {});
          expect(ampForm.urlReplacement_.expandInputValueAsync)
              .to.not.have.been.called;
          expect(ampForm.urlReplacement_.expandInputValueSync)
              .to.have.been.called;
          expect(ampForm.urlReplacement_.expandInputValueSync)
              .to.have.been.calledWith(clientIdField);
          expect(ampForm.urlReplacement_.expandInputValueSync)
              .to.have.been.calledWith(canonicalUrlField);

          return whenCalled(form.submit).then(() => {
            expect(form.submit).to.have.been.calledOnce;
            expect(clientIdField.value).to.equal('');
            expect(canonicalUrlField.value).to.equal(
                'https%3A%2F%2Fexample.com%2Famps.html');
          });
        });
      });
    });

    describes.fakeWin('XHR', {
      amp: {
        ampdoc: 'single',
      },
      win: {
        location: 'https://example.com',
        top: {
          location: 'https://example-top.com',
        },
      },
    }, () => {
      let form;
      let ampForm;
      let redirectToValue;
      const headersMock = {
        get: header => {
          if (header == 'AMP-Redirect-To') {
            return redirectToValue;
          }
        },
      };
      const fetchResolvePromise = Promise.resolve({
        json: () => Promise.resolve(),
        headers: headersMock,
      });
      const error = new Error('Error');
      error.response = {
        headers: headersMock,
        json() {
          return Promise.resolve();
        },
      };
      const fetchRejectPromise = Promise.reject(error);
      fetchRejectPromise.catch(() => {
        // Just avoiding a global uncaught promise exception.
      });
      let navigateTo;

      beforeEach(() => {
        form = getForm();
        document.body.appendChild(form);
        sandbox.stub(form, 'checkValidity').returns(true);
        ampForm = new AmpForm(form);
        ampForm.target_ = '_top';

        navigateTo = sandbox.spy();
        sandbox.stub(Services, 'navigationForDoc').returns({navigateTo});
        sandbox.stub(ampForm.ssrTemplateHelper_, 'isSupported').returns(false);
      });

      describe('AMP-Redirect-To', () => {
        it('should redirect users if header is set', () => {
          sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchResolvePromise);
          redirectToValue = 'https://google.com/';
          ampForm.handleSubmitAction_(/* invocation */ {});

          expect(navigateTo).to.not.be.called;
          return ampForm.xhrSubmitPromiseForTesting().then(() => {
            expect(navigateTo).to.be.calledOnce;
            const {args} = navigateTo.firstCall;
            expect(args[1]).to.equal('https://google.com/');
            expect(args[2]).to.equal('AMP-Redirect-To');
          });
        });

        it('should fail to redirect to non-secure urls', () => {
          sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchResolvePromise);
          redirectToValue = 'http://google.com/';
          ampForm.handleSubmitAction_(/* invocation */ {});

          // Make it a sync error for testing convenience
          sandbox.stub(user(), 'assert').throws();

          return ampForm.xhrSubmitPromiseForTesting().then(() => {
            assert.fail('Submit should have failed.');
          }, () => {
            expect(navigateTo).to.not.be.called;
          });
        });

        it('should fail to redirect to non-absolute urls', () => {
          sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchResolvePromise);
          redirectToValue = '/hello';
          ampForm.handleSubmitAction_(/* invocation */ {});

          // Make it a sync error for testing convenience
          sandbox.stub(user(), 'assert').throws();

          return ampForm.xhrSubmitPromiseForTesting().then(() => {
            assert.fail('Submit should have failed.');
          }, () => {
            expect(navigateTo).to.not.be.called;
          });
        });

        it('should fail to redirect to when target != _top', () => {
          ampForm.target_ = '_blank';
          sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchResolvePromise);
          redirectToValue = 'http://google.com/';
          ampForm.handleSubmitAction_(/* invocation */ {});


          // Make it a sync error for testing convenience
          sandbox.stub(user(), 'assert').throws();

          return ampForm.xhrSubmitPromiseForTesting().then(() => {
            assert.fail('Submit should have failed.');
          }, () => {
            expect(navigateTo).to.not.be.called;
          });
        });

        it('should redirect on error and header is set', () => {
          sandbox.stub(ampForm.xhr_, 'fetch').returns(fetchRejectPromise);
          redirectToValue = 'https://example2.com/hello';
          const logSpy = sandbox.stub(user(), 'error');
          ampForm.handleSubmitAction_(/* invocation */ {});

          expect(navigateTo).to.not.be.called;
          return ampForm.xhrSubmitPromiseForTesting().then(() => {
            expect(logSpy).to.be.calledOnce;
            const error = logSpy.getCall(0).args[1];
            expect(error).to.match(/Form submission failed/);

            expect(navigateTo).to.be.calledOnce;
            const {args} = navigateTo.firstCall;
            expect(args[1]).to.equal('https://example2.com/hello');
            expect(args[2]).to.equal('AMP-Redirect-To');
          });
        });
      });
    });

    describe('non-XHR GET', () => {
      it('should execute form submit when not triggered through event', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          ampForm.xhrAction_ = null;
          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          ampForm.handleSubmitAction_(/* invocation */ {});
          expect(form.submit).to.have.been.called;
        });
      });

      it('should not execute form submit when triggered through event', () => {
        return getAmpForm(getForm()).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          ampForm.xhrAction_ = null;
          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          const event = {
            stopImmediatePropagation: sandbox.spy(),
            target: form,
            preventDefault: sandbox.spy(),
          };
          ampForm.handleSubmitEvent_(event);
          expect(form.submit).to.have.not.been.called;
        });
      });

      it('should not execute form submit with password field present', () => {
        const form = getForm();
        const input = createElement('input');
        input.type = 'password';
        form.appendChild(input);

        return getAmpForm(form).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          ampForm.xhrAction_ = null;
          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          allowConsoleError(() => {
            expect(() => ampForm.handleSubmitAction_(/* invocation */ {}))
                .to.throw('input[type=password]');
          });
          expect(form.submit).to.have.not.been.called;
        });
      });

      it('should not execute form submit with file field present', () => {
        const form = getForm();
        const input = createElement('input');
        input.type = 'file';
        form.appendChild(input);

        return getAmpForm(form).then(ampForm => {
          const form = ampForm.form_;
          ampForm.method_ = 'GET';
          ampForm.xhrAction_ = null;
          sandbox.stub(form, 'submit');
          sandbox.stub(form, 'checkValidity').returns(true);
          sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
          allowConsoleError(() => {
            expect(() => ampForm.handleSubmitAction_(/* invocation */ {}))
                .to.throw('input[type=file]');
          });
          expect(form.submit).to.have.not.been.called;
        });
      });
    });

    it('should trigger amp-form-submit analytics event with form data', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        form.id = 'registration';

        const emailInput = createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('value', 'j@hnmiller.com');
        form.appendChild(emailInput);

        const unnamedInput = createElement('input');
        unnamedInput.setAttribute('type', 'text');
        unnamedInput.setAttribute('value', 'unnamed');
        form.appendChild(unnamedInput);

        ampForm.method_ = 'GET';
        ampForm.xhrAction_ = null;
        sandbox.stub(form, 'submit');
        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        sandbox.stub(ampForm, 'analyticsEvent_');
        ampForm.handleSubmitAction_(/* invocation */ {});
        const expectedFormData = {
          'formId': 'registration',
          'formFields[name]': 'John Miller',
          'formFields[email]': 'j@hnmiller.com',
        };
        expect(form.submit).to.have.been.called;
        expect(ampForm.analyticsEvent_).to.be.calledWith(
            'amp-form-submit',
            expectedFormData
        );
      });
    });

    it('should trigger submit-success analytics event with form data', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        form.id = 'registration';

        const emailInput = createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('value', 'j@hnmiller.com');
        form.appendChild(emailInput);

        const unnamedInput = createElement('input');
        unnamedInput.setAttribute('type', 'text');
        unnamedInput.setAttribute('value', 'unnamed');
        form.appendChild(unnamedInput);

        let fetchResolver;
        sandbox.stub(ampForm.xhr_, 'fetch').returns(new Promise(resolve => {
          fetchResolver = resolve;
        }));
        sandbox.stub(ampForm, 'analyticsEvent_');
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        expect(ampForm.state_).to.equal('submitting');
        fetchResolver({json: () => Promise.resolve()});

        const expectedFormData = {
          'formId': 'registration',
          'formFields[name]': 'John Miller',
          'formFields[email]': 'j@hnmiller.com',
        };

        return ampForm.xhrSubmitPromiseForTesting().then(() => {
          expect(ampForm.state_).to.equal('submit-success');
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit-success',
              expectedFormData
          );
        }, () => {
          assert.fail('Submit should have succeeded.');
        });

      });
    });

    it('should trigger submit-error analytics event with form data', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        form.id = 'registration';

        const emailInput = createElement('input');
        emailInput.setAttribute('name', 'email');
        emailInput.setAttribute('type', 'email');
        emailInput.setAttribute('value', 'j@hnmiller.com');
        form.appendChild(emailInput);

        const unnamedInput = createElement('input');
        unnamedInput.setAttribute('type', 'text');
        unnamedInput.setAttribute('value', 'unnamed');
        form.appendChild(unnamedInput);

        let fetchRejecter;
        sandbox.stub(ampForm.xhr_, 'fetch')
            .returns(new Promise((unusedResolve, reject) => {
              fetchRejecter = reject;
            }));
        sandbox.stub(ampForm, 'analyticsEvent_');
        const event = {
          stopImmediatePropagation: sandbox.spy(),
          target: form,
          preventDefault: sandbox.spy(),
        };
        ampForm.handleSubmitEvent_(event);
        expect(ampForm.state_).to.equal('submitting');
        fetchRejecter();

        const expectedFormData = {
          'formId': 'registration',
          'formFields[name]': 'John Miller',
          'formFields[email]': 'j@hnmiller.com',
        };

        return ampForm.xhrSubmitPromiseForTesting().then(() => {
          assert.fail('Submit should have failed.');
        }, () => {
          expect(ampForm.state_).to.equal('submit-error');
          expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit-error',
              expectedFormData
          );
        });

      });
    });

    it('should trigger amp-form-submit after variables substitution', () => {
      return getAmpForm(getForm()).then(ampForm => {
        const form = ampForm.form_;
        form.id = 'registration';
        ampForm.method_ = 'GET';
        ampForm.xhrAction_ = null;
        const clientIdField = createElement('input');
        clientIdField.setAttribute('name', 'clientId');
        clientIdField.setAttribute('type', 'hidden');
        clientIdField.setAttribute('data-amp-replace', 'CLIENT_ID');
        clientIdField.value = 'CLIENT_ID(form)';
        form.appendChild(clientIdField);
        const canonicalUrlField = createElement('input');
        canonicalUrlField.setAttribute('name', 'canonicalUrl');
        canonicalUrlField.setAttribute('type', 'hidden');
        canonicalUrlField.setAttribute('data-amp-replace', 'CANONICAL_URL');
        canonicalUrlField.value = 'CANONICAL_URL';
        form.appendChild(canonicalUrlField);

        sandbox.stub(form, 'submit');
        sandbox.stub(form, 'checkValidity').returns(true);
        sandbox.stub(ampForm.xhr_, 'fetch').returns(Promise.resolve());
        sandbox.stub(ampForm.urlReplacement_, 'expandInputValueAsync');
        sandbox.spy(ampForm.urlReplacement_, 'expandInputValueSync');
        sandbox.stub(ampForm, 'analyticsEvent_');
        ampForm.handleSubmitAction_(/* invocation */ {});

        const expectedFormData = {
          'formId': 'registration',
          'formFields[name]': 'John Miller',
          'formFields[canonicalUrl]': 'https%3A%2F%2Fexample.com%2Famps.html',
          'formFields[clientId]': '',
        };
        expect(ampForm.analyticsEvent_).to.be.calledWith(
            'amp-form-submit',
            expectedFormData
        );
        expect(ampForm.urlReplacement_.expandInputValueAsync)
            .to.not.have.been.called;
        expect(ampForm.urlReplacement_.expandInputValueSync)
            .to.have.been.called;
        expect(ampForm.urlReplacement_.expandInputValueSync)
            .to.have.been.calledWith(clientIdField);
        expect(ampForm.urlReplacement_.expandInputValueSync)
            .to.have.been.calledWith(canonicalUrlField);

        return whenCalled(form.submit).then(() => {
          expect(form.submit).to.have.been.calledOnce;
          expect(clientIdField.value).to.equal('');
          expect(canonicalUrlField.value).to.equal(
              'https%3A%2F%2Fexample.com%2Famps.html');
        });
      });
    });
  });
});
