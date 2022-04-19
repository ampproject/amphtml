import * as Preact from '#preact';
import {BentoMegaMenu} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoMegaMenu preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoMegaMenu testProp={true} />);

    const component = wrapper.find(BentoMegaMenu.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
