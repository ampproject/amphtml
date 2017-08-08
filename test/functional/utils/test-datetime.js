/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {
  formatTime,
} from '../../../src/utils/datetime';

describes.sandboxed('formatTime', {}, () => {

  it('should initially return 0:00', () => {
    expect(formatTime(0)).to.equal('0:00');
  });

  it('should format seconds only', () => {
    expect(formatTime(2)).to.equal('0:02');
    expect(formatTime(13)).to.equal('0:13');
  });

  it('should format minutes', () => {
    expect(formatTime(60)).to.equal('1:00');
    expect(formatTime(65)).to.equal('1:05');
    expect(formatTime(605)).to.equal('10:05');
  });

  it('should format hours', () => {
    expect(formatTime(3600)).to.equal('1:00:00');
    expect(formatTime(3605)).to.equal('1:00:05');
    expect(formatTime(4205)).to.equal('1:10:05');
  });


});
