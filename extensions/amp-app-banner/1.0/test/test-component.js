import {mount} from 'enzyme';

import * as Preact from '#preact';
import {platformUtils} from '#preact/utils/platform';

import {AppBanner, BentoAppBanner} from '../component';

describes.realWin('BentoAppBanner preact component v1.0', {}, (env) => {
  describe('raw AppBanner', () => {
    let wrapper;
    let onInstall;
    let onDismiss;
    beforeEach(() => {
      onInstall = env.sandbox.spy();
      onDismiss = env.sandbox.spy();
      wrapper = mount(
        <AppBanner id="test" onInstall={onInstall} onDismiss={onDismiss}>
          <h2>Our app is way better</h2>
          <button open-button>Get the app</button>
        </AppBanner>
      );
    });

    it('should render the banner', () => {
      expect(wrapper.find(AppBanner)).to.have.lengthOf(1);
    });

    it('should render the header', () => {
      expect(wrapper.find('h2')).to.have.lengthOf(1);
    });

    it('should render the dismiss and the open buttons', () => {
      expect(wrapper.find('button')).to.have.lengthOf(2);
    });

    it('clicking the open button should trigger onInstall', () => {
      const openButton = wrapper.find('button[open-button]');
      expect(openButton).to.have.lengthOf(1);
      openButton.simulate('click');
      expect(onInstall).to.have.callCount(1);
    });

    it('clicking the dismiss button should trigger onDismiss', () => {
      const dismissButton = wrapper.find({'aria-label': 'Dismiss'});
      expect(dismissButton).to.have.lengthOf(1);
      dismissButton.simulate('click');
      expect(onDismiss).to.have.callCount(1);
    });
  });

  describe('BentoAppBanner', () => {
    const renderWrapper = () =>
      mount(
        <BentoAppBanner id="test">
          <h2>Our app is way better</h2>
          <button open-button>Get the app</button>
        </BentoAppBanner>
      );

    describe('on Android', () => {
      // Set up the Android environment:
      beforeEach(() => {
        env.sandbox.stub(platformUtils, 'isAndroid').returns(true);
        env.sandbox.stub(platformUtils, 'isChrome').returns(false);
      });
      // Mock the <link> manifest:
      beforeEach(() => {
        const link = document.createElement('link');
        link.setAttribute('id', 'TEST_LINK');
        link.setAttribute('rel', 'manifest');
        link.setAttribute('href', 'https://test.com/manifest');
        document.head.appendChild(link);
      });
      afterEach(() => {
        document.getElementById('TEST_LINK').remove();
      });

      it('should not render if using Chrome', async () => {
        platformUtils.isChrome.returns(true);
        const wrapper = renderWrapper();

        expect(wrapper.isEmptyRender()).to.be.true;
      });

      it('should render', async () => {
        const wrapper = renderWrapper();
        expect(wrapper.isEmptyRender()).to.be.false;

        expect(wrapper.find('button[open-button]')).to.have.length(1);
        expect(wrapper.find('button[aria-label="Dismiss"]')).to.have.length(1);
      });

      describe("clicking 'dismiss'", () => {
        // Mock localStorage:
        beforeEach(() => {
          env.sandbox.stub(window.localStorage, 'getItem');
          env.sandbox.stub(window.localStorage, 'setItem');
        });

        it('should hide the component', () => {
          const wrapper = renderWrapper();
          const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
          expect(wrapper.isEmptyRender()).to.be.false;
          dismissButton.simulate('click');
          expect(wrapper.isEmptyRender()).to.be.true;
          expect(window.localStorage.setItem).to.have.been.calledWith(
            'bento-app-banner:test',
            'true'
          );
        });

        it("should not be shown if it's already been dismissed", () => {
          window.localStorage.getItem.returns('true');
          const wrapper = renderWrapper();
          expect(wrapper.isEmptyRender()).to.be.true;
        });
      });
    });

    describe('on iOS', () => {
      // Set up the iOS environment:
      beforeEach(() => {
        env.sandbox.stub(platformUtils, 'isIos').returns(true);
        env.sandbox.stub(platformUtils, 'isSafari').returns(false);
      });
      // Mock the <meta> tag:
      beforeEach(() => {
        // Inject a tag like: <meta name="apple-itunes-app" content="..." />
        const meta = document.createElement('meta');
        meta.setAttribute('id', 'TEST_META');
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute(
          'content',
          'app-id=11111111,app-argument=https://test.com/deep-link'
        );
        document.head.appendChild(meta);
      });
      afterEach(() => {
        document.getElementById('TEST_META').remove();
      });

      it('should not render if using Safari', () => {
        platformUtils.isSafari.returns(true);
        const wrapper = renderWrapper();
        expect(wrapper.isEmptyRender()).to.be.true;
      });

      it('should render', () => {
        const wrapper = renderWrapper();
        expect(wrapper.isEmptyRender()).to.be.false;

        expect(wrapper.find('button[open-button]')).to.have.length(1);
        expect(wrapper.find('button[aria-label="Dismiss"]')).to.have.length(1);
      });
    });
  });
});
