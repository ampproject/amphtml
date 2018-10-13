(function () {
	'use strict';

	var VNode = function VNode() {};

	var options = {};
	var stack = [];
	var EMPTY_CHILDREN = [];

	function h(nodeName, attributes) {
	  var children = EMPTY_CHILDREN,
	      lastSimple,
	      child,
	      simple,
	      i;

	  for (i = arguments.length; i-- > 2;) {
	    stack.push(arguments[i]);
	  }

	  if (attributes && attributes.children != null) {
	    if (!stack.length) stack.push(attributes.children);
	    delete attributes.children;
	  }

	  while (stack.length) {
	    if ((child = stack.pop()) && child.pop !== undefined) {
	      for (i = child.length; i--;) {
	        stack.push(child[i]);
	      }
	    } else {
	      if (typeof child === 'boolean') child = null;

	      if (simple = typeof nodeName !== 'function') {
	        if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
	      }

	      if (simple && lastSimple) {
	        children[children.length - 1] += child;
	      } else if (children === EMPTY_CHILDREN) {
	        children = [child];
	      } else {
	        children.push(child);
	      }

	      lastSimple = simple;
	    }
	  }

	  var p = new VNode();
	  p.nodeName = nodeName;
	  p.children = children;
	  p.attributes = attributes == null ? undefined : attributes;
	  p.key = attributes == null ? undefined : attributes.key;
	  return p;
	}

	function extend(obj, props) {
	  for (var i in props) {
	    obj[i] = props[i];
	  }

	  return obj;
	}

	var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

	var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
	var items = [];

	function enqueueRender(component) {
	  if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
	    (defer)(rerender);
	  }
	}

	function rerender() {
	  var p,
	      list = items;
	  items = [];

	  while (p = list.pop()) {
	    if (p._dirty) renderComponent(p);
	  }
	}

	function isSameNodeType(node, vnode, hydrating) {
	  if (typeof vnode === 'string' || typeof vnode === 'number') {
	    return node.splitText !== undefined;
	  }

	  if (typeof vnode.nodeName === 'string') {
	    return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	  }

	  return hydrating || node._componentConstructor === vnode.nodeName;
	}

	function isNamedNode(node, nodeName) {
	  return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
	}

	function getNodeProps(vnode) {
	  var props = extend({}, vnode.attributes);
	  props.children = vnode.children;
	  var defaultProps = vnode.nodeName.defaultProps;

	  if (defaultProps !== undefined) {
	    for (var i in defaultProps) {
	      if (props[i] === undefined) {
	        props[i] = defaultProps[i];
	      }
	    }
	  }

	  return props;
	}

	function createNode(nodeName, isSvg) {
	  var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	  node.normalizedNodeName = nodeName;
	  return node;
	}

	function removeNode(node) {
	  var parentNode = node.parentNode;
	  if (parentNode) parentNode.removeChild(node);
	}

	function setAccessor(node, name, old, value, isSvg) {
	  if (name === 'className') name = 'class';

	  if (name === 'key') ; else if (name === 'ref') {
	    if (old) old(null);
	    if (value) value(node);
	  } else if (name === 'class' && !isSvg) {
	    node.className = value || '';
	  } else if (name === 'style') {
	    if (!value || typeof value === 'string' || typeof old === 'string') {
	      node.style.cssText = value || '';
	    }

	    if (value && typeof value === 'object') {
	      if (typeof old !== 'string') {
	        for (var i in old) {
	          if (!(i in value)) node.style[i] = '';
	        }
	      }

	      for (var i in value) {
	        node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
	      }
	    }
	  } else if (name === 'dangerouslySetInnerHTML') {
	    if (value) node.innerHTML = value.__html || '';
	  } else if (name[0] == 'o' && name[1] == 'n') {
	    var useCapture = name !== (name = name.replace(/Capture$/, ''));
	    name = name.toLowerCase().substring(2);

	    if (value) {
	      if (!old) node.addEventListener(name, eventProxy, useCapture);
	    } else {
	      node.removeEventListener(name, eventProxy, useCapture);
	    }

	    (node._listeners || (node._listeners = {}))[name] = value;
	  } else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
	    try {
	      node[name] = value == null ? '' : value;
	    } catch (e) {}

	    if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	  } else {
	    var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

	    if (value == null || value === false) {
	      if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
	    } else if (typeof value !== 'function') {
	      if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
	    }
	  }
	}

	function eventProxy(e) {
	  return this._listeners[e.type](e);
	}

	var mounts = [];
	var diffLevel = 0;
	var isSvgMode = false;
	var hydrating = false;

	function flushMounts() {
	  var c;

	  while (c = mounts.pop()) {
	    if (c.componentDidMount) c.componentDidMount();
	  }
	}

	function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	  if (!diffLevel++) {
	    isSvgMode = parent != null && parent.ownerSVGElement !== undefined;
	    hydrating = dom != null && !('__preactattr_' in dom);
	  }

	  var ret = idiff(dom, vnode, context, mountAll, componentRoot);
	  if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	  if (! --diffLevel) {
	    hydrating = false;
	    if (!componentRoot) flushMounts();
	  }

	  return ret;
	}

	function idiff(dom, vnode, context, mountAll, componentRoot) {
	  var out = dom,
	      prevSvgMode = isSvgMode;
	  if (vnode == null || typeof vnode === 'boolean') vnode = '';

	  if (typeof vnode === 'string' || typeof vnode === 'number') {
	    if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
	      if (dom.nodeValue != vnode) {
	        dom.nodeValue = vnode;
	      }
	    } else {
	      out = document.createTextNode(vnode);

	      if (dom) {
	        if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	        recollectNodeTree(dom, true);
	      }
	    }

	    out['__preactattr_'] = true;
	    return out;
	  }

	  var vnodeName = vnode.nodeName;

	  if (typeof vnodeName === 'function') {
	    return buildComponentFromVNode(dom, vnode, context, mountAll);
	  }

	  isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;
	  vnodeName = String(vnodeName);

	  if (!dom || !isNamedNode(dom, vnodeName)) {
	    out = createNode(vnodeName, isSvgMode);

	    if (dom) {
	      while (dom.firstChild) {
	        out.appendChild(dom.firstChild);
	      }

	      if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	      recollectNodeTree(dom, true);
	    }
	  }

	  var fc = out.firstChild,
	      props = out['__preactattr_'],
	      vchildren = vnode.children;

	  if (props == null) {
	    props = out['__preactattr_'] = {};

	    for (var a = out.attributes, i = a.length; i--;) {
	      props[a[i].name] = a[i].value;
	    }
	  }

	  if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
	    if (fc.nodeValue != vchildren[0]) {
	      fc.nodeValue = vchildren[0];
	    }
	  } else if (vchildren && vchildren.length || fc != null) {
	    innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
	  }

	  diffAttributes(out, vnode.attributes, props);
	  isSvgMode = prevSvgMode;
	  return out;
	}

	function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	  var originalChildren = dom.childNodes,
	      children = [],
	      keyed = {},
	      keyedLen = 0,
	      min = 0,
	      len = originalChildren.length,
	      childrenLen = 0,
	      vlen = vchildren ? vchildren.length : 0,
	      j,
	      c,
	      f,
	      vchild,
	      child;

	  if (len !== 0) {
	    for (var i = 0; i < len; i++) {
	      var _child = originalChildren[i],
	          props = _child['__preactattr_'],
	          key = vlen && props ? _child._component ? _child._component.__key : props.key : null;

	      if (key != null) {
	        keyedLen++;
	        keyed[key] = _child;
	      } else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
	        children[childrenLen++] = _child;
	      }
	    }
	  }

	  if (vlen !== 0) {
	    for (var i = 0; i < vlen; i++) {
	      vchild = vchildren[i];
	      child = null;
	      var key = vchild.key;

	      if (key != null) {
	        if (keyedLen && keyed[key] !== undefined) {
	          child = keyed[key];
	          keyed[key] = undefined;
	          keyedLen--;
	        }
	      } else if (min < childrenLen) {
	        for (j = min; j < childrenLen; j++) {
	          if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
	            child = c;
	            children[j] = undefined;
	            if (j === childrenLen - 1) childrenLen--;
	            if (j === min) min++;
	            break;
	          }
	        }
	      }

	      child = idiff(child, vchild, context, mountAll);
	      f = originalChildren[i];

	      if (child && child !== dom && child !== f) {
	        if (f == null) {
	          dom.appendChild(child);
	        } else if (child === f.nextSibling) {
	          removeNode(f);
	        } else {
	          dom.insertBefore(child, f);
	        }
	      }
	    }
	  }

	  if (keyedLen) {
	    for (var i in keyed) {
	      if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
	    }
	  }

	  while (min <= childrenLen) {
	    if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	  }
	}

	function recollectNodeTree(node, unmountOnly) {
	  var component = node._component;

	  if (component) {
	    unmountComponent(component);
	  } else {
	    if (node['__preactattr_'] != null && node['__preactattr_'].ref) node['__preactattr_'].ref(null);

	    if (unmountOnly === false || node['__preactattr_'] == null) {
	      removeNode(node);
	    }

	    removeChildren(node);
	  }
	}

	function removeChildren(node) {
	  node = node.lastChild;

	  while (node) {
	    var next = node.previousSibling;
	    recollectNodeTree(node, true);
	    node = next;
	  }
	}

	function diffAttributes(dom, attrs, old) {
	  var name;

	  for (name in old) {
	    if (!(attrs && attrs[name] != null) && old[name] != null) {
	      setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
	    }
	  }

	  for (name in attrs) {
	    if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
	      setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
	    }
	  }
	}

	var recyclerComponents = [];

	function createComponent(Ctor, props, context) {
	  var inst,
	      i = recyclerComponents.length;

	  if (Ctor.prototype && Ctor.prototype.render) {
	    inst = new Ctor(props, context);
	    Component.call(inst, props, context);
	  } else {
	    inst = new Component(props, context);
	    inst.constructor = Ctor;
	    inst.render = doRender;
	  }

	  while (i--) {
	    if (recyclerComponents[i].constructor === Ctor) {
	      inst.nextBase = recyclerComponents[i].nextBase;
	      recyclerComponents.splice(i, 1);
	      return inst;
	    }
	  }

	  return inst;
	}

	function doRender(props, state, context) {
	  return this.constructor(props, context);
	}

	function setComponentProps(component, props, renderMode, context, mountAll) {
	  if (component._disable) return;
	  component._disable = true;
	  component.__ref = props.ref;
	  component.__key = props.key;
	  delete props.ref;
	  delete props.key;

	  if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
	    if (!component.base || mountAll) {
	      if (component.componentWillMount) component.componentWillMount();
	    } else if (component.componentWillReceiveProps) {
	      component.componentWillReceiveProps(props, context);
	    }
	  }

	  if (context && context !== component.context) {
	    if (!component.prevContext) component.prevContext = component.context;
	    component.context = context;
	  }

	  if (!component.prevProps) component.prevProps = component.props;
	  component.props = props;
	  component._disable = false;

	  if (renderMode !== 0) {
	    if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
	      renderComponent(component, 1, mountAll);
	    } else {
	      enqueueRender(component);
	    }
	  }

	  if (component.__ref) component.__ref(component);
	}

	function renderComponent(component, renderMode, mountAll, isChild) {
	  if (component._disable) return;
	  var props = component.props,
	      state = component.state,
	      context = component.context,
	      previousProps = component.prevProps || props,
	      previousState = component.prevState || state,
	      previousContext = component.prevContext || context,
	      isUpdate = component.base,
	      nextBase = component.nextBase,
	      initialBase = isUpdate || nextBase,
	      initialChildComponent = component._component,
	      skip = false,
	      snapshot = previousContext,
	      rendered,
	      inst,
	      cbase;

	  if (component.constructor.getDerivedStateFromProps) {
	    state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
	    component.state = state;
	  }

	  if (isUpdate) {
	    component.props = previousProps;
	    component.state = previousState;
	    component.context = previousContext;

	    if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
	      skip = true;
	    } else if (component.componentWillUpdate) {
	      component.componentWillUpdate(props, state, context);
	    }

	    component.props = props;
	    component.state = state;
	    component.context = context;
	  }

	  component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	  component._dirty = false;

	  if (!skip) {
	    rendered = component.render(props, state, context);

	    if (component.getChildContext) {
	      context = extend(extend({}, context), component.getChildContext());
	    }

	    if (isUpdate && component.getSnapshotBeforeUpdate) {
	      snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
	    }

	    var childComponent = rendered && rendered.nodeName,
	        toUnmount,
	        base;

	    if (typeof childComponent === 'function') {
	      var childProps = getNodeProps(rendered);
	      inst = initialChildComponent;

	      if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
	        setComponentProps(inst, childProps, 1, context, false);
	      } else {
	        toUnmount = inst;
	        component._component = inst = createComponent(childComponent, childProps, context);
	        inst.nextBase = inst.nextBase || nextBase;
	        inst._parentComponent = component;
	        setComponentProps(inst, childProps, 0, context, false);
	        renderComponent(inst, 1, mountAll, true);
	      }

	      base = inst.base;
	    } else {
	      cbase = initialBase;
	      toUnmount = initialChildComponent;

	      if (toUnmount) {
	        cbase = component._component = null;
	      }

	      if (initialBase || renderMode === 1) {
	        if (cbase) cbase._component = null;
	        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
	      }
	    }

	    if (initialBase && base !== initialBase && inst !== initialChildComponent) {
	      var baseParent = initialBase.parentNode;

	      if (baseParent && base !== baseParent) {
	        baseParent.replaceChild(base, initialBase);

	        if (!toUnmount) {
	          initialBase._component = null;
	          recollectNodeTree(initialBase, false);
	        }
	      }
	    }

	    if (toUnmount) {
	      unmountComponent(toUnmount);
	    }

	    component.base = base;

	    if (base && !isChild) {
	      var componentRef = component,
	          t = component;

	      while (t = t._parentComponent) {
	        (componentRef = t).base = base;
	      }

	      base._component = componentRef;
	      base._componentConstructor = componentRef.constructor;
	    }
	  }

	  if (!isUpdate || mountAll) {
	    mounts.unshift(component);
	  } else if (!skip) {
	    if (component.componentDidUpdate) {
	      component.componentDidUpdate(previousProps, previousState, snapshot);
	    }
	  }

	  while (component._renderCallbacks.length) {
	    component._renderCallbacks.pop().call(component);
	  }

	  if (!diffLevel && !isChild) flushMounts();
	}

	function buildComponentFromVNode(dom, vnode, context, mountAll) {
	  var c = dom && dom._component,
	      originalComponent = c,
	      oldDom = dom,
	      isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	      isOwner = isDirectOwner,
	      props = getNodeProps(vnode);

	  while (c && !isOwner && (c = c._parentComponent)) {
	    isOwner = c.constructor === vnode.nodeName;
	  }

	  if (c && isOwner && (!mountAll || c._component)) {
	    setComponentProps(c, props, 3, context, mountAll);
	    dom = c.base;
	  } else {
	    if (originalComponent && !isDirectOwner) {
	      unmountComponent(originalComponent);
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
	      recollectNodeTree(oldDom, false);
	    }
	  }

	  return dom;
	}

	function unmountComponent(component) {
	  var base = component.base;
	  component._disable = true;
	  if (component.componentWillUnmount) component.componentWillUnmount();
	  component.base = null;
	  var inner = component._component;

	  if (inner) {
	    unmountComponent(inner);
	  } else if (base) {
	    if (base['__preactattr_'] && base['__preactattr_'].ref) base['__preactattr_'].ref(null);
	    component.nextBase = base;
	    removeNode(base);
	    recyclerComponents.push(component);
	    removeChildren(base);
	  }

	  if (component.__ref) component.__ref(null);
	}

	function Component(props, context) {
	  this._dirty = true;
	  this.context = context;
	  this.props = props;
	  this.state = this.state || {};
	  this._renderCallbacks = [];
	}

	extend(Component.prototype, {
	  setState: function setState(state, callback) {
	    if (!this.prevState) this.prevState = this.state;
	    this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
	    if (callback) this._renderCallbacks.push(callback);
	    enqueueRender(this);
	  },
	  forceUpdate: function forceUpdate(callback) {
	    if (callback) this._renderCallbacks.push(callback);
	    renderComponent(this, 2);
	  },
	  render: function render() {}
	});

	function render(vnode, parent, merge) {
	  return diff(merge, vnode, {}, false, parent, false);
	}

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

	function getLocation(href) {
	  var l = document.createElement("a");
	  l.href = href;
	  return l;
	}

	function attachProxyFormListeners() {
	  var form = document.getElementById('proxy-form');
	  var input = document.getElementById('proxy-input');
	  form.addEventListener('submit', function (e) {
	    var location = getLocation(input.value);
	    var suffix = location.host + location.pathname + location.search + location.hash;
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
	    return h("wrap", null, h("header", null, h("h1", {
	      "class": "amp-logo"
	    }, "AMP"), h("ul", null, h("li", null, h("a", {
	      href: "https://github.com/ampproject/amphtml/blob/master/contributing/DEVELOPING.md"
	    }, "Developing")), h("li", {
	      "class": "divider"
	    }, h("a", {
	      href: "https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md"
	    }, "Contributing")), h("li", null, h("a", {
	      href: "https://github.com/ampproject/amphtml/"
	    }, "Github")), h("li", null, h("a", {
	      href: "https://travis-ci.org/ampproject/amphtml"
	    }, "Travis")), h("li", null, h("a", {
	      href: "https://percy.io/ampproject/amphtml/"
	    }, "Percy")))), h("div", {
	      "class": "block proxy-form-contianer"
	    }, h("form", {
	      id: "proxy-form"
	    }, h("label", {
	      "for": "proxy-input"
	    }, h("span", null, "Load URL by Proxy"), h("input", {
	      type: "url",
	      "class": "text-input",
	      id: "proxy-input",
	      placeholder: "https://"
	    })), h("div", {
	      "class": "form-info"
	    }, h("a", {
	      href: "https://github.com/ampproject/amphtml/blob/master/contributing/TESTING.md#document-proxy"
	    }, "What's this?")))));
	  }

	}

	render(h(App, null), document.getElementById("root"));

}());
//# sourceMappingURL=app.js.map
