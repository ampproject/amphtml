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

import {
  getFormAsObject,
  isDisabled,
  isFieldDefault,
  isFieldEmpty,
} from '../../src/form.js';

describes.realWin('getFormAsObject', {}, (env) => {
  let form;

  beforeEach(() => {
    form = env.win.document.createElement('form');
    env.win.document.body.appendChild(form);
  });

  it('excludes disabled input', () => {
    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.name = 'foo';
    input.value = 'bar';
    input.disabled = true;
    form.appendChild(input);

    expect(getFormAsObject(form)).to.be.an('object').that.is.empty;
  });

  it('excludes input with disabled ancestral fieldset', () => {
    const fieldset = env.win.document.createElement('fieldset');
    fieldset.disabled = true;
    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.name = 'foo';
    input.value = 'bar';
    fieldset.appendChild(input);
    form.appendChild(fieldset);

    expect(getFormAsObject(form)).to.be.an('object').that.is.empty;
  });

  it('excludes input without name', () => {
    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.value = 'bar';
    form.appendChild(input);

    expect(getFormAsObject(form)).to.be.an('object').that.is.empty;
  });

  it('returns text input entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.name = 'foo';
    input.value = 'bar';
    form.appendChild(input);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns text input entries with empty value', () => {
    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.name = 'foo';
    form.appendChild(input);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['']});
  });

  it('returns textarea entries', () => {
    const textarea = env.win.document.createElement('textarea');
    textarea.name = 'foo';
    textarea.value = 'bar';
    form.appendChild(textarea);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns checked checkbox entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'checkbox';
    input.name = 'foo';
    input.value = 'bar';
    input.checked = true;
    form.appendChild(input);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('excludes unchecked checkbox entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'checkbox';
    input.name = 'foo';
    input.value = 'bar';
    input.checked = false;
    form.appendChild(input);

    expect(getFormAsObject(form)).to.be.an('object').that.is.empty;
  });

  it('returns checked radio button entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'radio';
    input.name = 'foo';
    input.value = 'bar';
    input.checked = true;
    form.appendChild(input);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('excludes unchecked radio button entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'radio';
    input.name = 'foo';
    input.value = 'bar';
    input.checked = false;
    form.appendChild(input);

    expect(getFormAsObject(form)).to.be.an('object').that.is.empty;
  });

  it('returns first option for select with nothing selected', () => {
    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = false;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'bar';
    selectedOption.selected = false;

    const unselectedOption = env.win.document.createElement('option');
    unselectedOption.value = 'bang';
    unselectedOption.selected = false;

    select.appendChild(selectedOption);
    select.appendChild(unselectedOption);
    form.appendChild(select);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns empty for multi-select with nothing selected', () => {
    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = true;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'bar';
    selectedOption.selected = false;

    const unselectedOption = env.win.document.createElement('option');
    unselectedOption.value = 'bang';
    unselectedOption.selected = false;

    select.appendChild(selectedOption);
    select.appendChild(unselectedOption);
    form.appendChild(select);

    expect(getFormAsObject(form)).to.deep.equal({});
  });

  it('returns selected entry in single-select', () => {
    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = false;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'bar';
    selectedOption.selected = true;

    const unselectedOption = env.win.document.createElement('option');
    unselectedOption.value = 'bang';
    unselectedOption.selected = false;

    select.appendChild(selectedOption);
    select.appendChild(unselectedOption);
    form.appendChild(select);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns single selected entry in multi-select', () => {
    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = true;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'bar';
    selectedOption.selected = true;

    const unselectedOption = env.win.document.createElement('option');
    unselectedOption.value = 'bang';
    unselectedOption.selected = false;

    select.appendChild(selectedOption);
    select.appendChild(unselectedOption);
    form.appendChild(select);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns multiple selected entries in multi-select', () => {
    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = true;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'bar';
    selectedOption.selected = true;

    const unselectedOption = env.win.document.createElement('option');
    unselectedOption.value = 'bang';
    unselectedOption.selected = true;

    select.appendChild(selectedOption);
    select.appendChild(unselectedOption);
    form.appendChild(select);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar', 'bang']});
  });

  it('returns the first submit input entries if none focused', () => {
    const input = env.win.document.createElement('input');
    input.type = 'submit';
    input.name = 'foo';
    input.value = 'bar';
    form.appendChild(input);

    const input2 = env.win.document.createElement('input');
    input2.type = 'submit';
    input2.name = 'baz';
    input2.value = 'quux';
    form.appendChild(input2);

    env.sandbox.defineProperty(form, 'ownerDocument', {
      get() {
        return {activeElement: input};
      },
    });
    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns focused submit input entries', () => {
    const input = env.win.document.createElement('input');
    input.type = 'submit';
    input.name = 'foo';
    input.value = 'bar';
    form.appendChild(input);

    const input2 = env.win.document.createElement('input');
    input2.type = 'submit';
    input2.name = 'baz';
    input2.value = 'quux';
    form.appendChild(input2);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});

    env.sandbox.defineProperty(form, 'ownerDocument', {
      get() {
        return {activeElement: input2};
      },
    });
    expect(getFormAsObject(form)).to.deep.equal({'baz': ['quux']});
  });

  it('returns the first submit button entries if none focused', () => {
    const input = env.win.document.createElement('button');
    input.name = 'foo';
    input.value = 'bar';
    form.appendChild(input);

    const input2 = env.win.document.createElement('button');
    input2.name = 'baz';
    input2.value = 'quux';
    form.appendChild(input2);

    env.sandbox.defineProperty(form, 'ownerDocument', {
      get() {
        return {activeElement: env.win.document.body};
      },
    });
    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});
  });

  it('returns focused button input entries', () => {
    const input = env.win.document.createElement('button');
    input.name = 'foo';
    input.value = 'bar';
    form.appendChild(input);

    const input2 = env.win.document.createElement('button');
    input2.name = 'baz';
    input2.value = 'quux';
    form.appendChild(input2);

    expect(getFormAsObject(form)).to.deep.equal({'foo': ['bar']});

    env.sandbox.defineProperty(form, 'ownerDocument', {
      get() {
        return {activeElement: input2};
      },
    });
    expect(getFormAsObject(form)).to.deep.equal({'baz': ['quux']});
  });

  it('returns multiple form entries', () => {
    const form = env.win.document.createElement('form');

    const input = env.win.document.createElement('input');
    input.type = 'text';
    input.name = 'foo1';
    input.value = 'bar';

    const checkbox = env.win.document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'foo';
    checkbox.value = 'bar';
    checkbox.checked = true;

    const textarea = env.win.document.createElement('textarea');
    textarea.name = 'foo2';
    textarea.value = 'bar';

    const select = env.win.document.createElement('select');
    select.name = 'foo';
    select.multiple = false;

    const selectedOption = env.win.document.createElement('option');
    selectedOption.value = 'baz';
    selectedOption.selected = true;

    select.appendChild(selectedOption);

    form.appendChild(input);
    form.appendChild(checkbox);
    form.appendChild(textarea);
    form.appendChild(select);

    const formDataObject = getFormAsObject(form);

    expect(formDataObject)
      .to.be.an('object')
      .that.has.all.keys('foo', 'foo1', 'foo2');
    expect(formDataObject)
      .to.have.property('foo')
      .that.has.deep.members(['bar', 'baz']);
    expect(formDataObject)
      .to.have.property('foo1')
      .that.has.deep.members(['bar']);
    expect(formDataObject)
      .to.have.property('foo2')
      .that.has.deep.members(['bar']);
  });
});

