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
import '../utils';
import {Services} from '../../../../src/services';

describes.realWin(
    'amp-apester-media-utils',
    {},
    env => {
      let win;
      let xhrMock;

      beforeEach(() => {
        win = env.win;
      });

      afterEach(() => {
        if (xhrMock) {
          xhrMock.verify();
        }
      });

    
      //todo responsive layout isn't fully supported yet, just a stub
      it('Extract tags properly', () => {
        return getApester(
            {
              'data-apester-media-id': '5aaa70c79aaf0c5443078d31',
              width: '500',
            },
            true
        ).then(ape => {
          const iframe = ape.querySelector('iframe');
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        });
      });

);
