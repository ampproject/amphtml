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
import {macroTask} from '../../../../testing/yield';
import {mount} from 'enzyme';

describes.sandboxed('Render 1.0 preact component', {}, () => {
  it('should render', async () => {
    const wrapper = mount(
      <Render
        src={'http://example.com'}
        getJson={() => Promise.resolve({name: 'George'})}
        render={(data) => `Hi ${data.name}`}
      ></Render>
    );

    // Since getJson method retuns a promise, we need to wait for
    // the promise to resolve.
    await macroTask();

    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
    expect(wrapper.getDOMNode().innerHTML).to.equal('Hi George');
  });
});
