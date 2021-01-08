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
 * @return {typeof React.Component}
 */
function createDeferred_() {
  const react = requireExternal('react');

  /**
   * Creates an instance of DeferredType.
   * @param {!Object} props
   * @struct
   * @constructor
   * @extends {React.Component}
   */
  function DeferredType(props) {
    react.Component.call(this, props);
    const self = /** @type {!React.Component} */ (this);
    self.state = {value: this.props.initial};
  }

  DeferredType.prototype = Object.create(react.Component.prototype);
  DeferredType.prototype.constructor = DeferredType;

  /** @override */
  DeferredType.prototype.componentWillReceiveProps = function (nextProps) {
    const promise = nextProps['promise'];
    if (promise) {
      promise.then((value) => this.setState({value}));
    }
  };

  /** @override */
  DeferredType.prototype.shouldComponentUpdate = function (props, state) {
    const self = /** @type {!React.Component} */ (this);
    return Boolean(
      shallowDiffers(this.props, props) || shallowDiffers(self.state, state)
    );
  };

  /** @override */
  DeferredType.prototype.componentDidMount = function () {
    this.props.promise.then((value) => this.setState({value}));
  };

  /** @override */
  DeferredType.prototype.render = function () {
    const self = /** @type {!React.Component} */ (this);
    return this.props.then(self.state.value);
  };

  DeferredType['defaultProps'] = {
    initial: '',
  };

  return DeferredType;
}

/**
 * Duplicated from Preact PureComponent implementation.
 * https://github.com/developit/preact-compat/blob/ae018abb/src/index.js#L402
 * Shallow compare a and b.
 * @param {*} a
 * @param {*} b
 * @return {*} TODO(#23582): Specify return type
 */
function shallowDiffers(a, b) {
  for (const i in a) {
    if (!(i in b)) {
      return true;
    }
  }
  for (const i in b) {
    if (a[i] !== b[i]) {
      return true;
    }
  }
  return false;
}

/** @private {?typeof React.Component} */
let DeferredType_ = null;

/**
 * Creates a single date picker.
 * @return {typeof React.Component} A date picker class
 */
export function createDeferred() {
  if (!DeferredType_) {
    DeferredType_ = createDeferred_();
  }
  return DeferredType_;
}
