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
import {AmpStoryPage} from '../amp-story-page';

describes.realWin('amp-story-cta-layer', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-story:1.0'],
  },
}, env => {
  let win;
  let ampStoryCtaLayer;

  beforeEach(() => {
    win = env.win;
    const ampStoryCtaLayerEl =
      win.document.createElement('amp-story-cta-layer');
    win.document.body.appendChild(ampStoryCtaLayerEl);
    ampStoryCtaLayer = new AmpStoryCtaLayer(ampStoryCtaLayerEl);
  });

  function createPages(container, count, opt_ids) {
    return Array(count).fill(undefined).map((unused, i) => {
      const page = win.document.createElement('amp-story-page');
      page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;
      page.getImpl = () => Promise.resolve(new AmpStoryPage(page));
      container.appendChild(page);
      return page;
    });
  }

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
    // Setup: create story with two pages.
    const ampStoryEl = win.document.createElement('amp-story');
    win.document.body.appendChild(ampStoryEl);
    createPages(ampStoryEl, 2, ['cover', 'next-page']);

    // Get pages in story.
    const pageElements =
    ampStoryEl.getElementsByTagName('amp-story-page');

    //Attach cta layer to first page (cover page).
    pageElements[0].appendChild(ampStoryCtaLayer.element);

    ampStoryCtaLayer.layoutCallback().then(layer => {
      allowConsoleError(() => {
        return expect(layer).to.throw();
      });
    });
  });

  it('should allow a cta layer on the second or third page', () => {
    // Setup: create story with three pages.
    const ampStoryEl = win.document.createElement('amp-story');
    win.document.body.appendChild(ampStoryEl);
    createPages(ampStoryEl, 3, ['cover', 'pg-2', 'pg-3']);

    // Get pages in story.
    const pageElements =
    ampStoryEl.getElementsByTagName('amp-story-page');

    //Attach cta layer to second and third pages.
    pageElements[1].appendChild(ampStoryCtaLayer.element);
    pageElements[2].appendChild(ampStoryCtaLayer.element);

    ampStoryCtaLayer.layoutCallback().then(layer => {
      return expect(layer).to.not.throw();
    });
  });

});
