import selenium from 'selenium-webdriver';

const {logging} = selenium;

/** @enum {string} */
const PerformanceMethods = {
  'FRAME_ATTACHED': 'Page.frameAttached',
  'FRAME_NAVIGATED': 'Page.frameNavigated',
  'FRAME_STARTED_LOADING': 'Page.frameStartedLoading',
  'FRAME_STOPPED_LOADING': 'Page.frameStoppedLoading',
  'RESPONSE_RECEIVED': 'Network.responseReceived',
  'REQUEST_WILL_BE_SENT': 'Network.requestWillBeSent',
  'WINDOW_OPEN': 'Network.windowOpen',
};

export class NetworkLogger {
  /** @param {!selenium.WebDriver} driver */
  constructor(driver) {
    /** @type {selenium.WebDriver} */
    this.driver_ = driver;
  }

  /**
   * @param {PerformanceMethods} networkMethod
   * @return {Promise<*>}
   */
  async getEntries_(networkMethod) {
    const entries = await this.driver_
      .manage()
      .logs()
      .get(logging.Type.PERFORMANCE);

    return entries.filter((entry) => {
      const json = JSON.parse(entry.message);
      entry.message = json?.message;
      return json.message?.method == networkMethod;
    });
  }

  /**
   * Gets sent requests with an optional url to filter by.
   * @param {string=} url
   * @return {Promise<Array<*>>}
   */
  async getSentRequests(url) {
    const entries = await this.getEntries_(
      PerformanceMethods.REQUEST_WILL_BE_SENT
    );
    if (url) {
      return entries.filter((entry) => entry.message.params.request.url == url);
    }
    return entries;
  }
}
