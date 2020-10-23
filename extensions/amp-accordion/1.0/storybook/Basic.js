/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../../src/preact';
import {Accordion, AccordionSection} from '../accordion';
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Accordion',
  component: Accordion,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function AccordionWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <Accordion ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.toggle('blah')}>
          Toggle('blah')
        </button>
        <button onClick={() => ref.current.toggle()}>Toggle All</button>' ---- '
        <button onClick={() => ref.current.expand('blah')}>
          Expand('blah')
        </button>
        <button onClick={() => ref.current.expand()}>Expand All</button>' ---- '
        <button onClick={() => ref.current.collapse('blah')}>
          Collapse('blah')
        </button>
        <button onClick={() => ref.current.collapse()}>Collapse All</button>
      </div>
    </section>
  );
}

export const _default = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <AccordionWithActions
        expandSingleSection={expandSingleSection}
        animate={animate}
      >
        <AccordionSection key={1} header={<h2>Section 1</h2>}>
          <p>Content in section 1.</p>
        </AccordionSection>
        <AccordionSection key={2} header={<h2>Section 2</h2>}>
          <div>Content in section 2.</div>
        </AccordionSection>
        <AccordionSection
          id="blah"
          key={3}
          expanded
          header={<h2>Section 3</h2>}
        >
          <div>Content in section 2.</div>
        </AccordionSection>
      </AccordionWithActions>
    </main>
  );
};
