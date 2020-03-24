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
  const {value, defaultValue} = props;
  const [selectedState, setSelectedState] = useState(
    value ? [].concat(value) : defaultValue ? [].concat(defaultValue) : []
  );
  // TBD: controlled values require override of properties.
  const selected = value ? [].concat(value) : selectedState;
  const selectOption = option => {
    console.log('select', option);
    const {onChange} = props;
    const multiple = props.multiple !== undefined;
    let newValue = null;
    if (multiple) {
      newValue = selected.includes(option)
        ? selected.filter(v => v != option)
        : selected.concat(option);
    } else if (!selected.includes(option)) {
      newValue = [option];
    }
    if (newValue) {
      setSelectedState(newValue);
      if (onChange) {
        onChange({target: {value: multiple ? newValue : newValue[0]}});
      }
    }
  };

  props.tagName = props.tagName || 'div';
  return (
    <props.tagName {...props}>
      <SelectorContext.Provider
        value={{
          selected,
          selectOption,
        }}
      >
        {props.options}
        {props.children}
      </SelectorContext.Provider>
    </props.tagName>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Option(props) {
  const {option, disabled, style} = props;
  const selectorContext = Preact.useContext(SelectorContext);
  const {selected, selectOption} = selectorContext;
  const isSelected = selected.includes(option);
  const status = disabled
    ? CSS.DISABLED
    : isSelected
    ? CSS.SELECTED
    : CSS.OPTION;
  const optionProps = {
    ...props,
    option,
    selected: isSelected,
    onClick: () => selectOption(option),
    style: {...status, ...style},
  };
  props.tagName = props.type || props.tagName || 'div';
  return <props.tagName {...optionProps}>{props.children}</props.tagName>;
}
