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

import {AmpEvents} from '../../../../../src/amp-events';
import {AmpForm, AmpFormService} from '../../amp-form';
import {AmpMustache} from '../../../../amp-mustache/0.1/amp-mustache';
import {Services} from '../../../../../src/services';
import {installGlobalSubmitListenerForDoc} from '../../../../../src/document-submit';
import {listenOncePromise} from '../../../../../src/event-helper';
import {poll} from '../../../../../testing/iframe';
import {registerExtendedTemplate} from '../../../../../src/service/template-impl';

/** @const {number} */
const RENDER_TIMEOUT = 15000;

describes.realWin(
  'AmpForm Integration',
  {
    amp: {
      runtimeOn: true,
      ampdoc: 'single',
    },
    mockFetch: false,
  },
  env => {
    const {testServerPort} = window.ampTestRuntimeConfig;
    const baseUrl = `http://localhost:${testServerPort}`;
    let doc;
    let sandbox;

    const realSetTimeout = window.setTimeout;
    const stubSetTimeout = (callback, delay) => {
      realSetTimeout(() => {
        try {
          callback();
        } catch (e) {}
      }, delay);
    };

    beforeEach(() => {
      sandbox = env.sandbox;
      doc = env.win.document;

      sandbox.stub(Services, 'formSubmitForDoc').returns(() => {
        fire: () => {};
      });

      const mustache = document.createElement('script');
      mustache.setAttribute('custom-template', 'amp-mustache');
      doc.body.appendChild(mustache);
      registerExtendedTemplate(env.win, 'amp-mustache', AmpMustache);

      const form = document.createElement('script');
      form.setAttribute('custom-element', 'amp-form');
      doc.head.appendChild(form);

      new AmpFormService(env.ampdoc);

      // Wait for submit listener to be installed before starting tests.
      return installGlobalSubmitListenerForDoc(env.ampdoc);
    });

    function getForm(config) {
      const form = doc.createElement('form');
      form.id = config.id || 'test-form';
      form.setAttribute('method', config.method || 'POST');
      form.setAttribute('target', config.target || '_top');

      const nameInput = doc.createElement('input');
      nameInput.setAttribute('name', 'name');
      nameInput.setAttribute('value', 'John Miller');
      form.appendChild(nameInput);
      if (config.actionXhr) {
        form.setAttribute('action-xhr', config.actionXhr);
      }
      if (config.action) {
        form.setAttribute('action', config.action);
      }
      const submitButton = doc.createElement('input');
      submitButton.setAttribute('type', 'submit');
      form.appendChild(submitButton);

      if (config.on) {
        form.setAttribute('on', config.on);
      }

      if (config.success) {
        const {message, template} = config.success;
        const successDiv = doc.createElement('div');
        successDiv.setAttribute('submit-success', '');
        if (template) {
          const child = doc.createElement('template');
          child.setAttribute('type', 'amp-mustache');
          child./*OK*/ innerHTML = message;
          successDiv.appendChild(child);
        } else {
          successDiv./*OK*/ innerHTML = message;
        }

        form.appendChild(successDiv);
      }

      if (config.error) {
        const {message, template} = config.error;
        const errorDiv = doc.createElement('div');
        errorDiv.setAttribute('submit-error', '');
        if (template) {
          const child = doc.createElement('template');
          child.setAttribute('type', 'amp-mustache');
          child./*OK*/ innerHTML = message;
          errorDiv.appendChild(child);
        } else {
          errorDiv./*OK*/ innerHTML = message;
        }
        form.appendChild(errorDiv);
      }

      doc.body.appendChild(form);
      return form;
    }

    const describeChrome = describe
      .configure()
      .skipFirefox()
      .skipSafari()
      .skipEdge();

    describeChrome.run('on=submit:form.submit', () => {
      it('should be protected from recursive-submission', () => {
        const form = getForm({
          id: 'sameform',
          actionXhr: baseUrl + '/form/post',
          on: 'submit:sameform.submit',
        });
        const ampForm = new AmpForm(form, 'sameform');
        sandbox.spy(ampForm, 'handleXhrSubmit_');
        sandbox.spy(ampForm, 'handleSubmitAction_');
        sandbox.spy(ampForm.xhr_, 'fetch');
        const fetch = poll('submit request sent', () =>
          ampForm.xhrSubmitPromiseForTesting()
        );

        form.dispatchEvent(new Event('submit'));
        return fetch.then(() => {
          // Due to recursive nature of 'on=submit:sameform.submit' we expect
          // the action handler to be called twice, the first time for the
          // actual user submission.
          // The second time in response to the `submit` event being triggered
          // and sameform.submit being invoked.
          expect(ampForm.handleSubmitAction_).to.have.been.calledTwice;
          // However, only the first invocation should be handled completely.
          // and any subsequent calls should be stopped early-on.
          expect(ampForm.handleXhrSubmit_).to.have.been.calledOnce;
          expect(ampForm.xhr_.fetch).to.have.been.calledOnce;
        });
      });
    });

    // TODO(cvializ, #19647): Broken on SL Chrome 71.
    describeChrome.skip('Submit xhr-POST', function() {
      this.timeout(RENDER_TIMEOUT);

      it('should submit and render success', () => {
        const form = getForm({
          id: 'form1',
          actionXhr: baseUrl + '/form/post/success',
          success: {
            message:
              'Thanks {{name}} for adding your interests:' +
              ' {{#interests}}{{title}} {{/interests}}.',
            template: true,
          },
          error: {message: 'Should not render this.', template: true},
        });
        const ampForm = new AmpForm(form, 'form1');
        const fetch = poll('submit request sent', () =>
          ampForm.xhrSubmitPromiseForTesting()
        );
        const render = listenOncePromise(form, AmpEvents.DOM_UPDATE);

        form.dispatchEvent(new Event('submit'));
        return fetch
          .then(() => render)
          .then(() => {
            const rendered = form.querySelector('[i-amphtml-rendered]');
            expect(rendered.textContent).to.equal(
              'Thanks John Miller for adding your interests: ' +
                'Football Basketball Writing .'
            );
          });
      });

      it('should submit and render error', () => {
        // Stubbing timeout to catch async-thrown errors and expect
        // them. These catch errors thrown inside the catch-clause of the
        // xhr request using rethrowAsync.
        sandbox.stub(window, 'setTimeout').callsFake(stubSetTimeout);

        const form = getForm({
          id: 'form1',
          actionXhr: baseUrl + '/form/post/error',
          success: {message: 'Should not render this.', template: true},
          error: {
            message:
              'Oops. {{name}} your email {{email}} is already subscribed.',
            template: true,
          },
        });
        const ampForm = new AmpForm(form, 'form1');
        const fetchSpy = sandbox.spy(ampForm.xhr_, 'fetch');
        const fetch = poll(
          'submit request sent',
          () => fetchSpy.returnValues[0]
        );
        const render = listenOncePromise(form, AmpEvents.DOM_UPDATE);

        form.dispatchEvent(new Event('submit'));
        return fetch.then(
          () => {
            throw new Error('UNREACHABLE');
          },
          fetchError => {
            expect(fetchError.message).to.match(/HTTP error 500/);
            return render.then(() => {
              const rendered = form.querySelector('[i-amphtml-rendered]');
              expect(rendered.textContent).to.equal(
                'Oops. John Miller your email john@miller.what is already ' +
                  'subscribed.'
              );
            });
          }
        );
      });
    });

    // TODO(cvializ, #19647): Broken on SL Chrome 71.
    describeChrome.skip('Submit xhr-GET', function() {
      this.timeout(RENDER_TIMEOUT);

      it('should submit and render success', () => {
        const form = getForm({
          id: 'form1',
          method: 'GET',
          actionXhr: baseUrl + '/form/post/success',
          success: {
            message:
              'Thanks {{name}} for adding your interests:' +
              ' {{#interests}}{{title}} {{/interests}}.',
            template: true,
          },
          error: {message: 'Should not render this.', template: true},
        });
        const ampForm = new AmpForm(form, 'form1');
        const fetch = poll('submit request sent', () =>
          ampForm.xhrSubmitPromiseForTesting()
        );
        const render = listenOncePromise(form, AmpEvents.DOM_UPDATE);

        form.dispatchEvent(new Event('submit'));
        return fetch
          .then(() => render)
          .then(() => {
            const rendered = form.querySelectorAll('[i-amphtml-rendered]');
            expect(rendered.length).to.equal(1);
            expect(rendered[0].textContent).to.equal(
              'Thanks John Miller for adding your interests: ' +
                'Football Basketball Writing .'
            );
          });
      });

      it('should submit and render error', () => {
        // Stubbing timeout to catch async-thrown errors and expect
        // them. These catch errors thrown inside the catch-clause of the
        // xhr request using rethrowAsync.
        sandbox.stub(window, 'setTimeout').callsFake(stubSetTimeout);

        const form = getForm({
          id: 'form1',
          actionXhr: baseUrl + '/form/post/error',
          success: {message: 'Should not render this.', template: true},
          error: {
            message:
              'Oops. {{name}} your email {{email}} is already subscribed.',
            template: true,
          },
        });
        const ampForm = new AmpForm(form, 'form1');
        const fetchSpy = sandbox.spy(ampForm.xhr_, 'fetch');
        const fetch = poll(
          'submit request sent',
          () => fetchSpy.returnValues[0]
        );
        const render = listenOncePromise(form, AmpEvents.DOM_UPDATE);

        form.dispatchEvent(new Event('submit'));
        return fetch.then(
          () => {
            throw new Error('UNREACHABLE');
          },
          fetchError => {
            expect(fetchError.message).to.match(/HTTP error 500/);
            return render.then(() => {
              const rendered = form.querySelector('[i-amphtml-rendered]');
              expect(rendered.textContent).to.equal(
                'Oops. John Miller your email john@miller.what is already ' +
                  'subscribed.'
              );
            });
          }
        );
      });
    });

    // TODO(cvializ, #19647): Broken on SL Chrome 71.
    describeChrome.skip('Submit result message', () => {
      it('should render messages with or without a template', () => {
        // Stubbing timeout to catch async-thrown errors and expect
        // them. These catch errors thrown inside the catch-clause of the
        // xhr request using rethrowAsync.
        sandbox.stub(window, 'setTimeout').callsFake(stubSetTimeout);

        const form = getForm({
          id: 'form1',
          actionXhr: baseUrl + '/form/post/error',
          success: {message: 'Should not render this.', template: false},
          error: {
            message:
              'Oops! Your email is already subscribed.' +
              '<amp-img src="/examples/img/ampicon.png" ' +
              'width="42" height="42"></amp-img>',
            template: false,
          },
        });
        const ampForm = new AmpForm(form, 'form1');
        const fetchSpy = sandbox.spy(ampForm.xhr_, 'fetch');
        const fetch = poll(
          'submit request sent',
          () => fetchSpy.returnValues[0]
        );

        form.dispatchEvent(new Event('submit'));
        return fetch.then(
          () => {
            throw new Error('UNREACHABLE');
          },
          fetchError => {
            expect(fetchError.message).to.match(/HTTP error 500/);

            // It shouldn't have the i-amphtml-rendered attribute since no
            // template was rendered.
            const rendered = form.querySelectorAll('[i-amphtml-rendered]');
            expect(rendered.length).to.equal(0);

            // Any amp elements inside the message should be layed out.
            const layout = listenOncePromise(form, AmpEvents.LOAD_START);
            return layout.then(() => {
              const img = form.querySelector('amp-img img');
              expect(img.src).to.contain('/examples/img/ampicon.png');
            });
          }
        );
      });
    });
  }
);
