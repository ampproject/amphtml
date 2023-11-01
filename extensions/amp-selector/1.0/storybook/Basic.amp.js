import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-selector-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-selector', version: '1.0'}],
    experiments: ['bento'],
  },
};

const imgStyle = {
  display: 'inline-block',
  margin: '2px',
};

export const WithAmpImg = () => {
  return (
    <amp-selector class="sample-selector" layout="container">
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_sea_300x199.jpg"
        width="90"
        height="60"
        option="1"
        style={imgStyle}
      ></amp-img>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_desert_300x200.jpg"
        width="90"
        height="60"
        disabled
        option="2"
        style={imgStyle}
      ></amp-img>
      <div class="divider inline-block mx1"></div>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_ship_300x200.jpg"
        width="90"
        height="60"
        option="3"
        style={imgStyle}
      ></amp-img>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_village_300x200.jpg"
        width="90"
        height="60"
        option="4"
        style={imgStyle}
      ></amp-img>
    </amp-selector>
  );
};

export const WithUl = () => {
  return (
    <amp-selector class="sample-selector" layout="container">
      <ul>
        <li option="1">Option 1</li>
        <li option="2">Option 2</li>
        <li option="3">Option 3</li>
        <li option="4">Option 4</li>
      </ul>
    </amp-selector>
  );
};

export const Actions = (args) => {
  return (
    <>
      <amp-selector
        id="actionsSample"
        layout="container"
        class="sample-selector"
        multiple
        {...args}
      >
        <ul>
          <li option="1" selected>
            Option 1
          </li>
          <li option="2">Option 2</li>
          <li option="3">Option 3</li>
          <li option="4">Option 4</li>
          <li option="5">Option 5</li>
          <li option="6">Option 6</li>
        </ul>
      </amp-selector>
      <button on="tap:actionsSample.clear">clear</button>
      <button on="tap:actionsSample.selectUp">selectUp</button>
      <button on="tap:actionsSample.selectUp(delta=2)">
        selectUp(delta=2)
      </button>
      <button on="tap:actionsSample.selectDown">selectDown</button>
      <button on="tap:actionsSample.selectDown(delta=2)">
        selectDown(delta=2)
      </button>
      <button on="tap:actionsSample.toggle(index=1)">toggle(index=1)</button>
      <button on="tap:actionsSample.toggle(index=1, value=true)">
        toggle(index=1, value=true)
      </button>
    </>
  );
};

Actions.argTypes = {
  'keyboard-select-mode': {
    name: 'keyboard-select-mode',
    defaultValue: 'select',
    options: ['none', 'focus', 'select'],
    control: {type: 'select'},
  },
};

export const Responsive = () => {
  return (
    <amp-selector layout="responsive" width="100" height="100">
      <ul>
        <li option="1">Option 1</li>
        <li option="2">Option 2</li>
        <li option="3">Option 3</li>
        <li option="4">Option 4</li>
      </ul>
    </amp-selector>
  );
};
