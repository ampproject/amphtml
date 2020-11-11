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

import * as Preact from '../../../../src/preact';
import {Option, Selector} from '../selector';
import {mount} from 'enzyme';

describes.sandboxed('Selector preact component', {}, () => {
  describe('standalone option', () => {
    it('should render a default option', () => {
      const wrapper = mount(
        <Option as="li" option="a">
          option a
        </Option>
      );

      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('li');
      expect(dom).to.not.have.attribute('selected');
      expect(dom.textContent).to.equal('option a');
    });
  });

  describe('multi-select selector', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Selector multiple defaultValue={[1]}>
          <Option key={1} option={1}>
            option 1
          </Option>
          <Option key={2} option={2}>
            option 2
          </Option>
          <Option key={3} option={3} disabled>
            option 3
          </Option>
        </Selector>
      );
    });

    it('should render all options', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');
      expect(dom).to.have.attribute('multiple');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);

      const option0 = options.at(0).getDOMNode();
      const option1 = options.at(1).getDOMNode();
      const option2 = options.at(2).getDOMNode();

      // Expanded state.
      expect(option0).to.have.attribute('selected');
      expect(option1).to.not.have.attribute('selected');
      expect(option2).to.not.have.attribute('selected');

      // Option content.
      expect(option0.textContent).to.equal('option 1');
      expect(option1.textContent).to.equal('option 2');
      expect(option2.textContent).to.equal('option 3');
    });

    it('should include a11y related attributes', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');
      expect(dom).to.have.attribute('multiple');
      expect(dom).to.have.attribute('aria-multiselectable');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);

      const option0 = options.at(0).getDOMNode();
      const option1 = options.at(1).getDOMNode();
      const option2 = options.at(2).getDOMNode();

      expect(option0).to.have.attribute('tabindex');
      expect(option0).to.have.attribute('aria-selected');
      expect(option0.getAttribute('aria-selected')).to.equal('true');
      expect(option0).to.have.attribute('aria-disabled');
      expect(option0.getAttribute('aria-disabled')).to.equal('false');

      expect(option1).to.have.attribute('tabindex');
      expect(option1).to.have.attribute('aria-selected');
      expect(option1.getAttribute('aria-selected')).to.equal('false');
      expect(option1).to.have.attribute('aria-disabled');
      expect(option1.getAttribute('aria-disabled')).to.equal('false');

      expect(option2).to.have.attribute('tabindex');
      expect(option2).to.have.attribute('aria-selected');
      expect(option2.getAttribute('aria-selected')).to.equal('false');
      expect(option2).to.have.attribute('aria-disabled');
      expect(option2.getAttribute('aria-disabled')).to.equal('true');
    });

    it('should select an option on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);

      // Click to expand.
      options.at(1).find('div').simulate('click');

      // Expanded state.
      expect(options.at(0).getDOMNode()).to.have.attribute('selected');
      expect(options.at(1).getDOMNode()).to.have.attribute('selected');
    });

    it('should deselect an option on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);

      // Click to deselect.
      options.at(0).find('div').simulate('click');

      // Expanded state.
      expect(options.at(0).getDOMNode()).to.not.have.attribute('selected');
    });

    it('should adjust state when multiple changes', async () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');

      const options = wrapper.find(Option);

      function countSelected() {
        const nodes = [
          options.at(0).getDOMNode(),
          options.at(1).getDOMNode(),
          options.at(2).getDOMNode(),
        ];
        return nodes
          .map((option) => option.hasAttribute('selected'))
          .reduce((sum, v) => sum + (v ? 1 : 0), 0);
      }

      expect(countSelected()).to.equal(1);

      options.at(1).find('div').simulate('click');
      expect(countSelected()).to.equal(2);

      await new Promise((resolve) => {
        wrapper.setProps({multiple: false}, resolve);
      });

      // One of the selected options should be deselected.
      expect(countSelected()).to.equal(1);
    });
  });

  describe('single-select selector', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Selector defaultValue={[1]}>
          <Option key={1} option={1}>
            option 1
          </Option>
          <Option key={2} option={2}>
            option 2
          </Option>
          <Option key={3} option={3} disabled>
            option 3
          </Option>
        </Selector>
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should select an option on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);
      expect(options.at(0).getDOMNode()).to.have.attribute('selected');

      // Click to expand.
      options.at(1).find('div').simulate('click');

      // Expanded state.
      expect(options.at(0).getDOMNode()).to.not.have.attribute('selected');
      expect(options.at(1).getDOMNode()).to.have.attribute('selected');
    });

    it('should not deselect an option on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('div');

      const options = wrapper.find(Option);
      expect(options).to.have.lengthOf(3);

      // Click to expand.
      options.at(0).find('div').simulate('click');

      // Expanded state.
      expect(options.at(0).getDOMNode()).to.have.attribute('selected');
    });
  });
});
