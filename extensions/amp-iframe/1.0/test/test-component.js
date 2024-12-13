import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoIframe} from '../component';

describes.sandboxed('BentoIframe preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<BentoIframe src={'https://www.google.com'} />);

    const component = wrapper.find(BentoIframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
  });

  it('should set truthy props and strip falsy props', () => {
    const wrapper = mount(
      <BentoIframe
        src={'https://www.google.com'}
        allowFullScreen={true}
        allowPaymentRequest={false}
      />
    );

    const component = wrapper.find(BentoIframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
    expect(component.prop('allowFullScreen')).to.be.true;
    // falsy values are stripped by Preact
    expect(component.prop('allowpaymentrequest')).to.be.undefined;
  });

  it('should trigger onLoadCallback when iframe loads', () => {
    const onLoadSpy = env.sandbox.spy();
    const wrapper = mount(
      <BentoIframe src={'https://www.google.com'} onLoad={onLoadSpy} />
    );
    wrapper.find('iframe').simulate('load');
    expect(onLoadSpy).to.be.calledOnce;
  });
});
