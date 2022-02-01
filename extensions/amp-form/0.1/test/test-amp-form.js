import '../../../amp-mustache/0.1/amp-mustache';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {
  AsyncInputAttributes_Enum,
  AsyncInputClasses_Enum,
} from '#core/constants/async-input';
import {createElementWithAttributes} from '#core/dom';
import {fromIterator} from '#core/types/array';
import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';
import {cidServiceForDocForTesting} from '#service/cid-impl';

import {createCustomEvent} from '#utils/event-helper';
import {user} from '#utils/log';
import * as xhrUtils from '#utils/xhr-utils';

import {whenCalled} from '#testing/helpers/service';

import {
  createFormDataWrapper,
  isFormDataWrapper,
} from '../../../../src/form-data-wrapper';
import {AmpSelector} from '../../../amp-selector/0.1/amp-selector';
import {
  AmpForm,
  AmpFormService,
  checkUserValidityAfterInteraction_,
} from '../amp-form';
import {DIRTINESS_INDICATOR_CLASS} from '../form-dirtiness';
import {
  setCheckValiditySupportedForTesting,
  setReportValiditySupportedForTesting,
} from '../form-validators';

describes.repeated(
  '',
  {
    'single ampdoc': {ampdoc: 'single'},
    'shadow ampdoc': {ampdoc: 'shadow'},
  },
  (name, variant) => {
    describes.realWin(
      'amp-form',
      {
        amp: {
          runtimeOn: true,
          ampdoc: variant.ampdoc,
          extensions: ['amp-form', 'amp-selector'], // amp-form is installed as service.
        },
      },
      (env) => {
        let document;
        let timer;
        let createElement;
        let createTextNode;
        let mutateElementStub;

        beforeEach(() => {
          document = env.ampdoc.getRootNode();
          timer = Services.timerFor(env.win);
          const ownerDoc = document.ownerDocument || document;
          createElement = (tagName, attrs) =>
            createElementWithAttributes(ownerDoc, tagName, attrs);
          createTextNode = ownerDoc.createTextNode.bind(ownerDoc);

          // Force sync mutateElement to make testing easier.
          const mutator = Services.mutatorForDoc(env.ampdoc);
          mutateElementStub = env.sandbox
            .stub(mutator, 'mutateElement')
            .callsArg(1);

          // This needs to be stubbed to stop the function from,
          // hanging and timing out on tests that make proper XHR requests
          env.sandbox
            .stub(xhrUtils, 'getViewerInterceptResponse')
            .resolves(null);
        });

        afterEach(() => env.sandbox.restore());

        function getAmpForm(form, canonical = 'https://example.com/amps.html') {
          new AmpFormService(env.ampdoc);
          Services.documentInfoForDoc(env.ampdoc).canonicalUrl = canonical;
          const cidService = cidServiceForDocForTesting(env.ampdoc);
          env.sandbox.stub(cidService, 'get').resolves('amp-cid');
          env.ampdoc.getBody().appendChild(form);
          const ampForm = new AmpForm(form, 'amp-form-test-id');
          env.sandbox
            .stub(ampForm.ssrTemplateHelper_, 'isEnabled')
            .returns(false);
          env.sandbox.stub(ampForm, 'analyticsEvent_');
          return Promise.resolve(ampForm);
        }

        function getForm(button1 = true, button2 = false, button3 = false) {
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
          const form = getForm(/*button1*/ false);
          form.setAttribute('verify-xhr', '');

          const noVerifyInput = createElement('input');
          noVerifyInput.id = 'noVerify';
          noVerifyInput.setAttribute('name', 'noVerify');
          noVerifyInput.setAttribute('type', 'text');
          noVerifyInput.setAttribute('no-verify', '');
          form.appendChild(noVerifyInput); // This one is not required

          return form;
        }

        function getAmpFormWithAsyncInput(includeRequiredAction) {
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;

            // Create our async input element
            // With the required fields
            const asyncInput = createElement('amp-mock-async-input');
            asyncInput.classList.add(AsyncInputClasses_Enum.ASYNC_INPUT);
            asyncInput.setAttribute(
              AsyncInputAttributes_Enum.NAME,
              'mock-async-input'
            );

            // Create stubs that can be used for observing the async input
            const asyncInputValue = 'async-input-value';
            const getValueStub = env.sandbox.stub().resolves(asyncInputValue);
            asyncInput.getImpl = () =>
              Promise.resolve({
                getValue: getValueStub,
              });

            form.appendChild(asyncInput);

            if (includeRequiredAction) {
              // Create our async input element
              // With the required fields
              const asyncInputRequiredAction = createElement(
                'amp-mock-async-input-required-action'
              );
              asyncInputRequiredAction.classList.add(
                AsyncInputClasses_Enum.ASYNC_INPUT
              );
              asyncInputRequiredAction.classList.add(
                AsyncInputClasses_Enum.ASYNC_REQUIRED_ACTION
              );
              asyncInput.setAttribute(
                AsyncInputAttributes_Enum.NAME,
                'mock-async-input-required-action'
              );

              // Create stubs that can be used for observing the async input
              const asyncInputValueRequiredAction =
                'async-input-value-required-action';
              const getValueStubRequiredAction = env.sandbox
                .stub()
                .resolves(asyncInputValueRequiredAction);
              asyncInputRequiredAction.getImpl = () =>
                Promise.resolve({
                  getValue: getValueStubRequiredAction,
                });

              form.appendChild(asyncInputRequiredAction);

              return Promise.resolve({
                ampForm,
                getValueStubRequiredAction,
              });
            }
            return Promise.resolve({
              ampForm,
              asyncInput,
              asyncInputValue,
              getValueStub,
            });
          });
        }

        afterEach(() => {
          // Reset supported state for checkValidity and reportValidity.
          setCheckValiditySupportedForTesting(undefined);
          setReportValiditySupportedForTesting(undefined);
        });

        describe('Server side template rendering', () => {
          let getSsrAmpFormPromise;
          let event;

          beforeEach(() => {
            getSsrAmpFormPromise = getAmpForm(getForm()).then((ampForm) => {
              const form = ampForm.form_;
              form.id = 'registration';
              event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };
              const emailInput = createElement('input');
              emailInput.setAttribute('name', 'email');
              emailInput.setAttribute('type', 'email');
              emailInput.setAttribute('value', 'j@hnmiller.com');
              form.appendChild(emailInput);

              ampForm.method_ = 'GET';
              env.sandbox.stub(form, 'submit');
              env.sandbox.stub(form, 'checkValidity').returns(true);
              ampForm.ssrTemplateHelper_.isEnabled.restore();
              env.sandbox
                .stub(ampForm.ssrTemplateHelper_, 'isEnabled')
                .returns(true);
              env.sandbox
                .stub(ampForm.viewer_, 'isTrustedViewer')
                .returns(Promise.resolve(true));

              return ampForm;
            });
          });

          it('should throw error if using non-xhr get', () => {
            return getSsrAmpFormPromise.then((ampForm) => {
              ampForm.xhrAction_ = null;

              const errorRe = /Non-XHR GETs not supported./;
              expectAsyncConsoleError(errorRe);
              return Promise.resolve()
                .then(() => ampForm.handleSubmitEvent_(event))
                .then(
                  () => Promise.reject(),
                  () => Promise.resolve()
                );
            });
          });

          it('should server side render submit-success template if enabled', () => {
            env.sandbox.spy(xhrUtils, 'setupInput');
            env.sandbox.spy(xhrUtils, 'setupAMPCors');
            env.sandbox.stub(xhrUtils, 'fromStructuredCloneable');

            return getSsrAmpFormPromise.then((ampForm) => {
              const form = ampForm.form_;
              const template = createElement('template');
              template.setAttribute('type', 'amp-mustache');
              template.content.appendChild(createTextNode('Some {{template}}'));
              form.id = 'registration';
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };
              const successTemplateContainer = createElement('div');
              successTemplateContainer.setAttribute('submit-success', '');
              successTemplateContainer.appendChild(template);

              form.appendChild(successTemplateContainer);

              form.xhrAction_ = 'https://www.xhr-action.org';

              env.sandbox
                .stub(ampForm.viewer_, 'sendMessageAwaitResponse')
                .resolves({
                  data: {html: '<div>much success</div>'},
                });
              const renderedTemplate = createElement('div');
              renderedTemplate.innerText = 'much success';
              env.sandbox
                .stub(ampForm.ssrTemplateHelper_.templates_, 'findTemplate')
                .returns(template);

              const ssr = env.sandbox.stub(ampForm.ssrTemplateHelper_, 'ssr');
              const response = {
                init: {status: 200},
                html: '<div>much success</div>',
                body: '{"message": "hello"}',
              };
              ssr
                .onFirstCall()
                .resolves(response)
                .onSecondCall()
                .resolves(response);

              const handleSubmitEventPromise =
                ampForm.handleSubmitEvent_(event);
              return whenCalled(ssr)
                .then(() => {
                  expect(ampForm.ssrTemplateHelper_.ssr).to.have.been.called;
                  expect(
                    ampForm.ssrTemplateHelper_.ssr
                  ).to.have.been.calledWith(
                    form,
                    env.sandbox.match.object,
                    env.sandbox.match.object
                  );
                  return handleSubmitEventPromise;
                })
                .then(() => {
                  expect(ampForm.state_).to.equal('submit-success');
                  expect(form.className).to.not.contain('amp-form-submitting');
                  expect(form.className).to.contain('amp-form-submit-success');
                  expect(form.className).not.to.contain(
                    'amp-form-submit-error'
                  );
                });
            });
          });

          it('should server side render submit-error template if enabled', () => {
            env.sandbox.spy(xhrUtils, 'setupInput');
            env.sandbox.spy(xhrUtils, 'setupAMPCors');
            env.sandbox.stub(xhrUtils, 'fromStructuredCloneable');

            return getSsrAmpFormPromise.then((ampForm) => {
              const form = ampForm.form_;
              const template = createElement('template');
              template.setAttribute('type', 'amp-mustache');
              template.content.appendChild(createTextNode('Some {{template}}'));
              form.id = 'registration';
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };
              const errorTemplateContainer = createElement('div');
              errorTemplateContainer.setAttribute('submit-error', '');
              errorTemplateContainer.appendChild(template);

              form.appendChild(errorTemplateContainer);

              form.xhrAction_ = 'https://www.xhr-action.org';

              env.sandbox
                .stub(ampForm.viewer_, 'sendMessageAwaitResponse')
                .resolves({
                  data: {
                    html: '<div>much error</div>',
                  },
                });
              const renderedTemplate = createElement('div');
              renderedTemplate.innerText = 'much error';
              env.sandbox
                .stub(ampForm.ssrTemplateHelper_.templates_, 'findTemplate')
                .returns(template);

              const ssr = env.sandbox.stub(ampForm.ssrTemplateHelper_, 'ssr');
              const response = {
                init: {status: 404},
                html: '<div>much error</div>',
                body: '{"message": "error"}',
              };
              ssr
                .onFirstCall()
                .resolves(response)
                .onSecondCall()
                .resolves(response);

              const handleSubmitEventPromise =
                ampForm.handleSubmitEvent_(event);
              return whenCalled(ssr)
                .then(() => {
                  expect(ampForm.ssrTemplateHelper_.ssr).to.have.been.called;
                  expect(
                    ampForm.ssrTemplateHelper_.ssr
                  ).to.have.been.calledWith(
                    form,
                    env.sandbox.match.object,
                    env.sandbox.match.object
                  );
                  return handleSubmitEventPromise;
                })
                .then(() => {
                  expect(ampForm.state_).to.equal('submit-error');
                  expect(form.className).to.not.contain('amp-form-submitting');
                  expect(form.className).to.not.contain(
                    'amp-form-submit-success'
                  );
                  expect(form.className).to.contain('amp-form-submit-error');
                });
            });
          });

          it('should set html bypassing mustache rendering', () => {
            env.sandbox.spy(xhrUtils, 'setupInput');
            env.sandbox.spy(xhrUtils, 'setupAMPCors');
            env.sandbox.stub(xhrUtils, 'fromStructuredCloneable');

            return getSsrAmpFormPromise.then((ampForm) => {
              const form = ampForm.form_;
              const template = createElement('template');
              template.setAttribute('type', 'amp-mustache');
              template.content.appendChild(createTextNode('Some {{template}}'));
              form.id = 'registration';
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };
              const successTemplateContainer = createElement('div');
              successTemplateContainer.setAttribute('submit-success', '');
              successTemplateContainer.appendChild(template);

              form.appendChild(successTemplateContainer);

              form.xhrAction_ = 'https://www.xhr-action.org';

              env.sandbox
                .stub(ampForm.viewer_, 'sendMessageAwaitResponse')
                .resolves({
                  data: '<div>much success</div>',
                });
              const renderedTemplate = createElement('div');
              renderedTemplate.innerText = 'much success';
              env.sandbox
                .stub(ampForm.ssrTemplateHelper_.templates_, 'findTemplate')
                .returns(template);

              const ssr = env.sandbox.stub(
                ampForm.ssrTemplateHelper_,
                'applySsrOrCsrTemplate'
              );
              ssr
                .onFirstCall()
                .resolves({
                  html: renderedTemplate,
                })
                .onSecondCall()
                .resolves({
                  html: template,
                });

              const renderTemplate = env.sandbox.spy(
                ampForm,
                'renderTemplate_'
              );

              const handleSubmitEventPromise =
                ampForm.handleSubmitEvent_(event);
              return whenCalled(renderTemplate, 2).then(() => {
                expect(ampForm.ssrTemplateHelper_.applySsrOrCsrTemplate).to.have
                  .been.called;
                return handleSubmitEventPromise;
              });
            });
          });
        });

        it('should render template even for unsupported data type', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;

            const successTemplate = createElement('template');
            successTemplate.id = 'successTemplate';
            successTemplate.setAttribute('type', 'amp-mustache');
            successTemplate.content.appendChild(
              createTextNode('Hello, {{name}}')
            );
            form.appendChild(successTemplate);

            const messageContainer = createElement('div');
            messageContainer.id = 'message';
            messageContainer.setAttribute('submit-success', '');
            messageContainer.setAttribute('template', 'successTemplate');
            form.appendChild(messageContainer);
            // Given an unsupported JSON array response.
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json: () => {
                return Promise.resolve([]);
              },
            });
            const renderedTemplate = createElement('div');
            renderedTemplate.innerText = 'Hello,';
            env.sandbox
              .stub(ampForm.templates_, 'findAndRenderTemplate')
              .resolves(renderedTemplate);
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const submitEventPromise = ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.templates_.findAndRenderTemplate)
              .then(() => {
                return ampForm.renderTemplatePromiseForTesting();
              })
              .then(() => {
                expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
                // Expect the template service to render the template with
                // an empty JSON data set.
                expect(
                  ampForm.templates_.findAndRenderTemplate.calledWith(
                    messageContainer,
                    {}
                  )
                ).to.be.true;
                expect(mutateElementStub).to.have.been.calledOnce;
                expect(messageContainer.firstChild).to.equal(renderedTemplate);

                return submitEventPromise;
              });
          });
        });

        it('should fire the form submit service', () => {
          const fireStub = env.sandbox.stub();
          env.sandbox.stub(Services, 'formSubmitForDoc').resolves({
            fire: fireStub,
          });

          const form = getForm();
          return getAmpForm(form).then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_');

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            return ampForm.handleSubmitEvent_(event).then(() => {
              expect(fireStub.calledOnce).to.be.true;
              return expect(fireStub).calledWith({
                form,
                actionXhrMutator: env.sandbox.match.func,
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
              /form action-xhr must start with/
            );
          });
          form.setAttribute(
            'action-xhr',
            'https://cdn.ampproject.org/example.com'
          );
          allowConsoleError(() => {
            expect(() => new AmpForm(form)).to.throw(
              /form action-xhr should not be on AMP CDN/
            );
          });
          form.setAttribute('action-xhr', 'https://example.com');
          expect(() => new AmpForm(form)).to.not.throw();
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
              /Illegal input name, __amp_source_origin found/
            );
          });
          document.body.removeChild(form);
        });

        it('should listen to submit, blur and input events', () => {
          const form = getForm();
          document.body.appendChild(form);
          form.addEventListener = env.sandbox.spy();
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
          env.sandbox.stub(form, 'addEventListener');
          form.setAttribute('action-xhr', 'https://example.com');
          const button1 = form.querySelector('input');
          button1.setAttribute('autofocus', '');
          new AmpForm(form);

          let resolve_ = null;
          env.sandbox.stub(env.ampdoc, 'whenNextVisible').returns(
            new Promise((resolve) => {
              resolve_ = resolve;
            })
          );

          expect(document.activeElement).to.not.equal(button1);
          env.ampdoc.whenNextVisible().then(() => {
            expect(document.activeElement).to.equal(button1);
          });
          return timer.promise(1).then(() => resolve_());
        });

        it('should install proxy', () => {
          const form = getForm();
          document.body.appendChild(form);
          form.setAttribute('action-xhr', 'https://example.com');
          new AmpForm(form);
          expect(form.$p).to.be.ok;
          expect(form.$p.getAttribute('action-xhr')).to.equal(
            'https://example.com'
          );
          document.body.removeChild(form);
        });

        it('should do nothing if already submitted', () => {
          const form = getForm();
          document.body.appendChild(form);
          const ampForm = new AmpForm(form);
          ampForm.state_ = 'submitting';
          const event = {
            stopImmediatePropagation: env.sandbox.spy(),
            target: form,
            preventDefault: env.sandbox.spy(),
          };

          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
          env.sandbox.spy(form, 'checkValidity');
          const submitEventPromise = ampForm.handleSubmitEvent_(event);
          expect(event.stopImmediatePropagation).to.be.called;

          return submitEventPromise.then(() => {
            document.body.removeChild(form);
            expect(form.checkValidity).to.not.be.called;
            expect(ampForm.xhr_.fetch).to.not.be.called;
          });
        });

        it('should not trigger amp-form-submit analytics event', () => {
          const form = getForm();
          form.removeAttribute('action-xhr');
          document.body.appendChild(form);
          const ampForm = new AmpForm(form);
          const event = {
            stopImmediatePropagation: env.sandbox.spy(),
            target: form,
            preventDefault: env.sandbox.spy(),
          };
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
          env.sandbox.stub(ampForm, 'analyticsEvent_');
          env.sandbox.spy(form, 'checkValidity');
          const errorRe =
            /Only XHR based \(via action-xhr attribute\) submissions are supported/;
          expectAsyncConsoleError(errorRe);
          return ampForm.handleSubmitEvent_(event).catch(() => {
            expect(event.preventDefault).to.be.called;
            expect(ampForm.analyticsEvent_).to.have.not.been.called;
            document.body.removeChild(form);
          });
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
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
          const event = {
            stopImmediatePropagation: env.sandbox.spy(),
            target: form,
            preventDefault: env.sandbox.spy(),
          };

          env.sandbox.spy(form, 'checkValidity');
          env.sandbox.spy(emailInput, 'reportValidity');

          env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
          return ampForm.handleSubmitEvent_(event).then(() => {
            expect(form.hasAttribute('amp-novalidate')).to.be.true;
            document.body.removeChild(form);

            // Check validity should always be called regardless of novalidate.
            expect(form.checkValidity).to.be.called;

            // However reporting validity shouldn't happen when novalidate.
            expect(emailInput.reportValidity).to.not.be.called;
          });
        });

        it('should throw error if POST non-xhr', () => {
          const form = getForm();
          document.body.appendChild(form);
          form.removeAttribute('action-xhr');
          document.body.appendChild(form);
          const ampForm = new AmpForm(form);
          const event = {
            stopImmediatePropagation: env.sandbox.spy(),
            target: form,
            preventDefault: env.sandbox.spy(),
          };
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
          env.sandbox.spy(form, 'checkValidity');
          const submitErrorRe =
            /Only XHR based \(via action-xhr attribute\) submissions are supported/;
          expectAsyncConsoleError(submitErrorRe);
          return ampForm.handleSubmitEvent_(event).catch(() => {
            expect(event.preventDefault).to.be.called;
            document.body.removeChild(form);
          });
        });

        it('should check validity and report when invalid', () => {
          setReportValiditySupportedForTesting(false);
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;
            const emailInput = createElement('input');
            emailInput.setAttribute('name', 'email');
            emailInput.setAttribute('type', 'email');
            emailInput.setAttribute('required', '');
            form.appendChild(emailInput);
            env.sandbox.spy(form, 'checkValidity');
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            const bubbleEl = env.ampdoc
              .getRootNode()
              .querySelector('.i-amphtml-validation-bubble');
            const validationBubble = bubbleEl['__BUBBLE_OBJ'];
            env.sandbox.spy(validationBubble, 'show');
            env.sandbox.spy(validationBubble, 'hide');
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

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitEventPromise = ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.have.been.calledOnce;

              return submitEventPromise;
            });
          });
        });

        it('should not check validity if .checkValidity is not supported', () => {
          setCheckValiditySupportedForTesting(false);
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;
            const emailInput = createElement('input');
            emailInput.setAttribute('name', 'email');
            emailInput.setAttribute('type', 'email');
            emailInput.setAttribute('required', '');
            form.appendChild(emailInput);
            env.sandbox.spy(form, 'checkValidity');
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitEventPromise = ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(event.stopImmediatePropagation).to.not.be.called;
              expect(form.checkValidity).to.not.be.called;
              expect(ampForm.xhr_.fetch).to.be.called;

              return submitEventPromise;
            });
          });
        });

        it('should check validity on FORM_VALUE_CHANGE event', () => {
          setCheckValiditySupportedForTesting(true);
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;
            const emailInput = createElement('input');
            emailInput.setAttribute('name', 'email');
            emailInput.setAttribute('required', '');
            form.appendChild(emailInput);
            env.sandbox.spy(form, 'checkValidity');
            env.sandbox.spy(ampForm.validator_, 'onInput');

            const event = createCustomEvent(
              env.win,
              AmpEvents_Enum.FORM_VALUE_CHANGE,
              /* detail */ null,
              {bubbles: true}
            );
            emailInput.dispatchEvent(event);
            expect(form.checkValidity).to.be.called;
            expect(ampForm.validator_.onInput).to.be.calledWith(event);
          });
        });

        it('should allow verifying elements with a presubmit request', () => {
          const formPromise = getAmpForm(getVerificationForm());
          const fetchReject = {
            response: {
              status: 400,
              json() {
                return Promise.resolve({
                  verifyErrors: [
                    {
                      name: 'name',
                      message: 'This name is just wrong.',
                    },
                  ],
                });
              },
            },
          };

          return formPromise.then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').rejects(fetchReject);

            const form = ampForm.form_;
            const input = form.name;
            form.name.value = 'Frank';

            return ampForm.verifier_.onCommit().then(() => {
              expect(input.validity.customError).to.be.true;
              expect(input.validationMessage).to.equal(
                'This name is just wrong.'
              );
            });
          });
        });

        it('should only use the more recent verify request', () => {
          const formPromise = getAmpForm(getVerificationForm());

          return formPromise.then((ampForm) => {
            const xhrStub = env.sandbox.stub(ampForm.xhr_, 'fetch');
            xhrStub.onCall(0).rejects({
              response: {
                status: 400,
                json() {
                  return Promise.resolve({
                    verifyErrors: [
                      {name: 'name', message: 'First request error'},
                    ],
                  });
                },
              },
            });
            xhrStub.onCall(1).rejects({
              response: {
                status: 400,
                json() {
                  return Promise.resolve({
                    verifyErrors: [
                      {
                        name: 'name',
                        message: 'Second request error',
                      },
                    ],
                  });
                },
              },
            });
            const form = ampForm.form_;
            const input = form.name;
            input.value = 'Carlos';

            return ampForm.verifier_
              .onCommit()
              .then(() => {
                input.value = 'Frank';
                return ampForm.verifier_.onCommit();
              })
              .then(() => {
                expect(input.validity.customError).to.be.true;
                expect(input.validationMessage).to.equal(
                  'Second request error'
                );
              });
          });
        });

        it('should not send verifying elements with a no-verify attribute', () => {
          const formPromise = getAmpForm(getVerificationForm());
          const fetchReject = {
            response: {
              status: 400,
              json() {
                return Promise.resolve({
                  verifyErrors: [
                    {
                      name: 'name',
                      message: 'This name is just wrong.',
                    },
                  ],
                });
              },
            },
          };

          return formPromise.then((ampForm) => {
            const fetchStub = env.sandbox
              .stub(ampForm.xhr_, 'fetch')
              .rejects(fetchReject);

            const form = ampForm.form_;
            const input = form.name;
            form.name.value = 'Frank';
            const noVerifyInput = form.noVerify;
            noVerifyInput.value = 'do not send';

            return ampForm.verifier_.onCommit().then(() => {
              expect(
                fromIterator(fetchStub.getCall(0).args[1].body.entries())
              ).to.deep.equal([
                ['name', 'Frank'],
                ['__amp_form_verify', 'true'],
              ]);
              expect(input.validity.customError).to.be.true;
              expect(input.validationMessage).to.equal(
                'This name is just wrong.'
              );
            });
          });
        });

        it('should allow rendering responses through inlined templates', () => {
          return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
            const form = ampForm.form_;
            // Add a div[submit-error] with a template child.
            const errorContainer = createElement('div');
            errorContainer.setAttribute('submit-error', '');
            form.appendChild(errorContainer);
            const errorTemplate = createElement('template');
            errorTemplate.setAttribute('type', 'amp-mustache');
            errorTemplate.content.appendChild(
              createTextNode('Error: {{message}}')
            );
            errorContainer.appendChild(errorTemplate);
            let renderedTemplate = createElement('div');
            renderedTemplate.innerText = 'Error: hello there';
            env.sandbox.stub(ampForm.xhr_, 'fetch').rejects({
              response: {
                status: 400,
                json() {
                  return Promise.resolve({message: 'hello there'});
                },
              },
            });
            env.sandbox
              .stub(ampForm.templates_, 'findAndRenderTemplate')
              .resolves(renderedTemplate);
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };
            return ampForm.handleSubmitEvent_(event).then(() => {
              const findTemplateStub = ampForm.templates_.findAndRenderTemplate;
              expect(ampForm.xhrSubmitPromiseForTesting()).to.eventually.be
                .rejected;
              return ampForm.xhrSubmitPromiseForTesting().catch(() => {
                expect(mutateElementStub).to.have.been.calledOnce;
                expect(findTemplateStub).to.be.called;
                // Template should have rendered an error
                expect(findTemplateStub).to.have.been.calledWith(
                  errorContainer,
                  {message: 'hello there'}
                );
                // Check that form has a rendered div with class
                // .submit-error-message.
                renderedTemplate = form.querySelector('[i-amphtml-rendered]');
                expect(renderedTemplate).to.not.be.null;
              });
            });
          });
        });

        it('should allow rendering responses through referenced templates', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;

            const successTemplate = createElement('template');
            successTemplate.id = 'successTemplate';
            successTemplate.setAttribute('type', 'amp-mustache');
            successTemplate.content.appendChild(
              createTextNode('Hello, {{name}}')
            );
            form.appendChild(successTemplate);

            const messageContainer = createElement('div');
            messageContainer.id = 'message';
            messageContainer.setAttribute('submit-success', '');
            messageContainer.setAttribute('template', 'successTemplate');
            form.appendChild(messageContainer);
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json: () => {
                return Promise.resolve({'name': 'John Smith'});
              },
            });
            const renderedTemplate = createElement('div');
            renderedTemplate.innerText = 'Hello, John Smith';
            env.sandbox
              .stub(ampForm.templates_, 'findAndRenderTemplate')
              .resolves(renderedTemplate);
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const submitEventPromise = ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.templates_.findAndRenderTemplate)
              .then(() => {
                return ampForm.renderTemplatePromiseForTesting();
              })
              .then(() => {
                expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
                expect(
                  ampForm.templates_.findAndRenderTemplate.calledWith(
                    messageContainer,
                    {'name': 'John Smith'}
                  )
                ).to.be.true;
                expect(mutateElementStub).to.have.been.calledOnce;
                expect(messageContainer.firstChild).to.equal(renderedTemplate);

                return submitEventPromise;
              });
          });
        });

        it('should render responses even if analytics throws', () => {
          expectAsyncConsoleError(/Form submission failed/);
          expectAsyncConsoleError(/Sending analytics failed/, 2);

          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;

            const errorTemplate = createElement('template', {
              id: 'errorTemplate',
              type: 'amp-mustache',
            });
            errorTemplate.content.appendChild(
              createTextNode('Sorry, {{name}}')
            );
            form.appendChild(errorTemplate);

            const messageContainer = createElement('div', {
              id: 'message',
              'submit-error': '',
              template: 'errorTemplate',
            });
            form.appendChild(messageContainer);
            env.sandbox.stub(ampForm.xhr_, 'fetch').rejects({
              response: {
                json: () => {
                  return Promise.resolve({'name': 'John Doe'});
                },
              },
            });
            ampForm.analyticsEvent_.throws('Test.');
            const renderedTemplate = createElement('div');
            renderedTemplate.innerText = 'Sorry, John Doe';
            env.sandbox
              .stub(ampForm.templates_, 'findAndRenderTemplate')
              .resolves(renderedTemplate);
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const submitEventPromise = ampForm.handleSubmitEvent_(event);

            return whenCalled(ampForm.templates_.findAndRenderTemplate)
              .then(() => {
                return ampForm.renderTemplatePromiseForTesting();
              })
              .then(() => {
                expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
                expect(ampForm.templates_.findAndRenderTemplate).calledWith(
                  messageContainer,
                  {'name': 'John Doe'}
                );
                expect(mutateElementStub).to.have.been.calledOnce;
                expect(messageContainer.firstChild).to.equal(renderedTemplate);

                return submitEventPromise;
              });
          });
        });

        it('should replace previously rendered responses', () => {
          return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
            const form = ampForm.form_;
            const successContainer = createElement('div');
            successContainer.setAttribute('submit-success', '');
            form.appendChild(successContainer);
            const successTemplate = createElement('template');
            successTemplate.setAttribute('type', 'amp-mustache');
            successTemplate.content.appendChild(
              createTextNode('Success: {{message}}')
            );
            successContainer.appendChild(successTemplate);
            const renderedTemplate = createElement('div');
            renderedTemplate.innerText = 'Success: hello';
            renderedTemplate.setAttribute('i-amphtml-rendered', '');
            successContainer.appendChild(renderedTemplate);
            ampForm.state_ = 'submit-success';

            const newRender = createElement('div');
            newRender.innerText = 'New Success: What What';

            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json: () => {
                return Promise.resolve({'message': 'What What'});
              },
            });
            const findAndRenderTemplateStub = env.sandbox.stub(
              ampForm.templates_,
              'findAndRenderTemplate'
            );
            findAndRenderTemplateStub.resolves(newRender);
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };
            ampForm.handleSubmitEvent_(event);
            return whenCalled(findAndRenderTemplateStub)
              .then(() => {
                return ampForm.renderTemplatePromiseForTesting();
              })
              .then(() => {
                expect(mutateElementStub).to.have.been.calledOnce;
                expect(ampForm.templates_.findAndRenderTemplate).to.be.called;
                expect(
                  ampForm.templates_.findAndRenderTemplate.calledWith(
                    successContainer,
                    {'message': 'What What'}
                  )
                ).to.be.true;
                const renderedTemplates = form.querySelectorAll(
                  '[i-amphtml-rendered]'
                );
                expect(renderedTemplates[0]).to.not.be.null;
                expect(renderedTemplates.length).to.equal(1);
                expect(renderedTemplates[0]).to.equal(newRender);
              });
          });
        });

        it('should dispatch "amp:template-rendered" event after render', () => {
          return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
            const form = ampForm.form_;

            const successContainer = createElement('div');
            successContainer.setAttribute('submit-success', '');
            form.appendChild(successContainer);
            const successTemplate = createElement('template');
            successTemplate.setAttribute('type', 'amp-mustache');
            successContainer.appendChild(successTemplate);
            const renderedTemplate = createElement('div');

            const spyDispatchEvent = env.sandbox.spy(
              successContainer,
              'dispatchEvent'
            );
            const spyAppendTemplate = env.sandbox.spy(
              successContainer,
              'appendChild'
            );
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json() {
                return Promise.resolve({'message': 'What What'});
              },
            });
            const findAndRenderTemplateStub = env.sandbox.stub(
              ampForm.templates_,
              'findAndRenderTemplate'
            );
            findAndRenderTemplateStub.resolves(renderedTemplate);

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            return ampForm.handleSubmitEvent_(event).then(() => {
              return ampForm
                .xhrSubmitPromiseForTesting()
                .then(() => {
                  return ampForm.renderTemplatePromiseForTesting();
                })
                .then(() => {
                  expect(spyDispatchEvent.calledOnce).to.be.true;
                  expect(spyDispatchEvent).calledWithMatch({
                    type: AmpEvents_Enum.DOM_UPDATE,
                    bubbles: true,
                  });
                  env.sandbox.assert.callOrder(
                    spyAppendTemplate,
                    spyDispatchEvent
                  );
                });
            });
          });
        });

        it('should call fetch with the xhr action and form data', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(event.preventDefault).to.be.calledOnce;

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com'
              );

              const xhrCall = ampForm.xhr_.fetch.getCall(0);
              const config = xhrCall.args[1];
              expect(isFormDataWrapper(config.body)).to.be.true;
              const entriesInForm = fromIterator(
                createFormDataWrapper(env.win, getForm()).entries()
              );
              expect(fromIterator(config.body.entries())).to.have.deep.members(
                entriesInForm
              );
              expect(config.method).to.equal('POST');
              expect(config.credentials).to.equal('include');

              return submitEventPromise;
            });
          });
        });

        it('should call fetch with a url encoded string when enctype is "application/x-www-form-urlencoded"', () => {
          const form = getForm();
          form.setAttribute('enctype', 'application/x-www-form-urlencoded');
          return getAmpForm(form).then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(event.preventDefault).to.be.calledOnce;

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com'
              );

              const xhrCall = ampForm.xhr_.fetch.getCall(0);
              const config = xhrCall.args[1];
              expect(config.body).to.be.a('string');
              expect(config.headers['Content-Type']).to.equal(
                'application/x-www-form-urlencoded'
              );

              const entriesInForm = fromIterator(
                createFormDataWrapper(env.win, getForm()).entries()
              );
              expect(
                Object.entries(parseQueryString(config.body))
              ).to.have.deep.members(entriesInForm);
              expect(config.method).to.equal('POST');

              return submitEventPromise;
            });
          });
        });

        it('should call fetch with FormDataWrapper with any other enctype value', () => {
          const form = getForm();
          form.setAttribute('enctype', 'anything');
          return getAmpForm(form).then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(event.preventDefault).to.be.calledOnce;

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com'
              );

              const xhrCall = ampForm.xhr_.fetch.getCall(0);
              const config = xhrCall.args[1];
              expect(isFormDataWrapper(config.body)).to.be.true;

              const entriesInForm = fromIterator(
                createFormDataWrapper(env.win, getForm()).entries()
              );
              expect(fromIterator(config.body.entries())).to.have.deep.members(
                entriesInForm
              );
              expect(config.method).to.equal('POST');

              return submitEventPromise;
            });
          });
        });

        it('should respect the xssi-prefix option when parsing json', async () => {
          const form = createElement('form');
          form.setAttribute('method', 'GET');
          form.setAttribute('action-xhr', 'https://example.com/xssi-json');
          form.setAttribute('xssi-prefix', 'while(1)');

          const ampForm = await getAmpForm(form);
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves('{}');
          env.sandbox.stub(ampForm.xhr_, 'xssiJson').resolves({});

          ampForm.handleSubmitEvent_({
            target: ampForm.form_,
            preventDefault: () => {},
          });

          await whenCalled(ampForm.xhr_.xssiJson);
          expect(ampForm.xhr_.xssiJson).to.be.calledWith('{}', 'while(1)');
        });

        it('should trigger amp-form-submit analytics event with form data', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json: () => Promise.resolve({}),
            });

            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: ampForm.form_,
              preventDefault: env.sandbox.spy(),
            };
            const expectedFormData = {
              'formId': '',
              'formFields[name]': 'John Miller',
            };

            const submitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(event.preventDefault).to.be.calledOnce;
            whenCalled(ampForm.doVarSubs_).then(() => {
              expect(ampForm.analyticsEvent_).to.be.calledWith(
                'amp-form-submit',
                expectedFormData
              );
            });
            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch).to.be.calledOnce;
              expect(ampForm.xhr_.fetch).to.be.calledWith(
                'https://example.com'
              );

              const xhrCall = ampForm.xhr_.fetch.getCall(0);
              const config = xhrCall.args[1];
              expect(config.body).to.not.be.null;
              expect(config.method).to.equal('POST');
              expect(config.credentials).to.equal('include');

              return submitEventPromise;
            });
          });
        });

        it('should trigger amp-form-submit after variables substitution', () => {
          return getAmpForm(getForm()).then((ampForm) => {
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

            env.sandbox.stub(form, 'checkValidity').returns(true);
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
              json: () => Promise.resolve({}),
            });
            env.sandbox.spy(ampForm.urlReplacement_, 'expandInputValueAsync');
            env.sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');

            // Setup some Promises
            const submitPromise = ampForm.submit_(ActionTrust_Enum.HIGH);

            // Fetch
            expect(ampForm.xhr_.fetch).to.have.not.been.called;
            const fetchWhenCalledPromise = whenCalled(ampForm.xhr_.fetch).then(
              () => {
                expect(ampForm.xhr_.fetch).to.be.called;
              }
            );

            return Promise.all([submitPromise, fetchWhenCalledPromise]).then(
              () => {
                const expectedFormData = {
                  'formId': '',
                  'formFields[name]': 'John Miller',
                  'formFields[clientId]': env.sandbox.match(/amp-.+/),
                  'formFields[canonicalUrl]':
                    'https%3A%2F%2Fexample.com%2Famps.html',
                };
                expect(ampForm.urlReplacement_.expandInputValueSync).to.not.have
                  .been.called;
                expect(ampForm.urlReplacement_.expandInputValueAsync).to.have
                  .been.calledTwice;
                expect(
                  ampForm.urlReplacement_.expandInputValueAsync
                ).to.have.been.calledWith(clientIdField);
                expect(
                  ampForm.urlReplacement_.expandInputValueAsync
                ).to.have.been.calledWith(canonicalUrlField);
                expect(clientIdField.value).to.match(/amp-.+/);
                expect(canonicalUrlField.value).to.equal(
                  'https%3A%2F%2Fexample.com%2Famps.html'
                );
                expect(ampForm.analyticsEvent_).to.be.calledWith(
                  'amp-form-submit',
                  expectedFormData
                );
              }
            );
          });
        });

        it('should block multiple submissions and disable buttons', () => {
          const formPromise = getAmpForm(
            getForm(/*button1*/ true, /*button2*/ true, /*button3*/ true)
          );
          return formPromise.then((ampForm) => {
            let fetchResolver;
            env.sandbox
              .stub(ampForm.xhr_, 'fetch')
              .returns(new Promise((resolve) => (fetchResolver = resolve)));

            const form = ampForm.form_;
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const initialSubmitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(ampForm.state_).to.equal('submitting');

            return whenCalled(ampForm.xhr_.fetch).then(() => {
              expect(ampForm.xhr_.fetch.calledOnce).to.be.true;

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
              env.sandbox.stub(ampForm, 'maybeHandleRedirect_');

              return whenCalled(ampForm.maybeHandleRedirect_).then(() => {
                expect(ampForm.state_).to.equal('submit-success');
                expect(form.className).to.not.contain('amp-form-submitting');
                expect(form.className).to.not.contain('amp-form-submit-error');
                expect(form.className).to.contain('amp-form-submit-success');

                return initialSubmitEventPromise;
              });
            });
          });
        });

        it('should degrade trust across submit-*', async () => {
          const form = getForm();

          const actions = {
            installActionHandler: () => {},
            trigger: env.sandbox.spy(),
            addToAllowlist: () => {},
          };
          env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

          env.sandbox.stub(Services, 'xhrFor').returns({
            fetch: () => Promise.resolve({json: () => Promise.resolve()}),
            xssiJson: () => Promise.resolve({}),
          });

          const ampForm = await getAmpForm(form);
          await ampForm.handleSubmitEvent_(new Event('fake_submit'));

          // 1x 'submit' and 1x 'submit-success'.
          expect(actions.trigger.callCount).to.equal(2);
          expect(actions.trigger.getCall(1)).to.be.calledWith(
            form,
            'submit-success',
            /* CustomEvent */ env.sandbox.match.has('detail'),
            ActionTrust_Enum.DEFAULT // Expect: ActionTrust_Enum.HIGH - 1
          );

          await ampForm.handleSubmitAction_({
            method: 'submit',
            trust: ActionTrust_Enum.DEFAULT,
          });

          expect(actions.trigger.callCount).to.equal(4);
          expect(actions.trigger.getCall(3)).to.be.calledWith(
            form,
            'submit-success',
            /* CustomEvent */ env.sandbox.match.has('detail'),
            ActionTrust_Enum.LOW // Expect: ActionTrust_Enum.DEFAULT - 1
          );
        });

        it('should manage form state classes (submitting, success)', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            let fetchResolver;
            env.sandbox.stub(ampForm.xhr_, 'fetch').returns(
              new Promise((resolve) => {
                fetchResolver = resolve;
              })
            );
            env.sandbox.stub(ampForm.actions_, 'trigger');
            const form = ampForm.form_;
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const submitPromise = ampForm.handleSubmitEvent_(event);

            env.sandbox.spy(ampForm, 'handlePresubmitSuccess_');
            whenCalled(ampForm.handlePresubmitSuccess_).then(() => {
              expect(event.preventDefault).to.be.called;
              expect(ampForm.state_).to.equal('submitting');
              expect(form.className).to.contain('amp-form-submitting');
              expect(form.className).to.not.contain('amp-form-submit-error');
              expect(form.className).to.not.contain('amp-form-submit-success');
              fetchResolver({json: () => Promise.resolve()});
            });

            return submitPromise.then(
              () => {
                expect(ampForm.actions_.trigger).to.be.called;
                expect(ampForm.actions_.trigger).to.be.calledWith(
                  form,
                  'submit'
                );
                expect(ampForm.state_).to.equal('submit-success');
                expect(form.className).to.not.contain('amp-form-submitting');
                expect(form.className).to.not.contain('amp-form-submit-error');
                expect(form.className).to.contain('amp-form-submit-success');
                expect(ampForm.actions_.trigger).to.be.called;
                expect(ampForm.actions_.trigger).to.be.calledWith(
                  form,
                  'submit-success',
                  /** CustomEvent */ env.sandbox.match.has('detail')
                );
                expect(ampForm.analyticsEvent_).to.be.calledWith(
                  'amp-form-submit-success'
                );
              },
              () => {
                assert.fail('Submit should have succeeded.');
              }
            );
          });
        });

        it('should manage form state classes (submitting, error)', () => {
          return getAmpForm(getForm(/*button1*/ true, /*button2*/ true)).then(
            (ampForm) => {
              let fetchRejecter;
              env.sandbox.stub(ampForm.xhr_, 'fetch').returns(
                new Promise((unusedResolve, reject) => {
                  fetchRejecter = reject;
                })
              );
              env.sandbox.stub(ampForm.actions_, 'trigger');
              const form = ampForm.form_;
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };

              const submitEventPromise = ampForm.handleSubmitEvent_(event);
              expect(event.preventDefault).to.be.called;
              expect(event.stopImmediatePropagation).to.not.be.called;
              expect(ampForm.state_).to.equal('submitting');
              expect(form.className).to.contain('amp-form-submitting');
              expect(form.className).to.not.contain('amp-form-submit-error');
              expect(form.className).to.not.contain('amp-form-submit-success');
              fetchRejecter();

              return submitEventPromise.then(
                () => {
                  assert.fail('Submit should have failed.');
                },
                () => {
                  expect(ampForm.state_).to.equal('submit-error');
                  expect(form.className).to.not.contain('amp-form-submitting');
                  expect(form.className).to.not.contain(
                    'amp-form-submit-success'
                  );
                  expect(form.className).to.contain('amp-form-submit-error');
                  expect(ampForm.actions_.trigger).to.be.called;
                  expect(
                    ampForm.actions_.trigger.calledWith(
                      form,
                      'submit-error',
                      /** CustomEvent */ env.sandbox.match.has('detail')
                    )
                  ).to.be.true;
                  expect(ampForm.analyticsEvent_).to.be.calledWith(
                    'amp-form-submit-error'
                  );
                }
              );
            }
          );
        });

        describe('GET requests', () => {
          it('should allow GET submissions', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              ampForm.method_ = 'GET';
              ampForm.form_.setAttribute('method', 'GET');

              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: ampForm.form_,
                preventDefault: env.sandbox.spy(),
              };

              env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
              const submitEventPromise = ampForm.handleSubmitEvent_(event);
              expect(event.preventDefault).to.be.calledOnce;

              return whenCalled(ampForm.xhr_.fetch).then(() => {
                expect(ampForm.xhr_.fetch).to.be.calledOnce;
                expect(ampForm.xhr_.fetch).to.be.calledWith(
                  'https://example.com?name=John%20Miller'
                );

                const xhrCall = ampForm.xhr_.fetch.getCall(0);
                const config = xhrCall.args[1];
                expect(config.body).to.be.undefined;
                expect(config.method).to.equal('GET');
                expect(config.credentials).to.equal('include');

                return submitEventPromise;
              });
            });
          });

          it('should not send disabled or nameless inputs', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              const form = ampForm.form_;
              ampForm.method_ = 'GET';
              form.setAttribute('method', 'GET');

              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
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
                stopImmediatePropagation: env.sandbox.spy(),
                target: ampForm.form_,
                preventDefault: env.sandbox.spy(),
              };

              usernameInput.disabled = true;
              usernameInput.value = 'coolbeans';
              emailInput.value = 'cool@bea.ns';

              env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
              let submitEventPromise;
              submitEventPromise = ampForm.handleSubmitEvent_(event);
              expect(event.preventDefault).to.be.calledOnce;

              return whenCalled(ampForm.xhr_.fetch)
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&email=cool%40bea.ns'
                  );
                  return submitEventPromise;
                })
                .then(() => {
                  ampForm.setState_('submit-success');
                  ampForm.xhr_.fetch.reset();
                  ampForm.xhr_.fetch.resolves();
                  usernameInput.removeAttribute('disabled');
                  usernameInput.value = 'coolbeans';
                  emailInput.value = 'cool@bea.ns';

                  submitEventPromise = ampForm.handleSubmitEvent_(event);

                  return whenCalled(ampForm.xhr_.fetch);
                })
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&email=cool%40bea.ns&' +
                      'nickname=coolbeans'
                  );

                  return submitEventPromise;
                })
                .then(() => {
                  ampForm.setState_('submit-success');
                  ampForm.xhr_.fetch.reset();
                  ampForm.xhr_.fetch.resolves();
                  fieldset.disabled = true;

                  submitEventPromise = ampForm.handleSubmitEvent_(event);

                  return whenCalled(ampForm.xhr_.fetch);
                })
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller'
                  );
                  return submitEventPromise;
                })
                .then(() => {
                  ampForm.setState_('submit-success');
                  ampForm.xhr_.fetch.reset();
                  ampForm.xhr_.fetch.resolves();

                  fieldset.removeAttribute('disabled');
                  usernameInput.removeAttribute('name');
                  emailInput.removeAttribute('required');
                  emailInput.value = '';
                  submitEventPromise = ampForm.handleSubmitEvent_(event);

                  return whenCalled(ampForm.xhr_.fetch);
                })
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&email='
                  );
                });
            });
          });

          it('should properly serialize inputs to query params', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              const form = ampForm.form_;
              ampForm.method_ = 'GET';
              form.setAttribute('method', 'GET');

              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

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
                stopImmediatePropagation: env.sandbox.spy(),
                target: ampForm.form_,
                preventDefault: env.sandbox.spy(),
              };

              env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
              let submitEventPromise;
              submitEventPromise = ampForm.handleSubmitEvent_(event);
              expect(event.preventDefault).to.be.calledOnce;

              return whenCalled(ampForm.xhr_.fetch)
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&name=&name=&' +
                      'city=San%20Francisco'
                  );
                  return submitEventPromise;
                })
                .then(() => {
                  ampForm.setState_('submit-success');
                  ampForm.xhr_.fetch.reset();
                  ampForm.xhr_.fetch.resolves();
                  foodCB.checked = true;
                  footballCB.checked = true;
                  submitEventPromise = ampForm.handleSubmitEvent_(event);

                  return whenCalled(ampForm.xhr_.fetch);
                })
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&name=&name=' +
                      '&interests=Football&interests=Food&city=San%20Francisco'
                  );
                  return submitEventPromise;
                })
                .then(() => {
                  ampForm.setState_('submit-success');
                  femaleRadio.checked = true;
                  otherName1Input.value = 'John Maller';
                  ampForm.xhr_.fetch.reset();
                  ampForm.xhr_.fetch.resolves();

                  submitEventPromise = ampForm.handleSubmitEvent_(event);
                  return whenCalled(ampForm.xhr_.fetch);
                })
                .then(() => {
                  expect(ampForm.xhr_.fetch).to.be.calledOnce;
                  expect(ampForm.xhr_.fetch).to.be.calledWith(
                    'https://example.com?name=John%20Miller&name=John%20Maller' +
                      '&name=&gender=Female&interests=Football&interests=Food&' +
                      'city=San%20Francisco'
                  );
                  return submitEventPromise;
                });
            });
          });
        });

        describe('User Validity', () => {
          it('should manage valid/invalid on input/fieldset/form on submit', () => {
            expectAsyncConsoleError(/Form submission failed/);
            setReportValiditySupportedForTesting(false);
            return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
              const form = ampForm.form_;
              const fieldset = createElement('fieldset');
              const emailInput = createElement('input');
              emailInput.setAttribute('name', 'email');
              emailInput.setAttribute('type', 'email');
              emailInput.setAttribute('required', '');
              fieldset.appendChild(emailInput);
              form.appendChild(fieldset);
              env.sandbox.spy(form, 'checkValidity');
              env.sandbox.spy(emailInput, 'checkValidity');
              env.sandbox.spy(fieldset, 'checkValidity');

              const event = {
                target: ampForm.form_,
                stopImmediatePropagation: env.sandbox.spy(),
                preventDefault: env.sandbox.spy(),
              };

              // Submit an invalid form
              const invalidFormPromiseResponse =
                ampForm.handleSubmitEvent_(event);
              return invalidFormPromiseResponse
                .then(() => {
                  expect(form.checkValidity).to.be.called;
                  expect(emailInput.checkValidity).to.be.called;
                  expect(fieldset.checkValidity).to.be.called;
                  expect(form.className).to.contain('user-invalid');
                  expect(emailInput.className).to.contain('user-invalid');
                  expect(event.preventDefault).to.be.called;
                  expect(event.stopImmediatePropagation).to.be.called;

                  emailInput.value = 'cool@bea.ns';

                  const submitPromise = ampForm.handleSubmitEvent_(event);
                  expect(submitPromise).to.be.ok;
                  return submitPromise;
                })
                .then(() => {
                  expect(form.className).to.contain('user-valid');
                  expect(emailInput.className).to.contain('user-valid');
                });
            });
          });

          it('should manage valid/invalid on input user interaction', () => {
            setReportValiditySupportedForTesting(false);
            return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
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
              env.sandbox.spy(form, 'checkValidity');
              env.sandbox.spy(emailInput, 'checkValidity');
              env.sandbox.spy(fieldset, 'checkValidity');
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

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
            return getAmpForm(getForm(/*button1*/ true)).then((ampForm) => {
              const form = ampForm.form_;
              const fieldset = createElement('fieldset');
              const emailInput = createElement('input');
              emailInput.setAttribute('name', 'email');
              emailInput.setAttribute('type', 'email');
              emailInput.setAttribute('required', '');
              fieldset.appendChild(emailInput);
              form.appendChild(fieldset);
              env.sandbox.spy(form, 'checkValidity');
              env.sandbox.spy(emailInput, 'checkValidity');
              env.sandbox.spy(fieldset, 'checkValidity');
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

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
          const actions = Services.actionServiceForDoc(form);

          env.sandbox.stub(actions, 'installActionHandler');
          const ampForm = new AmpForm(form);
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

          expect(actions.installActionHandler).to.be.calledWith(form);
          env.sandbox.spy(ampForm, 'handleSubmitAction_');
          ampForm.actionHandler_({
            method: 'anything',
            satisfiesTrust: () => true,
          });
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;
          ampForm.actionHandler_({
            method: 'submit',
            satisfiesTrust: () => true,
          });

          return whenCalled(ampForm.xhr_.fetch).then(() => {
            expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;
            document.body.removeChild(form);
          });
        });

        it('should not invoke low-trust action invocations', () => {
          const form = getForm();
          document.body.appendChild(form);

          const ampForm = new AmpForm(form);
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

          env.sandbox.spy(ampForm, 'handleSubmitAction_');
          ampForm.actionHandler_({
            method: 'submit',
            satisfiesTrust: () => false,
          });
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;

          document.body.removeChild(form);
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

          return getAmpForm(form).then((ampForm) => {
            const initalFormValues = ampForm.getFormAsObject_();

            ampForm.form_.elements.name.value = 'Jack Sparrow';

            env.sandbox.spy(ampForm, 'handleClearAction_');
            ampForm.actionHandler_({
              method: 'anything',
              satisfiesTrust: () => true,
            });
            expect(ampForm.handleClearAction_).to.have.not.been.called;

            expect(ampForm.getFormAsObject_()).to.not.deep.equal(
              initalFormValues
            );
            ampForm.actionHandler_({
              method: 'clear',
              satisfiesTrust: () => true,
            });
            expect(ampForm.handleClearAction_).to.have.been.called;

            expect(ampForm.getFormAsObject_()).to.deep.equal(initalFormValues);
          });
        });

        it('should remove all form state classes when form is cleared', () => {
          const form = getForm();
          form.setAttribute('method', 'GET');
          document.body.appendChild(form);

          form.setAttribute(
            'custom-validation-reporting',
            'show-all-on-submit'
          );

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
          validationMessage.setAttribute(
            'visible-when-invalid',
            'valueMissing'
          );
          validationMessage.setAttribute('validation-for', 'email1');
          fieldset.appendChild(validationMessage);

          form.appendChild(fieldset);

          return getAmpForm(form).then((ampForm) => {
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

        it('should submit after timeout of waiting for amp-selector', async function () {
          expectAsyncConsoleError(/Form submission failed/);
          this.timeout(3000);

          const ampForm = await getAmpForm(getForm());
          const form = ampForm.form_;
          const selector = createElement('amp-selector');
          selector.setAttribute('name', 'color');

          env.sandbox
            .stub(AmpSelector.prototype, 'buildCallback')
            .returns(new Promise((unusedResolve) => {}));
          env.sandbox.spy(ampForm, 'handleSubmitAction_');

          form.appendChild(selector);

          const submitPromise = ampForm.actionHandler_({
            method: 'submit',
            satisfiesTrust: () => true,
          });
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;

          await timer.promise(1);
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;

          await timer.promise(2000);
          expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;

          await submitPromise;
        });

        it('should wait for amp-selector to build before submitting', async () => {
          const ampForm = await getAmpForm(getForm());

          let builtPromiseResolver_;
          const form = ampForm.form_;
          const selector = createElement('amp-selector');
          selector.setAttribute('name', 'color');

          env.sandbox.stub(AmpSelector.prototype, 'buildCallback').returns(
            new Promise((resolve) => {
              builtPromiseResolver_ = resolve;
            })
          );
          env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
          env.sandbox.spy(ampForm, 'handleSubmitAction_');

          form.appendChild(selector);

          ampForm.actionHandler_({
            method: 'submit',
            satisfiesTrust: () => true,
          });
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;

          await timer.promise(1);
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;

          await timer.promise(100);
          expect(ampForm.handleSubmitAction_).to.have.not.been.called;
          builtPromiseResolver_();

          await timer.promise(1);
          expect(ampForm.handleSubmitAction_).to.have.been.calledOnce;
        });

        describe('Var Substitution', () => {
          it('should substitute hidden fields variables in XHR async', () => {
            return getAmpForm(getForm()).then((ampForm) => {
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
              canonicalUrlField.setAttribute(
                'data-amp-replace',
                'CANONICAL_URL'
              );
              form.appendChild(canonicalUrlField);

              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              env.sandbox.stub(ampForm, 'handleSubmitSuccess_');
              env.sandbox.spy(ampForm.urlReplacement_, 'expandInputValueAsync');
              env.sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');

              const submitPromise = ampForm.submit_(ActionTrust_Enum.HIGH);
              expect(ampForm.xhr_.fetch).to.have.not.been.called;
              expect(ampForm.urlReplacement_.expandInputValueSync).to.not.have
                .been.called;

              submitPromise.then(() => {
                expect(ampForm.urlReplacement_.expandInputValueAsync).to.have
                  .been.calledTwice;
                expect(
                  ampForm.urlReplacement_.expandInputValueAsync
                ).to.have.been.calledWith(clientIdField);
                expect(
                  ampForm.urlReplacement_.expandInputValueAsync
                ).to.have.been.calledWith(canonicalUrlField);
                return whenCalled(ampForm.xhr_.fetch).then(() => {
                  expect(ampForm.xhr_.fetch).to.be.called;
                  expect(clientIdField.value).to.match(/amp-.+/);
                  expect(canonicalUrlField.value).to.equal(
                    'https%3A%2F%2Fexample.com%2Famps.html'
                  );
                });
              });
            });
          });

          it('should send request if vars did not resolve after a timeout', () => {
            return getAmpForm(getForm()).then((ampForm) => {
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
              canonicalUrlField.setAttribute(
                'data-amp-replace',
                'CANONICAL_URL'
              );
              canonicalUrlField.value = 'CANONICAL_URL';
              form.appendChild(canonicalUrlField);

              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              env.sandbox.stub(ampForm, 'handleSubmitSuccess_');
              env.sandbox
                .stub(ampForm.urlReplacement_, 'expandInputValueAsync')
                .returns(
                  new Promise((resolve) => {
                    expandAsyncStringResolvers.push(resolve);
                  })
                );
              env.sandbox.stub(ampForm.urlReplacement_, 'expandInputValueSync');

              env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
              const submitPromise = ampForm.submit_(ActionTrust_Enum.HIGH);

              expect(ampForm.xhr_.fetch).to.have.not.been.called;
              expect(ampForm.urlReplacement_.expandInputValueSync).to.not.have
                .been.called;
              expect(ampForm.urlReplacement_.expandInputValueAsync).to.have.been
                .calledTwice;
              expect(
                ampForm.urlReplacement_.expandInputValueAsync
              ).to.have.been.calledWith(clientIdField);
              expect(
                ampForm.urlReplacement_.expandInputValueAsync
              ).to.have.been.calledWith(canonicalUrlField);

              return whenCalled(ampForm.xhr_.fetch).then(() => {
                expect(ampForm.xhr_.fetch).to.be.called;
                expect(clientIdField.value).to.equal('CLIENT_ID(form)');
                expect(canonicalUrlField.value).to.equal('CANONICAL_URL');

                return submitPromise;
              });
            });
          });

          it(
            'should substitute hidden fields variables ' +
              'in non-XHR via sync',
            () => {
              return getAmpForm(getForm()).then((ampForm) => {
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
                canonicalUrlField.setAttribute(
                  'data-amp-replace',
                  'CANONICAL_URL'
                );
                canonicalUrlField.value = 'CANONICAL_URL';
                form.appendChild(canonicalUrlField);

                env.sandbox.stub(form, 'submit');
                env.sandbox.stub(form, 'checkValidity').returns(true);
                env.sandbox.stub(ampForm, 'handleSubmitSuccess_');
                env.sandbox.stub(
                  ampForm.urlReplacement_,
                  'expandInputValueAsync'
                );
                env.sandbox.spy(
                  ampForm.urlReplacement_,
                  'expandInputValueSync'
                );

                env.sandbox.stub(ampForm, 'handleNonXhrGet_').resolves();
                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                expect(ampForm.urlReplacement_.expandInputValueAsync).to.not
                  .have.been.called;
                expect(ampForm.urlReplacement_.expandInputValueSync).to.have
                  .been.called;
                expect(
                  ampForm.urlReplacement_.expandInputValueSync
                ).to.have.been.calledWith(clientIdField);
                expect(
                  ampForm.urlReplacement_.expandInputValueSync
                ).to.have.been.calledWith(canonicalUrlField);

                return whenCalled(ampForm.handleNonXhrGet_).then(() => {
                  expect(form.submit).to.not.have.been.called;
                  expect(clientIdField.value).to.equal('');
                  expect(canonicalUrlField.value).to.equal(
                    'https%3A%2F%2Fexample.com%2Famps.html'
                  );

                  return submitActionPromise;
                });
              });
            }
          );
        });

        describes.fakeWin(
          'XHR',
          {
            amp: {
              ampdoc: 'single',
            },
            win: {
              location: 'https://example.com',
              top: {
                location: 'https://example-top.com',
              },
            },
          },
          () => {
            let form;
            let ampForm;
            let redirectToValue;
            const headersMock = {
              get: (header) => {
                if (header == 'AMP-Redirect-To') {
                  return redirectToValue;
                }
              },
            };
            const fetchResolve = {
              json: () => Promise.resolve(),
              headers: headersMock,
            };
            const error = new Error('Error');
            error.response = {
              headers: headersMock,
              json() {
                return Promise.resolve();
              },
            };
            let navigateTo;

            beforeEach(() => {
              form = getForm();
              document.body.appendChild(form);
              env.sandbox.stub(form, 'checkValidity').returns(true);
              ampForm = new AmpForm(form);
              ampForm.target_ = '_top';

              navigateTo = env.sandbox.spy();
              env.sandbox
                .stub(Services, 'navigationForDoc')
                .returns({navigateTo});
              env.sandbox
                .stub(ampForm.ssrTemplateHelper_, 'isEnabled')
                .returns(false);
            });

            describe('AMP-Redirect-To', () => {
              it('should redirect users if header is set', () => {
                env.sandbox.stub(ampForm.xhr_, 'fetch').resolves(fetchResolve);
                redirectToValue = 'https://google.com/';

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                expect(navigateTo).to.not.be.called;

                return submitActionPromise.then(() => {
                  expect(navigateTo).to.be.calledOnce;
                  const {args} = navigateTo.firstCall;
                  expect(args[1]).to.equal('https://google.com/');
                  expect(args[2]).to.equal('AMP-Redirect-To');
                });
              });

              it('should redirect users if header is set but json rejects', () => {
                env.sandbox.stub(ampForm.xhr_, 'fetch').resolves({
                  json: () => Promise.reject(),
                  headers: headersMock,
                });
                redirectToValue = 'https://google.com/';

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                expect(navigateTo).to.not.be.called;

                return submitActionPromise.then(() => {
                  expect(navigateTo).to.be.calledOnce;
                  const {args} = navigateTo.firstCall;
                  expect(args[1]).to.equal('https://google.com/');
                  expect(args[2]).to.equal('AMP-Redirect-To');
                });
              });

              it('should fail to redirect to non-secure urls', () => {
                env.sandbox.stub(ampForm.xhr_, 'fetch').resolves(fetchResolve);
                redirectToValue = 'http://google.com/';

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                // Make it a sync error for testing convenience
                env.sandbox.stub(user(), 'assert').throws();

                return submitActionPromise.then(
                  () => {
                    assert.fail('Submit should have failed.');
                  },
                  () => {
                    expect(navigateTo).to.not.be.called;
                  }
                );
              });

              it('should fail to redirect to non-absolute urls', () => {
                env.sandbox.stub(ampForm.xhr_, 'fetch').resolves(fetchResolve);
                redirectToValue = '/hello';

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                // Make it a sync error for testing convenience
                env.sandbox.stub(user(), 'assert').throws();

                return submitActionPromise.then(
                  () => {
                    assert.fail('Submit should have failed.');
                  },
                  () => {
                    expect(navigateTo).to.not.be.called;
                  }
                );
              });

              it('should fail to redirect to when target != _top', () => {
                ampForm.target_ = '_blank';
                env.sandbox.stub(ampForm.xhr_, 'fetch').resolves(fetchResolve);
                redirectToValue = 'http://google.com/';

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                // Make it a sync error for testing convenience
                env.sandbox.stub(user(), 'assert').throws();

                return submitActionPromise.then(
                  () => {
                    assert.fail('Submit should have failed.');
                  },
                  () => {
                    expect(navigateTo).to.not.be.called;
                  }
                );
              });

              it('should redirect on error if header is set', () => {
                env.sandbox.stub(ampForm.xhr_, 'fetch').rejects(error);
                redirectToValue = 'https://example2.com/hello';
                const logSpy = env.sandbox.stub(user(), 'error');

                const submitActionPromise = ampForm.handleSubmitAction_(
                  /* invocation */ {}
                );
                expect(navigateTo).to.not.be.called;

                return submitActionPromise.then(() => {
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
          }
        );

        describe('non-XHR GET', () => {
          it('should execute form submit when not triggered through event', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              const form = ampForm.form_;

              // Non XHR Get
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;
              env.sandbox.stub(form, 'submit');
              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

              env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
              const submitActionPromise = ampForm.handleSubmitAction_(
                /* invocation */ {}
              );

              expect(form.submit).to.have.been.called;

              return submitActionPromise;
            });
          });

          it('should not execute form submit when triggered through event', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              const form = ampForm.form_;
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;
              env.sandbox.stub(form, 'submit');
              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              const event = {
                stopImmediatePropagation: env.sandbox.spy(),
                target: form,
                preventDefault: env.sandbox.spy(),
              };
              return ampForm.handleSubmitEvent_(event).then(() => {
                expect(form.submit).to.have.not.been.called;
              });
            });
          });

          it('should not execute form submit with password field present', () => {
            const form = getForm();
            const input = createElement('input');
            input.type = 'password';
            form.appendChild(input);

            return getAmpForm(form).then((ampForm) => {
              const form = ampForm.form_;
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;
              env.sandbox.stub(form, 'submit');
              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              allowConsoleError(() => {
                expect(() =>
                  ampForm.handleSubmitAction_(/* invocation */ {})
                ).to.throw('input[type=password]');
              });
              expect(form.submit).to.have.not.been.called;
            });
          });

          it('should not execute form submit with file field present', () => {
            const form = getForm();
            const input = createElement('input');
            input.type = 'file';
            form.appendChild(input);

            return getAmpForm(form).then((ampForm) => {
              const form = ampForm.form_;
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;
              env.sandbox.stub(form, 'submit');
              env.sandbox.stub(form, 'checkValidity').returns(true);
              env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
              allowConsoleError(() => {
                expect(() =>
                  ampForm.handleSubmitAction_(/* invocation */ {})
                ).to.throw('input[type=file]');
              });
              expect(form.submit).to.have.not.been.called;
            });
          });
        });

        it('should trigger amp-form-submit analytics event with form data', () => {
          return getAmpForm(getForm()).then((ampForm) => {
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

            // Non XHR Get
            ampForm.method_ = 'GET';
            ampForm.xhrAction_ = null;
            env.sandbox.stub(form, 'submit');
            env.sandbox.stub(form, 'checkValidity').returns(true);
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();

            env.sandbox.stub(ampForm, 'handleXhrSubmitSuccess_').resolves();
            const submitActionPromise = ampForm.handleSubmitAction_(
              /* invocation */ {}
            );

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

            return submitActionPromise;
          });
        });

        it('should trigger submit-success analytics event with form data', () => {
          return getAmpForm(getForm()).then((ampForm) => {
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
            env.sandbox.stub(ampForm.xhr_, 'fetch').returns(
              new Promise((resolve) => {
                fetchResolver = resolve;
              })
            );
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };
            ampForm.handleSubmitEvent_(event).then(() => {
              expect(ampForm.state_).to.equal('submitting');
              fetchResolver({json: () => Promise.resolve()});

              const expectedFormData = {
                'formId': 'registration',
                'formFields[name]': 'John Miller',
                'formFields[email]': 'j@hnmiller.com',
              };

              return ampForm.xhrSubmitPromiseForTesting().then(
                () => {
                  expect(ampForm.state_).to.equal('submit-success');
                  expect(ampForm.analyticsEvent_).to.be.calledWith(
                    'amp-form-submit-success',
                    expectedFormData
                  );
                },
                () => {
                  assert.fail('Submit should have succeeded.');
                }
              );
            });
          });
        });

        it('should trigger submit-error analytics event with form data', () => {
          return getAmpForm(getForm()).then((ampForm) => {
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
            env.sandbox.stub(ampForm.xhr_, 'fetch').returns(
              new Promise((unusedResolve, reject) => {
                fetchRejecter = reject;
              })
            );
            const event = {
              stopImmediatePropagation: env.sandbox.spy(),
              target: form,
              preventDefault: env.sandbox.spy(),
            };

            const submitEventPromise = ampForm.handleSubmitEvent_(event);
            expect(ampForm.state_).to.equal('submitting');
            fetchRejecter();

            const expectedFormData = {
              'formId': 'registration',
              'formFields[name]': 'John Miller',
              'formFields[email]': 'j@hnmiller.com',
            };

            return submitEventPromise.then(
              () => {
                assert.fail('Submit should have failed.');
              },
              () => {
                expect(ampForm.state_).to.equal('submit-error');
                expect(ampForm.analyticsEvent_).to.be.calledWith(
                  'amp-form-submit-error',
                  expectedFormData
                );
              }
            );
          });
        });

        it('should trigger amp-form-submit after variables substitution', () => {
          return getAmpForm(getForm()).then((ampForm) => {
            const form = ampForm.form_;
            form.id = 'registration';

            // Non XHR Get
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

            env.sandbox.stub(form, 'submit');
            env.sandbox.stub(form, 'checkValidity').returns(true);
            env.sandbox.stub(ampForm.xhr_, 'fetch').resolves();
            env.sandbox.stub(ampForm.urlReplacement_, 'expandInputValueAsync');
            env.sandbox.spy(ampForm.urlReplacement_, 'expandInputValueSync');
            ampForm.handleSubmitAction_(/* invocation */ {});

            const expectedFormData = {
              'formId': 'registration',
              'formFields[name]': 'John Miller',
              'formFields[canonicalUrl]':
                'https%3A%2F%2Fexample.com%2Famps.html',
              'formFields[clientId]': '',
            };
            expect(ampForm.analyticsEvent_).to.be.calledWith(
              'amp-form-submit',
              expectedFormData
            );
            expect(ampForm.urlReplacement_.expandInputValueAsync).to.not.have
              .been.called;
            expect(ampForm.urlReplacement_.expandInputValueSync).to.have.been
              .called;
            expect(
              ampForm.urlReplacement_.expandInputValueSync
            ).to.have.been.calledWith(clientIdField);
            expect(
              ampForm.urlReplacement_.expandInputValueSync
            ).to.have.been.calledWith(canonicalUrlField);

            expect(form.submit).to.have.been.calledOnce;
            expect(clientIdField.value).to.equal('');
            expect(canonicalUrlField.value).to.equal(
              'https%3A%2F%2Fexample.com%2Famps.html'
            );
          });
        });

        it('should allow default actions in email documents', async () => {
          env.win.document.documentElement.setAttribute('amp4email', '');
          const action = new ActionService(env.ampdoc, env.win.document);
          env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
          const element = getForm();
          document.body.appendChild(element);
          const form = new AmpForm(element, 'test-id');
          const clearSpy = env.sandbox.stub(form, 'handleClearAction_');
          action.execute(
            element,
            'clear',
            null,
            'source',
            'caller',
            'event',
            ActionTrust_Enum.HIGH
          );
          expect(clearSpy).to.be.called;

          env.sandbox.stub(form, 'submit_');
          const submitSpy = env.sandbox.stub(form, 'handleSubmitAction_');
          action.execute(
            element,
            'submit',
            null,
            'source',
            'caller',
            'event',
            ActionTrust_Enum.HIGH
          );
          await whenCalled(submitSpy);
          expect(submitSpy).to.be.calledWith(
            env.sandbox.match({
              actionEventType: '?',
              args: null,
              caller: 'caller',
              event: 'event',
              method: 'submit',
              node: element,
              source: 'source',
              trust: ActionTrust_Enum.HIGH,
            })
          );
        });

        describe('Async Inputs', () => {
          it('NonXHRGet should submit sync if no Async Input', () => {
            return getAmpForm(getForm()).then((ampForm) => {
              // Make the form a NonXHRGet
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;

              const assertNoSensitiveFieldsStub = env.sandbox.stub(
                ampForm,
                'assertNoSensitiveFields_'
              );

              return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                expect(assertNoSensitiveFieldsStub).to.be.called;
              });
            });
          });

          it('NonXHRGet should submit async if Async Input', () => {
            return getAmpFormWithAsyncInput().then((response) => {
              const {ampForm, getValueStub} = response;

              // Make the form a NonXHRGet
              ampForm.method_ = 'GET';
              ampForm.xhrAction_ = null;

              const formElementSubmitSpy = env.sandbox.spy(
                ampForm.form_,
                'submit'
              );

              const mockEvent = {
                preventDefault: () => {},
              };

              return ampForm
                .submit_(ActionTrust_Enum.HIGH, mockEvent)
                .then(() => {
                  expect(getValueStub).to.be.called;
                  expect(formElementSubmitSpy).to.be.calledOnce;
                });
            });
          });

          it('should call getValue() on Async Input Elements', () => {
            return getAmpFormWithAsyncInput().then((response) => {
              const {ampForm, getValueStub} = response;

              return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                expect(getValueStub).to.be.called;
              });
            });
          });

          it(
            'should create a hidden input for Async Input Elements,' +
              'with the correct name attribute',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm, asyncInput} = response;

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  const name = asyncInput.getAttribute(
                    AsyncInputAttributes_Enum.NAME
                  );
                  const hiddenInput = ampForm.form_.querySelector(
                    `input[hidden][name=${name}]`
                  );
                  expect(hiddenInput).to.be.ok;
                });
              });
            }
          );

          it(
            'should add the resolved value for, ' +
              'hidden input for Async Input Elements',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm, asyncInput, asyncInputValue} = response;

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  const name = asyncInput.getAttribute(
                    AsyncInputAttributes_Enum.NAME
                  );
                  const hiddenInput = ampForm.form_.querySelector(
                    `input[hidden][name=${name}]`
                  );
                  const value = hiddenInput.getAttribute('value');
                  expect(value).to.be.equal(asyncInputValue);
                });
              });
            }
          );

          it(
            'should recycle already created ' +
              'hidden inputs for Async Inputs',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm, asyncInput, asyncInputValue, getValueStub} =
                  response;

                const newAsyncInputValue = 'new-async-input-value';
                let hiddenInput;
                let previousHiddenInputCount;

                return ampForm
                  .submit_(ActionTrust_Enum.HIGH)
                  .then(() => {
                    previousHiddenInputCount =
                      ampForm.form_.querySelectorAll('input[hidden]').length;
                    const name = asyncInput.getAttribute(
                      AsyncInputAttributes_Enum.NAME
                    );
                    hiddenInput = ampForm.form_.querySelector(
                      `input[hidden][name=${name}]`
                    );
                    const value = hiddenInput.getAttribute('value');
                    expect(value).to.be.equal(asyncInputValue);

                    getValueStub.resolves(newAsyncInputValue);
                    return ampForm.submit_(ActionTrust_Enum.HIGH);
                  })
                  .then(() => {
                    const totalHiddenInputs =
                      ampForm.form_.querySelectorAll('input[hidden]');
                    expect(totalHiddenInputs.length).to.be.equal(
                      previousHiddenInputCount
                    );
                    expect(hiddenInput).to.be.ok;

                    const newValue = hiddenInput.getAttribute('value');

                    expect(newValue).to.be.equal(newAsyncInputValue);
                  });
              });
            }
          );

          it(
            'should continue submitting when, ' +
              'Async Input Elements getValue() resolve',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm} = response;

                const handlePresubmitSuccessStub = env.sandbox.stub(
                  ampForm,
                  'handlePresubmitSuccess_'
                );

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  expect(handlePresubmitSuccessStub).to.be.called;
                });
              });
            }
          );

          it('should submit with async input required action ', () => {
            return getAmpFormWithAsyncInput(
              true /*includeRequiredAction*/
            ).then((response) => {
              const {ampForm, getValueStubRequiredAction} = response;

              const handlePresubmitSuccessStub = env.sandbox.stub(
                ampForm,
                'handlePresubmitSuccess_'
              );
              return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                expect(getValueStubRequiredAction).to.be.called;
                expect(handlePresubmitSuccessStub).to.be.called;
              });
            });
          });

          it(
            'should handle errors when, ' +
              'AsyncInput Elements getValue() reject',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm, getValueStub} = response;

                const getValueError = new Error('amp-async-input-error');
                getValueStub.rejects(getValueError);

                const stub = env.sandbox.stub(ampForm, 'handleSubmitFailure_');
                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  expect(stub).to.be.called;
                  expect(stub).to.be.calledWith(getValueError, {
                    'error': 'amp-async-input-error',
                  });
                });
              });
            }
          );

          it(
            'should enter the submitting state when, ' +
              'waiting for Async Input Elements getValue() to resolve',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm} = response;

                const setStateStub = env.sandbox.stub(ampForm, 'setState_');

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  expect(setStateStub).to.be.calledWith('submitting');
                });
              });
            }
          );

          it(
            'should enter the initial state when, ' +
              'No Async Inputs and NonXhrGet',
            () => {
              return getAmpForm(getForm()).then((ampForm) => {
                // Make the form a NonXHRGet
                ampForm.method_ = 'GET';
                ampForm.xhrAction_ = null;

                const setStateStub = env.sandbox.stub(ampForm, 'setState_');

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  expect(setStateStub).to.be.calledWith('initial');
                });
              });
            }
          );

          it(
            'should enter the submit error state when, ' +
              'Async Input Elements getValue() rejects',
            () => {
              return getAmpFormWithAsyncInput().then((response) => {
                const {ampForm, getValueStub} = response;

                const getValueError = new Error('amp-async-input-error');
                getValueStub.rejects(getValueError);
                const setStateStub = env.sandbox.stub(ampForm, 'setState_');

                return ampForm.submit_(ActionTrust_Enum.HIGH).then(() => {
                  expect(setStateStub).to.be.calledWith('submit-error');
                });
              });
            }
          );
        });

        describe('Form Dirtiness State', () => {
          let form, ampForm, input;

          beforeEach(async () => {
            form = getForm();
            ampForm = await getAmpForm(form);
            input = form.querySelector('input[name=name]');
          });

          function changeInput(element, value) {
            element.value = value;
            const event = new Event('input', {bubbles: true});
            element.dispatchEvent(event);
          }

          it('adds dirtiness class when a field changes', () => {
            changeInput(input, 'Another Name');
            expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
          });

          it('clears dirtiness class when submitted successfully without XHR', async () => {
            ampForm.method_ = 'GET';
            ampForm.xhrAction_ = null;

            changeInput(input, 'Another Name');
            await ampForm.submit_(ActionTrust_Enum.HIGH);

            expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
          });

          it('clears dirtiness class when submitted successfully with XHR', async () => {
            env.sandbox
              .stub(ampForm.xhr_, 'fetch')
              .resolves({json: async () => {}});

            changeInput(input, 'Another Name');
            await ampForm.submit_(ActionTrust_Enum.HIGH);

            expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
          });

          it('does not clear dirtiness class when submission XHR fails', async () => {
            env.sandbox.stub(ampForm.xhr_, 'fetch').rejects({});

            changeInput(input, 'Another Name');
            await ampForm.submit_(ActionTrust_Enum.HIGH);

            expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
          });
        });
      }
    );

    describes.fakeWin(
      'Initialize from URL',
      {
        amp: {
          ampdoc: variant.ampdoc,
          extensions: ['amp-form'],
        },
        win: {
          location:
            'https://example.com/amps.html?textNoInit=1&hiddenAmpReplace=1&text=1&radio=1&checkbox=on&select=1&textarea=1',
          top: {
            location: 'https://example-top.com',
          },
        },
      },
      (env) => {
        let doc;
        let createElement;

        beforeEach(() => {
          doc = env.ampdoc.getRootNode();
          const ownerDoc = doc.ownerDocument || doc;
          createElement = ownerDoc.createElement.bind(ownerDoc);
        });

        function getAmpFormWithInitialization(initFromUrl) {
          const form = createElement('form');
          form.setAttribute('method', 'GET');
          if (initFromUrl) {
            form.setAttribute('data-initialize-from-url', '');
          }

          // Create inputs that do not support initialization from URL
          const textNoInit = createElement('input');
          textNoInit.setAttribute('type', 'text');
          textNoInit.setAttribute('name', 'textNoInit');
          textNoInit.setAttribute('value', '0');
          form.appendChild(textNoInit);

          const hiddenAmpReplace = createElement('input');
          hiddenAmpReplace.setAttribute('type', 'hidden');
          hiddenAmpReplace.setAttribute('name', 'hiddenAmpReplace');
          hiddenAmpReplace.setAttribute('value', '0');
          hiddenAmpReplace.setAttribute('data-amp-replace', '');
          hiddenAmpReplace.setAttribute('data-allow-initialization', '');
          form.appendChild(hiddenAmpReplace);

          // Create inputs that support initialization from URL
          const text = createElement('input');
          text.setAttribute('type', 'text');
          text.setAttribute('name', 'text');
          text.setAttribute('value', '0');
          text.setAttribute('data-allow-initialization', '');
          form.appendChild(text);

          const radio0 = createElement('input');
          radio0.setAttribute('type', 'radio');
          radio0.setAttribute('name', 'radio');
          radio0.setAttribute('checked', '');
          radio0.setAttribute('value', '0');
          radio0.setAttribute('data-allow-initialization', '');
          form.appendChild(radio0);

          const radio1 = createElement('input');
          radio1.setAttribute('type', 'radio');
          radio1.setAttribute('name', 'radio');
          radio1.setAttribute('value', '1');
          radio1.setAttribute('data-allow-initialization', '');
          form.appendChild(radio1);

          const checkbox = createElement('input');
          checkbox.setAttribute('type', 'checkbox');
          checkbox.setAttribute('name', 'checkbox');
          checkbox.setAttribute('data-allow-initialization', '');
          form.appendChild(checkbox);

          const select = createElement('select');
          select.setAttribute('name', 'select');
          select.setAttribute('data-allow-initialization', '');
          const option1 = createElement('option');
          option1.setAttribute('value', '0');
          option1.setAttribute('selected', '');
          const option2 = createElement('option');
          option2.setAttribute('value', '1');
          select.appendChild(option1);
          select.appendChild(option2);
          form.appendChild(select);

          const textarea = createElement('textarea');
          textarea.setAttribute('name', 'textarea');
          textarea.setAttribute('data-allow-initialization', '');
          textarea.innerHTML = '0';
          form.appendChild(textarea);

          env.ampdoc.getBody().appendChild(form);
          const ampForm = new AmpForm(form, 'amp-form-test-id');
          return Promise.resolve({
            ampForm,
            fields: {
              textNoInit,
              hiddenAmpReplace,
              text,
              radio0,
              radio1,
              checkbox,
              select,
              textarea,
            },
          });
        }

        it('should not be dirty', () => {
          return getAmpFormWithInitialization(true).then((response) => {
            const {ampForm} = response;
            const form = ampForm.form_;

            expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
          });
        });

        it('should selectively initialize fields', () => {
          return getAmpFormWithInitialization(true).then((response) => {
            const {fields} = response;

            // URL: ?textNoInit=1&hiddenAmpReplace=1&text=1&radio=1&checkbox=on&select=1&textarea=1

            // field value/checked should not change
            expect(fields['textNoInit'].value).to.equal('0');
            expect(fields['hiddenAmpReplace'].value).to.equal('0');

            // field value/checked should change
            expect(fields['text'].value).to.equal('1');
            expect(fields['radio0'].checked).to.be.false;
            expect(fields['radio1'].checked).to.be.true;
            expect(fields['checkbox'].checked).to.be.true;
            expect(fields['select'].value).to.equal('1');
            expect(fields['textarea'].value).to.equal('1');
          });
        });

        it('should not initialize fields in unsupported form', () => {
          return getAmpFormWithInitialization(false).then((response) => {
            const {fields} = response;

            // field value/checked should not change
            expect(fields['textNoInit'].value).to.equal('0');
            expect(fields['hiddenAmpReplace'].value).to.equal('0');
            expect(fields['text'].value).to.equal('0');
            expect(fields['radio0'].checked).to.be.true;
            expect(fields['radio1'].checked).to.be.false;
            expect(fields['checkbox'].checked).to.be.false;
            expect(fields['select'].value).to.equal('0');
            expect(fields['textarea'].value).to.equal('0');
          });
        });
      }
    );
  }
);
