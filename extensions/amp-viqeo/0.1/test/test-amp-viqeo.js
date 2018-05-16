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

import '../amp-viqeo';

describes.realWin('amp-viqeo', {
  amp: {
    extensions: ['amp-viqeo'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getViqeo(viqeoProfileId, viqeoId, opt_params) {
    const viqeo = doc.createElement('amp-viqeo');
    viqeo.setAttribute('data-profileid', viqeoProfileId);
    viqeo.setAttribute('data-videoid', viqeoId);
    viqeo.setAttribute('width', 640);
    viqeo.setAttribute('height', 360);
    if (opt_params && opt_params.responsive) {
      viqeo.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(viqeo);
    return viqeo.build().then(() => {
      return viqeo.layoutCallback();
    }).then(() => viqeo);
  }

  it('has all mandatory attributes', () => {
    return getViqeo(184, 'b51b70cdbb06248f4438').should.eventually.fulfilled;
  });

  it('requires data-videoid', () => {
    return getViqeo(184, '').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });

  it('requires data-profileid', () => {
    return getViqeo('', 'b51b70cdbb06248f4438')
        .should.eventually.be.rejectedWith(
            /The data-profileid attribute is required for/);
  });

});
