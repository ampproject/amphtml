import {setStyles} from '#core/dom/style';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {CSS} from '../../../../build/amp-story-1.0.css';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryGridLayer} from '../amp-story-grid-layer';
import {AmpStoryPage} from '../amp-story-page';
import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {MediaType_Enum} from '../media-pool';

describes.realWin('amp-story-grid-layer', {amp: true}, (env) => {
  let win;
  let element;
  let gridLayerEl;
  let page;
  let grid;
  let storeService;

  beforeEach(() => {
    win = env.win;

    env.sandbox
      .stub(Services, 'vsyncFor')
      .callsFake(() => ({mutate: (task) => task()}));

    const mediaPoolRoot = {
      getElement: () => win.document.createElement('div'),
      getMaxMediaElementCounts: () => ({
        [MediaType_Enum.VIDEO]: 8,
        [MediaType_Enum.AUDIO]: 8,
      }),
    };

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    registerServiceBuilder(win, 'performance', function () {
      return {
        isPerformanceTrackingOn: () => false,
      };
    });

    const story = win.document.createElement('amp-story');
    story.getImpl = () => Promise.resolve(mediaPoolRoot);
    // Makes whenUpgradedToCustomElement() resolve immediately.
    story.createdCallback = Promise.resolve();

    element = win.document.createElement('amp-story-page');
    gridLayerEl = win.document.createElement('amp-story-grid-layer');
    element.getAmpDoc = () => new AmpDocSingle(win);
    element.appendChild(gridLayerEl);
    story.appendChild(element);
    win.document.body.appendChild(story);

    page = new AmpStoryPage(element);
    env.sandbox.stub(page, 'mutateElement').callsFake((fn) => fn());

    grid = new AmpStoryGridLayer(gridLayerEl);

    // Add CSS styles and set page width/height to 1000px.
    const styles = env.win.document.createElement('style');
    styles.textContent = CSS;
    env.win.document.head.appendChild(styles);

    setStyles(gridLayerEl, {
      '--story-page-vw': `10px`,
      '--story-page-vh': `10px`,
    });
  });

  afterEach(() => {
    element.remove();
  });

  async function buildGridLayer() {
    page.buildCallback();
    await page.layoutCallback();
    grid.buildCallback();
    await grid.layoutCallback();
  }

  it('should set the vertical aspect-ratio', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '10:16');
    await buildGridLayer();

    expect(gridLayerEl.offsetWidth).to.equal(625);
    expect(gridLayerEl.offsetHeight).to.equal(1000);
  });

  it('should set the horizontal aspect-ratio', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '16:10');
    await buildGridLayer();

    expect(gridLayerEl.offsetWidth).to.equal(1000);
    expect(gridLayerEl.offsetHeight).to.equal(625);
  });

  it('should use the scaling factor to set the size of the layer', async () => {
    setStyles(gridLayerEl, {
      '--aspect-ratio': '1/2',
      '--scaling-factor': 1.5,
    });
    gridLayerEl.setAttribute('aspect-ratio', '1:2');

    expect(gridLayerEl.offsetWidth).to.equal(750);
    expect(gridLayerEl.offsetHeight).to.equal(1500);
  });

  it('should apply the aspect-ratio attribute from the responsiveness preset', async () => {
    gridLayerEl.setAttribute('preset', '2021-foreground');

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(
      getComputedStyle(gridLayerEl).getPropertyValue('--aspect-ratio')
    ).to.equal('69/116');
  });
});
