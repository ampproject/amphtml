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
import {FitText} from '../component';
import {computedStyle} from '../../../../src/style';
import {mount} from 'enzyme';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin('FitText preact component v1.0', {}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  async function expectAsyncFontSize(element, value) {
    await waitFor(
      () => computedStyle(win, element).fontSize === value,
      'font size applied'
    );
    expect(computedStyle(win, element).fontSize).to.equal(value);
  }

  it('renders', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <FitText ref={ref} style={{width: '300px', height: '100px'}}>
        Hello World
      </FitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find('[part="content"]').getDOMNode(),
      '60px'
    );
  });

  it('should respect minFontSize', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <FitText ref={ref} style={{width: '1px', height: '1px'}} minFontSize="24">
        Hello World
      </FitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find('[part="content"]').getDOMNode(),
      '24px'
    );
  });

  it('should respect maxFontSize', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <FitText
        ref={ref}
        style={{width: '300px', height: '100px'}}
        maxFontSize="48"
      >
        Hello World
      </FitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find('[part="content"]').getDOMNode(),
      '48px'
    );
  });
});
