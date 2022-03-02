import {mount} from 'enzyme';

import {BentoFacebook} from '#bento/components/bento-facebook/1.0/component';

import {serializeMessage} from '#core/3p-frame-messaging';

import {createRef} from '#preact';
import * as Preact from '#preact';
import {WithAmpContext} from '#preact/context';

import {waitFor} from '#testing/helpers/service';

describes.sandboxed('BentoFacebook preact component', {}, (env) => {
  const href =
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/';

  it('should render', () => {
    const wrapper = mount(
      <BentoFacebook
        href={href}
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.equal(
      'http://ads.localhost:9876/dist.3p/current/frame.max.html'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
  });

  it('should call given requestResize', () => {
    const requestResizeSpy = env.sandbox.spy();
    const wrapper = mount(
      <BentoFacebook
        href={href}
        style={{
          'width': '500px',
          'height': '600px',
        }}
        requestResize={requestResizeSpy}
      />
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    const sentinel = JSON.parse(iframe.getAttribute('name'))['attributes'][
      'sentinel'
    ];

    const mockEvent = new CustomEvent('message');
    mockEvent.data = serializeMessage('embed-size', sentinel, {
      'height': 1000,
    });
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    expect(requestResizeSpy).to.have.been.calledOnce;
  });

  it('should change height', async () => {
    const wrapper = mount(
      <BentoFacebook
        href={href}
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    const sentinel = JSON.parse(iframe.getAttribute('name'))['attributes'][
      'sentinel'
    ];

    const mockEvent = new CustomEvent('message');
    mockEvent.data = serializeMessage('embed-size', sentinel, {
      'height': 1000,
    });
    mockEvent.source = wrapper
      .getDOMNode()
      .querySelector('iframe').contentWindow;
    window.dispatchEvent(mockEvent);

    wrapper.update();

    await waitFor(
      () => wrapper.find('div').at(0).prop('style').height == 1000,
      'Height changes'
    );

    expect(wrapper.find('div').at(0).prop('style').height).to.equal(1000);
  });

  it('should dispatch load event', async () => {
    const ref = createRef();
    const onReadyState = env.sandbox.spy();
    const wrapper = mount(
      <BentoFacebook
        ref={ref}
        href={href}
        style={{
          'width': '500px',
          'height': '600px',
        }}
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
        <BentoFacebook
          ref={ref}
          href={href}
          style={{
            'width': '500px',
            'height': '600px',
          }}
        />
      </WithAmpContext>
    );
    expect(wrapper.find('iframe')).to.have.lengthOf(1);

    const iframe = wrapper.find('iframe').getDOMNode();
    const spy = env.sandbox./*OK*/ spy(iframe, 'src', ['set']);
    wrapper.setProps({playable: false});
    expect(spy.set).to.be.calledOnce;
  });

  it('should not sandbox iframe', async () => {
    const ref = createRef();
    const wrapper = mount(
      <BentoFacebook
        ref={ref}
        href={href}
        embedAs="video"
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('sandbox')).to.be.undefined;
  });

  it('should propagate specified locale', async () => {
    const ref = createRef();
    const wrapper = mount(
      <BentoFacebook
        ref={ref}
        href={href}
        locale="fr_FR"
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('name')).to.contain('"locale":"fr_FR"');
  });

  it('should pass the loading attribute to the underlying iframe', () => {
    const wrapper = mount(
      <BentoFacebook
        href={href}
        locale="fr_FR"
        style={{
          'width': '500px',
          'height': '600px',
        }}
        loading="lazy"
      />
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    expect(iframe.getAttribute('loading')).to.equal('lazy');
  });

  it('should set data-loading="auto" if no value is specified', () => {
    const wrapper = mount(
      <BentoFacebook
        href={href}
        locale="fr_FR"
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    expect(iframe.getAttribute('loading')).to.equal('auto');
  });
});
