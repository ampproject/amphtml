import {Keys_Enum} from '#core/constants/key-codes';
import {parseQueryString} from '#core/types/string/url';

import * as Preact from '#preact';
import {Wrapper} from '#preact/component';
import {tabindexFromProps, useResourcesNotify} from '#preact/utils';

import {useStyles} from './component.jss';
import {getSocialConfig} from './social-share-config';
import {BentoSocialShareIcon} from './social-share-svgs';

import {openWindowDialog} from '../../../../open-window-dialog';
import {addParamsToUrl} from '../../../../url';

const NAME = 'BentoSocialShare';
const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 44;
const DEFAULT_TARGET = '_blank';
const WINDOW_FEATURES = 'resizable,scrollbars,width=640,height=480';

/**
 * @param {!BentoSocialShareDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoSocialShare({
  background,
  children,
  color,
  endpoint,
  height,
  params,
  style,
  target,
  type,
  width,
  ...rest
}) {
  useResourcesNotify();
  const classes = useStyles();
  const checkPropsReturnValue = checkProps(
    type,
    endpoint,
    target,
    width,
    height,
    params
  );

  // Early exit if checkProps did not pass
  if (!checkPropsReturnValue) {
    return null;
  }

  const {checkedHeight, checkedTarget, checkedWidth, finalEndpoint} =
    checkPropsReturnValue;

  return (
    <Wrapper
      {...rest}
      role="button"
      tabindex={tabindexFromProps(rest)}
      onKeyDown={(e) => handleKeyPress(e, finalEndpoint, checkedTarget)}
      onClick={() => handleActivation(finalEndpoint, checkedTarget)}
      wrapperStyle={{
        width: checkedWidth,
        height: checkedHeight,
        ...style,
      }}
      part="button"
      wrapperClassName={classes.button}
    >
      {processChildren(
        /** @type {string} */ (type),
        children,
        color,
        background
      )}
    </Wrapper>
  );
}

/**
 * If children exist, render the children instead of the icon.  Otherwise,
 * render the icon associated with the specified type with specified color
 * and background (or defaults if not specified).
 * @param {string} type
 * @param {?PreactDef.Renderable|undefined} children
 * @param {string|undefined} color
 * @param {string|undefined} background
 * @return {PreactDef.Renderable}
 */
function processChildren(type, children, color, background) {
  if (children) {
    return children;
  } else {
    const typeConfig = getSocialConfig(type) || {};
    const iconStyle = {
      'color': color || typeConfig.defaultColor,
      'backgroundColor': background || typeConfig.defaultBackgroundColor,
    };
    return (
      <BentoSocialShareIcon
        style={{
          ...iconStyle,
          width: '100%',
          height: '100%',
        }}
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
 * @return {?{
 *   finalEndpoint: string,
 *   checkedWidth: (number|string),
 *   checkedHeight: (number|string),
 *   checkedTarget: string,
 * }}
 */
function checkProps(type, endpoint, target, width, height, params) {
  // User must provide endpoint if they choose a type that is not
  // pre-configured, early exit if not provided
  const typeConfig = getSocialConfig(/** @type {string} */ (type)) || {};
  let baseEndpoint = endpoint || typeConfig.shareEndpoint;
  if (baseEndpoint === undefined) {
    displayWarning(
      `An endpoint is required if not using a pre-configured type. ${NAME}`
    );
    return null;
  }

  // TODO: This logic might be duplicated in the AMP component
  // https://github.com/ampproject/amphtml/issues/36777
  const currentParams = Object.entries(typeConfig.defaultParams || {}).reduce(
    (newParams, [key, value]) => {
      if (newParams[key]) {
        return newParams;
      }
      return {
        ...newParams,
        [key]: value
          .replace('TITLE', document.title)
          .replace(
            'CANONICAL_URL',
            document.querySelector("link[rel='canonical']")?.href ||
              location.href
          ),
      };
    },
    params || {}
  );

  // Special case when type is 'email'
  if (type === 'email' && !endpoint) {
    baseEndpoint = `mailto:${currentParams['recipient'] || ''}`;
  }

  // Add params to baseEndpoint
  const finalEndpoint = addParamsToUrl(
    /** @type {string} */ (baseEndpoint),
    /** @type {!JsonObject} */ (currentParams)
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
function displayWarning(message) {
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
        displayWarning(`${e.message}. ${NAME}`);
      });
    } else {
      displayWarning(
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
  return (
    /** @type {boolean} */ window &&
    window.navigator &&
    window.navigator.userAgent &&
    window.navigator.userAgent.search(/iPhone|iPad|iPod/i) >= 0
  );
}

/**
 * @param {!Event} event
 * @param {?string} finalEndpoint
 * @param {string} target
 */
function handleKeyPress(event, finalEndpoint, target) {
  const {key} = event;
  if (key == Keys_Enum.SPACE || key == Keys_Enum.ENTER) {
    event.preventDefault();
    handleActivation(finalEndpoint, target);
  }
}
