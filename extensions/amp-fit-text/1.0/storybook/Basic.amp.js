import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-fit-text-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-fit-text', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const ScaleUpToCover = () => {
  return (
    <amp-fit-text
      width="300"
      height="200"
      style="border: 1px solid black;
      display: block;"
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </amp-fit-text>
  );
};

ScaleUpToCover.storyName = 'Scale up to cover';

export const ScaleUpOverflowEllipsis = ({content, ...args}) => {
  return (
    <amp-fit-text
      width="300"
      height="200"
      style={{border: '1px solid black', display: 'block'}}
      dangerouslySetInnerHTML={{__html: content}}
      {...args}
    />
  );
};

ScaleUpOverflowEllipsis.args = {
  'min-font-size': 42,
  content: `
    Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
    aeque inermis reprehendunt.
  `,
};

export const ScaleDown = () => {
  return (
    <amp-fit-text
      width="300"
      height="200"
      style={{border: '1px solid black', display: 'block'}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt. Propriae tincidunt id nec, elit nusquam te
      mea, ius noster platonem in. Mea an idque minim, sit sale deleniti
      apeirian et. Omnium legendos tractatos cu mea. Vix in stet dolorem
      accusamus. Iisque rationibus consetetur in cum, quo unum nulla legere ut.
      Simul numquam saperet no sit.
    </amp-fit-text>
  );
};

export const ScaleDownMore = () => {
  return (
    <amp-fit-text
      width="108"
      height="78"
      style={{border: '1px solid black', display: 'block'}}
    >
      Superlongword text
    </amp-fit-text>
  );
};

export const LayoutResponsive = () => {
  return (
    <div
      style="background-color: #bebebe;
      width: 40vw;"
    >
      <amp-fit-text
        width="100"
        height="100"
        style={{border: '1px solid black'}}
        layout="responsive"
        max-font-size="200"
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt.
      </amp-fit-text>
    </div>
  );
};
