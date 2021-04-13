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

import {
  A4AVarNames,
  createCta,
  getStoryAdMetadataFromDoc,
  getStoryAdMetadataFromElement,
  maybeCreateAttribution,
  validateCtaMetadata,
} from '../story-ad-ui';
import {ButtonTextFitter} from '../story-ad-button-text-fitter';

describes.realWin('story-ad-ui', {amp: true}, (env) => {
  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  describe('getStoryAdMetadataFromDoc', () => {
    it('returns metadata for amp-* values', () => {
      const adDoc = doc.implementation.createHTMLDocument();
      adDoc.head.innerHTML = `
        <meta name="amp-cta-type" content="SHOP">
        <meta name="amp-cta-url" content="https://www.kittens.com">
      `;
      const result = getStoryAdMetadataFromDoc(adDoc);
      expect(result).to.eql({
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
      });
    });

    it('returns metadata for amp4ads-vars-* values', () => {
      const adDoc = doc.implementation.createHTMLDocument();
      adDoc.head.innerHTML = `
        <meta name="amp4ads-vars-cta-type" content="SHOP">
        <meta name="amp4ads-vars-cta-url" content="https://www.kittens.com">
        <meta name="amp4ads-vars-attribution-icon" content="https://www.kittens.com/img1">
        <meta name="amp4ads-vars-attribution-url" content="https://www.kittens.com/moreinfo">
      `;
      const result = getStoryAdMetadataFromDoc(adDoc);
      expect(result).to.eql({
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
        'attribution-icon': 'https://www.kittens.com/img1',
        'attribution-url': 'https://www.kittens.com/moreinfo',
      });
    });
  });

  describe('getStoryAdMetadataFromElement', () => {
    it('gets cta type & cta url', () => {
      const adEl = doc.createElement('amp-ad');
      adEl.setAttribute('data-vars-ctatype', 'SHOP');
      adEl.setAttribute('data-vars-ctaurl', 'https://www.kittens.com');
      expect(getStoryAdMetadataFromElement(adEl)).to.eql({
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
      });
    });
  });

  describe('validateCtaMetadata', () => {
    it('returns true if cta type & cta url', () => {
      const metadata = {
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
      };
      expect(validateCtaMetadata(metadata)).to.be.true;
    });

    it('returns false if no cta type', () => {
      const metadata = {
        'cta-url': 'https://www.kittens.com',
      };
      allowConsoleError(() => {
        expect(validateCtaMetadata(metadata)).to.be.false;
      });
    });

    it('returns false without error in inabox', () => {
      const metadata = {
        'cta-url': 'https://www.kittens.com',
      };
      expect(validateCtaMetadata(metadata, true /* opt_inabox */)).to.be.false;
    });

    it('returns false if no cta url', () => {
      const metadata = {
        'cta-type': 'SHOP',
      };
      allowConsoleError(() => {
        expect(validateCtaMetadata(metadata)).to.be.false;
      });
    });
  });

  describe('maybeCreateAttribution', () => {
    it('creates, appends, & returns the element if sufficent metadata', () => {
      const metadata = {
        'attribution-icon': 'https://www.kittens.com/img1',
        'attribution-url': 'https://www.kittens.com/moreinfo',
      };
      const element = maybeCreateAttribution(
        win,
        metadata,
        doc.body /* container */
      );
      expect(element).to.exist;
      expect(element.getAttribute('src')).to.equal(
        'https://www.kittens.com/img1'
      );
      expect(doc.querySelector('.i-amphtml-attribution-host')).to.exist;
      expect(doc.querySelector('img')).to.equal(element);
    });

    it('returns null and does not create if no icon url', () => {
      const metadata = {
        'attribution-url': 'https://www.kittens.com/moreinfo',
      };
      const element = maybeCreateAttribution(
        win,
        metadata,
        doc.body /* container */
      );
      expect(element).to.be.null;
      expect(doc.querySelector('.i-amphtml-attribution-host')).not.to.exist;
    });

    it('returns null and does not create if no landing url', () => {
      const metadata = {
        'attribution-icon': 'https://www.kittens.com/img1',
      };
      const element = maybeCreateAttribution(
        win,
        metadata,
        doc.body /* container */
      );
      expect(element).to.be.null;
      expect(doc.querySelector('.i-amphtml-attribution-host')).not.to.exist;
    });

    it('returns null and does not create if not https', () => {
      const metadata = {
        'attribution-icon': 'https://www.kittens.com/img1',
        'attribution-url': 'http://www.kittens.com/moreinfo',
      };
      allowConsoleError(() => {
        const element = maybeCreateAttribution(
          win,
          metadata,
          doc.body /* container */
        );
        expect(element).to.be.null;
        expect(doc.querySelector('.i-amphtml-attribution-host')).not.to.exist;
      });
    });
  });

  describe('createCta', () => {
    let buttonFitter;

    beforeEach(() => {
      buttonFitter = new ButtonTextFitter(env.ampdoc);
    });

    it('returns the created anchor', () => {
      const metadata = {
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((anchor) => {
        expect(anchor).to.exist;
        expect(anchor.href).to.equal('https://www.cats.com/');
        expect(anchor.textContent).to.equal('SHOP');
        expect(doc.querySelector('amp-story-cta-layer')).to.exist;
        expect(doc.querySelector('a')).to.exist;
      });
    });

    it('returns null if button text is too long', () => {
      const metadata = {
        [A4AVarNames.CTA_TYPE]: 'cta that is way too long to fit in a button',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      const container = doc.createElement('div');
      container.width = '400px';

      return createCta(doc, buttonFitter, container, metadata).then(
        (anchor) => {
          expect(anchor).to.be.null;
          expect(container.querySelector('amp-story-cta-layer')).not.to.exist;
        }
      );
    });

    it('returns null if url protocol is not http || https', () => {
      const metadata = {
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'mailto:meow@cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((anchor) => {
        expect(anchor).to.be.null;
        expect(doc.querySelector('amp-story-cta-layer')).not.to.exist;
      });
    });
  });
});
