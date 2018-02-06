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

import '../amp-byside-content';

describes.realWin('amp-byside-content', {
  amp: {
    extensions: ['amp-byside-content'],
  },
  ampAdCss: true,
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getElement(attributes, opt_responsive, opt_beforeLayoutCallback) {
    const elem = doc.createElement('amp-byside-content');

    for (const key in attributes) {
      elem.setAttribute(key, attributes[key]);
    }

    elem.setAttribute('width', '640');
    elem.setAttribute('height', '360');
    if (opt_responsive) {
      elem.setAttribute('layout', 'responsive');
    }

    doc.body.appendChild(elem);
    return elem.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(elem);
      }

      return elem.layoutCallback();
    }).then(() => elem);
  }

  function testIframe(elem) {
    const iframe = elem.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.getAttribute('scrolling')).to.equal('no');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
    expect(iframe.fakeSrc).to.satisfy(src => {
      return src.startsWith(elem.implementation_.baseUrl_);
    });
  }

  it('renders', () => {
    return getElement({
      'data-webcare-id': 'D6604AE5D0',
      'data-label': 'amp-simple',
    }).then(elem => {
	  testIframe(elem);
    });
  });

  it('requires data-label', () => {
    return getElement({
      'data-webcare-id': 'D6604AE5D0',
    }).should.eventually.be.rejectedWith(
        /The data-label attribute is required for/);
  });

  it('requires data-webcare-id', () => {
    return (getElement({
      'data-label': 'placeholder-label',
    })).should.eventually.be.rejectedWith(
        /The data-webcare-id attribute is required for/);
  });

  it('generates correct default origin', () => {
    return getElement({
      'data-webcare-id': 'D6604AE5D0',
      'data-label': 'placeholder-label',
    }).then(elem => {
      expect(elem.implementation_.origin_).to.equal(
		  'https://webcare.byside.com'
      );
    });
  });

  it('generates correct provided webcare zone', () => {
    const webcareZone = 'sa1';

    return getElement({
      'data-webcare-id': 'D6604AE5D0',
      'data-label': 'placeholder-label',
      'data-webcare-zone': webcareZone,
    }).then(elem => {
      expect(elem.implementation_.origin_).to.equal(
          'https://' + webcareZone + '.byside.com'
      );
    });
  });

  it('should create a loading animation', () => {
    return getElement({
      'data-webcare-id': 'D6604AE5D0',
      'data-label': 'placeholder-label',
    }).then(elem => {
	  const loader = elem.querySelector(
          '.i-amphtml-byside-content-loading-animation'
      );
	  expect(loader).to.not.be.null;
    });
  });

  it('builds a placeholder loading animation without inserting iframe', () => {
    const attributes = {
      'data-webcare-id': 'D6604AE5D0',
      'data-label': 'placeholder-label',
    };

    return getElement(attributes, true, elem => {
      const placeholder = elem.querySelector('[placeholder]');
      const iframe = elem.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
    }).then(elem => {
      const placeholder = elem.querySelector('[placeholder]');
      elem.getVsync = () => {
        return {
          mutate: fn => fn(),
        };
	  };

	  // test iframe
	  testIframe(elem);

      // test placeholder too
      elem.implementation_.iframePromise_.then(() => {
        expect(placeholder.style.display).to.be.equal('none');
      });
    });
  });
});
