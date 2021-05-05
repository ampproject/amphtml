/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-ima-video';
import {htmlFor} from '../../../../src/static-template';
import {installResizeObserverStub} from '../../../../testing/resize-observer-stub';

describes.realWin(
  'amp-ima-video',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-ima-video'],
    },
  },
  (env) => {
    let html;

    beforeEach(() => {
      html = htmlFor(env.win.document);
      installResizeObserverStub(env.sandbox, env.win);
    });

    it('passes children into data-children attribute', async () => {
      const element = html`
        <amp-ima-video data-tag="https://example.com" width="1" height="1">
          <source data-foo="bar" src="src" />
          <track any-attribute />
        </amp-ima-video>
      `;
      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      const {children} = element.dataset;
      expect(children).to.not.be.null;

      const parsed = JSON.parse(children);
      expect(parsed).to.have.length(2);
      expect(parsed[0][0]).to.eql('SOURCE');
      expect(parsed[0][1]).to.eql({'data-foo': 'bar', src: 'src'});
      expect(parsed[1][0]).to.eql('TRACK');
      expect(parsed[1][1]).to.eql({'any-attribute': ''});
    });
  }
);
