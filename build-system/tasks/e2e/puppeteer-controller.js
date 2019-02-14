const fs = require('fs');
const {
  Browser,
  JSHandle,
  Page,
  ElementHandle: PuppeteerHandle,
} = require('puppeteer');
const {
  ControllerPromise,
  ElementHandle,
  FunctionalTestController,
} = require('./functional-test-controller');
const {dirname, join} = require('path');
// const {promises: fs} = require('fs');

const KeysMapping = {
  'ENTER': 'Enter',
};

/**
 * Make the test runner wait until the value returned by the valueFn matches
 * the given condition.
 * @param {!Page} page
 * @param {function(): !Promise<T>} valueFn
 * @param {!IArrayLike<*>} args
 * @param {function(T):boolean} condition
 * @param {function(T):T} opt_mutate
 * @return {!Promise<?T>}
 * @template T
 */
async function waitFor(page, valueFn, args, condition, opt_mutate) {
  let value = await evaluate(page, valueFn, ...args);
  if (opt_mutate) {
    value = await opt_mutate(value);
  }

  while (!condition(value)) {
    const handle = await page.waitForFunction(valueFn, {}, ...args);
    value = await handle.jsonValue();
    if (opt_mutate) {
      value = await opt_mutate(value);
    }
  }
  return value;
}

/**
 * Evaluate the given function and its arguments in the context of the document.
 * @param {!Frame} frame
 * @param {function(...*):*} fn
 * @return {!Promise<!JSHandle>}
 */
function evaluate(frame, fn) {
  const args = Array.prototype.slice.call(arguments, 2);
  return frame.evaluate(fn, ...args);
}

/** @implements {FunctionalTestController} */
export class PuppeteerController {
  /**
   * @param {!Browser} browser
   */
  constructor(browser) {
    /** @private @const */
    this.browser_ = browser;

    /** @private */
    this.page_ = null;

    /** @private */
    this.currentFrame_ = null;

    /** @private */
    this.shadowRoot_ = null;

    /** @private */
    this.isXpathInstalled_ = false;
  }

  /**
   * Get the current page object. Create the object if it does not exist.
   * @return {!Promise<!Page>}
   */
  async getPage_() {
    if (!this.page_) {
      this.page_ = await this.browser_.newPage();
      await this.setWindowRect({width: 800, height: 600});
    }
    return this.page_;
  }

  /**
   * Get the current page object. Create the object if it does not exist.
   * @return {!Promise<!Frame>}
   */
  async getCurrentFrame_() {
    if (!this.currentFrame_) {
      const page = await this.getPage_();
      this.currentFrame_ = page.mainFrame();
    }

    return this.currentFrame_;
  }

  /**
   * Return a wait function. When called, the function will cause the test
   * runner to wait until the given value matches the expected value.
   * @param {function(): !Promise<?T>} valueFn
   * @return {function(T,T): !Promise<?T>}
   * @template T
   */
  getWaitFn_(valueFn) {
    const args = Array.prototype.slice.call(arguments, 1);

    return async(condition, opt_mutate) => {
      const frame = await this.getCurrentFrame_();
      return waitFor(frame, valueFn, args, condition, opt_mutate);
    };
  }

  /**
   * Evaluate a function in the context of the document.
   * @param {function(...*):T} fn
   * @param {...*} args
   * @return {!Promise<!JSHandle>}
   * @template T
   */
  async evaluate(fn, ...args) {
    const frame = await this.getCurrentFrame_();
    return await evaluate(frame, fn, ...args);
  }

  /**
   * @param {string} selector
   * @return {!Promise<!ElementHandle<!PuppeteerHandle>>}
   * @override
   */
  async findElement(selector) {
    const frame = await this.getCurrentFrame_();
    const root = await this.getRoot_();
    // const elementHandle = await frame.waitForSelector(selector);
    const jsHandle = await frame.waitForFunction((root, selector) => {
      return root./*OK*/querySelector(selector);
    }, {}, root, selector);
    const elementHandle = jsHandle.asElement();
    return new ElementHandle(elementHandle);
  }

  /**
   * @param {string} selector
   * @return {!Promise<!Array<!ElementHandle<!PuppeteerHandle>>>}
   * @override
   */
  async findElements(selector) {
    const frame = await this.getCurrentFrame_();
    const root = await this.getRoot_();
    const nodeListHandle = await frame.waitForFunction((root, selector) => {
      const nodeList = root./*OK*/querySelectorAll(selector);
      return nodeList.length > 0 ? nodeList : null;
    }, {}, root, selector);

    const lengthHandle = await nodeListHandle.getProperty('length');
    const length = await lengthHandle.jsonValue();

    const elementHandles = [];
    for (let i = 0; i < length; i++) {
      const elementHandle = await nodeListHandle.getProperty(`${i}`);
      elementHandles.push(new ElementHandle(elementHandle));
    }

    return elementHandles;
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!ElementHandle<!PuppeteerHandle>>}
   * @override
   */
  async findElementXPath(xpath) {
    await this.maybeInstallXpath_();
    const frame = await this.getCurrentFrame_();

    const root = await this.getRoot_();
    const jsHandle = await frame.waitForFunction((xpath, root) => {
      const results = window.queryXpath(xpath, root);
      return results && results[0];
    }, {}, xpath, root);
    return new ElementHandle(jsHandle.asElement());
  }

