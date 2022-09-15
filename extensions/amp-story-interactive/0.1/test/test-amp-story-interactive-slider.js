import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {MOCK_URL, getSliderInteractiveData} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {
  MID_SELECTION_CLASS,
  POST_SELECTION_CLASS,
} from '../amp-story-interactive-abstract';
import {AmpStoryInteractiveSlider} from '../amp-story-interactive-slider';

describes.realWin(
  'amp-story-interactive-slider',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStorySlider;
    let storyEl;
    let xhrMock;
    let xhrJson;

    beforeEach(() => {
      win = env.win;
      const ampStorySliderEl = win.document.createElement(
        'amp-story-interactive-slider'
      );

      ampStorySliderEl.getAmpDoc = () => new AmpDocSingle(win);
      ampStorySliderEl.getResources = () => win.__AMP_SERVICES.resources.obj;

      ampStorySlider = new AmpStoryInteractiveSlider(ampStorySliderEl);

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStorySliderEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStorySlider = new AmpStoryInteractiveSlider(ampStorySliderEl);

      const xhr = Services.xhrFor(env.win);
      xhrMock = env.sandbox.mock(xhr);
      xhrMock.expects('fetchJson').resolves({
        ok: true,
        json() {
          return Promise.resolve(xhrJson);
        },
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      env.sandbox.stub(ampStorySlider, 'mutateElement').callsFake((fn) => fn());
    });

    it('should create an input element, with type range', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      expect(
        ampStorySlider.getRootElement().querySelector('input[type="range"]')
      ).to.not.be.null;
    });

    it('should be disabled after the input event', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      // simulates a change event, which is when the user releases the slider
      slider.dispatchEvent(new CustomEvent('mouseup'));
      expect(slider.hasAttribute('disabled')).to.be.true;
    });

    it('should set the number displayed in the bubble to the same as the input', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      const sliderBubble = ampStorySlider
        .getRootElement()
        .querySelector('.i-amphtml-story-interactive-slider-bubble');
      slider.value = 30;
      // simulates an input event, which is when the user drags the slider
      slider.dispatchEvent(new CustomEvent('input'));
      expect(sliderBubble.textContent).to.be.equal('30%');
    });

    it('should display the percentage in the bubble when the user drags the slider', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      slider.value = 30;
      // simulates an input event, which is when the user drags the slider
      slider.dispatchEvent(new CustomEvent('input'));
      expect(
        win
          .getComputedStyle(ampStorySlider.getRootElement())
          .getPropertyValue('--fraction')
      ).to.be.equal('0.3');
    });

    it('should show the bubble when the user drags the slider', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      // simulates an input event, which is when the user drags the slider
      slider.dispatchEvent(new CustomEvent('input'));
      expect(ampStorySlider.getRootElement()).to.have.class(
        MID_SELECTION_CLASS
      );
    });

    it('should show post-selection state when the user releases the slider', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      // simulates a change event, which is when the user releases the slider
      slider.dispatchEvent(new CustomEvent('mouseup'));
      expect(ampStorySlider.getRootElement()).to.have.class(
        POST_SELECTION_CLASS
      );
    });

    it('should display the emoji in the bubble from the attribute configuration', async () => {
      ampStorySlider.element.setAttribute('option-1-text', '😄');
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const sliderBubble = ampStorySlider
        .getRootElement()
        .querySelector('.i-amphtml-story-interactive-slider-bubble');
      expect(sliderBubble.textContent).to.be.equal('😄');
    });

    it('should show post-selection state when backend replies with user selection', async () => {
      xhrJson = getSliderInteractiveData();
      ampStorySlider.element.setAttribute('endpoint', MOCK_URL);
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      expect(ampStorySlider.getRootElement()).to.have.class(
        POST_SELECTION_CLASS
      );
    });

    it('should display the selected value in the post-state bubble', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      const sliderBubble = ampStorySlider
        .getRootElement()
        .querySelector('.i-amphtml-story-interactive-slider-bubble');
      slider.value = 30;
      // simulates an input event, which is when the user drags the slider
      // simulates a change event, which is when the user releases the slider
      slider.dispatchEvent(new CustomEvent('input'));
      slider.dispatchEvent(new CustomEvent('mouseup'));
      expect(sliderBubble.textContent).to.be.equal('30%');
    });

    it('should display the average indicator in the correct position', async () => {
      xhrJson = getSliderInteractiveData();
      ampStorySlider.element.setAttribute('endpoint', MOCK_URL);
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      expect(
        win
          .getComputedStyle(ampStorySlider.getRootElement())
          .getPropertyValue('--average')
      ).to.be.equal('51%');
    });
  }
);
