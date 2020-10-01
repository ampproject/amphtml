/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {Accordion, AccordionSection} from '../accordion';
import {mount} from 'enzyme';

describes.sandboxed('Accordion preact component', {}, () => {
  describe('standalone accordion section', () => {
    it('should render a default section', () => {
      const wrapper = mount(
        <AccordionSection header={<h1>header1</h1>}>content1</AccordionSection>
      );

      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');
      expect(dom).to.not.have.attribute('expanded');
      expect(dom.getAttribute('aria-expanded')).to.equal('false');
      expect(dom.children).to.have.lengthOf(2);

      const header = dom.children[0];
      expect(header.localName).to.equal('header');
      expect(header.innerHTML).to.equal('<h1>header1</h1>');

      const content = dom.children[1];
      expect(content.localName).to.equal('div');
      expect(content.innerHTML).to.equal('content1');
      expect(content.hidden).to.be.true;
    });

    it('should render an expanded section', () => {
      const wrapper = mount(
        <AccordionSection expanded header={<h1>header1</h1>}>
          content1
        </AccordionSection>
      );

      const dom = wrapper.getDOMNode();
      expect(dom).to.have.attribute('expanded');
      expect(dom.getAttribute('aria-expanded')).to.equal('true');

      const header = dom.children[0];
      expect(header.localName).to.equal('header');
      expect(header.innerHTML).to.equal('<h1>header1</h1>');

      const content = dom.children[1];
      expect(content.localName).to.equal('div');
      expect(content.innerHTML).to.equal('content1');
      expect(content.hidden).to.be.false;
    });

    it('should toggle expanded state', () => {
      const wrapper = mount(
        <AccordionSection header={<h1>header1</h1>}>content1</AccordionSection>
      );
      const dom = wrapper.getDOMNode();
      const content = dom.children[1];

      // Start unexpanded.
      expect(dom).to.not.have.attribute('expanded');
      expect(dom.getAttribute('aria-expanded')).to.equal('false');
      expect(content.hidden).to.be.true;

      // Click on header to expand.
      wrapper.find('header').simulate('click');
      expect(dom).to.have.attribute('expanded');
      expect(dom.getAttribute('aria-expanded')).to.equal('true');
      expect(content.hidden).to.be.false;

      // Click on header again to collapse.
      wrapper.find('header').simulate('click');
      expect(dom).to.not.have.attribute('expanded');
      expect(dom.getAttribute('aria-expanded')).to.equal('false');
      expect(content.hidden).to.be.true;
    });
  });

  describe('multi-expand accordion', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Accordion>
          <AccordionSection key={1} expanded header="header1">
            content1
          </AccordionSection>
          <AccordionSection key={2} header="header2">
            content2
          </AccordionSection>
          <AccordionSection key={3} header="header3">
            content3
          </AccordionSection>
        </Accordion>
      );
    });

    it('should render all sections', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.have.attribute('expanded');
      expect(sections.at(1).getDOMNode()).to.not.have.attribute('expanded');
      expect(sections.at(2).getDOMNode()).to.not.have.attribute('expanded');

      // Headers.
      expect(sections.at(0).find('header').text()).to.equal('header1');
      expect(sections.at(1).find('header').text()).to.equal('header2');
      expect(sections.at(2).find('header').text()).to.equal('header3');

      // Contents.
      expect(sections.at(0).find('div').text()).to.equal('content1');
      expect(sections.at(1).find('div').text()).to.equal('content2');
      expect(sections.at(2).find('div').text()).to.equal('content3');
      expect(sections.at(0).find('div').getDOMNode().hidden).to.be.false;
      expect(sections.at(1).find('div').getDOMNode().hidden).to.be.true;
      expect(sections.at(2).find('div').getDOMNode().hidden).to.be.true;
    });

    it('should expand a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(1).find('header').simulate('click');

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.have.attribute('expanded');
      expect(sections.at(1).getDOMNode()).to.have.attribute('expanded');

      // Contents.
      expect(sections.at(0).find('div').getDOMNode().hidden).to.be.false;
      expect(sections.at(1).find('div').getDOMNode().hidden).to.be.false;
    });

    it('should collapse a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(0).find('header').simulate('click');

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.not.have.attribute('expanded');

      // Contents.
      expect(sections.at(0).find('div').getDOMNode().hidden).to.be.true;
    });

    it('should adjust state when expandSingleSection changes', async () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);

      function countExpanded() {
        const nodes = [
          sections.at(0).getDOMNode(),
          sections.at(1).getDOMNode(),
          sections.at(2).getDOMNode(),
        ];
        return nodes
          .map((section) => section.hasAttribute('expanded'))
          .reduce((sum, v) => sum + (v ? 1 : 0), 0);
      }

      expect(countExpanded()).to.equal(1);

      sections.at(1).find('header').simulate('click');
      expect(countExpanded()).to.equal(2);

      await new Promise((resolve) => {
        wrapper.setProps({expandSingleSection: true}, resolve);
      });

      // One of the expanded sections should be collapsed.
      expect(countExpanded()).to.equal(1);
    });
  });

  describe('single-expand accordion', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Accordion expandSingleSection>
          <AccordionSection key={1} expanded header="header1">
            content1
          </AccordionSection>
          <AccordionSection key={2} header="header2">
            content2
          </AccordionSection>
          <AccordionSection key={3} header="header3">
            content3
          </AccordionSection>
        </Accordion>
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should expand a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);
      expect(sections).to.have.lengthOf(3);
      expect(sections.at(0).getDOMNode()).to.have.attribute('expanded');

      // Click to expand.
      sections.at(1).find('header').simulate('click');

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.not.have.attribute('expanded');
      expect(sections.at(1).getDOMNode()).to.have.attribute('expanded');

      // Contents.
      expect(sections.at(0).find('div').getDOMNode().hidden).to.be.true;
      expect(sections.at(1).find('div').getDOMNode().hidden).to.be.false;
    });

    it('should collapse a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(AccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(0).find('header').simulate('click');

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.not.have.attribute('expanded');

      // Contents.
      expect(sections.at(0).find('div').getDOMNode().hidden).to.be.true;
    });
  });
});
