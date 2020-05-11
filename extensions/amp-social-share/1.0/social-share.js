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

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function SocialShare(props) {
  const name = 'SocialShare';
  useResourcesNotify();

  const {
    'typeConfig': typeConfig,
    'baseEndpoint': baseEndpoint,
    'checkedWidth': checkedWidth,
    'checkedHeight': checkedHeight,
  } = checkProps(props, name);
  const finalEndpoint = createEndpoint(typeConfig, baseEndpoint, props);

  /**
   * @private
   * @param {!JsonObject} typeConfig
   * @param {?string} baseEndpoint
   * @param {!JsonObject} props
   * @return {?string}
   */
  function createEndpoint(typeConfig, baseEndpoint, props) {
    const {params, bindings} = props;
    const combinedParams = dict();
    Object.assign(combinedParams, typeConfig['defaultParams'], params);
    const endpointWithParams = addParamsToUrl(baseEndpoint, combinedParams);

    const combinedBindings = dict();
    const bindingVars = typeConfig['bindings'];
    if (bindingVars) {
      bindingVars.forEach((name) => {
        combinedBindings[name.toUpperCase()] = params[name] || '';
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
   * @private
   */
  function handleActivation() {
    const protocol = finalEndpoint.split(':', 1)[0];
    const windowFeatures = 'resizable,scrollbars,width=640,height=480';
    if (protocol === 'navigator-share') {
      if (window && window.navigator && window.navigator.share) {
        const dataStr = finalEndpoint.substr(finalEndpoint.indexOf('?'));
        const data = parseQueryString(dataStr);
        window.navigator.share(data).catch((e) => {
          throwWarning(`${e.message}. ${name}`);
        });
      } else {
        throwWarning(
          `Could not complete system share.  Navigator unavailable. ${name}`
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
   * @private
   * @param {!Event} event
   */
  function handleKeyPress(event) {
    const {key} = event;
    if (key == Keys.SPACE || key == Keys.ENTER) {
      event.preventDefault();
      handleActivation();
    }
  }

  const type = props.type.toUpperCase();
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
      onKeyDown={handleKeyPress}
      onClick={handleActivation}
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
 * @param {?string} name
 * @return {!JsonObject}
 */
function checkProps(props, name) {
  const {type, shareEndpoint, params, bindings, width, height} = props;

  // Verify type is provided
  if (type === undefined) {
    throw new Error(`The type attribute is required. ${name}`);
  }

  // bindings and params props must be objects
  if (params && !isObject(params)) {
    throw new Error(`The params property should be an object. ${name}`);
  }
  if (bindings && !isObject(bindings)) {
    throw new Error(`The bindings property should be an object. ${name}`);
  }

  // User must provide shareEndpoint if they choose a type that is not
  // pre-configured
  const typeConfig = getSocialConfig(type) || dict();
  const baseEndpoint = typeConfig['shareEndpoint'] || shareEndpoint;
  if (baseEndpoint === undefined) {
    throw new Error(
      `A shareEndpoint is required if not using a pre-configured type. ${name}`
    );
  }

  // Verify width and height are valid integers
  // Silently assigns default for undefined, null
  // Throws Warning for booleans, strings, 0, negative numbers
  // No errors when positive integer or equivalent string
  let checkedWidth =
    width === null || width === undefined ? DEFAULT_WIDTH : width;
  let checkedHeight =
    height === null || height === undefined ? DEFAULT_HEIGHT : height;
  if (typeof checkedWidth === 'boolean' || !(Math.floor(checkedWidth) > 0)) {
    throwWarning(
      `The width property should be a positive integer of type Integer or String, defaulting to ${DEFAULT_WIDTH}. ${name}`
    );
    checkedWidth = DEFAULT_WIDTH;
  }
  if (typeof checkedHeight === 'boolean' || !(Math.floor(checkedHeight) > 0)) {
    throwWarning(
      `The height property should be a positive integer of type Integer or String, defaulting to ${DEFAULT_HEIGHT}. ${name}`
    );
    checkedHeight = DEFAULT_HEIGHT;
  }
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
  console.warn(message);
}
