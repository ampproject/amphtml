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

// Need h, as it will be used when built by babel
import { h, Component, render } from "preact";

// TODO(alanorozco): Write this in ES2015 to be transpiled.
function getLocation(href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
}

function attachProxyFormListeners() {
  var form = document.getElementById('proxy-form');
  var input = document.getElementById('proxy-input');

  form.addEventListener('submit', function(e) {
    var location = getLocation(input.value);
    var suffix =
      location.host +
      location.pathname +
      location.search +
      location.hash;
    var redirectUrl = '/proxy/s/' + suffix;

    e.preventDefault();

    window.location = redirectUrl;
  });
}

function attachListeners() {
  attachProxyFormListeners();
}

class App extends Component {
  
  componentDidMount() {
    attachListeners();
  }

  render() {
    return (
      <wrap>
        <header>
          <h1 class="amp-logo">AMP</h1>
          <ul>
            <li>
              <a href="https://github.com/ampproject/amphtml/blob/master/contributing/DEVELOPING.md">
                Developing
              </a>
            </li>
            <li class="divider">
              <a href="https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md">
                Contributing
              </a>
            </li>
            <li>
              <a href="https://github.com/ampproject/amphtml/">Github</a>
            </li>
            <li>
              <a href="https://travis-ci.org/ampproject/amphtml">Travis</a>
            </li>
            <li>
              <a href="https://percy.io/ampproject/amphtml/">Percy</a>
            </li>
          </ul>
        </header>
        <div class="block proxy-form-contianer">
          <form id="proxy-form">
            <label for="proxy-input">
              <span>Load URL by Proxy</span>
              <input
                type="url"
                class="text-input"
                id="proxy-input"
                placeholder="https://"
              />
            </label>
            <div class="form-info">
              <a href="https://github.com/ampproject/amphtml/blob/master/contributing/TESTING.md#document-proxy">
                What's this?
              </a>
            </div>
          </form>
        </div>
      </wrap>
    );
  }
}

render(<App />, document.getElementById("root"));
