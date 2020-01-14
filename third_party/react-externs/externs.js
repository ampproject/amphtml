/**
 * @fileoverview Closure Compiler externs for Facebook React.js 0.13.2.
 * @see http://reactjs.org
 * @externs
 */

/**
 * @const
 */
var React = {};

/**
 * @type {string}
 */
React.version;

/**
 * @param {boolean} shouldUseTouch
 */
React.initializeTouchEvents = function(shouldUseTouch) {};

React.createClass = function(specification) {};
/**
 *
 * @param {*} type
 * @param {*=} opt_props
 * @param {*=} opt_children
 */
React.createElement = function(type, opt_props, opt_children) {};
React.cloneElement = function(element, props, children) {};
React.createFactory = function(reactClass) {};

/**
 * @param {React.Component|Element} componentOrElement
 * @return {Element} The root node of this element.
 */
React.findDOMNode = function(componentOrElement) {};

/**
 * @param {*} componentClass
 * @return {boolean}
 * @deprecated
 */
React.isValidClass = function(componentClass) {};

/**
 * @param {?Object} object
 * @return {boolean} True if `object` is a valid component.
 */
React.isValidElement = function(object) {};

/**
 * @param {React.Component} container
 * @param {Element} mountPoint
 * @param {Function=} callback
 * @return {React.Component}
 * @deprecated
 */
React.renderComponent = function(container, mountPoint, callback) {};

/**
 * @param {React.Component} container
 * @param {Element} mountPoint
 * @param {Function=} callback
 * @return {React.Component}
 */
React.render = function(container, mountPoint, callback) {};


/**
 * @param {Element} container
 */
React.unmountComponentAtNode = function(container) {};

/**
 * @param {React.Component} component
 * @return {string}
 * @deprecated
 */
React.renderComponentToString = function(component) {};

/**
 * @param {React.Component} component
 * @return {string}
 */
React.renderToString = function(component) {};

/**
 * @param {React.Component} component
 * @return {string}
 * @deprecated
 */
React.renderComponentToStaticMarkup = function(component) {};

/**
 * @param {React.Component} component
 * @return {string}
 */
React.renderToStaticMarkup = function(component) {};

/**
 * Constructs a component instance of `constructor` with `initialProps` and
 * renders it into the supplied `container`.
 *
 * @param {Function} constructor React component constructor.
 * @param {Object} props Initial props of the component instance.
 * @param {Element} container DOM element to render into.
 * @return {React.Component} Component instance rendered in `container`.
 */
React.constructAndRenderComponent = function(constructor, props, container) {};

/**
 * Constructs a component instance of `constructor` with `initialProps` and
 * renders it into a container node identified by supplied `id`.
 *
 * @param {Function} componentConstructor React component constructor
 * @param {Object} props Initial props of the component instance.
 * @param {string} id ID of the DOM element to render into.
 * @return {React.Component} Component instance rendered in the container node.
 */
React.constructAndRenderComponentByID = function(componentConstructor, props,
  id) {};

React.withContext = function() {};

/**
 * @constructor
 */
React.Component = function(props) {};

/**
 * @type {!Object}
 */
React.Component.prototype.props;

/**
 * @type {Object}
 */
React.Component.prototype.state;

/**
 * @type {Object}
 */
React.Component.prototype.refs;

/**
 * @type {Object}
 */
React.Component.prototype.context;

/**
 * @type {Object}
 * @package
 */
React.Component.prototype.propTypes;

/**
 * @type {Object}
 * @package
 */
React.Component.prototype.contextTypes;

/**
 * @type {Object}
 */
React.Component.prototype.mixins;

/**
 * @param {Object} nextProps
 * @param {Function=} callback
 */
React.Component.prototype.setProps = function(nextProps, callback) {};

/**
 * @return {Object}
 */
React.Component.prototype.getInitialState = function() {};

/**
 * @return {Object}
 */
React.Component.prototype.getDefaultProps = function() {};

/**
 * @return {Object}
 */
React.Component.prototype.getChildContext = function() {};

/**
 * @return {Element}
 */
React.Component.prototype.getDOMNode = function() {};

/**
 * @param {Object} nextProps
 * @param {Function=} callback
 */
React.Component.prototype.replaceProps = function(nextProps, callback) {};

/**
 * @param {React.Component} targetComponent
 * @return {React.Component}
 */
React.Component.prototype.transferPropsTo = function(targetComponent) {};

/**
 * @param {Function=} callback
 */
React.Component.prototype.forceUpdate = function(callback) {};

/**
 * @return {boolean}
 */
React.Component.prototype.isMounted = function() {};

/**
 * @param {Object} nextState
 * @param {Function=} callback
 */
React.Component.prototype.setState = function(nextState, callback) {};

/**
 * @param {Object} nextState
 * @param {Function=} callback
 */
React.Component.prototype.replaceState = function(nextState, callback) {};

/**
 * @package
 */
