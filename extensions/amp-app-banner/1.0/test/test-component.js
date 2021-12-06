import {mount} from 'enzyme';
import * as Preact from 'preact';

import {AppBanner} from '../component/component';

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
});
