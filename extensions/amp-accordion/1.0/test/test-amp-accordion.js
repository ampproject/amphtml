import '../amp-accordion';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

import {waitFor} from '#testing/helpers/service';

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
        await element.buildInternal();
      });

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust_Enum.DEFAULT;
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
        const trust = ActionTrust_Enum.DEFAULT;
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
          await element.buildInternal();

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
