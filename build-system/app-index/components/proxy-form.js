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

import { h, render, Component } from 'preact';

class ProxyForm extends Component {

  constructor() {
    super();
    this.setState({
      proxyInput: ''
    });
  }

  handleProxyInputChange(event) {
    this.setState({
      ...this.state,
      proxyInput: event.target.value
    });
  }
  
  handleSubmit(event) {
    event.preventDefault();

    const suffix = this.state.proxyInput.replace(/^http(s?):\/\//i, '');
    const redirectUrl = '/proxy/s/' + suffix;

    window.location = redirectUrl;
  }

  render() {
    return (
      <div class="block proxy-form-container">
        <form id="proxy-form" onSubmit={(event) => this.handleSubmit(event)}>
          <label for="proxy-input">
            <span>Load URL by Proxy</span>
            {/* 
                Following regex is gnarly, but works. 
                Taken from https://justmarkup.com/log/2012/12/input-url/
            */}
            <input type="text" class="text-input" id="proxy-input"
              required aria-required="true"
              placeholder="https://"
              value={this.state.proxyInput} 
              onChange={(event) => this.handleProxyInputChange(event)}
              pattern="^(https?://)?[^\s]+$" />
            </label>
            <div class="form-info">
              <a href="https://github.com/ampproject/amphtml/blob/master/contributing/TESTING.md#document-proxy">
                What's this?
              </a>
            </div>
          </form>
        </div>
    );
  }
}


render(<ProxyForm />, document.getElementById('proxy-form-root'));