describes.fakeWin('isDisabled', {}, (env) => {
  let doc;

  beforeEach(() => {
    doc = env.win.document;
  });

  describe('elements without ancestral fieldset', () => {
    let element;

    beforeEach(() => {
      element = doc.createElement('input');
    });

    it('returns true for disabled elements', () => {
      element.disabled = true;
      expect(isDisabled(element)).to.be.true;
    });

    it('returns false for enabled elements', () => {
      element.disabled = false;
      expect(isDisabled(element)).to.be.false;
    });
  });

  describe('elements with ancestral fieldset', () => {
    let element, elementAncestralFieldset;

    beforeEach(() => {
      element = doc.createElement('input');
      elementAncestralFieldset = doc.createElement('fieldset');
      elementAncestralFieldset.appendChild(element);
    });

    it('returns true for enabled elements with disabled ancestral fieldset', () => {
      element.disabled = false;
      elementAncestralFieldset.disabled = true;
      expect(isDisabled(element)).to.be.true;
    });

    it('returns false for enabled elements with enabled ancestral fieldset', () => {
      element.disabled = false;
      elementAncestralFieldset.disabled = false;
      expect(isDisabled(element)).to.be.false;
    });

    it('returns true for disabled elements with enabled ancestral fieldset', () => {
      element.disabled = true;
      elementAncestralFieldset.disabled = false;
      expect(isDisabled(element)).to.be.true;
    });
  });
});

