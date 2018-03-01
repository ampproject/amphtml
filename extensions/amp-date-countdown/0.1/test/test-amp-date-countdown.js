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

//import {AmpDateCountdown} from '../amp-date-countdown';

describes.realWin('amp-date-countdown', {
  amp: {
    extensions: ['amp-date-countdown'],
  },
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-date-countdown');
    win.document.body.appendChild(element);
  });

  it('should have milliseconds from now to ISO format datetime', () => {
    //const ms = new Date('2020-06-01T00:00:00+08:00') - new Date();
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should have ', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should able to set a countdown date based on timestamp-seconds', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should have different locale unit-text returned', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should have ended upon < = 1000 milliseconds', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });

  it('should ', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });



  it('should have test ', () => {
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });
});
