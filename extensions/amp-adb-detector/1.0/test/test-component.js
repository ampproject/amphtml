import * as Preact from '#preact';
import {BentoAdbDetector} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoAdbDetector preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoAdbDetector testProp={true} />);

    const component = wrapper.find(BentoAdbDetector.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
