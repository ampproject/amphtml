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

import * as sanitizer from '../../../../src/sanitizer';
import * as service from '../../../../src/service';
import {AmpMustache} from '../amp-mustache';
import mustache from '../../../../third_party/mustache/mustache';

describes.repeated(
  'amp-mustache 0.1',
  {
    'with script[type=text/plain][template=amp-mustache]': {
      templateType: 'script',
    },
    'with template[type=amp-mustache]': {templateType: 'template'},
  },
  (name, variant) => {
    let viewerCanRenderTemplates = false;

    beforeEach(() => {
      const getServiceForDocStub = window.sandbox.stub(
        service,
        'getServiceForDoc'
      );
      getServiceForDocStub.returns({
        hasCapability: (unused) => viewerCanRenderTemplates,
      });
    });

    let innerHtmlSetup;
    let template;
    let templateElement;
    let textContentSetup;
    let isTemplateType;
    let isTemplateTypeScript;

    beforeEach(() => {
      const {templateType} = variant;
      templateElement = document.createElement(templateType);
      if (templateType == 'script') {
        templateElement.setAttribute('type', 'amp-mustache');
      }
      template = new AmpMustache(templateElement);
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
          templateElement./*OK*/ innerHTML = html;
        } else if (isTemplateTypeScript) {
          templateElement.textContent = html;
        }
      };
    });

    afterEach(() => (viewerCanRenderTemplates = false));

    it('should render', () => {
      textContentSetup('value = {{value}}');
      template.compileCallback();
      const result = template.render({value: 'abc'});
      expect(result./*OK*/ innerHTML).to.equal('value = abc');
    });

    it('should render {{.}} from string', () => {
      textContentSetup('value = {{.}}');
      template.compileCallback();
      const result = template.render('abc');
      expect(result./*OK*/ innerHTML).to.equal('value = abc');
    });

    it('should sanitize output', () => {
      innerHtmlSetup('value = <a href="{{value}}">abc</a>');
      template.compileCallback();
      allowConsoleError(() => {
        const result = template.render({
          value: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result./*OK*/ innerHTML).to.equal(
          'value = <a target="_top">abc</a>'
        );
      });
    });

    it('should sanitize templated tag names', () => {
      innerHtmlSetup(
        'value = <{{value}} href="javascript:alert(0)">abc</{{value}}>'
      );
      template.compileCallback();
      const result = template.render({
        value: 'a',
      });
      expect(result./*OK*/ innerHTML).to.not.equal(
        '<a href="javascript:alert(0)">abc</a>'
      );
    });

    describe('Sanitizing data- attributes', () => {
      it('should sanitize templated attribute names', () => {
        innerHtmlSetup('value = <a {{value}}="javascript:alert(0)">abc</a>');
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'href',
          });
          expect(result).to.not.equal('<a href="javascript:alert(0)">abc</a>');
          expect(result.firstElementChild.getAttribute('href')).to.be.null;
        });
      });

      it('should sanitize templated bind attribute names', () => {
        innerHtmlSetup('value = <p [{{value}}]="javascript:alert()">ALERT</p>');
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'onclick',
          });
          expect(result).to.not.equal(
            '<p [onclick]="javascript:alert()">ALERT</p>'
          );
          expect(result.firstElementChild.getAttribute('[onclick]')).to.be.null;
          expect(result.firstElementChild.getAttribute('onclick')).to.be.null;
        });
      });

      it('should parse data-&style=value output correctly', () => {
        innerHtmlSetup(
          'value = <a href="{{value}}" data-&style="color:red;">abc</a>'
        );
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: /*eslint no-script-url: 0*/ 'javascript:alert();',
          });
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <a data-="" style="color:red;" target="_top">abc</a>'
          );
        });
      });

      it('should parse data-&attr=value output correctly', () => {
        innerHtmlSetup('value = <a data-&href="{{value}}">abc</a>');
        template.compileCallback();
        const result = template.render({
          value: 'https://google.com/',
        });
        expect(result./*OK*/ innerHTML).to.equal(
          'value = <a data-=""' +
            ' href="https://google.com/" target="_top">abc</a>'
        );
      });

      it('should allow for data-attr=value to output correctly', () => {
        innerHtmlSetup(
          'value = ' +
            '<a data-my-attr="{{invalidValue}}"' +
            'data-my-id="{{value}}">abc</a>'
        );
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
            invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
          });
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <a data-my-id="myid">abc</a>'
          );
        });
      });
    });

    describe('Rendering Form Fields', () => {
      it('should allow rendering inputs', () => {
        innerHtmlSetup(
          'value = ' +
            '<input value="{{value}}"' +
            'type="text" onchange="{{invalidValue}}">'
        );
        template.compileCallback();
        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
            invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
          });
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <input value="myid" type="text">'
          );
        });
      });

      it('should allow rendering textarea', () => {
        innerHtmlSetup('value = <textarea>{{value}}</textarea>');
        template.compileCallback();
        const result = template.render({
          value: 'Cool story bro.',
        });
        expect(result./*OK*/ innerHTML).to.equal(
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
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <input value="myid">'
          );
        });

        allowConsoleError(() => {
          const result = template.render({
            value: 'myid',
            type: 'button',
          });
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <input value="myid">'
          );
        });

        const fileResult = template.render({
          value: 'myid',
          type: 'file',
        });
        expect(fileResult./*OK*/ innerHTML).to.equal(
          'value = <input value="myid" type="file">'
        );

        const passwordResult = template.render({
          value: 'myid',
          type: 'password',
        });
        expect(passwordResult./*OK*/ innerHTML).to.equal(
          'value = <input value="myid" type="password">'
        );
      });

      it('should allow text input type rendering', () => {
        innerHtmlSetup('value = <input value="{{value}}" type="{{type}}">');
        template.compileCallback();
        const result = template.render({
          value: 'myid',
          type: 'text',
        });
        expect(result./*OK*/ innerHTML).to.equal(
          'value = <input value="myid" type="text">'
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
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <input value="myid">'
          );
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
        expect(result./*OK*/ innerHTML).to.equal(
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
        expect(result./*OK*/ innerHTML).to.equal(
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
          expect(result./*OK*/ innerHTML).to.equal(
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
          expect(result./*OK*/ innerHTML).to.equal(
            'outer: Outer Mutual ' +
              '<template type="amp-mustache">nested: {{nestedOnlyValue}}' +
              ' {{mutualValue}}</template>'
          );
        });

        it('should compile and render nested templates when invoked', () => {
          const outerTemplateElement = document.createElement('template');
          outerTemplateElement./*OK*/ innerHTML =
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
          expect(nestedResult./*OK*/ innerHTML).to.equal('nested: Nested');
        });

        it('should sanitize the inner template when it gets rendered', () => {
          const outerTemplateElement = document.createElement('template');
          outerTemplateElement./*OK*/ innerHTML =
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
          allowConsoleError(() => {
            const nestedResult = nestedTemplate.render({
              value: 'Nested',
            });
            expect(nestedResult./*OK*/ innerHTML).to.equal(
              '<div>nested</div>: Nested'
            );
          });
        });

        it(
          'should not allow users to pass data having key that starts with ' +
            '__AMP_NESTED_TEMPLATE_0 when there is a nested template',
          () => {
            templateElement./*OK*/ innerHTML =
              'outer: {{value}} ' +
              '<template type="amp-mustache">nested: {{value}}</template>';
            template.compileCallback();
            const result = template.render({
              __AMP_NESTED_TEMPLATE_0: 'MUST NOT RENDER THIS',
              value: 'Outer',
            });
            expect(result./*OK*/ innerHTML).to.equal(
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
            templateElement./*OK*/ innerHTML = '{{__AMP_NESTED_TEMPLATE_0}}';
            template.compileCallback();
            const result = template.render({
              __AMP_NESTED_TEMPLATE_0: '123',
            });
            expect(result./*OK*/ innerHTML).to.equal('123');
          }
        );
      }
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
        expect(result./*OK*/ innerHTML).to.equal(
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
        expect(result./*OK*/ innerHTML).to.equal(
          'value = <table class="valid-class">' +
            '<colgroup><col><col></colgroup>' +
            '<caption>caption</caption>' +
            '<thead><tr><th colspan="2">header</th></tr></thead>' +
            '<tbody><tr><td>' +
            '<a href="http://www.google.com/" target="_top">google</a>' +
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
        allowConsoleError(() => {
          const result = template.render({
            value:
              '<a href="javascript:alert(\'XSS\')">test</a>' +
              '<img src="x" onerror="alert(\'XSS\')" />',
          });
          expect(result./*OK*/ innerHTML).to.equal(
            'value = <a target="_top">test</a>'
          );
        });
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
            const result = template.render({
              'content': 'Howdy',
              'replies': [{'content': 'hi'}],
            });
            expect(result.innerHTML).to.equal(
              '<tbody>' +
                '<tr>' +
                '<td>Howdy</td>' +
                '</tr>' +
                '<tr>' +
                '<td>hi</td>' +
                '</tr>' +
                '</tbody>'
            );
          });
        });
      }
      if (isTemplateType) {
        it(
          'should foster text nodes in template[type="amp-mustache"] ' +
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
                  '<td>Comment:</td>' +
                  '<td>Howdy</td>' +
                  '</tr>' +
                  '<tr>' +
                  '<td>Reply:</td>' +
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
        window.sandbox.spy(mustache, 'parse');
        template.compileCallback();
        expect(mustache.parse).to.have.not.been.called;
      });

      it('should not mustache render but still sanitize html', () => {
        window.sandbox.spy(sanitizer, 'sanitizeHtml');
        window.sandbox.spy(mustache, 'render');
        template.setHtml('<div>test</div>');
        expect(mustache.render).to.have.not.been.called;
        expect(sanitizer.sanitizeHtml).to.have.been.called;
      });
    });

    it('should unwrap output on compile', () => {
      innerHtmlSetup('<a>abc</a>');
      template.compileCallback();
      const result = template.render({});
      expect(result.tagName).to.equal('A');
      expect(result./*OK*/ innerHTML).to.equal('abc');
    });

    describe('setHtml()', () => {
      it('should unwrap singular element output', () => {
        template.compileCallback();
        const result = template.setHtml('<a>abc</a>');
        expect(result).to.have.length(1);
        expect(result[0].tagName).to.equal('A');
        expect(result[0]./*OK*/ innerHTML).to.equal('abc');
      });

      it('should wrap singular text node output', () => {
        template.compileCallback();
        const result = template.setHtml('abc');
        expect(result).to.have.length(1);
        expect(result[0].tagName).to.equal('DIV');
        expect(result[0]./*OK*/ innerHTML).to.equal('abc');
      });

      it('should unwrap output with many elements', () => {
        template.compileCallback();
        const result = template.setHtml('<a>abc</a><a>def</a>');
        expect(result).to.have.length(2);
        const {0: first, 1: second} = result;
        expect(first.tagName).to.equal('A');
        expect(first./*OK*/ innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('A');
        expect(second./*OK*/ innerHTML).to.equal('def');
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
        expect(first./*OK*/ innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('DIV');
        expect(second./*OK*/ innerHTML).to.equal('def');
        expect(third.tagName).to.equal('A');
        expect(third./*OK*/ innerHTML).to.equal('ghi  ');
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
        expect(first.firstElementChild./*OK*/ innerHTML).to.equal('abc');
        expect(second.tagName).to.equal('DIV');
        expect(second./*OK*/ innerHTML).to.equal('def');
        expect(third.tagName).to.equal('A');
        expect(third./*OK*/ innerHTML).to.equal('ghi  ');
      });
    });
  }
);
