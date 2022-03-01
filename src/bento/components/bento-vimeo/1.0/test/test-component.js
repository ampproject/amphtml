import {mount} from 'enzyme';

import {BentoVimeo} from '#bento/components/bento-vimeo/1.0/component';

import * as Preact from '#preact';

describes.sandboxed('Vimeo preact component v1.0', {}, () => {
  const videoId = '27246366';

  it('should render', () => {
    const wrapper = mount(
      <BentoVimeo
        videoid={videoId}
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      `https://player.vimeo.com/video/${videoId}`
    );
  });

  it('should pass the loading attribute to the underlying iframe', () => {
    const wrapper = mount(
      <BentoVimeo
        videoid={videoId}
        loading="lazy"
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.getDOMNode().getAttribute('loading')).to.equal('lazy');
  });

  it('should set data-loading="auto" if no value is specified', () => {
    const wrapper = mount(
      <BentoVimeo
        videoid={videoId}
        style={{
          'width': '500px',
          'height': '600px',
        }}
      />
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.getDOMNode().getAttribute('loading')).to.equal('auto');
  });
});
