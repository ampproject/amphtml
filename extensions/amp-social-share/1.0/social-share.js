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

import * as CSS from './social-share.css';
import * as Preact from '../../../src/preact';
import {Keys} from '../../../src/utils/key-codes';
import {SocialShareIcon} from '../../../third_party/optimized-svg-icons/social-share-svgs';
import {addParamsToUrl, parseQueryString} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {getSocialConfig} from './social-share-config';
import {openWindowDialog} from '../../../src/dom';
import {useResourcesNotify} from '../../../src/preact/utils';

const NAME = 'SocialShare';
const DEFAULT_WIDTH = '60';
const DEFAULT_HEIGHT = '44';
const DEFAULT_TARGET = '_blank';
const WINDOW_FEATURES = 'resizable,scrollbars,width=640,height=480';

/**
 * @param {!SocialShareProps} props
 * @return {PreactDef.Renderable}
 */
export function SocialShare({
  type,
  endpoint,
  params,
  target,
  width,
  height,
  color,
  background,
  tabIndex,
  style,
  children,
}) {
  useResourcesNotify();
  const {
    finalEndpoint,
    checkedWidth,
    checkedHeight,
    checkedTarget,
  } = checkProps(type, endpoint, target, width, height, params);

  const size = dict({
    'width': checkedWidth,
    'height': checkedHeight,
  });

  return (
    <div
      role="button"
      tabindex={tabIndex || '0'}
      onKeyDown={(e) => handleKeyPress(e, finalEndpoint, checkedTarget)}
      onClick={() => handleActivation(finalEndpoint, checkedTarget)}
      style={{...size, ...style}}
    >
      {processChildren(type, children, color, background, size)}
    </div>
  );
}

/**
 * If the specified type 'canCustomize' (see config file), allow children
 * to be rendered and color / background to be passed in via props.  If the
 * specified type cannot be customized (canCustomize = false), children
 * will not be rendered and color / background will always be set to default
 * values.
 * @param  {?string}               type
 * @param  {?PreactDef.Renderable} children
 * @param  {?string}               color
 * @param  {?string}               background
 * @param  {JsonObject}            size
 * @return {PreactDef.Renderable}
 */
function processChildren(type, children, color, background, size) {
  if (children) {
    return children;
  } else {
    const typeConfig = getSocialConfig(type) || {};
    const baseStyle = CSS.BASE_STYLE;
    const iconStyle = dict({
      'color': color || typeConfig.defaultColor,
      'backgroundColor': background || typeConfig.defaultBackgroundColor,
    });
    return (
      <SocialShareIcon
        style={{...iconStyle, ...baseStyle, ...size}}
        type={type.toUpperCase()}
      />
    );
  }
}

/**
 * @param {?string}                     type
 * @param {?string}                     endpoint
 * @param {?string}                     target
 * @param {?string}                     width
 * @param {?string}                     height
 * @param {JsonObject|Object|undefined} params
 * @return {{
 *   finalEndpoint: string,
 *   checkedWidth: string,
 *   checkedHeight: string,
 *   checkedTarget: string,
 * }}
 */
function checkProps(type, endpoint, target, width, height, params) {
  // Verify type is provided
  if (type === undefined) {
    throw new Error(`The type attribute is required. ${NAME}`);
  }

  // User must provide endpoint if they choose a type that is not
  // pre-configured
  const typeConfig = getSocialConfig(type) || {};
  let baseEndpoint = endpoint || typeConfig.shareEndpoint;
  if (baseEndpoint === undefined) {
    throw new Error(
      `An endpoint is required if not using a pre-configured type. ${NAME}`
    );
  }

  // Special case when type is 'email'
  if (type === 'email' && !endpoint) {
    baseEndpoint = `mailto:${(params && params['recipient']) || ''}`;
  }

  // Add params to baseEndpoint
  const finalEndpoint = addParamsToUrl(
    /** @type {string} */ (baseEndpoint),
    /** @type {!JsonObject} */ (params)
  );

  // Defaults
  const checkedWidth = width || DEFAULT_WIDTH;
  const checkedHeight = height || DEFAULT_HEIGHT;
  const checkedTarget = target || DEFAULT_TARGET;

  return {
    finalEndpoint,
    checkedWidth,
    checkedHeight,
    checkedTarget,
  };
}

/**
 * @param {?string} message
 */
function throwWarning(message) {
  console /*OK*/
    .warn(message);
}

/**
 * Opens a new window with the fully processed endpoint
 * @param {?string} finalEndpoint
 * @param {string}  target
 */
function handleActivation(finalEndpoint, target) {
  const protocol = finalEndpoint.split(':', 1)[0];

  if (protocol === 'navigator-share') {
    if (window && window.navigator && window.navigator.share) {
      const data = parseQueryString(
        /** @type {string} */ (getQueryString(finalEndpoint))
      );
      window.navigator.share(data).catch((e) => {
        throwWarning(`${e.message}. ${NAME}`);
      });
    } else {
      throwWarning(
        `Could not complete system share.  Navigator unavailable. ${NAME}`
      );
    }
  } else if (protocol === 'sms' || protocol === 'mailto') {
    openWindowDialog(
      window,
      protocol === 'sms' ? finalEndpoint.replace('?', '?&') : finalEndpoint,
      isIos() ? '_top' : target,
      WINDOW_FEATURES
    );
  } else {
    openWindowDialog(window, finalEndpoint, target, WINDOW_FEATURES);
  }
}

/**
 * Returns the Query String of a full url, will not include # parameters
 * @param {?string} endpoint
 * @return {?string}
 */
function getQueryString(endpoint) {
  let q = endpoint.indexOf('?');
  let h = endpoint.indexOf('#');
  q = q === -1 ? endpoint.length : q;
  h = h === -1 ? endpoint.length : h;
  return endpoint.slice(q, h);
}

/**
 * Checks whether or not the userAgent of the current device indicates that
 * this is an Ios device.  Checked for 'mailto:' and 'sms:' protocols which
 * break when opened in _blank on iOS Safari.
 * @return {boolean}
 */
function isIos() {
  return /** @type {boolean} */ (window &&
    window.navigator &&
    window.navigator.userAgent &&
    window.navigator.userAgent.search(/iPhone|iPad|iPod/i) >= 0);
}

/**
 * @param {!Event}  event
 * @param {?string} finalEndpoint
 * @param {string}  target
 */
function handleKeyPress(event, finalEndpoint, target) {
  const {key} = event;
  if (key == Keys.SPACE || key == Keys.ENTER) {
    event.preventDefault();
    handleActivation(finalEndpoint, target);
  }
}
