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
 * Create a React component that can render Promises.
 * Note: The nested class cannot be named Deferred, since src/promise.js already
 * exports a class with that name.
 * @return {function(new:React.Component, !Object)}
 */
function createDeferred_() {
  const React = requireExternal('react');

  /** @extends {React.Component} */
  class DeferredType extends React.Component {
    /**
     * @param {!Object} props
     */
    constructor(props) {
      super(props);
      this.state = {value: this.props.initial};
    }

    /** @override */
    shouldComponentUpdate() {
      return this.state.value == this.props.initial;
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

  DeferredType.defaultProps = {
    initial: '',
  };

  return DeferredType;
}


/** @private {?function(new:React.Component, !Object)} */
let DeferredType_ = null;

/**
 * Creates a single date picker.
 * @return {function(new:React.Component, !Object)} A date picker class
 */
export function createDeferred() {
  if (!DeferredType_) {
    DeferredType_ = createDeferred_();
  }
  return DeferredType_;
}

