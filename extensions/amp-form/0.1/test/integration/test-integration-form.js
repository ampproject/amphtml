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

import {AmpForm} from '../../amp-form';
import {timerFor} from '../../../../../src/timer';
import {AmpMustache} from '../../../../amp-mustache/0.1/amp-mustache';
import {registerExtendedTemplate,} from
    '../../../../../src/service/template-impl';


describes.realWin('AmpForm Integration', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
  },
}, env => {
  const baseUrl = 'http://localhost:31862';
  let doc;
  let sandbox;
  let timer;

  beforeEach(() => {
    sandbox = env.sandbox;
    doc = env.win.document;
    timer = timerFor(env.win);
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('custom-template', 'amp-mustache');
    doc.body.appendChild(scriptElement);
    registerExtendedTemplate(env.win, 'amp-mustache', AmpMustache);
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

    if (config.successTemplate) {
      const successDiv = doc.createElement('div');
      successDiv.setAttribute('submit-success', '');
      const template = doc.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template./*OK*/innerHTML = config.successTemplate;
      successDiv.appendChild(template);
      form.appendChild(successDiv);
    }

    if (config.errorTemplate) {
      const successDiv = doc.createElement('div');
      successDiv.setAttribute('submit-error', '');
      const template = doc.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template./*OK*/innerHTML = config.errorTemplate;
      successDiv.appendChild(template);
      form.appendChild(successDiv);
    }

    doc.body.appendChild(form);
    return form;
  }

  // Flakey timeouts on saucelabs.
  describe.skip('on=submit:form.submit', () => {
    it('should be protected from recursive-submission', () => {
      const form = getForm({
        id: 'sameform',
        actionXhr: baseUrl + '/form/post',
        on: 'submit:sameform.submit',
      });
      const ampForm = new AmpForm(form, 'sameform');
      sandbox.spy(ampForm, 'handleXhrSubmit_');
      sandbox.spy(ampForm, 'handleSubmitAction_');
      const fetch = sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));

      return timer.promise(100).then(() => {
        return fetch.returnValues[0];
      }).then(() => {
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

  // Flakey timeouts on saucelabs.
  describe.skip('Submit xhr-POST', () => {
    it('should submit and render success', () => {
      const form = getForm({
        id: 'form1',
        actionXhr: baseUrl + '/form/post/success',
        successTemplate: 'Thanks {{name}} for adding your interests:' +
            ' {{#interests}}{{title}} {{/interests}}.',
        errorTemplate: 'Should not render this.',
      });
      const ampForm = new AmpForm(form, 'form1');

      const fetch = sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));

      return timer.promise(100).then(() => {
        return fetch.returnValues[0];
      }).then(() => {
        const rendered = form.querySelectorAll('[i-amp-rendered]');
        expect(rendered.length).to.equal(1);
        expect(rendered[0].textContent).to.equal(
            'Thanks John Miller for adding your interests: ' +
            'Football Basketball Writing .');
      });
    });

    it('should submit and render error', () => {
      const form = getForm({
        id: 'form1',
        actionXhr: baseUrl + '/form/post/error',
        successTemplate: 'Should not render this.',
        errorTemplate: 'Oops. {{name}} your email {{email}} is already ' +
            'subscribed.',
      });
      const ampForm = new AmpForm(form, 'form1');
      // Stubbing timeout to catch async-thrown errors and expect
      // them. These catch errors thrown inside the catch-clause of the
      // xhr request using rethrowAsync.
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

      const fetch = sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));

      return timer.promise(100).then(() => {
        return fetch.returnValues[0].catch(() => {});
      }).then(() => {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.match(/HTTP error 500/);
        const rendered = form.querySelectorAll('[i-amp-rendered]');
        expect(rendered.length).to.equal(1);
        expect(rendered[0].textContent).to.equal(
            'Oops. John Miller your email john@miller.what is already ' +
            'subscribed.');
      });
    });
  });

  // Flakey timeouts on saucelabs.
  describe.skip('Submit xhr-GET', () => {
    it('should submit and render success', () => {
      const form = getForm({
        id: 'form1',
        method: 'GET',
        actionXhr: baseUrl + '/form/post/success',
        successTemplate: 'Thanks {{name}} for adding your interests:' +
        ' {{#interests}}{{title}} {{/interests}}.',
        errorTemplate: 'Should not render this.',
      });
      const ampForm = new AmpForm(form, 'form1');

      const fetch = sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));

      return timer.promise(100).then(() => {
        return fetch.returnValues[0];
      }).then(() => {
        const rendered = form.querySelectorAll('[i-amp-rendered]');
        expect(rendered.length).to.equal(1);
        expect(rendered[0].textContent).to.equal(
            'Thanks John Miller for adding your interests: ' +
            'Football Basketball Writing .');
      });
    });

    it('should submit and render error', () => {
      const form = getForm({
        id: 'form1',
        actionXhr: baseUrl + '/form/post/error',
        successTemplate: 'Should not render this.',
        errorTemplate: 'Oops. {{name}} your email {{email}} is already ' +
        'subscribed.',
      });
      const ampForm = new AmpForm(form, 'form1');
      const errors = [];
      // Stubbing timeout to catch async-thrown errors and expect
      // them. These catch errors thrown inside the catch-clause of the
      // xhr request using rethrowAsync.
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

      const fetch = sandbox.spy(ampForm.xhr_, 'fetch');
      form.dispatchEvent(new Event('submit'));

      return timer.promise(100).then(() => {
        return fetch.returnValues[0].catch(() => {});
      }).then(() => {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.match(/HTTP error 500/);
        const rendered = form.querySelectorAll('[i-amp-rendered]');
        expect(rendered.length).to.equal(1);
        expect(rendered[0].textContent).to.equal(
            'Oops. John Miller your email john@miller.what is already ' +
            'subscribed.');
      });
    });
  });
});
