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


describes.realWin('amp-ooyala-player', {
  amp: {
    extensions: ['amp-ooyala-player'],
  },
}, function(env) {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getOoyalaElement(embedCode, playerId, pCode, opt_version,
    opt_config, opt_placeholder) {
    const player = doc.createElement('amp-ooyala-player');
    if (embedCode) {
      player.setAttribute('data-embedcode', embedCode);
    }
    if (playerId) {
      player.setAttribute('data-playerid', playerId);
    }
    if (pCode) {
      player.setAttribute('data-pcode', pCode);
    }

    if (opt_version) {
      player.setAttribute('data-playerversion', opt_version);
    }

    if (opt_config) {
      player.setAttribute('data-config', opt_config);
    }

    if (opt_placeholder) {
      player.setAttribute('data-placeholder', opt_placeholder);
    }

    doc.body.appendChild(player);
    return player.build()
        .then(() => player.layoutCallback())
        .then(() => player);
  }

  it('renders a V3 player', () => {
    return getOoyalaElement('Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
        '6440813504804d76ba35c8c787a4b33c',
        '5zb2wxOlZcNCe_HVT3a6cawW298X').then(player => {
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal('https://player.ooyala.com/iframe.html' +
        '?platform=html5-priority&ec=Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ' +
        '&pbid=6440813504804d76ba35c8c787a4b33c');
    });
  });

  it('renders a V4 player', () => {
    return getOoyalaElement('Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
        '6440813504804d76ba35c8c787a4b33c',
        '5zb2wxOlZcNCe_HVT3a6cawW298X',
        'V4').then(player => {
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal('https://player.ooyala.com/static/v4/sandbox/' +
          'amp_iframe/skin-plugin/amp_iframe.html' +
          '?pcode=5zb2wxOlZcNCe_HVT3a6cawW298X' +
          '&ec=Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ' +
          '&pbid=6440813504804d76ba35c8c787a4b33c');
    });
  });

  it('fails without an embed code', () => {
    allowConsoleError(() => {
      return getOoyalaElement(null, '6440813504804d76ba35c8c787a4b33c',
          '5zb2wxOlZcNCe_HVT3a6cawW298X').should.eventually.be.rejectedWith(
          /The data-embedcode attribute is required/);
    });
  });

  it('fails without a player ID', () => {
    allowConsoleError(() => {
      return getOoyalaElement('Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ', null,
          '5zb2wxOlZcNCe_HVT3a6cawW298X').should.eventually.be.rejectedWith(
          /The data-playerid attribute is required/);
    });
  });

  it('fails without a p-code', () => {
    allowConsoleError(() => {
      return getOoyalaElement('Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ',
          '6440813504804d76ba35c8c787a4b33c', null)
          .should.eventually.be.rejectedWith(
              /The data-pcode attribute is required/);
    });
  });

});
