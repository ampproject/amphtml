import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoGpt} from '../component';

describes.sandboxed('BentoGpt preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoGpt testProp={true} />);

    const component = wrapper.find(BentoGpt.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
