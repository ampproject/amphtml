/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../../src/preact';
import {select, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-selector-1_0',
  decorators: [withKnobs, withAmp],

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

WithAmpImg.storyName = 'with <amp-img>';

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

WithUl.storyName = 'with <ul>';

export const Actions = () => {
  const keyboardSelectMode = select(
    'keyboard select mode',
    ['none', 'focus', 'select'],
    'focus'
  );
  return (
    <>
      <amp-selector
        id="actionsSample"
        layout="container"
        class="sample-selector"
        keyboard-select-mode={keyboardSelectMode}
        multiple
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

Actions.storyName = 'actions';

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

Responsive.storyName = 'responsive';
