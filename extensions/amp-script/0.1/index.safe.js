var html = ['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr'];

// SVG
var svg = ['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern'];

var svgFilters = ['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence'];

var mathMl = ['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmuliscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mpspace', 'msqrt', 'mystyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover'];

var text = ['#text'];

var html$1 = ['accept', 'action', 'align', 'alt', 'autocomplete', 'background', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'coords', 'crossorigin', 'datetime', 'default', 'dir', 'disabled', 'download', 'enctype', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'integrity', 'ismap', 'label', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns'];

var svg$1 = ['accent-height', 'accumulate', 'additivive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan'];

var mathMl$1 = ['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns'];

var xml = ['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink'];

/* Add properties to a lookup table */
function addToSet(set, array) {
  var l = array.length;
  while (l--) {
    if (typeof array[l] === 'string') {
      array[l] = array[l].toLowerCase();
    }
    set[array[l]] = true;
  }
  return set;
}

/* Shallow clone an object */
function clone(object) {
  var newObject = {};
  var property = void 0;
  for (property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      newObject[property] = object[property];
    }
  }
  return newObject;
}

var MUSTACHE_EXPR = /\{\{[\s\S]*|[\s\S]*\}\}/gm; // Specify template detection regex for SAFE_FOR_TEMPLATES mode
var ERB_EXPR = /<%[\s\S]*|[\s\S]*%>/gm;
var DATA_ATTR = /^data-[\-\w.\u00B7-\uFFFF]/; // eslint-disable-line no-useless-escape
var ARIA_ATTR = /^aria-[\-\w]+$/; // eslint-disable-line no-useless-escape
var IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape
var IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
var ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // eslint-disable-line no-control-regex

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};

