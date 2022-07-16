import {mount} from 'enzyme';

import {BentoTwitter} from '#bento/components/bento-twitter/1.0/component';

import {serializeMessage} from '#core/3p-frame-messaging';

import {createRef} from '#preact';
import * as Preact from '#preact';
import {WithAmpContext} from '#preact/context';

import {waitFor} from '#testing/helpers/service';

describes.sandboxed('Twitter preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(
      <BentoTwitter
        tweetid="1356304203044499462"
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
      <BentoTwitter
        tweetid="1356304203044499462"
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
      <BentoTwitter
        tweetid="1356304203044499462"
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
      <BentoTwitter
        ref={ref}
        tweetid="1356304203044499462"
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
        <BentoTwitter
          ref={ref}
          tweetid="1356304203044499462"
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

  it('should call onLoad when loaded', () => {
    const onLoadSpy = env.sandbox.spy();
    const onErrorSpy = env.sandbox.spy();

    const wrapper = mount(
      <BentoTwitter
        tweetid="1356304203044499462"
        height="500"
        width="500"
        onLoad={onLoadSpy}
        onError={onErrorSpy}
      ></BentoTwitter>
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    const {sentinel} = JSON.parse(iframe.getAttribute('name')).attributes;
    const mockEvent = new CustomEvent('message');
    mockEvent.data = serializeMessage('embed-size', sentinel, {height: '1000'});
    mockEvent.source = iframe.contentWindow;
    window.dispatchEvent(mockEvent);

    expect(onLoadSpy).to.have.been.calledOnce;
    expect(onErrorSpy).not.to.have.been.called;
  });

  it('should call onError when error', () => {
    const onErrorSpy = env.sandbox.spy();
    const onLoadSpy = env.sandbox.spy();

    const wrapper = mount(
      <BentoTwitter
        tweetid="00000000111111"
        height="500"
        width="500"
        onError={onErrorSpy}
        onLoad={onLoadSpy}
      ></BentoTwitter>
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    const {sentinel} = JSON.parse(iframe.getAttribute('name')).attributes;
    const mockEvent = new CustomEvent('message');
    mockEvent.data = serializeMessage('no-content', sentinel);
    mockEvent.source = iframe.contentWindow;
    window.dispatchEvent(mockEvent);

    expect(onErrorSpy).to.have.been.calledOnce;
    expect(onLoadSpy).not.to.have.been.called;
  });

  it('should pass the loading attribute to the underlying iframe', () => {
    const wrapper = mount(
      <BentoTwitter
        tweetid="00000000111111"
        style={{
          'width': '500px',
          'height': '600px',
        }}
        loading="lazy"
      ></BentoTwitter>
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    expect(iframe.getAttribute('loading')).to.equal('lazy');
  });

  it('should set data-loading="auto" if no value is specified', () => {
    const wrapper = mount(
      <BentoTwitter
        tweetid="00000000111111"
        style={{
          'width': '500px',
          'height': '600px',
        }}
      ></BentoTwitter>
    );

    const iframe = wrapper.find('iframe').getDOMNode();
    expect(iframe.getAttribute('loading')).to.equal('auto');
  });
});
