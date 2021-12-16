import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoList} from '../component/component';

describes.sandboxed('BentoList preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoList testProp={true} />);

    const component = wrapper.find(BentoList.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
