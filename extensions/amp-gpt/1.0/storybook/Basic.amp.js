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
      <div slot="fallback">Error while loading script.</div>
    </amp-gpt>
  );
};

export const slotTargeting = (args) => {
  const targetingAtf = {color: 'red', position: 'atf'};
  const targetingBtf = {position: 'btf'};
  return (
    <>
      <amp-gpt
        ad-unit-path="/6355419/Travel/Asia"
        opt-div="div9_atf"
        height="90"
        width="728"
        {...args}
        targeting={JSON.stringify(targetingAtf)}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/6355419/Travel/Asia"
        opt-div="div9_btf"
        height="90"
        width="728"
        {...args}
        targeting={JSON.stringify(targetingBtf)}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
    </>
  );
};

export const disableInitialLoad = (args) => {
  const disableInitialLoad = boolean('disable-initial-load', true);
  return (
    <div>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div_gpt_slot"
        height="250"
        width="300"
        disable-initial-load={disableInitialLoad}
        {...args}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
      <button on="tap:div_gpt_slot.refresh()">Show/Refresh Ad</button>
    </div>
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
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div2"
        height="250"
        width="300"
        style="margin:10px"
        {...args}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
    </>
  );
};

export const loaderAnimation = (args) => {
  return (
    <>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div7"
        height="250"
        width="300"
        style="margin:10px"
        {...args}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div8"
        height="250"
        width="300"
        style="margin:10px"
        {...args}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
      <amp-gpt
        ad-unit-path="/21730346048/test-skyscraper"
        opt-div="div9"
        height="250"
        width="300"
        style="margin:10px"
        {...args}
      >
        <div slot="fallback">Error while loading script.</div>
      </amp-gpt>
    </>
  );
};
