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

const {expect} = require('chai');
const {expectValidAmphtml, parseHtmlChunk} = require('./helpers');
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
        expect(() => AmpDoc()).to.throw;
      });

      it('fails without min required fields', () => {
        expect(() => AmpDoc({})).to.throw;
      });

      it('creates valid doc with min required fields', async() => {
        expectValidAmphtml(await amphtmlValidator.getInstance(), AmpDoc({
          canonical: '/',
        }));
      })

      it('creates valid doc with set fields', async() => {
        expectValidAmphtml(await amphtmlValidator.getInstance(), AmpDoc({
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
      });
    });

    describe('ampStateKey', () => {
      it('concats arguments', () => {
        expect(ampStateKey('foo', 'bar')).to.equal('foo.bar');
        expect(ampStateKey('tacos', 'al', 'pastor'))
            .to.equal('tacos.al.pastor');
      });

    });

    describe('ternaryExpr', () => {
      it('creates expression', () => {
        expect(ternaryExpr('a', 'b', 'c')).to.equal('a ? b : c');
      });
    });

    describe('containsExpr', () => {
      it('creates expression with literals', () => {
        expect(containsExpr('\'a\'', '\'b\'', '\'c\'', '\'d\''))
            .to.equal('\'a\'.indexOf(\'b\') > -1 ? \'c\' : \'d\'');
      });

      it('creates expression with vars', () => {
        expect(containsExpr('a', 'b', 'c', 'd'))
            .to.equal('a.indexOf(b) > -1 ? c : d');
      });
    });

    describe('AmpState', () => {
      it('generates tree', () => {
        const id = 'foo';
        const state = 'bar';
        const root = parseHtmlChunk(AmpState(id, state));

        expect(root.tagName).to.equal('AMP-STATE');
        expect(root.getAttribute('id')).to.equal(id);

        expect(root.children).to.have.length(1);

        const {firstElementChild} = root;
        expect(firstElementChild.tagName).to.equal('SCRIPT');
        expect(firstElementChild.getAttribute('type'))
            .to.equal('application/json');
      });

      it('renders json object', () => {
        const id = 'whatever';
        const state = {foo: 'bar', baz: {yes: 'no'}};

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        expect(JSON.parse(textContent)).to.deep.equal(state);
      });

      it('renders string literal', () => {
        const id = 'whatever';
        const state = 'foo';

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        expect(JSON.parse(textContent)).to.equal(state);
      });

      it('renders array', () => {
        const id = 'whatever';
        const state = ['foo', 'bar', 'baz'];

        const {textContent} =
            parseHtmlChunk(AmpState(id, state)).firstElementChild;

        expect(JSON.parse(textContent)).to.deep.equal(state);
      });
    });

    describe('addRequiredExtensionsToHead', () => {

      function containsExtension(scripts, expectedExtension) {
        return scripts.some(s =>
          s.getAttribute('custom-element') == expectedExtension &&
          s.getAttribute('custom-template') == null);
      }

      function containsTemplate(scripts, expectedTemplate) {
        return scripts.some(s =>
          s.getAttribute('custom-template') == expectedTemplate &&
          s.getAttribute('custom-extension') == null);
      }

      it('renders ok', () => {
        const rawStr = html`
          <html>
            <head></head>
            <body>
              <amp-foo foo="bar"></amp-foo>
            </body>
          </html>`;

        expect(new JSDOM(addRequiredExtensionsToHead(rawStr))).to.be.ok;
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
              <amp-foo foo="bar"></amp-foo>
              <amp-foo foo="bar"></amp-foo>
              <amp-foo foo="bar"></amp-foo>
              <div>
                <amp-bar></amp-bar>
                <div>
                  <amp-foo-bar-baz many="1" attributes="2">
                    Text content
                  </amp-foo-bar-baz>
                </div>
                <input>
                <amp-state id="myState"></amp-state>
                <template type="amp-mustache"></template>
              </div>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts =
            Array.from(document.head.getElementsByTagName('script'));

        expect(scripts).to.have.length(
            expectedExtensions.length + expectedTemplates.length);

        scripts.forEach(script => {
          expect(script.getAttribute('src')).to.be.ok;
          expect(script.getAttribute('async')).to.equal('');
        });

        expectedExtensions.forEach(expectedScript => {
          expect(scripts).to.satisfy(scripts =>
            containsExtension(scripts, expectedScript))
        });

        expectedTemplates.forEach(expectedScript => {
          expect(scripts).to.satisfy(scripts =>
            containsTemplate(scripts, expectedScript))
        });
      });

      it('adds extensions', () => {

        const expected = ['amp-foo', 'amp-bar', 'amp-foo-bar-baz'];

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <amp-foo foo="bar"></amp-foo>
              <amp-foo foo="bar"></amp-foo>
              <amp-foo foo="bar"></amp-foo>
              <div>
                <amp-bar></amp-bar>
                <div>
                  <amp-foo-bar-baz many="1" attributes="2">
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

        expect(scripts).to.have.length(expected.length);

        scripts.forEach(script => {
          expect(script.getAttribute('src')).to.be.ok
          expect(script.getAttribute('async')).to.equal('');
          expect(script.getAttribute('custom-template')).to.be.null;
        });

        expected.forEach(expectedScript => {
          expect(scripts).to.satisfy(scripts =>
            containsExtension(scripts, expectedScript));
        });
      });

      it('adds template', () => {
        const expected = 'amp-mustache';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <div>
                <template type="amp-mustache"></template>
                <template type="amp-mustache"></template>
                <template type="amp-mustache"></template>
                </div>
              </div>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        expect(scripts).to.have.length(1);

        const [script] = scripts;

        expect(script.getAttribute('custom-element')).to.be.null;
        expect(script.getAttribute('src')).to.be.ok;
        expect(script.getAttribute('async')).to.equal('');
        expect(script.getAttribute('custom-template')).to.equal(expected);
      });

      it('adds <amp-form> per <form>', () => {

        const expected = 'amp-form';

        const rawStr = html`
          <html>
            <head></head>
            <body>
              <form action="whatever.com"></form>
            </body>
          </html>`;

        const {document} =
            (new JSDOM(addRequiredExtensionsToHead(rawStr))).window;

        const scripts = document.head.getElementsByTagName('script');

        expect(scripts).to.have.length(1);

        const [script] = scripts;

        expect(script.getAttribute('custom-template')).to.be.null;
        expect(script.getAttribute('src')).to.be.ok;
        expect(script.getAttribute('async')).to.equal('');
        expect(script.getAttribute('custom-element')).to.equal(expected);
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

        expect(scripts).to.have.length(1);

        const [script] = scripts;

        expect(script.getAttribute('custom-template')).to.be.null;
        expect(script.getAttribute('src')).to.be.ok;
        expect(script.getAttribute('async')).to.equal('');
        expect(script.getAttribute('custom-element')).to.equal(expected);
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

        expect(scripts).to.have.length(1);

        const [script] = scripts;

        expect(script.getAttribute('custom-template')).to.be.null;
        expect(script.getAttribute('src')).to.be.ok;
        expect(script.getAttribute('async')).to.equal('');
        expect(script.getAttribute('custom-element')).to.equal(expected);
      });

    });
  });

});
