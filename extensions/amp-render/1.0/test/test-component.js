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

import * as Preact from '../../../../src/preact';
import {Render} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('Render 1.0 preact component', {}, (env) => {
  let sandbox;
  const response = {
    name: 'Google',
    url: 'http://google.com',
  };

  beforeEach(() => {
    sandbox = env.sandbox;
  });

  it('should render as a div by default', () => {
    const wrapper = mount(
      <Render
        src={'http://example.com'}
        getJson={() => Promise.resolve({name: 'George'})}
        render={(data) => `Hi ${data.name}`}
      ></Render>
    );

    // Generic test for the Wrapper
    // This is actually fairly arbitrary that it should be a "div". But it's
    // checked here to ensure that we can change it controllably when needed.
    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
    // expect(wrapper.html()).to.contain('Hi George');
  });
});
