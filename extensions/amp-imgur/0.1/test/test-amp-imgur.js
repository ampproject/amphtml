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
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import {AmpImgur} from '../amp-imgur';

describes.realWin('amp-imgur', {
  amp: {
    extensions: ['amp-imgur'],
  }
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-imgur');
    element.setAttribute('data-imgurid', 'f462IUj');
    element.setAttribute('width', '540');
    element.setAttribute('height', '663');
    element.setAttribute('layout', 'responsive');
    win.document.body.appendChild(element);
  });
  
  it('render responsively', () => {
    element.build();
    expect(element.querySelector('iframe')).to.equal('f462IUj');
  });
});
