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

import '../amp-wpm-player';

describes.realWin('amp-wpm-player', {
  amp: {
    extensions: ['amp-wpm-player'],
  },
  allowExternalResources: true,
}, env => {
  const defaultOptions = {
    layout: 'responsive',
    width: 1920,
    height: 1080,
    id: 'wpmPlayer',
    url: 'https://wp.tv/?mid=2013067',
    autoplay: 'true',
    adv: 'true',
    extendedrelated: 'false',
    forceliteembed: 'false',
  };

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  const getWpmPlayer = attributes => {
    let attributeString = '';

    for (const key in attributes) {
      attributeString += `${key}="${attributes[key]}" `;
    }

    const div = document.createElement('div');
    div.innerHTML =
        `<amp-wpm-player ${attributeString}></amp-wpm-player>`.trim();
    const wpmp = div.firstChild;


    for (const key in attributes) {
      wpmp.setAttribute(key, attributes[key]);
    }

    doc.body.appendChild(wpmp);

    return wpmp
        .build()
        .then(() => wpmp.layoutCallback())
        .then(() => wpmp);
  };

  it('should render when correct media is specified', () => {
    const options = {...defaultOptions};

    return getWpmPlayer(options)
        .then(wpmp => {
          const iframe = wpmp.querySelector('div amp-iframe');

          expect(iframe).to.not.be.null;
        });
  });

  it('should fail if no media is specified', () => {
    const options = {...defaultOptions, ...{
      url: '',
    }};

    getWpmPlayer(options).should.eventually.be.rejectedWith(new Error('asdf'));
  });

  describe('video interface methods', () => {
    function stubPostMessage(videoIframe) {
      return env.sandbox./*OK*/stub(
          videoIframe.implementation_,
          'sendCommand_'
      );
    }

    const implementedVideoInterfaceMethods = [
      'play',
      'pause',
      'mute',
      'unmute',
      'hideControls',
      'showControls',
    ];

    implementedVideoInterfaceMethods.forEach(method => {
      describe(`#${method}`, () => {
        const lowercaseMethod = method.toLowerCase();

        it(`should post '${lowercaseMethod}'`, () => {
          const options = {...defaultOptions};

          return getWpmPlayer(options)
              .then(wpmp => {
                const postMessage = stubPostMessage(wpmp);
                wpmp.implementation_[method]();

                expect(postMessage).to.have.been.calledOnce;
              });
        });
      });
    });
  });
});
