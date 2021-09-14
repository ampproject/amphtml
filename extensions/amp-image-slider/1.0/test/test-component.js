import {mount} from 'enzyme';

import * as Preact from '#preact';

import {ImageSlider} from '../component';

describes.sandboxed('ImageSlider preact component v1.0', {}, () => {
  it('should render', () => {
    const wrapper = mount(<ImageSlider testProp={true} />);

    const component = wrapper.find(ImageSlider.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
