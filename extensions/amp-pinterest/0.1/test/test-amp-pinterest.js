/**
 * Copyright 2015 The AMP HTML Authors.
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

import '../amp-pinterest';


describes.realWin('amp-pinterest', {
  amp: {
    runtimeOn: false,
    ampdoc: 'single',
    extensions: ['amp-pinterest'],
  },
}, env => {

  function getPin(pinDo, pinUrl, pinMedia, pinDescription, pinAlt) {
    const div = document.createElement('div');
    env.win.document.body.appendChild(div);
    env.fetchMock.fallbackResponse = '200';

    const pin = env.win.document.createElement('amp-pinterest');
    pin.setAttribute('data-do', pinDo);
    pin.setAttribute('data-url', pinUrl);
    pin.setAttribute('data-media', pinMedia);
    pin.setAttribute('data-description', pinDescription);
    pin.setAttribute('alt', pinAlt);
    div.appendChild(pin);
    return pin.implementation_.layoutCallback().then(() => {
      return pin;
    });
  };

  it('renders', () => {
    return getPin('buttonPin',
        'http://www.flickr.com/photos/kentbrew/6851755809/',
        'http://c2.staticflickr.com/8/7027/6851755809_df5b2051c9_b.jpg',
        'Next stop: Pinterest',
        'Hands making heart over Pinterest logo'
    ).then(pin => {
      const a = pin.querySelector('a');
      const href = a.href.replace(/&guid=\w+/, '');
      expect(a).to.not.be.null;
      expect(a.tagName).to.equal('A');
      expect(href).to.equal('https://www.pinterest.com/pin/create/' +
        'button/?amp=1&url=http%3A%2F%2Fwww.flickr.com%' +
        '2Fphotos%2Fkentbrew%2F6851755809%2F&media=http%3A%2F%2Fc2.s' +
        'taticflickr.com%2F8%2F7027%2F6851755809_df5b2051c9_b.jpg&de' +
        'scription=Next%20stop%3A%20Pinterest');
    });
  });

  it('sets provided alternate text', () => {
    return getPin('embedPin',
        'https://www.pinterest.com/pin/99360735500167749/',
        null,
        null,
        'Hands making heart over Pinterest logo'
    ).then(pin => {
      const img = pin.querySelector('img');
      img.getAttribute('alt').to.equal('Hands making heart over ' +
        'Pinterest logo');
    });
  });

  it('sets alternate text from pin data provided by Pinterest API', () => {
    return getPin('embedPin',
        'https://www.pinterest.com/pin/228065168607834583/'
    ).then(pin => {
      const img = pin.querySelector('img');
      img.getAttribute('alt').to.equal('End of the line Riding the rails in SF, ' +
        'cable car rails #cablecar #sanfrancisco #endoftheline #tourist #rails ' +
        '#saturdayafternoon #california');
    });
  });


  it('no alternate text and no title provided by the Pinterest API', () => {
    return getPin('embedPin',
        'https://www.pinterest.com/pin/445786063109072175/'
    ).then(pin => {
      const img = pin.querySelector('img');
      expect(img.getAttribute('alt')).to.be.null;
    });
  });
});
