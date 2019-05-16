/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {htmlFor, htmlRefs} from '../../src/static-template';

describe('Static Template', () => {
  describe('html', () => {
    it('generates static html tree', () => {
      const div = htmlFor(document)`<div attr="test"><p class="er"></p></div>`;

      expect(div.tagName).to.equal('DIV');
      expect(div.getAttribute('attr')).to.equal('test');
      expect(div.parentNode).to.be.null;
      expect(div.nextSibling).to.be.null;

      const p = div.firstChild;
      expect(p.tagName).to.equal('P');
      expect(p.getAttribute('class')).to.equal('er');
      expect(p.nextSibling).to.be.null;
    });

    it('works as a variable', () => {
      const html = htmlFor(document);
      const div = html`
        <div attr="test"><p class="er"></p></div>
      `;

      expect(div.tagName).to.equal('DIV');
      expect(div.getAttribute('attr')).to.equal('test');
      expect(div.parentNode).to.be.null;
      expect(div.nextSibling).to.be.null;

      const p = div.firstChild;
      expect(p.tagName).to.equal('P');
      expect(p.getAttribute('class')).to.equal('er');
      expect(p.nextSibling).to.be.null;
    });

    it('creates tree with last ownerDocument', () => {
      // Setup
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      const iDoc = iframe.contentDocument;

      const html = htmlFor(document);
      let div = html`
        <div></div>
      `;
      expect(div.ownerDocument).to.equal(document);

      div = htmlFor(iDoc)`<div></div>`;
      expect(div.ownerDocument).to.equal(iDoc);

      div = html`
        <div></div>
      `;
      expect(div.ownerDocument).to.equal(iDoc);

      // Cleanup
      document.body.removeChild(iframe);
    });

    it('ignores text before first element', () => {
      const div = htmlFor(document)`test<div></div>`;
      expect(div.outerHTML).to.not.include('test');
    });

    it('ignores text after first element', () => {
      const div = htmlFor(document)`<div></div>test`;
      expect(div.outerHTML).to.not.include('test');
    });

    it('rejects multiple root elements', () => {
      expect(() => {
        allowConsoleError(() => {
          htmlFor(document)`<div></div><div></div>`;
        });
      }).to.throw('template');
    });

    it('rejects non-existent root', () => {
      expect(() => {
        allowConsoleError(() => {
          htmlFor(document)``;
        });
      }).to.throw('template');
    });

    it('rejects dynamic templates', () => {
      expect(() => {
        allowConsoleError(() => {
          htmlFor(document)`<div>${'text'}</div>`;
        });
      }).to.throw('template');
    });
  });

  describe('htmlRefs', () => {
    it('finds all elements with ref attribute', () => {
      // Prove it doesn't need html helper
      const el = document.createElement('div');
      el./*TEST*/ innerHTML =
        '<div ref="test"><span ref="s"></span></div>' + '<div ref="d"></div>';

      const refs = htmlRefs(el);
      expect(refs).to.deep.equal({
        test: el.firstChild,
        s: el.firstChild.firstChild,
        d: el.lastChild,
      });
    });

    it('ignores element if it has ref attribute', () => {
      const el = htmlFor(document)`<div ref="test"></div>`;
      const refs = htmlRefs(el);
      expect(refs).to.deep.equal({});
    });

    it('rejects empty ref attribute', () => {
      const el = htmlFor(document)`<div><div ref=""></div></div>`;
      expect(() => {
        allowConsoleError(() => {
          htmlRefs(el);
        });
      }).to.throw('ref');
    });

    it('rejects duplicate ref attribute', () => {
      const el = htmlFor(document)`<div>
            <div ref="test"></div>
            <div ref="test"</div>
          </div>`;
      expect(() => {
        allowConsoleError(() => {
          htmlRefs(el);
        });
      }).to.throw('ref');
    });
  });
});
