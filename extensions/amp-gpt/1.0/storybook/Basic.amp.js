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
    <amp-gpt
      ad-unit-path="/21730346048/test-skyscraper"
      opt-div="div1"
      height="600"
      width="120"
      {...args}
    >
      This text is inside.
    </amp-gpt>
  );
};

export const intersectionObserverInAction = (args) => {
  return (
    <>
      <div style="height: 700px; width: 600px; background: lightblue;"></div>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div1"
        height="600"
        width="120"
        style="margin:10px"
        {...args}
      >
        This text is inside.
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div2"
        height="250"
        width="300"
        style="margin:10px"
        {...args}
      >
        This text is inside.
      </amp-gpt>
    </>
  );
};

export const targeting = (args) => {
  const targetingAtf = {color: 'red', position: 'btf'};
  const targetingBtf = {position: 'btf'};
  return (
    <>
      <amp-gpt
        ad-unit-path="/6355419/Travel/Asia"
        opt-div="div2_atf"
        height="90"
        width="728"
        {...args}
        targeting={JSON.stringify(targetingAtf)}
      >
        This text is inside.
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/6355419/Travel/Asia"
        opt-div="div2_btf"
        height="90"
        width="728"
        {...args}
        targeting={JSON.stringify(targetingBtf)}
      >
        This text is inside.
      </amp-gpt>
    </>
  );
};

export const disableInitialLoad = (args) => {
  const disableInitialLoad = boolean('disable-initial-load', true);
  return (
    <div style="background: lightblue;">
      <div style="padding: 10px;">
        <amp-gpt
          ad-unit-path="/21730346048/test-skyscraper"
          opt-div="div3"
          height="250"
          width="300"
          disable-initial-load={disableInitialLoad}
          {...args}
        >
          This text is inside.
        </amp-gpt>
      </div>
      <div style="padding: 0 10px 10px 10px;">
        <button onclick="googletag.cmd.push(function() { googletag.pubads().refresh(); });">
          Show/Refresh Ad
        </button>
      </div>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div3"
        height="250"
        width="300"
        disable-initial-load={disableInitialLoad}
        {...args}
      >
        This text is inside.
      </amp-gpt>
      <button
        onclick="
        googletag.cmd.push(
          function() {
            googletag.pubads().refresh();
          }
        );"
      >
        Show/Refresh Ad
      </button>
    </div>
  );
};
