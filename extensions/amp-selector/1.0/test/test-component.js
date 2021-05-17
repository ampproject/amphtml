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
import {Keys} from '../../../../src/core/constants/key-codes';
import {Option, Selector} from '../component';
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

    afterEach(() => {
      wrapper.unmount();
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

  describe('imperative api', () => {
    let wrapper;
    let ref;

    let option0;
    let option1;
    let disabledOption;

    describe('multi-select selector', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <Selector ref={ref} multiple defaultValue={['a']}>
            <Option key={1} option="a" index={1}>
              option a
            </Option>
            <Option key={2} option="b" index={2}>
              option b
            </Option>
            <Option key={3} option="c" disabled index={3}>
              option c
            </Option>
          </Selector>
        );

        const options = wrapper.find(Option);
        option0 = options.at(0).getDOMNode();
        option1 = options.at(1).getDOMNode();
        disabledOption = options.at(2).getDOMNode();
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it('toggle one option', () => {
        ref.current.toggle('b');
        wrapper.update();

        // Second option is toggled.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.toggle('a');
        wrapper.update();

        // First option is toggled.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('force toggle one option', () => {
        ref.current.toggle('b', /* force */ true);
        wrapper.update();

        // Second option is selected.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.toggle('b', /* force */ true);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('force toggle disabled option will select', () => {
        ref.current.toggle('c', /* force */ true);
        wrapper.update();

        // Disabled option can be selected with force toggle.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.have.attribute('selected');

        ref.current.toggle('c', /* force */ true);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.have.attribute('selected');
      });

      it('clear all options', async () => {
        // First option is selected by default.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.clear();
        wrapper.update();

        // No options are selected.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('select by delta', async () => {
        // First option is selected by default.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(1);
        wrapper.update();

        // Next option is selected.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(1);
        wrapper.update();

        // Skip next option (disabled) and select the option after that.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(-1);
        wrapper.update();

        // Skip previous option (disabled) and select the option before that.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(0);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });
    });

    describe('single-expand accordion', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <Selector ref={ref} defaultValue={['a']}>
            <Option key={1} option="a" index={1}>
              option a
            </Option>
            <Option key={2} option="b" index={2}>
              option b
            </Option>
            <Option key={3} option="c" disabled index={3}>
              option c
            </Option>
          </Selector>
        );

        const options = wrapper.find(Option);
        option0 = options.at(0).getDOMNode();
        option1 = options.at(1).getDOMNode();
        disabledOption = options.at(2).getDOMNode();
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it('toggle one option', () => {
        ref.current.toggle('b');
        wrapper.update();

        // Second option is toggled.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.toggle('a');
        wrapper.update();

        // First option is toggled.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('force toggle one option', () => {
        ref.current.toggle('b', /* force */ true);
        wrapper.update();

        // Second option is selected.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.toggle('b', /* force */ true);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('force toggle disabled option will select', () => {
        ref.current.toggle('c', /* force */ true);
        wrapper.update();

        // Disabled option can be selected with force toggle.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.have.attribute('selected');

        ref.current.toggle('c', /* force */ true);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.have.attribute('selected');
      });

      it('clear all options', async () => {
        // First option is selected by default.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.clear();
        wrapper.update();

        // No options are selected.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });

      it('select by delta', async () => {
        // First option is selected by default.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(1);
        wrapper.update();

        // Next option is selected.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(1);
        wrapper.update();

        // Skip next option (disabled) and select the option after that.
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(-1);
        wrapper.update();

        // Skip previous option (disabled) and select the option before that.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');

        ref.current.selectBy(0);
        wrapper.update();

        // Nothing has changed.
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(disabledOption).to.not.have.attribute('selected');
      });
    });
  });

  describe('keyboard interactions', () => {
    let wrapper;
    let ref;

    let selector;
    let options;
    let option0;
    let option1;
    let option2;

    describe('multi-select selector', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <Selector ref={ref} multiple>
            <Option key={1} option="a">
              option a
            </Option>
            <Option key={2} option="b">
              option b
            </Option>
            <Option key={3} option="c">
              option c
            </Option>
          </Selector>
        );

        selector = wrapper.find('div').first();
        options = wrapper.find(Option);
        option0 = options.at(0).getDOMNode();
        option1 = options.at(1).getDOMNode();
        option2 = options.at(2).getDOMNode();
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it('navigate by arrows do not change selection state', () => {
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.LEFT_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.RIGHT_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.DOWN_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.UP_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });

      it('Enter to select', () => {
        options.at(0).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Subsequent Enter will deselect.
        options.at(0).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Select multiple options.
        options.at(0).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        options.at(1).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });

      it('Space to select', () => {
        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Subsequent Space will deselect.
        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Select multiple options.
        options.at(0).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });
    });

    describe('single-select selector ', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <Selector ref={ref}>
            <Option key={1} option="a">
              option a
            </Option>
            <Option key={2} option="b">
              option b
            </Option>
            <Option key={3} option="c">
              option c
            </Option>
          </Selector>
        );

        selector = wrapper.find('div').first();
        options = wrapper.find(Option);
        option0 = options.at(0).getDOMNode();
        option1 = options.at(1).getDOMNode();
        option2 = options.at(2).getDOMNode();
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it('navigate by arrows do not change selection state', () => {
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.LEFT_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.RIGHT_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.DOWN_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        selector.simulate('keydown', {key: Keys.UP_ARROW});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });

      it('Enter to select', () => {
        options.at(0).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Subsequent Enter does nothing.
        options.at(0).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.have.attribute('selected');
        expect(option1).to.not.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Select new option deselects the first.
        options.at(1).find('div').simulate('keydown', {key: Keys.ENTER});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });

      it('Space to select', () => {
        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Subsequent Space does nothing.
        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');

        // Select new option deselects the first.
        options.at(1).find('div').simulate('keydown', {key: Keys.SPACE});
        expect(option0).to.not.have.attribute('selected');
        expect(option1).to.have.attribute('selected');
        expect(option2).to.not.have.attribute('selected');
      });
    });
  });
});
