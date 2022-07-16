import {forceExperimentBranch} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {ButtonTextFitter} from '../story-ad-button-text-fitter';
import {
  A4AVarNames,
  createCta,
  getStoryAdMacroTags,
  getStoryAdMetaTags,
  getStoryAdMetadataFromDoc,
  getStoryAdMetadataFromElement,
  maybeCreateAttribution,
  validateCtaMetadata,
} from '../story-ad-ui';

describes.realWin('story-ad-ui', {amp: true}, (env) => {
  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  describe('meta tags', () => {
    it('returns metadata for amp-* values', () => {
      const adDoc = doc.implementation.createHTMLDocument();
      adDoc.head.innerHTML = `
        <meta name="other-tag" content="random-val">
        <meta name="amp-cta-type" content="SHOP">
        <meta name="amp-cta-url" content="https://www.kittens.com">
      `;
      const result = getStoryAdMetadataFromDoc(getStoryAdMetaTags(adDoc));
      expect(result).to.eql({
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
      });
    });

    it('returns metadata for amp4ads-vars-* values', () => {
      const adDoc = doc.implementation.createHTMLDocument();
      adDoc.head.innerHTML = `
        <meta name="other-tag" content="random-val">
        <meta name="amp4ads-vars-cta-type" content="SHOP">
        <meta name="amp4ads-vars-cta-url" content="https://www.kittens.com">
        <meta name="amp4ads-vars-attribution-icon" content="https://www.kittens.com/img1">
        <meta name="amp4ads-vars-attribution-url" content="https://www.kittens.com/moreinfo">
      `;
      const result = getStoryAdMetadataFromDoc(getStoryAdMetaTags(adDoc));
      expect(result).to.eql({
        'cta-type': 'SHOP',
        'cta-url': 'https://www.kittens.com',
        'attribution-icon': 'https://www.kittens.com/img1',
        'attribution-url': 'https://www.kittens.com/moreinfo',
      });
    });

    it('getStoryAdMacroTags should return all tags', () => {
      const adDoc = doc.implementation.createHTMLDocument();
      adDoc.head.innerHTML = `
        <meta name="other-tag" content="random-val">
        <meta name="invalid-tag-name-*" content="random-val">
        <meta name="amp4ads-vars-cta-type" content="SHOP">
        <meta name="amp4ads-vars-cta-url" content="https://www.kittens.com">
        <meta name="amp4ads-vars-attribution-icon" content="https://www.kittens.com/img1">
        <meta name="amp4ads-vars-attribution-url" content="https://www.kittens.com/moreinfo">
      `;
      const result = getStoryAdMacroTags(getStoryAdMetaTags(adDoc));
      expect(result).to.eql({
        'other-tag': 'random-val',
        'amp4ads-vars-cta-type': 'SHOP',
        'amp4ads-vars-cta-url': 'https://www.kittens.com',
        'amp4ads-vars-attribution-icon': 'https://www.kittens.com/img1',
        'amp4ads-vars-attribution-url': 'https://www.kittens.com/moreinfo',
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

  describe('createCta page outlink element', () => {
    let buttonFitter;

    beforeEach(() => {
      buttonFitter = new ButtonTextFitter(env.ampdoc);
      forceExperimentBranch(
        win,
        StoryAdSegmentExp.ID,
        StoryAdSegmentExp.AUTO_ADVANCE_NEW_CTA
      );
    });

    it('createCta page outlink custom theme element', () => {
      const metadata = {
        'cta-accent-color': '#FF00FF',
        'cta-accent-element': 'text',
        'cta-image':
          '/examples/visual-tests/picsum.photos/image1068_300x169.jpg',
        'theme': 'custom',
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((container) => {
        expect(container).to.exist;
        const containerElem = doc.querySelector(
          '.i-amphtml-story-page-outlink-container'
        );
        expect(containerElem).to.exist;

        expect(containerElem.getAttribute('cta-accent-color')).to.equal(
          '#FF00FF'
        );
        expect(containerElem.getAttribute('cta-accent-element')).to.equal(
          'text'
        );
        expect(containerElem.getAttribute('cta-image')).to.equal(
          '/examples/visual-tests/picsum.photos/image1068_300x169.jpg'
        );
        expect(containerElem.getAttribute('theme')).to.equal('custom');
        expect(containerElem.children[0].href).to.equal(
          'https://www.cats.com/'
        );
        expect(containerElem.children[0].textContent).to.equal('SHOP');
        expect(containerElem.children[0].target).to.equal('_top');
        expect(containerElem.children[0].tagName).to.equal('A');
      });
    });

    it('createCta page outlink light theme element', () => {
      const metadata = {
        'theme': 'light',
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((container) => {
        expect(container).to.exist;
        const containerElem = doc.querySelector(
          '.i-amphtml-story-page-outlink-container'
        );
        expect(containerElem).to.exist;
        expect(containerElem.getAttribute('theme')).to.equal('light');
        expect(containerElem.children[0].href).to.equal(
          'https://www.cats.com/'
        );
        expect(containerElem.children[0].textContent).to.equal('SHOP');
      });
    });

    it('createCta page outlink dark theme element', () => {
      const metadata = {
        'theme': 'dark',
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((container) => {
        expect(container).to.exist;
        const containerElem = doc.querySelector(
          '.i-amphtml-story-page-outlink-container'
        );
        expect(containerElem).to.exist;
        expect(containerElem.getAttribute('theme')).to.equal('dark');
        expect(containerElem.children[0].href).to.equal(
          'https://www.cats.com/'
        );
        expect(containerElem.children[0].textContent).to.equal('SHOP');
      });
    });

    it('createCta page outlink dark theme element with color and accent-element (should have no effect)', () => {
      const metadata = {
        'theme': 'dark',
        'cta-accent-color': '#FF00FF',
        'cta-accent-element': 'text',
        [A4AVarNames.CTA_TYPE]: 'SHOP',
        [A4AVarNames.CTA_URL]: 'https://www.cats.com',
      };
      return createCta(
        doc,
        buttonFitter,
        doc.body /* container */,
        metadata
      ).then((container) => {
        expect(container).to.exist;
        const containerElem = doc.querySelector(
          '.i-amphtml-story-page-outlink-container'
        );
        expect(containerElem).to.exist;
        expect(containerElem.getAttribute('theme')).to.equal('dark');
        expect(containerElem.children[0].href).to.equal(
          'https://www.cats.com/'
        );
        expect(containerElem.children[0].textContent).to.equal('SHOP');
      });
    });
  });
});
