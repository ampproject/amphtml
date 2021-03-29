/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-render-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-mustache', version: '0.2'},
      {name: 'amp-bind', version: '0.1'},
      {name: 'amp-render', version: '1.0'},
    ],
    experiments: ['amp-render'],
  },
};

export const WithAmpState = () => {
  const content = JSON.stringify({'name': 'Bill'});

  return (
    <>
      <amp-state id="someData">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{__html: content}}
        ></script>
      </amp-state>

      <amp-render
        src="amp-state:someData"
        width="300"
        height="400"
        layout="fixed"
      >
        <template type="amp-mustache">{`Hi {{name}}!`}</template>
      </amp-render>
    </>
  );
};

WithAmpState.story = {
  name: 'With AMP State',
};

export const WithRemoteSrc = () => {
  const srcUrl = text(
    'src',
    'http://localhost:9001/examples/amp-render-data.json'
  );

  return (
    <amp-render src={srcUrl} width="300" height="400" layout="fixed">
      <template type="amp-mustache">{`Hi {{name}}!`}</template>
    </amp-render>
  );
};

WithRemoteSrc.story = {
  name: 'With remote src',
};

export const WithBindableSrc = () => {
  return (
    <>
      <amp-render
        data-amp-bind-src="bindSrc"
        src="https://amp.dev/static/samples/json/examples.json"
        width="300"
        height="200"
        layout="fixed"
      >
        <template type="amp-mustache">
          <ul>
            {`{{#items}}`}
            <li>{`{{title}}`}</li>
            {`{{/items}}`}
          </ul>
        </template>
      </amp-render>

      <button on="tap:AMP.setState({ bindSrc: 'https://amp.dev/static/samples/json/examples2.json' })">
        Change source
      </button>
    </>
  );
};

WithBindableSrc.story = {
  name: 'With bindable src',
};
