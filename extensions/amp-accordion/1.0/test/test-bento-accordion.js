import '../amp-accordion';
import {subscribe, unsubscribe} from '#core/context';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {CanRender} from '#preact/contextprops';

import {waitFor} from '#testing/helpers/service';

/**
 * todo(kvchari): refactor to test same functionality using <bento-accordion> instead of <amp-accordion>
 * temporarily splitting out amp-accordion tests that are not amp-specific.
 * blockers: migrate off amp testing infra; fix illegal constructor error when connecting custom element.
 * outstanding: change custom element name, remove amp attrs (layout, height, width, etc),
 *  remove dependency on AMP.BaseElement, remove experiment references, verify tests succeed,
 *  set up tests by defining bento custom element and awaiting its build (avoiding `buildInternal`)
 */

describes.realWin(
  'bento-accordion:1.0',
  {
    amp: {
      extensions: ['amp-accordion:1.0'],
    },
  },
  (env) => {
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
      toggleExperiment(win, 'bento-accordion', true, true);
      element = html`
        <amp-accordion layout="fixed" width="300" height="200">
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
        </amp-accordion>
      `;
      win.document.body.appendChild(element);
      await element.buildInternal();
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
        <amp-accordion layout="fixed" width="300" height="200">
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
        </amp-accordion>
      `;
      win.document.body.appendChild(element);
      await element.buildInternal();

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
        <amp-accordion layout="fixed" width="300" height="200">
          <section expanded id="section1">
            <h1 role="cat">header1</h1>
            <div role="dog">content1</div>
          </section>
          <section>
            <h1 id="h2">header2</h1>
            <div>content2</div>
          </section>
        </amp-accordion>
      `;
      win.document.body.appendChild(element);
      await element.buildInternal();

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

    it('should pick up new children', async () => {
      const newSection = document.createElement('section');
      newSection.setAttribute('expanded', '');
      newSection.appendChild(document.createElement('h2'));
      newSection.appendChild(document.createElement('div'));
      element.appendChild(newSection);

      await waitForExpanded(newSection, true);

      expect(newSection.firstElementChild.className).to.include(
        'i-amphtml-accordion-header'
      );
      expect(newSection.lastElementChild.className).to.include(
        'i-amphtml-accordion-content'
      );
    });

    describe('animate', () => {
      let animateStub;

      beforeEach(async () => {
        animateStub = env.sandbox.stub(win.Element.prototype, 'animate');
        element = html`
          <amp-accordion animate layout="fixed" width="300" height="200">
            <section expanded>
              <h1>header1</h1>
              <div>content1</div>
            </section>
            <section>
              <h1>header2</h1>
              <div>content2</div>
            </section>
          </amp-accordion>
        `;
        win.document.body.appendChild(element);
        await element.buildInternal();
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
      /** todo(kvchari): needs some bento api tests */
    });
  }
);
