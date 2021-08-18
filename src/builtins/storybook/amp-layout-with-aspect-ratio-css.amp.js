

import {withAmp} from '@ampproject/storybook-addon';
import {number, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: '0/amp-layout with aspect ratio CSS',
  decorators: [withKnobs, withAmp],
  parameters: {
    experiments: ['layout-aspect-ratio-css'],
  },
};

export const responsiveWidthBound = () => {
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
      <amp-layout layout="responsive" width={width} height={height}>
        <div className="content">
          {width}:{height}
        </div>
      </amp-layout>
    </main>
  );
};

export const responsiveHeightBound = () => {
  const width = number('width', 400);
  const height = number('height', 300);
  return (
    <main>
      <style jsx global>
        {`
          .container {
            background: lightgray;
            position: relative;
            display: flex;
            flex-direction: row;
            height: 200px;
          }
          .container > amp-layout {
            height: 100%;
          }
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
      <div class="container">
        <amp-layout layout="responsive" width={width} height={height}>
          <div class="content">
            {width}:{height}
          </div>
        </amp-layout>
      </div>
    </main>
  );
};
