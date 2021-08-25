import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {AnimationTemplate} from './template';

const CONTAINER_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'space-around',
};

const DROP_STYLE = {
  width: '20px',
  height: '20px',
  background: 'rgba(0, 0, 0, 0.25)',
  borderRadius: '50%',
  transform: 'translateY(-20vh)',
};

export default {
  title: 'Animation',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-animation', version: 0.1}],
  },
};

export const Random = () => {
  const spec = {
    selector: '.drop',
    '--delay': 'rand(0.1s, 5s)',
    delay: 'var(--delay)',
    direction: 'normal',
    subtargets: [
      {
        index: 0,
        direction: 'reverse',
      },
      {
        selector: '.antigrav',
        direction: 'reverse',
        '--delay': '0s',
      },
    ],
    keyframes: {
      transform: 'translateY(120vh)',
    },
  };
  return (
    <AnimationTemplate spec={spec}>
      <div style={CONTAINER_STYLE}>
        <div class="drop" style={DROP_STYLE}></div>
        <div class="drop" style={DROP_STYLE}></div>
        <div class="drop antigrav" style={DROP_STYLE}></div>
        <div class="drop" style={DROP_STYLE}></div>
        <div class="drop" style={DROP_STYLE}></div>
        <div class="drop" style={DROP_STYLE}></div>
        <div class="drop" style={DROP_STYLE}></div>
      </div>
    </AnimationTemplate>
  );
};

Random.storyName = 'random';
