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

import {PositionObserverApi} from '../../src/position-observer';
import {BaseElement} from '../../src/base-element';
import {layoutRectLtwh} from '../../src/layout-rect';

describes.realWin('PositionObserverApi', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let baseElement;
  let posObserver;
  beforeEach(() => {
    sandbox = env.sandbox;
    const element = env.win.document.createElement('div');
    env.win.document.body.appendChild(element);
    baseElement = new BaseElement(element);
    sandbox.stub(baseElement, 'getVsync', () => {
      return {
        measure: function(callback) {
          callback();
        },
      };
    });
    sandbox.stub(baseElement, 'getViewport', () => {
      return {
        getRect: () => {
          return layoutRectLtwh(1, 2, 3, 4);
        },
      };
    });
    sandbox.stub(baseElement, 'getLayoutBox', () => {
      return layoutRectLtwh(5, 6, 7, 8);
    });

    const iframe = env.win.document.createElement('iframe');
    iframe.src = 'no-use';
    posObserver = new PositionObserverApi(baseElement, iframe);
  });

  it('should get position with correct value', () => {
    return posObserver.getPosition_().then(position => {
      expect(position).to.deep.equal({
        viewport: layoutRectLtwh(1, 2, 3, 4),
        target: layoutRectLtwh(5, 6, 7, 8),
      });
    });
  });
});
