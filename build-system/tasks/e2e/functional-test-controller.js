/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * A wrapper class that allows client code to own references to
 * framework-specific element handles, but which does not expose any of the
 * framework-specific methods on that element.
 *
 * @template T
 * @public
 */
class ElementHandle {
  /**
   * Wrap the framework-specific element handle object.
   * @param {!T} element
   * @param {!T} unusedController
   * @package
   */
  constructor(element, unusedController) {
    /** @private */
    this.element_ = element;
  }

  /**
   * Unwrap the framework-specific element handle object.
   * @return {!T}
   * @package
   */
  getElement() {
  	return this.element_;
  }
}

/**
 * Allow expectations to await the expected value. Duck-type a real Promise.
 * This class, and its waitForValue member function, are necessary because
 * to behave like a Promise and to wait for the correct value from the
 * Browser Automation Framework, the onFulfilled chains need to propagate into
 * the new values that come from the browser.
 *
 * @template TYPE
 * @extends {Promise}
 */
class ControllerPromise {
  /**
   * @param {function(function(?TYPE):void, function(*):void):void|!Promise<TYPE>} executorOrPromise
   * @param {function(TYPE,function(TYPE): ?TYPE): !Promise=} opt_waitForValue
   */
  constructor(executorOrPromise, opt_waitForValue) {
    this.promise_ = typeof executorOrPromise == 'function' ?
      new Promise(executorOrPromise) :
      executorOrPromise;

    /**
     * Returns a Promise that resolves when the given expected value fulfills
     * the given condition.
     * @param {function(TYPE): ?TYPE} condition
     * @return {!Promise<?TYPE>}
     */
    this.waitForValue = opt_waitForValue;
  }

  /** @override */
  catch(onRejected) {
    return new ControllerPromise(
        this.promise_.catch(onRejected),
        this.waitForValue);
  }

 	/** @override */
  finally(onFinally) {
    return new ControllerPromise(
        this.promise_.finally(onFinally),
        this.waitForValue);
  }

  /** @override */
  then(opt_onFulfilled, opt_onRejected) {
    opt_onFulfilled = opt_onFulfilled || (x => x);
    // Allow this and future `then`s to update the wait value.
    let wrappedWait = null;
    if (this.waitForValue) {
      wrappedWait = (condition, opt_mutate) => {
        opt_mutate = opt_mutate || (x => x);
        return this.waitForValue(condition, value =>
          opt_mutate(opt_onFulfilled(value)));
      };
    }

    return new ControllerPromise(
        this.promise_.then(opt_onFulfilled, opt_onRejected),
        wrappedWait);
  }
}

/** @interface */
class FunctionalTestController {
  /**
   * Navigates to the given URL.
   * {@link https://www.w3.org/TR/webdriver1/#navigate-to}

   * @param {string} unusedUrl
   * @return {!Promise}
   */
  async navigateTo(unusedUrl) {}

  /**
   * Retrieves the URL for the current page.
   * {@link https://www.w3.org/TR/webdriver1/#get-current-url}
   *
   * @return {!Promise<string>}
   */
  async getCurrentUrl() {}

  /**
   * Returns the document title.
   * {@link https://www.w3.org/TR/webdriver1/#get-title}
   *
   * @return {!Promise<string>}
   */
  async getTitle() {}

  /**
   * Selects the current top-level browsing context or a child browsing context
   * of the current browsing context to use as the current browsing context for
   * subsequent commands.
   * {@link https://www.w3.org/TR/webdriver1/#switch-to-frame}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {function():(!Promise|undefined)} unusedFn
   * @return {!Promise}
   */
  async usingFrame(unusedHandle, unusedFn) {}

  /**
   * Selects the current top-level browsing context or a child browsing context
   * of the current browsing context to use as the current browsing context for
   * subsequent commands.
   * {@link https://www.w3.org/TR/webdriver1/#switch-to-frame}
   *
   * @param {!ElementHandle} unusedHandle
   * @return {!Promise}
   */
  async switchToFrame(unusedHandle) {}

  /**
   * Selects the current top-level browsing context or a child browsing context
   * of the current browsing context to use as the current browsing context for
   * subsequent commands.
   * {@link https://www.w3.org/TR/webdriver1/#switch-to-frame}
   *
   * @return {!Promise}
   */
  async switchToParent() {}

