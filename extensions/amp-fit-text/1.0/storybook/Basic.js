import * as Preact from '#preact';
import {BentoFitText} from '../component';
import {number, text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'BentoFitText',
  component: BentoFitText,
  decorators: [withKnobs],
};

export const _default = () => {
  const minFontSize = number('minFontSize', 35);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <BentoFitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </BentoFitText>
  );
};

export const scaleUpOverflowEllipsis = () => {
  const minFontSize = number('minFontSize', 42);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <BentoFitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </BentoFitText>
  );
};

export const scaleDown = () => {
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <BentoFitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt. Propriae tincidunt id nec, elit nusquam te
      mea, ius noster platonem in. Mea an idque minim, sit sale deleniti
      apeirian et. Omnium legendos tractatos cu mea. Vix in stet dolorem
      accusamus. Iisque rationibus consetetur in cum, quo unum nulla legere ut.
      Simul numquam saperet no sit.
    </BentoFitText>
  );
};

export const scaleDownMore = () => {
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 108);
  const height = number('height', 78);
  return (
    <BentoFitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{border: '1px solid black', width, height}}
    >
      Superlongword text
    </BentoFitText>
  );
};

export const configureContent = () => {
  const content = text('Content', 'hello world');
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 200);
  const width = number('width', 400);
  const height = number('height', 400);
  return (
    <BentoFitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{border: '1px solid black', width, height}}
    >
      {content}
    </BentoFitText>
  );
};
