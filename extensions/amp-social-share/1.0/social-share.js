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
const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 44;
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
  tabIndex = 0,
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
      tabindex={tabIndex}
      onKeyDown={(e) => handleKeyPress(e, finalEndpoint, checkedTarget)}
      onClick={() => handleActivation(finalEndpoint, checkedTarget)}
      style={{...size, ...style}}
    >
      {processChildren(type, children, color, background, size)}
    </div>
  );
}

/**
 * If children exist, render the children instead of the icon.  Otherwise,
 * render the icon associated with the specified type with specified color
 * and background (or defaults if not specified).
 * @param {string|undefined} type
 * @param {?PreactDef.Renderable|undefined} children
 * @param {string|undefined} color
 * @param {string|undefined} background
 * @param {JsonObject} size
 * @return {PreactDef.Renderable}
 */
function processChildren(type, children, color, background, size) {
  if (children) {
    return children;
  } else {
    const typeConfig = getSocialConfig(/** @type {string} */ (type)) || {};
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
 * Verify required props and throw error if necessary.  Set default values
 * for optional props if no value specified.
 * @param {string|undefined} type
 * @param {string|undefined} endpoint
 * @param {string|undefined} target
 * @param {number|string|undefined} width
 * @param {number|string|undefined} height
 * @param {JsonObject|Object|undefined} params
 * @return {{
 *   finalEndpoint: string,
 *   checkedWidth: (number|string),
 *   checkedHeight: (number|string),
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
  const typeConfig = getSocialConfig(/** @type {string} */ (type)) || {};
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
 * @param {string} target
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
 * @param {!Event} event
 * @param {?string} finalEndpoint
 * @param {string} target
 */
function handleKeyPress(event, finalEndpoint, target) {
  const {key} = event;
  if (key == Keys.SPACE || key == Keys.ENTER) {
    event.preventDefault();
    handleActivation(finalEndpoint, target);
  }
}