  /**
   * Gets the active element of the current browsing context’s document element.
   * {@link https://www.w3.org/TR/webdriver1/#get-active-element}
   *
   * @return {!Promise<!ElementHandle>}
   */
  async getActiveElement() {}

  /**
   * The Find Element command is used to find the first element matching the
   * given selector in the current browsing context that can be used as the
   * web element context for future element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#find-element}
   *
   * @param {string} unusedSelector
   * @return {!Promise<!ElementHandle>}
   */
  async findElement(unusedSelector) {}

  /**
   * The Find Elements command is used to find all elements matching the
   * given selector in the current browsing context that can be used as the
   * web element context for future element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#find-elements}
   *
   * @param {string} unusedSelector
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async findElements(unusedSelector) {}

  /**
   * Note: Use findElement instead where possible. CSS selectors are more
   * familiar to developers and easier to reason about. If you need to use
   * this method, a comment explaining the xpath query can be helpful.
   * The Find Element command is used to find the first element matching the
   * given xpath in the current browsing context that can be used as the
   * web element context for future element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#xpath}
   * {@link https://www.w3.org/TR/webdriver1/#find-element}
   *
   * @param {string} unusedXpath
   * @return {!Promise<!ElementHandle>}
   */
  async findElementXPath(unusedXpath) {}

  /**
   * Note: Use findElements instead where possible. CSS selectors are more
   * familiar to developers and easier to reason about. If you need to use
   * this method, a comment explaining the xpath query can be helpful.
   * The Find Elements command is used to find all elements matching the
   * given xpath in the current browsing context that can be used as the
   * web element context for future element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#xpath}
   * {@link https://www.w3.org/TR/webdriver1/#find-elements}
   *
   * @param {string} unusedXpath
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async findElementsXPath(unusedXpath) {}

  /**
   * The Find Element From Element command is used to find the first element
   * that is a descendent of the given element matching the given selector in
   * the current browsing context that can be used as the web element context
   * for future element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#find-element-from-element}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedSelector
   * @return {!Promise<!ElementHandle>}
   */
  async findElementFromElement(unusedHandle, unusedSelector) {}

  /**
   * The Find Elements command is used to find all elements that are descendents
   * of the given element matching the given selector in the current
   * browsing context that can be used as the web element context for future
   * element-centric commands.
   * {@link https://www.w3.org/TR/webdriver1/#find-elements-from-element}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedSelector
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async findElementsFromElement(unusedHandle, unusedSelector) {}

  /**
   * Determines if the referenced element is elected or not.
   * This operation only makes sense on input elements of the Checkbox- and
   * Radio Button states, or on option elements.
   * {@link https://www.w3.org/TR/webdriver1/#is-element-selected}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {boolean=} opt_expect An expected value to wait for
   * @return {!Promise<boolean>}
   */
  async isElementSelected(unusedHandle, opt_expect) {}

  /**
   * Return the value of the given attribute name on the given element.
   * Note: for boolean attributes, the value returned is "true".
   * {@link https://www.w3.org/TR/webdriver1/#get-element-attribute}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedAttribute
   * @param {string=} opt_expect An expected value to wait for
   * @return {!Promise<string>}
   */
  async getElementAttribute(unusedHandle, unusedAttribute, opt_expect) {}

  /**
   * Return the value of the given property name on the given element.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-property}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedProperty
   * @param {string=} opt_expect An expected value to wait for
   * @return {!Promise<string>}
   */
  async getElementProperty(unusedHandle, unusedProperty, opt_expect) {}


  /**
   * Returns the rect for a given Element.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-rect}
   *
   * @param {!ElementHandle} unusedHandle
   * @return {!Promise<!{x: number, y: number, height: number. width: number}>}
   */
  async getElementRect(unusedHandle) {}

  /**
   * Return the value of the given CSS value on the given element.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-css-value}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedStyleProperty
   * @param {string=} opt_expect An expected value to wait for
   * @return {!Promise<string>} styleProperty
   */
  async getElementCssValue(unusedHandle, unusedStyleProperty, opt_expect) {}

