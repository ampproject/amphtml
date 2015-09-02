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

import * as st from '../../src/style';

describe('Style', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  it('setStyle', () => {
    let element = document.createElement('div');
    st.setStyle(element, 'width', '1px');
    expect(element.style.width).to.equal('1px');
  });

  it('setStyles', () => {
    let element = document.createElement('div');
    st.setStyles(element, {
      width: st.px(101),
      height: st.px(102)
    });
    expect(element.style.width).to.equal('101px');
    expect(element.style.height).to.equal('102px');
  });

  it('px', () => {
    expect(st.px(0)).to.equal('0px');
    expect(st.px(101)).to.equal('101px');
  });

  it('translateX', () => {
    expect(st.translateX(101)).to.equal('translateX(101px)');
    expect(st.translateX('101vw')).to.equal('translateX(101vw)');
  });
});
