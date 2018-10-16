/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _preact = __webpack_require__(1);

	var _dbmon = __webpack_require__(2);

	var _index = __webpack_require__(3);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { return;("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { return;("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/** "Hello World" component w/ a button click listener. */
	var Hello = function (_Component) {
	  _inherits(Hello, _Component);

	  function Hello(props) {
	    _classCallCheck(this, Hello);

	    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

	    _this.state = { clicked: false };
	    return _this;
	  }

	  Hello.prototype.render = function render() {
	    var _this2 = this;

	    return (0, _preact.h)(
	      'div',
	      null,
	      (0, _preact.h)(
	        'p',
	        null,
	        'Hello ',
	        this.props.name,
	        '! Button was clicked? ',
	        this.state.clicked
	      ),
	      (0, _preact.h)(
	        'button',
	        { onClick: function onClick() {
	            return _this2.setState({ clicked: true });
	          } },
	        'Button'
	      )
	    );
	  };

	  return Hello;
	}(_preact.Component);

	/** To-do list adapted from example on https://reactjs.org. */


	var TodoApp = function (_Component2) {
	  _inherits(TodoApp, _Component2);

	  function TodoApp(props) {
	    _classCallCheck(this, TodoApp);

	    var _this3 = _possibleConstructorReturn(this, _Component2.call(this, props));

	    _this3.state = {
	      items: [],
	      text: '<Add TODO>',
	      id: 0,
	      focused: false
	    };

	    _this3.handleChange = _this3.handleChange.bind(_this3);
	    _this3.handleFocus = _this3.handleFocus.bind(_this3);
	    _this3.handleSubmit = _this3.handleSubmit.bind(_this3);
	    return _this3;
	  }

	  TodoApp.prototype.render = function render() {
	    return (0, _preact.h)(
	      'div',
	      null,
	      (0, _preact.h)(
	        'h3',
	        null,
	        'TODO'
	      ),
	      (0, _preact.h)(TodoList, { items: this.state.items }),
	      (0, _preact.h)('input', {
	        onChange: this.handleChange,
	        onFocus: this.handleFocus,
	        value: this.state.text
	      }),
	      (0, _preact.h)(
	        'button',
	        { onClick: this.handleSubmit },
	        'Add #',
	        this.state.items.length + 1
	      )
	    );
	  };

	  TodoApp.prototype.handleChange = function handleChange(e) {
	    this.setState({ text: e.target.value });
	  };

	  TodoApp.prototype.handleFocus = function handleFocus(e) {
	    // Clear placeholder text on first focus.
	    if (!this.state.focused) {
	      this.setState({ text: '', focused: true });
	    }
	  };

	  TodoApp.prototype.handleSubmit = function handleSubmit(e) {
	    if (!this.state.text.length) {
	      return;
	    }
	    var newItem = {
	      text: this.state.text,
	      id: this.state.id
	    };
	    this.setState(function (prevState) {
	      return {
	        items: prevState.items.concat(newItem),
	        text: '',
	        id: prevState.id + 1
	      };
	    });
	  };

	  return TodoApp;
	}(_preact.Component);

	var TodoList = function (_Component3) {
	  _inherits(TodoList, _Component3);

	  function TodoList() {
	    _classCallCheck(this, TodoList);

	    return _possibleConstructorReturn(this, _Component3.apply(this, arguments));
	  }

	  TodoList.prototype.render = function render() {
	    return (0, _preact.h)(
	      'ul',
	      null,
	      this.props.items.map(function (item) {
	        return (0, _preact.h)(
	          'li',
	          { key: item.id },
	          item.text
	        );
	      })
	    );
	  };

	  return TodoList;
	}(_preact.Component);

	/** Timer example from https://reactjs.org */


	var Timer = function (_Component4) {
	  _inherits(Timer, _Component4);

	  function Timer(props) {
	    _classCallCheck(this, Timer);

	    var _this5 = _possibleConstructorReturn(this, _Component4.call(this, props));

	    _this5.state = { seconds: 0 };
	    return _this5;
	  }

	  Timer.prototype.tick = function tick() {
	    this.setState(function (prevState) {
	      return {
	        seconds: prevState.seconds + 1
	      };
	    });
	  };

	  Timer.prototype.componentDidMount = function componentDidMount() {
	    var _this6 = this;

	    this.interval = setInterval(function () {
	      return _this6.tick();
	    }, 1000);
	  };

	  Timer.prototype.componentWillUnmount = function componentWillUnmount() {
	    clearInterval(this.interval);
	  };

	  Timer.prototype.render = function render() {
	    return (0, _preact.h)(
	      'div',
	      null,
	      'Seconds: ',
	      this.state.seconds
	    );
	  };

	  return Timer;
	}(_preact.Component);

	// TODO(willchou): Support rendering to nodes other than body.
	// render(<Hello />, document.body);
	// render(<TodoApp />, document.body);
	// render(<Timer />, document.body);
	// render(<DBMon />, document.body);


	(0, _preact.render)((0, _preact.h)(_index2.default, null), document.body);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	!function(global, factory) {
	     true ? factory(exports) : 'function' == typeof define && define.amd ? define([ 'exports' ], factory) : factory(global.preact = global.preact || {});
	}(this, function(exports) {
	    function VNode(nodeName, attributes, children) {
	        this.nodeName = nodeName;
	        this.attributes = attributes;
	        this.children = children;
	        this.key = attributes && attributes.key;
	    }
	    function h(nodeName, attributes) {
	        var lastSimple, child, simple, i, children = [];
	        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
	        if (attributes && attributes.children) {
	            if (!stack.length) stack.push(attributes.children);
	            delete attributes.children;
	        }
	        while (stack.length) if ((child = stack.pop()) instanceof Array) for (i = child.length; i--; ) stack.push(child[i]); else if (null != child && child !== !1) {
	            if ('number' == typeof child || child === !0) child = String(child);
	            simple = 'string' == typeof child;
	            if (simple && lastSimple) children[children.length - 1] += child; else {
	                children.push(child);
	                lastSimple = simple;
	            }
	        }
	        var p = new VNode(nodeName, attributes || void 0, children);
	        if (options.vnode) options.vnode(p);
	        return p;
	    }
	    function extend(obj, props) {
	        if (props) for (var i in props) obj[i] = props[i];
	        return obj;
	    }
	    function clone(obj) {
	        return extend({}, obj);
	    }
	    function delve(obj, key) {
	        for (var p = key.split('.'), i = 0; i < p.length && obj; i++) obj = obj[p[i]];
	        return obj;
	    }
	    function isFunction(obj) {
	        return 'function' == typeof obj;
	    }
	    function isString(obj) {
	        return 'string' == typeof obj;
	    }
	    function hashToClassName(c) {
	        var str = '';
	        for (var prop in c) if (c[prop]) {
	            if (str) str += ' ';
	            str += prop;
	        }
	        return str;
	    }
	    function cloneElement(vnode, props) {
	        return h(vnode.nodeName, extend(clone(vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
	    }
	    function createLinkedState(component, key, eventPath) {
	        var path = key.split('.');
	        return function(e) {
	            var t = e && e.target || this, state = {}, obj = state, v = isString(eventPath) ? delve(e, eventPath) : t.nodeName ? t.type.match(/^che|rad/) ? t.checked : t.value : e, i = 0;
	            for (;i < path.length - 1; i++) obj = obj[path[i]] || (obj[path[i]] = !i && component.state[path[i]] || {});
	            obj[path[i]] = v;
	            component.setState(state);
	        };
	    }
	    function enqueueRender(component) {
	        if (!component._dirty && (component._dirty = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
	    }
	    function rerender() {
	        var p, list = items;
	        items = [];
	        while (p = list.pop()) if (p._dirty) renderComponent(p);
	    }
	    function isFunctionalComponent(vnode) {
	        var nodeName = vnode && vnode.nodeName;
	        return nodeName && isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render);
	    }
	    function buildFunctionalComponent(vnode, context) {
	        return vnode.nodeName(getNodeProps(vnode), context || EMPTY);
	    }
	    function isSameNodeType(node, vnode) {
	        if (isString(vnode)) return node instanceof Text;
	        if (isString(vnode.nodeName)) return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	        if (isFunction(vnode.nodeName)) return (node._componentConstructor ? node._componentConstructor === vnode.nodeName : !0) || isFunctionalComponent(vnode); else ;
	    }
	    function isNamedNode(node, nodeName) {
	        return node.normalizedNodeName === nodeName || toLowerCase(node.nodeName) === toLowerCase(nodeName);
	    }
	    function getNodeProps(vnode) {
	        var props = clone(vnode.attributes);
	        props.children = vnode.children;
	        var defaultProps = vnode.nodeName.defaultProps;
	        if (defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
	        return props;
	    }
	    function removeNode(node) {
	        var p = node.parentNode;
	        if (p) p.removeChild(node);
	    }
	    function setAccessor(node, name, old, value, isSvg) {
	        if ('className' === name) name = 'class';
	        if ('class' === name && value && 'object' == typeof value) value = hashToClassName(value);
	        if ('key' === name) ; else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
	            if (!value || isString(value) || isString(old)) node.style.cssText = value || '';
	            if (value && 'object' == typeof value) {
	                if (!isString(old)) for (var i in old) if (!(i in value)) node.style[i] = '';
	                for (var i in value) node.style[i] = 'number' == typeof value[i] && !NON_DIMENSION_PROPS[i] ? value[i] + 'px' : value[i];
	            }
	        } else if ('dangerouslySetInnerHTML' === name) node.innerHTML = value && value.__html || ''; else if ('o' == name[0] && 'n' == name[1]) {
	            var l = node._listeners || (node._listeners = {});
	            name = toLowerCase(name.substring(2));
	            if (value) {
	                if (!l[name]) node.addEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
	            } else if (l[name]) node.removeEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
	            l[name] = value;
	        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
	            setProperty(node, name, null == value ? '' : value);
	            if (null == value || value === !1) node.removeAttribute(name);
	        } else {
	            var ns = isSvg && name.match(/^xlink\:?(.+)/);
	            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1])); else node.removeAttribute(name); else if ('object' != typeof value && !isFunction(value)) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]), value); else node.setAttribute(name, value);
	        }
	    }
	    function setProperty(node, name, value) {
	        try {
	            node[name] = value;
	        } catch (e) {}
	    }
	    function eventProxy(e) {
	        return this._listeners[e.type](options.event && options.event(e) || e);
	    }
	    function collectNode(node) {
	        removeNode(node);
	        if (node instanceof Element) {
	            node._component = node._componentConstructor = null;
	            var _name = node.normalizedNodeName || toLowerCase(node.nodeName);
	            (nodes[_name] || (nodes[_name] = [])).push(node);
	        }
	    }
	    function createNode(nodeName, isSvg) {
	        var name = toLowerCase(nodeName), node = nodes[name] && nodes[name].pop() || (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName));
	        node.normalizedNodeName = name;
	        return node;
	    }
	    function flushMounts() {
	        var c;
	        while (c = mounts.pop()) {
	            if (options.afterMount) options.afterMount(c);
	            if (c.componentDidMount) c.componentDidMount();
	        }
	    }
	    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	        if (!diffLevel++) {
	            isSvgMode = parent instanceof SVGElement;
	            hydrating = dom && !(ATTR_KEY in dom);
	        }
	        var ret = idiff(dom, vnode, context, mountAll);
	        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
	        if (!--diffLevel) {
	            hydrating = !1;
	            if (!componentRoot) flushMounts();
	        }
	        return ret;
	    }
	    function idiff(dom, vnode, context, mountAll) {
	        var originalAttributes = vnode && vnode.attributes;
	        while (isFunctionalComponent(vnode)) vnode = buildFunctionalComponent(vnode, context);
	        if (null == vnode) vnode = '';
	        if (isString(vnode)) {
	            if (dom && dom instanceof Text) {
	                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
	            } else {
	                if (dom) recollectNodeTree(dom);
	                dom = document.createTextNode(vnode);
	            }
	            dom[ATTR_KEY] = !0;
	            return dom;
	        }
	        if (isFunction(vnode.nodeName)) return buildComponentFromVNode(dom, vnode, context, mountAll);
	        var out = dom, nodeName = String(vnode.nodeName), prevSvgMode = isSvgMode, vchildren = vnode.children;
	        isSvgMode = 'svg' === nodeName ? !0 : 'foreignObject' === nodeName ? !1 : isSvgMode;
	        if (!dom) out = createNode(nodeName, isSvgMode); else if (!isNamedNode(dom, nodeName)) {
	            out = createNode(nodeName, isSvgMode);
	            while (dom.firstChild) out.appendChild(dom.firstChild);
	            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	            recollectNodeTree(dom);
	        }
	        var fc = out.firstChild, props = out[ATTR_KEY];
	        if (!props) {
	            out[ATTR_KEY] = props = {};
	            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
	        }
	        diffAttributes(out, vnode.attributes, props);
	        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && fc && fc instanceof Text && !fc.nextSibling) {
	            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
	        } else if (vchildren && vchildren.length || fc) innerDiffNode(out, vchildren, context, mountAll);
	        if (originalAttributes && 'function' == typeof originalAttributes.ref) (props.ref = originalAttributes.ref)(out);
	        isSvgMode = prevSvgMode;
	        return out;
	    }
	    function innerDiffNode(dom, vchildren, context, mountAll) {
	        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren && vchildren.length;
	        if (len) for (var i = 0; i < len; i++) {
	            var _child = originalChildren[i], props = _child[ATTR_KEY], key = vlen ? (c = _child._component) ? c.__key : props ? props.key : null : null;
	            if (null != key) {
	                keyedLen++;
	                keyed[key] = _child;
	            } else if (hydrating || props) children[childrenLen++] = _child;
	        }
	        if (vlen) for (var i = 0; i < vlen; i++) {
	            vchild = vchildren[i];
	            child = null;
	            var key = vchild.key;
	            if (null != key) {
	                if (keyedLen && key in keyed) {
	                    child = keyed[key];
	                    keyed[key] = void 0;
	                    keyedLen--;
	                }
	            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) {
	                c = children[j];
	                if (c && isSameNodeType(c, vchild)) {
	                    child = c;
	                    children[j] = void 0;
	                    if (j === childrenLen - 1) childrenLen--;
	                    if (j === min) min++;
	                    break;
	                }
	            }
	            child = idiff(child, vchild, context, mountAll);
	            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) {
	                if (child === originalChildren[i + 1]) removeNode(originalChildren[i]);
	                dom.insertBefore(child, originalChildren[i] || null);
	            }
	        }
	        if (keyedLen) for (var i in keyed) if (keyed[i]) recollectNodeTree(keyed[i]);
	        while (min <= childrenLen) {
	            child = children[childrenLen--];
	            if (child) recollectNodeTree(child);
	        }
	    }
	    function recollectNodeTree(node, unmountOnly) {
	        var component = node._component;
	        if (component) unmountComponent(component, !unmountOnly); else {
	            if (node[ATTR_KEY] && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);
	            if (!unmountOnly) collectNode(node);
	            var c;
	            while (c = node.lastChild) recollectNodeTree(c, unmountOnly);
	        }
	    }
	    function diffAttributes(dom, attrs, old) {
	        for (var _name in old) if (!(attrs && _name in attrs) && null != old[_name]) setAccessor(dom, _name, old[_name], old[_name] = void 0, isSvgMode);
	        if (attrs) for (var _name2 in attrs) if (!('children' === _name2 || 'innerHTML' === _name2 || _name2 in old && attrs[_name2] === ('value' === _name2 || 'checked' === _name2 ? dom[_name2] : old[_name2]))) setAccessor(dom, _name2, old[_name2], old[_name2] = attrs[_name2], isSvgMode);
	    }
	    function collectComponent(component) {
	        var name = component.constructor.name, list = components[name];
	        if (list) list.push(component); else components[name] = [ component ];
	    }
	    function createComponent(Ctor, props, context) {
	        var inst = new Ctor(props, context), list = components[Ctor.name];
	        Component.call(inst, props, context);
	        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
	            inst.nextBase = list[i].nextBase;
	            list.splice(i, 1);
	            break;
	        }
	        return inst;
	    }
	    function setComponentProps(component, props, opts, context, mountAll) {
	        if (!component._disable) {
	            component._disable = !0;
	            if (component.__ref = props.ref) delete props.ref;
	            if (component.__key = props.key) delete props.key;
	            if (!component.base || mountAll) {
	                if (component.componentWillMount) component.componentWillMount();
	            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
	            if (context && context !== component.context) {
	                if (!component.prevContext) component.prevContext = component.context;
	                component.context = context;
	            }
	            if (!component.prevProps) component.prevProps = component.props;
	            component.props = props;
	            component._disable = !1;
	            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
	            if (component.__ref) component.__ref(component);
	        }
	    }
	    function renderComponent(component, opts, mountAll, isChild) {
	        if (!component._disable) {
	            var skip, rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.prevProps || props, previousState = component.prevState || state, previousContext = component.prevContext || context, isUpdate = component.base, nextBase = component.nextBase, initialBase = isUpdate || nextBase, initialChildComponent = component._component;
	            if (isUpdate) {
	                component.props = previousProps;
	                component.state = previousState;
	                component.context = previousContext;
	                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
	                component.props = props;
	                component.state = state;
	                component.context = context;
	            }
	            component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	            component._dirty = !1;
	            if (!skip) {
	                if (component.render) rendered = component.render(props, state, context);
	                if (component.getChildContext) context = extend(clone(context), component.getChildContext());
	                while (isFunctionalComponent(rendered)) rendered = buildFunctionalComponent(rendered, context);
	                var toUnmount, base, childComponent = rendered && rendered.nodeName;
	                if (isFunction(childComponent)) {
	                    var childProps = getNodeProps(rendered);
	                    inst = initialChildComponent;
	                    if (inst && inst.constructor === childComponent && childProps.key == inst.__key) setComponentProps(inst, childProps, 1, context); else {
	                        toUnmount = inst;
	                        inst = createComponent(childComponent, childProps, context);
	                        inst.nextBase = inst.nextBase || nextBase;
	                        inst._parentComponent = component;
	                        component._component = inst;
	                        setComponentProps(inst, childProps, 0, context);
	                        renderComponent(inst, 1, mountAll, !0);
	                    }
	                    base = inst.base;
	                } else {
	                    cbase = initialBase;
	                    toUnmount = initialChildComponent;
	                    if (toUnmount) cbase = component._component = null;
	                    if (initialBase || 1 === opts) {
	                        if (cbase) cbase._component = null;
	                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
	                    }
	                }
	                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
	                    var baseParent = initialBase.parentNode;
	                    if (baseParent && base !== baseParent) {
	                        baseParent.replaceChild(base, initialBase);
	                        if (!toUnmount) {
	                            initialBase._component = null;
	                            recollectNodeTree(initialBase);
	                        }
	                    }
	                }
	                if (toUnmount) unmountComponent(toUnmount, base !== initialBase);
	                component.base = base;
	                if (base && !isChild) {
	                    var componentRef = component, t = component;
	                    while (t = t._parentComponent) (componentRef = t).base = base;
	                    base._component = componentRef;
	                    base._componentConstructor = componentRef.constructor;
	                }
	            }
	            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
	                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
	                if (options.afterUpdate) options.afterUpdate(component);
	            }
	            var fn, cb = component._renderCallbacks;
	            if (cb) while (fn = cb.pop()) fn.call(component);
	            if (!diffLevel && !isChild) flushMounts();
	        }
	    }
	    function buildComponentFromVNode(dom, vnode, context, mountAll) {
	        var c = dom && dom._component, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
	        while (c && !isOwner && (c = c._parentComponent)) isOwner = c.constructor === vnode.nodeName;
	        if (c && isOwner && (!mountAll || c._component)) {
	            setComponentProps(c, props, 3, context, mountAll);
	            dom = c.base;
	        } else {
	            if (c && !isDirectOwner) {
	                unmountComponent(c, !0);
	                dom = oldDom = null;
	            }
	            c = createComponent(vnode.nodeName, props, context);
	            if (dom && !c.nextBase) {
	                c.nextBase = dom;
	                oldDom = null;
	            }
	            setComponentProps(c, props, 1, context, mountAll);
	            dom = c.base;
	            if (oldDom && dom !== oldDom) {
	                oldDom._component = null;
	                recollectNodeTree(oldDom);
	            }
	        }
	        return dom;
	    }
	    function unmountComponent(component, remove) {
	        if (options.beforeUnmount) options.beforeUnmount(component);
	        var base = component.base;
	        component._disable = !0;
	        if (component.componentWillUnmount) component.componentWillUnmount();
	        component.base = null;
	        var inner = component._component;
	        if (inner) unmountComponent(inner, remove); else if (base) {
	            if (base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);
	            component.nextBase = base;
	            if (remove) {
	                removeNode(base);
	                collectComponent(component);
	            }
	            var c;
	            while (c = base.lastChild) recollectNodeTree(c, !remove);
	        }
	        if (component.__ref) component.__ref(null);
	        if (component.componentDidUnmount) component.componentDidUnmount();
	    }
	    function Component(props, context) {
	        this._dirty = !0;
	        this.context = context;
	        this.props = props;
	        if (!this.state) this.state = {};
	    }
	    function render(vnode, parent, merge) {
	        return diff(merge, vnode, {}, !1, parent);
	    }
	    var options = {};
	    var stack = [];
	    var lcCache = {};
	    var toLowerCase = function(s) {
	        return lcCache[s] || (lcCache[s] = s.toLowerCase());
	    };
	    var resolved = 'undefined' != typeof Promise && Promise.resolve();
	    var defer = resolved ? function(f) {
	        resolved.then(f);
	    } : setTimeout;
	    var EMPTY = {};
	    var ATTR_KEY = 'undefined' != typeof Symbol ? Symbol.for('preactattr') : '__preactattr_';
	    var NON_DIMENSION_PROPS = {
	        boxFlex: 1,
	        boxFlexGroup: 1,
	        columnCount: 1,
	        fillOpacity: 1,
	        flex: 1,
	        flexGrow: 1,
	        flexPositive: 1,
	        flexShrink: 1,
	        flexNegative: 1,
	        fontWeight: 1,
	        lineClamp: 1,
	        lineHeight: 1,
	        opacity: 1,
	        order: 1,
	        orphans: 1,
	        strokeOpacity: 1,
	        widows: 1,
	        zIndex: 1,
	        zoom: 1
	    };
	    var NON_BUBBLING_EVENTS = {
	        blur: 1,
	        error: 1,
	        focus: 1,
	        load: 1,
	        resize: 1,
	        scroll: 1
	    };
	    var items = [];
	    var nodes = {};
	    var mounts = [];
	    var diffLevel = 0;
	    var isSvgMode = !1;
	    var hydrating = !1;
	    var components = {};
	    extend(Component.prototype, {
	        linkState: function(key, eventPath) {
	            var c = this._linkedStates || (this._linkedStates = {});
	            return c[key + eventPath] || (c[key + eventPath] = createLinkedState(this, key, eventPath));
	        },
	        setState: function(state, callback) {
	            var s = this.state;
	            if (!this.prevState) this.prevState = clone(s);
	            extend(s, isFunction(state) ? state(s, this.props) : state);
	            if (callback) (this._renderCallbacks = this._renderCallbacks || []).push(callback);
	            enqueueRender(this);
	        },
	        forceUpdate: function() {
	            renderComponent(this, 2);
	        },
	        render: function() {}
	    });
	    exports.h = h;
	    exports.cloneElement = cloneElement;
	    exports.Component = Component;
	    exports.render = render;
	    exports.rerender = rerender;
	    exports.options = options;
	});
	//# sourceMappingURL=preact.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.DBMon = undefined;

	var _preact = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { return;("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { return;("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ENV = ENV || function () {

	  var first = true;
	  var counter = 0;
	  var data;
	  var _base;
	  (_base = String.prototype).lpad || (_base.lpad = function (padding, toLength) {
	    return padding.repeat((toLength - this.length) / padding.length).concat(this);
	  });

	  function formatElapsed(value) {
	    var str = parseFloat(value).toFixed(2);
	    if (value > 60) {
	      minutes = Math.floor(value / 60);
	      comps = (value % 60).toFixed(2).split('.');
	      seconds = comps[0].lpad('0', 2);
	      ms = comps[1];
	      str = minutes + ":" + seconds + "." + ms;
	    }
	    return str;
	  }

	  function getElapsedClassName(elapsed) {
	    var className = 'Query elapsed';
	    if (elapsed >= 10.0) {
	      className += ' warn_long';
	    } else if (elapsed >= 1.0) {
	      className += ' warn';
	    } else {
	      className += ' short';
	    }
	    return className;
	  }

	  function countClassName(queries) {
	    var countClassName = "label";
	    if (queries >= 20) {
	      countClassName += " label-important";
	    } else if (queries >= 10) {
	      countClassName += " label-warning";
	    } else {
	      countClassName += " label-success";
	    }
	    return countClassName;
	  }

	  function updateQuery(object) {
	    if (!object) {
	      object = {};
	    }
	    var elapsed = Math.random() * 15;
	    object.elapsed = elapsed;
	    object.formatElapsed = formatElapsed(elapsed);
	    object.elapsedClassName = getElapsedClassName(elapsed);
	    object.query = "SELECT blah FROM something";
	    object.waiting = Math.random() < 0.5;
	    if (Math.random() < 0.2) {
	      object.query = "<IDLE> in transaction";
	    }
	    if (Math.random() < 0.1) {
	      object.query = "vacuum";
	    }
	    return object;
	  }

	  function cleanQuery(value) {
	    if (value) {
	      value.formatElapsed = "";
	      value.elapsedClassName = "";
	      value.query = "";
	      value.elapsed = null;
	      value.waiting = null;
	    } else {
	      return {
	        query: "***",
	        formatElapsed: "",
	        elapsedClassName: ""
	      };
	    }
	  }

	  function generateRow(object, keepIdentity, counter) {
	    var nbQueries = Math.floor(Math.random() * 10 + 1);
	    if (!object) {
	      object = {};
	    }
	    object.lastMutationId = counter;
	    object.nbQueries = nbQueries;
	    if (!object.lastSample) {
	      object.lastSample = {};
	    }
	    if (!object.lastSample.topFiveQueries) {
	      object.lastSample.topFiveQueries = [];
	    }
	    if (keepIdentity) {
	      // for Angular optimization
	      if (!object.lastSample.queries) {
	        object.lastSample.queries = [];
	        for (var l = 0; l < 12; l++) {
	          object.lastSample.queries[l] = cleanQuery();
	        }
	      }
	      for (var j in object.lastSample.queries) {
	        var value = object.lastSample.queries[j];
	        if (j <= nbQueries) {
	          updateQuery(value);
	        } else {
	          cleanQuery(value);
	        }
	      }
	    } else {
	      object.lastSample.queries = [];
	      for (var j = 0; j < 12; j++) {
	        if (j < nbQueries) {
	          var value = updateQuery(cleanQuery());
	          object.lastSample.queries.push(value);
	        } else {
	          object.lastSample.queries.push(cleanQuery());
	        }
	      }
	    }
	    for (var i = 0; i < 5; i++) {
	      var source = object.lastSample.queries[i];
	      object.lastSample.topFiveQueries[i] = source;
	    }
	    object.lastSample.nbQueries = nbQueries;
	    object.lastSample.countClassName = countClassName(nbQueries);
	    return object;
	  }

	  function getData(keepIdentity) {
	    var oldData = data;
	    if (!keepIdentity) {
	      // reset for each tick when !keepIdentity
	      data = [];
	      for (var i = 1; i <= ENV.rows; i++) {
	        data.push({ dbname: 'cluster' + i, query: "", formatElapsed: "", elapsedClassName: "" });
	        data.push({ dbname: 'cluster' + i + ' slave', query: "", formatElapsed: "", elapsedClassName: "" });
	      }
	    }
	    if (!data) {
	      // first init when keepIdentity
	      data = [];
	      for (var i = 1; i <= ENV.rows; i++) {
	        data.push({ dbname: 'cluster' + i });
	        data.push({ dbname: 'cluster' + i + ' slave' });
	      }
	      oldData = data;
	    }
	    for (var i in data) {
	      var row = data[i];
	      if (!keepIdentity && oldData && oldData[i]) {
	        row.lastSample = oldData[i].lastSample;
	      }
	      if (!row.lastSample || Math.random() < ENV.mutations()) {
	        counter = counter + 1;
	        if (!keepIdentity) {
	          row.lastSample = null;
	        }
	        generateRow(row, keepIdentity, counter);
	      } else {
	        data[i] = oldData[i];
	      }
	    }
	    first = false;
	    return {
	      toArray: function toArray() {
	        return data;
	      }
	    };
	  }

	  var mutationsValue = 0.5;

	  function mutations(value) {
	    if (value) {
	      mutationsValue = value;
	      // document.querySelector('#ratioval').innerHTML = 'mutations : ' + (mutationsValue * 100).toFixed(0) + '%';
	      return mutationsValue;
	    } else {
	      return mutationsValue;
	    }
	  }

	  // var body = document.querySelector('body');
	  // var theFirstChild = body.firstChild;

	  // var sliderContainer = document.createElement('div');
	  // sliderContainer.style.cssText = "display: flex";
	  // var slider = document.createElement('input');
	  // var text = document.createElement('label');
	  // text.innerHTML = 'mutations : ' + (mutationsValue * 100).toFixed(0) + '%';
	  // text.id = "ratioval";
	  // slider.setAttribute("type", "range");
	  // slider.style.cssText = 'margin-bottom: 10px; margin-top: 5px';
	  // slider.addEventListener('change', function(e) {
	  //   ENV.mutations(e.target.value / 100);
	  // });
	  // sliderContainer.appendChild(text);
	  // sliderContainer.appendChild(slider);
	  // body.insertBefore(sliderContainer, theFirstChild);

	  return {
	    generateData: getData,
	    rows: 50,
	    timeout: 1000,
	    mutations: mutations
	  };
	}();

	var Query = function (_Component) {
	  _inherits(Query, _Component);

	  function Query() {
	    _classCallCheck(this, Query);

	    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
	  }

	  Query.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
	    if (nextProps.elapsedClassName !== this.props.elapsedClassName) return true;
	    if (nextProps.formatElapsed !== this.props.formatElapsed) return true;
	    if (nextProps.query !== this.props.query) return true;
	    return false;
	  };

	  Query.prototype.render = function render() {
	    return (0, _preact.h)(
	      'td',
	      { className: "Query " + this.props.elapsedClassName },
	      this.props.formatElapsed,
	      (0, _preact.h)(
	        'div',
	        { className: 'popover left' },
	        (0, _preact.h)(
	          'div',
	          { className: 'popover-content' },
	          this.props.query
	        ),
	        (0, _preact.h)('div', { className: 'arrow' })
	      )
	    );
	  };

	  return Query;
	}(_preact.Component);

	var Database = function (_Component2) {
	  _inherits(Database, _Component2);

	  function Database() {
	    _classCallCheck(this, Database);

	    return _possibleConstructorReturn(this, _Component2.apply(this, arguments));
	  }

	  Database.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
	    if (nextProps.lastMutationId === this.props.lastMutationId) return false;
	    return true;
	  };

	  Database.prototype.render = function render() {
	    var lastSample = this.props.lastSample;
	    return (0, _preact.h)(
	      'tr',
	      { key: this.props.dbname },
	      (0, _preact.h)(
	        'td',
	        { className: 'dbname' },
	        this.props.dbname
	      ),
	      (0, _preact.h)(
	        'td',
	        { className: 'query-count' },
	        (0, _preact.h)(
	          'span',
	          { className: this.props.lastSample.countClassName },
	          this.props.lastSample.nbQueries
	        )
	      ),
	      this.props.lastSample.topFiveQueries.map(function (query, index) {
	        return (0, _preact.h)(Query, { key: index,
	          query: query.query,
	          elapsed: query.elapsed,
	          formatElapsed: query.formatElapsed,
	          elapsedClassName: query.elapsedClassName });
	      })
	    );
	  };

	  return Database;
	}(_preact.Component);

	var DBMon = exports.DBMon = function (_Component3) {
	  _inherits(DBMon, _Component3);

	  function DBMon(props) {
	    _classCallCheck(this, DBMon);

	    var _this3 = _possibleConstructorReturn(this, _Component3.call(this, props));

	    _this3.state = { databases: [] };
	    return _this3;
	  }

	  DBMon.prototype.loadSamples = function loadSamples() {
	    this.setState({
	      databases: ENV.generateData(true).toArray()
	    });
	    // Monitoring.renderRate.ping();
	    setTimeout(this.loadSamples.bind(this), ENV.timeout);
	  };

	  DBMon.prototype.componentDidMount = function componentDidMount() {
	    this.loadSamples();
	  };

	  DBMon.prototype.render = function render() {
	    var databases = this.state.databases.map(function (database) {
	      return (0, _preact.h)(Database, {
	        key: database.dbname,
	        lastMutationId: database.lastMutationId,
	        dbname: database.dbname,
	        samples: database.samples,
	        lastSample: database.lastSample });
	    });

	    return (0, _preact.h)(
	      'div',
	      null,
	      (0, _preact.h)(
	        'table',
	        { className: 'table table-striped latest-data' },
	        (0, _preact.h)(
	          'tbody',
	          null,
	          databases
	        )
	      )
	    );
	  };

	  return DBMon;
	}(_preact.Component);

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _preact = __webpack_require__(1);

	var _model = __webpack_require__(4);

	var _model2 = _interopRequireDefault(_model);

	var _footer = __webpack_require__(6);

	var _footer2 = _interopRequireDefault(_footer);

	var _item = __webpack_require__(7);

	var _item2 = _interopRequireDefault(_item);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectDestructuringEmpty(obj) { if (obj == null) return;("Cannot destructure undefined"); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { return;("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { return;("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ENTER_KEY = 13;

	var FILTERS = {
	  all: function all(todo) {
	    return true;
	  },
	  active: function active(todo) {
	    return !todo.completed;
	  },
	  completed: function completed(todo) {
	    return todo.completed;
	  }
	};

	var TodoMvcApp = function (_Component) {
	  _inherits(TodoMvcApp, _Component);

	  function TodoMvcApp() {
	    _classCallCheck(this, TodoMvcApp);

	    var _this = _possibleConstructorReturn(this, _Component.call(this));

	    _this.handleInput = function (event) {
	      _this.setState({ newTodo: event.target.value });
	    };

	    _this.handleNewTodoKeyDown = function (e) {
	      if (e.keyCode !== ENTER_KEY) return;
	      e.preventDefault();

	      var val = _this.state.newTodo.trim();
	      if (val) {
	        _this.model.addTodo(val);
	        _this.setState({ newTodo: '' });
	      }
	    };

	    _this.toggleAll = function (event) {
	      var checked = event.target.checked;
	      _this.model.toggleAll(checked);
	    };

	    _this.toggle = function (todo) {
	      _this.model.toggle(todo);
	    };

	    _this.destroy = function (todo) {
	      _this.model.destroy(todo);
	    };

	    _this.edit = function (todo) {
	      _this.setState({ editing: todo.id });
	    };

	    _this.save = function (todoToSave, text) {
	      _this.model.save(todoToSave, text);
	      _this.setState({ editing: null });
	    };

	    _this.cancel = function () {
	      _this.setState({ editing: null });
	    };

	    _this.clearCompleted = function () {
	      _this.model.clearCompleted();
	    };

	    _this.model = new _model2.default('preact-todos', function () {
	      return _this.setState({});
	    });
	    addEventListener('hashchange', _this.handleRoute.bind(_this));
	    _this.handleRoute();
	    return _this;
	  }

	  TodoMvcApp.prototype.handleRoute = function handleRoute() {
	    var nowShowing = String(location.hash || '').split('/').pop();
	    if (!FILTERS[nowShowing]) {
	      nowShowing = 'all';
	    }
	    this.setState({ nowShowing: nowShowing });
	  };

	  TodoMvcApp.prototype.render = function render(_ref, _ref2) {
	    var _this2 = this;

	    var _ref2$nowShowing = _ref2.nowShowing,
	        nowShowing = _ref2$nowShowing === undefined ? ALL_TODOS : _ref2$nowShowing,
	        newTodo = _ref2.newTodo,
	        editing = _ref2.editing;

	    _objectDestructuringEmpty(_ref);

	    var todos = this.model.todos,
	        shownTodos = todos.filter(FILTERS[nowShowing]),
	        activeTodoCount = todos.reduce(function (a, todo) {
	      return a + (todo.completed ? 0 : 1);
	    }, 0),
	        completedCount = todos.length - activeTodoCount;


	    return (0, _preact.h)(
	      'div',
	      null,
	      (0, _preact.h)(
	        'header',
	        { 'class': 'header' },
	        (0, _preact.h)(
	          'h1',
	          null,
	          'todos'
	        ),
	        (0, _preact.h)('input', {
	          'class': 'new-todo',
	          placeholder: 'What needs to be done?',
	          value: this.state.newTodo,
	          onKeyDown: this.handleNewTodoKeyDown,
	          onInput: this.handleInput,
	          autoFocus: true
	        })
	      ),
	      todos.length ? (0, _preact.h)(
	        'section',
	        { 'class': 'main' },
	        (0, _preact.h)('input', {
	          'class': 'toggle-all',
	          type: 'checkbox',
	          onChange: this.toggleAll,
	          checked: activeTodoCount === 0
	        }),
	        (0, _preact.h)(
	          'ul',
	          { 'class': 'todo-list' },
	          shownTodos.map(function (todo) {
	            return (0, _preact.h)(_item2.default, {
	              todo: todo,
	              onToggle: _this2.toggle,
	              onDestroy: _this2.destroy,
	              onEdit: _this2.edit,
	              editing: editing === todo.id,
	              onSave: _this2.save,
	              onCancel: _this2.cancel
	            });
	          })
	        )
	      ) : null,
	      activeTodoCount || completedCount ? (0, _preact.h)(_footer2.default, {
	        count: activeTodoCount,
	        completedCount: completedCount,
	        nowShowing: nowShowing,
	        onClearCompleted: this.clearCompleted
	      }) : null
	    );
	  };

	  return TodoMvcApp;
	}(_preact.Component);

	exports.default = TodoMvcApp;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _util = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	var TodoModel = function () {
	  function TodoModel(key, sub) {
	    _classCallCheck(this, TodoModel);

	    this.key = key;
	    this.todos = (0, _util.store)(key) || [];
	    this.onChanges = [sub];
	  }

	  TodoModel.prototype.inform = function inform() {
	    (0, _util.store)(this.key, this.todos);
	    this.onChanges.forEach(function (cb) {
	      return cb();
	    });
	  };

	  TodoModel.prototype.addTodo = function addTodo(title) {
	    this.todos = this.todos.concat({
	      id: (0, _util.uuid)(),
	      title: title,
	      completed: false
	    });
	    this.inform();
	  };

	  TodoModel.prototype.toggleAll = function toggleAll(completed) {
	    this.todos = this.todos.map(function (todo) {
	      return _extends({}, todo, { completed: completed });
	    });
	    this.inform();
	  };

	  TodoModel.prototype.toggle = function toggle(todoToToggle) {
	    this.todos = this.todos.map(function (todo) {
	      return todo !== todoToToggle ? todo : _extends({}, todo, { completed: !todo.completed });
	    });
	    this.inform();
	  };

	  TodoModel.prototype.destroy = function destroy(todo) {
	    this.todos = this.todos.filter(function (t) {
	      return t !== todo;
	    });
	    this.inform();
	  };

	  TodoModel.prototype.save = function save(todoToSave, title) {
	    this.todos = this.todos.map(function (todo) {
	      return todo !== todoToSave ? todo : _extends({}, todo, { title: title });
	    });
	    this.inform();
	  };

	  TodoModel.prototype.clearCompleted = function clearCompleted() {
	    this.todos = this.todos.filter(function (todo) {
	      return !todo.completed;
	    });
	    this.inform();
	  };

	  return TodoModel;
	}();

	exports.default = TodoModel;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.uuid = uuid;
	exports.pluralize = pluralize;
	exports.store = store;
	function uuid() {
	  var uuid = '';
	  for (var i = 0; i < 32; i++) {
	    var random = Math.random() * 16 | 0;
	    if (i === 8 || i === 12 || i === 16 || i === 20) {
	      uuid += '-';
	    }
	    uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
	  }
	  return uuid;
	}

	function pluralize(count, word) {
	  return count === 1 ? word : word + 's';
	}

	function store(namespace, data) {
	  if (data) return localStorage[namespace] = JSON.stringify(data);

	  var store = localStorage[namespace];
	  return store && JSON.parse(store) || [];
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _preact = __webpack_require__(1);

	var _util = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { return;("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { return;("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TodoFooter = function (_Component) {
	  _inherits(TodoFooter, _Component);

	  function TodoFooter() {
	    _classCallCheck(this, TodoFooter);

	    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
	  }

	  TodoFooter.prototype.render = function render(_ref) {
	    var nowShowing = _ref.nowShowing,
	        count = _ref.count,
	        completedCount = _ref.completedCount,
	        onClearCompleted = _ref.onClearCompleted;

	    return (0, _preact.h)(
	      'footer',
	      { 'class': 'footer' },
	      (0, _preact.h)(
	        'span',
	        { 'class': 'todo-count' },
	        (0, _preact.h)(
	          'strong',
	          null,
	          count
	        ),
	        ' ',
	        (0, _util.pluralize)(count, 'item'),
	        ' left'
	      ),
	      (0, _preact.h)(
	        'ul',
	        { 'class': 'filters' },
	        (0, _preact.h)(
	          'li',
	          null,
	          (0, _preact.h)(
	            'a',
	            { href: '#/', 'class': nowShowing == 'all' && 'selected' },
	            'All'
	          )
	        ),
	        ' ',
	        (0, _preact.h)(
	          'li',
	          null,
	          (0, _preact.h)(
	            'a',
	            { href: '#/active', 'class': nowShowing == 'active' && 'selected' },
	            'Active'
	          )
	        ),
	        ' ',
	        (0, _preact.h)(
	          'li',
	          null,
	          (0, _preact.h)(
	            'a',
	            { href: '#/completed', 'class': nowShowing == 'completed' && 'selected' },
	            'Completed'
	          )
	        )
	      ),
	      completedCount > 0 && (0, _preact.h)(
	        'button',
	        { 'class': 'clear-completed', onClick: onClearCompleted },
	        'Clear completed'
	      )
	    );
	  };

	  return TodoFooter;
	}(_preact.Component);

	exports.default = TodoFooter;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _preact = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { return;("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { return;("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { return;("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ESCAPE_KEY = 27;
	var ENTER_KEY = 13;

	var TodoItem = function (_Component) {
	  _inherits(TodoItem, _Component);

	  function TodoItem() {
	    var _temp, _this, _ret;

	    _classCallCheck(this, TodoItem);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.handleSubmit = function () {
	      var _this$props = _this.props,
	          onSave = _this$props.onSave,
	          onDestroy = _this$props.onDestroy,
	          todo = _this$props.todo,
	          val = _this.state.editText.trim();

	      if (val) {
	        onSave(todo, val);
	        _this.setState({ editText: val });
	      } else {
	        onDestroy(todo);
	      }
	    }, _this.handleEdit = function () {
	      var _this$props2 = _this.props,
	          onEdit = _this$props2.onEdit,
	          todo = _this$props2.todo;

	      onEdit(todo);
	      _this.setState({ editText: todo.title });
	    }, _this.toggle = function (e) {
	      var _this$props3 = _this.props,
	          onToggle = _this$props3.onToggle,
	          todo = _this$props3.todo;

	      onToggle(todo);
	      e.preventDefault();
	    }, _this.handleKeyDown = function (e) {
	      if (e.which === ESCAPE_KEY) {
	        var todo = _this.props.todo;

	        _this.setState({ editText: todo.title });
	        _this.props.onCancel(todo);
	      } else if (e.which === ENTER_KEY) {
	        _this.handleSubmit();
	      }
	    }, _this.handleDestroy = function () {
	      _this.props.onDestroy(_this.props.todo);
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  // shouldComponentUpdate({ todo, editing, editText }) {
	  // 	return (
	  // 		todo !== this.props.todo ||
	  // 		editing !== this.props.editing ||
	  // 		editText !== this.state.editText
	  // 	);
	  // }

	  TodoItem.prototype.componentDidUpdate = function componentDidUpdate() {
	    // TODO(willchou): Support Element#querySelector?
	    // let node = this.base && this.base.querySelector('.edit');
	    // if (node) node.focus();
	  };

	  TodoItem.prototype.render = function render(_ref, _ref2) {
	    var _ref$todo = _ref.todo,
	        title = _ref$todo.title,
	        completed = _ref$todo.completed,
	        onToggle = _ref.onToggle,
	        onDestroy = _ref.onDestroy,
	        editing = _ref.editing;
	    var editText = _ref2.editText;

	    return (0, _preact.h)(
	      "li",
	      { "class": { completed: completed, editing: editing } },
	      (0, _preact.h)(
	        "div",
	        { "class": "view" },
	        (0, _preact.h)("input", {
	          "class": "toggle",
	          type: "checkbox",
	          checked: completed,
	          onChange: this.toggle
	        }),
	        (0, _preact.h)(
	          "label",
	          { onDblClick: this.handleEdit },
	          title
	        ),
	        (0, _preact.h)("button", { "class": "destroy", onClick: this.handleDestroy })
	      ),
	      editing && (0, _preact.h)("input", {
	        "class": "edit",
	        value: editText,
	        onBlur: this.handleSubmit,
	        onInput: this.linkState('editText'),
	        onKeyDown: this.handleKeyDown
	      })
	    );
	  };

	  return TodoItem;
	}(_preact.Component);

	exports.default = TodoItem;

/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map