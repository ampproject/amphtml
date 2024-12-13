import {
  UPGRADE_TO_CUSTOMELEMENT_PROMISE,
  UPGRADE_TO_CUSTOMELEMENT_RESOLVER,
} from '#core/dom/amp-element-helpers';
import * as Preact from '#core/dom/jsx';

import {StateProperty} from '../amp-story-store-service';
import {
  dependsOnStoryServices,
  getRGBFromCssColorValue,
  getTextColorForRGB,
  shouldShowStoryUrlInfo,
  timeStrToMillis,
} from '../utils';

describes.fakeWin('amp-story utils', {}, (env) => {
  describe('timeStrToMillis', () => {
    it('should return millis for a milliseconds string', () => {
      const millis = timeStrToMillis('100ms');

      expect(millis).to.equal(100);
    });

    it('should return millis for a seconds string', () => {
      const millisForSeconds = timeStrToMillis('1s');

      expect(millisForSeconds).to.equal(1000);
    });

    it('should return millis for a decimal seconds string', () => {
      const millisForSeconds = timeStrToMillis('1.64s');

      expect(millisForSeconds).to.equal(1640);
    });

    it('should return millis for a uppercase string', () => {
      const millisForSeconds = timeStrToMillis('2.5S');

      expect(millisForSeconds).to.equal(2500);
    });

    it('should return NaN for invalid types', () => {
      const convertedMillis = timeStrToMillis('10kg');
      expect(convertedMillis).to.be.NaN;
    });

    it('should return fallback value for invalid types', () => {
      const fallback = 312;
      const convertedMillis = timeStrToMillis('10kg', fallback);
      expect(convertedMillis).to.equal(fallback);
    });
  });

  describe('getRGBFromCssColorValue', () => {
    it('should accept rgb parameters', () => {
      expect(getRGBFromCssColorValue('rgb(0, 10, 100)')).to.deep.equal({
        r: 0,
        g: 10,
        b: 100,
      });
    });

    it('should accept rgba parameters', () => {
      expect(getRGBFromCssColorValue('rgba(0, 10, 100, 0.1)')).to.deep.equal({
        r: 0,
        g: 10,
        b: 100,
      });
    });

    it('should throw an error if wrong parameters', () => {
      allowConsoleError(() => {
        getRGBFromCssColorValue('who dis');
      });
    });

    it('should return a default value if wrong parameters', () => {
      allowConsoleError(() => {
        expect(getRGBFromCssColorValue('who dis')).to.deep.equal({
          r: 0,
          g: 0,
          b: 0,
        });
      });
    });
  });

  describe('getTextColorForRGB', () => {
    it('should return white for a dark background', () => {
      expect(getTextColorForRGB({r: 10, g: 10, b: 10})).to.equal('#FFF');
    });

    it('should return white for a light background', () => {
      expect(getTextColorForRGB({r: 200, g: 200, b: 200})).to.equal('#000');
    });
  });

  describe('shouldShowStoryUrlInfo', () => {
    it('should be true when isEmbedded', () => {
      const fakeViewer = {
        getParam: () => null,
        isEmbedded: () => true,
      };
      const fakeStoreService = {get: () => true};
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.true;
    });

    it('should be forced to false when isEmbedded', () => {
      const fakeViewer = {
        getParam: () => '0',
        isEmbedded: () => true,
      };
      const fakeStoreService = {get: () => true};
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.false;
    });

    it('should be false when !isEmbedded', () => {
      const fakeViewer = {
        getParam: () => null,
        isEmbedded: () => false,
      };
      const fakeStoreService = {get: () => true};
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.false;
    });

    it('should be forced to true when !isEmbedded', () => {
      const fakeViewer = {
        getParam: () => '1',
        isEmbedded: () => false,
      };
      const fakeStoreService = {get: () => true};
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.true;
    });

    it('should be false when CAN_SHOW_STORY_URL_INFO is false', () => {
      const fakeViewer = {
        getParam: () => null,
        isEmbedded: () => true,
      };
      const fakeStoreService = {get: () => {}};
      const getStub = env.sandbox.stub(fakeStoreService, 'get').returns(false);
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.false;
      expect(getStub).to.be.calledOnceWithExactly(
        StateProperty.CAN_SHOW_STORY_URL_INFO
      );
    });

    it('should be true when CAN_SHOW_STORY_URL_INFO is true', () => {
      const fakeViewer = {
        getParam: () => null,
        isEmbedded: () => true,
      };
      const fakeStoreService = {get: () => {}};
      const getStub = env.sandbox.stub(fakeStoreService, 'get').returns(true);
      expect(shouldShowStoryUrlInfo(fakeViewer, fakeStoreService)).to.be.true;
      expect(getStub).to.be.calledOnceWithExactly(
        StateProperty.CAN_SHOW_STORY_URL_INFO
      );
    });
  });

  describe('dependsOnStoryServices', () => {
    class Upgraded extends AMP.BaseElement {}

    const Preupgrade = dependsOnStoryServices(Upgraded);

    it('should upgrade immediately when not inside amp-story', () => {
      const element = <div></div>;

      const instance = new Preupgrade(element);
      const upgraded = instance.upgradeCallback();

      expect(upgraded instanceof Upgraded).to.be.true;
      expect(upgraded.element).to.equal(element);
    });

    it('should upgrade after ancestor amp-story', async () => {
      const element = <div></div>;
      const story = <amp-story>{element}</amp-story>;

      const instance = new Preupgrade(element);
      const upgradedSpy = env.sandbox.spy((impl) => impl);
      const upgradedPromise = instance.upgradeCallback().then(upgradedSpy);

      expect(upgradedSpy).to.not.have.been.called;

      story.getImpl = () => Promise.resolve();
      story[UPGRADE_TO_CUSTOMELEMENT_RESOLVER](story);
      delete story[UPGRADE_TO_CUSTOMELEMENT_RESOLVER];
      delete story[UPGRADE_TO_CUSTOMELEMENT_PROMISE];

      const upgraded = await upgradedPromise;

      expect(upgraded instanceof Upgraded).to.be.true;
      expect(upgraded.element).to.equal(element);
    });
  });
});
