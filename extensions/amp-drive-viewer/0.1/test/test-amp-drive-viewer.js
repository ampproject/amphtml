/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {TAG} from '../amp-drive-viewer';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-drive-viewer', {
  amp: {
    extensions: ['amp-drive-viewer'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    toggleExperiment(win, TAG, true);
  });

  function getDriveViewer(src, opt_responsive) {
    const element = doc.createElement('amp-drive-viewer');
    element.setAttribute('width', '100');
    element.setAttribute('height', '100');
    if (src) {
      element.setAttribute('src', src);
    }
    if (opt_responsive) {
      element.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(element);

    return element.build()
        .then(() => element.layoutCallback())
        .then(() => element);
  }

  it('renders', () => {
    return getDriveViewer('https://example.com/doc.pdf').then(element => {
      const iframe = element.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal('https://docs.google.com/gview?url=https%3A%2F%2Fexample.com%2Fdoc.pdf&embedded=true');
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getDriveViewer('https://example.com/doc.pdf').then(element => {
      const impl = element.implementation_;
      impl.unlayoutCallback();
      expect(element.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  });
});
