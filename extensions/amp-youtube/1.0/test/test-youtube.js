/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {Youtube} from '../youtube';
import {mount} from 'enzyme';

describes.sandboxed('YouTube preact component v1.0', {}, () => {
  it('Normal render', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        style={{
          'width': 600,
          'height': 500,
        }}
      />,
      {attachTo: el}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.youtube.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1'
    );
    expect(wrapper.find('iframe').prop('style').width).to.equal('100%');
    expect(wrapper.find('iframe').prop('style').height).to.equal('100%');
    expect(wrapper.find('div')).to.have.lengthOf(2);
  });

  it('Pass correct param attributes to the iframe src', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        params={{'myparam': 'hello world', 'loop': '1'}}
      />,
      {attachTo: el}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.contain('&myparam=hello%20world');
    expect(iframe.prop('src')).to.not.contain('autoplay=1');
    // data-param-loop is black listed in favor of just loop for single videos
    expect(iframe.prop('src')).to.not.contain('loop=1');
    // playsinline should default to 1 if not provided.
    expect(iframe.prop('src')).to.contain('playsinline=1');
    expect(iframe.prop('src')).to.contain('iv_load_policy=3');
  });

  it('Keep param: loop in iframe src for playlists', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        params={{'playlist': 'IAvf-rkzNck', 'loop': '1'}}
      />,
      {attachTo: el}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.contain('loop=1');
  });

  it('Uses privacy-enhanced mode', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(
      <Youtube
        videoid="IAvf-rkzNck"
        autoplay
        loop
        style={{
          'width': 600,
          'height': 500,
        }}
        credentials="omit"
      />,
      {attachTo: el}
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.youtube-nocookie.com/embed/IAvf-rkzNck?enablejsapi=1&amp=1&playsinline=1&iv_load_policy=3'
    );
  });
});