describes.realWin('isFieldDefault', {}, (env) => {
  let doc;

  beforeEach(() => {
    doc = env.win.document;
  });

  describe('text field', () => {
    let textField;

    beforeEach(() => {
      textField = doc.createElement('input');
      textField.setAttribute('value', 'default');
    });

    it("returns true if text field's value matches its default value", () => {
      textField.value = 'default';
      expect(isFieldDefault(textField)).to.be.true;
    });

    it("returns false if text field's value does not match its default value", () => {
      textField.value = 'not default';
      expect(isFieldDefault(textField)).to.be.false;
    });
  });

  describe('textarea', () => {
    let textarea;

    beforeEach(() => {
      textarea = doc.createElement('textarea');
      textarea.textContent = 'default';
    });

    it("returns true if textarea's value matches its default value", () => {
      textarea.value = 'default';
      expect(isFieldDefault(textarea)).to.be.true;
    });

    it("returns false if textarea's value does not match its default value", () => {
      textarea.value = 'not default';
      expect(isFieldDefault(textarea)).to.be.false;
    });
  });

  describe('radio button', () => {
    let optionA, optionB;

    beforeEach(() => {
      optionA = doc.createElement('input');
      optionA.setAttribute('type', 'radio');
      optionA.setAttribute('name', 'radio');
      optionA.setAttribute('checked', 'checked');

      optionB = doc.createElement('input');
      optionB.setAttribute('type', 'radio');
      optionB.setAttribute('name', 'radio');

      // Radio buttons need to be inserted into the DOM for the "radio group"
      // (the constraint that only one may be selected at a time) to be
      // recognized.
      doc.body.appendChild(optionA);
      doc.body.appendChild(optionB);
    });

    it('returns true if the radio button is in its default state', () => {
      optionA.checked = true;
      expect(isFieldDefault(optionA)).to.be.true;
      expect(isFieldDefault(optionB)).to.be.true;
    });

    it('returns false if the radio button is not in its default state', () => {
      optionB.checked = true;
      expect(isFieldDefault(optionA)).to.be.false;
      expect(isFieldDefault(optionB)).to.be.false;
    });
  });

  describe('checkbox', () => {
    let checkbox;

    beforeEach(() => {
      checkbox = doc.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('checked', 'checked');
    });

    it('returns true if checkbox is in its default state', () => {
      checkbox.checked = true;
      expect(isFieldDefault(checkbox)).to.be.true;
    });

    it('returns false if checkbox is not in its default state', () => {
      checkbox.checked = false;
      expect(isFieldDefault(checkbox)).to.be.false;
    });
  });

  describe('single select dropdown', () => {
    let dropdown;

    beforeEach(() => {
      dropdown = doc.createElement('select');

      const optionA = doc.createElement('option');
      optionA.setAttribute('selected', 'selected');
      const optionB = doc.createElement('option');

      dropdown.appendChild(optionA);
      dropdown.appendChild(optionB);
    });

    it("returns true if the dropdown's selections match its default selections", () => {
      dropdown.options[0].selected = true;
      expect(isFieldDefault(dropdown)).to.be.true;
    });

    it("returns false if the dropdown's selections does not match its default selections", () => {
      dropdown.options[1].selected = true;
      expect(isFieldDefault(dropdown)).to.be.false;
    });
  });

  describe('multi select dropdown', () => {
    let dropdown;

    beforeEach(() => {
      dropdown = doc.createElement('select');
      dropdown.setAttribute('multiple', 'multiple');

      const optionA = doc.createElement('option');
      optionA.setAttribute('selected', 'selected');
      const optionB = doc.createElement('option');

      dropdown.appendChild(optionA);
      dropdown.appendChild(optionB);
    });

    it("returns true if the dropdown's selections match its default selections", () => {
      dropdown.options[0].selected = true;
      expect(isFieldDefault(dropdown)).to.be.true;
    });

    it("returns false if the dropdown's selections does not match its default selections", () => {
      dropdown.options[0].selected = true;
      dropdown.options[1].selected = true;
      expect(isFieldDefault(dropdown)).to.be.false;
    });
  });
});