  /**
   * The Get Element Text command intends to return an element’s text
   * “as rendered”. An element’s rendered text is also used for locating `<a>`
   * elements by their link text and partial link text.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-text}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {(string|RegExp)=} opt_expect An expected value to wait for
   * @return {!Promise<string>}
   */
  async getElementText(unusedHandle, opt_expect) {}

  /**
   * Return the value of the tag name for the given element.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-tag-name}
   *
   * @param {!ElementHandle} unusedHandle
   * @return {!Promise<string>}
   */
  async getElementTagName(unusedHandle) {}

  /**
   * The Get Element Rect command returns the dimensions and coordinates of
   * the given web element.
   * {@link https://www.w3.org/TR/webdriver1/#get-element-rect}
   *
   * @param {!ElementHandle} unusedHandle
   * @return {!Promise<!DOMRectDef>}
   */
  async getElementRect(unusedHandle) {}

  /**
   * Return the enabled state of the given element. i.e. `false` if the
   * given element has the "disabled" attribute.
   * {@link https://www.w3.org/TR/webdriver1/#is-element-enabled}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {boolean=} opt_expect An expected value to wait for
   * @return {!Promise<boolean>}
   */
  async isElementEnabled(unusedHandle, opt_expect) {}

  /**
   * The Set Window Rect command alters the size and the position of the
   * operating system window corresponding to the current top-level browsing
   * context.
   * {@link https://www.w3.org/TR/webdriver1/#set-window-rect}
   *
   * @param {!WindowRectDef} unusedRect
   * @return {!Promise}
   */
  async setWindowRect(unusedRect) {}

  /**
   * The Take Screenshot command takes a screenshot of the
   * visible region encompassed by the bounding rectangle of the window.
   * {@link https://www.w3.org/TR/webdriver1/#take-screenshot}
   * @param {string} unusedPath
   * @return {!Promise}
   */
  async takeScreenshot(unusedPath) {}

  /**
   * The Take Element Screenshot command takes a screenshot of the visible
   * region encompassed by the bounding rectangle of an element.
   * {@link https://www.w3.org/TR/webdriver1/#take-element-screenshot}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {string} unusedPath
   * @return {!Promise}
   */
  async takeElementScreenshot(unusedHandle, unusedPath) {}

  /**
   * Clicks the given element in its center point.
   * {@link https://www.w3.org/TR/webdriver1/#element-click}
   *
   * @param {!ElementHandle} unusedHandle
   * @return {!Promise}
   */
  async click(unusedHandle) {}

  /**
   * Sends the provided keys to the given form control element. If an element
   * is not provided, the active element receives the keys.
   * {@link https://www.w3.org/TR/webdriver1/#element-send-keys}
   *
   * @param {?ElementHandle} unusedHandle
   * @param {string} unusedKeys
   * @return {!Promise}
   */
  async type(unusedHandle, unusedKeys) {}

  /**
   * Scrolls the given element using the scroll options if provided.
   * If the element cannot scroll, then no scroll will be performed.
   * Note: This is not yet spec'd in the W3C WebDriver spec, but there are plans
   * to include it.
   * {@link https://github.com/w3c/webdriver/issues/1005#issuecomment-436629425}
   *
   * @param {!ElementHandle} unusedHandle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   */
  async scroll(unusedHandle, opt_scrollToOptions) {}

  /**
   * Evaluate the given function
   * @param {function()} unusedFn
   * @param {...*} unusedArgs
   * @return {!Promise}
   * @package
   */
  async evaluate(unusedFn, ...unusedArgs) {}
}


/**
 * @typedef {{
 *   width: number,
 *   height: number
 * }} WindowRectDef
*/
let WindowRectDef;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number
 * }}
*/
let DOMRectDef;

/** @enum {string} */
// export let ScrollBehavior = {
//   AUTO: 'auto',
//   SMOOTH: 'smooth',
// }

/** @typedef {{
 *   left: number,
 *   top: number,
 *   behavior: ScrollBehavior
 * }}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions}
 */
let ScrollToOptionsDef;

module.exports = {
  ElementHandle,
  ControllerPromise,
  FunctionalTestController,
  WindowRectDef,
  DOMRectDef,
  ScrollToOptionsDef,
};
