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

import {createElementWithAttributes} from '#core/dom';
import {Layout} from '#core/dom/layout';
import {AmpLayout, buildDom} from '#builtins/amp-layout/amp-layout';

describes.realWin('amp-layout', {amp: true}, (env) => {
  async function getAmpLayout(attrs, innerHTML) {
    const {win} = env;
    const ampLayout = createElementWithAttributes(
      win.document,
      'amp-layout',
      attrs
    );
    ampLayout.innerHTML = innerHTML;
    win.document.body.appendChild(ampLayout);

    await ampLayout.buildInternal();
    await ampLayout.layoutCallback();

    return ampLayout;
  }

  it('should reparent all children under a container for when layout!=container', async () => {
    const children = '<span>hello</span><span>world</span>';
    const ampLayout = await getAmpLayout(
      {layout: Layout.FIXED, height: 100, width: 100},
      children
    );

    expect(ampLayout.childNodes).have.length(1);
    expect(ampLayout.childNodes[0].getAttribute('class')).includes(
      'i-amphtml-fill-content'
    );
    expect(ampLayout.childNodes[0].innerHTML).equal(children);
  });

  it('should noop when layout=container', async () => {
    const children = '<span>hello</span><span>world</span>';
    const ampLayout = await getAmpLayout({}, children);

    expect(ampLayout.childNodes).have.length(2);
    expect(ampLayout.innerHTML).equal(children);
  });

  it('buildDom and buildCallback should result in the same outerHTML', () => {
    const layout1 = createElementWithAttributes(
      env.win.document,
      'amp-layout',
      {
        width: 100,
        height: 100,
      }
    );
    const layout2 = layout1.cloneNode(/* deep */ true);

    new AmpLayout(layout1).buildCallback();
    buildDom(layout2);

    expect(layout1.outerHTML).to.equal(layout2.outerHTML);
  });
});
