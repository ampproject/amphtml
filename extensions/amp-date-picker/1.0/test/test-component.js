import {expect} from 'chai';
import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoDatePicker} from '../component';

const DEFAULT_PROPS = {
  layout: 'fixed-height',
  height: 360,
};

function DatePicker(props = {}) {
  const combinedProps = {...DEFAULT_PROPS, ...props};
  return <BentoDatePicker {...combinedProps}></BentoDatePicker>;
}

describes.sandboxed('BentoDatePicker preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<DatePicker />);

    const component = wrapper.find(BentoDatePicker.name);
    expect(component).to.have.lengthOf(1);
  });

  describe('initial dates', () => {
    let onChangeStub;

    beforeEach(() => {
      onChangeStub = env.sandbox.stub();
    });

    it('should use the value of a single input at load-time', () => {
      const wrapper = mount(
        <DatePicker onChange={onChangeStub} inputSelector="#date">
          <input type="text" id="date" value="2021-01-01" />
        </DatePicker>
      );

      expect(wrapper.find('[data-date="2021-01-01"]')).not.to.be.undefined;
    });
  });
});
