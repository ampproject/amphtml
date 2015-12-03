/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getStyle} from '../../src/style';
import * as sinon from 'sinon';
import * as styles from '../../src/styles';

describe('Styles', () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
    clock.restore();
    clock = null;
  });

  it('makeBodyVisible', () => {
    styles.makeBodyVisible(document);
    clock.tick(1000);
    expect(document.body).to.exist;
    expect(getStyle(document.body, 'opacity')).to.equal('1');
    expect(getStyle(document.body, 'visibility')).to.equal('visible');
    expect(getStyle(document.body, 'animation')).to.equal('none');
  });
});