React.Component.prototype.componentWillMount = function() {};

/**
 * @param {Element} element
 * @package
 */
React.Component.prototype.componentDidMount = function(element) {};

/**
 * @param {Object} nextProps
 * @package
 */
React.Component.prototype.componentWillReceiveProps = function(
  nextProps) {};

/**
 * @param {Object} nextProps
 * @param {Object} nextState
 * @return {boolean}
 * @package
 */
React.Component.prototype.shouldComponentUpdate = function(
  nextProps, nextState) {};

/**
 * @param {Object} nextProps
 * @param {Object} nextState
 * @package
 */
React.Component.prototype.componentWillUpdate = function(
  nextProps, nextState) {};

/**
 * @param {Object} prevProps
 * @param {Object} prevState
 * @param {Element} rootNode
 * @package
 */
React.Component.prototype.componentDidUpdate = function(
  prevProps, prevState, rootNode) {};

/**
 * @package
 */
React.Component.prototype.componentWillUnmount = function() {};

/**
 * @return {React.Component}
 * @package
 */
React.Component.prototype.render = function() {};

/**
 * Interface to preserve React attributes for advanced compilation.
 * @interface
 */
React.ReactAtrribute = function() {};

/**
 * @type {Object}
 */
React.ReactAtrribute.dangerouslySetInnerHTML;

/**
 * @type {string}
 */
React.ReactAtrribute.__html;

/**
 * @type {string}
 */
React.ReactAtrribute.key;

/**
 * @type {string}
 */
React.ReactAtrribute.ref;

// Attributes not defined in default Closure Compiler DOM externs.
// http://facebook.github.io/react/docs/tags-and-attributes.html#html-attributes
// It happens because React favors camelCasing over allinlowercase.
// How to update list:
//   1) Open http://facebook.github.io/react/docs/tags-and-attributes.html#html-attributes
//   2) Github Search in google/closure-compiler for attribute.

/**
 * @type {boolean}
 */
React.ReactAtrribute.allowFullScreen;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoComplete;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoFocus;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoPlay;

/**
 * @type {boolean}
 */
React.ReactAtrribute.noValidate;

/**
 * @type {boolean}
 */
React.ReactAtrribute.spellCheck;


// http://facebook.github.io/react/docs/events.html

/**
 * @type {Function}
 */
React.ReactAtrribute.onCopy;

/**
 * @type {Function}
 */
React.ReactAtrribute.onCut;

/**
 * @type {Function}
 */
React.ReactAtrribute.onPaste;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyDown;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyPress;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyUp;

/**
 * @type {Function}
 */
React.ReactAtrribute.onFocus;

/**
 * @type {Function}
 */
React.ReactAtrribute.onBlur;

/**
 * @type {Function}
 */
React.ReactAtrribute.onChange;

/**
 * @type {Function}
 */
React.ReactAtrribute.onInput;

/**
 * @type {Function}
 */
React.ReactAtrribute.onSubmit;

/**
 * @type {Function}
 */
React.ReactAtrribute.onClick;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDoubleClick;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDrag;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragEnd;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragEnter;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragExit;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragLeave;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragOver;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragStart;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDrop;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseDown;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseEnter;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseLeave;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseMove;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseUp;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchCancel;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchEnd;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchMove;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchStart;

/**
 * @type {Function}
 */
React.ReactAtrribute.onScroll;

/**
 * @type {Function}
 */
React.ReactAtrribute.onWheel;

/**
 * @type {Object}
 * @const
 */
React.DOM = {};

/**
 * @typedef {
 *   boolean|number|string|React.Component|
 *   Array.<boolean>|Array.<number>|Array.<string>|Array.<React.Component>
 * }
 */
React.ChildrenArgument;

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.a = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.abbr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.address = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.area = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.article = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.aside = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.audio = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.b = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.base = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.bdi = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.bdo = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.big = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.blockquote = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.body = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.br = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.button = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.canvas = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.caption = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.circle = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.cite = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.code = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.col = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.colgroup = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.data = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.datalist = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.dd = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.defs = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.del = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.details = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.dfn = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.div = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.dl = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.dt = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.ellipse = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.em = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.embed = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.fieldset = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.figcaption = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.figure = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.footer = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.form = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.g = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h1 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h2 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h3 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h4 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h5 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.h6 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.head = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.header = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.hr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.html = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.i = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.iframe = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.img = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.input = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.ins = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.kbd = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.keygen = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.label = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.legend = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.li = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.line = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.linearGradient = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.link = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.main = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.map = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.mark = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.mask = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.menu = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.menuitem = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.meta = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.meter = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.nav = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.noscript = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.object = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.ol = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.optgroup = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.option = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.output = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.p = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.param = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.path = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.pattern = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.polygon = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.polyline = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.pre = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.progress = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.q = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.radialGradient = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.rect = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.rp = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.rt = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.ruby = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.s = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.samp = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.script = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.section = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.select = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.small = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.source = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.span = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.stop = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.strong = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.style = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.sub = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.svg = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.table = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.tbody = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.td = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.text = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.textarea = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.tfoot = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.th = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.thead = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.time = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.title = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.tr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.track = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.tspan = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.u = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.ul = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.var = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.video = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.Component}
 * @package
 */
