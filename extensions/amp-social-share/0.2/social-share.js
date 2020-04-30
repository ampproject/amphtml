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
export function SocialShare2(props) {
  const name = 'SocialShare2';
  useResourcesNotify();

  const {
    typeConfig,
    baseEndpoint,
    checkedWidth,
    checkedHeight,
    obsoleteType,
  } = checkProps_(props, name);
  if (obsoleteType) {
    return;
  }
  const finalEndpoint = createEndpoint_(typeConfig, baseEndpoint, props);

  /**
   * @private
   * @param {!JsonObject} props
   * @param {?string} name
   * @return {!JsonObject}
   */
  function checkProps_(props, name) {
    const {type, shareEndpoint, params, bindings, width, height} = props;

    // Verify type is valid and cannot contain spaces
    if (type === undefined) {
      throwError_(`The type attribute is required. ${name}`);
    }
    if (/\s/.test(type)) {
      throwError_(
        `Space characters are not allowed in type attribute value. ${name}`
      );
    }

    // bindings and params props must be objects
    if (params && !isObject(params)) {
      throwError_(`The params property should be an object. ${name}`);
    }
    if (bindings && !isObject(bindings)) {
      throwError_(`The bindings property should be an object. ${name}`);
    }

    // User must provide shareEndpoint if they choose a type that is not
    // pre-configured
    const typeConfig = getSocialConfig(type) || dict();
    const baseEndpoint = typeConfig['shareEndpoint'] || shareEndpoint;
    if (baseEndpoint === undefined) {
      throwError_(
        `A shareEndpoint is required if not using a pre-configured type. ${name}`
      );
    }

    // Throw warning if type is obsolete
    const obsoleteType = typeConfig['obsolete'];
    if (obsoleteType) {
      throwWarning_(`Skipping obsolete share button ${type}. ${name}`);
    }

    // Verify width and height are valid integers
    let checkedWidth = width || DEFAULT_WIDTH;
    let checkedHeight = height || DEFAULT_HEIGHT;
    if (width && !Number.isInteger(width)) {
      throwWarning_(
        `The width property should be an Integer, defaulting to ${DEFAULT_WIDTH}. ${name}`
      );
      checkedWidth = DEFAULT_WIDTH;
    }
    if (height && !Number.isInteger(height)) {
      throwWarning_(
        `The height property should be an Integer, defaulting to ${DEFAULT_HEIGHT}. ${name}`
      );
      checkedHeight = DEFAULT_HEIGHT;
    }
    return {
      typeConfig,
      baseEndpoint,
      checkedWidth,
      checkedHeight,
      obsoleteType,
    };
  }

  /**
   * @private
   * @param {!JsonObject} typeConfig
   * @param {?string} baseEndpoint
   * @param {!JsonObject} props
   * @return {?string}
   */
  function createEndpoint_(typeConfig, baseEndpoint, props) {
    const {params, bindings} = props;
    const combinedParams = dict();
    Object.assign(combinedParams, typeConfig['defaultParams'], params);
    const endpointWithParams = addParamsToUrl(baseEndpoint, combinedParams);

    const combinedBindings = dict();
    const bindingVars = typeConfig['bindings'];
    if (bindingVars) {
      bindingVars.forEach((name) => {
        combinedBindings[name.toUpperCase()] = params[name] ? params[name] : '';
      });
    }
    if (bindings) {
      Object.keys(bindings).forEach((name) => {
        combinedBindings[name.toUpperCase()] = bindings[name]
          ? bindings[name]
          : '';
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
   * @param {?string} message
   */
  function throwError_(message) {
    throw new Error(message);
  }

  /**
   * @private
   * @param {?string} message
   */
  function throwWarning_(message) {
    console.warn(message);
  }

  /**
   * @private
   */
  function handleActivation_() {
    if (finalEndpoint.split(':', 1)[0] === 'navigator-share') {
      if (window && window.navigator && window.navigator.share) {
        const dataStr = finalEndpoint.substr(finalEndpoint.indexOf('?'));
        const data = parseQueryString(dataStr);
        window.navigator.share(data).catch((e) => {
          throwWarning_(`${e.message}. ${name}`);
        });
      } else {
        throwWarning_(
          `Could not complete system share.  Navigator unavailable. ${name}`
        );
      }
    } else {
      const windowFeatures = 'resizable,scrollbars,width=640,height=480';
      openWindowDialog(window, finalEndpoint, '_blank', windowFeatures);
    }
  }

  /**
   * @private
   * @param {!Event} event
   */
  function handleKeyPress_(event) {
    const {key} = event;
    if (key == Keys.SPACE || key == Keys.ENTER) {
      event.preventDefault();
      handleActivation_();
    }
  }

  const {type} = props;
  const baseStyle = CSS.BASE_STYLE;
  //Default to gray (d3d3d3) background if type is not preconfigured
  const backgroundStyle = CSS[type.toUpperCase()] || {
    'backgroundColor': 'd3d3d3',
  };
  const size = {
    width: checkedWidth,
    height: checkedHeight,
  };
  return (
    <div
      role="button"
      tabindex={props['tabIndex'] || '0'}
      onKeyDown={handleKeyPress_}
      onClick={handleActivation_}
      style={{...size, ...props['style']}}
      {...props}
    >
      <SocialShareIcon
        style={{...backgroundStyle, ...baseStyle, ...size}}
        type={type.toUpperCase()}
      />
    </div>
  );
}