function createDOMPurify() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };

  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */
  DOMPurify.version = '1.0.7';

  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  var originalDocument = window.document;
  var useDOMParser = false; // See comment below
  var removeTitle = false; // See comment below

  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      Text = window.Text,
      Comment = window.Comment,
      DOMParser = window.DOMParser;

  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === 'function') {
    var template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      getElementsByTagName = _document.getElementsByTagName,
      createDocumentFragment = _document.createDocumentFragment;
  var importNode = originalDocument.importNode;


  var hooks = {};

  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && document.documentMode !== 9;

  var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
      ERB_EXPR$$1 = ERB_EXPR,
      DATA_ATTR$$1 = DATA_ATTR,
      ARIA_ATTR$$1 = ARIA_ATTR,
      IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
  var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(svgFilters), _toConsumableArray(mathMl), _toConsumableArray(text)));

  /* Allowed attribute names */
  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(mathMl$1), _toConsumableArray(xml)));

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  var FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  var FORBID_ATTR = null;

  /* Decide if ARIA attributes are okay */
  var ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  var ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  var ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Output should be safe for jQuery's $() factory? */
  var SAFE_FOR_JQUERY = false;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  var SAFE_FOR_TEMPLATES = false;

  /* Decide if document with <html>... should be returned */
  var WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  var SET_CONFIG = false;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  var FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html string.
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  var RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html string */
  var RETURN_DOM_FRAGMENT = false;

  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify. */
  var RETURN_DOM_IMPORT = false;

  /* Output should be free from DOM clobbering attacks? */
  var SANITIZE_DOM = true;

  /* Keep element content when removing element? */
  var KEEP_CONTENT = true;

  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  var IN_PLACE = false;

  /* Allow usage of profiles like html, svg and mathMl */
  var USE_PROFILES = {};

  /* Tags to ignore content of when KEEP_CONTENT is true */
  var FORBID_CONTENTS = addToSet({}, ['audio', 'head', 'math', 'script', 'style', 'template', 'svg', 'video']);

  /* Tags that are safe for data: URIs */
  var DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image']);

  /* Attributes safe for values like "javascript:" */
  var URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

  /* Keep a reference to config to pass to hooks */
  var CONFIG = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  var formElement = document.createElement('form');

  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity
  var _parseConfig = function _parseConfig(cfg) {
    /* Shield configuration object from tampering */
    if ((typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
      cfg = {};
    }
    /* Set configuration parameters */
    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false

    IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(text)));
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html);
        addToSet(ALLOWED_ATTR, html$1);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl);
        addToSet(ALLOWED_ATTR, mathMl$1);
        addToSet(ALLOWED_ATTR, xml);
      }
    }

    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }
      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }
    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }
      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }

    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
    }

    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (Object && 'freeze' in Object) {
      Object.freeze(cfg);
    }

    CONFIG = cfg;
  };

  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */
  var _forceRemove = function _forceRemove(node) {
    DOMPurify.removed.push({ element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (err) {
      node.outerHTML = '';
    }
  };

  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */
  var _removeAttribute = function _removeAttribute(name, node) {
    try {
      DOMPurify.removed.push({
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (err) {
      DOMPurify.removed.push({
        attribute: null,
        from: node
      });
    }
    node.removeAttribute(name);
  };

  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */
  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc = void 0;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    }

    /* Use DOMParser to workaround Firefox bug (see comment below) */
    if (useDOMParser) {
      try {
        doc = new DOMParser().parseFromString(dirty, 'text/html');
      } catch (err) {}
    }

    /* Remove title to fix an mXSS bug in older MS Edge */
    if (removeTitle) {
      addToSet(FORBID_TAGS, ['title']);
    }

    /* Otherwise use createHTMLDocument, because DOMParser is unsafe in
    Safari (see comment below) */
    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument('');
      var _doc = doc,
          body = _doc.body;

      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = dirty;
    }

    /* Work on whole document or just its body */
    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
  };

  // Firefox uses a different parser for innerHTML rather than
  // DOMParser (see https://bugzilla.mozilla.org/show_bug.cgi?id=1205631)
  // which means that you *must* use DOMParser, otherwise the output may
  // not be safe if used in a document.write context later.
  //
  // So we feature detect the Firefox bug and use the DOMParser if necessary.
  //
  // MS Edge, in older versions, is affected by an mXSS behavior. The second
  // check tests for the behavior and fixes it if necessary.
  if (DOMPurify.isSupported) {
    (function () {
      try {
        var doc = _initDocument('<svg><p><style><img src="</style><img src=x onerror=alert(1)//">');
        if (doc.querySelector('svg img')) {
          useDOMParser = true;
        }
      } catch (err) {}
    })();
    (function () {
      try {
        var doc = _initDocument('<x/><title>&lt;/title&gt;&lt;img&gt;');
        if (doc.querySelector('title').textContent.match(/<\/title/)) {
          removeTitle = true;
        }
      } catch (err) {}
    })();
  }

  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */
  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
      return NodeFilter.FILTER_ACCEPT;
    }, false);
  };

  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */
  var _isClobbered = function _isClobbered(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }
    if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function') {
      return true;
    }
    return false;
  };

  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */
  var _isNode = function _isNode(obj) {
    return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? obj instanceof Node : obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string';
  };

  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */
  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    hooks[entryPoint].forEach(function (hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };

  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */
  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content = void 0;

    /* Execute a hook if present */
    _executeHook('beforeSanitizeElements', currentNode, null);

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    var tagName = currentNode.nodeName.toLowerCase();

    /* Execute a hook if present */
    _executeHook('uponSanitizeElement', currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });

    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for black-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
        try {
          currentNode.insertAdjacentHTML('AfterEnd', currentNode.innerHTML);
        } catch (err) {}
      }
      _forceRemove(currentNode);
      return true;
    }

    /* Convert markup to cover jQuery behavior */
    if (SAFE_FOR_JQUERY && !currentNode.firstElementChild && (!currentNode.content || !currentNode.content.firstElementChild) && /</g.test(currentNode.textContent)) {
      DOMPurify.removed.push({ element: currentNode.cloneNode() });
      if (currentNode.innerHTML) {
        currentNode.innerHTML = currentNode.innerHTML.replace(/</g, '&lt;');
      } else {
        currentNode.innerHTML = currentNode.textContent.replace(/</g, '&lt;');
      }
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = content.replace(MUSTACHE_EXPR$$1, ' ');
      content = content.replace(ERB_EXPR$$1, ' ');
      if (currentNode.textContent !== content) {
        DOMPurify.removed.push({ element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };

  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }

    /* Sanitize attribute content to be template-safe */
    if (SAFE_FOR_TEMPLATES) {
      value = value.replace(MUSTACHE_EXPR$$1, ' ');
      value = value.replace(ERB_EXPR$$1, ' ');
    }

    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && DATA_ATTR$$1.test(lcName)) ; else if (ALLOW_ARIA_ATTR && ARIA_ATTR$$1.test(lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      return false;

      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (IS_ALLOWED_URI$$1.test(value.replace(ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href') && value.indexOf('data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !IS_SCRIPT_OR_DATA$$1.test(value.replace(ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
      return false;
    }
    return true;
  };

  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} node to sanitize
   */
  // eslint-disable-next-line complexity
  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr = void 0;
    var value = void 0;
    var lcName = void 0;
    var idAttr = void 0;
    var l = void 0;
    /* Execute a hook if present */
    _executeHook('beforeSanitizeAttributes', currentNode, null);

    var attributes = currentNode.attributes;

    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      attr = attributes[l];
      var _attr = attr,
          name = _attr.name;

      value = attr.value.trim();
      lcName = name.toLowerCase();

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;

      /* Remove attribute */
      // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
      // remove a "name" attribute from an <img> tag that has an "id"
      // attribute at the time.
      if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
        idAttr = attributes.id;
        attributes = Array.prototype.slice.apply(attributes);
        _removeAttribute('id', currentNode);
        _removeAttribute(name, currentNode);
        if (attributes.indexOf(idAttr) > l) {
          currentNode.setAttribute('id', idAttr.value);
        }
      } else if (
      // This works around a bug in Safari, where input[type=file]
      // cannot be dynamically set after type has been removed
      currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
        continue;
      } else {
        // This avoids a crash in Safari v9.0 with double-ids.
        // The trick is to first set the id to be empty and then to
        // remove the attribute
        if (name === 'id') {
          currentNode.setAttribute(name, '');
        }
        _removeAttribute(name, currentNode);
      }

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }

      /* Is `value` valid for this attribute? */
      var lcTag = currentNode.nodeName.toLowerCase();
      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }

      /* Handle invalid data-* attribute set by try-catching it */
      try {
        currentNode.setAttribute(name, value);
        DOMPurify.removed.pop();
      } catch (err) {}
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeAttributes', currentNode, null);
  };

  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */
  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode = void 0;
    var shadowIterator = _createIterator(fragment);

    /* Execute a hook if present */
    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);

      /* Sanitize tags and elements */
      if (_sanitizeElements(shadowNode)) {
        continue;
      }

      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(shadowNode);
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };

  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty, cfg) {
    var body = void 0;
    var importedNode = void 0;
    var currentNode = void 0;
    var oldNode = void 0;
    var returnNode = void 0;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    if (!dirty) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw new TypeError('toString is not a function');
      } else {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw new TypeError('dirty is not a string, aborting');
        }
      }
    }

    /* Check we can run. Otherwise fall back or ignore */
    if (!DOMPurify.isSupported) {
      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
        if (typeof dirty === 'string') {
          return window.toStaticHTML(dirty);
        }
        if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }
      return dirty;
    }

    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    if (IN_PLACE) ; else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!-->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !WHOLE_DOCUMENT && dirty.indexOf('<') === -1) {
        return dirty;
      }

      /* Initialize the document to work on */
      body = _initDocument(dirty);

      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : '';
      }
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Fix IE's strange behavior with manipulated textNodes #89 */
      if (currentNode.nodeType === 3 && currentNode === oldNode) {
        continue;
      }

      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }

      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }

    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (RETURN_DOM_IMPORT) {
        /* AdoptNode() is not used because internal state is not reset
               (e.g. the past names map of a HTMLFormElement), this is safe
               in theory but we would rather not risk another attack vector.
               The state that is cloned by importNode() is explicitly defined
               by the specs. */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    return WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
  };

  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */
  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);
    SET_CONFIG = true;
  };

  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };

  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }
    var lcTag = tag.toLowerCase();
    var lcName = attr.toLowerCase();
    return _isValidAttribute(lcTag, lcName, value);
  };

  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    hooks[entryPoint] = hooks[entryPoint] || [];
    hooks[entryPoint].push(hookFunction);
  };

  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   */
  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint].pop();
    }
  };

  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */
  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };

  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */
  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

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
const propertyToAttribute = {}; // TODO(choumx): Fill this in.

