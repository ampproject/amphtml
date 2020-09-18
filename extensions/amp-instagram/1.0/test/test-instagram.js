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
import {Instagram} from '../instagram';
import {mount} from 'enzyme';

describes.sandboxed('Instagram preact component v1.0', {}, () => {
  it('Renders', () => {
    const props = {
      'shortcode': 'B8QaZW4AQY_',
      'style': {'width': 500, 'height': 600},
    };
    const el = document.createElement('div');
    document.body.appendChild(el);
    const wrapper = mount(<Instagram {...props} />, {attachTo: el});
    expect(wrapper.props().shortcode).to.equal('B8QaZW4AQY_');
    expect(wrapper.find('iframe').prop('src')).to.equal(
      'https://www.instagram.com/p/B8QaZW4AQY_/embed/?cr=1&v=12'
    );
  });
});
