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

import {AmpEvents} from '../../src/amp-events.js';
import {createFixtureIframe} from '../../testing/iframe.js';

describe('CSS', () => {
  it('should include height of [overflow] child in size before build', async () => {
    const fixture = await createFixtureIframe(
      'test/fixtures/overflow.html',
      500
    );
    // Wait until layout.js CSS is applied.
    await fixture.awaitEvent(AmpEvents.ATTACHED, 1);
    const {doc} = fixture;

    const iframe = doc.querySelector('amp-iframe');
    const iframeRect = iframe.getBoundingClientRect();

    const overflow = doc.querySelector('[overflow]');
    const overflowRect = overflow.getBoundingClientRect();

    expect(overflowRect.height).to.be.greaterThan(0);
    // The amp-iframe has a 1:1 aspect ratio, and its height should be
    // incremented by the overflow's height.
    expect(
      Math.abs(iframeRect.width + overflowRect.height) - iframeRect.height
    ).to.lessThan(2);
  });
});
