import {Action, getStoreService} from '../amp-story-store-service';
import {AdvancementMode} from '../story-analytics';
import {AnalyticsVariable, getVariableService} from '../variable-service';

describes.fakeWin('amp-story variable service', {}, (env) => {
  let variableService;
  let storeService;

  beforeEach(() => {
    variableService = getVariableService(env.win);
    storeService = getStoreService(env.win);
  });

  it('should update pageIndex and pageId on change', () => {
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'my-page-id',
      index: 123,
    });

    const variables = variableService.get();
    expect(variables['storyPageIndex']).to.equal(123);
    expect(variables['storyPageId']).to.equal('my-page-id');
  });

  it('should update storyAdvancementMode on change', () => {
    variableService.onVariableUpdate(
      AnalyticsVariable.STORY_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    const variables = variableService.get();
    expect(variables['storyAdvancementMode']).to.equal('manualAdvance');
  });

  it('should calculate storyProgress correctly on change', () => {
    storeService.dispatch(Action.SET_PAGE_IDS, ['a', 'b', 'c', 'd', 'e']);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'd',
      index: 3,
    });

    const variables = variableService.get();
    expect(variables['storyProgress']).to.equal(0.75);
  });

  it('should calculate storyProgress when a story only has 1 page', () => {
    storeService.dispatch(Action.SET_PAGE_IDS, ['a']);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'a',
      index: 0,
    });

    const variables = variableService.get();
    expect(variables['storyProgress']).to.equal(0);
  });

  describe('with ads', () => {
    it('should calculate correct pageIndex and pageId on change without regards to ads', () => {
      storeService.dispatch(Action.SET_PAGE_IDS, [
        'a',
        'b',
        'c',
        'i-amphtml-ad-page-0',
        'd',
        'e',
      ]);
      storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'c',
        index: 2,
      });

      const variablesBeforeAds = variableService.get();
      expect(variablesBeforeAds['storyPageIndex']).to.equal(2);
      expect(variablesBeforeAds['storyPageId']).to.equal('c');

      storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'd',
        index: 4,
      });

      const variablesAfterAds = variableService.get();
      expect(variablesAfterAds['storyPageIndex']).to.equal(3);
      expect(variablesAfterAds['storyPageId']).to.equal('d');
    });

    it('should calculate correct storyProgress correctly on change', () => {
      storeService.dispatch(Action.SET_PAGE_IDS, [
        'a',
        'b',
        'c',
        'i-amphtml-ad-page-0',
        'd',
        'e',
      ]);
      storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'd',
        index: 4,
      });

      const variables = variableService.get();
      expect(variables['storyProgress']).to.equal(0.75);
    });
  });
});
