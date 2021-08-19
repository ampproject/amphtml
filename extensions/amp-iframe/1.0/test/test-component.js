import * as Preact from '#preact';
import {Iframe} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('Iframe preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<Iframe src={'https://www.google.com'} />);

    const component = wrapper.find(Iframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
  });

  it('should set truthy props and strip falsy props', () => {
    const wrapper = mount(
      <Iframe
        src={'https://www.google.com'}
        allowFullScreen={true}
        allowPaymentRequest={false}
      />
    );

    const component = wrapper.find(Iframe.name);
    expect(component).to.have.lengthOf(1);
    expect(component.prop('src')).to.equal('https://www.google.com');
    expect(component.prop('allowFullScreen')).to.be.true;
    // falsy values are stripped by Preact
    expect(component.prop('allowpaymentrequest')).to.be.undefined;
  });

  it('should trigger onLoadCallback when iframe loads', () => {
    const onLoadSpy = env.sandbox.spy();
    const wrapper = mount(
      <Iframe src={'https://www.google.com'} onLoadCallback={onLoadSpy} />
    );
    wrapper.find('iframe').simulate('load');
    expect(onLoadSpy).to.be.calledOnce;
  });
});
