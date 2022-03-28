import {CSS} from '#build/bento-accordion-1.0.css';

import {BaseElement as BentoAccordion} from '#bento/components/bento-accordion/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {subscribe, unsubscribe} from '#core/context';
import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';
import {CanRender} from '#preact/contextprops';

import {waitFor} from '#testing/helpers/service';

describes.realWin('bento-accordion:1.0', {amp: false}, (env) => {
  let win;
  let html;
  let element;

  async function waitForExpanded(el, expanded) {
    const isExpandedOrNot = () =>
      el.hasAttribute('expanded') === expanded &&
      el.firstElementChild.getAttribute('aria-expanded') === String(expanded);
    await waitFor(isExpandedOrNot, 'element expanded updated');
  }

  function readContextProp(element, prop) {
    return new Promise((resolve) => {
      const handler = (value) => {
        resolve(value);
        unsubscribe(element, [prop], handler);
      };
      subscribe(element, [prop], handler);
    });
  }

  beforeEach(async () => {
    win = env.win;
    html = htmlFor(win.document);
    element = html`
      <bento-accordion>
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
      </bento-accordion>
    `;
    defineBentoElement('bento-accordion', BentoAccordion, win);
    adoptStyles(win, CSS);
    win.document.body.appendChild(element);
    await element.getApi();
  });

  it('should render expanded and collapsed sections', () => {
    const sections = element.children;
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
  });

  it('should propagate renderable context', async () => {
    const sections = element.children;
    const renderables = await Promise.all([
      readContextProp(sections[0].lastElementChild, CanRender),
      readContextProp(sections[1].lastElementChild, CanRender),
      readContextProp(sections[2].lastElementChild, CanRender),
    ]);
    expect(renderables[0]).to.be.true;
    expect(renderables[1]).to.be.false;
    expect(renderables[2]).to.be.false;
  });

  it('should have amp specific classes for CSS', () => {
    const sections = element.children;
    const {firstElementChild: header0, lastElementChild: content0} =
      sections[0];
    const {firstElementChild: header1, lastElementChild: content1} =
      sections[1];
    const {firstElementChild: header2, lastElementChild: content2} =
      sections[2];

    // Check classes
    expect(header0.className).to.include('i-amphtml-accordion-header');
    expect(header1.className).to.include('i-amphtml-accordion-header');
    expect(header2.className).to.include('i-amphtml-accordion-header');
    expect(content0.className).to.include('i-amphtml-accordion-content');
    expect(content1.className).to.include('i-amphtml-accordion-content');
    expect(content2.className).to.include('i-amphtml-accordion-content');

    // Check computed styles
    expect(win.getComputedStyle(header0).margin).to.equal('0px');
    expect(win.getComputedStyle(header0).cursor).to.equal('pointer');
    expect(win.getComputedStyle(header0).backgroundColor).to.equal(
      'rgb(239, 239, 239)'
    );
    expect(win.getComputedStyle(header0).paddingRight).to.equal('20px');
    expect(win.getComputedStyle(header0).border).to.equal(
      '1px solid rgb(223, 223, 223)'
    );

    expect(win.getComputedStyle(header1).margin).to.equal('0px');
    expect(win.getComputedStyle(header1).cursor).to.equal('pointer');
    expect(win.getComputedStyle(header1).backgroundColor).to.equal(
      'rgb(239, 239, 239)'
    );
    expect(win.getComputedStyle(header1).paddingRight).to.equal('20px');
    expect(win.getComputedStyle(header1).border).to.equal(
      '1px solid rgb(223, 223, 223)'
    );

    expect(win.getComputedStyle(header2).margin).to.equal('0px');
    expect(win.getComputedStyle(header2).cursor).to.equal('pointer');
    expect(win.getComputedStyle(header2).backgroundColor).to.equal(
      'rgb(239, 239, 239)'
    );
    expect(win.getComputedStyle(header2).paddingRight).to.equal('20px');
    expect(win.getComputedStyle(header2).border).to.equal(
      '1px solid rgb(223, 223, 223)'
    );

    expect(win.getComputedStyle(content0).margin).to.equal('0px');
    expect(win.getComputedStyle(content1).margin).to.equal('0px');
    expect(win.getComputedStyle(content2).margin).to.equal('0px');
  });

  it('should expand and collapse on click', async () => {
    const sections = element.children;

    sections[1].firstElementChild.click();
    await waitForExpanded(sections[1], true);

    expect(sections[0]).to.have.attribute('expanded');
    expect(sections[0].lastElementChild).to.have.display('block');

    expect(sections[1]).to.have.attribute('expanded');
    expect(sections[1].lastElementChild).to.have.display('block');

    expect(sections[2]).to.not.have.attribute('expanded');
    expect(sections[2].lastElementChild).to.have.display('none');

    sections[0].firstElementChild.click();
    await waitForExpanded(sections[0], false);

    expect(sections[0]).to.not.have.attribute('expanded');
    expect(sections[0].lastElementChild).to.have.display('none');

    expect(sections[1]).to.have.attribute('expanded');
    expect(sections[1].lastElementChild).to.have.display('block');

    expect(sections[2]).to.not.have.attribute('expanded');
    expect(sections[2].lastElementChild).to.have.display('none');
  });

  it('should switch expand-single-section value', async () => {
    const sections = element.children;
    sections[1].firstElementChild.click();
    await waitForExpanded(sections[1], true);

    const getExpandedCount = () =>
      element.querySelectorAll('[aria-expanded="true"]').length;
    expect(getExpandedCount()).to.equal(2);

    element.setAttribute('expand-single-section', '');
    await waitFor(
      () => getExpandedCount() == 1,
      'only one element stays expanded'
    );
  });

  it('should expand and collapse on attribute change', async () => {
    const sections = element.children;

    sections[1].setAttribute('expanded', '');
    await waitForExpanded(sections[1], true);

    expect(sections[0]).to.have.attribute('expanded');
    expect(sections[0].lastElementChild).to.have.display('block');

    expect(sections[1]).to.have.attribute('expanded');
    expect(sections[1].lastElementChild).to.have.display('block');

    expect(sections[2]).to.not.have.attribute('expanded');
    expect(sections[2].lastElementChild).to.have.display('none');

    sections[0].removeAttribute('expanded');
    await waitForExpanded(sections[0], false);

    expect(sections[0]).to.not.have.attribute('expanded');
    expect(sections[0].lastElementChild).to.have.display('none');

    expect(sections[1]).to.have.attribute('expanded');
    expect(sections[1].lastElementChild).to.have.display('block');

    expect(sections[2]).to.not.have.attribute('expanded');
    expect(sections[2].lastElementChild).to.have.display('none');
  });

  it('should include a11y related attributes', async () => {
    const sections = element.children;

    const {firstElementChild: header0, lastElementChild: content0} =
      sections[0];
    const {firstElementChild: header1, lastElementChild: content1} =
      sections[1];
    const {firstElementChild: header2, lastElementChild: content2} =
      sections[2];

    expect(header0).to.have.attribute('tabindex');
    expect(header0).to.have.attribute('aria-controls');
    expect(header0).to.have.attribute('role');
    expect(header0).to.have.attribute('aria-expanded');
    expect(header0).to.have.attribute('id');
    expect(header0.getAttribute('aria-expanded')).to.equal('true');
    expect(content0).to.have.attribute('id');
    expect(content0).to.have.attribute('aria-labelledby');
    expect(content0).to.have.attribute('role');
    expect(header0.getAttribute('aria-controls')).to.equal(
      content0.getAttribute('id')
    );
    expect(header0.getAttribute('id')).to.equal(
      content0.getAttribute('aria-labelledby')
    );

    expect(header1).to.have.attribute('tabindex');
    expect(header1).to.have.attribute('aria-controls');
    expect(header1).to.have.attribute('role');
    expect(header1).to.have.attribute('aria-expanded');
    expect(header1).to.have.attribute('id');
    expect(header1.getAttribute('aria-expanded')).to.equal('false');
    expect(content1).to.have.attribute('id');
    expect(content1).to.have.attribute('aria-labelledby');
    expect(content1).to.have.attribute('role');
    expect(header1.getAttribute('aria-controls')).to.equal(
      content1.getAttribute('id')
    );
    expect(header1.getAttribute('id')).to.equal(
      content1.getAttribute('aria-labelledby')
    );

    expect(header2).to.have.attribute('tabindex');
    expect(header2).to.have.attribute('aria-controls');
    expect(header2).to.have.attribute('role');
    expect(header2).to.have.attribute('aria-expanded');
    expect(header2).to.have.attribute('id');
    expect(header2.getAttribute('aria-expanded')).to.equal('false');
    expect(content2).to.have.attribute('id');
    expect(content2).to.have.attribute('aria-labelledby');
    expect(content2).to.have.attribute('role');
    expect(header2.getAttribute('aria-controls')).to.equal(
      content2.getAttribute('id')
    );
    expect(header2.getAttribute('id')).to.equal(
      content2.getAttribute('aria-labelledby')
    );
  });

  it('should not overwrite existing header and content ids', async () => {
    element = html`
      <bento-accordion>
        <section expanded id="section1">
          <h1 id="h1">header1</h1>
          <div id="c1">content1</div>
        </section>
        <section>
          <h1 id="h2">header2</h1>
          <div>content2</div>
        </section>
        <section>
          <h1>header3</h1>
          <div id="c3">content3</div>
        </section>
      </bento-accordion>
    `;
    win.document.body.appendChild(element);
    await element.getApi();

    const sections = element.children;
    const {firstElementChild: header0, lastElementChild: content0} =
      sections[0];
    const {firstElementChild: header1, lastElementChild: content1} =
      sections[1];
    const {firstElementChild: header2, lastElementChild: content2} =
      sections[2];

    expect(header0.getAttribute('id')).to.equal('h1');
    expect(content0.getAttribute('id')).to.equal('c1');
    expect(header0.getAttribute('aria-controls')).to.equal(
      content0.getAttribute('id')
    );
    expect(header0.getAttribute('id')).to.equal(
      content0.getAttribute('aria-labelledby')
    );

    expect(header1.getAttribute('id')).to.equal('h2');
    expect(header1.getAttribute('aria-controls')).to.equal(
      content1.getAttribute('id')
    );
    expect(header1.getAttribute('id')).to.equal(
      content1.getAttribute('aria-labelledby')
    );

    expect(content2.getAttribute('id')).to.equal('c3');
    expect(header2.getAttribute('aria-controls')).to.equal(
      content2.getAttribute('id')
    );
    expect(header2.getAttribute('id')).to.equal(
      content2.getAttribute('aria-labelledby')
    );
  });

  it('should not overwrite existing role attributes', async () => {
    element = html`
      <bento-accordion>
        <section expanded id="section1">
          <h1 role="cat">header1</h1>
          <div role="dog">content1</div>
        </section>
        <section>
          <h1 id="h2">header2</h1>
          <div>content2</div>
        </section>
      </bento-accordion>
    `;
    win.document.body.appendChild(element);
    await element.getApi();

    const sections = element.children;
    const {firstElementChild: header0, lastElementChild: content0} =
      sections[0];
    const {firstElementChild: header1, lastElementChild: content1} =
      sections[1];

    expect(header0).to.have.attribute('role');
    expect(header0.getAttribute('role')).to.equal('cat');
    expect(content0).to.have.attribute('role');
    expect(content0.getAttribute('role')).to.equal('dog');

    expect(header1).to.have.attribute('role');
    expect(header1.getAttribute('role')).to.equal('button');
    expect(content1).to.have.attribute('role');
    expect(content1.getAttribute('role')).to.equal('region');
  });

  describe('animate', () => {
    let animateStub;

    beforeEach(async () => {
      animateStub = env.sandbox.stub(win.Element.prototype, 'animate');
      element = html`
        <bento-accordion animate>
          <section expanded>
            <h1>header1</h1>
            <div>content1</div>
          </section>
          <section>
            <h1>header2</h1>
            <div>content2</div>
          </section>
        </bento-accordion>
      `;
      win.document.body.appendChild(element);
      await element.getApi();
    });

    it('should not animate on build', () => {
      expect(animateStub).to.not.be.called;
    });

    it('should animate expand', async () => {
      const animation = {};
      animateStub.returns(animation);
      const sections = element.children;
      const section = sections[1];

      section.setAttribute('expanded', '');
      await waitForExpanded(sections[1], true);

      expect(animateStub).to.be.calledOnce;
      animation.onfinish();

      expect(section).to.have.attribute('expanded');
      expect(section.lastElementChild).to.have.display('block');
    });

    it('should animate collapse', async () => {
      const animation = {};
      animateStub.returns(animation);
      const sections = element.children;
      const section = sections[0];

      section.removeAttribute('expanded');
      await waitFor(() => animateStub.callCount > 0, 'animation started');

      expect(animateStub).to.be.calledOnce;
      expect(section).to.not.have.attribute('expanded');
      // Still displayed while animating.
      expect(section.lastElementChild).to.have.display('block');

      animation.onfinish();
      await waitForExpanded(sections[0], false);
      expect(section.lastElementChild).to.have.display('none');
    });
  });

  describe('imperative api', () => {
    let section1;
    let section2;
    let section3;

    beforeEach(() => {
      section1 = element.children[0];
      section2 = element.children[1];
      section3 = element.children[2];
    });

    describe('multi-expand accordion', () => {
      it('toggle all', async () => {
        const api = await element.getApi();
        api.toggle();
        await waitForExpanded(section1, false);

        // All sections are toggled
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');
      });

      it('toggle one section', async () => {
        const api = await element.getApi();
        api.toggle('section1');
        await waitForExpanded(section1, false);

        // Only section 1 is toggled
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('expand all', async () => {
        const api = await element.getApi();
        api.expand();
        await waitForExpanded(section2, true);

        // All sections are expanded
        expect(section1).to.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');
      });

      it('expand one section', async () => {
        const api = await element.getApi();
        // Collapse first section to setup the test
        api.collapse();
        await waitForExpanded(section1, false);

        // Expand the first section
        api.expand('section1');
        await waitForExpanded(section1, true);

        // Only the first section is expanded
        expect(section1).to.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('collapse all', async () => {
        const api = await element.getApi();
        api.collapse();
        await waitForExpanded(section1, false);

        // All sections are collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('collapse one section', async () => {
        const api = await element.getApi();
        api.collapse('section1');
        await waitForExpanded(section1, false);

        // Only the first section is collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });
    });

    describe('single-expand accordion', () => {
      beforeEach(async () => {
        element = html`
          <bento-accordion expand-single-section>
            <section expanded id="section1">
              <h1>header1</h1>
              <div>content1</div>
            </section>
            <section id="section2">
              <h1>header2</h1>
              <div>content2</div>
            </section>
            <section>
              <h1>header3</h1>
              <div>content3</div>
            </section>
          </bento-accordion>
        `;
        win.document.body.appendChild(element);
        await element.getApi();

        section1 = element.children[0];
        section2 = element.children[1];
        section3 = element.children[2];
      });

      it('toggle all', async () => {
        const api = await element.getApi();
        // First action should do nothing
        api.toggle();

        // Use a second action as we need something to waitFor
        api.toggle('section1');
        await waitForExpanded(section1, false);

        // Verify state after both actions (should reflect only 2nd action)
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('toggle one section', async () => {
        const api = await element.getApi();
        api.toggle('section2');
        await waitForExpanded(section1, false);

        // Verify that the second section is expanded and the first
        // section is un-expanded
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');

        api.toggle('section2');
        await waitForExpanded(section2, false);

        // Verify that the second section is collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('expand all', async () => {
        const api = await element.getApi();
        // First action should do nothing
        api.expand();

        // Use a second action as we need something to waitFor
        api.toggle('section1');
        await waitForExpanded(section1, false);

        // Verify state after both actions (should reflect only 2nd action)
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('expand one section', async () => {
        const api = await element.getApi();
        api.expand('section2');
        await waitForExpanded(section1, false);

        // Verify that the second section is expanded and the first
        // section is un-expanded
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('collapse all', async () => {
        const api = await element.getApi();
        api.collapse();
        await waitForExpanded(section1, false);

        // All sections are collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('collapse one section', async () => {
        const api = await element.getApi();
        api.collapse('section1');
        await waitForExpanded(section1, false);

        // Section 1 is collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });
    });

    describe('misc', () => {
      beforeEach(async () => {
        element = html`
          <bento-accordion id="testAccordion">
            <section>
              <h2>Section 1</h2>
              <div>Content 1</div>
            </section>
            <section id="section2">
              <h2>Section 2</h2>
              <div>Bunch of awesome content</div>
            </section>
            <section id="section3">
              <h2>Section 3</h2>
              <div>Content 3</div>
            </section>
          </bento-accordion>
        `;
        win.document.body.appendChild(element);
        await element.getApi();
      });

      it('should capture events in bento mode (w/o "on" attribute)', async () => {
        const section1 = element.children[0];
        const section3 = element.children[2];

        // Set up section 1 to trigger expand of section 3 on expand
        // and collapse of section 3 on collapse
        const api = await element.getApi();
        section1.addEventListener('expand', () => api.expand('section3'));
        section1.addEventListener('collapse', () => api.collapse('section3'));

        // initally both section 1 and 3 are collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');

        // expand section 1
        section1.firstElementChild.click();
        await waitForExpanded(section1, true);

        // both section 1 and 3 are expanded
        expect(section1).to.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');

        // collapse section 1
        section1.firstElementChild.click();
        await waitForExpanded(section1, false);

        // both section 1 and 3 are collapsed
        expect(section1).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('should fire and listen for "expand" and "collapse" events', async () => {
        const section1 = element.children[0];

        // Add spy functions for expand and collapse
        const spyE = env.sandbox.spy();
        const spyC = env.sandbox.spy();
        section1.addEventListener('expand', spyE);
        section1.addEventListener('collapse', spyC);

        expect(spyE).to.not.be.called;
        expect(spyC).to.not.be.called;

        // expand section 1
        section1.firstElementChild.click();
        await waitForExpanded(section1, true);

        expect(spyE).to.be.calledOnce;
        expect(spyC).to.not.be.called;

        // collapse section 1
        section1.firstElementChild.click();
        await waitForExpanded(section1, false);

        expect(spyE).to.be.calledOnce;
        expect(spyC).to.be.calledOnce;
      });
    });
  });
});
