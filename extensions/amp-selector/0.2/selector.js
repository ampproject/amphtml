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
/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as CSS from './selector.css';
import * as Preact from '../../../src/preact';
import {useState} from '../../../src/preact';

const SelectorContext = Preact.createContext({});

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Selector(props) {
  const {
    'value': value,
    'defaultValue': defaultValue,
    'disabled': disabled,
  } = props;
  const isMultiple = props['multiple'] !== undefined;
  const [selectedState, setSelectedState] = useState(
    value ? [].concat(value) : defaultValue ? [].concat(defaultValue) : []
  );
  // TBD: controlled values require override of properties.
  const selected = /** @type {!Array} */ (value
    ? [].concat(value)
    : selectedState);
  const selectOption = option => {
    if (!option) {
      return;
    }
    const {'onChange': onChange} = props;
    let newValue = null;
    if (isMultiple) {
      newValue = selected.includes(option)
        ? selected.filter(v => v != option)
        : selected.concat(option);
    } else if (!selected.includes(option)) {
      newValue = [option];
    }
    if (newValue) {
      setSelectedState(newValue);
      if (onChange) {
        onChange({
          target: {value: isMultiple ? newValue : newValue[0], option},
        });
      }
    }
  };

  const tag = props['tagName'] || 'div';
  // TODO: Support '.' access to return <props.tagName ...> in JSX
  return Preact.createElement(
    tag,
    {
      ...props,
      role: props['role'] || 'listbox',
      'aria-multiselectable': isMultiple,
      'aria-disabled': disabled,
    },
    <SelectorContext.Provider
      value={{
        selected,
        selectOption,
      }}
    >
      {/** TODO: Replace options with props.children when
       * AMP layer supports manipulating 'children' */}
      {props['options']}
    </SelectorContext.Provider>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Option(props) {
  const {'option': option, 'disabled': disabled, 'style': style} = props;
  const getOption = props['getOption'] || (() => option);
  const selectorContext = Preact.useContext(SelectorContext);
  const {'selected': selected, 'selectOption': selectOption} = selectorContext;
  const isSelected = /** @type {!Array} */ (selected).includes(option);
  const status = disabled
    ? CSS.DISABLED
    : isSelected
    ? CSS.SELECTED
    : CSS.OPTION;
  const optionProps = {
    ...props,
    'aria-disabled': disabled,
    role: props['role'] || 'option',
    onClick: e => selectOption(getOption(e)),
    option,
    selected: isSelected,
    style: {...status, ...style},
  };
  const tag = props['type'] || props['tagName'] || 'div';
  // TODO: Support '.' access to return <props.tagName ...> in JSX
  return Preact.createElement(tag, {...optionProps});
}
