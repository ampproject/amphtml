import * as Preact from '#preact';
import {BentoResizeGuard} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoResizeGuard preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoResizeGuard testProp={true} />);

    const component = wrapper.find(BentoResizeGuard.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
