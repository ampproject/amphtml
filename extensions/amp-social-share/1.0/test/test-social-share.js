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
import {SocialShare} from '../social-share';
import {dict} from '../../../../src/utils/object';
import {mount} from 'enzyme';

describes.sandboxed('SocialShare 1.0 preact component', {}, () => {
  const originalWarn = console.warn;

  afterEach(() => (console.warn = originalWarn));

  it('warns when the required "type" attribute is not provided', () => {
    const consoleOutput = [];
    const mockedWarn = (output) => consoleOutput.push(output);
    console.warn = mockedWarn;

    const jsx = <SocialShare />;
    const wrapper = mount(jsx);

    expect(wrapper.exists('div')).to.equal(false);
    expect(consoleOutput.length).to.equal(1);
    expect(consoleOutput[0]).to.equal(
      'The type attribute is required. SocialShare'
    );
  });

  it(
    'warns when the required endpoint is not provided when not using' +
      ' a pre-configured type',
    () => {
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      const jsx = <SocialShare {...dict({'type': 'not-configured-type'})} />;
      const wrapper = mount(jsx);

      expect(wrapper.exists('div')).to.equal(false);
      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal(
        'An endpoint is required if not using a pre-configured type. SocialShare'
      );
    }
  );
});
