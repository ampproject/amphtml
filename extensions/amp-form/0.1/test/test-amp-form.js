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
import {AmpForm} from '../amp-form';
import * as sinon from 'sinon';
import {timer} from '../../../../src/timer';
import '../../../amp-mustache/0.1/amp-mustache';

describe('amp-form', () => {

  let sandbox;

  function getAmpForm(button1 = true, button2 = false) {
    return createIframePromise().then(iframe => {
      const form = getForm(iframe.doc, button1, button2);
      const ampForm = new AmpForm(form);
      return ampForm;
    });
  }

  function getForm(doc = document, button1 = true, button2 = false) {
    const form = doc.createElement('form');

    const nameInput = doc.createElement('input');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Miller');
    form.appendChild(nameInput);
    form.setAttribute('action-xhr', 'https://example.com');

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

  it('should listen to submit event', () => {
    const form = getForm();
    form.addEventListener = sandbox.spy();
    form.setAttribute('action-xhr', 'https://example.com');
    new AmpForm(form);
    expect(form.addEventListener.called).to.be.true;
    expect(form.addEventListener.calledWith('submit')).to.be.true;
  });

  it('should do nothing if defaultPrevented', () => {
    const form = getForm();
    form.setAttribute('action-xhr', 'https://example.com');
    const ampForm = new AmpForm(form);
    const event = {
      target: form,
      preventDefault: sandbox.spy(),
      defaultPrevented: true,
    };
    ampForm.handleSubmit_(event);
    expect(event.preventDefault.called).to.be.false;
  });

  it('should call fetchJson with the xhr action and form data', () => {
    return getAmpForm().then(ampForm => {
      sandbox.stub(ampForm.xhr_, 'fetchJson').returns(Promise.resolve());
      const event = {
        target: ampForm.form_,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
      };
      ampForm.handleSubmit_(event);
      expect(event.preventDefault.called).to.be.true;
      expect(ampForm.xhr_.fetchJson.called).to.be.true;
      expect(ampForm.xhr_.fetchJson.calledWith(
          'https://example.com')).to.be.true;

      const xhrCall = ampForm.xhr_.fetchJson.getCall(0);
      const config = xhrCall.args[1];
      expect(config.method).to.equal('GET');
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
        target: form,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
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
      expect(event.preventDefault.callCount).to.equal(3);
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
      const form = ampForm.form_;
      const event = {
        target: form,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
      };
      ampForm.handleSubmit_(event);
      expect(event.preventDefault.called).to.be.true;
      expect(ampForm.state_).to.equal('submitting');
      expect(form.className).to.contain('amp-form-submitting');
      expect(form.className).to.not.contain('amp-form-submit-error');
      expect(form.className).to.not.contain('amp-form-submit-success');
      fetchJsonResolver();
      return timer.promise(20).then(() => {
        expect(ampForm.state_).to.equal('submit-success');
        expect(form.className).to.not.contain('amp-form-submitting');
        expect(form.className).to.not.contain('amp-form-submit-error');
        expect(form.className).to.contain('amp-form-submit-success');
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
      const form = ampForm.form_;
      const event = {
        target: form,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
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
      });
    });
  });

  it('should allow rendering responses through templates', () => {
    return createIframePromise().then(iframe => {
      const form = iframe.doc.createElement('form');
      form.setAttribute('action-xhr', 'https://example.com');
      // Add a div[submit-error] with a template child.
      const errorContainer = iframe.doc.createElement('div');
      errorContainer.setAttribute('submit-error', '');
      form.appendChild(errorContainer);
      const errorTemplate = iframe.doc.createElement('template');
      errorTemplate.setAttribute('type', 'amp-mustache');
      errorTemplate.content.appendChild(
          iframe.doc.createTextNode('Error: {{message}}'));
      errorContainer.appendChild(errorTemplate);
      const renderedTemplate = iframe.doc.createElement('div');
      renderedTemplate.innerText = 'Error: hello there';
      const ampForm = new AmpForm(form);
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
        target: form,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
      };
      ampForm.handleSubmit_(event);
      fetchJsonRejecter({responseJson: {message: 'hello there'} });
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
    return createIframePromise().then(iframe => {
      const form = iframe.doc.createElement('form');
      form.setAttribute('action-xhr', 'https://example.com');
      const successContainer = iframe.doc.createElement('div');
      successContainer.setAttribute('submit-success', '');
      form.appendChild(successContainer);
      const successTemplate = iframe.doc.createElement('template');
      successTemplate.setAttribute('type', 'amp-mustache');
      successTemplate.content.appendChild(
          iframe.doc.createTextNode('Success: {{message}}'));
      successContainer.appendChild(successTemplate);
      const renderedTemplate = iframe.doc.createElement('div');
      renderedTemplate.innerText = 'Success: hello';
      renderedTemplate.setAttribute('i-amp-rendered', '');
      successContainer.appendChild(renderedTemplate);

      const newRender = iframe.doc.createElement('div');
      newRender.innerText = 'New Success: What What';

      const ampForm = new AmpForm(form);
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
        target: form,
        preventDefault: sandbox.spy(),
        defaultPrevented: false,
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
});
