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

import '../amp-sona';

describes.realWin(
  'amp-sona',
  {
    amp: {
      extensions: ['amp-sona'],
    },
  },
  (env) => {
    let win, doc;
    const clientId = '4a2f2764-0ca3-11ea-bd94-0242ac130008';
    const resource = 'image';
    const variant = '120x600';
    const src = `https://amp.sonaserve.com/${clientId}/${resource}/${variant}`;

    const createSonaWidget = (clientId, resource, variant, opt_attrs) => {
      const widget = doc.createElement('amp-sona');

      widget.setAttribute('data-client-id', clientId);
      widget.setAttribute('data-resource', resource);
      widget.setAttribute('data-variant', variant);

      if (opt_attrs) {
        for (const attr in opt_attrs) {
          widget.setAttribute(attr, opt_attrs[attr]);
        }
      }

      doc.body.appendChild(widget);

      return widget
        .build()
        .then(() => widget.layoutCallback())
        .then(() => widget);
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('renders sona widget', () => {
      return createSonaWidget(clientId, resource, variant, {
        layout: 'fixed',
      }).then((widget) => {
        const iframe = widget.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(src);
      });
    });

    it('renders fixed', () => {
      return createSonaWidget(clientId, resource, variant, {
        layout: 'fixed',
      }).then((widget) => {
        const iframe = widget.firstChild;
        expect(iframe).to.not.be.null;
        expect(widget.className).to.match(
          /i-amphtml-element i-amphtml-error i-amphtml-layout/
        );
      });
    });

    it('renders fixed-height', () => {
      return createSonaWidget(clientId, resource, variant, {
        layout: 'fixed-height',
      }).then((widget) => {
        const iframe = widget.firstChild;
        expect(iframe).to.not.be.null;
        expect(widget.className).to.match(
          /i-amphtml-element i-amphtml-error i-amphtml-layout/
        );
      });
    });

    it('renders responsively', () => {
      return createSonaWidget(clientId, resource, variant, {
        layout: 'responsive',
      }).then((widget) => {
        const iframe = widget.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });
  }
);
