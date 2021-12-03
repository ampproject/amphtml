import * as Preact from '#preact';
import {AppBanner} from '../component/component';

export default {
  title: 'AppBanner',
  component: AppBanner,
  args: {
    onInstall() { console.log("Event triggered: onInstall"); },
    onDismiss() { console.log("Event triggered: onDismiss"); },
  },
};

const cssContent = {
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10
}

export const _default = (args) => {
  return (
    <AppBanner {...args} id="ID">
      <div className="content" style={cssContent}>
        <img src="https://cdn-images-1.medium.com/max/800/1*JLegdtjFMNgqHgnxdd04fg.png" width="40" height="34" />
        <div className="description">
          <h5>Get the App</h5>
          <p>Experience a richer experience on our mobile app!</p>
        </div>
        <div className="actions">
          <button open-button>Open In App</button>
        </div>
      </div>
    </AppBanner>
  );
};
