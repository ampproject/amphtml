/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-autocomplete';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-autocomplete', {
  amp: {
    extensions: ['amp-autocomplete'],
  },
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-autocomplete');
    win.document.body.appendChild(element);
    toggleExperiment(win, 'amp-autocomplete', true);
  });

  it('should have hello world when built with experiment on', () => {
    element.build();
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should not have hello world when built with experiment off', () => {
    toggleExperiment(win, 'amp-autocomplete', false);
    allowConsoleError(() => {
      element.build();
      expect(element.querySelector('div')).to.be.null;
    });
  });
});
