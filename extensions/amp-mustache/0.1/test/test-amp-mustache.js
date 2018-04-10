/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  AmpMustache,
} from '../amp-mustache';

describe('amp-mustache template', () => {

  it('should render', () => {
    const templateElement = document.createElement('template');
    templateElement.content.textContent = 'value = {{value}}';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({value: 'abc'});
    expect(result./*OK*/innerHTML).to.equal('value = abc');
  });

  it('should render {{.}} from string', () => {
    const templateElement = document.createElement('template');
    templateElement.content.textContent = 'value = {{.}}';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render('abc');
    expect(result./*OK*/innerHTML).to.equal('value = abc');
  });

  // TODO(dvoytenko, #14336): Fails due to console errors.
  it.skip('should sanitize output', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a href="{{value}}">abc</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({
      value: /*eslint no-script-url: 0*/ 'javascript:alert();',
    });
    expect(result./*OK*/innerHTML).to.equal('value = <a target="_top">abc</a>');
  });

  it('should sanitize templated tag names', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <{{value}} href="javascript:alert(0)">abc</{{value}}>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({
      value: 'a',
    });
    expect(result./*OK*/innerHTML).to.not
        .equal('<a href="javascript:alert(0)">abc</a>');
    expect(result.firstElementChild).to.be.null;
  });

  // TODO(dvoytenko, #14336): Fails due to console errors.
  describe.skip('Sanitizing data- attributes', () => {

    it('should sanitize templated attribute names', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'value = <a {{value}}="javascript:alert(0)">abc</a>';
      let template = new AmpMustache(templateElement);
      template.compileCallback();
      let result = template.render({
        value: 'href',
      });
      expect(result).to.not.equal('<a href="javascript:alert(0)">abc</a>');
      expect(result.firstElementChild.getAttribute('href')).to.be.null;

      templateElement./*OK*/innerHTML =
          'value = <p [{{value}}]="javascript:alert()">ALERT</p>';
      template = new AmpMustache(templateElement);
      template.compileCallback();
      result = template.render({
        value: 'onclick',
      });
      expect(result).to.not
          .equal('<p [onclick]="javascript:alert()">ALERT</p>');
      expect(result.firstElementChild.getAttribute('[onclick]')).to.be.null;
      expect(result.firstElementChild.getAttribute('onclick')).to.be.null;
    });

    it('should parse data-&style=value output correctly', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = <a href="{{value}}"' +
          ' data-&style="color:red;">abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a data-="" target="_top">abc</a>');
    });

    it('should parse data-&attr=value output correctly', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'value = <a data-&href="{{value}}">abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'https://google.com/',
      });
      expect(result./*OK*/innerHTML).to.equal('value = <a data-=""' +
          ' href="https://google.com/" target="_top">abc</a>');
    });

    it('should allow for data-attr=value to output correctly', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<a data-my-attr="{{invalidValue}}" data-my-id="{{value}}">abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'myid',
        invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a data-my-id="myid">abc</a>');
    });
  });

  // TODO(mkhatib, #14336): Fails due to console errors.
  describe.skip('Rendering Form Fields', () => {
    it('should allow rendering inputs', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" type="text" onchange="{{invalidValue}}">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'myid',
        invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid" type="text">');
    });

    it('should allow rendering textarea', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<textarea>{{value}}</textarea>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'Cool story bro.',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <textarea>Cool story bro.</textarea>');
    });

    it('should not allow image/file types rendering', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" type="{{type}}">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      let result = template.render({
        value: 'myid',
        type: 'image',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid">');

      result = template.render({
        value: 'myid',
        type: 'file',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid">');

      result = template.render({
        value: 'myid',
        type: 'text',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid" type="text">');

      result = template.render({
        value: 'myid',
        type: 'button',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid">');

      result = template.render({
        value: 'myid',
        type: 'password',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid">');
    });

    it('should sanitize form-related attrs properly', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" ' +
          'formaction="javascript:javascript:alert(1)" ' +
          'formmethod="get" form="form1" formtarget="blank" formnovalidate ' +
          'formenctype="">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'myid',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid">');
    });

    it('should not sanitize form tags', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<form><input value="{{value}}"></form><input value="hello">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'myid',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <form><input value="myid"></form><input value="hello">');
    });
  });

  describe('Nested templates', () => {

    it('should not sanitize nested amp-mustache templates', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'text before a template ' +
          '<template type="amp-mustache">text inside template</template> ' +
          'text after a template';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({});
      expect(result./*OK*/innerHTML).to.equal(
          'text before a template ' +
          '<template type="amp-mustache">text inside template</template> ' +
          'text after a template');
    });

    it('should sanitize nested templates without type="amp-mustache"', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'text before a template ' +
          '<template>text inside template</template> ' +
          'text after a template';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({});
      expect(result./*OK*/innerHTML).to.equal(
          'text before a template  text after a template');
    });

    it('should not render variables inside a nested template', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'outer: {{outerOnlyValue}} {{mutualValue}} ' +
          '<template type="amp-mustache">nested: {{nestedOnlyValue}}' +
          ' {{mutualValue}}</template>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        outerOnlyValue: 'Outer',
        mutualValue: 'Mutual',
        nestedOnlyValue: 'Nested',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'outer: Outer Mutual ' +
          '<template type="amp-mustache">nested: {{nestedOnlyValue}}' +
          ' {{mutualValue}}</template>');
    });

    it('should compile and render nested templates when invoked', () => {
      const outerTemplateElement = document.createElement('template');
      outerTemplateElement./*OK*/innerHTML =
          'outer: {{value}} ' +
          '<template type="amp-mustache">nested: {{value}}</template>';
      const outerTemplate = new AmpMustache(outerTemplateElement);
      outerTemplate.compileCallback();
      const outerResult = outerTemplate.render({
        value: 'Outer',
      });
      const nestedTemplateElement = outerResult.querySelector('template');
      const nestedTemplate = new AmpMustache(nestedTemplateElement);
      nestedTemplate.compileCallback();
      const nestedResult = nestedTemplate.render({
        value: 'Nested',
      });
      expect(nestedResult./*OK*/innerHTML).to.equal('nested: Nested');
    });

    // TODO(danielrozenberg, #14336): Fails due to console errors.
    it.skip('should sanitize the inner template when it gets rendered', () => {
      const outerTemplateElement = document.createElement('template');
      outerTemplateElement./*OK*/innerHTML =
          'outer: {{value}} ' +
          '<template type="amp-mustache">' +
          '<div onclick="javascript:alert(\'I am evil\')">nested</div>: ' +
          '{{value}}</template>';
      const outerTemplate = new AmpMustache(outerTemplateElement);
      outerTemplate.compileCallback();
      const outerResult = outerTemplate.render({
        value: 'Outer',
      });
      const nestedTemplateElement = outerResult.querySelector('template');
      const nestedTemplate = new AmpMustache(nestedTemplateElement);
      nestedTemplate.compileCallback();
      const nestedResult = nestedTemplate.render({
        value: 'Nested',
      });
      expect(nestedResult./*OK*/innerHTML).to.equal(
          '<div>nested</div>: Nested');
    });

    it('should not allow users to pass data having key that starts with ' +
        '__AMP_NESTED_TEMPLATE_0 when there is a nested template', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'outer: {{value}} ' +
          '<template type="amp-mustache">nested: {{value}}</template>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        __AMP_NESTED_TEMPLATE_0: 'MUST NOT RENDER THIS',
        value: 'Outer',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'outer: Outer ' +
          '<template type="amp-mustache">nested: {{value}}</template>');
    });

    it('should render user data with a key __AMP_NESTED_TEMPLATE_0 when' +
        ' there are no nested templates, even though it is not a weird name' +
        ' for a template variable', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = '{{__AMP_NESTED_TEMPLATE_0}}';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        __AMP_NESTED_TEMPLATE_0: '123',
      });
      expect(result./*OK*/innerHTML).to.equal('123');
    });

  });

  it('should sanitize triple-mustache', () => {
    const templateElement = document.createElement('template');
    templateElement.content.textContent = 'value = {{{value}}}';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({value: '<b>abc</b><img><div>def</div>'});
    expect(result./*OK*/innerHTML).to.equal('value = <b>abc</b>');
  });

  it('should unwrap output', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML = '<a>abc</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({});
    expect(result.tagName).to.equal('A');
    expect(result./*OK*/innerHTML).to.equal('abc');
  });
});
