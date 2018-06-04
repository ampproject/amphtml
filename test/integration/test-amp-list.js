/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import {AmpEvents} from '../../src/amp-events';
import {
  createFixtureIframe,
  poll,
} from '../../testing/iframe.js';

describe.configure().retryOnSaucelabs().run('amp-list', () => {
  let fixture;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    return createFixtureIframe('test/fixtures/amp-list.html', 500).then(f => {
      fixture = f;

      // Wait for one <amp-list> element to load.
      return fixture.awaitEvent(AmpEvents.LOAD_END, 1);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render items', function*() {
    const list = fixture.doc.getElementById('list');

    let children;
    yield poll('#list render', () => {
      children = list.querySelectorAll('div.i-amphtml-replaced-content div');
      return children.length > 0;
    });

    expect(children.length).to.equal(3);
    expect(children[0].textContent.trim()).to.equal('apple : 47 @ $0.33');
    expect(children[1].textContent.trim()).to.equal('pear : 538 @ $0.54');
    expect(children[2].textContent.trim()).to.equal('tomato : 0 @ $0.23');
  });
});
