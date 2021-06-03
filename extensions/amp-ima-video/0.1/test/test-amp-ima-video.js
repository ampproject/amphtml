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
import {htmlFor} from '../../../../src/core/dom/static-template';
import {installResizeObserverStub} from '../../../../testing/resize-observer-stub';
import {waitForChildPromise} from '../../../../src/dom';

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

    it('passes sourceChildren into iframe context', async () => {
      const element = html`
        <amp-ima-video data-tag="https://example.com" width="1" height="1">
          <source data-foo="bar" src="src" />
          <track any-attribute />
          <span>Other elements should be excluded</span>
        </amp-ima-video>
      `;

      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      let iframe;
      element.layoutCallback();
      await waitForChildPromise(
        element,
        () => (iframe = element.querySelector('iframe'))
      );

      const parsedName = JSON.parse(iframe.name);
      const sourceChildrenSerialized = parsedName?.attributes?.sourceChildren;
      expect(sourceChildrenSerialized).to.not.be.null;
      const sourceChildren = JSON.parse(sourceChildrenSerialized);
      expect(sourceChildren).to.have.length(2);
      expect(sourceChildren[0][0]).to.eql('SOURCE');
      expect(sourceChildren[0][1]).to.eql({'data-foo': 'bar', src: 'src'});
      expect(sourceChildren[1][0]).to.eql('TRACK');
      expect(sourceChildren[1][1]).to.eql({'any-attribute': ''});
    });

    it('creates placeholder image from data-poster attribute', async () => {
      const element = html`
        <amp-ima-video
          data-tag="https://example.com"
          data-poster="https://example.com/foo.png"
          width="1"
          height="1"
        ></amp-ima-video>
      `;

      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      const img = element.querySelector('img');
      expect(img).to.not.be.null;
      expect(img).to.have.attribute('placeholder');
      expect(img).to.have.class('i-amphtml-fill-content');
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('src')).to.equal('https://example.com/foo.png');
    });
  }
);
