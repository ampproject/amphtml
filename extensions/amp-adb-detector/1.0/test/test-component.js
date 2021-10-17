import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoAdbDetector} from '../component';

describes.sandboxed('BentoAdbDetector preact component v1.0', {}, () => {
  it('should render', () => {
    const wrapper = mount(<BentoAdbDetector testProp={true} />);

    const component = wrapper.find(BentoAdbDetector.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
