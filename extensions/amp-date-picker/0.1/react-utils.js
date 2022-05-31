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
