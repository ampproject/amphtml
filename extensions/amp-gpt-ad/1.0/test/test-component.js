import * as Preact from '#preact';
import {BentoGptAd} from '../component';
import {mount} from 'enzyme';
import {waitFor} from '#testing/test-helper';

describes.sandboxed('BentoGptAd preact component v1.0', {}, (env) => {
  // DO NOT SUBMIT: This is example code only.
  it('should render', () => {
    const wrapper = mount(<BentoGptAd testProp={true} />);

    const component = wrapper.find(BentoGptAd.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('testProp')).to.be.true;
  });
});
