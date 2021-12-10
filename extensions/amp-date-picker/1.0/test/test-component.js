import * as Preact from '#preact';
import {BentoDatePicker} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoDatePicker preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoDatePicker testProp={true} />);

    const component = wrapper.find(BentoDatePicker.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
