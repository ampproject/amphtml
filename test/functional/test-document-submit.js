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

import {onDocumentFormSubmit_} from '../../src/document-submit';
import * as sinon from 'sinon';

describe('test-document-submit onDocumentFormSubmit_', () => {
  let sandbox;
  let evt;
  let tgt;
  let preventDefaultSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    preventDefaultSpy = sandbox.spy();
    tgt = document.createElement('form');
    tgt.action = 'https://www.google.com';
    tgt.target = '_blank';
    tgt.checkValidity = sandbox.stub();
    evt = {
      target: tgt,
      preventDefault: preventDefaultSpy,
      defaultPrevented: false,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should check target and action attributes', () => {
    tgt.removeAttribute('action');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form action attribute is required/);

    tgt.setAttribute('action', 'http://example.com');
    tgt.__AMP_INIT_ACTION__ = undefined;
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form action must start with "https:/);

    tgt.setAttribute('action', 'https://cdn.ampproject.org');
    tgt.__AMP_INIT_ACTION__ = undefined;
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form action should not be on AMP CDN/);

    tgt.setAttribute('action', 'https://valid.example.com');
    tgt.__AMP_INIT_ACTION__ = undefined;
    tgt.removeAttribute('target');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form target attribute is required/);

    tgt.setAttribute('action', 'https://valid.example.com');
    tgt.__AMP_INIT_ACTION__ = undefined;
    tgt.setAttribute('target', '_self');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form target=_self is invalid/);

    tgt.setAttribute('action', 'https://valid.example.com');
    tgt.__AMP_INIT_ACTION__ = undefined;
    tgt.setAttribute('target', '_blank');
    expect(() => onDocumentFormSubmit_(evt)).to.not.throw;
  });

  it('should assert none of the inputs named __amp_source_origin', () => {
    const illegalInput = document.createElement('input');
    illegalInput.setAttribute('type', 'hidden');
    illegalInput.setAttribute('name', '__amp_source_origin');
    illegalInput.value = 'https://example.com';
    tgt.appendChild(illegalInput);
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /Illegal input name, __amp_source_origin found/);
  });

  it('should assert __amp_source_origin is not set in action', () => {
    evt.target.setAttribute('action',
        'https://example.com/?__amp_source_origin=12');
    expect(() => onDocumentFormSubmit_(evt))
        .to.throw(/Source origin is not allowed in/);
  });

  it('should fail when POST and action-xhr is not set', () => {
    evt.target.removeAttribute('action');
    evt.target.setAttribute('method', 'post');
    expect(() => onDocumentFormSubmit_(evt))
        .to.throw(/Only XHR based \(via action-xhr attribute\) submissions/);
    expect(preventDefaultSpy).to.have.been.called;
    const callCount = preventDefaultSpy.callCount;

    evt.target.setAttribute('method', 'post');
    evt.target.setAttribute('action-xhr', 'https://example.com');
    expect(() => onDocumentFormSubmit_(evt)).to.not.throw();
    expect(preventDefaultSpy.callCount).to.equal(callCount + 1);
  });

  it('should fail when action is provided for POST', () => {
    evt.target.setAttribute('method', 'post');
    expect(() => onDocumentFormSubmit_(evt))
        .to.throw(/form action attribute is invalid for method=POST/);
    expect(preventDefaultSpy).to.have.been.called;
  });

  it('should do nothing if already prevented', () => {
    evt.defaultPrevented = true;
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(0);
  });

  it('should do nothing of no target', () => {
    evt.target = null;
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(0);
  });

  it('should prevent submit', () => {
    tgt.checkValidity = sandbox.stub().returns(false);
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(1);
    expect(tgt.checkValidity.callCount).to.equal(1);
    sandbox.restore();
    preventDefaultSpy.reset();
    tgt.checkValidity.reset();

    tgt.checkValidity = sandbox.stub().returns(false);
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(1);
    expect(tgt.checkValidity.callCount).to.equal(1);
  });

  it('should not check validity if novalidate provided', () => {
    tgt.setAttribute('novalidate', '');
    tgt.checkValidity = sandbox.stub().returns(false);
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(0);
  });

  it('should not prevent default', () => {
    tgt.checkValidity = sandbox.stub().returns(true);
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(1);
  });
});
