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


import {getFullVersion_} from '../../src/mode';
import * as sinon from 'sinon';

describe('mode module', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should default to version', () => {
    // $internalRuntimeVersion$ doesn't get replaced during test
    expect(getFullVersion_(window, true)).to.equal('$internalRuntimeVersion$');
    expect(getFullVersion_(window, false)).to.equal('$internalRuntimeVersion$');
  });

  it('should use window.AMP_CONFIG.v if not in dev mode', () => {
    const win = {
      AMP_CONFIG: {
        v: '12345',
      },
    };
    expect(getFullVersion_(win, true)).to.equal('$internalRuntimeVersion$');
    expect(getFullVersion_(win, false)).to.equal('12345');
    delete win.AMP_CONFIG;
    expect(getFullVersion_(win, false)).to.equal('$internalRuntimeVersion$');
  });
});
