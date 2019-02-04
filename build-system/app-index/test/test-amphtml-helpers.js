/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const amphtmlValidator = require('amphtml-validator');
const assert = require('assert');

const {assertValidAmphtml, parseHtmlChunk} = require('./helpers');
const {html} = require('../html');
const {JSDOM} = require('jsdom');

const {
  addRequiredExtensionsToHead,
  AmpDoc,
  AmpState,
  ampStateKey,
  containsExpr,
  ternaryExpr,
} = require('../amphtml-helpers');


describe('devdash', () => {

  describe('AMPHTML helpers', () => {

    describe('AmpDoc', () => {

      it('fails without args', () => {
        assert.throws(() => {
          AmpDoc();
        });
      });

      it('fails without min required fields', () => {
        assert.throws(() => {
          AmpDoc({});
        });
      });

      it('creates valid doc with min required fields', async() => {
        assertValidAmphtml(await amphtmlValidator.getInstance(), AmpDoc({
          canonical: '/',
        }));
      })

      it('creates valid doc with set fields', async() => {
        assertValidAmphtml(await amphtmlValidator.getInstance(), AmpDoc({
          canonical: '/',
          css: 'body { font-family:sans-serif; } ',
          head: html`
            <script type="application/ld+json">
              {
                "@context": "http://schema.org",
                "@type": "NewsArticle",
                "mainEntityOfPage": "http://tacos.al.pastor/",
                "headline": "Lorem Ipsum",
                "datePublished": "1907-05-05T12:02:41Z",
                "dateModified": "1907-05-05T12:02:41Z",
                "description": "What is love?",
                "author": {
                  "@type": "Baby",
                  "name": "Don't hurt me"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "No more",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "http://perritos.haciendo.cosas/1.png",
                    "width": 600,
                    "height": 60
                  }
                },
                "image": {
                  "@type": "ImageObject",
                  "url": "http://perritos.haciendo.cosas/2.png",
                  "height": 2000,
                  "width": 800
                }
              }
            </script>`,
          body: html`<div>Hola</div>`,
        }));
      })
    });

    describe('ampStateKey', () => {
      it('concats arguments', () => {
        assert.strictEqual(ampStateKey('foo', 'bar'), 'foo.bar');
        assert.strictEqual(
          ampStateKey('tacos', 'al', 'pastor'),
          'tacos.al.pastor');
      });

    });

    describe('ternaryExpr', () => {
      it('creates expression', () => {
        assert.strictEqual(ternaryExpr('a', 'b', 'c'), 'a ? b : c');
      });
    });

    describe('containsExpr', () => {
      it('creates expression with literals', () => {
        assert.strictEqual(
          containsExpr('\'a\'', '\'b\'', '\'c\'', '\'d\''),
          '\'a\'.indexOf(\'b\') > -1 ? \'c\' : \'d\'');
      });

      it('creates expression with vars', () => {
        assert.strictEqual(
          containsExpr('a', 'b', 'c', 'd'),
          'a.indexOf(b) > -1 ? c : d');
      });
    });

    describe('AmpState', () => {
      it('generates tree', () => {
        const id = 'foo';
        const state = 'bar';
        const root = parseHtmlChunk(AmpState(id, state));

        assert.strictEqual(root.tagName, 'AMP-STATE');
        assert.strictEqual(root.getAttribute('id'), id);

        assert.strictEqual(root.children.length, 1);

        const {firstElementChild} = root;
        assert.strictEqual(firstElementChild.tagName, 'SCRIPT');
        assert.strictEqual(
          firstElementChild.getAttribute('type'),
          'application/json');
      });

      it('renders json object', () => {
        const id = 'whatever';
        const state = {foo: 'bar', baz: {yes: 'no'}};

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        assert.deepStrictEqual(JSON.parse(textContent), state);
      });

      it('renders string literal', () => {
        const id = 'whatever';
        const state = 'foo';

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        assert.strictEqual(JSON.parse(textContent), state);
      });

      it('renders array', () => {
        const id = 'whatever';
        const state = ['foo', 'bar', 'baz'];

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        assert.deepEqual(JSON.parse(textContent), state);
      });
    });

    describe('addRequiredExtensionsToHead', () => {

      it('renders ok', () => {
        const rawStr = html`
          <html>
            <head></head>
            <body>
              <amp-foo foo=bar></amp-foo>
            </body>
          </html>`;

        assert(new JSDOM(addRequiredExtensionsToHead(rawStr)));
      });

      it('adds mixed', () => {

        const expectedExtensions = [
          'amp-foo',
          'amp-bar',
          'amp-foo-bar-baz',
          'amp-bind',
          'amp-form',
        ];

        const expectedTemplates = ['amp-mustache'];

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <amp-foo foo=bar></amp-foo>
              <amp-foo foo=bar></amp-foo>
              <amp-foo foo=bar></amp-foo>
              <div>
                <amp-bar></amp-bar>
                <div>
                  <amp-foo-bar-baz many=1 attributes=2>
                    Text content
                  </amp-foo-bar-baz>
                </div>
                <input>
                <amp-state id=myState></amp-state>
                <template type="amp-mustache"></template>
              </div>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts =
            Array.from(document.head.getElementsByTagName('script'));

        assert.strictEqual(
          scripts.length,
          expectedExtensions.length + expectedTemplates.length);

        scripts.forEach(script => {
          assert(script.getAttribute('src'));
          assert.strictEqual(script.getAttribute('async'), '');
        });

        expectedExtensions.forEach(expectedScript => {
          assert(scripts.find(s => {
            if (s.getAttribute('custom-element') == expectedScript) {
              assert(!s.getAttribute('custom-template'));
              return true;
            }
          }));
        });

        expectedTemplates.forEach(expectedScript => {
          assert(scripts.find(s => {
            if (s.getAttribute('custom-template') == expectedScript) {
              assert(!s.getAttribute('custom-extension'));
              return true;
            }
            return false;
          }));
        });
      });

      it('adds extensions', () => {

        const expected = ['amp-foo', 'amp-bar', 'amp-foo-bar-baz'];

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <amp-foo foo=bar></amp-foo>
              <amp-foo foo=bar></amp-foo>
              <amp-foo foo=bar></amp-foo>
              <div>
                <amp-bar></amp-bar>
                <div>
                  <amp-foo-bar-baz many=1 attributes=2>
                    Text content
                  </amp-foo-bar-baz>
                </div>
              </div>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts =
            Array.from(document.head.getElementsByTagName('script'));

        assert.strictEqual(scripts.length, expected.length);

        scripts.forEach(script => {
          assert(script.getAttribute('src'));
          assert.strictEqual(script.getAttribute('async'), '');
          assert(!script.getAttribute('custom-template'));
        });

        expected.forEach(expectedScript => {
          assert(scripts.find(s =>
            s.getAttribute('custom-element') == expectedScript));
        });
      });

      it('adds template', () => {
        const expected = 'amp-mustache';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <div>
                <template type=amp-mustache></template>
                <template type=amp-mustache></template>
                <template type=amp-mustache></template>
                </div>
              </div>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        assert.strictEqual(scripts.length, 1);

        const [script] = scripts;

        assert(!script.getAttribute('custom-element'));
        assert(script.getAttribute('src'));
        assert.strictEqual(script.getAttribute('async'), '');
        assert.strictEqual(script.getAttribute('custom-template'), expected);
      });

      it('adds <amp-form> per <form>', () => {

        const expected = 'amp-form';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <form action=whatever.com></form>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        assert.strictEqual(scripts.length, 1);

        const [script] = scripts;

        assert(!script.getAttribute('custom-template'));
        assert(script.getAttribute('src'));
        assert.strictEqual(script.getAttribute('async'), '');
        assert.strictEqual(script.getAttribute('custom-element'), expected);
      });

      it('adds <amp-form> per <input>', () => {

        const expected = 'amp-form';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <input>
              <input>
              <input>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        assert.strictEqual(scripts.length, 1);

        const [script] = scripts;

        assert(!script.getAttribute('custom-template'));
        assert(script.getAttribute('src'));
        assert.strictEqual(script.getAttribute('async'), '');
        assert.strictEqual(script.getAttribute('custom-element'), expected);
      });

      it('adds <amp-form> per <select>', () => {

        const expected = 'amp-form';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <select></select>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        assert.strictEqual(scripts.length, 1);

        const [script] = scripts;

        assert(!script.getAttribute('custom-template'));
        assert(script.getAttribute('src'));
        assert.strictEqual(script.getAttribute('async'), '');
        assert.strictEqual(script.getAttribute('custom-element'), expected);
      });

    });
  });

});
