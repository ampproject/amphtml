/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-instagram';


describes.realWin('amp-instagram', {
  amp: {
    extensions: ['amp-instagram'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getIns(shortcode, opt_responsive,
    opt_beforeLayoutCallback, opt_captioned) {
    const ins = doc.createElement('amp-instagram');
    ins.setAttribute('data-shortcode', shortcode);
    ins.setAttribute('width', '111');
    ins.setAttribute('height', '222');
    ins.setAttribute('alt', 'Testing');
    if (opt_responsive) {
      ins.setAttribute('layout', 'responsive');
    }
    if (opt_captioned) {
      ins.setAttribute('data-captioned', '');
    }
    ins.implementation_.getVsync = () => {
      return {
        mutate(cb) { cb(); },
        measure(cb) { cb(); },
        runPromise(task, state = {}) {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
          return Promise.resolve();
        },
      };
    };
    doc.body.appendChild(ins);
    return ins.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(ins);
      }
      return ins.layoutCallback();
    }).then(() => ins);
  }

  function testImage(image) {
    expect(image).to.not.be.null;
    expect(image.getAttribute('src')).to.equal(
        'https://www.instagram.com/p/fBwFP/media/?size=l');
    expect(image.getAttribute('layout')).to.equal('fill');
    expect(image.getAttribute('alt')).to.equal('Testing');
    expect(image.getAttribute('referrerpolicy')).to.equal('origin');
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://www.instagram.com/p/fBwFP/embed/?cr=1&v=7');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
    expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
  }

  function testIframeCaptioned(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://www.instagram.com/p/fBwFP/embed/captioned/?cr=1&v=7');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
    expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
  }

  it('renders', () => {
    return getIns('fBwFP').then(ins => {
      testIframe(ins.querySelector('iframe'));
      testImage(ins.querySelector('amp-img'));
    });
  });

  it('renders captioned', () => {
    return getIns('fBwFP', undefined, undefined, true).then(ins => {
      testIframeCaptioned(ins.querySelector('iframe'));
      testImage(ins.querySelector('amp-img'));
    });
  });

  it('sets noprerender on amp-img', () => {
    return getIns('fBwFP').then(ins => {
      expect(ins.querySelector('amp-img').hasAttribute('noprerender'))
          .to.be.true;
    });
  });

  it('builds a placeholder image without inserting iframe', () => {
    return getIns('fBwFP', true, ins => {
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
      testImage(placeholder.querySelector('amp-img'));
    }).then(ins => {
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      ins.getVsync = () => {
        return {
          mutate: fn => fn(),
        };
      };
      testIframe(iframe);
      testImage(placeholder.querySelector('amp-img'));
      ins.implementation_.iframePromise_.then(() => {
        expect(placeholder.style.display).to.be.equal('none');
      });
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getIns('fBwFP').then(ins => {
      const placeholder = ins.querySelector('[placeholder]');
      testIframe(ins.querySelector('iframe'));
      const obj = ins.implementation_;
      obj.unlayoutCallback();
      expect(ins.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
    });
  });

  it('renders responsively', () => {
    return getIns('fBwFP', true).then(ins => {
      expect(ins.className).to.match(/i-amphtml-layout-responsive/);
    });
  });

  it('requires data-shortcode', () => {
    allowConsoleError(() => {
      expect(getIns('')).to.be.rejectedWith(
          /The data-shortcode attribute is required for/);
    });
  });

  it('resizes in response to messages from Instagram iframe', () => {
    return getIns('fBwFP', true).then(ins => {
      const impl = ins.implementation_;
      const iframe = ins.querySelector('iframe');
      const changeHeight = sandbox.spy(impl, 'changeHeight');
      const newHeight = 977;

      expect(iframe).to.not.be.null;

      sendFakeMessage(ins, iframe, 'MEASURE', {
        height: newHeight,
      });

      expect(changeHeight).to.be.calledOnce;
      // Height minus padding
      expect(changeHeight.firstCall.args[0]).to.equal(newHeight - 64);
    });
  });

  function sendFakeMessage(ins, iframe, type, details) {
    ins.implementation_.handleInstagramMessages_({
      origin: 'https://www.instagram.com',
      source: iframe.contentWindow,
      data: JSON.stringify({
        type,
        details,
      }),
    });
  }
});
