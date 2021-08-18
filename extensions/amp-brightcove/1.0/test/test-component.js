/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '#preact';
import {Brightcove} from '../component';
import {mount} from 'enzyme';
import {parseUrlDeprecated} from '../../../../src/url';

describes.sandboxed('Brightcove preact component v1.0', {}, () => {
  it('renders', async () => {
    const wrapper = mount(
      <Brightcove account="1290862519001" videoId="ref:amp-test-video" />
    );
    const iframe = wrapper.find('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.prop('src')).to.equal(
      'https://players.brightcove.net/1290862519001/default_default' +
        '/index.html?amp=1' +
        '&videoId=ref:amp-test-video&playsinline=true'
    );
  });

  it('should pass data-param-* attributes to the iframe src', async () => {
    const wrapper = mount(
      <Brightcove
        account="1290862519001"
        videoId="ref:amp-test-video"
        urlParams={{myParam: 'hello world'}}
      />
    );
    const iframe = wrapper.find('iframe');
    const params = parseUrlDeprecated(iframe.prop('src')).search.split('&');
    expect(params).to.contain('myParam=hello%20world');
  });

  it('should exclude data-param-autoplay attribute', async () => {
    const wrapper = mount(
      <Brightcove
        account="1290862519001"
        videoId="ref:amp-test-video"
        urlParams={{autoplay: 'muted'}}
      />
    );
    const iframe = wrapper.find('iframe');
    const params = parseUrlDeprecated(iframe.prop('src')).search.split('&');
    expect(params).to.not.contain('autoplay');
  });

  it('should give precedence to playlist id', async () => {
    const wrapper = mount(
      <Brightcove
        account="1290862519001"
        videoId="ref:amp-test-video"
        playlistId="ref:test-playlist"
      />
    );
    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.contain('playlistId=ref:test-playlist');
    expect(iframe.prop('src')).not.to.contain('videoId');
  });

  it('should allow both playlist and video id to be unset', async () => {
    const wrapper = mount(<Brightcove account="1290862519001" />);
    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).not.to.contain('&playlistId');
    expect(iframe.prop('src')).not.to.contain('&videoId');
  });

  it('should pass referrer', async () => {
    const wrapper = mount(<Brightcove account="1290862519001" referrer="1" />);
    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.contain('referrer=1');
  });

  it('should force playsinline', async () => {
    const wrapper = mount(
      <Brightcove account="1290862519001" urlParams={{playsinline: false}} />
    );
    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.contain('playsinline=true');
  });
});
