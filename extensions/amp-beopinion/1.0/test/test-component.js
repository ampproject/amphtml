import * as Preact from '#preact';
import {BentoBeopinion} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoBeopinion preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoBeopinion testProp={true} />);

    const component = wrapper.find(BentoBeopinion.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
