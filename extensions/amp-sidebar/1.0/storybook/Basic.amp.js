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
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-sidebar-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-sidebar', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const sideConfigurations = ['left', 'right', undefined];
  const side = select('type', sideConfigurations, sideConfigurations[0]);
  return (
    <main>
      <amp-sidebar id="sidebar" side={side}>
        <div style={{margin: 8}}>
          <span>
            Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at
            aeque inermis reprehendunt.
          </span>
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </ul>
          <button on="tap:sidebar.toggle()">toggle</button>
          <button on="tap:sidebar.open()">open</button>
          <button on="tap:sidebar.close()">close</button>
        </div>
      </amp-sidebar>
      <div class="buttons" style={{margin: 8}}>
        <button on="tap:sidebar.toggle()">toggle</button>
        <button on="tap:sidebar.open()">open</button>
        <button on="tap:sidebar.close()">close</button>
      </div>
    </main>
  );
};
