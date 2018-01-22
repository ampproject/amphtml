/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {requireExternal} from '../../../src/module';


/**
 * Create a React component that can render Promises
 * @return {function(new:React.Component, !Object)}
 */
function createDeferred_() {
  const React = requireExternal('react');

  class Deferred extends React.Component {
    /**
     * @param {!Object} props
     */
    constructor(props) {
      super(props);
      this.state = {value: ''};
    }

    /** @override */
    shouldComponentUpdate() {
      return !this.state.value;
    }

    /** @override */
    componentDidMount() {
      this.props.promise.then(value => this.setState({value}));
    }

    /** @override */
    render() {
      return this.props.then(this.state.value);
    }
  }

  return Deferred;
}

/** @private {?function(new:React.Component, !Object)} */
let Deferred_ = null;

/**
 * Creates a single date picker.
 * @return {function(new:React.Component, !Object)} A date picker class
 */
export function createDeferred() {
  if (!Deferred_) {
    Deferred_ = createDeferred_();
  }
  return Deferred_;
}

