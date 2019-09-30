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
import {Services} from '../../../../src/services';
import {
  installFormProxy,
  setBlacklistedPropertiesForTesting,
} from '../form-proxy';
import {parseUrlDeprecated} from '../../../../src/url';

const PROPS = [
  'id',
  'action',
  'method',
  'style',
  'acceptCharset',
  'attributes',
  'elements',
  'children',
  'draggable',
  'hidden',
  'autocomplete',
];

describes.repeated(
  'installFormProxy',
  {
    'modern w/o inputs': {},
    'modern w/inputs': {inputs: true},
    'legacy w/o inputs': {blacklist: true},
    'legacy w/ inputs': {blacklist: true, inputs: true},
    'no EventTarget': {eventTarget: true},
  },
  (name, variant) => {
    let form;
    let inputs;
    let sandbox;

    before(() => {
      sandbox = sinon.sandbox;

      // Stub only to work around the fact that there's no Ampdoc, so the service
      // cannot be retrieved.
      // Otherwise this test would barf because `form` is detached.
      sandbox.stub(Services, 'urlForDoc').returns({
        parse: parseUrlDeprecated,
      });
    });

    after(() => {
      sandbox.restore();
    });

    beforeEach(() => {
      form = document.createElement('form');
      form.id = 'form1';
      form.action = 'https://example.org/submit';
      form.method = 'post';
      form.setAttribute('accept-charset', 'OTHER');

      // Inputs.
      if (variant.inputs) {
        const inputNames = PROPS.slice(0);
        // Also, add some methods, which are never blacklisted.
        inputNames.push('getAttribute');
        inputNames.push('submit');
        inputs = {};
        inputNames.forEach(name => {
          const input = document.createElement('input');
          input.id = name;
          form.appendChild(input);
          inputs[name] = input;
        });
      }

      // Test blacklist.
      if (variant.blacklist) {
        setBlacklistedPropertiesForTesting(PROPS);
      }

      const eventTarget = window.EventTarget;
      if (variant.eventTarget) {
        window.EventTarget = null;
      }

      // Install proxy.
      installFormProxy(form);

      if (eventTarget) {
        window.EventTarget = eventTarget;
      }
    });

    afterEach(() => {
      delete window.FormProxy;
      setBlacklistedPropertiesForTesting(null);
    });

    it('should initialize correctly', () => {
      expect(form.$p).to.be.ok;
      expect(form.$p.form_).to.equal(form);
    });

    it('should NOT proxy consts', () => {
      expect(form.ELEMENT_NODE).to.equal(1);
      expect(form.$p.ELEMENT_NODE).to.be.undefined;
    });

    it('should proxy methods', () => {
      expect(form.$p.getAttribute('id')).to.equal('form1');
      expect(form.$p.submit).to.be.a('function');
      if (inputs) {
        expect(form.getAttribute).to.equal(inputs.getAttribute);
        expect(form.submit).to.equal(inputs.submit);
      } else {
        expect(form.getAttribute).to.be.a('function');
        expect(form.getAttribute('id')).to.equal('form1');
        expect(form.submit).to.be.a('function');
      }
    });

    it('should proxy attribute-based properties', () => {
      expect(form.$p.id).to.equal('form1');
      expect(form.$p.method).to.equal('post');
      expect(form.$p.acceptCharset).to.equal('OTHER');
      if (inputs) {
        expect(form.id).to.equal(inputs.id);
        expect(form.method).to.equal(inputs.method);
        expect(form.acceptCharset).to.equal(inputs.acceptCharset);
      } else {
        expect(form.id).to.equal('form1');
        expect(form.method).to.equal('post');
        expect(form.acceptCharset).to.equal('OTHER');
      }
    });

    it('should proxy attribute-based property writes', () => {
      form.$p.id = 'form2';
      expect(form.$p.id).to.equal('form2');
      expect(form.$p.getAttribute('id')).to.equal('form2');
      if (inputs) {
        expect(form.id).to.equal(inputs.id);
        expect(form.getAttribute).to.equal(inputs.getAttribute);
      } else {
        expect(form.id).to.equal('form2');
        expect(form.getAttribute('id')).to.equal('form2');
      }
    });

    it('should proxy draggable attribute', () => {
      expect(form.$p.draggable).to.be.false;

      form.$p.setAttribute('draggable', 'true');
      expect(form.$p.draggable).to.be.true;

      form.$p.setAttribute('draggable', 'false');
      expect(form.$p.draggable).to.be.false;

      form.$p.draggable = true;
      expect(form.$p.getAttribute('draggable')).to.equal('true');

      form.$p.draggable = false;
      expect(form.$p.getAttribute('draggable')).to.equal('false');
    });

    it('should proxy hidden attribute', () => {
      expect(form.$p.hidden).to.be.false;

      form.$p.setAttribute('hidden', '');
      expect(form.$p.hidden).to.be.true;

      form.$p.setAttribute('hidden', 'true');
      expect(form.$p.hidden).to.be.true;

      form.$p.setAttribute('hidden', 'false');
      expect(form.$p.hidden).to.be.true;

      form.$p.removeAttribute('hidden');
      expect(form.$p.hidden).to.be.false;

      form.$p.hidden = true;
      expect(form.$p.getAttribute('hidden')).to.equal('');

      form.$p.hidden = false;
      expect(form.$p.getAttribute('hidden')).to.be.null;
    });

    it('should proxy novalidate attribute', () => {
      expect(form.$p.noValidate).to.be.false;

      form.$p.setAttribute('novalidate', '');
      expect(form.$p.noValidate).to.be.true;

      form.$p.setAttribute('novalidate', 'true');
      expect(form.$p.noValidate).to.be.true;

      form.$p.setAttribute('novalidate', 'false');
      expect(form.$p.noValidate).to.be.true;

      form.$p.removeAttribute('novalidate');
      expect(form.$p.noValidate).to.be.false;

      form.$p.noValidate = true;
      expect(form.$p.getAttribute('novalidate')).to.equal('');

      form.$p.noValidate = false;
      expect(form.$p.getAttribute('novalidate')).to.be.null;
    });

    it('should proxy autocomplete attribute', () => {
      // "on" by default.
      expect(form.$p.autocomplete).to.equal('on');

      form.$p.setAttribute('autocomplete', 'off');
      expect(form.$p.autocomplete).to.equal('off');

      form.$p.autocomplete = 'on';
      expect(form.$p.getAttribute('autocomplete')).to.equal('on');
    });

    it('should proxy action', () => {
      expect(form.$p.action).to.equal('https://example.org/submit');
      if (inputs) {
        expect(form.action).to.equal(inputs.action);
      } else {
        expect(form.action).to.equal('https://example.org/submit');
      }

      // Relative URLs should also work.
      form.$p.setAttribute('action', 'submit2');
      expect(form.$p.action).to.match(/http?\:\/\/.*\/submit2/);
      if (inputs) {
        expect(form.action).to.equal(inputs.action);
      } else {
        expect(form.action).to.match(/http?\:\/\/.*\/submit2/);
      }
    });

    it('should proxy style', () => {
      expect(form.$p.style.display).to.equal('');
      if (inputs) {
        expect(form.style).to.equal(inputs.style);
      } else {
        expect(form.style.display).to.equal('');
      }

      form.$p.style.display = 'none';
      expect(form.$p.style.display).to.equal('none');
      if (inputs) {
        expect(form.style).to.equal(inputs.style);
      } else {
        expect(form.style.display).to.equal('none');
      }
    });

    it('should proxy elements and children', () => {
      const allInputs = [];
      if (inputs) {
        for (const k in inputs) {
          allInputs.push(inputs[k]);
        }
      }
      const allChildren = allInputs.slice(0);
      expect(form.$p.elements.length).to.equal(allInputs.length);
      expect(form.$p.children.length).to.equal(allChildren.length);

      // Create one input and one non-input.
      const input1 = document.createElement('input');
      form.$p.appendChild(input1);
      allInputs.push(input1);
      allChildren.push(input1);
      const div1 = document.createElement('div');
      form.$p.appendChild(div1);
      allChildren.push(div1);

      expect(form.$p.elements.length).to.equal(allInputs.length);
      for (let i = 0; i < form.$p.elements.length; i++) {
        expect(allInputs).to.contain(form.$p.elements[i]);
      }
      expect(form.$p.children.length).to.equal(allChildren.length);
      for (let i = 0; i < form.$p.children.length; i++) {
        expect(allChildren).to.contain(form.$p.children[i]);
      }
    });

    it('should proxy attributes', () => {
      const iniCount = form.$p.attributes.length;
      form.$p.setAttribute('other', '');
      expect(form.$p.attributes.length).to.equal(iniCount + 1);
      expect(form.$p.attributes['other']).to.be.ok;
    });

    it('should proxy dataset', () => {
      expect(form.$p.dataset['other']).to.not.exist;
      form.$p.setAttribute('data-other', '');
      expect(form.$p.dataset['other']).to.exist;
    });
  }
);
