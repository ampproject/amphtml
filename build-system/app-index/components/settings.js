/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/* eslint-disable no-unused-vars */

import {Component, h, render} from 'preact';

const serveModes = [
  {
    value: 'default',
    description: `Unminified AMP JavaScript is served from the local server. For
    local development you will usually want to serve unminified JS to test your
    changes.`,
  },
  {
    value: 'compiled',
    description: `Minified AMP JavaScript is served from the local server. This
      is only available after running \`gulp dist--fortesting \`.`,
  },
  {
    value: 'cdn',
    description: 'Minified AMP JavaScript is served from the AMP Project CDN.',
  },
];

function toggleBodyScroll(opt_bodyForTesting) {
  const body = opt_bodyForTesting || document.body;

  body.classList.toggle(
      'scroll-locked',
      !body.classList.contains('scroll-locked'));
}

function scrollToTop(opt_winForTesting) {
  (opt_winForTesting || window)./*OK*/scrollTo(0, 0);
}

function SettingsOpenerButton({open, handler}) {
  return (
    <div onClick={handler}
      class={'icon ' + (!open ? 'settings-cog-icon' : 'close-icon')}>
      Settings
    </div>
  );
}

function Modal({className, children}) {
  return (
    <div class={'modal ' + (className || '')}>
      {children}
    </div>
  );
}

function SettingsModal() {
  return (
    <Modal className="settings-modal">
      <wrap class="modal-main">
        <h3>Settings</h3>
        <h4>Javascript Serve Mode</h4>
        <ServeModeSelector />
      </wrap>
    </Modal>
  );
}

function RadioInputBlock({id, onChange, value, checked, disabled, children}) {
  return (
    <label for={id}
      class={'radio-input-block ' +
        (disabled ? 'disabled ' : '') +
        (checked ? 'checked ' : '')}>
      {checked && (
        <div class="check-icon icon"></div>
      )}
      <input
        id={id}
        type="radio"
        name="{id}"
        value={value}
        disabled={disabled}
        checked={checked}
        onChange={onChange} />
      {children}
    </label>
  );
}

class ServeModeSelector extends Component {
  constructor(props) {
    super(props);
    this.state.disabled = true;

    fetch('/serve_mode.json')
        .then(response => response.json())
        .then(({serveMode}) => {
          this.setState({
            disabled: false,
            serveMode,
          });
        });
  }

  updateOnChange = event => {
    const {value} = event.target;
    this.setState({
      disabled: true,
    });
    fetch(`/serve_mode=${value}`).then(() => {
      this.setState({
        disabled: false,
        serveMode: value,
      });
    });
  }

  render(unusedProps, state) {
    return (
      <div>
        {serveModes.map(({value, description}) => {
          const id = `serve_mode_${value}`;
          return (
            <RadioInputBlock
              id={id}
              type="radio"
              value={value}
              disabled={state.disabled}
              checked={state.serveMode == value}
              onChange={this.updateOnChange}>
              <strong>{value}</strong>
              <p>{description}</p>
            </RadioInputBlock>
          );
        })}
      </div>
    );
  }
}

export class SettingsOpener extends Component {
  constructor(props) {
    super(props);
    this.setState({open: props.open});
  }

  toggle = () => {
    this.setState({open: !this.state.open});
    scrollToTop();
    toggleBodyScroll();
  }

  render(unusedProps, state) {
    return (
      <div>
        <SettingsOpenerButton open={state.open} handler={this.toggle} />
        {state.open ? <SettingsModal /> : null}
      </div>
    );
  }
}
