

import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {AmpStoryGridLayer} from '../amp-story-grid-layer';
import {AmpStoryPage} from '../amp-story-page';
import {MediaType} from '../media-pool';
import {Services} from '#service';
import {registerServiceBuilder} from '../../../../src/service-helpers';

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
        [MediaType.VIDEO]: 8,
        [MediaType.AUDIO]: 8,
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
    gridLayerEl.setAttribute('aspect-ratio', '9:16');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-width'),
        10
      )
    ).to.equal(562);
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-height'),
        10
      )
    ).to.equal(1000);
  });

  it('should set the horizontal aspect-ratio', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '16:9');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-width'),
        10
      )
    ).to.equal(1000);
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-height'),
        10
      )
    ).to.equal(562);
  });

  it('should use the scaling factor to set the size of the layer', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '1:2');
    gridLayerEl.setAttribute('scaling-factor', '1.5');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-width'),
        10
      )
    ).to.equal(750);
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-height'),
        10
      )
    ).to.equal(1500);
  });

  it('should apply the aspect-ratio attribute from the responsiveness preset', async () => {
    gridLayerEl.setAttribute('preset', '2021-foreground');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl.getAttribute('aspect-ratio')).to.equal('69:116');
  });

  it('should use the responsiveness preset to change the layer aspect', async () => {
    gridLayerEl.setAttribute('preset', '2021-foreground');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
  });

  it('should not add aspect-ratio attribute if preset passed is incorrect', async () => {
    gridLayerEl.setAttribute('preset', 'wrong-preset');
    await buildGridLayer();

    expect(gridLayerEl.hasAttribute('aspect-ratio')).to.be.false;
  });
});
