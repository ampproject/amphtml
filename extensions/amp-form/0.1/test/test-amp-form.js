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

import {AmpForm} from '../amp-form';
import * as sinon from 'sinon';

describe('amp-form', () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should assert valid action-xhr when provided', () => {
    const form = document.createElement('form');
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
    const form = document.createElement('form');
    form.addEventListener = sandbox.spy();
    form.setAttribute('action-xhr', 'https://example.com');
    new AmpForm(form);
    expect(form.addEventListener.called).to.be.true;
    expect(form.addEventListener.calledWith('submit')).to.be.true;
  });

  it('should do nothing if defaultPrevented', () => {
    const form = document.createElement('form');
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
    const form = document.createElement('form');
    const nameInput = document.createElement('input');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Miller');
    form.appendChild(nameInput);
    form.setAttribute('action-xhr', 'https://example.com');
    const ampForm = new AmpForm(form);
    ampForm.xhr_.fetchJson = sandbox.spy();
    const event = {
      target: form,
      preventDefault: sandbox.spy(),
      defaultPrevented: false,
    };
    ampForm.handleSubmit_(event);
    expect(event.preventDefault.called).to.be.true;
    expect(ampForm.xhr_.fetchJson.called).to.be.true;
    expect(ampForm.xhr_.fetchJson.calledWith('https://example.com')).to.be.true;

    const xhrCall = ampForm.xhr_.fetchJson.getCall(0);
    const config = xhrCall.args[1];
    expect(config.body.get('name')).to.be.equal('John Miller');
    expect(config.method).to.equal('GET');
    expect(config.credentials).to.equal('include');
    expect(config.requireAmpResponseSourceOrigin).to.be.true;
  });

});
