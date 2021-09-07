import * as Preact from '#preact';
import {__bento_component_name_pascalcase__} from '../component';
import {mount} from 'enzyme';
import {waitFor} from '#testing/test-helper';

describes.sandboxed('__bento_component_name_pascalcase__ preact component v1.0', {}, (env) => {
  // __do_not_submit__: This is example code only.
  it('should render', () => {
    const wrapper = mount(
      <__bento_component_name_pascalcase__ testProp={true}/>
    );

    const component = wrapper.find(__bento_component_name_pascalcase__.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
