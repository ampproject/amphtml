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
import '../amp-timeago';

describes.realWin('amp-timeago', {
  amp: {
    extensions: ['amp-timeago'],
  },
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-timeago');
    const date = new Date();
    date.setDate(date.getDate() - 2);
    element.setAttribute('datetime', date.toISOString());
    element.textContent = date.toString();
    element.setAttribute('layout', 'fixed');
    element.setAttribute('width', '160px');
    element.setAttribute('height', '20px');
    win.document.body.appendChild(element);
  });

  it('should display 2 days ago when built', () => {
    element.build();
    const timeElement = element.querySelector('time');
    expect(timeElement.textContent).to.equal('2 days ago');
  });
});
