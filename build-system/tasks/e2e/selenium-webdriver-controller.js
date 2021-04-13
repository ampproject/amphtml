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

const fs = require('fs');
const selenium = require('selenium-webdriver');
const {
  DOMRectDef,
  ElementHandle,
  Key,
} = require('./functional-test-controller');
const {ControllerPromise} = require('./controller-promise');
const {expect} = require('chai');
const {NetworkLogger} = require('./network-logger');

const {By, Condition, Key: SeleniumKey, error} = selenium;

const {NoSuchElementError} = error;

const ELEMENT_WAIT_TIMEOUT = 5000;

/** @enum {string} */
const KeyToSeleniumMap = {
  [Key.ArrowDown]: SeleniumKey.ARROW_DOWN,
  [Key.ArrowLeft]: SeleniumKey.ARROW_LEFT,
  [Key.ArrowRight]: SeleniumKey.ARROW_RIGHT,
  [Key.ArrowUp]: SeleniumKey.ARROW_UP,
  [Key.Enter]: SeleniumKey.ENTER,
  [Key.Escape]: SeleniumKey.ESCAPE,
  [Key.Tab]: SeleniumKey.TAB,
};

/**
 * @param {function(): !Promise<T1>} valueFn
 * @param {function(T2): boolean} condition
 * @param {function(T1): T2} opt_mutate
 * @return {!Condition}
 * @template T1
 * @template T2
 */
function expectCondition(valueFn, condition, opt_mutate) {
  opt_mutate = opt_mutate || ((x) => x);
  return new Condition('value matches condition', async () => {
    const value = await valueFn();
    const mutatedValue = await opt_mutate(value);
    return condition(mutatedValue);
  });
}

/**
 * Make the test runner wait until the value returned by the valueFn matches
 * the given condition.
 * @param {!selenium.WebDriver} driver
 * @param {function(): !Promise<T1>} valueFn
 * @param {function(T2): ?T1} condition
 * @param {function(T1): T2} opt_mutate
 * @return {!Promise<?T2>}
 * @template T1
 * @template T2
 */
async function waitFor(driver, valueFn, condition, opt_mutate) {
  const conditionValue = (value) => {
    // Box the value in an object, so values that are present but falsy
    // (like "") do not cause driver.wait to continue waiting.
    return Boolean(condition(value));
  };

  const result = await driver.wait(
    expectCondition(valueFn, conditionValue, opt_mutate)
  );

  return result.value; // Unbox the value.
}

/** @implements {FunctionalTestController} */
class SeleniumWebDriverController {
  /**
   * @param {!selenium.WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    this.networkLogger = new NetworkLogger(driver);

    /** @private {?selenium.WebElement} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.isXpathInstalled_ = false;
  }

  // * @return {function(T1,T1): !Promise<?T1>}
  /**
   * Return a wait function. When called, the function will cause the test
   * runner to wait until the given value matches the expected value.
   * @param {function(): !Promise<T1>} valueFn
   * @return {function(function(T2): ?T1, function(T1): T2): !Promise<?T2>}
   * @template T1
   * @template T2
   */
  getWaitFn_(valueFn) {
    return (condition, opt_mutate) => {
      return waitFor(this.driver, valueFn, condition, opt_mutate);
    };
  }

  /**
   * This waits for an element to become available similar to Selenium's
   * until.js#elementLocated
   * {@link https://github.com/SeleniumHQ/selenium/blob/6a717f20/javascript/node/selenium-webdriver/lib/until.js#L237}
   * @param {string} selector
   * @param {number=} timeout
   * @return {!Promise<!ElementHandle<!selenium.WebElement>>}
   * @override
   */
  async findElement(selector, timeout = ELEMENT_WAIT_TIMEOUT) {
    const bySelector = By.css(selector);

    const label = 'for element to be located ' + selector;
    const condition = new Condition(label, async () => {
      try {
        const root = await this.getRoot_();
        return await root.findElement(bySelector);
      } catch (e) {
        // WebElement.prototype.findElement differs from
        // WebDriver.prototype.findElement in that the WebElement method will
        // throw a NoSuchElementError if the element is not found, and does
        // not wait for the element to appear in the document.
        if (e instanceof NoSuchElementError) {
          return null;
        }
        throw e;
      }
    });
    const webElement = await this.driver.wait(condition, timeout);
    return new ElementHandle(webElement);
  }

