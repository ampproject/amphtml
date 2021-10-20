import {mount} from 'enzyme';

import * as Preact from '#preact';

import {QUADRATIC_FORMULA} from './utils';

import {BentoMathml} from '../component';

describes.sandboxed('BentoMathml preact component v1.0', {}, (env) => {
  it('should render', async () => {
    const onLoadSpy = env.sandbox.spy();
    const wrapper = mount(
      <BentoMathml formula={QUADRATIC_FORMULA} onLoad={onLoadSpy}></BentoMathml>
    );
    expect(wrapper).to.have.lengthOf(1);
    const iframe = wrapper.find('iframe');
    expect(iframe).to.have.lengthOf(1);
    expect(iframe.prop('src')).to.equal(
      'http://ads.localhost:9876/dist.3p/current/frame.max.html'
    );
    expect(JSON.parse(iframe.prop('name')).attributes.formula).to.equal(
      QUADRATIC_FORMULA
    );
  });
});
