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
import {
  unruly,
} from '../../../ads/unruly';

describe('unruly', () => {

  it('should set unruly publisher config on global', () => {
    const mockGlobal = {};
    const mockData = {
      siteid: 'amp-test',
    };
    const expectedGlobal = {
      unruly: {
        native: {
          siteId: 'amp-test',
        },
      },
    };
    const mockScriptLoader = () => {};
    unruly(mockGlobal, mockData, mockScriptLoader);
    expect(expectedGlobal).to.deep.equal(mockGlobal);
  });

  it('should call loadScript', () => {
    const mockGlobal = {};
    const scriptLoader = sinon.spy();
    expect(scriptLoader).to.not.have.been.called;
    unruly(mockGlobal, {}, scriptLoader);
    expect(scriptLoader).to.have.been.calledWithExactly(
        mockGlobal, 'https://video.unrulymedia.com/amp-demo/native-loader.js'
    );
  });


});
