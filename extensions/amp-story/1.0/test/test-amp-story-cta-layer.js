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

import {AmpStoryCtaLayer} from '../amp-story-cta-layer';

describes.realWin(
  'amp-story-cta-layer',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  env => {
    let win;
    let ampStoryCtaLayer;

    beforeEach(() => {
      win = env.win;
      const ampStoryCtaLayerEl = win.document.createElement(
        'amp-story-cta-layer'
      );
      win.document.body.appendChild(ampStoryCtaLayerEl);
      ampStoryCtaLayer = new AmpStoryCtaLayer(ampStoryCtaLayerEl);
    });

    it('should build the cta layer', () => {
      ampStoryCtaLayer.buildCallback();
      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(ampStoryCtaLayer.element).to.have.class('i-amphtml-story-layer');
      });
    });

    it('should add or overwrite target attribute to links', () => {
      const ctaLink = win.document.createElement('a');
      expect(ctaLink).to.not.have.attribute('target');

      ampStoryCtaLayer.element.appendChild(ctaLink);
      ampStoryCtaLayer.buildCallback();

      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(ctaLink).to.have.attribute('target');
        expect(ctaLink.getAttribute('target')).to.equal('_blank');
      });
    });

    it('should not add target attribute to other elements', () => {
      const elem = win.document.createElement('span');
      ampStoryCtaLayer.element.appendChild(elem);
      ampStoryCtaLayer.buildCallback();

      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(elem).to.not.have.attribute('target');
      });
    });

    it('should not allow a cta layer on the first page', () => {
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );

      const pageElements = win.document.getElementsByTagName('amp-story-page');

      pageElements[0].appendChild(ampStoryCtaLayer.element);

      ampStoryCtaLayer.layoutCallback().then(layer => {
        return allowConsoleError(() => {
          return expect(layer).to.throw();
        });
      });
    });

    it('should allow a cta layer on the second or third page', () => {
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );

      const pageElements = win.document.getElementsByTagName('amp-story-page');

      pageElements[1].appendChild(ampStoryCtaLayer.element);
      pageElements[2].appendChild(ampStoryCtaLayer.element);

      ampStoryCtaLayer.layoutCallback().then(layer => {
        return expect(layer).to.not.throw();
      });
    });

    it('should add or overwrite role attribute to links', () => {
      const ctaLink = win.document.createElement('a');
      expect(ctaLink).to.not.have.attribute('role');

      ampStoryCtaLayer.element.appendChild(ctaLink);
      ampStoryCtaLayer.buildCallback();

      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(ctaLink).to.have.attribute('role');
        expect(ctaLink.getAttribute('role')).to.equal('link');
      });
    });

    it('should add or overwrite role attribute to buttons', () => {
      const ctaButton = win.document.createElement('button');
      expect(ctaButton).to.not.have.attribute('role');

      ampStoryCtaLayer.element.appendChild(ctaButton);
      ampStoryCtaLayer.buildCallback();

      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(ctaButton).to.have.attribute('role');
        expect(ctaButton.getAttribute('role')).to.equal('button');
      });
    });

    it('should not add role attribute to other elements', () => {
      const elem = win.document.createElement('span');
      ampStoryCtaLayer.element.appendChild(elem);
      ampStoryCtaLayer.buildCallback();

      return ampStoryCtaLayer.layoutCallback().then(() => {
        expect(elem).to.not.have.attribute('role');
      });
    });
  }
);
