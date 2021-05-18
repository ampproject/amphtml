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

import * as service from '../../../../src/service';
import {AmpMustache} from '../amp-mustache';
import {Purifier} from '../../../../src/purifier/purifier';
import mustache from '../../../../third_party/mustache/mustache';

describes.repeated(
  'amp-mustache 0.2',
  {
    'with script[type=text/plain][template=amp-mustache]': {
      templateType: 'script',
    },
    'with template[type=amp-mustache]': {templateType: 'template'},
  },
  (name, variant, env) => {
    let viewerCanRenderTemplates = false;

    beforeEach(() => {
      const getServiceForDocStub = env.sandbox.stub(
        service,
        'getServiceForDoc'
      );
      getServiceForDocStub.returns({
        hasCapability: (unused) => viewerCanRenderTemplates,
      });
    });

    // This test suite runs twice. First by creating templates of type template
    // and then by creating templates encapsulated within script.
    let innerHtmlSetup;
    let isTemplateType;
    let isTemplateTypeScript;
    let template;
    let templateElement;
    let textContentSetup;

    beforeEach(() => {
      const {templateType} = variant;
      templateElement = document.createElement(templateType);
      if (templateType == 'script') {
        templateElement.setAttribute('type', 'amp-mustache');
      }
      template = new AmpMustache(templateElement, window);
      isTemplateTypeScript = templateType == 'script';
      isTemplateType = templateType == 'template';
      textContentSetup = (contents) => {
        if (isTemplateType) {
          templateElement.content.textContent = contents;
        } else if (isTemplateTypeScript) {
          templateElement.textContent = contents;
        }
      };
      innerHtmlSetup = (html) => {
        if (isTemplateType) {
          templateElement.innerHTML = html;
        } else if (isTemplateTypeScript) {
          templateElement.textContent = html;
        }
      };
    });

    afterEach(() => (viewerCanRenderTemplates = false));

    it('should render', () => {
      textContentSetup('value = {{value}}');
      template.compileCallback();
      const data = {value: 'abc'};
      expect(template.render(data).innerHTML).to.equal('value = abc');
      expect(template.renderAsString(data)).to.equal('value = abc');
    });

    // https://github.com/ampproject/amphtml/pull/17401
    it('should render attrs with non-HTML namespaces', () => {
      innerHtmlSetup(
        '<svg width=50 height=50><g><image xlink:href="foo.svg" width=50 height=50></image></g></svg>'
      );
      template.compileCallback();
      const result = template.render({});
      expect(result./*OK*/ outerHTML).to.equal(
        '<svg height="50" width="50"><g><image height="50" width="50" xlink:href="foo.svg"></image></g></svg>'
      );
      // Make sure [xlink:href] has the right namespace.
      const image = result.querySelector('image');
      const href = image.getAttributeNode('xlink:href');
      expect(href.namespaceURI).to.equal('http://www.w3.org/1999/xlink');
      expect(href.value).to.equal('foo.svg');
    });

    it('should render {{.}} from string', () => {
      textContentSetup('value = {{.}}');
      template.compileCallback();
      const data = 'abc';
      expect(template.render(data).innerHTML).to.equal('value = abc');
      expect(template.renderAsString(data)).to.equal('value = abc');
    });

    it('should sanitize output', () => {
      innerHtmlSetup('value = <a href="{{value}}">abc</a>');
      template.compileCallback();
      const data = {
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      };
      expect(template.render(data).innerHTML).to.equal(
        'value = <a target="_top">abc</a>'
      );
      expect(template.renderAsString(data)).to.equal(
        'value = <a target="_top">abc</a>'
      );
    });

    it('should sanitize templated tag names', () => {
      innerHtmlSetup(
        'value = <{{value}} href="javascript:alert(0)">abc</{{value}}>'
      );
      template.compileCallback();
      const data = {
        value: 'a',
      };
      expect(template.render(data).innerHTML).to.not.equal(
        '<a href="javascript:alert(0)">abc</a>'
      );
      expect(template.renderAsString(data)).to.not.equal(
        '<a href="javascript:alert(0)">abc</a>'
      );
    });

    it('should unwrap output on compile', () => {
      innerHtmlSetup('<a>abc</a>');
      template.compileCallback();
      const result = template.render({});
      expect(result.tagName).to.equal('A');
      expect(result.innerHTML).to.equal('abc');
      expect(template.renderAsString({})).to.equal('<a>abc</a>');
    });

    it('should render fragments', () => {
      innerHtmlSetup('<a>abc</a><a>def</a>');
      template.compileCallback();
      const result = template.render({});
      expect(result.tagName).to.equal('DIV');
      expect(result.innerHTML).to.equal('<a>abc</a><a>def</a>');
      expect(template.renderAsString({})).to.equal('<a>abc</a><a>def</a>');
    });

    describe('Sanitizing data- attributes', () => {
      it('should sanitize templated attribute names', () => {
        innerHtmlSetup('value = <a {{value}}="javascript:alert(0)">abc</a>');
        template.compileCallback();
        const result = template.render({
          value: 'href',
        });
        expect(result).to.not.equal('<a href="javascript:alert(0)">abc</a>');
        expect(result.firstElementChild.getAttribute('href')).to.be.null;
      });

      it('should sanitize templated bind attribute names', () => {
        innerHtmlSetup('value = <p [{{value}}]="javascript:alert()">ALERT</p>');
        template.compileCallback();
        const result = template.render({
          value: 'onclick',
        });
        expect(result).to.not.equal(
          '<p [onclick]="javascript:alert()">ALERT</p>'
        );
        expect(result.firstElementChild.getAttribute('[onclick]')).to.be.null;
        expect(result.firstElementChild.getAttribute('onclick')).to.be.null;
      });

      it('should parse data-&style=value output correctly', () => {
        innerHtmlSetup(
          'value = <a href="{{value}}" data-&style="color:red;">abc</a>'
        );
        template.compileCallback();
        const result = template.render({
          value: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result.innerHTML).to.equal('value = <a target="_top">abc</a>');
      });

      it('should parse data-&attr=value output correctly', () => {
        innerHtmlSetup('value = <a data-&href="{{value}}">abc</a>');
        template.compileCallback();
        const result = template.render({
          value: 'https://google.com/',
        });
        expect(result.innerHTML).to.equal('value = <a>abc</a>');
      });

      it('should allow for data-attr=value to output correctly', () => {
        innerHtmlSetup(
          'value = ' +
            '<a data-my-attr="{{invalidValue}}" ' +
            'data-my-id="{{value}}">abc</a>'
        );
        template.compileCallback();
        const result = template.render({
          value: 'myid',
          invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result.innerHTML).to.equal(
          'value = ' +
            '<a data-my-id="myid" data-my-attr="javascript:alert();">abc</a>'
        );
      });
    });

    describe('Rendering Form Fields', () => {
      it('should allow rendering inputs', () => {
        innerHtmlSetup(
          'value = <input value="{{value}}" onchange="{{invalidValue}}">'
        );
        template.compileCallback();
        const result = template.render({
          value: 'myid',
          invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result.innerHTML).to.equal('value = <input value="myid">');
      });

      it('should allow rendering textarea', () => {
        innerHtmlSetup('value = <textarea>{{value}}</textarea>');
        template.compileCallback();
        const data = {value: 'Cool story bro.'};
        expect(template.render(data).innerHTML).to.equal(
          'value = <textarea>Cool story bro.</textarea>'
        );
        expect(template.renderAsString(data)).to.equal(
          'value = <textarea>Cool story bro.</textarea>'
        );
      });

      it('should not allow image/file input types rendering', () => {
        innerHtmlSetup('value = <input value="{{value}}" type="{{type}}">');
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
            type: 'image',
          });
          expect(result.innerHTML).to.equal('value = <input value="myid">');
        });

        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
            type: 'button',
          });
          expect(result.innerHTML).to.equal('value = <input value="myid">');
        });

        const fileResult = template.render({
          value: 'myid',
          type: 'file',
        });
        expect(fileResult.innerHTML).to.equal(
          'value = <input type="file" value="myid">'
        );

        const passwordResult = template.render({
          value: 'myid',
          type: 'password',
        });
        expect(passwordResult.innerHTML).to.equal(
          'value = <input type="password" value="myid">'
        );
      });

      it('should allow text input type rendering', () => {
        innerHtmlSetup('value = <input value="{{value}}" type="{{type}}">');
        template.compileCallback();
        const result = template.render({
          value: 'myid',
          type: 'text',
        });
        expect(result.innerHTML).to.equal(
          'value = <input type="text" value="myid">'
        );
      });

      it('should sanitize form-related attrs properly', () => {
        innerHtmlSetup(
          'value = ' +
            '<input value="{{value}}" ' +
            'formaction="javascript:javascript:alert(1)" ' +
            'formmethod="get" form="form1" formtarget="blank" formnovalidate ' +
            'formenctype="">'
        );
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
          });
          expect(result.innerHTML).to.equal('value = <input value="myid">');
        });
      });

      it('should not sanitize form tags', () => {
        innerHtmlSetup(
          'value = ' +
            '<form><input value="{{value}}"></form><input value="hello">'
        );
        template.compileCallback();
        const result = template.render({
          value: 'myid',
        });
        expect(result.innerHTML).to.equal(
          'value = <form><input value="myid"></form><input value="hello">'
        );
      });
    });

    describe('Nested templates', () => {
      it('should not sanitize nested amp-mustache templates', () => {
        innerHtmlSetup(
          'text before a template ' +
            '<template type="amp-mustache">text inside template</template> ' +
            'text after a template'
        );
        template.compileCallback();
        const result = template.render({});
        expect(result.innerHTML).to.equal(
          'text before a template ' +
            '<template type="amp-mustache">text inside template</template> ' +
            'text after a template'
        );
      });

      if (isTemplateType) {
        it('should sanitize nested templates without type="amp-mustache"', () => {
          innerHtmlSetup(
            'text before a template ' +
              '<template>text inside template</template> ' +
              'text after a template'
          );
          template.compileCallback();
          const result = template.render({});
          expect(result.innerHTML).to.equal(
            'text before a template  text after a template'
          );
        });

        it('should not render variables inside a nested template', () => {
          innerHtmlSetup(
            'outer: {{outerOnlyValue}} {{mutualValue}} ' +
              '<template type="amp-mustache">nested: {{nestedOnlyValue}}' +
              ' {{mutualValue}}</template>'
          );
          template.compileCallback();
          const result = template.render({
            outerOnlyValue: 'Outer',
            mutualValue: 'Mutual',
            nestedOnlyValue: 'Nested',
          });
          expect(result.innerHTML).to.equal(
            'outer: Outer Mutual ' +
              '<template type="amp-mustache">nested: {{nestedOnlyValue}}' +
              ' {{mutualValue}}</template>'
          );
        });

        it('should compile and render nested templates when invoked', () => {
          const outerTemplateElement = document.createElement('template');
          outerTemplateElement.innerHTML =
            'outer: {{value}} ' +
            '<template type="amp-mustache">nested: {{value}}</template>';
          const outerTemplate = new AmpMustache(outerTemplateElement, window);
          outerTemplate.compileCallback();
          const outerResult = outerTemplate.render({
            value: 'Outer',
          });
          const nestedTemplateElement = outerResult.querySelector('template');
          const nestedTemplate = new AmpMustache(nestedTemplateElement, window);
          nestedTemplate.compileCallback();
          const nestedResult = nestedTemplate.render({
            value: 'Nested',
          });
          expect(nestedResult.innerHTML).to.equal('nested: Nested');
        });

        it('should sanitize the inner template when it gets rendered', () => {
          const outerTemplateElement = document.createElement('template');
          outerTemplateElement.innerHTML =
            'outer: {{value}} ' +
            '<template type="amp-mustache">' +
            '<div onclick="javascript:alert(\'I am evil\')">nested</div>: ' +
            '{{value}}</template>';
          const outerTemplate = new AmpMustache(outerTemplateElement, window);
          outerTemplate.compileCallback();
          const outerResult = outerTemplate.render({
            value: 'Outer',
          });
          const nestedTemplateElement = outerResult.querySelector('template');
          const nestedTemplate = new AmpMustache(nestedTemplateElement, window);
          nestedTemplate.compileCallback();
          const nestedResult = nestedTemplate.render({
            value: 'Nested',
          });
          expect(nestedResult.innerHTML).to.equal('<div>nested</div>: Nested');
        });

        it(
          'should not allow users to pass data having key that starts with ' +
            '__AMP_NESTED_TEMPLATE_0 when there is a nested template',
          () => {
            templateElement.innerHTML =
              'outer: {{value}} ' +
              '<template type="amp-mustache">nested: {{value}}</template>';
            template.compileCallback();
            const result = template.render({
              __AMP_NESTED_TEMPLATE_0: 'MUST NOT RENDER THIS',
              value: 'Outer',
            });
            expect(result.innerHTML).to.equal(
              'outer: Outer ' +
                '<template type="amp-mustache">nested: {{value}}</template>'
            );
          }
        );

        it(
          'should render user data with a key __AMP_NESTED_TEMPLATE_0 when' +
            ' there are no nested templates, even though it is not a weird name' +
            ' for a template variable',
          () => {
            templateElement.innerHTML = '{{__AMP_NESTED_TEMPLATE_0}}';
            template.compileCallback();
            const result = template.render({
              __AMP_NESTED_TEMPLATE_0: '123',
            });
            expect(result.innerHTML).to.equal('123');
          }
        );
      }

      // Need to test this since DOMPurify doesn't have an required-attribute
      // tag allowlist API. Instead, we hack around it with custom hooks.
      it('should not allow unsupported templates after a supported one', () => {
        const html =
          '1<template type="amp-mustache">2</template>3<template>' +
          '4</template>5';
        innerHtmlSetup('{{{html}}}');
        template.compileCallback();
        const result = template.render({html});
        expect(result.innerHTML).to.equal(
          '1<template type="amp-mustache">2</template>35'
        );
      });
    });

    describe('triple-mustache', () => {
      it('should sanitize formatting related elements', () => {
        textContentSetup('value = {{{value}}}');
        template.compileCallback();
        const result = template.render({
          value:
            '<b>abc</b><img><div>def</div>' +
            '<br><code></code><del></del><em></em>' +
            '<i></i><ins></ins><mark></mark><s></s>' +
            '<small></small><strong></strong><sub></sub>' +
            '<sup></sup><time></time><u></u><hr>',
        });
        expect(result.innerHTML).to.equal(
          'value = <b>abc</b><div>def</div>' +
            '<br><code></code><del></del><em></em>' +
            '<i></i><ins></ins><mark></mark><s></s>' +
            '<small></small><strong></strong><sub></sub>' +
            '<sup></sup><time></time><u></u><hr>'
        );
      });

      it('should sanitize table related elements and anchor tags', () => {
        textContentSetup('value = {{{value}}}');
        template.compileCallback();
        const result = template.render({
          value:
            '<table class="valid-class">' +
            '<colgroup><col><col></colgroup>' +
            '<caption>caption</caption>' +
            '<thead><tr><th colspan="2">header</th></tr></thead>' +
            '<tbody><tr><td>' +
            '<a href="http://www.google.com">google</a>' +
            '</td></tr></tbody>' +
            '<tfoot><tr>' +
            '<td colspan="2"><span>footer</span></td>' +
            '</tr></tfoot>' +
            '</table>',
        });
        expect(result.innerHTML).to.equal(
          'value = <table class="valid-class">' +
            '<colgroup><col><col></colgroup>' +
            '<caption>caption</caption>' +
            '<thead><tr><th colspan="2">header</th></tr></thead>' +
            '<tbody><tr><td>' +
            '<a target="_top" href="http://www.google.com/">google</a>' +
            '</td></tr></tbody>' +
            '<tfoot><tr>' +
            '<td colspan="2"><span>footer</span></td>' +
            '</tr></tfoot>' +
            '</table>'
        );
      });

      it('should sanitize tags, removing unsafe attributes', () => {
        textContentSetup('value = {{{value}}}');
        template.compileCallback();
        const result = template.render({
          value:
            '<a href="javascript:alert(\'XSS\')">test</a>' +
            '<img src="x" onerror="alert(\'XSS\')" />',
        });
        expect(result.innerHTML).to.equal('value = <a>test</a>');
      });

      it('should not sanitize allowlisted elements', () => {
        textContentSetup('value = {{{value}}}');
        template.compileCallback();
        const result = template.render({
          value:
            '<h1>Heading 1</h1>' +
            '<h2>Heading 2</h2>' +
            '<h3>Heading 3</h3>' +
            '<amp-img></amp-img>',
        });
        expect(result.innerHTML).to.equal(
          'value = <h1>Heading 1</h1>' +
            '<h2>Heading 2</h2>' +
            '<h3>Heading 3</h3>' +
            '<amp-img i-amphtml-ignore=""></amp-img>'
        );
      });
    });

    describe('tables', () => {
      beforeEach(() => {
        textContentSetup(
          '<table>' +
            '<tbody>' +
            '<tr>' +
            '<td>{{content}}</td>' +
            '</tr>' +
            '{{#replies}}' +
            '<tr>' +
            '<td>{{content}}</td>' +
            '</tr>' +
            '{{/replies}}' +
            '</tbody>' +
            '</table>'
        );
        template.compileCallback();
      });
      if (isTemplateTypeScript) {
        it('should not foster text nodes in script template', () => {
          return allowConsoleError(() => {
            const data = {
              'content': 'Howdy',
              'replies': [{'content': 'hi'}],
            };
            const result =
              '<tbody>' +
              '<tr>' +
              '<td>Howdy</td>' +
              '</tr>' +
              '<tr>' +
              '<td>hi</td>' +
              '</tr>' +
              '</tbody>';
            expect(template.render(data).innerHTML).to.equal(result);
            expect(template.renderAsString(data)).to.equal(result);
          });
        });
      }
      if (isTemplateType) {
        it(
          'should foster text nodes in template[type="amp-mustache"]' +
            'destroying the templating',
          () => {
            return allowConsoleError(() => {
              const result = template.render({
                'content': 'Howdy',
                'replies': [{'content': 'hi'}],
              });
              // Given the mustache markup {{#replies}} is hoisted.
              // Expect the rendered HTML not to be what's expected.
              expect(result.innerHTML).to.equal(
                '<tbody>' +
                  '<tr>' +
                  '<td>Howdy</td>' +
                  '</tr>' +
                  '<tr>' +
                  '<td>Howdy</td>' +
                  '</tr>' +
                  '</tbody>'
              );
            });
          }
        );
      }
    });

    describe('viewer can render templates', () => {
      beforeEach(() => {
        viewerCanRenderTemplates = true;
      });

      it('should not call mustache parsing', () => {
        env.sandbox.spy(mustache, 'parse');
        template.compileCallback();
        expect(mustache.parse).to.have.not.been.called;
      });

      it('should not mustache render but still purify html', () => {
        env.sandbox.spy(Purifier.prototype, 'purifyHtml');
        env.sandbox.spy(mustache, 'render');
        template.setHtml('<div>test</div>');
        expect(mustache.render).to.have.not.been.called;
        expect(Purifier.prototype.purifyHtml).to.have.been.called;
      });
    });

    describe('setHtml()', () => {
      it('should unwrap singular element output', () => {
        template.compileCallback();
        const result = template.setHtml('<a>abc</a>');
        expect(result).to.have.length(1);
        expect(result[0].tagName).to.equal('A');
        expect(result[0].innerHTML).to.equal('abc');
      });

      it('should be undefined for singular text node output', () => {
        template.compileCallback();
        const result = template.setHtml('abc');
        expect(result).to.have.length(1);
        expect(result[0].tagName).to.equal('DIV');
        expect(result[0].innerHTML).to.equal('abc');
      });

      it('should unwrap output with many elements', () => {
        template.compileCallback();
        const result = template.setHtml('<a>abc</a><a>def</a>');
        expect(result).to.have.length(2);
        const {0: first, 1: second} = result;
        expect(first.tagName).to.equal('A');
        expect(first.innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('A');
        expect(second.innerHTML).to.equal('def');
      });

      it('should unwrap output with many elements and wrap text nodes', () => {
        const html = `<a>abc</a>
        def
        <a>ghi  </a>`;
        template.compileCallback();
        const result = template.setHtml(html);
        expect(result).to.have.length(3);
        const {0: first, 1: second, 2: third} = result;
        expect(first.tagName).to.equal('A');
        expect(first.innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('DIV');
        expect(second.innerHTML).to.equal('def');
        expect(third.tagName).to.equal('A');
        expect(third.innerHTML).to.equal('ghi  ');
      });

      it('should unwrap output with many elements and preserve subtrees', () => {
        const html = `
        <div>
          <a>abc</a>
        </div>
        def
        <a>ghi  </a>`;
        template.compileCallback();
        const result = template.setHtml(html);
        expect(result).to.have.length(3);
        const {0: first, 1: second, 2: third} = result;
        expect(first.tagName).to.equal('DIV');
        expect(first.children).to.have.length(1);
        expect(first.firstElementChild.tagName).to.equal('A');
        expect(first.firstElementChild.innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('DIV');
        expect(second.innerHTML).to.equal('def');
        expect(third.tagName).to.equal('A');
        expect(third.innerHTML).to.equal('ghi  ');
      });
    });
  }
);
