/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-denakop';
import {createElementWithAttributes} from '../../../../src/dom';
import {denakopElementIsValid} from '../utils';

describes.realWin(
    'amp-denakop',
    {
      amp: {
        extensions: [
          'amp-ad',
          'amp-sticky-ad',
          'amp-iframe',
          'amp-analytics',
          'amp-denakop',
        ],
      },
    },
    env => {
      let doc;

      beforeEach(() => {
        doc = env.win.document;
      });

      it(
          'There is no `data-tag-id` or `data-publisher-id` attribute in ' +
      '`amp-denakop` element.',
          () => {
            const el = createElementWithAttributes(doc, 'amp-denakop', {
              'data-tag-id': '2819896d-f724',
              'data-publisher-id': '22',
            });

            expect(denakopElementIsValid(el)).to.be.true;
          },
      );
    },
);
