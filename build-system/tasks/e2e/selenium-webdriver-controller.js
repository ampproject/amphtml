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
const {
  By,
  Condition,
  Key,
  error,
} = require('selenium-webdriver');
const {
  ControllerPromise,
  ElementHandle,
} = require('./functional-test-controller');
const {expect} = require('chai');

const {NoSuchElementError} = error;

const ELEMENT_WAIT_TIMEOUT = 5000;

/**
 * @param {function(): !Promise<T>} valueFn
 * @param {function(T):boolean} condition
 * @param {T} opt_mutate
 * @return {!Condition}
 * @template T
 */
function expectCondition(valueFn, condition, opt_mutate) {
  opt_mutate = opt_mutate || (x => x);
  return new Condition('value matches condition', async() => {
    const value = await valueFn();
    const mutatedValue = await opt_mutate(value);
    return condition(mutatedValue);
  });
}

/**
 * Make the test runner wait until the value returned by the valueFn matches
 * the given condition.
 * @param {!WebDriver} driver
 * @param {function(): !Promise<T>} valueFn
 * @param {function(T): ?T} condition
 * @param {T} opt_mutate
 * @return {!Promise<?T>}
 * @template T
 */
function waitFor(driver, valueFn, condition, opt_mutate) {
  const conditionValue = value => {
    // Box the value in an object, so values that are present but falsy
    // (like "") do not cause driver.wait to continue waiting.
    return condition(value) ? {value} : null;
  };
  return driver.wait(expectCondition(valueFn, conditionValue, opt_mutate))
      .then(result => result.value); // Unbox the value.
}

/** @implements {FunctionalTestController} */
class SeleniumWebDriverController {
  /**
   * @param {!WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    /** @private {?WebElement} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.isXpathInstalled_ = false;
  }

  /**
   * Return a wait function. When called, the function will cause the test
   * runner to wait until the given value matches the expected value.
   * @param {function(): !Promise<?T>} valueFn
   * @return {function(T,T): !Promise<?T>}
   * @template T
   */
  getWaitFn_(valueFn) {
    /**
     * @param {function(T): ?T} condition
     * @param {T} opt_mutate
     * @return {!Promise<?T>}
     */
    return (condition, opt_mutate) => {
      return waitFor(this.driver, valueFn, condition, opt_mutate);
    };
  }

