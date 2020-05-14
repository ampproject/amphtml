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
import {getSocialConfig} from './amp-social-share-config';
import {isObject} from '../../../src/types';
import {openWindowDialog} from '../../../src/dom';
import {useResourcesNotify} from '../../../src/preact/utils';

const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 44;
const NAME = 'SocialShare';
/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function SocialShare(props) {
  useResourcesNotify();
  const {typeConfig, baseEndpoint, checkedWidth, checkedHeight} = checkProps(
    props
  );
  const finalEndpoint = createEndpoint(typeConfig, baseEndpoint, props);

  const type = props['type'].toUpperCase();
  const baseStyle = CSS.BASE_STYLE;
  const backgroundStyle = CSS[type] || CSS.DEFAULT;
  const size = {
    width: checkedWidth,
    height: checkedHeight,
  };
  return (
    <div
      role="button"
      tabindex={props['tabIndex'] || '0'}
      onKeyDown={(e) => handleKeyPress(e, finalEndpoint)}
      onClick={() => handleActivation(finalEndpoint)}
      style={{...size, ...props['style']}}
      {...props}
    >
      <SocialShareIcon
        style={{...backgroundStyle, ...baseStyle, ...size}}
        type={type}
      />
    </div>
  );
}

/**
 * @param {!JsonObject} props
 * @return {{
 *   typeConfig: !JsonObject,
 *   baseEndpoint: ?string,
 *   checkedWidth: ?number,
 *   checkedHeight: ?number,
 * }}
 */
function checkProps(props) {
  const {
    'type': type,
    'shareEndpoint': shareEndpoint,
    'params': params,
    'bindings': bindings,
    'width': width,
    'height': height,
  } = props;

  // Verify type is provided
  if (type === undefined) {
    throw new Error(`The type attribute is required. ${NAME}`);
  }

  // bindings and params props must be objects
  if (params && !isObject(params)) {
    throw new Error(`The params property should be an object. ${NAME}`);
  }
  if (bindings && !isObject(bindings)) {
    throw new Error(`The bindings property should be an object. ${NAME}`);
  }

  // User must provide shareEndpoint if they choose a type that is not
  // pre-configured
  const typeConfig = getSocialConfig(type) || dict();
  const baseEndpoint = typeConfig['shareEndpoint'] || shareEndpoint;
  if (baseEndpoint === undefined) {
    throw new Error(
      `A shareEndpoint is required if not using a pre-configured type. ${NAME}`
    );
  }

  const checkedWidth = width || DEFAULT_WIDTH;
  const checkedHeight = height || DEFAULT_HEIGHT;
  return {
    typeConfig,
    baseEndpoint,
    checkedWidth,
    checkedHeight,
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
 * @param {!JsonObject} typeConfig
 * @param {?string} baseEndpoint
 * @param {!JsonObject} props
 * @return {?string}
 */
function createEndpoint(typeConfig, baseEndpoint, props) {
  const {'params': params, 'bindings': bindings} = props;
  const combinedParams = {...typeConfig['defaultParams'], ...params};
  const endpointWithParams = addParamsToUrl(
    /** @type {string} */ (baseEndpoint),
    /** @type {!JsonObject} */ (combinedParams)
  );

  const combinedBindings = dict();
  const bindingVars = typeConfig['bindings'];
  if (bindingVars) {
    /** @type {Array<string>} */ (bindingVars).forEach((name) => {
      combinedBindings[name.toUpperCase()] = combinedParams[name] || '';
    });
  }
  if (bindings) {
    Object.keys(bindings).forEach((name) => {
      combinedBindings[name.toUpperCase()] = bindings[name] || '';
    });
  }
  const finalEndpoint = Object.keys(combinedBindings).reduce(
    (endpoint, binding) =>
      endpoint.replace(new RegExp(binding, 'g'), combinedBindings[binding]),
    endpointWithParams
  );
  return finalEndpoint;
}

/**
 * Opens a new window with the fully processed endpoint
 * @param {?string} finalEndpoint
 */
function handleActivation(finalEndpoint) {
  const protocol = finalEndpoint.split(':', 1)[0];
  const windowFeatures = 'resizable,scrollbars,width=640,height=480';
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
  } else if (protocol === 'sms') {
    openWindowDialog(
      window,
      finalEndpoint.replace('?', '?&'),
      '_blank',
      windowFeatures
    );
  } else {
    openWindowDialog(window, finalEndpoint, '_blank', windowFeatures);
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
 * @param {!Event} event
 * @param {?string} finalEndpoint
 */
function handleKeyPress(event, finalEndpoint) {
  const {key} = event;
  if (key == Keys.SPACE || key == Keys.ENTER) {
    event.preventDefault();
    handleActivation(finalEndpoint);
  }
}
