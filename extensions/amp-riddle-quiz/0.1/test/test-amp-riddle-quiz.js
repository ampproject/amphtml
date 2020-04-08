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
import '../amp-riddle-quiz';

describes.realWin(
  'amp-riddle-quiz',
  {
    amp: {
      extensions: ['amp-riddle-quiz'],
    },
  },
  (env) => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
      element = win.document.createElement('amp-riddle-quiz');
      win.document.body.appendChild(element);
    });

    it('should have iframe when built', () => {
      element.build().then(() => {
        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
      });
    });
  }
);
