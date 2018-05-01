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
import {toggleExperiment} from '../../../../src/experiments';

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

  it('should sanitize output', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a href="{{value}}">abc</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a target="_top">abc</a>');
    });
  });

  it('should output style attributes if inline styles enabled', () => {
    toggleExperiment(self, 'inline-styles', true,
        /* opt_transientExperiment */ true);
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <b style="color: red">abc</b>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <b style="color: red">abc</b>');
    });
  });

  it('should ignore styles containing `!important`',() => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <div style="color:blue!important">Test</div>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal('value = <div>Test</div>');
    });
  });

  it('should ignore styles containing `position:fixed`', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <div style="position:fixed">Test</div>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <div>Test</div>');
    });
  });

  it('should ignore styles containing `position:sticky`', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <div style="position:sticky">Test</div>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <div>Test</div>');
    });
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

  it('should default target to _top with href', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a href="http://www.google.com">google</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a href="http://www.google.com/" target="_top">google</a>');
    });
  });

  it('should output a valid target', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a target="_top">a</a><a target="_blank">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a target="_top">a</a><a target="_blank">b</a>');
    });
  });

  it('should output a valid target in different case', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a target="_TOP">a</a><a target="_BLANK">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a target="_top">a</a><a target="_blank">b</a>');
    });
  });

  it('should sanitize tags, removing unsafe attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a href="javascript:alert(\'XSS\')">test</a>'
        + '<img src="x" onerror="alert(\'XSS\')" />';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a target="_top">test</a>');
    });
  });

  it('should override an unallowed target', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a target="_self">_self</a>'
        + '<a target="_parent">_parent</a>'
        + '<a target="_other">_other</a>'
        + '<a target="_OTHER">_OTHER</a>'
        + '<a target="other">other</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a target="_top">_self</a>'
          + '<a target="_top">_parent</a>'
          + '<a target="_top">_other</a>'
          + '<a target="_top">_OTHER</a>'
          + '<a target="_top">other</a>');
    });
  });

  it('should NOT output security-sensitive binding attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<a onclick="alert">b</a>'
        + 'a<a STYLE="color: red;">b</a>'
        + 'a<a STYLE="color: red;">b</a>'
        + '<a href="javascript:alert">b</a>'
        + 'a<a href="JAVASCRIPT:alert">b</a>'
        + 'a<a href="vbscript:alert">b</a>'
        + 'a<a href="VBSCRIPT:alert">b</a>'
        + 'a<a href="data:alert">b</a>'
        + 'a<a href="DATA:alert">b</a>'
        + 'a<a href="<script">b</a>'
        + 'a<a href="</script">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = a<a>b</a>'
          + 'a<a>b</a>'
          + 'a<a>b</a>'
          + '<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>'
          + 'a<a target="_top">b</a>');
    });
  });

  it('should output [text] and [class] attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <p [text]="foo" [class]="bar"></p>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <p [text]="foo" [class]="bar"></p>');
    });
  });

  it('should apply html4/caja restrictions', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<dialog>b</dialog>c'
        + 'a<dialog>b<img>d</dialog>c'
        + '<div class="c" src="d">b</div>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = ac'
          + 'ac'
          + '<div class="c" src="">b</div>');
    });
  });

  it('should allow amp-subscriptions attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <div subscriptions-action="login">link</div>'
        + '<div subscriptions-section="actions">link</div>'
        + '<div subscriptions-actions="">link</div>'
        + '<div subscriptions-display="">link</div>'
        + '<div subscriptions-dialog="">link</div>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <div subscriptions-action="login">link</div>'
          + '<div subscriptions-section="actions">link</div>'
          + '<div subscriptions-actions="">link</div>'
          + '<div subscriptions-display="">link</div>'
          + '<div subscriptions-dialog="">link</div>');
    });
  });

  it('should NOT rewrite values of binding attributes', () => {
    // Should not change "foo.bar" but should add target="_top"
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a [href]="foo.bar">link</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a [href]="foo.bar" target="_top">link</a>');
    });
  });

  it('should allow source::src with vaild protocol', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <source src="https://www.foo.com/">';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <source src="https://www.foo.com/">');
    });
  });

  it('should catch attribute value whitespace variations', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<a href=" j\na\tv\ra s&#00;cript:alert">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = a<a target="_top">b</a>');
    });
  });

  it('should not allow source::src with invaild protocol', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <source src="http://www.foo.com">'
        + '<source src="<script>bad()</script>">';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <source src="">'
          + '<source src="">');
    });
  });

  it('should NOT output blacklisted values for class attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <p class="i-amphtml-">hello</p>'
        + '<p class="i-amphtml-class">hello</p>'
        + '<p class="foo-i-amphtml-bar">hello</p>'
        + '<p [class]="i-amphtml-">hello</p>'
        + '<p [class]="i-amphtml-class">hello</p>'
        + '<p [class]="foo-i-amphtml-bar">hello</p>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <p>hello</p>'
          + '<p>hello</p>'
          + '<p>hello</p>'
          + '<p>hello</p>'
          + '<p>hello</p>'
          + '<p>hello</p>');
    });
  });

  it('should output "href" attribute', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<a href="http://acme.com/">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = a<a href="http://acme.com/" target="_top">b</a>');
    });
  });

  it('should output "rel" attribute', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<a href="http://acme.com/" rel="amphtml">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = a<a href="http://acme.com/" rel="amphtml" '
          + 'target="_top">b</a>');
    });
  });

  it('should NOT output security-sensitive attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = value = a<a onclick="alert">b</a>'
        + 'a<a [onclick]="alert">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = value = a<a>b</a>'
          + 'a<a>b</a>');
    });
  });

  it('should output "on" attribute', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML = 'value = a<a on="tap">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal('value = a<a on="tap">b</a>');
    });
  });

  it('should output "data-, aria-, and role" attributes', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = <a data-foo="bar" aria-label="bar" role="button">b</a>';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <a data-foo="bar" aria-label="bar" role="button">b</a>');
    });
  });

  it('should NOT output security-sensitive markup', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<script>b</script>c'
        + 'a<script>b<img>d</script>c'
        + 'a<style>b</style>c'
        + 'a<img>c'
        + 'a<iframe></iframe>c'
        + 'a<frame></frame>c'
        + 'a<video></video>c'
        + 'a<audio></audio>c'
        + 'a<applet></applet>c'
        + 'a<link>c'
        + 'a<meta>c';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac'
          + 'ac');
    });
  });

  it('should NOT output security-sensitive markup when nested', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML =
        'value = a<script><style>b</style></script>c'
        + 'a<style><iframe>b</iframe></style>c'
        + 'a<script><img></script>c';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = ac'
          + 'ac'
          + 'ac');
    });
  });

  it('should NOT output security-sensitive markup when broken', () => {
    const templateElement = document.createElement('template');
    templateElement./*OK*/innerHTML = 'value = a<script>bc';
    const template = new AmpMustache(templateElement);
    template.compileCallback();
    allowConsoleError(() => {
      const result = template.render({
        value: /*eslint no-script-url: 0*/ 'javascript:alert();',
      });
      expect(result./*OK*/innerHTML).to.equal('value = a');
    });
  });

  describe('Sanitizing data- attributes', () => {

    it('should sanitize templated attribute names', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'value = <a {{value}}="javascript:alert(0)">abc</a>';
      const template = new AmpMustache(templateElement);
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
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML =
          'value = <p [{{value}}]="javascript:alert()">ALERT</p>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      allowConsoleError(() => {
        const result = template.render({
          value: 'onclick',
        });
        expect(result).to.not
            .equal('<p [onclick]="javascript:alert()">ALERT</p>');
        expect(result.firstElementChild.getAttribute('[onclick]')).to.be.null;
        expect(result.firstElementChild.getAttribute('onclick')).to.be.null;
      });
    });

    it('should parse data-&style=value output correctly', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = <a href="{{value}}"' +
          ' data-&style="color:red;">abc</a>';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      allowConsoleError(() => {
        const result = template.render({
          value: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <a data-="" target="_top">abc</a>');
      });
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
      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
          invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <a data-my-id="myid">abc</a>');
      });
    });
  });

  describe('Rendering Form Fields', () => {
    it('should allow rendering inputs', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" type="text" onchange="{{invalidValue}}">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
          invalidValue: /*eslint no-script-url: 0*/ 'javascript:alert();',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <input value="myid" type="text">');
      });
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

    it('should not allow image/file input types rendering', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" type="{{type}}">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
          type: 'image',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <input value="myid">');
      });

      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
          type: 'file',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <input value="myid">');
      });

      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
          type: 'button',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <input value="myid">');
      });

      const result = template.render({
        value: 'myid',
        type: 'password',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid" type="password">');
    });

    it('should allow text input type rendering', () => {
      const templateElement = document.createElement('template');
      templateElement./*OK*/innerHTML = 'value = ' +
          '<input value="{{value}}" type="{{type}}">';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: 'myid',
        type: 'text',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <input value="myid" type="text">');
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
      allowConsoleError(() => {
        const result = template.render({
          value: 'myid',
        });
        expect(result./*OK*/innerHTML).to.equal(
            'value = <input value="myid">');
      });
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

    it('should sanitize the inner template when it gets rendered', () => {
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
      allowConsoleError(() => {
        const nestedResult = nestedTemplate.render({
          value: 'Nested',
        });
        expect(nestedResult./*OK*/innerHTML).to.equal(
            '<div>nested</div>: Nested');
      });
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

  describe('triple-mustache', () => {
    it('should sanitize text formatting elements', () => {
      const templateElement = document.createElement('template');
      templateElement.content.textContent = 'value = {{{value}}}';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: '<b>abc</b><img><div>def</div>'
            + '<br><code></code><del></del><em></em>'
            + '<i></i><ins></ins><mark></mark><s></s>'
            + '<small></small><strong></strong><sub></sub>'
            + '<sup></sup><time></time><u></u>',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <b>abc</b><div>def</div>'
           + '<br><code></code><del></del><em></em>'
           + '<i></i><ins></ins><mark></mark><s></s>'
           + '<small></small><strong></strong><sub></sub>'
           + '<sup></sup><time></time><u></u>'
      );
    });

    it('should sanitize table related elements and anchor tags', () => {
      const templateElement = document.createElement('template');
      templateElement.content.textContent = 'value = {{{value}}}';
      const template = new AmpMustache(templateElement);
      template.compileCallback();
      const result = template.render({
        value: '<table class="valid-class">'
            + '<caption>caption</caption>'
            + '<thead><tr><th colspan="2">header</th></tr></thead>'
            + '<tbody><tr><td>'
            + '<a href="http://www.google.com">google</a>'
            + '</td></tr></tbody>'
            + '<tfoot><tr>'
            + '<td colspan="2"><span>footer</span></td>'
            + '</tr></tfoot>'
            + '</table>',
      });
      expect(result./*OK*/innerHTML).to.equal(
          'value = <table class="valid-class">'
          + '<caption>caption</caption>'
          + '<thead><tr><th colspan="2">header</th></tr></thead>'
          + '<tbody><tr><td>'
          + '<a href="http://www.google.com/" target="_top">google</a>'
          + '</td></tr></tbody>'
          + '<tfoot><tr>'
          + '<td colspan="2"><span>footer</span></td>'
          + '</tr></tfoot>'
          + '</table>'
      );
    });
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
