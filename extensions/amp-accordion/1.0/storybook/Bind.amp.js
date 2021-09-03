import {withAmp} from '@ampproject/storybook-addon';
import {boolean, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-accordion-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-bind', version: '0.1'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const withAmpBind = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <amp-accordion
        expand-single-section={expandSingleSection}
        animate={animate}
      >
        <section data-amp-bind-expanded="section1">
          <h2>Section 1</h2>
          <div>Puppies are cute.</div>
        </section>
        <section data-amp-bind-expanded="section2">
          <h2>Section 2</h2>
          <div>Kittens are furry.</div>
        </section>
        <section data-amp-bind-expanded="section3">
          <h2>Section 3</h2>
          <div>Elephants have great memory.</div>
        </section>
      </amp-accordion>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:AMP.setState({section1: true})">
          Expand Section 1
        </button>
        <button on="tap:AMP.setState({section1: false})">
          Collapse Section 1
        </button>
        <button on="tap:AMP.setState({section2: true})">
          Expand Section 2
        </button>
        <button on="tap:AMP.setState({section2: false})">
          Collapse Section 2
        </button>
        <button on="tap:AMP.setState({section3: true})">
          Expand Section 3
        </button>
        <button on="tap:AMP.setState({section3: false})">
          Collapse Section 3
        </button>
      </div>
    </main>
  );
};
