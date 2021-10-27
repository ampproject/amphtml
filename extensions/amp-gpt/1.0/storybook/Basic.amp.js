import {withAmp} from '@ampproject/storybook-addon';
import {boolean, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-gpt-1_0',
  decorators: [withKnobs, withAmp],
  parameters: {
    extensions: [{name: 'amp-gpt', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = (args) => {
  return (
    <>
      <div style="height: 700px; width: 250px; background: blue;"></div>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div1"
        height="600"
        width="120"
        {...args}
      >
        This text is inside.
      </amp-gpt>
    </>
  );
};

export const targeting = (args) => {
  const targeting = {color: 'red'};
  return (
    <amp-gpt
      ad-unit-path="/21730346048/test-skyscraper"
      opt-div="div2"
      height="600"
      width="120"
      {...args}
      targeting={JSON.stringify(targeting)}
    >
      This text is inside.
    </amp-gpt>
  );
};

export const disableInitialLoad = (args) => {
  const disableInitialLoad = boolean('disable-initial-load', true);
  return (
    <>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div3"
        height="600"
        width="120"
        disable-initial-load={disableInitialLoad}
        {...args}
        targeting={JSON.stringify(targeting)}
      >
        This text is inside.
      </amp-gpt>
      <button onclick="googletag.cmd.push(function() { googletag.pubads().refresh(); });">
        Show/Refresh Ad
      </button>
    </>
  );
};
