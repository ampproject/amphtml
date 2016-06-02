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


  it('should do nothing if already prevented', () => {
    evt.defaultPrevented = true;
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(0);
    expect(tgt.classList.length).to.equal(0);
  });

  it('should do nothing of no target', () => {
    evt.target = null;
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(0);
    expect(tgt.classList.length).to.equal(0);
  });

  it('should prevent submit and add invalid class', () => {
    tgt.checkValidity = sandbox.stub().returns(false);
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(1);
    expect(tgt.checkValidity.callCount).to.equal(1);
    expect(tgt.classList.length).to.equal(1);
    expect(tgt.classList[0]).to.equal('amp-form-invalid');
    sandbox.restore();
    preventDefaultSpy.reset();
    tgt.checkValidity.reset();

    tgt.checkValidity = sandbox.stub().returns(false);
    tgt.classList.add('amp-form-valid');
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(1);
    expect(tgt.checkValidity.callCount).to.equal(1);
    expect(tgt.classList.length).to.equal(1);
    expect(tgt.classList[0]).to.equal('amp-form-invalid');
  });

  it('should not prevent default and add valid class', () => {
    tgt.checkValidity = sandbox.stub().returns(true);
    tgt.classList.add('amp-form-invalid');
    onDocumentFormSubmit_(evt);
    expect(preventDefaultSpy.callCount).to.equal(0);
    expect(tgt.checkValidity.callCount).to.equal(1);
    expect(tgt.classList.length).to.equal(1);
    expect(tgt.classList[0]).to.equal('amp-form-valid');
  });
});
