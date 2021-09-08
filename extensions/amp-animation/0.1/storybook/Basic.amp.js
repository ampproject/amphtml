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

import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {AnimationTemplate} from './template';

const KEYFRAMES_OPTIONS = {
  'rotate': {
    transform: 'rotate(20deg)',
  },
  'clip-path:inset': {
    clipPath: ['inset(20% round 30%)', 'inset(0)'],
  },
  'clip-path:circle': {
    clipPath: ['circle(50% at 30% 30%)', 'circle(40%)'],
  },
  'clip-path:ellipse': {
    clipPath: ['ellipse(60% 40% at 30% 30%)', 'ellipse(20% 20%)'],
  },
  'clip-path:polygon': {
    clipPath: [
      'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
      'polygon(40% 0, 90% 40%, 40% 90%, 0 40%)',
    ],
  },
  'extension:minmax': {
    transform: ['translateX(min(100%, width() / 2))', 'translateX(0)'],
  },
};

const keyframesOptions = Object.keys(KEYFRAMES_OPTIONS);

const BLOCK_STYLE = {
  background: 'blue',
  width: '100px',
  height: '100px',
};

export default {
  title: 'Animation',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-animation', version: 0.1}],
  },
  argTypes: {
    keyframesName: {
      control: {type: 'select'},
      options: keyframesOptions,
    },
  },
  args: {
    keyframesName: keyframesOptions[0],
    easing: 'cubic-bezier(0,0,.21,1)',
  },
};

export const Default = ({easing, keyframesName}) => {
  const keyframes = KEYFRAMES_OPTIONS[keyframesName];
  const spec = {
    animations: {
      selector: '#block',
      easing,
      keyframes,
    },
  };
  return (
    <AnimationTemplate spec={spec}>
      <div id="block" style={BLOCK_STYLE} />
    </AnimationTemplate>
  );
};

Default.storyName = 'default';
