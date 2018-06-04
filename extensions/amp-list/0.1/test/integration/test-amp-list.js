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

import {poll} from '../../../../../testing/iframe';

const body =
    '<amp-list id="list" width=300 height=100 ' +
        'src="http://localhost:9876/list/fruit-data/get?cors=0">' +
      '<template type="amp-mustache">' +
        '{{name}} : {{quantity}} @ ${{unitPrice}}' +
      '</template>' +
    '</amp-list>';

describes.integration('amp-list (integration)', {
  body, extensions: ['amp-list', 'amp-mustache'],
}, env => {
  it('should render items', function*() {
    const list = env.win.document.getElementById('list');

    let children;
    yield poll('#list render', () => {
      children = list.querySelectorAll('div.i-amphtml-replaced-content div');
      return children.length > 0;
    });

    expect(children.length).to.equal(3);
    expect(children[0].textContent.trim()).to.equal('apple : 47 @ $0.33');
    expect(children[1].textContent.trim()).to.equal('pear : 538 @ $0.54');
    expect(children[2].textContent.trim()).to.equal('tomato : 0 @ $0.23');
  });
});
