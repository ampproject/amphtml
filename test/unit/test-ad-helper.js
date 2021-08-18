import {computedStyle} from '#core/dom/style';

import {createIframePromise} from '#testing/iframe';

import {getAdContainer, isAdPositionAllowed} from '../../src/ad-helper';

describes.sandboxed('ad-helper', {}, () => {
  describe('isAdPositionAllowed function', () => {
    it('should allow position fixed element that is allowlisted', () => {
      return createIframePromise().then((iframe) => {
        const allowlistedElement = iframe.doc.createElement('amp-lightbox');
        allowlistedElement.style.position = 'fixed';
        iframe.doc.body.appendChild(allowlistedElement);
        expect(isAdPositionAllowed(allowlistedElement, iframe.win)).to.be.true;
      });
    });

    it('should allow position fixed element inside allowlisted element', () => {
      return createIframePromise().then((iframe) => {
        const allowlistedElement = iframe.doc.createElement('amp-lightbox');
        allowlistedElement.style.position = 'fixed';
        const childElement = iframe.doc.createElement('div');
        const childChildElement = iframe.doc.createElement('div');
        childElement.appendChild(childChildElement);
        allowlistedElement.appendChild(childElement);
        iframe.doc.body.appendChild(allowlistedElement);
        expect(isAdPositionAllowed(childChildElement, iframe.win)).to.be.true;
      });
    });

    it(
      'should not allow position fixed element that is non-allowlisted ' +
        'element',
      () => {
        return createIframePromise().then((iframe) => {
          const nonAllowlistedElement = iframe.doc.createElement('foo-bar');
          nonAllowlistedElement.style.position = 'fixed';
          iframe.doc.body.appendChild(nonAllowlistedElement);
          expect(isAdPositionAllowed(nonAllowlistedElement, iframe.win)).to.be
            .false;
        });
      }
    );

    it(
      'should not allow position sticky-fixed element that is ' +
        'non-allowlisted element',
      () => {
        return createIframePromise().then((iframe) => {
          const nonAllowlistedElement = iframe.doc.createElement('foo-bar');
          nonAllowlistedElement.style.position = 'sticky';
          // Check if browser support position:sticky
          const styles = computedStyle(iframe.win, nonAllowlistedElement);
          if (styles.position != 'sticky') {
            return;
          }
          iframe.doc.body.appendChild(nonAllowlistedElement);
          expect(isAdPositionAllowed(nonAllowlistedElement, iframe.win)).to.be
            .false;
        });
      }
    );

    it(
      'should not allow position fixed element inside non-allowlisted ' +
        'element',
      () => {
        return createIframePromise().then((iframe) => {
          const nonAllowlistedElement = iframe.doc.createElement('foo-bar');
          nonAllowlistedElement.style.position = 'fixed';
          const childElement = iframe.doc.createElement('div');
          const childChildElement = iframe.doc.createElement('div');
          childElement.appendChild(childChildElement);
          nonAllowlistedElement.appendChild(childElement);
          iframe.doc.body.appendChild(nonAllowlistedElement);
          expect(isAdPositionAllowed(childChildElement, iframe.win)).to.be
            .false;
        });
      }
    );
  });

  describe('getAdContainer function', () => {
    it('should return null if no container', () => {
      return createIframePromise().then((iframe) => {
        const parentElement = iframe.doc.createElement('div');
        const childElement = iframe.doc.createElement('div');
        parentElement.appendChild(childElement);
        iframe.doc.body.appendChild(parentElement);
        expect(getAdContainer(childElement)).to.be.null;
      });
    });

    it('should return the closest container', () => {
      return createIframePromise().then((iframe) => {
        const parentElement = iframe.doc.createElement('amp-lightbox');
        const childElement = iframe.doc.createElement('amp-sticky-ad');
        const childChildElement = iframe.doc.createElement('div');
        iframe.doc.body.appendChild(parentElement);
        parentElement.appendChild(childElement);
        childElement.appendChild(childChildElement);
        expect(getAdContainer(childChildElement)).to.equal(
          childElement.tagName
        );
      });
    });

    it('should return pre-calculated value', () => {
      return createIframePromise().then((iframe) => {
        const parentElement = iframe.doc.createElement('amp-fx-flying-carpet');
        const childElement = iframe.doc.createElement('amp-sticky-ad');
        parentElement.appendChild(childElement);
        iframe.doc.body.appendChild(parentElement);
        childElement['__AMP__AD_CONTAINER'] = 'AMP-LIGHTBOX';
        expect(getAdContainer(childElement)).to.equal('AMP-LIGHTBOX');
      });
    });
  });
});
