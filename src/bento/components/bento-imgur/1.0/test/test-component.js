import {mount} from 'enzyme';

import {BentoImgur} from '#bento/components/bento-imgur/1.0/component';

import * as Preact from '#preact';
import {logger} from '#preact/logger';

describes.sandboxed('BentoImgur preact component v1.0', {}, (env) => {
  it('should render a single post', () => {
    const wrapper = mount(<BentoImgur imgurId="TEST" />);

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.include(`https://imgur.com/TEST/embed`);
  });
  it('should render an album/gallery', () => {
    const wrapper = mount(<BentoImgur imgurId="a/TEST" />);

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.include(`https://imgur.com/a/TEST/embed`);
  });
  it('should escape ids if needed', () => {
    const wrapper = mount(<BentoImgur imgurId="a/TEST$%&TEST" />);

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.include(
      `https://imgur.com/a/TEST%24%25%26TEST/embed`
    );
  });
  it('should resize', () => {
    const wrapper = mount(<BentoImgur imgurId="TEST" />);

    const iframe = wrapper.find('iframe').getDOMNode();

    dispatchIframeMessage({
      iframe,
      data: {
        message: 'resize_imgur',
        height: 999,
      },
    });
    wrapper.update();

    expect(findContainer(wrapper).prop('style').height).to.equal(999);
  });

  it('should error out if no message was received', () => {
    const clock = env.sandbox.useFakeTimers();
    const wrapper = mount(<BentoImgur imgurId="TEST" />);

    const iframe = wrapper.find('iframe').getDOMNode();
    dispatchIframeLoad({iframe});
    wrapper.update();

    allowConsoleError(() => {
      clock.tick(500 + 99);
      wrapper.update();
    });

    expect(logger.error).calledWith(
      'bento-imgur',
      'Failed to load.  Is "TEST" a correct id?'
    );
  });
});

function findContainer(wrapper) {
  return wrapper.find('div').first();
}

function dispatchIframeMessage({data, iframe}) {
  const mockEvent = new CustomEvent('message');

  mockEvent.source = iframe.contentWindow;
  mockEvent.origin = new URL(iframe.src).origin;
  mockEvent.data = JSON.stringify(data);

  window.dispatchEvent(mockEvent);
}

function dispatchIframeLoad({iframe}) {
  const mockEvent = new CustomEvent('load');
  iframe.dispatchEvent(mockEvent);
}
