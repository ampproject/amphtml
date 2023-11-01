const fs = require('fs');
const {By, Condition, Key: SeleniumKey, error} = require('selenium-webdriver');
const {
  DOMRectDef,
  ElementHandle,
  Key,
  ScrollToOptionsDef,
} = require('./e2e-types');
const {ControllerPromise} = require('./controller-promise');
const {expect} = require('chai');
const {NetworkLogger} = require('./network-logger');

const {NoSuchElementError} = error;

const ELEMENT_WAIT_TIMEOUT = 5000;

/** @typedef {import('selenium-webdriver').ISize} ISize */
/** @typedef {import('selenium-webdriver').WebDriver} WebDriver */
/** @typedef {import('selenium-webdriver').WebElement} WebElement */

/** @enum {string} */
const KeyToSeleniumMap = {
  [Key.ArrowDown]: SeleniumKey.ARROW_DOWN,
  [Key.ArrowLeft]: SeleniumKey.ARROW_LEFT,
  [Key.ArrowRight]: SeleniumKey.ARROW_RIGHT,
  [Key.ArrowUp]: SeleniumKey.ARROW_UP,
  [Key.Backspace]: SeleniumKey.BACK_SPACE,
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
 * @param {!WebDriver} driver
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

class SeleniumWebDriverController {
  /**
   * @param {!WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    this.networkLogger = new NetworkLogger(driver);

    /** @private {?WebElement} */
    this.shadowRoot_ = null;

    /** @private {boolean} */
    this.isXpathInstalled_ = false;
  }

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
   * @return {!Promise<!ElementHandle<!WebElement>>}
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
   * @return {!Promise<!Array<!ElementHandle<!WebElement>>>}
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
   * @return {!Promise<!ElementHandle<!WebElement>>}
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
   * @return {!Promise<!Array<!ElementHandle<!WebElement>>>}
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
   * @return {!Promise<!ElementHandle<!WebElement>>}
   */
  async getActiveElement() {
    const root = await this.getRoot_();
    const getter = (root) =>
      root.activeElement || root.ownerDocument.activeElement;
    const activeElement = await this.driver.executeScript(getter, root);
    return new ElementHandle(activeElement);
  }

  /**
   * @return {!Promise<!ElementHandle<!WebElement>>}
   */
  async getDocumentElement() {
    const root = await this.getRoot_();
    const getter = (root) => root.ownerDocument.documentElement;
    const documentElement = await this.driver.executeScript(getter, root);
    return new ElementHandle(documentElement);
  }

  /**
   * @return {!ControllerPromise<string|null|function>}
   */
  getCurrentUrl() {
    const waitForFn = this.getWaitFn_(() => this.driver.getCurrentUrl());
    return new ControllerPromise(this.driver.getCurrentUrl(), waitForFn);
  }

  /**
   * @param {string} location
   * @return {!Promise}
   */
  async navigateTo(location) {
    return this.driver.get(location);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string|Key} keys
   * @return {!Promise}
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
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<string>}
   */
  getElementText(handle) {
    const webElement = handle.getElement();
    const waitForFn = this.getWaitFn_(() => webElement.getText());
    return new ControllerPromise(webElement.getText(), waitForFn);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<string>}
   */
  getElementTagName(handle) {
    const webElement = handle.getElement();
    return webElement.getTagName();
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string} attribute
   * @return {!Promise<string>}
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
   * @param {!ElementHandle<!WebElement>} handle
   * @param {string} property
   * @return {!Promise<string>}
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
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<!DOMRectDef>}
   */
  getElementRect(handle) {
    const webElement = handle.getElement();
    const getter = (element) => {
      // Extracting the values seems to perform better than returning
      // the raw ClientRect from the element, in terms of flakiness.
      // The raw ClientRect also has hundredths of a pixel. We round to int.
      const {bottom, height, left, right, top, width} =
        element./*OK*/ getBoundingClientRect();
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
   */
  isElementEnabled(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.isEnabled(),
      this.getWaitFn_(() => webElement.isEnabled())
    );
  }

  /**
   * @param {!ElementHandle} handle
   * @return {!Promise<boolean>}
   */
  isElementDisplayed(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.isDisplayed(),
      this.getWaitFn_(() => webElement.isDisplayed())
    );
  }
  /**
   * @return {!Promise<Array<string>>}
   */
  async getAllWindows() {
    return this.driver.getAllWindowHandles();
  }

  /**
   * @param {!ElementHandle} handle
   * @return {!Promise<boolean>}
   */
  isElementSelected(handle) {
    const webElement = handle.getElement();
    return new ControllerPromise(
      webElement.isSelected(),
      this.getWaitFn_(() => webElement.isSelected())
    );
  }

  /**
   * Get width/height of the browser area.
   * @return {!Promise<[number, number]>}
   */
  async getWindowRect() {
    const htmlElement = this.driver.findElement(By.css('html'));
    return await Promise.all([
      htmlElement.getAttribute('clientWidth').then(Number),
      htmlElement.getAttribute('clientHeight').then(Number),
    ]);
  }

  /**
   * Sets width/height of the browser area.
   * @param {!ISize} rect
   * @return {!Promise}
   */
  async setWindowRect(rect) {
    const {height, width} = rect;

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
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise}
   */
  async click(handle) {
    return handle.getElement().click();
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   */
  async scrollBy(handle, opt_scrollToOptions) {
    const webElement = handle.getElement();
    const scrollBy = (element, opt_scrollToOptions) => {
      element./*OK*/ scrollBy(opt_scrollToOptions);
    };

    return this.driver.executeScript(scrollBy, webElement, opt_scrollToOptions);
  }

  /**
   * @param {!ElementHandle<!WebElement>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
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
   */
  evaluate(fn, ...args) {
    return this.driver.executeScript(fn, ...args);
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} path
   * @return {!Promise<void>} An encoded string representing the image data
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
   */
  async switchToWindow(handle) {
    await this.driver.switchTo().window(handle);
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

  /**
   * Switch controller to shadowRoot body hosted by given element.
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<void>}
   */
  async switchToShadow(handle) {
    const getter = (shadowHost) => shadowHost.shadowRoot.body;
    return this.switchToShadowInternal_(handle, getter);
  }

  /**
   * Switch controller to shadowRoot hosted by given element.
   * @param {!ElementHandle<!WebElement>} handle
   * @return {!Promise<void>}
   */
  async switchToShadowRoot(handle) {
    const getter = (shadowHost) => shadowHost.shadowRoot;
    return this.switchToShadowInternal_(handle, getter);
  }

  /**.
   * @param {!ElementHandle<!WebElement>} handle
   * @param {function(): any} getter
   * @return {!Promise<void>}
   */
  async switchToShadowInternal_(handle, getter) {
    const shadowHost = handle.getElement();
    const shadowRootBody = await this.evaluate(getter, shadowHost);
    this.shadowRoot_ = shadowRootBody;
  }

  /**
   * @return {Promise<void>}
   */
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

  /**
   * Shutdown the driver.
   * @return {Promise<void>}
   */
  async dispose() {
    return this.driver.quit();
  }
}

module.exports = {
  SeleniumWebDriverController,
};
