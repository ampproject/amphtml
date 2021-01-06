/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import '../amp-accordion';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {CanRender} from '../../../../src/contextprops';
import {htmlFor} from '../../../../src/static-template';
import {subscribe, unsubscribe} from '../../../../src/context';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-accordion:1.0',
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
      toggleExperiment(win, 'amp-accordion-display-locking', true, true);
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
      await element.build();
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
      const {
        firstElementChild: header0,
        lastElementChild: content0,
      } = sections[0];
      const {
        firstElementChild: header1,
        lastElementChild: content1,
      } = sections[1];
      const {
        firstElementChild: header2,
        lastElementChild: content2,
      } = sections[2];

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
        element.querySelectorAll('[expanded]').length;
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

      const {
        firstElementChild: header0,
        lastElementChild: content0,
      } = sections[0];
      const {
        firstElementChild: header1,
        lastElementChild: content1,
      } = sections[1];
      const {
        firstElementChild: header2,
        lastElementChild: content2,
      } = sections[2];

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
      await element.build();

      const sections = element.children;
      const {
        firstElementChild: header0,
        lastElementChild: content0,
      } = sections[0];
      const {
        firstElementChild: header1,
        lastElementChild: content1,
      } = sections[1];
      const {
        firstElementChild: header2,
        lastElementChild: content2,
      } = sections[2];

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

    describe('fire events on expand and collapse', () => {
      beforeEach(async () => {
        element = html`
          <amp-accordion id="testAccordion">
            <section>
              <h2>Section 1</h2>
              <div>Content 1</div>
            </section>
            <section
              id="section2"
              on="expand:testAccordion.expand(section='section3')"
            >
              <h2>Section 2</h2>
              <div>Bunch of awesome content</div>
            </section>
            <section
              id="section3"
              on="collapse:testAccordion.collapse(section='section2')"
            >
              <h2>Section 3</h2>
              <div>Content 3</div>
            </section>
          </amp-accordion>
        `;
        win.document.body.appendChild(element);
        await element.build();
      });

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust.DEFAULT;
        return new ActionInvocation(
          element,
          method,
          args,
          source,
          caller,
          event,
          trust
        );
      }

      it('should fire events on click', async () => {
        const section1 = element.children[0];
        const section2 = element.children[1];
        const section3 = element.children[2];

        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');

        section2.firstElementChild.click();
        await waitForExpanded(section2, true);

        // Expanding section2 also expands section3
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');

        section3.firstElementChild.click();
        await waitForExpanded(section3, false);

        // Collapsing section3 also collapses section2
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');
      });

      it('should fire events on API toggle', async () => {
        const section1 = element.children[0];
        const section2 = element.children[1];
        const section3 = element.children[2];

        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');

        element.enqueAction(invocation('expand', {section: 'section2'}));
        await waitForExpanded(section2, true);

        // Expanding section2 also expands section3
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');

        element.enqueAction(invocation('collapse', {section: 'section3'}));
        await waitForExpanded(section3, false);

        // Collapsing section3 also collapses section2
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.not.have.attribute('expanded');

        element.enqueAction(invocation('expand', {section: 'section3'}));
        await waitForExpanded(section3, true);

        // Expanding section3 does not expand section2
        expect(section1).to.not.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');

        element.enqueAction(invocation('toggle'));
        await waitForExpanded(section1, true);

        // Section 3 closed on initial toggle
        // Then section 3 opened based on section 2 opening
        // Then section 2 closed based on section 3's initial close
        expect(section1).to.have.attribute('expanded');
        expect(section2).to.not.have.attribute('expanded');
        expect(section3).to.have.attribute('expanded');
      });
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
        await element.build();
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

    describe('display locking', () => {
      let defaultCssSupports;
      let defaultBeforeMatch;

      beforeEach(async () => {
        toggleExperiment(win, 'amp-accordion-display-locking', true);
        element = html`
          <amp-accordion>
            <section>
              <h2>Section 1</h2>
              <div>Puppies are cute.</div>
            </section>
            <section expanded>
              <h2>Section 2</h2>
              <div>Kittens are furry.</div>
            </section>
            <section expanded>
              <h2>Section 3</h2>
              <div>Elephants have great memory.</div>
            </section>
          </amp-accordion>
        `;
        defaultCssSupports = win.CSS.supports;
        defaultBeforeMatch = win.document.body.onbeforematch;
      });

      afterEach(() => {
        win.CSS.supports = defaultCssSupports;
        win.document.body.onbeforematch = defaultBeforeMatch;
        toggleExperiment(win, 'amp-accordion-display-locking', false);
      });

      it('should expand collpased section with beforematch event', async () => {
        win.document.body.appendChild(element);
        win.CSS.supports = () => true;
        win.document.body.onbeforematch = null;
        await element.build();

        const section1 = element.children[0];
        const content1 = section1.lastElementChild;

        expect(section1).not.to.have.attribute('expanded');
        content1.dispatchEvent(new Event('beforematch'));
        await waitForExpanded(section1, true);
        expect(section1).to.have.attribute('expanded');
      });

      it('should not expand already expanded section', async () => {
        win.document.body.appendChild(element);
        win.CSS.supports = () => true;
        win.document.body.onbeforematch = null;
        await element.build();

        const section2 = element.children[1];
        const content2 = section2.lastElementChild;

        expect(section2).to.have.attribute('expanded');
        content2.dispatchEvent(new Event('beforematch'));

        // Section should is already expanded and stays expanded
        await waitForExpanded(section2, true);
        expect(section2).to.have.attribute('expanded');
      });

      it('should not toggle section with two synchronous beforematch events', async () => {
        win.document.body.appendChild(element);
        win.CSS.supports = () => true;
        win.document.body.onbeforematch = null;
        await element.build();

        const section1 = element.children[0];
        const content1 = section1.lastElementChild;

        expect(section1).not.to.have.attribute('expanded');
        content1.dispatchEvent(new Event('beforematch'));
        content1.dispatchEvent(new Event('beforematch'));

        // Section should be expanded (not toggled opened then closed)
        await waitForExpanded(section1, true);
        expect(section1).to.have.attribute('expanded');
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

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust.DEFAULT;
        return new ActionInvocation(
          element,
          method,
          args,
          source,
          caller,
          event,
          trust
        );
      }

      describe('multi-expand accordion', () => {
        it('toggle all', async () => {
          element.enqueAction(invocation('toggle'));
          await waitForExpanded(section1, false);

          // All sections are toggled
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.have.attribute('expanded');
          expect(section3).to.have.attribute('expanded');
        });

        it('toggle one section', async () => {
          element.enqueAction(invocation('toggle', {section: 'section1'}));
          await waitForExpanded(section1, false);

          // Only section 1 is toggled
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('expand all', async () => {
          element.enqueAction(invocation('expand'));
          await waitForExpanded(section2, true);

          // All sections are expanded
          expect(section1).to.have.attribute('expanded');
          expect(section2).to.have.attribute('expanded');
          expect(section3).to.have.attribute('expanded');
        });

        it('expand one section', async () => {
          // Collapse first section to setup the test
          element.enqueAction(invocation('collapse'));
          await waitForExpanded(section1, false);

          // Expand the first section
          element.enqueAction(invocation('expand', {section: 'section1'}));
          await waitForExpanded(section1, true);

          // Only the first section is expanded
          expect(section1).to.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('collapse all', async () => {
          element.enqueAction(invocation('collapse'));
          await waitForExpanded(section1, false);

          // All sections are collapsed
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('collapse one section', async () => {
          element.enqueAction(invocation('collapse', {section: 'section1'}));
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
            <amp-accordion
              expand-single-section
              layout="fixed"
              width="300"
              height="200"
            >
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
            </amp-accordion>
          `;
          win.document.body.appendChild(element);
          await element.build();

          section1 = element.children[0];
          section2 = element.children[1];
          section3 = element.children[2];
        });

        it('toggle all', async () => {
          // First action should do nothing
          element.enqueAction(invocation('toggle'));

          // Use a second action as we need something to waitFor
          element.enqueAction(invocation('toggle', {section: 'section1'}));
          await waitForExpanded(section1, false);

          // Verify state after both actions (should reflect only 2nd action)
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('toggle one section', async () => {
          element.enqueAction(invocation('toggle', {section: 'section2'}));
          await waitForExpanded(section1, false);

          // Verify that the second section is expanded and the first
          // section is un-expanded
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');

          element.enqueAction(invocation('toggle', {section: 'section2'}));
          await waitForExpanded(section2, false);

          // Verify that the second section is collapsed
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('expand all', async () => {
          // First action should do nothing
          element.enqueAction(invocation('expand'));

          // Use a second action as we need something to waitFor
          element.enqueAction(invocation('toggle', {section: 'section1'}));
          await waitForExpanded(section1, false);

          // Verify state after both actions (should reflect only 2nd action)
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('expand one section', async () => {
          element.enqueAction(invocation('expand', {section: 'section2'}));
          await waitForExpanded(section1, false);

          // Verify that the second section is expanded and the first
          // section is un-expanded
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('collapse all', async () => {
          element.enqueAction(invocation('collapse'));
          await waitForExpanded(section1, false);

          // All sections are collapsed
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });

        it('collapse one section', async () => {
          element.enqueAction(invocation('collapse', {section: 'section1'}));
          await waitForExpanded(section1, false);

          // Section 1 is collapsed
          expect(section1).to.not.have.attribute('expanded');
          expect(section2).to.not.have.attribute('expanded');
          expect(section3).to.not.have.attribute('expanded');
        });
      });
    });
  }
);
