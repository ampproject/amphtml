import {Services} from '#service';
import {getChildJsonConfig} from '#core/dom';
import {isProtocolValid} from '../../../src/url';
import {registerServiceBuilder} from '../../../src/service-helpers';
import {user, userAssert} from '#utils/log';

/** @private @const {string} */
export const CONFIG_SRC_ATTRIBUTE_NAME = 'src';

/** @private const {string} */
export const CREDENTIALS_ATTRIBUTE_NAME = 'data-credentials';

/** @private @const {string} */
const TAG = 'amp-story-request-service';

/**
 * Service to send XHRs.
 */
export class AmpStoryRequestService {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement
   */
  constructor(win, storyElement) {
    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);
  }

  /**
   * @param {string} rawUrl
   * @param {Object=} opts
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  executeRequest(rawUrl, opts = {}) {
    if (!isProtocolValid(rawUrl)) {
      user().error(TAG, 'Invalid config url.');
      return Promise.resolve(null);
    }

    return Services.urlReplacementsForDoc(this.storyElement_)
      .expandUrlAsync(user().assertString(rawUrl))
      .then((url) => this.xhr_.fetchJson(url, opts))
      .then((response) => {
        userAssert(response.ok, 'Invalid HTTP response');
        return response.json();
      });
  }

  /**
   * Retrieves the inline config - will be called if
   * src attribute is invalid or not present.
   * @param  {!Element} configEl
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  getInlineConfig(configEl) {
    try {
      return Promise.resolve(getChildJsonConfig(configEl));
    } catch (err) {
      return Promise.resolve(err);
    }
  }

  /**
   * Retrieves the config from and determines if
   * src (remote) or inline config will be used.
   * @param  {?Element} element
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  loadConfigImpl(element) {
    if (!element) {
      return Promise.resolve();
    }

    if (element.hasAttribute(CONFIG_SRC_ATTRIBUTE_NAME)) {
      const rawUrl = element.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
      const credentials = element.getAttribute(CREDENTIALS_ATTRIBUTE_NAME);
      return this.executeRequest(
        rawUrl,
        credentials ? {credentials} : {}
      ).catch(() => this.getInlineConfig(element));
    }

    return this.getInlineConfig(element);
  }
}

/**
 * Util function to retrieve the request service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @param  {!Element} storyEl
 * @return {!AmpStoryRequestService}
 */
export const getRequestService = (win, storyEl) => {
  let service = Services.storyRequestService(win);

  if (!service) {
    service = new AmpStoryRequestService(win, storyEl);
    registerServiceBuilder(win, 'story-request', function () {
      return service;
    });
  }

  return service;
};
