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

import '../amp-vidazoo-widget';

describes.realWin(
  'amp-vidazoo-widget',
  {
    amp: {
      extensions: ['amp-vidazoo-widget'],
    },
  },
  (env) => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getVidazooWidget(attributes) {
      const widget = doc.createElement('amp-vidazoo-widget');
      for (const key in attributes) {
        widget.setAttribute(key, attributes[key]);
      }
      widget.setAttribute('width', '480');
      widget.setAttribute('height', '270');
      widget.setAttribute('layout', 'responsive');

      doc.body.appendChild(widget);
      return widget.build().then(() => {
        widget.layoutCallback();
        return widget;
      });
    }

    it('renders', async () => {
      const widget = await getVidazooWidget({
        'data-widget-id': '5fe8ba17de03c70004db1d48',
      });
      const iframe = widget.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://static.vidazoo.com/basev/amp/artemis/index.html?widgetId=5fe8ba17de03c70004db1d48'
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('fails if no widgetId is specified', () => {
      return allowConsoleError(() => {
        return getVidazooWidget({}).should.eventually.be.rejectedWith(
          /The data-widget-id attribute is required for/
        );
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const widget = await getVidazooWidget({
        'data-widget-id': '5fe8ba17de03c70004db1d48',
      });
      const iframe = widget.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = widget.implementation_;
      obj.unlayoutCallback();
      expect(widget.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });
  }
);
