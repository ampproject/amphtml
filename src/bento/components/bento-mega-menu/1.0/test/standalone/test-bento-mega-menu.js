// import {CSS} from '#build/bento-mega-menu-1.0.css';

import {BaseElement as BentoMegaMenu} from '#bento/components/bento-mega-menu/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin('bento-mega-menu:1.0', {amp: false}, (env) => {
  let win;
  let html;
  let element;

  beforeEach(async () => {
    win = env.win;
    html = htmlFor(win.document);
    element = html`
      <bento-mega-menu>
        <section expanded id="section1">
          <h1>header1</h1>
          <div>content1</div>
        </section>
        <section>
          <h1>header2</h1>
          <div>content2</div>
        </section>
        <section>
          <h1>header3</h1>
          <div>content3</div>
        </section>
      </bento-mega-menu>
    `;
    defineBentoElement('bento-mega-menu', BentoMegaMenu, win);
    // adoptStyles(win, CSS);
    win.document.body.appendChild(element);
    await element.getApi();
  });

  it('should render expanded and collapsed sections', () => {
    const sections = element.children;
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
