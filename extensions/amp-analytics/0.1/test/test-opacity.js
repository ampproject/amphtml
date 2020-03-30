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

import {getMinOpacity} from '../opacity';

describes.realWin('getMinOpacity', {amp: true}, env => {
  let win;
  let ampElement;
  let doc;
  let parent;
  let style;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    style = doc.createElement('style');
    style.setAttribute('amp-custom', '');
    style.innerHTML = `
    #img {
      opacity: 0.5;
    }
    #parent {
      height: 100px;
      width: 100px;
    }`;
    doc.head.appendChild(style);

    ampElement = doc.createElement('amp-img');
    ampElement.id = 'img';
    ampElement.setAttribute('width', '100');
    ampElement.setAttribute('height', '100');

    parent = doc.createElement('div');
    parent.id = 'parent';

    parent.appendChild(ampElement);
    doc.body.appendChild(parent);

    expect(getMinOpacity(ampElement)).to.equal(0.5);
  });

  it('amp element opacity value change', () => {
    ampElement.style.opacity = 1;
    expect(getMinOpacity(ampElement)).to.equal(1);

    ampElement.style.opacity = 0.5;
    expect(getMinOpacity(ampElement)).to.equal(0.5);

    ampElement.style.opacity = 0;
    expect(getMinOpacity(ampElement)).to.equal(0);

    ampElement.style.opacity = 1;
    ampElement.style.visibility = 'hidden';
    expect(getMinOpacity(ampElement)).to.equal(0);
  });

  it("amp element's parent opacity value lower than amp element", () => {
    parent.style.opacity = 0;
    expect(getMinOpacity(ampElement)).to.equal(0);

    parent.style.opacity = 1;
    // since ampElement is 0.5
    expect(getMinOpacity(ampElement)).to.equal(0.5);

    parent.style.visibility = 'hidden';
    expect(getMinOpacity(ampElement)).to.equal(0);
  });
});
