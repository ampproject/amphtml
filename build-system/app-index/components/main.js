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
import {ExamplesDocumentModeSelect} from './examples-document-mode-select';
import {ProxyForm} from './proxy-form';


class Main extends Component {

  constructor(props) {
    super(props);
    this.state = window.AMP_PREACT_STATE;
  }

  changeDocumentMode = event => {
    this.setState({selectModePrefix: event.target.value});
  }

  render(unusedProps, state) {
    const documentSelectModeOrNothing = !/^\/examples/.test(state.basepath) ?
      null : (
        <ExamplesDocumentModeSelect
          onchange={this.changeDocumentMode}
          value={state.selectModePrefix} />
      );

    return (
      <div>
        <wrap>
          <header>
            <h1 class="amp-logo">AMP</h1>
            <div class="right-of-logo">
              {!state.isMainPage && (
                <a href="/">← Back to main</a>
              )}
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
          {state.isMainPage && <ProxyForm />}
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
              {documentSelectModeOrNothing}
              <a href="/~" class="underlined">List root directory</a>
            </div>
            <ul class="file-list">
              {state.fileSet.map(file => this.renderLink(file, state))}
            </ul>
          </wrap>
        </div>
      </div>
    );
  }

  renderLink(file) {
    const prefix = /\.html$/.test(file) ?
      this.state.selectModePrefix :
      '/';

    // TODO(alanorozco): Fix path generation mess.
    const href = [
      prefix,
      this.state.basepath.replace(/(^\/)|(\/$)/g, ''),
      '/',
      file,
    ].join('').replace(/^\/\//, '/');

    return (
      <li>
        <a class="file-link"href={href}>{file}</a>
      </li>
    );
  }
}


render(<Main />, document.querySelector('.component-root'));
