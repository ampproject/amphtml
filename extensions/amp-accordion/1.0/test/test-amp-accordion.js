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
import {htmlFor} from '../../../../src/static-template';
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
        el.lastElementChild.hidden === !expanded;
      await waitFor(isExpandedOrNot, 'element expanded updated');
    }

    beforeEach(async () => {
      win = env.win;
      html = htmlFor(win.document);
      toggleExperiment(win, 'amp-accordion-bento', true, true);
      element = html`
        <amp-accordion layout="fixed" width="300" height="200">
          <section expanded>
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
      expect(header0.getAttribute('aria-expanded')).to.equal('true');
      expect(content0).to.have.attribute('id');
      expect(header0.getAttribute('aria-controls')).to.equal(
        content0.getAttribute('id')
      );

      expect(header1).to.have.attribute('tabindex');
      expect(header1).to.have.attribute('aria-controls');
      expect(header1).to.have.attribute('role');
      expect(header1).to.have.attribute('aria-expanded');
      expect(header1.getAttribute('aria-expanded')).to.equal('false');
      expect(content1).to.have.attribute('id');
      expect(header1.getAttribute('aria-controls')).to.equal(
        content1.getAttribute('id')
      );

      expect(header2).to.have.attribute('tabindex');
      expect(header2).to.have.attribute('aria-controls');
      expect(header2).to.have.attribute('role');
      expect(header2).to.have.attribute('aria-expanded');
      expect(header2.getAttribute('aria-expanded')).to.equal('false');
      expect(content2).to.have.attribute('id');
      expect(header2.getAttribute('aria-controls')).to.equal(
        content2.getAttribute('id')
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
  }
);
