import {CommonSignals_Enum} from '#core/constants/common-signals';

/**
 * Fake story implementation mocking public methods.
 */
export class MockStoryImpl extends AMP.BaseElement {
  constructor(element) {
    super(element);
    this.element = element;
    this.pages_ = [];
    // Fire these events so that story ads thinks the parent story is ready.
    element.signals().signal(CommonSignals_Enum.BUILT);
    element.signals().signal(CommonSignals_Enum.INI_LOAD);
  }

  addPage(pageImpl) {
    this.pages_.push(pageImpl);
  }

  getPageById(pageId) {
    return this.pages_.find((page) => page.element.id === pageId);
  }

  // This is not very close to the real implementation as it ignores any
  // advance-to attributes. Should be close enough for testing.
  getNextPage(pageImpl) {
    const index = this.getPageIndexById(pageImpl.element.id);
    return this.pages_[index + 1];
  }

  getPageIndexById(pageId) {
    for (let i = 0; i < this.pages_.length; i++) {
      if (this.pages_[i].element.id === pageId) {
        return i;
      }
    }
  }

  insertPage(unusedPageBeforeId, unusedPageToBeInsertedId) {
    // TODO(ccordry): Implement this when writing test for insertion algo.
  }
}

/**
 * Create amp-story-auto-ads-element with config as a child of the given parent element.
 * @param {!Document} doc
 * @param {!Element} parent
 * @param {Object=} config
 * @return {!Element}
 */
export function createStoryAdElementAndConfig(doc, parent, config) {
  const autoAdsEl = doc.createElement('amp-story-auto-ads');
  addStoryAutoAdsConfig(autoAdsEl, config);
  parent.appendChild(autoAdsEl);
  return autoAdsEl;
}

/**
 * Adds a fake config as a child of the given story element.
 * @param {!Element} parent
 * @param {Object=} customConfig
 */
export function addStoryAutoAdsConfig(parent, customConfig) {
  const config = customConfig || {
    type: 'doubleclick',
    'data-slot': '/30497360/a4a/fake_ad_unit',
  };
  parent./*OK*/ innerHTML = `
    <script type="application/json">
      { "ad-attributes": ${JSON.stringify(config)} }
    </script>
  `;
}

/**
 * Adds story pages to the story object as well as appending them to the DOM.
 * Also fires built signal on created elements.
 * @param {!Document} doc
 * @param {!../../amp-story/1.0/amp-story.AmpStory} storyImpl
 * @param {number=} numPages
 * @return {Promise}
 */
export function addStoryPages(doc, storyImpl, numPages = 3) {
  const {element} = storyImpl;
  const promises = [];
  for (let i = 0; i < numPages; i++) {
    const page = doc.createElement('amp-story-page');
    page.id = 'story-page-' + i;
    element.appendChild(page);
    page.signals().signal(CommonSignals_Enum.BUILT);
    const implPromise = page
      .getImpl()
      .then((pageImpl) => storyImpl.addPage(pageImpl));
    promises.push(implPromise);
  }
  return Promise.all(promises);
}

/**
 * Fires `built` signal on elements story ads needs to access. This is necessary
 * so that calls to getImpl() will resolve.
 * @param {!Document} doc
 * @param {Array<string>=} additonalSelectors
 */
export function fireBuildSignals(doc, additonalSelectors = []) {
  const defaultSelectors = ['amp-ad', 'amp-story', 'amp-story-page'];
  const selectors = defaultSelectors.concat(additonalSelectors).join(',');
  doc.querySelectorAll(selectors).forEach((element) => {
    const signals = element.signals();
    signals.signal(CommonSignals_Enum.BUILT);
    signals.signal(CommonSignals_Enum.INI_LOAD);
  });
}
