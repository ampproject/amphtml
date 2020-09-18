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

import * as Preact from '../../src/preact';
import {date, number, text, withKnobs} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: '0/amp-layout',
  decorators: [withA11y, withKnobs, withAmp],
};

export const responsive = () => {
  const width = number('width', 400);
  const height = number('height', 300);
  return (
    <main>
      <style jsx global>
        {`
          .content {
            background: cyan;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <amp-layout
        layout="responsive"
        width={width}
        height={height}
      >
        <div className="content">
          {width}:{height}
        </div>
      </amp-layout>
    </main>
  );
};

export const intrinsic = () => {
  const width = number('width', 800);
  const height = number('height', 600);
  const maxWidth = number('maxWidth', 400);
  return (
    <main>
      <style jsx global>
        {`
          .container {
            background: lightgray;
            position: relative;
            float: left;
          }
          .content {
            background: cyan;
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <div class="container">
        <amp-layout
          layout="intrinsic"
          width={width}
          height={height}
          style={{maxWidth}}
        >
          <div class="content">
            {width}:{height}
          </div>
        </amp-layout>
      </div>
    </main>
  );
};
