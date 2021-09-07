import * as Preact from '#preact';
import {Bento__component_name_pascal_case__} from '../component';
import {mount} from 'enzyme';
import {waitFor} from '#testing/test-helper';

describes.sandboxed('Bento__component_name_pascal_case__ preact component v1.0', {}, (env) => {
  // __do_not_submit__: This is example code only.
  it('should render', () => {
    const wrapper = mount(
      <Bento__component_name_pascal_case__ testProp={true}/>
    );

    const component = wrapper.find(Bento__component_name_pascal_case__.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
