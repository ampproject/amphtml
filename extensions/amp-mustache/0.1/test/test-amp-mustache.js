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
    const templateElement = document.createElement('div');
    templateElement.textContent = 'value = {{value}}';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({value: 'abc'});
    expect(result./*OK*/innerHTML).to.equal('value = abc');
  });

  it('should sanitize output', () => {
    const templateElement = document.createElement('div');
    templateElement./*OK*/innerHTML = 'value = <a href="{{value}}">abc</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({
      value: /*eslint no-script-url: 0*/ 'javascript:alert();',
    });
    expect(result./*OK*/innerHTML).to.equal('value = <a>abc</a>');
  });

  describe('Sanitizing data- attributes', () => {
    it('should parse data-&style=value output correctly', () => {
      const templateElement = document.createElement('div');
      templateElement./*OK*/innerHTML = 'value = <a href="{{value}}"' +
          ' data-&style="color:red;">abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal('value = <a data-="">abc</a>');
    });

    it('should parse data-&attr=value output correctly', () => {
      const templateElement = document.createElement('div');
      templateElement./*OK*/innerHTML = 'value = <a data-&href="{{value}}">' +
          'abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'https://google.com/',
      });
      expect(result./*OK*/innerHTML).to.equal('value = <a data-=""' +
          ' href="https://google.com/">abc</a>');
    });

    it('should allow for data-attr=value to output correctly', () => {
      const templateElement = document.createElement('div');
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

  it('should sanitize triple-mustache', () => {
    const templateElement = document.createElement('div');
    templateElement.textContent = 'value = {{{value}}}';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({value: '<b>abc</b><img><div>def</div>'});
    expect(result./*OK*/innerHTML).to.equal('value = <b>abc</b>');
  });

  it('should unwrap output', () => {
    const templateElement = document.createElement('div');
    templateElement./*OK*/innerHTML = '<a>abc</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    const result = template.render({});
    expect(result.tagName).to.equal('A');
    expect(result./*OK*/innerHTML).to.equal('abc');
  });
});
