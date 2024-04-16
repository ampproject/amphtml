/**
 * @fileoverview Description of this file.
 */

import {
  clearModalStack,
  getElementsToAriaHide,
  setModalAsClosed,
  setModalAsOpen,
} from '#core/dom/modal';
import {htmlFor} from '#core/dom/static-template';
import {toArray} from '#core/types/array';

describes.fakeWin('modal', {}, (env) => {
  let win;
  let doc;
  let html;
  let container;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    html = html = htmlFor(doc);
    container = document.createElement('div');
    doc.body.appendChild(container);
  });

  afterEach(() => {
    doc.body.removeChild(container);
    clearModalStack();
  });

  describe('getElementsToAriaHide', () => {
    it('should return all siblings', () => {
      const root = html`
        <div>
          <div class="to-hide"></div>
          <div id="target"></div>
          <div class="to-hide"></div>
        </div>
      `;

      const target = root.querySelector('#target');
      const toHide = root.querySelectorAll('.to-hide');
      const nodes = getElementsToAriaHide(target);

      expect(nodes).to.have.members(toArray(toHide));
    });

    it('should return aunts/uncles', () => {
      const root = html`
        <div>
          <div class="to-hide"></div>
          <div>
            <div class="to-hide"></div>
            <div>
              <div id="target"></div>
            </div>
            <div class="to-hide"></div>
          </div>
          <div class="to-hide"></div>
        </div>
      `;

      const target = root.querySelector('#target');
      const toHide = root.querySelectorAll('.to-hide');
      const nodes = getElementsToAriaHide(target);

      expect(nodes).to.have.members(toArray(toHide));
    });

    it('should not return children', () => {
      const root = html`
        <div>
          <div id="target">
            <div></div>
          </div>
        </div>
      `;

      const target = root.querySelector('#target');
      const toHide = root.querySelectorAll('.to-hide');
      const nodes = getElementsToAriaHide(target);

      expect(nodes).to.have.members(toArray(toHide));
    });

    it('should not return cousins', () => {
      const root = html`
        <div>
          <div class="to-hide">
            <div></div>
          </div>
          <div>
            <div id="target"></div>
          </div>
        </div>
      `;

      const target = root.querySelector('#target');
      const toHide = root.querySelectorAll('.to-hide');
      const nodes = getElementsToAriaHide(target);

      expect(nodes).to.have.members(toArray(toHide));
    });
  });

  describe('setModalAsOpen', () => {
    it('should hide via aria for elements without aria-hidden', () => {
      const root = container.appendChild(html`
        <div>
          <div class="to-hide">
            <div></div>
          </div>
          <div>
            <div class="to-hide"></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      try {
        setModalAsOpen(target);

        const toHide = root.querySelectorAll('.to-hide');
        const ariaHidden = root.querySelectorAll('[aria-hidden="true"]');

        expect(toArray(ariaHidden)).to.have.members(toArray(toHide));
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should hide via aria for elements with aria-hidden="true"', () => {
      const root = container.appendChild(html`
        <div>
          <div class="to-hide" aria-hidden="true">
            <div></div>
          </div>
          <div>
            <div class="to-hide" aria-hidden="true"></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      try {
        setModalAsOpen(target);

        const toHide = root.querySelectorAll('.to-hide');
        const ariaHidden = root.querySelectorAll('[aria-hidden="true"]');

        expect(toArray(ariaHidden)).to.have.members(toArray(toHide));
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should hide via aria for elements with aria-hidden="false"', () => {
      const root = container.appendChild(html`
        <div>
          <div class="to-hide" aria-hidden="false">
            <div></div>
          </div>
          <div>
            <div class="to-hide" aria-hidden="false"></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      try {
        setModalAsOpen(target);

        const toHide = root.querySelectorAll('.to-hide');
        const ariaHidden = root.querySelectorAll('[aria-hidden="true"]');

        expect(toArray(ariaHidden)).to.have.members(toArray(toHide));
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should unhide ancestors', () => {
      const root = container.appendChild(html`
        <div aria-hidden="true">
          <div>
            <div></div>
          </div>
          <div aria-hidden="true">
            <div aria-hidden="true"></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      try {
        setModalAsOpen(target);

        const targetWithHiddenAncestor = root.querySelector(
          '[aria-hidden="true"] #target'
        );

        expect(targetWithHiddenAncestor).to.be.null;
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should hide elements outside of the containing ShadowRoot', () => {
      if (!('attachShadow' in HTMLElement.prototype)) {
        return;
      }

      const outerRoot = container.appendChild(html`
        <div>
          <div class="expected"></div>
          <div id="target"></div>
        </div>
      `);
      const shadowRoot = outerRoot.querySelector('#target').attachShadow({
        mode: 'open',
      });
      const innerRoot = shadowRoot.appendChild(html`
        <div>
          <div id="target"></div>
        </div>
      `);
      const target = innerRoot.querySelector('#target');

      try {
        setModalAsOpen(target);

        const expected = outerRoot.querySelectorAll('.expected');
        const actual = outerRoot.querySelectorAll('[aria-hidden="true"]');

        expect(toArray(actual)).to.have.members(toArray(expected));
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should make elements outside of the tree non-tabbable', () => {
      const root = container.appendChild(html`
        <div aria-hidden="true">
          <div>
            <button class="expected"></button>
            <a class="expected" href="#foo">bar</a>
          </div>
          <div>
            <div class="expected" tabindex="0">Hello</div>
            <div id="target">
              <a href="#foo">bar</a>
            </div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      try {
        setModalAsOpen(target);

        const actual = root.querySelectorAll('[tabindex="-1"]');
        const expected = root.querySelectorAll('.expected');

        expect(toArray(actual)).to.have.members(toArray(expected));
      } finally {
        setModalAsClosed(target);
      }
    });

    it('should make elements outside of the ShadowRoot non-tabbable', () => {
      if (!('attachShadow' in HTMLElement.prototype)) {
        return;
      }

      const outerRoot = container.appendChild(html`
        <div>
          <div class="expected" tabindex="1"></div>
          <div id="target"></div>
        </div>
      `);
      const shadowRoot = outerRoot.querySelector('#target').attachShadow({
        mode: 'open',
      });
      const innerRoot = shadowRoot.appendChild(html`
        <div>
          <div id="target"></div>
        </div>
      `);
      const target = innerRoot.querySelector('#target');

      try {
        setModalAsOpen(target);

        const expected = outerRoot.querySelectorAll('.expected');
        const actual = outerRoot.querySelectorAll('[tabindex="-1"]');

        expect(toArray(actual)).to.have.members(toArray(expected));
      } finally {
        setModalAsClosed(target);
      }
    });
  });

  describe('setModalAsClosed', () => {
    it('should remove aria-hidden for elements without it', () => {
      const root = container.appendChild(html`
        <div>
          <div>
            <div></div>
          </div>
          <div>
            <div></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      setModalAsOpen(target);
      setModalAsClosed(target);

      const ariaHidden = root.querySelectorAll('[aria-hidden]');

      expect(toArray(ariaHidden)).to.be.empty;
    });

    it('should restore aria-hidden="true"', () => {
      const root = container.appendChild(html`
        <div>
          <div class="expected" aria-hidden="true">
            <div></div>
          </div>
          <div>
            <div></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      setModalAsOpen(target);
      setModalAsClosed(target);

      const expected = root.querySelectorAll('.expected');
      const ariaHiddenTrue = root.querySelectorAll('[aria-hidden="true"]');

      expect(toArray(ariaHiddenTrue)).to.have.members(toArray(expected));
    });

    it('should restore aria-hidden="false"', () => {
      const root = container.appendChild(html`
        <div>
          <div class="expected" aria-hidden="false">
            <div></div>
          </div>
          <div>
            <div></div>
            <div id="target"></div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      setModalAsOpen(target);
      setModalAsClosed(target);

      const expected = root.querySelectorAll('.expected');
      const ariaHiddenFalse = root.querySelectorAll('[aria-hidden="false"]');

      expect(toArray(ariaHiddenFalse)).to.have.members(toArray(expected));
    });

    it('should clear tabindex if none was present', () => {
      const root = container.appendChild(html`
        <div>
          <div>
            <button class="expected"></button>
            <a class="expected" href="#foo">bar</a>
          </div>
          <div>
            <div id="target">
              <a href="#foo" tabindex="0">bar</a>
            </div>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      setModalAsOpen(target);
      setModalAsClosed(target);

      const actual = root.querySelectorAll(':not([tabindex])');
      const expected = root.querySelectorAll('.expected');

      expect(toArray(actual)).to.include.members(toArray(expected));
    });

    it('should restore tabindex', () => {
      const root = container.appendChild(html`
        <div>
          <div class="expected" tabindex="0">Hello</div>
          <div id="target">
            <a href="#foo">bar</a>
          </div>
        </div>
      `);
      const target = root.querySelector('#target');

      setModalAsOpen(target);
      setModalAsClosed(target);

      const actual = root.querySelectorAll('[tabindex="0"]');
      const expected = root.querySelectorAll('.expected');

      expect(toArray(actual)).to.have.members(toArray(expected));
    });
  });

  describe('nested opens/closes', () => {
    it('should handle nested opens for aria-hidden', () => {
      const root = container.appendChild(html`
        <div>
          <div id="targetOneParent">
            <div id="targetOne"></div>
          </div>
          <div id="targetTwoParent">
            <div id="targetTwo"></div>
          </div>
          <div id="otherElement"></div>
        </div>
      `);
      const targetOne = root.querySelector('#targetOne');
      const targetTwo = root.querySelector('#targetTwo');
      const targetOneParent = root.querySelector('#targetOneParent');
      const targetTwoParent = root.querySelector('#targetTwoParent');
      const otherElement = root.querySelector('#otherElement');

      setModalAsOpen(targetOne);

      expect(root.getAttribute('aria-hidden')).to.equal(null);
      expect(targetOneParent.getAttribute('aria-hidden')).to.equal(null);
      expect(targetTwoParent.getAttribute('aria-hidden')).to.equal('true');
      expect(otherElement.getAttribute('aria-hidden')).to.equal('true');

      setModalAsOpen(targetTwo);

      expect(root.getAttribute('aria-hidden')).to.equal(null);
      expect(targetOneParent.getAttribute('aria-hidden')).to.equal('true');
      expect(targetTwoParent.getAttribute('aria-hidden')).to.equal(null);
      expect(otherElement.getAttribute('aria-hidden')).to.equal('true');

      setModalAsClosed(targetTwo);

      expect(root.getAttribute('aria-hidden')).to.equal(null);
      expect(targetOneParent.getAttribute('aria-hidden')).to.equal(null);
      expect(targetTwoParent.getAttribute('aria-hidden')).to.equal('true');
      expect(otherElement.getAttribute('aria-hidden')).to.equal('true');

      setModalAsClosed(targetOne);

      expect(root.getAttribute('aria-hidden')).to.equal(null);
      expect(targetOneParent.getAttribute('aria-hidden')).to.equal(null);
      expect(targetTwoParent.getAttribute('aria-hidden')).to.equal(null);
      expect(otherElement.getAttribute('aria-hidden')).to.equal(null);
    });

    it('should handle nested opens for tabindex', () => {
      const root = container.appendChild(html`
        <div>
          <div id="targetOne">
            <a href="#foo" id="targetOneLink">foo</a>
          </div>
          <div id="targetTwo">
            <a href="#foo" id="targetTwoLink">foo</a>
          </div>
          <div id="targetThree">
            <a href="#foo" id="targetThreeLink">foo</a>
          </div>
        </div>
      `);
      const targetOne = root.querySelector('#targetOne');
      const targetTwo = root.querySelector('#targetTwo');
      const targetOneLink = root.querySelector('#targetOneLink');
      const targetTwoLink = root.querySelector('#targetTwoLink');
      const targetThreeLink = root.querySelector('#targetThreeLink');

      setModalAsOpen(targetOne);

      expect(root.getAttribute('tabindex')).to.be.null;
      expect(targetOneLink.getAttribute('tabindex')).to.be.null;
      expect(targetTwoLink.getAttribute('tabindex')).to.equal('-1');
      expect(targetThreeLink.getAttribute('tabindex')).to.equal('-1');

      setModalAsOpen(targetTwo);

      expect(root.getAttribute('tabindex')).to.be.null;
      expect(targetOneLink.getAttribute('tabindex')).to.equal('-1');
      expect(targetTwoLink.getAttribute('tabindex')).to.be.null;
      expect(targetThreeLink.getAttribute('tabindex')).to.equal('-1');

      setModalAsClosed(targetTwo);

      expect(root.getAttribute('tabindex')).to.be.null;
      expect(targetOneLink.getAttribute('tabindex')).to.be.null;
      expect(targetTwoLink.getAttribute('tabindex')).to.equal('-1');
      expect(targetThreeLink.getAttribute('tabindex')).to.equal('-1');

      setModalAsClosed(targetOne);

      expect(targetOneLink.getAttribute('tabindex')).to.be.null;
      expect(targetTwoLink.getAttribute('tabindex')).to.be.null;
      expect(targetThreeLink.getAttribute('tabindex')).to.be.null;
    });
  });
});
