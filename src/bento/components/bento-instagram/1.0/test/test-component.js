import {mount} from 'enzyme';

import {BentoInstagram} from '#bento/components/bento-instagram/1.0/component';

import * as Preact from '#preact';
import {createRef} from '#preact';
import {WithAmpContext} from '#preact/context';

import {waitFor} from '#testing/helpers/service';

describes.sandboxed('BentoInstagram preact component v1.0', {}, (env) => {
  it('Normal render', () => {
    const wrapper = mount(
      <BentoInstagram
        shortcode="B8QaZW4AQY_"
        style={{
          'width': 500,
          'height': 600,
        }}
      />
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it('Render with caption', () => {
    const wrapper = mount(
      <BentoInstagram
        shortcode="B8QaZW4AQY_"
        captioned
        style={{'width': 500, 'height': 705}}
      />
    );
    expect(wrapper.find('iframe').prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/captioned/?cr=1&v=12'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it.skip('Resize prop is called', () => {
    const requestResizeSpy = env.sandbox.spy();
    const wrapper = mount(
      <BentoInstagram
        shortcode="B8QaZW4AQY_"
        captioned
        style={{'width': 500, 'height': 705}}
        requestResize={requestResizeSpy}
      />
    );

    const mockEvent = createMockEvent();
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    expect(requestResizeSpy).to.have.been.calledOnce;
  });

  it.skip('Height is changed', async () => {
    const wrapper = mount(
      <BentoInstagram
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
      />
    );

    const mockEvent = createMockEvent();
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    wrapper.update();

    await waitFor(
      () => wrapper.find('div').at(0).prop('style').height == 1000,
      'Height is not changed'
    );

    expect(wrapper.find('div').at(0).prop('style').height).to.equal(1000);
  });

  it('load event is dispatched', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <BentoInstagram
        ref={ref}
        shortcode="B8QaZW4AQY_"
        style={{'width': 500, 'height': 600}}
        onReadyState={onReadyState}
      />
    );

    let api = ref.current;
    expect(api.readyState).to.equal('loading');
    expect(onReadyState).to.not.be.called;

    await wrapper.find('iframe').invoke('onLoad')();
    api = ref.current;
    expect(api.readyState).to.equal('complete');
    expect(onReadyState).to.be.calledOnce.calledWith('complete');
  });

  it('should reset iframe on pause', () => {
    const ref = createRef();
    const wrapper = mount(
      <WithAmpContext playable={true}>
        <BentoInstagram
          ref={ref}
          shortcode="B8QaZW4AQY_"
          style={{'width': 500, 'height': 600}}
        />
      </WithAmpContext>
    );
    expect(wrapper.find('iframe')).to.have.lengthOf(1);

    const iframe = wrapper.find('iframe').getDOMNode();
    let iframeSrc = iframe.src;
    const iframeSrcSetterSpy = env.sandbox.spy();
    Object.defineProperty(iframe, 'src', {
      get() {
        return iframeSrc;
      },
      set(value) {
        iframeSrc = value;
        iframeSrcSetterSpy(value);
      },
    });

    wrapper.setProps({playable: false});
    expect(iframeSrcSetterSpy).to.be.calledOnce;
  });
});

function createMockEvent() {
  const mockEvent = new CustomEvent('message');
  mockEvent.origin = 'https://www.instagram.com';
  mockEvent.data = JSON.stringify({
    'type': 'MEASURE',
    'details': {
      'height': 1000,
    },
  });
  return mockEvent;
}
