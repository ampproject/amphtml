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

describes.realWin(
  'amp-instagram',
  {
    amp: {
      extensions: ['amp-instagram:1.0'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getIns(
      shortcode,
      opt_responsive,
      opt_beforeLayoutCallback,
      opt_captioned,
      opt_visibilityPromise
    ) {
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
      const visibilityPromise = env.sandbox.stub(
        env.ampdoc,
        'whenFirstVisible'
      );
      visibilityPromise.returns(
        opt_visibilityPromise ||
          new Promise((resolve) => {
            resolve();
          })
      );
      ins.implementation_.getVsync = () => {
        return {
          mutate(cb) {
            cb();
          },
          measure(cb) {
            cb();
          },
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
      await ins.build();
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(ins);
      }
      await ins.layoutCallback();
      return ins;
    }

    function testImage(image) {
      expect(image).to.not.be.null;
      expect(image.getAttribute('src')).to.equal(
        'https://www.instagram.com/p/fBwFP/media/?size=l'
      );
      expect(image.getAttribute('alt')).to.equal('Testing');
      expect(image.getAttribute('referrerpolicy')).to.equal('origin');
    }

    function testIframe(iframe) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.instagram.com/p/fBwFP/embed/?cr=1&v=12'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
    }

    function testIframeCaptioned(iframe) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.instagram.com/p/fBwFP/embed/captioned/?cr=1&v=12'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
      expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
    }

    it('renders', async () => {
      const ins = await getIns('fBwFP');
      testIframe(ins.querySelector('iframe'));
      testImage(ins.querySelector('img'));
    });

    it('renders captioned', async () => {
      const ins = await getIns('fBwFP', undefined, undefined, true);
      testIframeCaptioned(ins.querySelector('iframe'));
      testImage(ins.querySelector('img'));
    });

    it('only sets src on placeholder after prerender', async () => {
      let becomeVisible;
      const visible = new Promise((resolve) => (becomeVisible = resolve));
      const ins = await getIns(
        'fBwFP',
        undefined,
        undefined,
        undefined,
        visible
      );
      expect(ins.querySelector('img').getAttribute('src')).to.be.null;
      becomeVisible();
      await visible;
      expect(ins.querySelector('img').getAttribute('src')).to.equal(
        'https://www.instagram.com/p/fBwFP/media/?size=l'
      );
    });

    it('builds a placeholder image without inserting iframe', async () => {
      return getIns('fBwFP', true, (ins) => {
        const placeholder = ins.querySelector('[placeholder]');
        const iframe = ins.querySelector('iframe');
        expect(iframe).to.be.null;
        expect(placeholder).to.not.have.display('');
        testImage(placeholder.querySelector('img'));
      }).then((ins) => {
        const placeholder = ins.querySelector('[placeholder]');
        const iframe = ins.querySelector('iframe');
        ins.getVsync = () => {
          return {
            mutate: (fn) => fn(),
          };
        };
        testIframe(iframe);
        testImage(placeholder.querySelector('img'));
        ins.implementation_.iframePromise_.then(() => {
          expect(placeholder).to.be.have.display('none');
        });
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const ins = await getIns('fBwFP');
      const placeholder = ins.querySelector('[placeholder]');
      testIframe(ins.querySelector('iframe'));
      const obj = ins.implementation_;
      obj.unlayoutCallback();
      expect(ins.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.be.null;
      expect(placeholder).to.not.have.display('none');
    });

    it('renders responsively', async () => {
      const ins = await getIns('fBwFP', true);
      expect(ins.className).to.match(/i-amphtml-layout-responsive/);
    });

    it('requires data-shortcode', () => {
      allowConsoleError(() => {
        expect(getIns('')).to.be.rejectedWith(
          /The data-shortcode attribute is required for/
        );
      });
    });

    it('resizes in response to messages from Instagram iframe', async () => {
      const ins = await getIns('fBwFP', true);
      const impl = ins.implementation_;
      const iframe = ins.querySelector('iframe');
      const forceChangeHeight = env.sandbox.spy(impl, 'forceChangeHeight');
      const newHeight = 977;
      expect(iframe).to.not.be.null;
      sendFakeMessage(ins, iframe, 'MEASURE', {
        height: newHeight,
      });
      expect(forceChangeHeight).to.be.calledOnce;
      // Height minus padding
      expect(forceChangeHeight.firstCall.args[0]).to.equal(newHeight);
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
  }
);
