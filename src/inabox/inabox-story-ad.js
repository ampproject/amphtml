import {CSS as inaboxCSS} from '../../build/amp-story-auto-ads-inabox-0.1.css';
import {CSS as sharedCSS} from '../../build/amp-story-auto-ads-shared-0.1.css';
import {ButtonTextFitter} from '../../extensions/amp-story-auto-ads/0.1/story-ad-button-text-fitter';
import {
  START_CTA_ANIMATION_ATTR,
  createCta,
  getStoryAdMetaTags,
  getStoryAdMetadataFromDoc,
  maybeCreateAttribution,
  validateCtaMetadata,
} from '../../extensions/amp-story-auto-ads/0.1/story-ad-ui';
import {installStylesForDoc} from '../style-installer';

/**
 * If story ad metatags exist, render this creative as a story ad.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function maybeRenderInaboxAsStoryAd(ampdoc) {
  const {win} = ampdoc;
  const doc = win.document;
  const storyAdMetadata = getStoryAdMetadataFromDoc(getStoryAdMetaTags(doc));
  if (!validateCtaMetadata(storyAdMetadata, true /* opt_inabox */)) {
    return;
  }
  installStylesForDoc(ampdoc, sharedCSS + inaboxCSS, () => {});
  maybeCreateAttribution(win, storyAdMetadata, doc.body);

  const buttonFitter = new ButtonTextFitter(ampdoc);
  const ctaContainer = doc.createElement('div');

  // TODO(ccordry): maybe use inOb for visible signal to fire animation
  // across amp & inabox environments.
  createCta(doc, buttonFitter, ctaContainer, storyAdMetadata).then(
    (ctaAnchor) =>
      ctaAnchor && ctaAnchor.setAttribute(START_CTA_ANIMATION_ATTR, '')
  );

  doc.body.appendChild(ctaContainer);

  if (win.parent) {
    win.parent./*OK*/ postMessage('amp-story-ad-load', '*');
  }
}
