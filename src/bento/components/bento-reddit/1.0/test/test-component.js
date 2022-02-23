import {mount} from 'enzyme';

import {BentoReddit} from '#bento/components/bento-reddit/1.0/component';

import {serializeMessage} from '#core/3p-frame-messaging';

import * as Preact from '#preact';

import {waitFor} from '#testing/helpers/service';

describes.sandboxed('Reddit preact component v1.0', {}, (env) => {
  const redditHref =
    'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed';
  it('should render', () => {
    const wrapper = mount(
      <BentoReddit
        style={{width: 300, height: 200}}
        embedAs="comment"
        src={redditHref}
      />
    );
    expect(wrapper).to.have.lengthOf(1);
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
      <BentoReddit
        style={{width: 300, height: 200}}
        embedAs="comment"
        src={redditHref}
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
      <BentoReddit
        style={{width: 300, height: 200}}
        embedAs="comment"
        src={redditHref}
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
});
