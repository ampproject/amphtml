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
import {Sidebar} from '../sidebar';
import {select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Sidebar',
  component: Sidebar,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function SidebarWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <>
      <Sidebar ref={ref} {...props}>
        <div style={{margin: 8}}>
          <span>
            Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at
            aeque inermis reprehendunt.
          </span>
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </ul>
          <button onClick={() => ref.current.toggle()}>toggle</button>
          <button onClick={() => ref.current.open()}>open</button>
          <button onClick={() => ref.current.close()}>close</button>
        </div>
      </Sidebar>
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.toggle()}>toggle</button>
        <button onClick={() => ref.current.open()}>open</button>
        <button onClick={() => ref.current.close()}>close</button>
      </div>
    </>
  );
}

export const _default = () => {
  const sideConfigurations = ['left', 'right', undefined];
  const side = select('type', sideConfigurations, sideConfigurations[0]);
  return (
    <main>
      <SidebarWithActions side={side} />
    </main>
  );
};
