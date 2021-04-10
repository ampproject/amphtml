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
import {Option, Selector} from '../component';
import {select, withKnobs} from '@storybook/addon-knobs';
import {useState} from '../../../../src/preact';
import {withA11y} from '@storybook/addon-a11y';
export default {
  title: 'Selector',
  component: Selector,
  decorators: [withA11y, withKnobs],
};

const imgStyle = {
  width: '90px',
  height: '60px',
  display: 'inline-block',
  margin: '2px',
};

/**
 * @param {!Object} props
 * @return {*}
 */
function SelectorWithActions(props) {
  const [show, setShow] = useState(false);

  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <button onClick={() => setShow(!show)}>
        toggle option 2.5 visibility
      </button>
      <Selector ref={ref} {...props}>
        {props.children.slice(0, 2)}
        {show && (
          <Option as="div" option="2.5" index={2}>
            Option 2.5
          </Option>
        )}
        <br />
        {props.children.slice(2)}
      </Selector>
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current./*OK*/ toggle('2')}>
          toggle(option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2.5')}>
          toggle(option "2.5")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2', true)}>
          select (option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2', false)}>
          deselect (option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ selectBy(-2)}>
          select up by 2
        </button>
        <button onClick={() => ref.current./*OK*/ selectBy(1)}>
          select down by 1
        </button>
        <button onClick={() => ref.current./*OK*/ clear()}>clear all</button>
      </div>
    </section>
  );
}

export const actionsAndOrder = () => {
  const keyboardSelectMode = select(
    'keyboard select mode',
    ['none', 'focus', 'select'],
    'select'
  );
  return (
    <form>
      <SelectorWithActions
        keyboardSelectMode={keyboardSelectMode}
        multiple
        name="poll"
        aria-label="Image menu"
      >
        <Option
          as="img"
          alt="Sea landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_sea_300x199.jpg"
          option="1"
          index={0}
          disabled
        ></Option>
        <Option
          as="img"
          alt="Desert landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_desert_300x200.jpg"
          option="2"
          index={1}
        ></Option>
        <br />
        <Option
          as="img"
          alt="Ship landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_ship_300x200.jpg"
          option="3"
          index={3}
        ></Option>
        <Option
          as="img"
          alt="Village landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_village_300x200.jpg"
          option="4"
          index={4}
        ></Option>
      </SelectorWithActions>
    </form>
  );
};

export const optionItems = () => {
  return (
    <Selector aria-label="Option menu">
      <Option option="1">Option 1</Option>
      <Option option="2">Option 2</Option>
      <Option option="3">Option 3</Option>
      <Option option="4">Option 4</Option>
    </Selector>
  );
};

export const multiselect = () => {
  return (
    <Selector
      as="ul"
      multiple
      aria-label="Multiselect menu"
      defaultValue={['2']}
    >
      <Option as="li" option="1">
        Option 1
      </Option>
      <Option as="li" disabled option="2">
        Option 2 (disabled)
      </Option>
      <Option as="li" option="3">
        Option 3
      </Option>
      <Option as="li" option="4">
        Option 4
      </Option>
    </Selector>
  );
};
