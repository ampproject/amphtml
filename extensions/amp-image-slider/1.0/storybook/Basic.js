import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoImageSlider} from '../component';

export default {
  title: 'ImageSlider',
  component: BentoImageSlider,
  decorators: [withKnobs],
};

export const _default = () => {
  const first = text(
    'First image',
    'https://amp.dev/static/samples/img/canoe_900x600.jpg'
  );
  const second = text(
    'Second image',
    'https://amp.dev/static/samples/img/canoe_900x600_blur.jpg'
  );

  return (
    <>
      <BentoImageSlider
        initialSliderPosition={0.5}
        firstImageAs={(props) => (
          <img
            src={first}
            alt="A green apple"
            {...props}
            style={{width: 600, height: 300}}
          />
        )}
        firstLabelAs={(props) => <div {...props}>Clear picture</div>}
        secondImageAs={(props) => (
          <img
            src={second}
            alt="A red apple"
            {...props}
            style={{width: 600, height: 300}}
          />
        )}
        secondLabelAs={(props) => <div {...props}>Blur picture</div>}
        style={{width: 600, height: 300}}
      ></BentoImageSlider>
      <style>
        {`
          .label {
            color: white;
            background-color: rgba(0, 0, 0, 0.4);
            width: 5rem;
            padding: 1rem 0;
            text-align: center;
            font-weight: bold;
          }
          .label-left-center {
            top: 50%;
            left: 1rem;
            transform: translateY(-50%);
          }
          .label-right-center {
            top: 50%;
            right: 1rem;
            transform: translateY(-50%);
          }
          .triangle-hint .amp-image-slider-hint-left {
            width: 10px;
            height: 20px;
            background-size: 10px 20px;
            margin-right: 10px;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='10,0 0,10 10,20' style='fill:white' /%3e%3c/svg%3e");
          }
          .triangle-hint .amp-image-slider-hint-right {
            width: 10px;
            height: 20px;
            background-size: 10px 20px;
            margin-left: 10px;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='0,0 10,10 0,20' style='fill:white' /%3e%3c/svg%3e");
          }
          .slider-no-display .amp-image-slider-hint-left, .slider-no-display .amp-image-slider-hint-right {
            display: none;
          }
          .seek-button-container {
            display: flex;
            justify-content: space-around;
            padding: 1rem;
          }
        `}
      </style>
    </>
  );
};
