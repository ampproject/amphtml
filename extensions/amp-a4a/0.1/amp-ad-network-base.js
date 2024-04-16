import {isLayoutSizeDefined} from '#core/dom/layout';
import {map} from '#core/types/object';

import {dev, devAssert} from '#utils/log';

import {FailureType, RecoveryModeType} from './amp-ad-type-defs';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

/**
 * @abstract
 */
export class AmpAdNetworkBase extends AMP.BaseElement {
  /**
   * Creates an instance of AmpAdNetworkBase.
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?Promise<!Response>} */
    this.adResponsePromise_ = null;

    /** @private {{[key: string]: !./amp-ad-type-defs.Validator}} */
    this.validators_ = map();

    /** @private {{[key: string]: !./amp-ad-type-defs.Renderer}} */
    this.renderers_ = map();

    /** @private {{[key: string]: string}} */
    this.recoveryModes_ = map();

    /** @const @private {!Object} */
    this.context_ = {};

    // Register default error modes.
    for (const failureType in FailureType) {
      this.recoveryModes_[failureType] = RecoveryModeType.COLLAPSE;
    }

    /**
     * Number of times to retry a failed request. Zero by default.
     * @type {number}
     */
    this.retryLimit_ = 0;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    if (!this.adResponsePromise_) {
      this.sendRequest_();
    }
  }

  /** @override */
  layoutCallback() {
    devAssert(
      this.adResponsePromise_,
      'layoutCallback invoked before XHR request!'
    );
    return this.adResponsePromise_
      .then((response) => this.invokeValidator_(response))
      .then((validatorResult) => this.invokeRenderer_(validatorResult))
      .catch((error) => this.handleFailure_(error.type, error.msg));
  }

  /**
   * @param {!FailureType} failure
   * @param {!RecoveryModeType} recovery
   * @final
   */
  onFailure(failure, recovery) {
    if (this.recoveryModes_[failure]) {
      dev().warn(
        TAG,
        `Recovery mode for failure type ${failure} already registered!`
      );
    }
    this.recoveryModes_[failure] = recovery;
  }

  /**
   * @param {!./amp-ad-type-defs.Validator} validator
   * @param {string=} type
   * @final
   */
  registerValidator(validator, type = 'default') {
    if (this.validators_[type]) {
      dev().warn(TAG, `${type} validator already registered.`);
    }
    this.validators_[type] = validator;
  }

  /**
   * @param {!./amp-ad-type-defs.Renderer} renderer
   * @param {string} type
   * @final
   */
  registerRenderer(renderer, type) {
    if (this.renderers_[type]) {
      dev().warn(TAG, `Rendering mode already registered for type '${type}'`);
    }
    this.renderers_[type] = renderer;
  }

  /**
   * @return {!Object} The context object passed to validators and renderers.
   */
  getContext() {
    return this.context_;
  }

  /**
   * @return {string} The finalized ad request URL.
   * @protected
   * @abstract
   */
  getRequestUrl() {
    // Subclass must override.
  }

  /** @param {number} retries */
  setRequestRetries(retries) {
    this.retryLimit_ = retries;
  }

  /**
   * Sends ad request.
   * @private
   */
  sendRequest_() {
    this.adResponsePromise_ = this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        const url = this.getRequestUrl();
        return sendXhrRequest(this.win, url);
      });
  }

  /**
   * Processes the ad response as soon as the XHR request returns.
   * @param {?Response} response
   * @return {!Promise}
   * @private
   */
  invokeValidator_(response) {
    if (!response.arrayBuffer) {
      return Promise.reject(this.handleFailure_(FailureType.INVALID_RESPONSE));
    }
    return response.arrayBuffer().then((unvalidatedBytes) => {
      const validatorType =
        response.headers.get('AMP-Ad-Response-Type') || 'default';
      devAssert(this.validators_[validatorType], 'Validator never registered!');
      return this.validators_[validatorType]
        .validate(
          this.context_,
          this.element,
          unvalidatedBytes,
          response.headers
        )
        .catch((err) =>
          Promise.reject({type: FailureType.VALIDATOR_ERROR, msg: err})
        );
    });
  }

  /**
   * @param {!./amp-ad-type-defs.ValidatorOutput} validatorOutput
   * @return {!Promise}
   * @private
   */
  invokeRenderer_(validatorOutput) {
    const renderer = this.renderers_[validatorOutput.type];
    devAssert(renderer, 'Renderer for AMP creatives never registered!');
    return renderer
      .render(this.context_, this.element, validatorOutput.creativeData)
      .catch((err) =>
        Promise.reject({type: FailureType.RENDERER_ERROR, msg: err})
      );
  }

  /**
   * @param {FailureType} failureType
   * @param {*=} error
   * @private
   */
  handleFailure_(failureType, error) {
    const recoveryMode = this.recoveryModes_[failureType];
    if (error) {
      dev().warn(TAG, error);
    }
    switch (recoveryMode) {
      case RecoveryModeType.COLLAPSE:
        this.forceCollapse_();
        break;
      case RecoveryModeType.RETRY:
        if (this.retryLimit_--) {
          this.sendRequest_();
        }
        break;
      default:
        dev().error(TAG, 'Invalid recovery mode!');
    }
  }

  /**
   * Collapses slot by setting its size to 0x0.
   * @private
   */
  forceCollapse_() {
    this.attemptChangeSize(0, 0);
  }
}
