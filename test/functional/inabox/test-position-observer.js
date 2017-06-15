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

import {PositionObserver} from '../../../ads/inabox/position-observer';
import {DOMRectLtwh} from '../../../src/DOM-rect';

describes.realWin('inabox-host:position-observer', {}, env => {

  let win;
  let observer;
  let target1;
  let target2;

  beforeEach(() => {
    win = env.win;

    const div = win.document.createElement('div');
    div.style.width = '200vw';
    div.style.height = '200vh';
    win.document.body.appendChild(div);

    win.innerWidth = 200;
    win.innerHeight = 300;

    observer = new PositionObserver(win);

    target1 = {
      getBoundingClientRect: () => DOMRectLtwh(1, 2, 30, 40),
    };

    target2 = {
      getBoundingClientRect: () => DOMRectLtwh(3, 4, 30, 40),
    };
  });

  it('observe should work', () => {
    let position1 = {
      viewport: DOMRectLtwh(0, 0, 200, 300),
      target: DOMRectLtwh(1, 2, 30, 40),
    };
    let position2 = {
      viewport: DOMRectLtwh(0, 0, 200, 300),
      target: DOMRectLtwh(3, 4, 30, 40),
    };
    const callbackSpy11 = sandbox.stub();
    const callbackSpy12 = sandbox.stub();
    const callbackSpy21 = sandbox.stub();
    observer.observe(target1, callbackSpy11);
    expect(callbackSpy11).to.be.calledWith(position1);
    observer.observe(target1, callbackSpy12);
    expect(callbackSpy12).to.be.calledWith(position1);
    observer.observe(target2, callbackSpy21);
    expect(callbackSpy21).to.be.calledWith(position2);

    win.scrollTo(10, 20);
    return new Promise(resolve => {
      setTimeout(() => {
        position1 = {
          viewport: DOMRectLtwh(10, 20, 200, 300),
          target: DOMRectLtwh(11, 22, 30, 40),
        };
        position2 = {
          viewport: DOMRectLtwh(10, 20, 200, 300),
          target: DOMRectLtwh(13, 24, 30, 40),
        };
        resolve();
      }, 100);
    }).then(() => {
      expect(callbackSpy11).to.be.calledWith(position1);
      expect(callbackSpy12).to.be.calledWith(position1);
      expect(callbackSpy21).to.be.calledWith(position2);
    });
  });
});
