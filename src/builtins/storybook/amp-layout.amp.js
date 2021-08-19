import {withAmp} from '@ampproject/storybook-addon';
import {number, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: '0/amp-layout',
  decorators: [withKnobs, withAmp],
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
      <amp-layout layout="responsive" width={width} height={height}>
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