  /**
   * This waits for elements to become available similar to Selenium's
   * until.js#elementsLocated
   * {@link https://github.com/SeleniumHQ/selenium/blob/6a717f20/javascript/node/selenium-webdriver/lib/until.js#L258}   *
   * @param {string} selector
   * @return {!Promise<!Array<!ElementHandle<!selenium.WebElement>>>}
   * @override
   */
  async findElements(selector) {
    const bySelector = By.css(selector);

    const label = 'for at least one element to be located ' + selector;
    const condition = new Condition(label, async () => {
      try {
        const root = await this.getRoot_();
        const elements = await root.findElements(bySelector);
        return elements.length ? elements : null;
      } catch (e) {
        if (e instanceof NoSuchElementError) {
          return null;
        }
        throw e;
      }
    });
    const webElements = await this.driver.wait(condition, ELEMENT_WAIT_TIMEOUT);
    return webElements.map((webElement) => new ElementHandle(webElement));
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!ElementHandle<!selenium.WebElement>>}
   * @override
   */
  async findElementXPath(xpath) {
    await this.maybeInstallXpath_();

    const label = 'for element to be located ' + xpath;
    const webElement = await this.driver.wait(
      new Condition(label, async () => {
        const root = await this.getRoot_();
        const results = await this.evaluate(
          (xpath, root) => {
            return window.queryXpath(xpath, root);
          },
          xpath,
          root
        );
        return results && results[0];
      }),
      ELEMENT_WAIT_TIMEOUT
    );
    return new ElementHandle(webElement);
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!Array<!ElementHandle<!selenium.WebElement>>>}
   * @override
   */
  async findElementsXPath(xpath) {
    await this.maybeInstallXpath_();
    const label = 'for at least one element to be located ' + xpath;
    const webElements = await this.driver.wait(
      new Condition(label, async () => {
        const root = await this.getRoot_();
        const results = await this.evaluate(
          (xpath, root) => {
            return window.queryXpath(xpath, root);
          },
          xpath,
          root
        );
        return results;
      }),
      ELEMENT_WAIT_TIMEOUT
    );
    return webElements.map((webElement) => new ElementHandle(webElement));
  }

  /**
   * Install a third-party XPath library if it is not already installed.
   * @return {!Promise}
   */
  async maybeInstallXpath_() {
    if (this.isXpathInstalled_) {
      return;
    }
    this.isXpathInstalled_ = true;

    const scripts = await Promise.all([
      fs.promises.readFile('third_party/wgxpath/wgxpath.js', 'utf8'),
      fs.promises.readFile(
        'build-system/tasks/e2e/driver/query-xpath.js',
        'utf8'
      ),
    ]);
    await this.driver.executeScript(scripts.join('\n\n'));
  }

  /**
   * @return {!Promise<!ElementHandle<!selenium.WebElement>>}
   * @override
   */
  async getActiveElement() {
    const root = await this.getRoot_();
    const getter = (root) =>
      root.activeElement || root.ownerDocument.activeElement;
    const activeElement = await this.driver.executeScript(getter, root);
    return new ElementHandle(activeElement);
  }

  /**
   * @return {!Promise<!ElementHandle<!selenium.WebElement>>}
   * @override
   */
  async getDocumentElement() {
    const root = await this.getRoot_();
    const getter = (root) => root.ownerDocument.documentElement;
    const documentElement = await this.driver.executeScript(getter, root);
    return new ElementHandle(documentElement);
  }

  /**
   * @return {!ControllerPromise<string>}
   * @override
   */
  getCurrentUrl() {
    return new ControllerPromise(
      this.driver.getCurrentUrl(),
      this.getWaitFn_(() => this.driver.getCurrentUrl())
    );
  }

