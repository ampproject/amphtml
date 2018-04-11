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
import {adsense} from '../adsense';

describes.realWin('adsenseDelayedFetch', {}, env => {

  let containerElem, data;
  const canonicalUrl = 'https://foo.com?some=page';
  const clientId = 'some_clientId';
  const pageViewId = 'some_pageViewId';
  const elementAttributes = {
    'adChannel': 'data-ad-channel',
    'adClient': 'data-ad-client',
    'adSlot': 'data-ad-slot',
    'adHost': 'data-ad-host',
    'adtest': 'data-adtest',
    'tagOrigin': 'data-tag-origin',
  };

  beforeEach(() => {
    containerElem = env.win.document.createElement('div');
    containerElem.setAttribute('id', 'c');
    env.win.document.body.appendChild(containerElem);
    env.win.context = {canonicalUrl, clientId, pageViewId};
    data = {};
    Object.keys(elementAttributes).forEach(
        attr => data[attr] = `some-${attr}`);
    data['experimentId'] = '1234,567,890';
  });

  it('should create script/ins and call adsbygoogle push', () => {
    let pushArg;
    env.win.adsbygoogle = {
      push: arg => {
        expect(pushArg).to.not.be.ok;
        pushArg = arg;
      },
    };
    adsense(env.win, data);
    expect(env.win.document.querySelector('script[src=' +
        '"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'))
        .to.be.ok;
    const insElement = env.win.document.querySelector('ins.adsbygoogle');
    expect(insElement).to.be.ok;
    expect(insElement.getAttribute('data-page-url')).to.equal(canonicalUrl);
    Object.keys(elementAttributes).forEach(attr =>
      expect(insElement.getAttribute(elementAttributes[attr]))
          .to.equal(`some-${attr}`));
    expect(pushArg).to.be.ok;
    expect(pushArg).to.jsonEqual({
      params: {
        'google_ad_modifications': {
          eids: ['1234', '567', '890'],
        },
      },
    });
    expect(env.win.gaGlobal).to.jsonEqual({
      cid: clientId,
      hid: pageViewId,
    });
  });

  it('should not throw for valid responsive ad unit height', () => {
    data['fullWidth'] = 'true';
    data['autoFormat'] = 'rspv';
    data['height'] = '320';
    expect(() => adsense(env.win, data)).to.not.throw();
  });

  it('should throw on invalid responsive ad unit height', () => {
    data['fullWidth'] = 'true';
    data['autoFormat'] = 'rspv';
    data['height'] = '666';
    allowConsoleError(() => {
      expect(() => adsense(env.win, data)).to.throw(
          /Specified height 666 in <amp-ad> tag is not equal to the required/);
    });
  });

  it('should throw on missing fullWidth field for responsive ad unit', () => {
    data['autoFormat'] = 'rspv';
    data['height'] = '320';
    allowConsoleError(() => {
      expect(() => adsense(env.win, data)).to.throw(
          /Responsive AdSense ad units require the attribute data-full-width.​/
      );
    });
  });
});
