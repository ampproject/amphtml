import * as Preact from '#preact';
import {BentoImgur} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoImgur preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoImgur testProp={true} />);

    const component = wrapper.find(BentoImgur.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
