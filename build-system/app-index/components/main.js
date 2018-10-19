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
import {ProxyForm} from './proxy-form';


const examplesDocumentModes = {
  'standard': '/',
  'a4a': '/a4a/',
  'a4a-3p': '/a4a-3p/',
  'inabox': '/inabox/1/',
};


function ExamplesDocumentModeSelect({changeHandler, value}) {
  return (
    <label for="examples-mode-select">
      Document mode:
      <select id="examples-mode-select" onchange={changeHandler}>
        {Object.keys(examplesDocumentModes).map(key => (
          <option value={examplesDocumentModes[key]}
            selected={value == examplesDocumentModes[key]}>
            {key}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectModeOptional({basepath, changeHandler, value}) {
  return !/^\/examples/.test(basepath) ? null : (
    <ExamplesDocumentModeSelect
      changeHandler={changeHandler}
      value={value} />
  );
}

function Header({isMainPage}) {
  return (
    <header>
      <h1 class="amp-logo">AMP</h1>
      <div class="right-of-logo">
        {!isMainPage && (<a href="/">← Back to main</a>)}
      </div>
      <ul>
        <li>
          <a href="https://github.com/ampproject/amphtml/blob/master/contributing/DEVELOPING.md"
            target="_blank">
            Developing
          </a>
        </li>
        <li class="divider">
          <a href="https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md"
            target="_blank">
            Contributing
          </a>
        </li>
        <li>
          <a href="https://github.com/ampproject/amphtml/"
            target="_blank">
            Github
          </a>
        </li>
        <li>
          <a href="https://travis-ci.org/ampproject/amphtml"
            target="_blank">
            Travis
          </a>
        </li>
        <li>
          <a href="https://percy.io/ampproject/amphtml/"
            target="_blank">
            Percy
          </a>
        </li>
      </ul>
    </header>
  );
}

function FileList({files}) {
  return (
    <ul class="file-list">
      {files.map(({name, href}) => (<li>
        <a class="file-link" href={href}>{name}</a>
      </li>))}
    </ul>
  );
}

function ProxyFormOptional({isMainPage}) {
  return isMainPage ? (<ProxyForm />) : null;
}

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = window.AMP_PREACT_STATE;
  }

  changeDocumentMode = event => {
    this.setState({selectModePrefix: event.target.value});
  }

  render(unusedProps, state) {
    return (
      <div>
        <wrap>
          <Header isMainPage={state.isMainPage} />
          <ProxyFormOptional isMainPage={state.isMainPage} />
        </wrap>
        <div class="file-list-container">
          <wrap>
            <h3 class="code" id="basepath">
              {state.basepath}
              <a href="https://github.com/ampproject/amphtml/find/master"
                target="_blank"
                class="find-icon">
                Find file
              </a>
            </h3>
            <div class="push-right-after-heading">
              <SelectModeOptional
                basepath={state.basepath}
                changeHandler={this.changeDocumentMode}
                value={this.selectModePrefix} />
              <a href="/~" class="underlined">List root directory</a>
            </div>
            <FileList files={this.getFileSet_()} />
          </wrap>
        </div>
      </div>
    );
  }

  getFileSet_() {
    return this.state.fileSet.map(name => {
      const prefix = /\.html$/.test(name) ?
        this.state.selectModePrefix :
        '/';

      // TODO(alanorozco): Fix href generation mess.
      const href = [
        prefix,
        this.state.basepath.replace(/(^\/)|(\/$)/g, ''),
        '/',
        name,
      ].join('').replace(/^\/\//, '/');

      return {name, href};
    });
  }
}


render(<Main />, document.querySelector('.component-root'));
