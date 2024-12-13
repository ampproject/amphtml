import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: '0/amp-layout',
  decorators: [withAmp],
};

export const responsive = ({height, width}) => {
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
        <div class="content">
          {width}:{height}
        </div>
      </amp-layout>
    </main>
  );
};

responsive.args = {
  width: 400,
  height: 300,
};

export const intrinsic = ({height, maxWidth, width}) => {
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

intrinsic.args = {
  width: 800,
  height: 600,
  maxWidth: 400,
};
