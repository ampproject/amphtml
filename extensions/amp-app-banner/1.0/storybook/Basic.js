import * as Preact from '#preact';
import {BentoAppBanner} from '../component';

export default {
  title: 'AppBanner',
  component: BentoAppBanner,
  args: {
    'device': ['iOS', 'Android'],
  },
};

const cssContent = {
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10
}

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoAppBanner {...args}>
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
    </BentoAppBanner>
  );
};
