import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoGist} from '../component';

describes.sandboxed('BentoGist preact component v1.0', {}, () => {
  it('should render', () => {
    const wrapper = mount(
      <BentoGist
        gistId="b9bb35bc68df68259af94430f012425f"
        style={{
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

  it('should render with specific file', () => {
    const wrapper = mount(
      <BentoGist
        gistId="a19e811dcd7df10c4da0931641538497"
        file="index.js"
        style={{
          'height': '65px',
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
});