describes.fakeWin('isFieldEmpty', {}, (env) => {
  let doc;

  beforeEach(() => {
    doc = env.win.document;
  });

  describe('checkbox', () => {
    let checkbox;

    beforeEach(() => {
      checkbox = doc.createElement('input');
      checkbox.type = 'checkbox';
    });

    it('returns false if the checkbox is checked', () => {
      checkbox.checked = true;
      expect(isFieldEmpty(checkbox)).to.be.false;
    });

    it('returns true if the checkbox is not checked', () => {
      checkbox.checked = false;
      expect(isFieldEmpty(checkbox)).to.be.true;
    });
  });

  describe('radio button', () => {
    let radio;

    beforeEach(() => {
      radio = doc.createElement('input');
      radio.type = 'radio';
    });

    it('returns false if the radio is checked', () => {
      radio.checked = true;
      expect(isFieldEmpty(radio)).to.be.false;
    });

    it('returns true if the radio is not checked', () => {
      radio.checked = false;
      expect(isFieldEmpty(radio)).to.be.true;
    });
  });

  describe('text field', () => {
    let textField;

    beforeEach(() => {
      textField = doc.createElement('input');
      textField.type = 'text';
    });

    it('returns true if the text field is empty', () => {
      textField.value = '';
      expect(isFieldEmpty(textField)).to.be.true;
    });

    it('returns false if the text field is not empty', () => {
      textField.value = 'some text';
      expect(isFieldEmpty(textField)).to.be.false;
    });
  });

  describe('textarea', () => {
    let textarea;

    beforeEach(() => {
      textarea = doc.createElement('textarea');
    });

    it('returns true if the textarea is empty', () => {
      textarea.value = '';
      expect(isFieldEmpty(textarea)).to.be.true;
    });

    it('returns false if the textarea is not empty', () => {
      textarea.value = 'some text';
      expect(isFieldEmpty(textarea)).to.be.false;
    });
  });

  describe('dropdown menu', () => {
    it('always returns false', () => {
      const dropdown = doc.createElement('select');
      const optionA = doc.createElement('option');
      const optionB = doc.createElement('option');
      dropdown.appendChild(optionA);
      dropdown.appendChild(optionB);

      optionA.selected = false;
      optionB.selected = false;

      expect(isFieldEmpty(dropdown)).to.be.false;
    });
  });

  describe('unsupported elements', () => {
    const UNSUPPORTED = 'not a supported field element.';

    it('throws an error', () => {
      const unrecognized = doc.createElement('div');
      expect(() => isFieldEmpty(unrecognized)).to.throw(UNSUPPORTED);
    });
  });
});
