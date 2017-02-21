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

import {
  maybeExpandUrlParamsForTesting,
} from '../../src/anchor-click-interceptor';
import {
  installUrlReplacementsServiceForDoc,
} from '../../src/service/url-replacements-impl';
import {createElementWithAttributes} from '../../src/dom';

describes.realWin('anchor-click-interceptor', {amp: true}, env => {

  let doc;
  let ampdoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    doc = ampdoc.win.document;
    installUrlReplacementsServiceForDoc(ampdoc);
  });

  it('should replace CLICK_X and CLICK_Y in href', () => {
    const a = createElementWithAttributes(doc, 'a', {
      href: 'http://example.com/?x=CLICK_X&y=CLICK_Y',
    });
    const div = createElementWithAttributes(doc, 'div', {});
    a.appendChild(div);
    doc.body.appendChild(a);

    // first click
    maybeExpandUrlParamsForTesting(ampdoc, {
      target: div,
      pageX: 12,
      pageY: 34,
    });
    expect(a.href).to.equal('http://example.com/?x=12&y=34');

    // second click
    maybeExpandUrlParamsForTesting(ampdoc, {
      target: div,
      pageX: 23,
      pageY: 45,
    });
    expect(a.href).to.equal('http://example.com/?x=23&y=45');
  });
});
