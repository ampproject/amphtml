import {Services} from '#service';
import {once} from '#core/types/function';
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
   */
  constructor(win) {
    /** @private @const {!Element} */
    this.storyElement_ = win.document.querySelector('amp-story');

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @const @type {function():(!Promise<!JsonObject>|!Promise<null>)} */
    this.loadShareConfig = once((element) => this.loadConfig(element));
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
   * @param  {!Element} element
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  getInlineConfig_(element) {
    try {
      return Promise.resolve(getChildJsonConfig(element));
    } catch (err) {
      return Promise.resolve(err);
    }
  }

  /**
   * Retrieves the config from and determines if
   * a remote or inline config will be used.
   * @param  {?Element} element
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  loadConfig(element) {
    if (!element) {
      return Promise.resolve();
    }
    if (element.hasAttribute(CONFIG_SRC_ATTRIBUTE_NAME)) {
      const rawUrl = element.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
      const credentials = element.getAttribute(CREDENTIALS_ATTRIBUTE_NAME);
      return this.executeRequest(
        rawUrl,
        credentials ? {credentials} : {}
      ).catch(() => this.getInlineConfig_(element));
    }

    return this.getInlineConfig_(element);
  }
}

/**
 * Util function to retrieve the request service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @return {!AmpStoryRequestService}
 */
export function getRequestService(win) {
  registerServiceBuilder(win, 'story-request', AmpStoryRequestService);
  return Services.storyRequestService(win);
}
