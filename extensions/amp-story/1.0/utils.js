import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {
  closestAncestorElementBySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {setStyle, toggle} from '#core/dom/style';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {StateProperty} from './amp-story-store-service';

import {getMode} from '../../../src/mode';
import {createShadowRoot} from '../../../src/shadow-embed';

/**
 * Returns millis as number if given a string(e.g. 1s, 200ms etc)
 * @param {string} time
 * @param {number=} fallbackMs Used when `time` is not a valid time string.
 * @return {number|undefined}
 */
export function timeStrToMillis(time, fallbackMs = NaN) {
  const match = time.toLowerCase().match(/^([0-9\.]+)\s*(s|ms)$/);

  const num = match ? match[1] : undefined;
  const units = match ? match[2] : undefined;

  if (!match || match.length !== 3 || (units !== 's' && units !== 'ms')) {
    return fallbackMs;
  }

  return Math.round((units == 's' ? 1000 : 1) * parseFloat(num));
}

/**
 * Determines whether the specified element has an action for its on="tap:..."
 * handler.
 * @param {!Element} el
 * @return {boolean}
 */
export function hasTapAction(el) {
  // There are better ways to determine this, but they're all bound to action
  // service race conditions. This is good enough for our use case.
  return (
    el.hasAttribute('on') && !!el.getAttribute('on').match(/(^|;)\s*tap\s*:/)
  );
}

/**
 * Calculates a client rect without applying scaling transformations.
 * Note: must be run in a vsync measure context.
 * @param {!Element} el
 * @return {!ClientRect}
 */
export function unscaledClientRect(el) {
  const {height, left, top, width} = el./*OK*/ getBoundingClientRect();

  const scaleFactorX = width == 0 ? 1 : width / el./*OK*/ offsetWidth;
  const scaleFactorY = height == 0 ? 1 : height / el./*OK*/ offsetHeight;

  return /** @type {!ClientRect} */ ({
    left: left / scaleFactorX,
    top: top / scaleFactorY,
    width: width / scaleFactorX,
    height: height / scaleFactorY,
  });
}

/**
 * Finds an amp-video/amp-audio ancestor.
 * @param {!Element} el
 * @return {?AmpElement}
 */
export function ampMediaElementFor(el) {
  return closestAncestorElementBySelector(el, 'amp-video, amp-audio');
}

/**
 * Creates a shadow root for the provided container, and appends the element
 * along with its CSS.
 * @param  {!Element} container
 * @param  {!Element} element
 * @param  {string} css
 * @return {!Element}
 */
export function createShadowRootWithStyle(container, element, css) {
  const style = self.document.createElement('style');
  style./*OK*/ textContent = css;

  const containerToUse = getMode().test
    ? container
    : createShadowRoot(container);

  containerToUse.appendChild(style);
  containerToUse.appendChild(element);
  return container;
}

/**
 * Parses the resolved CSS color property, that is always in the form of
 * `rgba(0, 0, 0, 1)` or `rgb(0, 0, 0)`, that can be retrieved using
 * `getComputedStyle`.
 * Returns an object containing the R, G, and B 8bit numbers.
 * @param  {string} cssValue
 * @return {!{[key: string]: number}}
 */
export function getRGBFromCssColorValue(cssValue) {
  const regexPattern = /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})/;

  if (!cssValue.match(regexPattern)) {
    user().error(
      'UTILS',
      'getRGBFromCssColorValue expects a parameter in ' +
        `the form of 'rgba(0, 0, 0, 1)' or 'rgb(0, 0, 0)' but got ${cssValue}`
    );
    // Returns a fallback value, to fail 'gracefully' in case a browser we don't
    // know about gave an unexpected value.
    return {r: 0, g: 0, b: 0};
  }

  const matches = regexPattern.exec(cssValue);

  return {
    r: Number(matches[1]),
    g: Number(matches[2]),
    b: Number(matches[3]),
  };
}

/**
 * Returns the color, either black or white, that has the best contrast ratio
 * against the provided RGB 8bit values.
 * @param  {!{[key: string]: number}} rgb  ie: {r: 0, g: 0, b: 0}
 * @return {string} '#fff' or '#000'
 */
export function getTextColorForRGB(rgb) {
  const {b, g, r} = rgb;
  // Calculates the relative luminance L.
  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
  const getLinearRGBValue = (x) => {
    // 8bit to sRGB.
    x /= 255;

    // Converts the gamma-compressed RGB values to linear RGB.
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };

  const linearR = getLinearRGBValue(r);
  const linearG = getLinearRGBValue(g);
  const linearB = getLinearRGBValue(b);

  const L = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;

  // Determines which one of the white and black text have a better contrast
  // ratio against the used background color.
  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
  // @TODO(gmajoulet): Improve the text color for high contrast ratio.
  // 1 is L for #FFF, and 0 is L for #000.
  // (1 + 0.05) / (L + 0.05) > (L + 0.05) / (0 + 0.05) toggles for L = 0.179.
  return L > 0.179 ? '#000' : '#FFF';
}

/**
 * Sets given attribute to the given element in next `mutate` phase.
 * @param {!AMP.BaseElement} elementImpl
 * @param {string} name
 * @param {string=} opt_value
 */
export function setAttributeInMutate(elementImpl, name, opt_value) {
  const value = opt_value || '';
  elementImpl.mutateElement(() => {
    elementImpl.element.setAttribute(name, value);
  });
}

/**
 * Removes given attribute from the given element in next `mutate` phase.
 * @param {!AMP.BaseElement} elementImpl
 * @param {string} name
 */
export function removeAttributeInMutate(elementImpl, name) {
  elementImpl.mutateElement(() => {
    elementImpl.element.removeAttribute(name);
  });
}