class DOMPurifySanitizer {
  /**
   * @param node
   */
  sanitize(node) {
    purify.sanitize(node, {
      IN_PLACE: true
    });
  }
  /**
   * @param tag
   * @param attr
   * @param value
   */


  validAttribute(tag, attr, value) {
    return purify.isValidAttribute(tag, attr, value);
  }
  /**
   * @param tag
   * @param prop
   * @param value
   */


  validProperty(tag, prop, value) {
    const attr = propertyToAttribute[prop];

    if (attr) {
      return this.validAttribute(tag, attr, value);
    } else {
      return this.validAttribute(tag, prop, value);
    }
  }

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
let count = 0;
const STRINGS = new Map();
/**
 * Return a string for the specified index.
 * @param index string index to retrieve.
 * @returns string in map for the index.
 */

function getString(index) {
  return STRINGS.get(index) || '';
}
/**
 * Stores a string for parsing from mutation
 * @param value string to store from background thread.
 */

function storeString(value) {
  STRINGS.set(++count, value);
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
let NODES;
let BASE_ELEMENT;
function prepare(baseElement) {
  NODES = new Map([[1, baseElement], [2, baseElement]]);
  BASE_ELEMENT = baseElement;
}
function isTextNode(node) {
  return ('nodeType' in node ? node.nodeType : node[0
  /* nodeType */
  ]) === 3
  /* TEXT_NODE */
  ;
}
/**
 * Create a real DOM Node from a skeleton Object (`{ nodeType, nodeName, attributes, children, data }`)
 * @example <caption>Text node</caption>
 *   createNode({ nodeType:3, data:'foo' })
 * @example <caption>Element node</caption>
 *   createNode({ nodeType:1, nodeName:'div', attributes:[{ name:'a', value:'b' }], childNodes:[ ... ] })
 */

function createNode(skeleton) {
  if (isTextNode(skeleton)) {
    const node = document.createTextNode(getString(skeleton[5
    /* textContent */
    ]));
    storeNode(node, skeleton[7
    /* _index_ */
    ]);
    return node;
  }

  const namespace = skeleton[6
  /* namespaceURI */
  ] !== undefined ? getString(skeleton[6
  /* namespaceURI */
  ]) : undefined;
  const node = namespace ? document.createElementNS(namespace, getString(skeleton[1
  /* nodeName */
  ])) : document.createElement(getString(skeleton[1
  /* nodeName */
  ])); // TODO(KB): Restore Properties
  // skeleton.properties.forEach(property => {
  //   node[`${property.name}`] = property.value;
  // });
  // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
  //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
  //     node.appendChild(createNode(childNode as TransferrableNode));
  //   }
  // });

  storeNode(node, skeleton[7
  /* _index_ */
  ]);
  return node;
}
/**
 * Returns the real DOM Element corresponding to a serialized Element object.
 * @param id
 * @return
 */

function getNode(id) {
  const node = NODES.get(id);

  if (node && node.nodeName === 'BODY') {
    // If the node requested is the "BODY"
    // Then we return the base node this specific <amp-script> comes from.
    // This encapsulates each <amp-script> node.
    return BASE_ELEMENT;
  }

  return node;
}
/**
 * Establish link between DOM `node` and worker-generated identifier `id`.
 *
 * These _shouldn't_ collide between instances of <amp-script> since
 * each element creates it's own pool on both sides of the worker
 * communication bridge.
 * @param node
 * @param id
 */

function storeNode(node, id) {
  node._index_ = id;
  NODES.set(id, node);
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
// TODO(KB): Fetch Polyfill for IE11.
function createWorker(workerDomURL, authorScriptURL) {
  return Promise.all([fetch(workerDomURL).then(response => response.text()), fetch(authorScriptURL).then(response => response.text())]).then(([workerScript, authorScript]) => {
    // TODO(KB): Minify this output during build process.
    const keys = [];

    for (let key in document.body.style) {
      keys.push(`'${key}'`);
    }

    const code = `
        'use strict';
        ${workerScript}
        (function() {
          var self = this;
          var window = this;
          var document = this.document;
          var localStorage = this.localStorage;
          var location = this.location;
          var defaultView = document.defaultView;
          var Node = defaultView.Node;
          var Text = defaultView.Text;
          var Element = defaultView.Element;
          var SVGElement = defaultView.SVGElement;
          var Document = defaultView.Document;
          var Event = defaultView.Event;
          var MutationObserver = defaultView.MutationObserver;

          function addEventListener(type, handler) {
            return document.addEventListener(type, handler);
          }
          function removeEventListener(type, handler) {
            return document.removeEventListener(type, handler);
          }
          this.appendKeys([${keys}]);
          ${authorScript}
        }).call(WorkerThread.workerDOM);
//# sourceURL=${encodeURI(authorScriptURL)}`;
    return new Worker(URL.createObjectURL(new Blob([code])));
  }).catch(error => {
    return null;
  });
}
function messageToWorker(worker, message) {
  worker.postMessage(message);
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
const KNOWN_LISTENERS = [];
/**
 * Instead of a whitelist of elements that need their value tracked, use the existence
 * of a property called value to drive the decision.
 * @param node node to check if values should be tracked.
 * @return boolean if the node should have its value property tracked.
 */

const shouldTrackChanges = node => node && 'value' in node;
/**
 * When a node that has a value needing synced doesn't already have an event listener
 * listening for changed values, ensure the value is synced with a default listener.
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */


const applyDefaultChangeListener = (worker, node) => {
  shouldTrackChanges(node) && node.onchange === null && (node.onchange = () => fireValueChange(worker, node));
};
/**
 * Tell the worker DOM what the value is for a Node.
 * @param worker whom to dispatch value toward.
 * @param node where to get the value from.
 */

const fireValueChange = (worker, node) => {
  messageToWorker(worker, {
    [9
    /* type */
    ]: 5
    /* SYNC */
    ,
    [38
    /* sync */
    ]: {
      [7
      /* _index_ */
      ]: node._index_,
      [18
      /* value */
      ]: node.value
    }
  });
};
/**
 * Register an event handler for dispatching events to worker thread
 * @param worker whom to dispatch events toward
 * @param _index_ node index the event comes from (used to dispatchEvent in worker thread).
 * @return eventHandler function consuming event and dispatching to worker thread
 */


const eventHandler = (worker, _index_) => event => {
  if (shouldTrackChanges(event.currentTarget)) {
    fireValueChange(worker, event.currentTarget);
  }

  messageToWorker(worker, {
    [9
    /* type */
    ]: 1
    /* EVENT */
    ,
    [37
    /* event */
    ]: {
      [7
      /* _index_ */
      ]: _index_,
      [22
      /* bubbles */
      ]: event.bubbles,
      [23
      /* cancelable */
      ]: event.cancelable,
      [24
      /* cancelBubble */
      ]: event.cancelBubble,
      [25
      /* currentTarget */
      ]: {
        [7
        /* _index_ */
        ]: event.currentTarget._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      },
      [26
      /* defaultPrevented */
      ]: event.defaultPrevented,
      [27
      /* eventPhase */
      ]: event.eventPhase,
      [28
      /* isTrusted */
      ]: event.isTrusted,
      [29
      /* returnValue */
      ]: event.returnValue,
      [10
      /* target */
      ]: {
        [7
        /* _index_ */
        ]: event.target._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      },
      [30
      /* timeStamp */
      ]: event.timeStamp,
      [9
      /* type */
      ]: event.type,
      [32
      /* keyCode */
      ]: 'keyCode' in event ? event.keyCode : undefined
    }
  });
};
/**
 * Process commands transfered from worker thread to main thread.
 * @param nodesInstance nodes instance to execute commands against.
 * @param worker whom to dispatch events toward.
 * @param mutation mutation record containing commands to execute.
 */


function process(worker, mutation) {
  const _index_ = mutation[10
  /* target */
  ];
  const target = getNode(_index_);
  (mutation[21
  /* removedEvents */
  ] || []).forEach(eventSub => {
    processListenerChange(worker, target, false, getString(eventSub[9
    /* type */
    ]), eventSub[33
    /* index */
    ]);
  });
  (mutation[20
  /* addedEvents */
  ] || []).forEach(eventSub => {
    processListenerChange(worker, target, true, getString(eventSub[9
    /* type */
    ]), eventSub[33
    /* index */
    ]);
  });
}
/**
 * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to
 * ensure that only a single 'change' event is attached to prevent sending values multiple times.
 * @param worker worker issuing listener changes
 * @param target node to change listeners on
 * @param addEvent is this an 'addEvent' or 'removeEvent' change
 * @param type event type requested to change
 * @param index number in the listeners array this event corresponds to.
 */

function processListenerChange(worker, target, addEvent, type, index) {
  let changeEventSubscribed = target.onchange !== null;
  const shouldTrack = shouldTrackChanges(target);
  const isChangeEvent = type === 'change';

  if (addEvent) {
    if (isChangeEvent) {
      changeEventSubscribed = true;
      target.onchange = null;
    }

    target.addEventListener(type, KNOWN_LISTENERS[index] = eventHandler(worker, target._index_));
  } else {
    if (isChangeEvent) {
      changeEventSubscribed = false;
    }

    target.removeEventListener(type, KNOWN_LISTENERS[index]);
  }

  if (shouldTrack && !changeEventSubscribed) {
    applyDefaultChangeListener(worker, target);
  }
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

function allTextNodes(nodes) {
  return nodes.length > 0 && [].every.call(nodes, isTextNode);
}
/**
 * Replace all the children with the ones from the HydrateableNode.
 * Used when we're certain the content won't break the page.
 * @param nodes HydrateableNodes containing content to potentially overwrite main thread content.
 * @param parent Node in the main thread that will be the parent of the passed nodes.
 * @param worker worker that issued the request for hydration.
 */


function replaceNodes(nodes, parent, worker) {
  [].forEach.call(parent.childNodes, childNode => childNode.remove());
  nodes.forEach((node, index) => {
    const newNode = createNode(node);
    (node[2
    /* attributes */
    ] || []).forEach(attribute => {
      const namespaceURI = getString(attribute[0]);

      if (namespaceURI !== 'null') {
        newNode.setAttributeNS(namespaceURI, getString(attribute[1]), getString(attribute[2]));
      } else {
        newNode.setAttribute(getString(attribute[1]), getString(attribute[2]));
      }
    });
    parent.appendChild(newNode);
    applyDefaultChangeListener(worker, newNode);
    replaceNodes(node[4
    /* childNodes */
    ] || [], parent.childNodes[index], worker);
  });
}
/**
 * Hydrate a single node and it's children safely.
 * Attempt to ensure content is a rough match so content doesn't shift between the document representation
 * and client side generated content.
 * @param transferNode root of the background thread content (document.body from worker-thread).
 * @param node root for the foreground thread content (element upgraded to background driven).
 * @param worker worker that issued the request for hydration.
 */


function hydrateNode(transferNode, node, worker) {
  const transferIsText = isTextNode(transferNode);
  const nodeIsText = isTextNode(node);

  if (!transferIsText && !nodeIsText) {
    const childNodes = transferNode[4
    /* childNodes */
    ] || [];

    if (childNodes.length !== node.childNodes.length) {
      // If this parent node has an unequal number of childNodes, we need to ensure its for an allowable reason.
      if (allTextNodes(childNodes) && allTextNodes(node.childNodes)) {
        // Offset due to a differing number of text nodes.
        // replace the current DOM with the text nodes from the hydration.
        replaceNodes(childNodes, node, worker);
      } else {
        const filteredTransfer = childNodes.filter(childNode => !isTextNode(childNode));
        const filteredNodes = [].filter.call(node.childNodes, childNode => !isTextNode(childNode)); // Empty text nodes are used by frameworks as placeholders for future dom content.

        if (filteredTransfer.length === filteredNodes.length) {
          storeNode(node, transferNode[7
          /* _index_ */
          ]);
          replaceNodes(childNodes, node, worker);
        }
      }
    } else {
      storeNode(node, transferNode[7
      /* _index_ */
      ]);
      applyDefaultChangeListener(worker, node); // Same number of children, hydrate them.

      childNodes.forEach((childNode, index) => hydrateNode(childNode, node.childNodes[index], worker));
    }
  } else if (transferIsText && nodeIsText) {
    // Singular text node, no children.
    storeNode(node, transferNode[7
    /* _index_ */
    ]);
    node.textContent = getString(transferNode[5
    /* textContent */
    ]);
    applyDefaultChangeListener(worker, node);
  }
}
/**
 * Hydrate a root from the worker thread by comparing with the main thread representation.
 * @param skeleton root of the background thread content.
 * @param addEvents events needing subscription from the background thread content.
 * @param baseElement root of the main thread content to compare against.
 * @param worker worker issuing the upgrade request.
 */


function hydrate(skeleton, stringValues, addEvents, baseElement, worker) {
  // Process String Additions
  stringValues.forEach(value => storeString(value)); // Process Node Addition / Removal

  hydrateNode(skeleton, baseElement, worker); // Process Event Addition

  addEvents.forEach(event => {
    const node = getNode(event[7
    /* _index_ */
    ]);
    node && processListenerChange(worker, node, true, getString(event[9
    /* type */
    ]), event[33
    /* index */
    ]);
  });
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
let MUTATION_QUEUE = [];
let PENDING_MUTATIONS = false;
let worker;
function prepareMutate(passedWorker) {
  worker = passedWorker;
}
const mutators = {
  [2
  /* CHILD_LIST */
  ](mutation, target, sanitizer) {
    (mutation[12
    /* removedNodes */
    ] || []).forEach(node => getNode(node[7
    /* _index_ */
    ]).remove());
    const addedNodes = mutation[11
    /* addedNodes */
    ];
    const nextSibling = mutation[14
    /* nextSibling */
    ];

    if (addedNodes) {
      addedNodes.forEach(node => {
        let newChild = getNode(node[7
        /* _index_ */
        ]);

        if (!newChild) {
          newChild = createNode(node);

          if (sanitizer) {
            sanitizer.sanitize(newChild); // TODO(choumx): Inform worker?
          }
        }

        target.insertBefore(newChild, nextSibling && getNode(nextSibling[7
        /* _index_ */
        ]) || null);
      });
    }
  },

  [0
  /* ATTRIBUTES */
  ](mutation, target, sanitizer) {
    const attributeName = mutation[15
    /* attributeName */
    ] !== undefined ? getString(mutation[15
    /* attributeName */
    ]) : null;
    const value = mutation[18
    /* value */
    ] !== undefined ? getString(mutation[18
    /* value */
    ]) : null;

    if (attributeName != null && value != null) {
      if (!sanitizer || sanitizer.validAttribute(target.nodeName, attributeName, value)) {
        target.setAttribute(attributeName, value);
      }
    }
  },

  [1
  /* CHARACTER_DATA */
  ](mutation, target) {
    const value = mutation[18
    /* value */
    ];

    if (value) {
      // Sanitization not necessary for textContent.
      target.textContent = getString(value);
    }
  },

  [3
  /* PROPERTIES */
  ](mutation, target, sanitizer) {
    const propertyName = mutation[17
    /* propertyName */
    ] !== undefined ? getString(mutation[17
    /* propertyName */
    ]) : null;
    const value = mutation[18
    /* value */
    ] !== undefined ? getString(mutation[18
    /* value */
    ]) : null;

    if (propertyName && value) {
      if (!sanitizer || sanitizer.validProperty(target.nodeName, propertyName, value)) {
        target[propertyName] = value;
      }
    }
  },

  [4
  /* COMMAND */
  ](mutation) {
    process(worker, mutation);
  }

};
/**
 * Process MutationRecords from worker thread applying changes to the existing DOM.
 * @param nodes New nodes to add in the main thread with the incoming mutations.
 * @param mutations Changes to apply in both graph shape and content of Elements.
 * @param sanitizer Sanitizer to apply to content if needed.
 */

function mutate(nodes, stringValues, mutations, sanitizer) {
  //mutations: TransferrableMutationRecord[]): void {
  // TODO(KB): Restore signature requiring lastMutationTime. (lastGestureTime: number, mutations: TransferrableMutationRecord[])
  // if (performance.now() || Date.now() - lastGestureTime > GESTURE_TO_MUTATION_THRESHOLD) {
  //   return;
  // }
  // this.lastGestureTime = lastGestureTime;
  stringValues.forEach(value => storeString(value));
  nodes.forEach(node => createNode(node));
  MUTATION_QUEUE = MUTATION_QUEUE.concat(mutations);

  if (!PENDING_MUTATIONS) {
    PENDING_MUTATIONS = true;
    requestAnimationFrame(() => syncFlush(sanitizer));
  }
}
/**
 * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
 * mutations to apply in a single frame.
 *
 * Investigations in using asyncFlush to resolve are worth considering.
 */

function syncFlush(sanitizer) {
  MUTATION_QUEUE.forEach(mutation => {
    mutators[mutation[9
    /* type */
    ]](mutation, getNode(mutation[10
    /* target */
    ]), sanitizer);
  });
  MUTATION_QUEUE = [];
  PENDING_MUTATIONS = false;
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
function install(baseElement, workerDOMUrl, sanitizer) {
  const authorURL = baseElement.getAttribute('src');

  if (authorURL === null) {
    return;
  }

  createWorker(workerDOMUrl, authorURL).then(worker => {
    if (worker === null) {
      return;
    }

    prepare(baseElement);
    prepareMutate(worker);

    worker.onmessage = ({
      data
    }) => {
      switch (data[9
      /* type */
      ]) {
        case 2
        /* HYDRATE */
        :
          // console.info(`hydration from worker: ${data.type}`, data);
          hydrate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[20
          /* addedEvents */
          ], baseElement, worker);
          break;

        case 3
        /* MUTATE */
        :
          // console.info(`mutation from worker: ${data.type}`, data);
          mutate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[34
          /* mutations */
          ], sanitizer);
          break;
      }
    };
  });
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
function upgradeElement(baseElement, workerDOMUrl) {
  install(baseElement, workerDOMUrl, new DOMPurifySanitizer());
}

export { upgradeElement };
//# sourceMappingURL=index.safe.mjs.map