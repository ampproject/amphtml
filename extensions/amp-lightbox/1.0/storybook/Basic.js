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
import {Lightbox} from '../lightbox';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {useRef} from '../../../../src/preact';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Lightbox',
  component: Lightbox,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function LightboxWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <Lightbox ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.open()}>open</button>
        <button onClick={() => ref.current.close()}>close</button>
      </div>
    </section>
  );
}

export const _default = () => {
  const open = boolean('open', false);
  const animateIn = text('animateIn', 'fade-in');
  return (
    <div>
      <LightboxWithActions
        id="lightbox"
        layout="nodisplay"
        open={open}
        animateIn={animateIn}
        style={{display: 'block'}}
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt.
      </LightboxWithActions>
    </div>
  );
};
