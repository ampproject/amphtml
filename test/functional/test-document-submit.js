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
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form action must start with "https:/);

    tgt.setAttribute('action', 'https://cdn.ampproject.org');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form action should not be on AMP CDN/);

    tgt.setAttribute('action', 'https://valid.example.com');
    tgt.removeAttribute('target');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form target attribute is required/);

    tgt.setAttribute('target', '_self');
    expect(() => onDocumentFormSubmit_(evt)).to.throw(
        /form target=_self is invalid/);

    tgt.setAttribute('target', '_blank');
    expect(() => onDocumentFormSubmit_(evt)).to.not.throw;
  });

  it('should add __amp_source_origin to action before submit', () => {
    evt.target.setAttribute('action',
        'https://example.com/?__amp_source_origin=12');
    expect(() => onDocumentFormSubmit_(evt))
        .to.throw(/Source origin is not allowed in/);

    evt.target.__AMP_INIT_ACTION__ = null;
    evt.target.setAttribute('action', 'https://example.com/');
    onDocumentFormSubmit_(evt);
    expect(evt.target.getAttribute('action')).to.contain(
        '__amp_source_origin');
    expect(() => onDocumentFormSubmit_(evt)).to.not.throw(
        /Source origin is not allowed in/);

    // Should not throw on any subsequent submits and use initial
    // value of action.
    evt.target.setAttribute('action',
        'https://www.example.com/?a=1&__amp_source_origin=example1.com&b=2');
    onDocumentFormSubmit_(evt);
    expect(evt.target.getAttribute('action')).to.contain(
        '__amp_source_origin=http%3A%2F%2Flocalhost%3A9876');
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