React.DOM.wbr = function(props, children) {};

/**
 * @typedef {function(boolean, boolean, Object, string, string, string): boolean} React.ChainableTypeChecker
 */
React.ChainableTypeChecker;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.weak;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.weak.isRequired;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.isRequired;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.isRequired.weak;

/**
 * @type {Object}
 */
React.PropTypes = {
  /** @type {React.ChainableTypeChecker} */
  any: function() {},
  /** @type {React.ChainableTypeChecker} */
  array: function() {},
  /**
   * @param {React.ChainableTypeChecker} typeChecker
   * @return {React.ChainableTypeChecker}
   */
  arrayOf: function(typeChecker) {},
  /** @type {React.ChainableTypeChecker} */
  bool: function() {},
  /** @type {React.ChainableTypeChecker} */
  component: function() {},
  /** @type {React.ChainableTypeChecker} */
  func: function() {},
  /** @type {React.ChainableTypeChecker} */
  node: function() {},
  /** @type {React.ChainableTypeChecker} */
  number: function() {},
  /** @type {React.ChainableTypeChecker} */
  object: function() {},
  /**
   * @param {React.ChainableTypeChecker} typeChecker
   * @return {React.ChainableTypeChecker}
   */
  objectOf: function(typeChecker) {},
  /** @type {React.ChainableTypeChecker} */
  string: function() {},
  /**
   * @param {Array.<*>} expectedValues
   * @return {React.ChainableTypeChecker}
   */
  oneOf: function(expectedValues) {},
  /**
   * @param {Array.<React.ChainableTypeChecker>} typeCheckers
   * @return {React.ChainableTypeChecker}
   */
  oneOfType: function(typeCheckers) {},
  /**
   * @param {function (new:Object, ...?)} expectedClass
   * @return {React.ChainableTypeChecker}
   */
  instanceOf: function(expectedClass) {},
  /** @type {React.ChainableTypeChecker} */
  renderable: function() {},
  /** @type {React.ChainableTypeChecker} */
  /**
   * @param {Object.<React.ChainableTypeChecker>} shapeTypes
   * @return {React.ChainableTypeChecker}
   */
  shape: function(shapeTypes) {}
};

/**
 * @type {Object}
 */
React.Children;

/**
 * @param {Object} children Children tree container.
 * @param {function(*, number)} mapFunction
 * @param {*=} mapContext Context for mapFunction.
 * @return {Object|undefined} Object containing the ordered map of results.
 */
React.Children.map;

/**
 * @param {Object} children Children tree container.
 * @param {function(*, number)} mapFunction
 * @param {*=} mapContext Context for mapFunction.
 */
React.Children.forEach;

/**
 * @param {Object} children Children tree container.
 * @return {number} Total number of components in children.
 */
React.Children.count;

/**
 * @param {Object} children Children tree container.
 * @return {Object|undefined}
 */
React.Children.only;

/**
 * @type {Object}
 */
React.addons;

/**
 * @param {Object|string} objectOrClassName
 * @param {...string} classNames
 * @return {string}
 */
React.addons.classSet;

/**
 * @type {React.Component}
 */
React.addons.CSSTransitionGroup;

/**
 * @type {Object}
 */
React.addons.Perf;

React.addons.Perf.start = function() {};

React.addons.Perf.stop = function() {};

/**
 * @return {Array.<React.addons.Perf.Measurement>}
 */
React.addons.Perf.getLastMeasurements = function() {};

/**
 * @param {React.addons.Perf.Measurement=} measurements
 */
React.addons.Perf.printExclusive = function(measurements) {};

/**
 * @param {React.addons.Perf.Measurement=} measurements
 */
React.addons.Perf.printInclusive = function(measurements) {};

/**
 * @param {React.addons.Perf.Measurement=} measurements
 */
React.addons.Perf.printWasted = function(measurements) {};

/**
 * @typedef {{
 *     exclusive: !Object.<string, number>,
 *     inclusive: !Object.<string, number>,
 *     render: !Object.<string, number>,
 *     counts: !Object.<string, number>,
 *     writes: !Object.<string, {type: string, time: number, args: Array}>,
 *     displayNames: !Object.<string, {current: string, owner: string}>,
 *     totalTime: number
 * }}
 */
React.addons.Perf.Measurement;

React.addons.PureRenderMixin;
React.addons.LinkedStateMixin;
React.addons.TransitionGroup;
React.addons.batchedUpdates;
React.addons.cloneWithProps;
React.addons.update;

/**
 * @param {Object} children
 * @return {Object}
 */
React.addons.createFragment;

/**
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */
React.__spread = function(a, b) {};
