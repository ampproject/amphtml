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

import {installFormProxy} from '../form-proxy';


describes.sandboxed('installFormProxy', {}, () => {
  let form;

  beforeEach(() => {
    form = document.createElement('form');
    form.id = 'form1';
    form.action = 'https://example.org/submit';
    form.method = 'post';
    installFormProxy(form);
  });

  describe('w/o masking inputs', () => {
    it('should initialize correctly', () => {
      expect(form.$p).to.be.ok;
      expect(form.$p.form_).to.equal(form);
    });

    it('should proxy properties', () => {
      expect(form.id).to.equal('form1');
      expect(form.$p.id).to.equal('form1');

      expect(form.action).to.equal('https://example.org/submit');
      expect(form.$p.action).to.equal('https://example.org/submit');

      expect(form.method).to.equal('post');
      expect(form.$p.method).to.equal('post');
    });

    it('should proxy methods', () => {
      expect(form.getAttribute('id')).to.equal('form1');
      expect(form.$p.getAttribute('id')).to.equal('form1');
    });

    it('should proxy property writes', () => {
      form.$p.id = 'form2';

      expect(form.id).to.equal('form2');
      expect(form.$p.id).to.equal('form2');
      expect(form.getAttribute('id')).to.equal('form2');
      expect(form.$p.getAttribute('id')).to.equal('form2');
    });
  });

  describe('with masking inputs', () => {
    let idInput, actionInput, methodInput, getAttrInput;

    beforeEach(() => {
      idInput = document.createElement('input');
      idInput.id = 'id';
      form.appendChild(idInput);

      actionInput = document.createElement('input');
      actionInput.id = 'action';
      form.appendChild(actionInput);

      methodInput = document.createElement('input');
      methodInput.id = 'method';
      form.appendChild(methodInput);

      getAttrInput = document.createElement('input');
      getAttrInput.id = 'getAttribute';
      form.appendChild(getAttrInput);
    });

    it('should proxy properties', () => {
      expect(form.$p.id).to.equal('form1');
      expect(form.id).to.equal(idInput);

      expect(form.$p.action).to.equal('https://example.org/submit');
      expect(form.action).to.equal(actionInput);

      expect(form.$p.method).to.equal('post');
      expect(form.method).to.equal(methodInput);
    });

    it('should proxy methods', () => {
      expect(form.$p.getAttribute('id')).to.equal('form1');
      expect(form.getAttribute).to.equal(getAttrInput);
    });

    it('should proxy property writes', () => {
      form.$p.id = 'form2';

      expect(form.$p.id).to.equal('form2');
      expect(form.id).to.equal(idInput);
      expect(form.$p.getAttribute('id')).to.equal('form2');
      expect(form.getAttribute).to.equal(getAttrInput);
    });
  });
});
