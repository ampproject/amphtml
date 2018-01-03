/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {InaboxHost} from '../../../ads/inabox/inabox-host';
import {InaboxMessagingHost} from '../../../ads/inabox/inabox-messaging-host';

describes.fakeWin('inabox-host', {}, env => {

  let processMessageSpy;
  beforeEach(() => {
    processMessageSpy = env.sandbox.spy(
        InaboxMessagingHost.prototype, 'processMessage');
  });

  it('should process queue', () => {
    const messages = [{}, {}, {}];
    env.win['ampInaboxPendingMessages'] = messages;
    new InaboxHost(env.win);
    expect(processMessageSpy.callCount).to.equal(3);
    messages.forEach(e => expect(processMessageSpy.withArgs(e)).to.be.called);
    // Calling push should have no effect
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
    env.win['ampInaboxPendingMessages'].push({});
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
  });

  it('should handle no queue', () => {
    new InaboxHost(env.win);
    expect(processMessageSpy).to.not.be.called;
  });

  it('should handle non-array queue', () => {
    env.win['ampInaboxPendingMessages'] = 1234;
    new InaboxHost(env.win);
    expect(processMessageSpy).to.not.be.called;
  });

  it('should handle duplicate executions', () => {
    // Does not throw.
    new InaboxHost(env.win);
    new InaboxHost(env.win);
    // Calling push should have no effect
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
    env.win['ampInaboxPendingMessages'].push({});
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
  });

});