  /**
   * @param {string} xpath
   * @return {!Promise<!Array<!ElementHandle<!PuppeteerHandle>>>}
   * @override
   */
  async findElementsXPath(xpath) {
    this.maybeInstallXpath_();

    const frame = await this.getCurrentFrame_();
    const root = await this.getRoot_();

    const arrayHandle = await frame.waitForFunction((xpath, root) => {
      return window.queryXpath(xpath, root);
    }, {}, xpath, root);

    const lengthHandle = await arrayHandle.getProperty('length');
    const length = await lengthHandle.jsonValue();

    const elementHandles = [];
    for (let i = 0; i < length; i++) {
      const elementHandle = await arrayHandle.getProperty(`${i}`);
      elementHandles.push(new ElementHandle(elementHandle));
    }
    return elementHandles;
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
    const frame = await this.getCurrentFrame_();
    await frame.evaluate(scripts.join('\n\n'));
  }

  /**
   * @return {!Promise<!ElementHandle<!WebElement>>}
   * @override
   */
  async getDocumentElement() {
    const root = await this.getRoot_();
    const getter = root => root.ownerDocument.documentElement;
    const frame = await this.getCurrentFrame_();
    const element = await frame.evaluateHandle(getter, root);
    return new ElementHandle(element);
  }

  /**
   * @param {string} url
   * @return {!Promise}
   * @override
   */
  async navigateTo(url) {
    const frame = await this.getCurrentFrame_();
    await frame.goto(url, {waitUntil: 'domcontentloaded'});
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {string} keys
   * @return {!Promise}
   * @override
   */
  async type(handle, keys) {
    const frame = await this.getCurrentFrame_();
    const targetElement = handle ?
      handle.getElement() :
      await frame.$(':focus');


    const key = KeysMapping[keys.toUpperCase()];
    if (key) {
      await targetElement.press(key);
      return;
    }

    await targetElement.type(keys);
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @return {!Promise<string>}
   * @override
   */
  getElementText(handle) {
    const element = handle.getElement();
    const getter = element => element.textContent;
    return new ControllerPromise(
        this.evaluate(getter, element),
        this.getWaitFn_(getter, element));
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} styleProperty
   * @return {!Promise<string>} styleProperty
   * @override
   */
  getElementCssValue(handle, styleProperty) {
    const element = handle.getElement();
    const getter = (element, styleProperty) => {
      return window.getComputedStyle(element)[styleProperty];
    };
    return new ControllerPromise(
        this.evaluate(getter, element, styleProperty),
        this.getWaitFn_(getter, element, styleProperty));
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {string} attribute
   * @return {!Promise<string>}
   * @override
   */
  getElementAttribute(handle, attribute) {
    const element = handle.getElement();
    const getter = (element, attribute) => element.getAttribute(attribute);
    return new ControllerPromise(
        this.evaluate(getter, element, attribute),
        this.getWaitFn_(getter, element, attribute));
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {string} property
   * @return {!Promise<string>}
   * @override
   */
  getElementProperty(handle, property) {
    const element = handle.getElement();
    const getter = (element, property) => {
      return element[property];
    };
    return new ControllerPromise(
        this.evaluate(getter, element, property),
        this.getWaitFn_(getter, element, property));
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @return {!Promise<!{x: number, y: number, height: number. width: number}>}
   * @override
   */
  getElementRect(handle) {
    const element = handle.getElement();
    const getter = element => {
      // Extracting the values seems to perform better than returning
      // the raw ClientRect from the element, in terms of flakiness.
      // The raw ClientRect also has hundredths of a pixel. We round to int.
      const {x, y, width, height} = element.getBoundingClientRect();
      return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      };
    };
    return new ControllerPromise(
        this.evaluate(getter, element),
        this.getWaitFn_(getter, element));
  }

  /**
   * @param {!WindowRectDef} rect
   * @return {!Promise}
   * @override
   */
  async setWindowRect(rect) {
    const {
      width,
      height,
    } = rect;
    await this.resizeWindow_(width, height);
  }


  /**
   * Resize the window and the viewport. The `page.setViewport` method only
   * changes the size of the rendered area of the browser, not the window size.
   * `page.setViewport` also does not relayout the page.
   * To resize the window to test code that makes decisions on resize, we must
   * change the viewport and the window bounds.
   * We also pass any scrollbars adding width or tab bar adding height as
   * the chromePadding* parameters.
   * {@link https://github.com/GoogleChrome/puppeteer/issues/1183#issuecomment-348615375}
   * @param {number} width
   * @param {number} height
   * @private
   */
  async resizeWindow_(width, height) {
    const browser = this.browser_;
    const page = await this.getPage_();

    const {
      outerWidth,
      outerHeight,
      clientWidth,
      clientHeight,
    } = await this.evaluate(() => {
      const saved = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'scroll';
      const {outerWidth, outerHeight} = window;
      const {clientWidth, clientHeight} = document.documentElement;
      document.documentElement.style.overflow = saved;
      return {
        outerWidth: Math.round(outerWidth),
        outerHeight: Math.round(outerHeight),
        clientWidth: Math.round(clientWidth),
        clientHeight: Math.round(clientHeight),
      };
    });
    const chromePaddingWidth = outerWidth > 0 ? outerWidth - clientWidth : 0;
    const chromePaddingHeight =
        outerHeight > 0 ? outerHeight - clientHeight : 0;

    await page.setViewport({
      width: width + chromePaddingWidth,
      height: height + chromePaddingHeight,
      hasTouch: true,
    });

    // Any tab.
    const {targetInfos: [{targetId}]} = await browser._connection.send(
        'Target.getTargets');

    // Tab window.
    try {
      const {windowId} = await browser._connection.send(
          'Browser.getWindowForTarget', {targetId});

      // Resize.
      await browser._connection.send(
          'Browser.setWindowBounds', {
            bounds: {
              width: width + chromePaddingWidth,
              height: height + chromePaddingHeight,
            },
            windowId,
          });
    } catch (e) {
      // Catch if we're in headless.
      if (!e.toString().includes(
          'Protocol error (Browser.getWindowForTarget)')) {
        throw e;
      }
    }
  }

  /**
   * @return {!Promise<string>}
   * @override
   */
  getTitle() {
    const title = this.getCurrentFrame_().then(frame => frame.title());
    return new ControllerPromise(title);
  }

  /**
   * @return {!Promise<string>}
   * @override
   */
  getCurrentUrl() {
    const title = this.getCurrentFrame_().then(frame => frame.url());
    return new ControllerPromise(title);
  }

  /**
   * @return {!Promise<!PuppeteerHandle>}
   * @override
   */
  async getActiveElement() {
    const getter = () => document.activeElement;
    const frame = await this.getCurrentFrame_();
    const element = await frame.evaluateHandle(getter);
    return new ElementHandle(element);
  }

  /**
   * TODO(cvializ): decide if we need to waitForNavigation on click and keypress
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @return {!Promise}
   * @override
   */
  click(handle) {
    return handle.getElement().click();
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scroll(handle, opt_scrollToOptions) {
    const element = handle.getElement();
    await this.evaluate((element, opt_scrollToOptions) => {
      element.scrollTo(opt_scrollToOptions);
    }, element, opt_scrollToOptions);
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {!ScrollToOptionsDef=} opt_scrollToOptions
   * @return {!Promise}
   * @override
   */
  async scrollBy(handle, opt_scrollToOptions) {
    const element = handle.getElement();
    await this.evaluate((element, opt_scrollToOptions) => {
      element.scrollBy(opt_scrollToOptions);
    }, element, opt_scrollToOptions);
  }

  /**
   * For some reason page.screenshot fails, so we use the html element.
   * @param {string} path
   * @return {!Promise<string>} An encoded string representing the image data
   * @override
   */
  async takeScreenshot(path) {
    const root = new ElementHandle(await this.getRoot_());
    return await this.takeElementScreenshot(root, path);
  }

  /**
   * @param {!ElementHandle} handle
   * @param {string} path The path relative to the build-system/tasks/e2e root.
   * @return {!Promise<string>} An encoded string representing the image data
   * @override
   */
  async takeElementScreenshot(handle, path) {
    const relative = join(__dirname, path);
    try {
      await fs.mkdirAsync(dirname(relative), {recursive: true});
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }

    const options = {
      path: relative,
      type: 'png',
    };
    const element = handle.getElement();
    return await element.screenshot(options);
  }

  /**
   * @param {?ElementHandle} handle
   * @return {!Promise}
   */
  async switchToFrame(handle) {
    const element = handle.getElement();
    this.currentFrame_ = await element.contentFrame();
  }

  /**
   * @return {!Promise}
   */
  async switchToParent() {
    let frame = await this.currentFrame_.parentFrame();
    if (!frame) {
      const page = await this.getPage_();
      frame = page.mainFrame();
    }
    this.currentFrame_ = frame;
  }

  /**
   * @param {!ElementHandle<!PuppeteerHandle>} handle
   * @param {function():(!Promise|undefined)} fn
   * @return {!Promise}
   * @override
   */
  async usingFrame(handle, fn) {
    await this.switchToFrame_(handle);
    await fn();
    await this.switchToParent_();
  }

  async switchToShadow(handle) {
    const frame = await this.getCurrentFrame_();
    const shadowHost = handle.getElement();
    const shadowRootBodyHandle = await frame.evaluateHandle(
        shadowHost => shadowHost.shadowRoot.body, shadowHost);
    this.shadowRoot_ = shadowRootBodyHandle.asElement();
  }

  async switchToLight() {
    this.shadowRoot_ = null;
  }

  /**
   * Get the current root
   * @return {!Promise<!PuppeteerHandle>}
   */
  async getRoot_() {
    if (this.shadowRoot_) {
      return this.shadowRoot_;
    }

    const frame = await this.getCurrentFrame_();
    return await frame.evaluateHandle(() => document.documentElement);
  }
}
