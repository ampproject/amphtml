import {CSS} from '#build/bento-mega-menu-1.0.css';

import {BaseElement as BentoMegaMenu} from '#bento/components/bento-mega-menu/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

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

  it('should render expanded and collapsed sections', async () => {
    const element = await mount(html`
      <bento-mega-menu>
        <section id="section1">
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
    const sections = element.children;
    console.log({sections});

    /*
    expect(sections[0]).to.have.attribute('expanded');
    expect(
      sections[0].firstElementChild.getAttribute('aria-expanded')
    ).to.equal('true');
    expect(sections[0].lastElementChild).to.have.display('block');

    expect(sections[1]).to.not.have.attribute('expanded');
    expect(
      sections[1].firstElementChild.getAttribute('aria-expanded')
    ).to.equal('false');
    expect(sections[1].lastElementChild).to.have.display('none');

    expect(sections[2]).to.not.have.attribute('expanded');
    expect(
      sections[2].firstElementChild.getAttribute('aria-expanded')
    ).to.equal('false');
    expect(sections[2].lastElementChild).to.have.display('none');

     */
  });
});
