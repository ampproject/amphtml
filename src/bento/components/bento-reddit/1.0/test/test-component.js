import {expect} from 'chai';
import {mount} from 'enzyme';

import {BentoReddit} from '#bento/components/bento-reddit/1.0/component';

import * as Preact from '#preact';

describes.sandboxed('Reddit preact component v1.0', {}, () => {
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
  });
});