  /**
   * @param {string} location
   * @return {!Promise}
   * @override
   */
  async navigateTo(location) {
    return this.driver.get(location);
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {string|Key} keys
   * @return {!Promise}
   * @override
   */
  async type(handle, keys) {
    const targetElement = handle
      ? handle.getElement()
      : await this.driver.switchTo().activeElement();

    if (keys === Key.CtrlV) {
      return this.pasteFromClipboard();
    }

    const key = KeyToSeleniumMap[keys];
    if (key) {
      return targetElement.sendKeys(key);
    }

    return targetElement.sendKeys(keys);
  }

  /**
   * Pastes from the clipboard by perfoming the keyboard shortcut.
   * https://stackoverflow.com/a/41046276
   * @return {!Promise}
   * @override
   */
  pasteFromClipboard() {
    return this.driver
      .actions()
      .keyDown(SeleniumKey.SHIFT)
      .keyDown(SeleniumKey.INSERT)
      .keyUp(SeleniumKey.SHIFT)
      .keyUp(SeleniumKey.INSERT)
      .perform();
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise<string>}
   * @override
   */
  getElementText(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.getText(),
      this.getWaitFn_(() => webElement.getText())
    );
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise<string>}
   * @override
   */
  getElementTagName(handle) {
    const webElement = handle.getElement();
    return webElement.getTagName();
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {string} attribute
   * @return {!Promise<string>}
   * @override
   */
  getElementAttribute(handle, attribute) {
    const webElement = handle.getElement();
    const getter = (element, attribute) => element.getAttribute(attribute);
    return new ControllerPromise(
      this.evaluate(getter, webElement, attribute),
      this.getWaitFn_(() => this.evaluate(getter, webElement, attribute))
    );
  }

  /**
   * Gets the element property. Note that this is different
   * than getElementAttribute()
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {string} property
   * @return {!Promise<string>}
   * @override
   */
  getElementProperty(handle, property) {
    const webElement = handle.getElement();
    const getProperty = (element, property) => element[property];

    return new ControllerPromise(
      this.driver.executeScript(getProperty, webElement, property),
      this.getWaitFn_(() =>
        this.driver.executeScript(getProperty, webElement, property)
      )
    );
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise<!DOMRectDef>}
   * @override
   */
  getElementRect(handle) {
    const webElement = handle.getElement();
    const getter = (element) => {
      // Extracting the values seems to perform better than returning
      // the raw ClientRect from the element, in terms of flakiness.
      // The raw ClientRect also has hundredths of a pixel. We round to int.
      const {
        width,
        height,
        top,
        bottom,
        left,
        right,
      } = element./*OK*/ getBoundingClientRect();
      return {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(width),
        height: Math.round(height),
        top: Math.round(top),
        bottom: Math.round(bottom),
        left: Math.round(left),
        right: Math.round(right),
      };
    };
    return new ControllerPromise(
      this.driver.executeScript(getter, webElement),
      this.getWaitFn_(() => this.driver.executeScript(getter, webElement))
    );
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} styleProperty
   * @return {!Promise<string>} styleProperty
   * @override
   */
  getElementCssValue(handle, styleProperty) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.getCssValue(styleProperty),
      this.getWaitFn_(() => webElement.getCssValue(styleProperty))
    );
  }

  /**
   * @param {!ElementHandle} handle
   * @return {!Promise<boolean>}
   * @override
   */
  isElementEnabled(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.isEnabled(),
      this.getWaitFn_(() => webElement.isEnabled())
    );
  }
  /**
   * @return {!Promise<Array<string>>}
   * @override
   */
  async getAllWindows() {
    return this.driver.getAllWindowHandles();
  }

  /**
   * @param {!ElementHandle} handle
   * @return {!Promise<boolean>}
   * @override
   */
  isElementSelected(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.isSelected(),
      this.getWaitFn_(() => webElement.isSelected())
    );
  }

  /**
   * Sets width/height of the browser area.
   * @param {!selenium.WindowRectDef} rect
   * @return {!Promise}
   * @override
   */
  async setWindowRect(rect) {
    const {width, height} = rect;

    await this.driver.manage().window().setRect({
      x: 0,
      y: 0,
      width,
      height,
    });

    // Check to make sure we resized the content to the correct size.
    const htmlElement = this.driver.findElement(By.tagName('html'));
    const htmlElementSizes = await Promise.all([
      htmlElement.getAttribute('clientWidth'),
      htmlElement.getAttribute('clientHeight'),
    ]);
    // No Array destructuring allowed?
    const clientWidth = Number(htmlElementSizes[0]);
    const clientHeight = Number(htmlElementSizes[1]);

    // If we resized correctly, can just stop here. If the test is not run in
    // headless mode, we need to do more work to size correctly.
    if (clientWidth == width && clientHeight == height) {
      return;
    }

    // Calculate the window borders, so we can set the correct size to get the
    // desired content size.
    const horizBorder = width - clientWidth;
    const vertBorder = height - clientHeight;

    await this.driver
      .manage()
      .window()
      .setRect({
        width: width + horizBorder,
        height: height + vertBorder,
      });

    // Verify the size. The browser may refuse to resize smaller than some
    // size when not running headless. It is better to fail here rather than
    // have the developer wonder why their test is failing on an unrelated
    // expect.
    const updatedHtmlElementSizes = await Promise.all([
      htmlElement.getAttribute('clientWidth'),
      htmlElement.getAttribute('clientHeight'),
    ]);
    const resultWidth = Number(updatedHtmlElementSizes[0]);
    const resultHeight = Number(updatedHtmlElementSizes[1]);
    // TODO(sparhami) These are throwing errors, but are not causing the test
    // to fail immediately,.Figure out why, we want the test to fail here
    // instead of continuing.
    expect(resultWidth).to.equal(
      width,
      'Failed to resize the window to the requested width.'
    );
    expect(resultHeight).to.equal(
      height,
      'Failed to resize the window to the requested height.'
    );
  }

  /**
   * Get the title of the current document.
   * @return {!Promise<string>}
   * @override
   */
  getTitle() {
    const getTitle = () => document.title;

    return new ControllerPromise(
      this.driver.executeScript(getTitle),
      this.getWaitFn_(() => this.driver.executeScript(getTitle))
    );
  }

  /**
   *
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise}
   * @override
   */
  async click(handle) {
    return handle.getElement().click();
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {!selenium.ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scrollBy(handle, opt_scrollToOptions) {
    const webElement = handle.getElement();
    const scrollBy = (element, opt_scrollToOptions) => {
      element./*OK*/ scrollBy(opt_scrollToOptions);
    };

    return this.driver.executeScript(scrollBy, webElement, opt_scrollToOptions);
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {!selenium.ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scrollTo(handle, opt_scrollToOptions) {
    const webElement = handle.getElement();
    const scrollTo = (element, opt_scrollToOptions) => {
      element./*OK*/ scrollTo(opt_scrollToOptions);
    };

    return this.driver.executeScript(scrollTo, webElement, opt_scrollToOptions);
  }

  /**
   * @param {string} path
   * @return {!Promise<void>} An encoded string representing the image data
   * @override
   */
  async takeScreenshot(path) {
    const imageString = await this.driver.takeScreenshot();
    fs.writeFile(path, imageString, 'base64', function () {});
  }

  /**
   * Evaluate the given function
   * @param {function(): any} fn
   * @param {...*} args
   * @return {!Promise<*>}
   * @override
   */
  evaluate(fn, ...args) {
    return this.driver.executeScript(fn, ...args);
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} path
   * @return {!Promise<void>} An encoded string representing the image data
   * @override
   */
  async takeElementScreenshot(handle, path) {
    // TODO(cvializ): Errors? Or maybe ChromeDriver hasn't yet implemented
    // Could be https://crbug.com/chromedriver/2667
    const webElement = handle.getElement();
    const imageString = await webElement.takeScreenshot();
    fs.writeFile(path, imageString, 'base64', function () {});
  }

  /**
   * @param {string} handle
   * @return {!Promise}
   * @override
   */
  async switchToWindow(handle) {
    await this.driver.switchTo().window(handle);
  }

  /**
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise}
   */
  async switchToFrame(handle) {
    // TODO(estherkim): add 'id' parameter, to select element inside 'handle'
    // use case: testing x-origin iframes like amp-mathml, amp-ima-video

    const element = handle.getElement();
    // TODO(cvializ): This trashes cached element handles why?
    // await this.driver.wait(until.ableToSwitchToFrame(element));
    await this.driver.switchTo().frame(element);
  }

  /**
   * @return {!Promise}
   */
  async switchToParent() {
    // await this.driver.switchTo().parentFrame();
    await this.driver.switchTo().defaultContent();
  }

  /**
   * Switch controller to shadowRoot body hosted by given element.
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise<void>}
   */
  async switchToShadow(handle) {
    const getter = (shadowHost) => shadowHost.shadowRoot.body;
    return this.switchToShadowInternal_(handle, getter);
  }

  /**
   * Switch controller to shadowRoot hosted by given element.
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @return {!Promise<void>}
   */
  async switchToShadowRoot(handle) {
    const getter = (shadowHost) => shadowHost.shadowRoot;
    return this.switchToShadowInternal_(handle, getter);
  }

  /**.
   * @param {!ElementHandle<!selenium.WebElement>} handle
   * @param {function(): any} getter
   * @return {!Promise<void>}
   */
  async switchToShadowInternal_(handle, getter) {
    const shadowHost = handle.getElement();
    const shadowRootBody = await this.evaluate(getter, shadowHost);
    this.shadowRoot_ = shadowRootBody;
  }

  async switchToLight() {
    this.shadowRoot_ = null;
  }

  /**
   * Get the current root
   * @return {!Promise<!selenium.WebElement>}
   */
  getRoot_() {
    if (this.shadowRoot_) {
      return this.shadowRoot_;
    }

    return this.evaluate(() => document.documentElement);
  }

  /** @override */
  dispose() {
    return this.driver.quit();
  }
}

module.exports = {
  SeleniumWebDriverController,
};
