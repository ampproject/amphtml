import {Services} from '#service';

import {devAssert} from '#utils/log';

import {addParamToUrl} from '../../../src/url';
import {AmpAdNetworkBase} from '../../amp-a4a/0.1/amp-ad-network-base';
import {
  AdResponseType,
  ValidatorResult,
} from '../../amp-a4a/0.1/amp-ad-type-defs';
import {NameFrameRenderer} from '../../amp-a4a/0.1/name-frame-renderer';
import {TemplateRenderer} from '../../amp-a4a/0.1/template-renderer';
import {TemplateValidator} from '../../amp-a4a/0.1/template-validator';

// These have no side-effects, and so may be reused between all instances.
const validator = new TemplateValidator();
const nameFrameRenderer = new NameFrameRenderer();

export const DATA_REQUEST_PARAM_PREFIX = 'requestParam';

export class AmpAdTemplate extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.registerValidator(validator, AdResponseType.TEMPLATE);
    this.registerRenderer(new TemplateRenderer(), ValidatorResult.AMP);
    this.registerRenderer(nameFrameRenderer, ValidatorResult.NON_AMP);

    /** @const {string} */
    this.baseRequestUrl_ = this.element.getAttribute('src');
    devAssert(
      this.baseRequestUrl_,
      'Invalid network configuration: no request URL specified'
    );

    this.getContext().win = this.win;
  }

  /** @override */
  buildCallback() {
    this.user().error(
      TAG,
      'amp-ad-custom is deprecated, see https://github.com/ampproject/amphtml/issues/39443'
    );

    this.getContext().size = {
      // TODO(levitzky) handle non-numeric values.
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
      layout: this.element.getAttribute('layout'),
    };
  }

  /** @override */
  getRequestUrl() {
    let url = this.baseRequestUrl_;
    // We collect all fields in the dataset of the form
    // 'data-request-param-<field_name>=<val>`, and append &<field_name>=<val>
    // to the add request URL.
    Object.keys(this.element.dataset).forEach((dataField) => {
      if (dataField.startsWith(DATA_REQUEST_PARAM_PREFIX)) {
        const requestParamName = dataField.slice(
          DATA_REQUEST_PARAM_PREFIX.length,
          dataField.length
        );
        if (requestParamName) {
          // Set the first character to lower case, as reading it in camelCase
          // will automatically put it into upper case.
          const finalParamName =
            requestParamName.charAt(0).toLowerCase() +
            requestParamName.slice(1);
          url = addParamToUrl(
            url,
            finalParamName,
            this.element.dataset[dataField]
          );
        }
      }
    });
    url = Services.urlReplacementsForDoc(this.element).expandUrlSync(url);
    this.getContext().adUrl = url;
    return url;
  }
}

const TAG = 'amp-ad-custom';

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdTemplate);
});
