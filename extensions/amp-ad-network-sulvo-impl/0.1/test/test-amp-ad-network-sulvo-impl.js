/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

import {AmpAdNetworkSulvoImpl} from '../../../amp-ad-network-sulvo-impl/0.1/amp-ad-network-sulvo-impl';
import {sulvoIsA4AEnabled} from '../../../amp-ad-network-sulvo-impl/0.1/sulvo-a4a-config';

describes.realWin('sulvo-a4a-config', {amp: false}, (env) => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should pass a4a config', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-ad': 'sulvo_test_unit',
    });
    expect(sulvoIsA4AEnabled(win, element)).to.be.true;
  });

  it('should fail a4a config predicate due to not having the data-ad attribute', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {});
    expect(sulvoIsA4AEnabled(win, element)).to.be.false;
  });
});

describes.realWin(
  'amp-ad-network-sulvo-impl',
  {
    amp: {
      extensions: ['amp-ad-network-sulvo-impl'],
    },
  },
  (env) => {
    let win, doc, impl, element;

    describe('#getAdUrl', () => {
      beforeEach(() => {
        win = env.win;
        doc = win.document;
        element = doc.createElement('amp-ad');
        element.setAttribute('type', 'sulvo');
        element.setAttribute('data-ad', 'sulvo_test_320x50');
        element.setAttribute('width', '320');
        element.setAttribute('height', '50');
        doc.body.appendChild(element);

        env.sandbox
          .mock(Services.xhrFor(win))
          .expects('fetchJson')
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({'data-slot': 'abc/123/'});
              },
            })
          );

        impl = new AmpAdNetworkSulvoImpl(element);
      });

      it('returns the right URL', () => {
        const viewer = Services.viewerForDoc(element);
        env.sandbox
          .stub(viewer, 'getReferrerUrl')
          .returns(Promise.resolve('http://fake.example/?foo=bar'));

        return impl.getAdUrl().then((url) => {
          [
            /^https:\/\/securepubads\.g\.doubleclick\.net\/gampad\/ads/,
            /(\?|&)adk=\d+(&|$)/,
            /(\?|&)gdfp_req=1(&|$)/,
            /(\?|&)impl=ifr(&|$)/,
            /(\?|&)sfv=\d+-\d+-\d+(&|$)/,
            /(\?|&)sz=320x50(&|$)/,
            /(\?|&)u_sd=[0-9]+(&|$)/,
            /(\?|&)is_amp=3(&|$)/,
            /(\?|&)amp_v=%24internalRuntimeVersion%24(&|$)/,
            /(\?|&)d_imp=1(&|$)/,
            /(\?|&)dt=[0-9]+(&|$)/,
            /(\?|&)ifi=[0-9]+(&|$)/,
            /(\?|&)adf=[0-9]+(&|$)/,
            /(\?|&)c=[0-9]+(&|$)/,
            /(\?|&)output=html(&|$)/,
            /(\?|&)nhd=\d+(&|$)/,
            /(\?|&)biw=[0-9]+(&|$)/,
            /(\?|&)bih=[0-9]+(&|$)/,
            /(\?|&)adx=-?[0-9]+(&|$)/,
            /(\?|&)ady=-?[0-9]+(&|$)/,
            /(\?|&)u_aw=[0-9]+(&|$)/,
            /(\?|&)u_ah=[0-9]+(&|$)/,
            /(\?|&)u_cd=(24|30)(&|$)/,
            /(\?|&)u_w=[0-9]+(&|$)/,
            /(\?|&)u_h=[0-9]+(&|$)/,
            /(\?|&)u_tz=-?[0-9]+(&|$)/,
            /(\?|&)u_his=[0-9]+(&|$)/,
            /(\?|&)oid=2(&|$)/,
            /(\?|&)isw=[0-9]+(&|$)/,
            /(\?|&)ish=[0-9]+(&|$)/,
            /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%-]+(&|$)/,
            /(\?|&)top=localhost(&|$)/,
            /(\?|&)ref=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar/,
            /(\?|&)dtd=[0-9]+(&|$)/,
            /(\?|&)vis=[0-5]+(&|$)/,
            /(\?|&)bdt=[1-9][0-9]*(&|$)/,
          ].forEach((regexp) => expect(url).to.match(regexp));
        });
      });
    });
  }
);