/**
 * @param {!Element} element
 * @param {string|!Location} url
 */
export function userAssertValidProtocol(element, url) {
  userAssert(
    Services.urlForDoc(element).isProtocolValid(url),
    'Unsupported protocol for URL %s',
    url
  );
}

/**
 * Gets the origin url for elements that display a url. It
 * trims the protocol prefix and returns only the hostname of the origin.
 * @param {!Element} element
 * @param {string} url
 * @return {string}
 */
export function getSourceOriginForElement(element, url) {
  const urlService = Services.urlForDoc(element);
  let parsed;
  try {
    parsed = urlService.parse(urlService.getSourceOrigin(url));
  } catch (_) {
    // Unknown path prefix in url.
    parsed = urlService.parse(url);
  }
  return parsed.hostname;
}

/**
 * Whether a Story should show the URL info dialog.
 * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
 * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
 * @return {boolean}
 */
export function shouldShowStoryUrlInfo(viewer, storeService) {
  if (!storeService.get(StateProperty.CAN_SHOW_STORY_URL_INFO)) {
    return false;
  }
  const showStoryUrlInfo = viewer.getParam('showStoryUrlInfo');
  return showStoryUrlInfo ? showStoryUrlInfo !== '0' : viewer.isEmbedded();
}

/**
 * Retrieves an attribute src from the <amp-story> element.
 * @param {!Element} element
 * @param {string} attribute
 * @param {string=} warn
 * @return {?string}
 */
export function getStoryAttributeSrc(element, attribute, warn) {
  const storyEl = dev().assertElement(
    closestAncestorElementBySelector(element, 'AMP-STORY')
  );
  const url = storyEl.getAttribute(attribute);
  if (!url) {
    if (warn) {
      user().warn(
        'AMP-STORY',
        `Expected ${attribute} attribute on <amp-story>`
      );
    }
    return null;
  }
  return Services.urlForDoc(storyEl).assertHttpsUrl(url, storyEl, attribute);
}

/**
 * The attribute name for text background color
 * @private @const {string}
 */
const TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME = 'data-text-background-color';

/**
 * The selector for text background color
 * @private @const {string}
 */
const TEXT_BACKGROUND_COLOR_SELECTOR = `[${TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME}]`;

/**
 * Styles text with a background color based on the value of
 * the data-text-background-color attribute
 * @param {!Element} element
 */
export function setTextBackgroundColor(element) {
  const elementsToUpgradeStyles = scopedQuerySelectorAll(
    element,
    TEXT_BACKGROUND_COLOR_SELECTOR
  );

  elementsToUpgradeStyles.forEach((el) => {
    const color = el.getAttribute(TEXT_BACKGROUND_COLOR_ATTRIBUTE_NAME);
    setStyle(el, 'background-color', color);
  });
}

/**
 * Click a clone of the anchor in the context of the light dom.
 * Used to apply linker logic on shadow-dom anchors.
 * @param {!Element} anchorElement
 * @param {!Element} domElement element from the light dom
 */
export function triggerClickFromLightDom(anchorElement, domElement) {
  const outerAnchor = anchorElement.cloneNode();
  toggle(outerAnchor, false);
  domElement.appendChild(outerAnchor);
  outerAnchor.click();
  outerAnchor.remove();
}

/**
 * Makes a proxy URL if document is served from a proxy origin. No-op otherwise.
 * @param {string} url
 * @param {!AmpDoc} ampDoc
 * @return {string}
 */
export const maybeMakeProxyUrl = (url, ampDoc) => {
  const urlService = Services.urlForDoc(ampDoc);
  const loc = ampDoc.win.location;
  if (!urlService.isProxyOrigin(loc.origin) || urlService.isProxyOrigin(url)) {
    return url;
  }
  const resolvedRelativeUrl = urlService.resolveRelativeUrl(
    url,
    urlService.getSourceOrigin(loc.href)
  );
  return loc.origin + '/i/s/' + resolvedRelativeUrl.replace(/https?:\/\//, '');
};

/**
 * Whether the document is transformed
 * @param {!AmpDoc} ampdoc
 * @return {boolean}
 */
export function isTransformed(ampdoc) {
  return ampdoc.getRootNode().documentElement.hasAttribute('transformed');
}

/**
 * Wrapper for classes that depend on story services being installed
 * so they can fetch the services synchronously. This allows the extension
 * to be installed on the doc as a script tag.
 *
 * @param {AMP.BaseElement.constructor} klass
 * @return {AMP.BaseElement.constructor}
 */
export function dependsOnStoryServices(klass) {
  return class extends AMP.BaseElement {
    /**
     * @override
     * @return {AMP.BaseElement|Promise<AMP.BaseElement>}
     */
    upgradeCallback() {
      const storyEl = closestAncestorElementBySelector(
        this.element,
        'amp-story'
      );
      if (!storyEl) {
        // Unit tests may mock or install the services internally, so
        // instantiating immediately allows us to test implementations without
        // placing the element inside an <amp-story>.
        // In reality, this would cause failures. This is okay since upgradable
        // elements are required to descend from an <amp-story>.
        return new klass(this.element);
      }
      return whenUpgradedToCustomElement(storyEl)
        .then(() => storyEl.getImpl())
        .then(() => new klass(this.element));
    }
  };
}

/**
 * Handles hiding or showing content from screen readers.
 * @param {!Element} el
 * @param {boolean} isVisible
 */
export function toggleA11yReadable(el, isVisible) {
  if (isVisible) {
    el.removeAttribute('tab-index');
    el.removeAttribute('aria-hidden');
  } else {
    el.setAttribute('tab-index', '-1');
    el.setAttribute('aria-hidden', 'true');
  }
}
