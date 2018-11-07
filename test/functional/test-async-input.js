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

import {AsyncInput} from '../../src/async-input';
import {createAmpElementForTesting} from '../../src/custom-element';

describes.realWin('BaseElement', {amp: true}, env => {
  let win, doc;
  let customElement;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    win.customElements.define('amp-test-input-element',
        createAmpElementForTesting(win, 'amp-test-input-element', AsyncInput));
    customElement = doc.createElement('amp-test-input-element');
    element = new AsyncInput(customElement);
  });

  it('should be created', () => {
    expect(customElement).to.be.ok;
    expect(element).to.be.ok;
  });

  it('should throw an error in getValue() to force overrides', () => {
    return allowConsoleError(() => {
      expect(element.getValue).to.throw();
    });
  });

  it('should have the i-amphtml-async-input class', () => {
    const hasAsyncInputClass =
      customElement.classList.contains('i-amphtml-async-input');
    expect(hasAsyncInputClass).to.be.ok;
  });
});
