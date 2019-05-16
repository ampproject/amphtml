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

import {getFormAsObject} from '../../src/form.js';

describes.realWin('getFormAsObject', {}, env => {
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

    Object.defineProperty(form, 'ownerDocument', {
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

    Object.defineProperty(form, 'ownerDocument', {
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

    Object.defineProperty(form, 'ownerDocument', {
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

    Object.defineProperty(form, 'ownerDocument', {
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
