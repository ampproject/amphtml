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

import '../amp-ooyala-player';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-ooyala-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {buildLayoutElement} = getVideoIframeTestHelpers(env, TAG, {});

  it('renders a V3 player', async () => {
    const element = await buildLayoutElement({
      'data-embedcode': 'Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
      'data-playerid': '6440813504804d76ba35c8c787a4b33c',
      'data-pcode': '5zb2wxOlZcNCe_HVT3a6cawW298X',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://player.ooyala.com/iframe.html' +
        '?platform=html5-priority&ec=Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ' +
        '&pbid=6440813504804d76ba35c8c787a4b33c'
    );
  });

  it('renders a V4 player', async () => {
    const element = await buildLayoutElement({
      'data-embedcode': 'Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
      'data-playerid': '6440813504804d76ba35c8c787a4b33c',
      'data-pcode': '5zb2wxOlZcNCe_HVT3a6cawW298X',
      'data-playerversion': 'V4',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://player.ooyala.com/static/v4/production/latest/' +
        'skin-plugin/amp_iframe.html' +
        '?pcode=5zb2wxOlZcNCe_HVT3a6cawW298X' +
        '&ec=Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ' +
        '&pbid=6440813504804d76ba35c8c787a4b33c'
    );
  });

  it('fails without data-embedcode', () => {
    return buildLayoutElement({
      'data-playerid': '6440813504804d76ba35c8c787a4b33c',
      'data-pcode': '5zb2wxOlZcNCe_HVT3a6cawW298X',
    }).should.eventually.be.rejectedWith(
      /The data-embedcode attribute is required/
    );
  });

  it('fails without data-playerid', () => {
    return buildLayoutElement({
      'data-embedcode': 'Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
      'data-pcode': '5zb2wxOlZcNCe_HVT3a6cawW298X',
    }).should.eventually.be.rejectedWith(
      /The data-playerid attribute is required/
    );
  });

  it('fails without data-pcode', () => {
    return buildLayoutElement({
      'data-embedcode': 'Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
      'data-playerid': '6440813504804d76ba35c8c787a4b33c',
    }).should.eventually.be.rejectedWith(
      /The data-pcode attribute is required/
    );
  });
});
