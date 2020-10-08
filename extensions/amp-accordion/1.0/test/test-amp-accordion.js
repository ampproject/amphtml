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
      expect(sections[0].getAttribute('aria-expanded')).to.equal('true');
      expect(sections[0].lastElementChild).to.have.display('block');

      expect(sections[1]).to.not.have.attribute('expanded');
      expect(sections[1].getAttribute('aria-expanded')).to.equal('false');
      expect(sections[1].lastElementChild).to.have.display('none');

      expect(sections[2]).to.not.have.attribute('expanded');
      expect(sections[2].getAttribute('aria-expanded')).to.equal('false');
      expect(sections[2].lastElementChild).to.have.display('none');
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
