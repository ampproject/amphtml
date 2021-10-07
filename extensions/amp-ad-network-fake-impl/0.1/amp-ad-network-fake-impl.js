import {includes} from '#core/types/string';

import {forceExperimentBranch} from '#experiments';

import {user, userAssert} from '#utils/log';

import {AmpAdMetadataTransformer} from './amp-ad-metadata-transformer';
import {ExternalReorderHeadTransformer} from './external-reorder-head-transformer';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

const TAG = 'AMP-AD-NETWORK-FAKE-IMPL';

/**
 * Allow elements to opt into an experiment branch.
 * @const {string}
 */
const EXPERIMENT_BRANCH_ATTR = 'data-experiment-id';

export class AmpAdNetworkFakeImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {!./external-reorder-head-transformer.ExternalReorderHeadTransformer} */
    this.reorderHeadTransformer_ = new ExternalReorderHeadTransformer();
    /** @private {!./amp-ad-metadata-transformer.AmpAdMetadataTransformer} */
    this.metadataTransformer_ = new AmpAdMetadataTransformer();
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.hasAttribute('src') || this.element.hasAttribute('srcdoc'),
      'Attribute src or srcdoc required for <amp-ad type="fake">: %s',
      this.element
    );
    if (this.element.hasAttribute(EXPERIMENT_BRANCH_ATTR)) {
      this.element
        .getAttribute(EXPERIMENT_BRANCH_ATTR)
        .split(',')
        .forEach((experiment) => {
          const expParts = experiment.split(':');
          forceExperimentBranch(this.win, expParts[0], expParts[1]);
        });
    }
    super.buildCallback();
  }

  /** @override */
  isValidElement() {
    // To send out ad request, ad type='fake' requires the id set to an invalid
    // value start with `i-amphtml-demo-`. So that fake ad can only be used in
    // invalid AMP pages.
    const id = this.element.getAttribute('id');
    if (!id || !id.startsWith('i-amphtml-demo-')) {
      user().warn(TAG, 'Only works with id starts with i-amphtml-demo-');
      return false;
    }
    return true;
  }

  /** @override */
  getAdUrl() {
    const src = this.element.getAttribute('src');
    if (src) {
      return src;
    }
    const srcdoc = this.element.getAttribute('srcdoc');
    return `data:text/html,${encodeURIComponent(srcdoc)}`;
  }

  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then((response) => {
      if (!response) {
        return null;
      }
      const {headers, status} =
        /** @type {{status: number, headers: !Headers}} */ (response);

      // In the convert creative mode the content is the plain AMP HTML.
      // This mode is primarily used for A4A Envelope for testing.
      // See developing.md for more info.
      if (this.element.getAttribute('a4a-conversion') == 'true') {
        return response.text().then((responseText) => {
          // When using data: url the legacy amp cors param is interpreted as
          // part of the body, so remove it.
          if (includes(responseText, '?__amp_source_origin=')) {
            responseText = responseText.split('?__amp_source_origin=')[0];
          }
          return new Response(this.transformCreative_(responseText), {
            status,
            headers,
          });
        });
      }

      // Normal mode: Expect the creative is already transformed and includes
      // amp-ad-metadata
      return response;
    });
  }

  /**
   * Converts a general AMP doc to a AMP4ADS doc.
   * @param {string} source
   * @return {string}
   */
  transformCreative_(source) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const root = doc.documentElement;

    // <html ⚡> -> <html ⚡4ads>
    if (root.hasAttribute('⚡')) {
      root.removeAttribute('⚡');
    } else if (root.hasAttribute('amp')) {
      root.removeAttribute('amp');
    } else if (root.hasAttribute('AMP')) {
      root.removeAttribute('AMP');
    }
    if (!root.hasAttribute('⚡4ads') && !root.hasAttribute('⚡4ADS')) {
      root.setAttribute('amp4ads', '');
    }

    this.reorderHeadTransformer_.reorderHead(doc.head);
    const metadata = this.metadataTransformer_.generateMetadata(doc);

    //Removes <amp-ad-metadata> tag if it exists
    const oldMetadata = doc.querySelector('script[amp-ad-metadata]');
    if (oldMetadata) {
      oldMetadata.parentNode.removeChild(oldMetadata);
    }

    const creative = root./*OK*/ outerHTML;
    const creativeSplit = creative.split('</body>');
    const docWithMetadata =
      creativeSplit[0] +
      `<script type="application/json" amp-ad-metadata>` +
      metadata +
      '</script></body>' +
      creativeSplit[1];
    return docWithMetadata;
  }
}

AMP.extension('amp-ad-network-fake-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-fake-impl', AmpAdNetworkFakeImpl);
});
