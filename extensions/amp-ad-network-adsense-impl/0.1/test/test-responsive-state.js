import {
  ADSENSE_MCRSPV_TAG,
  ADSENSE_RSPV_ALLOWED_HEIGHT,
  ADSENSE_RSPV_TAG,
} from '#ads/google/utils';

import {addAttributesToElement, createElementWithAttributes} from '#core/dom';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {toWin} from '#core/window';

import {forceExperimentBranch} from '#experiments';

import {Services} from '#service';

import {
  AD_SIZE_OPTIMIZATION_EXP,
  MAX_HEIGHT_EXP,
  ResponsiveState,
} from '../responsive-state';

const AD_CLIENT_ID = 'ca-pub-123';

describes.realWin(
  'responsive-state',
  {
    amp: {
      extensions: [],
    },
  },
  (env) => {
    let win, doc;
    let lastSizeChangeAttempt;
    let element;
    let storageContent;
    let fakeIframe;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      lastSizeChangeAttempt = null;

      const vsync = Services.vsyncFor(win);
      vsync.run = (vsyncTaskSpec, vsyncState) => {
        if (vsyncTaskSpec.measure) {
          vsyncTaskSpec.measure(vsyncState);
        }
        if (vsyncTaskSpec.mutate) {
          vsyncTaskSpec.mutate(vsyncState);
        }
      };
      const storage = await Services.storageForDoc(doc);
      storageContent = {};
      env.sandbox.stub(storage, 'get').callsFake((key) => {
        return Promise.resolve(storageContent[key]);
      });
      env.sandbox.stub(storage, 'set').callsFake((key, value) => {
        storageContent[key] = value;
        return Promise.resolve();
      });
      fakeIframe = {
        contentWindow: window,
        nodeType: 1,
        style: {},
      };
    });

    function createElement(attributes) {
      element = createElementWithNoStub(attributes);
      env.sandbox
        .stub(element, 'getLayoutBox')
        .returns(layoutRectLtwh(50, 200, 375, 100));

      env.sandbox.stub(element, 'getImpl').returns(
        Promise.resolve({
          attemptChangeSize: (h, w) => {
            lastSizeChangeAttempt = {height: h, width: w};
            return Promise.resolve();
          },
        })
      );

      const viewport = Services.viewportForDoc(doc);
      env.sandbox.stub(viewport, 'getSize').returns({width: 375, height: 667});

      return element;
    }

    function createElementWithNoStub(attributes) {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'type': 'adsense',
        'data-ad-client': 'ca-pub-123',
      });
      addAttributesToElement(element, attributes);
      const parent = createElementWithAttributes(doc, 'div', {});
      parent.appendChild(element);
      doc.body.appendChild(parent);
      return element;
    }

    function createState(attributes) {
      createElement(attributes);
      return ResponsiveState.createIfResponsive(element);
    }

    function createContainerWidthState(attributes) {
      createElement(attributes);
      return ResponsiveState.createContainerWidthState(element);
    }

    describe('createIfResponsive', () => {
      it('should return non null for a responsive element', () => {
        const state = createState({'data-auto-format': [ADSENSE_RSPV_TAG]});
        expect(state).to.not.be.null;
      });
      it('should return null for a non responsive element', () => {
        const state = createState({});
        expect(state).to.be.null;
      });
    });

    describe('isValidElement', () => {
      it('should return true if it is a container width state', () => {
        const state = createContainerWidthState({
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '960',
        });
        expect(state.isValidElement()).to.be.true;
      });

      it('should return false if the height is not allowed', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'height': '310',
          'width': '100vw',
        });
        expect(state.isValidElement()).to.be.false;
      });

      it('should return false if the width is not allowed', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '90vw',
        });
        expect(state.isValidElement()).to.be.false;
      });

      it('should return true for a valid element', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '100vw',
        });
        expect(state.isValidElement()).to.be.true;
      });
    });

    describe('getRafmtParam', () => {
      it(`should return 13 for data-auto-format="${ADSENSE_RSPV_TAG}"`, () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '100vw',
        });
        expect(state.getRafmtParam()).to.be.equal(13);
      });

      it(`should return 15 for data-auto-format="${ADSENSE_MCRSPV_TAG}"`, () => {
        const state = createState({
          'data-auto-format': [ADSENSE_MCRSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '100vw',
        });
        expect(state.getRafmtParam()).to.be.equal(15);
      });
    });

    describe('attemptToMatchResponsiveHeight', () => {
      it(`should attempt to set the right size for data-auto-format="${ADSENSE_RSPV_TAG}" without height fix experiment`, async () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '100vw',
        });

        await state.attemptToMatchResponsiveHeight();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 300,
          width: 375,
        });
      });

      it(`should attempt to set the right size for data-auto-format="${ADSENSE_RSPV_TAG}" with height fix experiment`, async () => {
        forceExperimentBranch(
          win,
          MAX_HEIGHT_EXP.branch,
          MAX_HEIGHT_EXP.experiment
        );

        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': [ADSENSE_RSPV_ALLOWED_HEIGHT],
          'width': '100vw',
        });

        await state.attemptToMatchResponsiveHeight();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 313,
          width: 375,
        });
      });

      it(`should attempt to set the right size for data-auto-format="${ADSENSE_MCRSPV_TAG}"`, async () => {
        const state = createState({
          'data-auto-format': [ADSENSE_MCRSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });

        await state.attemptToMatchResponsiveHeight();

        expect(lastSizeChangeAttempt).to.be.deep.equal({
          height: 1386,
          width: 375,
        });
      });
    });

    describe('alignToViewport', () => {
      it('aligns a responsive element with the viewport edges in LTR', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '200px',
          'width': '100vw',
        });
        element.style.width = '375px';

        state.alignToViewport();

        expect(element.style.marginLeft).to.be.equal('-50px');
        expect(element.style.marginRight).to.be.equal('');
      });

      it('aligns a responsive element with the viewport edges in RTL', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '200px',
          'width': '100vw',
        });
        element.style.width = '375px';
        element.parentElement.style.direction = 'rtl';

        state.alignToViewport();

        expect(element.style.marginLeft).to.be.equal('');
        expect(element.style.marginRight).to.be.equal('50px');

        element.parentElement.style.direction = '';
      });

      it('Do not align the element if its full-width resize failed', () => {
        const state = createState({
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '100px',
          'width': '100vw',
        });
        // The viewport width is 375.
        element.style.width = '200px';

        state.alignToViewport();

        expect(element.style.marginLeft).to.be.equal('');
        expect(element.style.marginRight).to.be.equal('');

        element.parentElement.style.direction = '';
      });
    });

    describe('maybeUpgradeToResponsive', () => {
      it("resolves to null when the appropriate experiment isn't enabled", async () => {
        const element = createElement({
          'data-ad-client': AD_CLIENT_ID,
          'width': '300',
          'height': '200',
        });

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );
        expect(result).to.be.null;
      });

      it('resolves to null when the ad unit is responsive already', async () => {
        forceExperimentBranch(
          win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );

        const element = createElement({
          'data-ad-client': AD_CLIENT_ID,
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );
        expect(result).to.be.null;
      });

      it('returns null when the ad unit is not responsive and ad size optimization is not set', async () => {
        forceExperimentBranch(
          win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );
        const element = createElement({
          'data-ad-client': AD_CLIENT_ID,
          'height': '200px',
          'width': '50vw',
        });

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );

        expect(result).to.be.null;
      });

      it('returns null when the ad unit is not responsive and ad size optimization is disabled', async () => {
        forceExperimentBranch(
          win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );
        const element = createElement({
          'data-ad-client': AD_CLIENT_ID,
          'height': '200px',
          'width': '50vw',
        });
        storageContent[`aas-${AD_CLIENT_ID}`] = false;

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );

        expect(result).to.be.null;
      });

      it('returns null when the viewport is too wide', async () => {
        forceExperimentBranch(
          win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );
        const element = createElementWithNoStub({
          'data-ad-client': AD_CLIENT_ID,
          'height': '500',
          'width': '1024',
        });
        const viewport = Services.viewportForDoc(element);
        env.sandbox
          .stub(viewport, 'getSize')
          .returns({width: 1024, height: 500});
        storageContent[`aas-${AD_CLIENT_ID}`] = true;

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );

        expect(result).to.be.null;
      });

      it('returns a valid responsive state and upgrades element when the ad unit is not responsive and ad size optimization is enabled', async () => {
        forceExperimentBranch(
          win,
          AD_SIZE_OPTIMIZATION_EXP.branch,
          AD_SIZE_OPTIMIZATION_EXP.experiment
        );
        const element = createElement({
          'data-ad-client': AD_CLIENT_ID,
          'height': '200px',
          'width': '50vw',
        });
        storageContent[`aas-${AD_CLIENT_ID}`] = true;

        const result = await ResponsiveState.maybeUpgradeToResponsive(
          element,
          AD_CLIENT_ID
        );

        expect(result).to.not.be.null;
        expect(result.isValidElement()).to.be.true;
        expect(element.getAttribute('height')).to.be.equal(
          `${ADSENSE_RSPV_ALLOWED_HEIGHT}`
        );
        expect(element.getAttribute('width')).to.be.equal('100vw');
        expect(element).to.have.attribute('data-full-width');
        expect(element.getAttribute('data-auto-format')).to.be.equal('rspv');
      });
    });

    describe('convertToContainerWidth', () => {
      it('Fall back to container width state for full-width responsive user on desktop site', async () => {
        const element = createElementWithNoStub({
          'data-ad-client': AD_CLIENT_ID,
          'data-auto-format': [ADSENSE_RSPV_TAG],
          'data-full-width': '',
          'height': '500px',
          'width': '100vw',
        });
        const viewport = Services.viewportForDoc(element);
        env.sandbox
          .stub(viewport, 'getSize')
          .returns({width: 1024, height: 500});

        const mockContainerWith = '960';
        const vsyncMock = Services.vsyncFor(
          toWin(element.ownerDocument.defaultView)
        );
        env.sandbox.stub(vsyncMock, 'runPromise').returns({
          then: () => {
            element.setAttribute('height', ADSENSE_RSPV_ALLOWED_HEIGHT);
            element.setAttribute('width', mockContainerWith);
            element.removeAttribute('data-full-width');
            element.removeAttribute('data-auto-format');
            return ResponsiveState.createContainerWidthState(element);
          },
        });

        const result = await ResponsiveState.convertToContainerWidth(
          element,
          AD_CLIENT_ID
        );

        expect(result).to.not.be.null;
        expect(result.isValidElement()).to.be.true;
        expect(element.getAttribute('height')).to.be.equal(
          `${ADSENSE_RSPV_ALLOWED_HEIGHT}`
        );
        expect(element.getAttribute('width')).to.be.equal(mockContainerWith);
        expect(element).to.not.have.attribute('data-full-width');
        expect(element).to.not.have.attribute('data-auto-format');
      });
    });

    describe('maybeAttachSettingsListener', () => {
      describe('sets up a listener that', () => {
        let promise;

        beforeEach(() => {
          const element = createElement({
            'data-ad-client': AD_CLIENT_ID,
            'height': '200px',
            'width': '50vw',
          });
          promise = ResponsiveState.maybeAttachSettingsListener(
            element,
            fakeIframe,
            AD_CLIENT_ID
          );
          expect(promise).to.not.be.null;
        });

        it('writes opt in data to localstorage', async () => {
          const data = {
            'googMsgType': 'adsense-settings',
            'adClient': AD_CLIENT_ID,
            'enableAutoAdSize': '1',
          };
          win.postMessage(JSON.stringify(data), '*');

          await promise;

          expect(storageContent).to.deep.equal({[`aas-${AD_CLIENT_ID}`]: true});
        });

        it('writes opt out data to localstorage', async () => {
          const data = {
            'googMsgType': 'adsense-settings',
            'adClient': AD_CLIENT_ID,
            'enableAutoAdSize': '0',
          };
          win.postMessage(JSON.stringify(data), '*');

          await promise;

          expect(storageContent).to.deep.equal({
            [`aas-${AD_CLIENT_ID}`]: false,
          });
        });

        it("doesn't write data with the wrong message type", async () => {
          const badData = {
            'googMsgType': 'adsense-bettings',
            'adClient': AD_CLIENT_ID,
            'enableAutoAdSize': '1',
          };
          win.postMessage(JSON.stringify(badData), '*');
          const goodData = {
            'googMsgType': 'adsense-settings',
            'adClient': AD_CLIENT_ID,
            'enableAutoAdSize': '0',
          };
          win.postMessage(JSON.stringify(goodData), '*');

          await promise;

          expect(storageContent).to.deep.equal({
            [`aas-${AD_CLIENT_ID}`]: false,
          });
        });

        it("doesn't write data with the wrong client ID", async () => {
          const badData = {
            'googMsgType': 'adsense-settings',
            'adClient': AD_CLIENT_ID + 'i',
            'enableAutoAdSize': '1',
          };
          win.postMessage(JSON.stringify(badData), '*');
          const goodData = {
            'googMsgType': 'adsense-settings',
            'adClient': AD_CLIENT_ID,
            'enableAutoAdSize': '0',
          };
          win.postMessage(JSON.stringify(goodData), '*');

          await promise;

          expect(storageContent).to.deep.equal({
            [`aas-${AD_CLIENT_ID}`]: false,
          });
        });
      });
    });
  }
);
