import {mount} from 'enzyme';

import * as Preact from '#preact';

import {waitFor} from '#testing/helpers/service';
import {flush} from '#testing/preact';

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

  describe('embed-size', () => {
    let container;
    let wrapper;
    let requestResize;

    beforeEach(async () => {
      // Render outside the viewport so that embed-size resizes immediately.
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-10000px';
      document.body.appendChild(container);
      requestResize = env.sandbox.spy();
      wrapper = mount(
        <BentoIframe src="about:blank" requestResize={requestResize} />,
        {attachTo: container}
      );
      await flush();
    });

    afterEach(() => {
      wrapper.unmount();
      container.remove();
    });

    function postEmbedSize(source, size) {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {type: 'embed-size', height: size, width: size},
          source,
        })
      );
    }

    it('should resize on embed-size from its own iframe', async () => {
      const iframe = wrapper.find('iframe').getDOMNode();
      postEmbedSize(iframe.contentWindow, 500);
      await waitFor(() => requestResize.called, 'resize from own iframe');
      expect(requestResize).to.be.calledOnceWith(500, 500);
    });

    it('should ignore embed-size from another window', async () => {
      const iframe = wrapper.find('iframe').getDOMNode();
      postEmbedSize(iframe.contentWindow, 500);
      await waitFor(() => requestResize.called, 'resize from own iframe');

      postEmbedSize(window, 1000);
      postEmbedSize(null, 1000);
      postEmbedSize(iframe.contentWindow, 600);
      await waitFor(() => requestResize.callCount >= 2, 'second resize');

      expect(requestResize).to.not.be.calledWith(1000, 1000);
      expect(requestResize.lastCall).to.be.calledWith(600, 600);
    });
  });
});
