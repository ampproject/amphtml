import * as Preact from '#preact';
import {BentoAdblockDetector} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoAdblockDetector preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoAdblockDetector testProp={true} />);

    const component = wrapper.find(BentoAdblockDetector.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