  /**
   * This waits for an element to become available similar to Selenium's
   * until.js#elementLocated
   * {@link https://github.com/SeleniumHQ/selenium/blob/6a717f20/javascript/node/selenium-webdriver/lib/until.js#L237}
   * @param {string} selector
   * @return {!Promise<!ElementHandle<!WebElement>>}
   * @override
   */
  async findElement(selector) {
    const bySelector = By.css(selector);

    const label = 'for element to be located ' + selector;
    const condition = new Condition(label, async() => {
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
    const webElement = await this.driver.wait(condition, ELEMENT_WAIT_TIMEOUT);
    return new ElementHandle(webElement, this);
  }

  /**
   * This waits for elements to become available similar to Selenium's
   * until.js#elementsLocated
   * {@link https://github.com/SeleniumHQ/selenium/blob/6a717f20/javascript/node/selenium-webdriver/lib/until.js#L258}   *
   * @param {string} selector
   * @return {!Promise<!Array<!ElementHandle<!WebElement>>>}
   * @override
   */
  async findElements(selector) {
    const bySelector = By.css(selector);

    const label = 'for at least one element to be located ' + selector;
    const condition = new Condition(label, async() => {
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
    return webElements.map(webElement => new ElementHandle(webElement, this));
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!ElementHandle<!WebElement>>}
   * @override
   */
  async findElementXPath(xpath) {
    await this.maybeInstallXpath_();

    const label = 'for element to be located ' + xpath;
    const webElement = await this.driver.wait(new Condition(label, async() => {
      const root = await this.getRoot_();
      const results = await this.evaluate((xpath, root) => {
        return window.queryXpath(xpath, root);
      }, xpath, root);
      return (results && results[0]);
    }), ELEMENT_WAIT_TIMEOUT);
    return new ElementHandle(webElement, this);
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!Array<!ElementHandle<!WebElement>>>}
   * @override
   */
  async findElementsXPath(xpath) {
    await this.maybeInstallXpath_();
    const label = 'for at least one element to be located ' + xpath;
    const webElements = await this.driver.wait(new Condition(label, async() => {
      const root = await this.getRoot_();
      const results = await this.evaluate((xpath, root) => {
        return window.queryXpath(xpath, root);
      }, xpath, root);
      return results;
    }), ELEMENT_WAIT_TIMEOUT);
    return webElements.map(webElement => new ElementHandle(webElement, this));
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
      fs.readFileAsync('third_party/wgxpath/wgxpath.js', 'utf8'),
      fs.readFileAsync('build-system/tasks/e2e/driver/query-xpath.js', 'utf8'),
    ]);
    await this.driver.executeScript(scripts.join('\n\n'));
  }

  /**
   * @return {!Promise<!ElementHandle<!WebElement>>}
   * @override
   */
  async getActiveElement() {
    const activeElement = await this.driver.switchTo().activeElement();
    return new ElementHandle(activeElement);
  }

  /**
   * @param {string} location
   * @return {!Promise}
   * @override
   */
  async navigateTo(location) {
    return await this.driver.get(location);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string} keys
   * @return {!Promise}
   * @override
   */
  async type(handle, keys) {
    const targetElement = handle ?
      handle.getElement() :
      await this.driver.switchTo().activeElement();


    const key = Key[keys.toUpperCase()];
    if (key) {
      return await targetElement.sendKeys(key);
    }

    return await targetElement.sendKeys(keys);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<string>}
   * @override
   */
  getElementText(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
        webElement.getText(),
        this.getWaitFn_(() => webElement.getText()));
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<string>}
   * @override
   */
  getElementTagName(handle) {
    const webElement = handle.getElement();
    return webElement.getTagName();
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string} attribute
   * @return {!Promise<string>}
   * @override
   */
  getElementAttribute(handle, attribute) {
    const webElement = handle.getElement();

    return new ControllerPromise(
        webElement.getAttribute(attribute),
        this.getWaitFn_(() => webElement.getAttribute(attribute)));
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string} property
   * @return {!Promise<string>}
   * @override
   */
  getElementProperty(handle, property) {
    const webElement = handle.getElement();
    const getProperty = (element, property) => element[property];

    return new ControllerPromise(
        this.driver.executeScript(getProperty, webElement, property),
        this.getWaitFn_(() => this.driver.executeScript(
            getProperty, webElement, property)));
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<!{x: number, y: number, height: number. width: number}>}
   * @override
   */
  getElementRect(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
        webElement.getRect(),
        this.getWaitFn_(() => webElement.getRect()));
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
        this.getWaitFn_(() => webElement.getCssValue(styleProperty)));
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
        this.getWaitFn_(() => webElement.isEnabled()));
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
        this.getWaitFn_(() => webElement.isSelected()));
  }

  /**
   * Sets width/height of the browser area.
   * @param {!WindowRectDef} rect
   * @return {!Promise}
   * @override
   */
  async setWindowRect(rect) {
    const {
      width,
      height,
    } = rect;


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

    await this.driver.manage().window().setRect({
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
        'Failed to resize the window to the requested width.');
    expect(resultHeight).to.equal(
        height,
        'Failed to resize the window to the requested height.');
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
        this.getWaitFn_(() => this.driver.executeScript(getTitle)));
  }

  /**
   *
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise}
   * @override
   */
  async click(handle) {
    return await handle.getElement().click();
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scroll(handle, opt_scrollToOptions) {
    const webElement = handle.getElement();
    const scrollTo = (element, opt_scrollToOptions) => {
      element./*OK*/scrollTo(opt_scrollToOptions);
    };

    return await this.driver.executeScript(
        scrollTo, webElement, opt_scrollToOptions);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scrollBy(handle, opt_scrollToOptions) {
    const webElement = handle.getElement();
    const scrollBy = (element, opt_scrollToOptions) => {
      element./*OK*/scrollBy(opt_scrollToOptions);
    };

    return await this.driver.executeScript(
        scrollBy, webElement, opt_scrollToOptions);
  }

  /**
   * @param {string} path
   * @return {!Promise<string>} An encoded string representing the image data
   * @override
   */
  async takeScreenshot(path) {
    const imageString = await this.driver.takeScreenshot();
    fs.writeFile(path, imageString, 'base64', function() {});
  }

  /**
   * Evaluate the given function
   * @param {function()} fn
   * @param {...*} args
   * @return {!ControllerPromise}
   * @override
   */
  evaluate(fn, ...args) {
    return this.driver.executeScript(fn, ...args);
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} path
   * @return {!Promise<string>} An encoded string representing the image data
   * @override
   */
  async takeElementScreenshot(handle, path) {
    // TODO(cvializ): Errors? Or maybe ChromeDriver hasn't yet implemented
    // Could be https://crbug.com/chromedriver/2667
    const webElement = handle.getElement();
    const imageString = await webElement.takeScreenshot();
    fs.writeFile(path, imageString, 'base64', function() {});
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
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

  async switchToShadow(handle) {
    const shadowHost = handle.getElement();
    const shadowRootBody = await this.evaluate(
        shadowHost => shadowHost.shadowRoot.body, shadowHost);
    this.shadowRoot_ = shadowRootBody;
  }

  async switchToLight() {
    this.shadowRoot_ = null;
  }

  /**
   * Get the current root
   * @return {!Promise<!WebElement>}
   */
  getRoot_() {
    if (this.shadowRoot_) {
      return this.shadowRoot_;
    }

    return this.evaluate(() => document.documentElement);
  }
}

module.exports = {
  SeleniumWebDriverController,
};
