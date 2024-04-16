import {setStyle} from '#core/dom/style';
import {isEnumValue} from '#core/types/enum';
import {dashToUnderline} from '#core/types/string';

import {devAssert} from '#utils/log';

import {loadScript} from './3p';

/** @const @enum {string} */
export const FacebookEmbedType = {
  // Allows users to comment on the embedded content using their Facebook
  // accounts. Correlates to amp-facebook-comments.
  COMMENTS: 'comments',
  LIKE: 'like',
  PAGE: 'page',
  POST: 'post',
  VIDEO: 'video',
};

/**
 * Produces the Facebook SDK object for the passed in callback.
 *
 * Note: Facebook SDK fails to render multiple plugins when the SDK is only
 * loaded in one frame. To Allow the SDK to render them correctly we load the
 * script per iframe.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 * @param {string} locale
 */
function getFacebookSdk(global, cb, locale) {
  loadScript(
    global,
    'https://connect.facebook.net/' + locale + '/sdk.js',
    () => {
      cb(global.FB);
    }
  );
}

/**
 * Create DOM element for all Facebook embeds.
 * @param {!Window} global
 * @param {string} classNameSuffix The suffix for the `fb-` class.
 * @param {string} href
 * @return {!Element} div
 */
function createContainer(global, classNameSuffix, href) {
  const container = global.document.createElement('div');
  container.className = 'fb-' + classNameSuffix;
  container.setAttribute('data-href', href);
  return container;
}

/**
 * Create DOM element for the Facebook embedded content plugin for posts.
 * @see https://developers.facebook.com/docs/plugins/embedded-posts
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPostContainer(global, data) {
  if (data.alignCenter) {
    const c = global.document.getElementById('c');
    setStyle(c, 'text-align', 'center');
  }
  return createContainer(global, 'post', data.href);
}

/**
 * Create DOM element for the Facebook embedded content plugin for videos.
 * @see https://developers.facebook.com/docs/plugins/embedded-video-player
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getVideoContainer(global, data) {
  const container = createContainer(global, 'video', data.href);
  // If the user hasn't set the `data-embed-as` attribute and the provided href
  // is a video, Force the `data-embed-as` attribute to 'video' and make sure
  // to show the post's text.
  if (!data.embedAs) {
    container.setAttribute('data-embed-as', 'video');
    // Since 'data-embed-as="video"' disables post text, setting the
    // 'data-show-text' to 'true' enables the ability to see the text (changed
    // from the default 'false')
    container.setAttribute('data-show-text', 'true');
  }
  return container;
}

/**
 * Gets the default type to embed as, if not specified.
 * @param {string} href
 * @return {string}
 */
function getDefaultEmbedAs(href) {
  return href.match(/\/videos\/\d+\/?$/) ? 'video' : 'post';
}

/**
 * Create DOM element for the Facebook embedded page plugin.
 * Reference: https://developers.facebook.com/docs/plugins/page-plugin
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPageContainer(global, data) {
  const container = createContainer(global, 'page', data.href);
  container.setAttribute('data-tabs', data.tabs);
  container.setAttribute('data-hide-cover', data.hideCover);
  container.setAttribute('data-show-facepile', data.showFacepile);
  container.setAttribute('data-hide-cta', data.hideCta);
  container.setAttribute('data-small-header', data.smallHeader);
  container.setAttribute('data-adapt-container-width', true);

  const c = global.document.getElementById('c');
  // Note: The facebook embed  allows a maximum width of 500px.
  // If the container's width exceeds that, the embed's width will
  // be clipped to 500px.
  container.setAttribute('data-width', c./*OK*/ offsetWidth);
  return container;
}

/**
 * Create DOM element for the Facebook comments plugin:
 * Reference: https://developers.facebook.com/docs/plugins/comments
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getCommentsContainer(global, data) {
  const container = createContainer(global, 'comments', data.href);
  container.setAttribute('data-numposts', data.numposts || 10);
  container.setAttribute('data-colorscheme', data.colorscheme || 'light');
  container.setAttribute('data-order-by', data.orderBy || 'social');
  container.setAttribute('data-width', '100%');
  return container;
}

/**
 * Create DOM element for the Facebook like-button plugin:
 * Reference: https://developers.facebook.com/docs/plugins/like-button
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getLikeContainer(global, data) {
  const container = createContainer(global, 'like', data.href);
  container.setAttribute('data-action', data.action || 'like');
  container.setAttribute('data-colorscheme', data.colorscheme || 'light');
  container.setAttribute('data-kd_site', data.kd_site || 'false');
  container.setAttribute('data-layout', data.layout || 'standard');
  container.setAttribute('data-ref', data.ref || '');
  container.setAttribute('data-share', data.share || 'false');
  container.setAttribute('data-show_faces', data.show_faces || 'false');
  container.setAttribute('data-size', data.size || 'small');
  return container;
}

/**
 * Create DOM element for the Facebook embedded content plugin.
 * @param {!Window} global
 * @param {!Object} data The element data
 * @param {string} embedAs
 * @return {!Element} div
 */
function getEmbedContainer(global, data, embedAs) {
  devAssert(isEnumValue(FacebookEmbedType, embedAs));
  switch (embedAs) {
    case FacebookEmbedType.PAGE:
      return getPageContainer(global, data);
    case FacebookEmbedType.LIKE:
      return getLikeContainer(global, data);
    case FacebookEmbedType.COMMENTS:
      return getCommentsContainer(global, data);
    case FacebookEmbedType.VIDEO:
      return getVideoContainer(global, data);
    default:
      return getPostContainer(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function facebook(global, data) {
  const container = getEmbedContainer(
    global,
    data,
    data.embedAs || getDefaultEmbedAs(data.href)
  );
  global.document.getElementById('c').appendChild(container);

  getFacebookSdk(
    global,
    (FB) => {
      // Dimensions are given by the parent frame.
      delete data.width;
      delete data.height;

      FB.Event.subscribe('xfbml.resize', (event) => {
        context.updateDimensions(
          parseInt(event.width, 10),
          parseInt(event.height, 10) + /* margins */ 20
        );
      });

      FB.init({xfbml: true, version: 'v17.0'});

      // Report to parent that the SDK has loaded and is ready to paint
      const message = JSON.stringify({
        'action': 'ready',
      });
      global.parent./*OK*/ postMessage(message, '*');
    },
    data.locale ? data.locale : dashToUnderline(window.navigator.language)
  );
}
