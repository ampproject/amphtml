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
import {Dailymotion} from '../component';
import {mount} from 'enzyme';
import {waitFor} from '#testing/test-helper';
import {dereferenceArgsVariables} from '#service/action-impl';
import {expect} from 'chai';

describes.sandboxed('Dailymotion preact component v1.0', {}, (env) => {
  it('Renders', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.dailymotion.com/embed/video/x3rdtfy?api=1&html=1&app=amp'
    );

    // Style propagated to container, but not iframe.
    expect(wrapper.prop('style').width).to.equal(300);
    expect(wrapper.prop('style').height).to.equal(200);
  });

  it('Pass correct param attributes to the iframe src', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        mute="false"
        endscreenEnable="false"
        sharingEnable="false"
        uiHighlight="444444"
        info="false"
        params={{}}
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    // Mute Attr
    expect(iframe.prop('src')).to.contain('mute=false');
    // Enscreen Enable attr
    expect(iframe.prop('src')).to.contain('endscreen-enable=false');
    // Sharing Enable attr
    expect(iframe.prop('src')).to.contain('sharing-enable=false');
    // UI Highlight attr
    expect(iframe.prop('src')).to.contain('ui-highlight=444444');
    // info attr
    expect(iframe.prop('src')).to.contain('info=false');
  });
});
