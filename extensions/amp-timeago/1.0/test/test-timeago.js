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
import {Timeago} from '../timeago';
import {mount} from 'enzyme';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin('Timeago 1.0 preact component', {}, (env) => {
  function getTime(wrapper) {
    const time = wrapper.find('time');
    expect(time).to.have.lengthOf(1);
    return time.text();
  }

  it('should render display 2 days ago when built', async () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const props = {
      datetime: date.toISOString(),
      displayIn: 'UTC',
    };
    const wrapper = mount(<Timeago {...props} />, {
      attachTo: env.win.document.body,
    });
    expect(getTime(wrapper)).to.equal('');
    await waitFor(() => getTime(wrapper) !== '', 'update time');
    expect(getTime(wrapper)).to.equal('2 days ago');
  });

  it('should render display 2 days ago using "timestamp-ms"', async () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const placeholder = date.toString();
    const props = {
      datetime: date.getTime(),
      placeholder,
    };
    const wrapper = mount(<Timeago {...props} />, {
      attachTo: env.win.document.body,
    });
    expect(getTime(wrapper)).to.equal(placeholder);
    await waitFor(() => getTime(wrapper) !== placeholder, 'update time');
    expect(getTime(wrapper)).to.equal('2 days ago');
  });

  it('should display original date when older than cutoff', async () => {
    const date = new Date('2017-01-01');
    const placeholder = 'Sunday 1 January 2017';
    const props = {
      cutoff: 8640000,
      datetime: date.toISOString(),
      placeholder,
    };
    const wrapper = mount(<Timeago {...props} />, {
      attachTo: env.win.document.body,
    });
    expect(getTime(wrapper)).to.equal(placeholder);

    // Placeholder text does not get replaced.
    expectAsyncConsoleError('Timeout waiting for update time', 1);
    await expect(
      waitFor(() => getTime(wrapper) !== placeholder, 'update time')
    ).to.be.rejectedWith('Timeout waiting for update time');
  });

  it('should update after mutation of datetime attribute', async () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const placeholder = date.toString();
    const props = {
      datetime: date.toISOString(),
      placeholder,
    };
    const wrapper = mount(<Timeago {...props} />, {
      attachTo: env.win.document.body,
    });
    expect(getTime(wrapper)).to.equal(placeholder);
    await waitFor(() => getTime(wrapper) !== placeholder, 'update time');
    expect(getTime(wrapper)).to.equal('2 days ago');

    date.setDate(date.getDate() + 1);
    wrapper.setProps({datetime: date.toISOString()});
    expect(getTime(wrapper)).to.equal('2 days ago');
    await waitFor(() => getTime(wrapper) !== '2 days ago', 'update time');
    expect(getTime(wrapper)).to.equal('1 day ago');
  });
});
