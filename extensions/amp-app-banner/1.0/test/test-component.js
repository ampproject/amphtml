import * as Preact from '#preact';
import {BentoAppBanner} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('BentoAppBanner preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoAppBanner testProp={true} />);

    const component = wrapper.find(BentoAppBanner.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
