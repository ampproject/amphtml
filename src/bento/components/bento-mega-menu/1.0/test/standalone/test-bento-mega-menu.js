import {CSS} from '#build/bento-mega-menu-1.0.css';

import {BaseElement as BentoMegaMenu} from '#bento/components/bento-mega-menu/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {cleanHtml, cleanWhitespace} from '#testing/helpers/cleanHtml';

describes.realWin('bento-mega-menu:1.0', {amp: false}, (env) => {
  let win;
  let html;

  beforeEach(async () => {
    win = env.win;
    html = htmlFor(win.document);
    defineBentoElement('bento-mega-menu', BentoMegaMenu, win);
    adoptStyles(win, CSS);
  });

  async function mount(element) {
    win.document.body.appendChild(element);
    await element.getApi();
    return element;
  }

  /** @type {HTMLElement} */
  let element;
  beforeEach(async () => {
    element = await mount(html`
      <bento-mega-menu>
        <section>
          <span>header1</span>
          <div>content1</div>
        </section>
        <section>
          <span>header2</span>
          <div>content2</div>
        </section>
        <section>
          <span>header3</span>
          <div>content3</div>
        </section>
      </bento-mega-menu>
    `);
  });

  function getTitles() {
    return element.querySelectorAll('span');
  }

  function getContents() {
    return element.querySelectorAll('div');
  }

  it('should render a shadow DOM alongside the light DOM', async () => {
    expect(element.children).to.have.lengthOf(3);
    expect(element.shadowRoot).not.to.be.null;
  });
  it('should add appropriate aria labels to the light DOM', async () => {
    const ariaAttributes = [
      'id',
      'role',
      'aria-haspopup',
      'aria-expanded',
      'aria-controls',
    ];

    // Since ids are dynamically generated, we have to grab the values:
    const ids = Array.from(getContents()).map((c) => c.id);

    expect(snapshot(element, ariaAttributes)).to.equal(
      cleanWhitespace(`
        <bento-mega-menu>
          <section>
            <span role="button" aria-controls="${ids[0]}" aria-haspopup="dialog">header1</span>
            <div role="dialog" id="${ids[0]}">content1</div>
          </section>
          <section>
            <span role="button" aria-controls="${ids[1]}" aria-haspopup="dialog">header2</span>
            <div role="dialog" id="${ids[1]}">content2</div>
          </section>
          <section>
            <span role="button" aria-controls="${ids[2]}" aria-haspopup="dialog">header3</span>
            <div role="dialog" id="${ids[2]}">content3</div>
          </section>
        </bento-mega-menu>
      `)
    );
  });

  describe('clicking a menu title', () => {
    beforeEach(async () => {
      getTitles()[0].click();
      await rerender();
    });
    it('should expand that section', async () => {
      const sections = element.children;
      expect(sections[0]).to.have.attribute('expanded');
      expect(sections[1]).not.to.have.attribute('expanded');
      expect(sections[2]).not.to.have.attribute('expanded');
    });
    it('clicking the menu title again will hide the menu', async () => {
      getTitles()[0].click();
      await rerender();

      const sections = element.children;
      expect(sections[0]).not.to.have.attribute('expanded');
      expect(sections[1]).not.to.have.attribute('expanded');
      expect(sections[2]).not.to.have.attribute('expanded');
    });
    it('clicking a second menu title will expand the second section', async () => {
      getTitles()[1].click();
      await rerender();

      const sections = element.children;
      expect(sections[0]).not.to.have.attribute('expanded');
      expect(sections[1]).to.have.attribute('expanded');
      expect(sections[2]).not.to.have.attribute('expanded');
    });
  });
});

/**
 * @param {HTMLElement} el
 * @param {string[]} keepAttrs
 * @return {string}
 */
function snapshot(el, keepAttrs = ['expanded']) {
  return cleanHtml(el.outerHTML, keepAttrs);
}

function rerender() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
}
