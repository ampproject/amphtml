import * as Preact from '#preact';

import {BentoFitText} from '../component';

import '../component.jss';

export default {
  title: 'FitText',
  component: BentoFitText,
  args: {
    minFontSize: 35,
    maxFontSize: 72,
    width: 300,
    height: 200,
  },
};

export const _default = ({height, width, ...args}) => {
  return (
    <BentoFitText style={{border: '1px solid black', width, height}} {...args}>
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </BentoFitText>
  );
};

export const ScaleUpOverflowEllipsis = ({height, width, ...args}) => {
  return (
    <BentoFitText style={{border: '1px solid black', width, height}} {...args}>
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </BentoFitText>
  );
};

ScaleUpOverflowEllipsis.args = {
  minFontSize: 42,
};

export const ScaleDown = ({height, width, ...args}) => {
  return (
    <BentoFitText style={{border: '1px solid black', width, height}} {...args}>
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt. Propriae tincidunt id nec, elit nusquam te
      mea, ius noster platonem in. Mea an idque minim, sit sale deleniti
      apeirian et. Omnium legendos tractatos cu mea. Vix in stet dolorem
      accusamus. Iisque rationibus consetetur in cum, quo unum nulla legere ut.
      Simul numquam saperet no sit.
    </BentoFitText>
  );
};

ScaleDown.args = {
  minFontSize: 6,
};

export const ScaleDownMore = ({height, width, ...args}) => {
  return (
    <BentoFitText style={{border: '1px solid black', width, height}} {...args}>
      Superlongword text
    </BentoFitText>
  );
};

ScaleDownMore.args = {
  minFontSize: 6,
};

export const ConfigureContent = ({content, height, width, ...args}) => {
  return (
    <BentoFitText style={{border: '1px solid black', width, height}} {...args}>
      {content}
    </BentoFitText>
  );
};

ConfigureContent.args = {
  minFontSize: 6,
  maxFontSize: 200,
  content: 'hello world',
};
