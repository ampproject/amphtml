import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-accordion-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-accordion', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'expand-single-section': false,
    animate: false,
  },
};

export const _default = (args) => {
  return (
    <main>
      <amp-accordion style={{background: 'red'}} id="accordion" {...args}>
        <section id="section1">
          <h2>Section 1</h2>
          <div>Puppies are cute.</div>
        </section>
        <section>
          <h2>Section 2</h2>
          <div>Kittens are furry.</div>
        </section>
        <section expanded>
          <h2>Section 3</h2>
          <div>Elephants have great memory.</div>
        </section>
      </amp-accordion>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:accordion.toggle(section='section1')">
          toggle(section1)
        </button>
        <button on="tap:accordion.toggle()">toggle all</button>
        <button on="tap:accordion.expand(section='section1')">
          expand(section1)
        </button>
        <button on="tap:accordion.expand()">expand all</button>
        <button on="tap:accordion.collapse(section='section1')">
          collapse(section1)
        </button>
        <button on="tap:accordion.collapse()">collapse all</button>
      </div>
    </main>
  );
};

export const events = (args) => {
  return (
    <main>
      <amp-accordion id="accordion" {...args}>
        <section id="section1">
          <h2>Section 1</h2>
          <div>Puppies are cute.</div>
        </section>
        <section id="section2" on="expand:accordion.expand(section='section3')">
          <h2>Section 2</h2>
          <div>Kittens are furry.</div>
        </section>
        <section
          id="section3"
          on="collapse:accordion.collapse(section='section2')"
        >
          <h2>Section 3</h2>
          <div>Elephants have great memory.</div>
        </section>
      </amp-accordion>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:accordion.expand(section='section2')">
          expand(section2)
        </button>
        <button on="tap:accordion.collapse(section='section3')">
          collapse(section3)
        </button>
        <button on="tap:accordion.toggle()">toggle all</button>
      </div>
    </main>
  );
};
