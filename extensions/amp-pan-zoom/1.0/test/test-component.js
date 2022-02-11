import * as Preact from '#preact';
import {BentoPanZoom} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoPanZoom preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoPanZoom testProp={true} />);

    const component = wrapper.find(BentoPanZoom.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
