/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/*
  This is a limited shim for ShadowDOM css styling.
  https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#styles

  The intention here is to support only the styling features which can be
  relatively simply implemented. The goal is to allow users to avoid the
  most obvious pitfalls and do so without compromising performance significantly.
  For ShadowDOM styling that's not covered here, a set of best practices
  can be provided that should allow users to accomplish more complex styling.

  The following is a list of specific ShadowDOM styling features and a brief
  discussion of the approach used to shim.

  Shimmed features:

  * :host, :host-context: ShadowDOM allows styling of the shadowRoot's host
  element using the :host rule. To shim this feature, the :host styles are
  reformatted and prefixed with a given scope name and promoted to a
  document level stylesheet.
  For example, given a scope name of .foo, a rule like this:

    :host {
        background: red;
      }
    }

  becomes:

    .foo {
      background: red;
    }

  * encapsultion: Styles defined within ShadowDOM, apply only to
  dom inside the ShadowDOM. Polymer uses one of two techniques to imlement
  this feature.

  By default, rules are prefixed with the host element tag name
  as a descendant selector. This ensures styling does not leak out of the 'top'
  of the element's ShadowDOM. For example,

  div {
      font-weight: bold;
    }

  becomes:

  x-foo div {
      font-weight: bold;
    }

  becomes:


  Alternatively, if WebComponents.ShadowCSS.strictStyling is set to true then
  selectors are scoped by adding an attribute selector suffix to each
  simple selector that contains the host element tag name. Each element
  in the element's ShadowDOM template is also given the scope attribute.
  Thus, these rules match only elements that have the scope attribute.
  For example, given a scope name of x-foo, a rule like this:

    div {
      font-weight: bold;
    }

  becomes:

    div[x-foo] {
      font-weight: bold;
    }

  Note that elements that are dynamically added to a scope must have the scope
  selector added to them manually.

  * upper/lower bound encapsulation: Styles which are defined outside a
  shadowRoot should not cross the ShadowDOM boundary and should not apply
  inside a shadowRoot.

  This styling behavior is not emulated. Some possible ways to do this that
  were rejected due to complexity and/or performance concerns include: (1) reset
  every possible property for every possible selector for a given scope name;
  (2) re-implement css in javascript.

  As an alternative, users should make sure to use selectors
  specific to the scope in which they are working.

  * ::distributed: This behavior is not emulated. It's often not necessary
  to style the contents of a specific insertion point and instead, descendants
  of the host element can be styled selectively. Users can also create an
  extra node around an insertion point and style that node's contents
  via descendent selectors. For example, with a shadowRoot like this:

    <style>
      ::content(div) {
        background: red;
      }
    </style>
    <content></content>

  could become:

    <style>
      / *@polyfill .content-container div * /
      ::content(div) {
        background: red;
      }
    </style>
    <div class="content-container">
      <content></content>
    </div>

  Note the use of @polyfill in the comment above a ShadowDOM specific style
  declaration. This is a directive to the styling shim to use the selector
  in comments in lieu of the next selector when running under polyfill.
*/
(function(scope) {

var ShadowCSS = {
  strictStyling: false,
  registry: {},
  // Shim styles for a given root associated with a name and extendsName
  // 1. cache root styles by name
  // 2. optionally tag root nodes with scope name
  // 3. shim polyfill directives /* @polyfill */ and /* @polyfill-rule */
  // 4. shim :host and scoping
  shimStyling: function(root, name, extendsName) {
    var scopeStyles = this.prepareRoot(root, name, extendsName);
    var typeExtension = this.isTypeExtension(extendsName);
    var scopeSelector = this.makeScopeSelector(name, typeExtension);
    // use caching to make working with styles nodes easier and to facilitate
    // lookup of extendee
    var cssText = stylesToCssText(scopeStyles, true);
    cssText = this.scopeCssText(cssText, scopeSelector);
    // cache shimmed css on root for user extensibility
    if (root) {
      root.shimmedStyle = cssText;
    }
    // add style to document
    this.addCssToDocument(cssText, name);
  },
  /*
  * Shim a style element with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  */
  shimStyle: function(style, selector) {
    return this.shimCssText(style.textContent, selector);
  },
  /*
  * Shim some cssText with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  */
  shimCssText: function(cssText, selector) {
    cssText = this.insertDirectives(cssText);
    return this.scopeCssText(cssText, selector);
  },
  makeScopeSelector: function(name, typeExtension) {
    if (name) {
      return typeExtension ? '[is=' + name + ']' : name;
    }
    return '';
  },
  isTypeExtension: function(extendsName) {
    return extendsName && extendsName.indexOf('-') < 0;
  },
  prepareRoot: function(root, name, extendsName) {
    var def = this.registerRoot(root, name, extendsName);
    this.replaceTextInStyles(def.rootStyles, this.insertDirectives);
    // remove existing style elements
    this.removeStyles(root, def.rootStyles);
    // apply strict attr
    if (this.strictStyling) {
      this.applyScopeToContent(root, name);
    }
    return def.scopeStyles;
  },
  removeStyles: function(root, styles) {
    for (var i=0, l=styles.length, s; (i<l) && (s=styles[i]); i++) {
      s.parentNode.removeChild(s);
    }
  },
  registerRoot: function(root, name, extendsName) {
    var def = this.registry[name] = {
      root: root,
      name: name,
      extendsName: extendsName
    }
    var styles = this.findStyles(root);
    def.rootStyles = styles;
    def.scopeStyles = def.rootStyles;
    var extendee = this.registry[def.extendsName];
    if (extendee) {
      def.scopeStyles = extendee.scopeStyles.concat(def.scopeStyles);
    }
    return def;
  },
  findStyles: function(root) {
    if (!root) {
      return [];
    }
    var styles = root.querySelectorAll('style');
    return Array.prototype.filter.call(styles, function(s) {
      return !s.hasAttribute(NO_SHIM_ATTRIBUTE);
    });
  },
  applyScopeToContent: function(root, name) {
    if (root) {
      // add the name attribute to each node in root.
      Array.prototype.forEach.call(root.querySelectorAll('*'),
          function(node) {
            node.setAttribute(name, '');
          });
      // and template contents too
      Array.prototype.forEach.call(root.querySelectorAll('template'),
          function(template) {
            this.applyScopeToContent(template.content, name);
          },
          this);
    }
  },
  insertDirectives: function(cssText) {
    cssText = this.insertPolyfillDirectivesInCssText(cssText);
    return this.insertPolyfillRulesInCssText(cssText);
  },
  /*
   * Process styles to convert native ShadowDOM rules that will trip
   * up the css parser; we rely on decorating the stylesheet with inert rules.
   *
   * For example, we convert this rule:
   *
   * polyfill-next-selector { content: ':host menu-item'; }
   * ::content menu-item {
   *
   * to this:
   *
   * scopeName menu-item {
   *
  **/
  insertPolyfillDirectivesInCssText: function(cssText) {
    // TODO(sorvell): remove either content or comment
    cssText = cssText.replace(cssCommentNextSelectorRe, function(match, p1) {
      // remove end comment delimiter and add block start
      return p1.slice(0, -2) + '{';
    });
    return cssText.replace(cssContentNextSelectorRe, function(match, p1) {
      return p1 + ' {';
    });
  },
  /*
   * Process styles to add rules which will only apply under the polyfill
   *
   * For example, we convert this rule:
   *
   * polyfill-rule {
   *   content: ':host menu-item';
   * ...
   * }
   *
   * to this:
   *
   * scopeName menu-item {...}
   *
  **/
  insertPolyfillRulesInCssText: function(cssText) {
    // TODO(sorvell): remove either content or comment
    cssText = cssText.replace(cssCommentRuleRe, function(match, p1) {
      // remove end comment delimiter
      return p1.slice(0, -1);
    });
    return cssText.replace(cssContentRuleRe, function(match, p1, p2, p3) {
      var rule = match.replace(p1, '').replace(p2, '');
      return p3 + rule;
    });
  },
  /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
   *
   *  .foo {... }
   *
   *  and converts this to
   *
   *  scopeName .foo { ... }
  */
  scopeCssText: function(cssText, scopeSelector) {
    var unscoped = this.extractUnscopedRulesFromCssText(cssText);
    cssText = this.insertPolyfillHostInCssText(cssText);
    cssText = this.convertColonHost(cssText);
    cssText = this.convertColonHostContext(cssText);
    cssText = this.convertShadowDOMSelectors(cssText);
    if (scopeSelector) {
      var self = this, cssText;
      withCssRules(cssText, function(rules) {
        cssText = self.scopeRules(rules, scopeSelector);
      });

    }
    cssText = cssText + '\n' + unscoped;
    return cssText.trim();
  },
  /*
   * Process styles to add rules which will only apply under the polyfill
   * and do not process via CSSOM. (CSSOM is destructive to rules on rare
   * occasions, e.g. -webkit-calc on Safari.)
   * For example, we convert this rule:
   *
   * (comment start) @polyfill-unscoped-rule menu-item {
   * ... } (comment end)
   *
   * to this:
   *
   * menu-item {...}
   *
  **/
  extractUnscopedRulesFromCssText: function(cssText) {
    // TODO(sorvell): remove either content or comment
    var r = '', m;
    while (m = cssCommentUnscopedRuleRe.exec(cssText)) {
      r += m[1].slice(0, -1) + '\n\n';
    }
    while (m = cssContentUnscopedRuleRe.exec(cssText)) {
      r += m[0].replace(m[2], '').replace(m[1], m[3]) + '\n\n';
    }
    return r;
  },
  /*
   * convert a rule like :host(.foo) > .bar { }
   *
   * to
   *
   * scopeName.foo > .bar
  */
  convertColonHost: function(cssText) {
    return this.convertColonRule(cssText, cssColonHostRe,
        this.colonHostPartReplacer);
  },
  /*
   * convert a rule like :host-context(.foo) > .bar { }
   *
   * to
   *
   * scopeName.foo > .bar, .foo scopeName > .bar { }
   *
   * and
   *
   * :host-context(.foo:host) .bar { ... }
   *
   * to
   *
   * scopeName.foo .bar { ... }
  */
  convertColonHostContext: function(cssText) {
    return this.convertColonRule(cssText, cssColonHostContextRe,
        this.colonHostContextPartReplacer);
  },
  convertColonRule: function(cssText, regExp, partReplacer) {
    // p1 = :host, p2 = contents of (), p3 rest of rule
    return cssText.replace(regExp, function(m, p1, p2, p3) {
      p1 = polyfillHostNoCombinator;
      if (p2) {
        var parts = p2.split(','), r = [];
        for (var i=0, l=parts.length, p; (i<l) && (p=parts[i]); i++) {
          p = p.trim();
          r.push(partReplacer(p1, p, p3));
        }
        return r.join(',');
      } else {
        return p1 + p3;
      }
    });
  },
  colonHostContextPartReplacer: function(host, part, suffix) {
    if (part.match(polyfillHost)) {
      return this.colonHostPartReplacer(host, part, suffix);
    } else {
      return host + part + suffix + ', ' + part + ' ' + host + suffix;
    }
  },
  colonHostPartReplacer: function(host, part, suffix) {
    return host + part.replace(polyfillHost, '') + suffix;
  },
  /*
   * Convert combinators like ::shadow and pseudo-elements like ::content
   * by replacing with space.
  */
  convertShadowDOMSelectors: function(cssText) {
    for (var i=0; i < shadowDOMSelectorsRe.length; i++) {
      cssText = cssText.replace(shadowDOMSelectorsRe[i], ' ');
    }
    return cssText;
  },
  // change a selector like 'div' to 'name div'
  scopeRules: function(cssRules, scopeSelector) {
    var cssText = '';
    if (cssRules) {
      Array.prototype.forEach.call(cssRules, function(rule) {
        if (rule.selectorText && (rule.style && rule.style.cssText !== undefined)) {
          cssText += this.scopeSelector(rule.selectorText, scopeSelector,
            this.strictStyling) + ' {\n\t';
          cssText += this.propertiesFromRule(rule) + '\n}\n\n';
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          cssText += '@media ' + rule.media.mediaText + ' {\n';
          cssText += this.scopeRules(rule.cssRules, scopeSelector);
          cssText += '\n}\n\n';
        } else {
          // KEYFRAMES_RULE in IE throws when we query cssText
          // when it contains a -webkit- property.
          // if this happens, we fallback to constructing the rule
          // from the CSSRuleSet
          // https://connect.microsoft.com/IE/feedbackdetail/view/955703/accessing-csstext-of-a-keyframe-rule-that-contains-a-webkit-property-via-cssom-generates-exception
          try {
            if (rule.cssText) {
              cssText += rule.cssText + '\n\n';
            }
          } catch(x) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {
              cssText += this.ieSafeCssTextFromKeyFrameRule(rule);
            }
          }
        }
      }, this);
    }
    return cssText;
  },
  ieSafeCssTextFromKeyFrameRule: function(rule) {
    var cssText = '@keyframes ' + rule.name + ' {';
    Array.prototype.forEach.call(rule.cssRules, function(rule) {
      cssText += ' ' + rule.keyText + ' {' + rule.style.cssText + '}';
    });
    cssText += ' }';
    return cssText;
  },
  scopeSelector: function(selector, scopeSelector, strict) {
    var r = [], parts = selector.split(',');
    parts.forEach(function(p) {
      p = p.trim();
      if (this.selectorNeedsScoping(p, scopeSelector)) {
        p = (strict && !p.match(polyfillHostNoCombinator)) ?
            this.applyStrictSelectorScope(p, scopeSelector) :
            this.applySelectorScope(p, scopeSelector);
      }
      r.push(p);
    }, this);
    return r.join(', ');
  },
  selectorNeedsScoping: function(selector, scopeSelector) {
    if (Array.isArray(scopeSelector)) {
      return true;
    }
    var re = this.makeScopeMatcher(scopeSelector);
    return !selector.match(re);
  },
  makeScopeMatcher: function(scopeSelector) {
    scopeSelector = scopeSelector.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    return new RegExp('^(' + scopeSelector + ')' + selectorReSuffix, 'm');
  },
  applySelectorScope: function(selector, selectorScope) {
    return Array.isArray(selectorScope) ?
        this.applySelectorScopeList(selector, selectorScope) :
        this.applySimpleSelectorScope(selector, selectorScope);
  },
  // apply an array of selectors
  applySelectorScopeList: function(selector, scopeSelectorList) {
    var r = [];
    for (var i=0, s; (s=scopeSelectorList[i]); i++) {
      r.push(this.applySimpleSelectorScope(selector, s));
    }
    return r.join(', ');
  },
  // scope via name and [is=name]
  applySimpleSelectorScope: function(selector, scopeSelector) {
    if (selector.match(polyfillHostRe)) {
      selector = selector.replace(polyfillHostNoCombinator, scopeSelector);
      return selector.replace(polyfillHostRe, scopeSelector + ' ');
    } else {
      return scopeSelector + ' ' + selector;
    }
  },
  // return a selector with [name] suffix on each simple selector
  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]
  applyStrictSelectorScope: function(selector, scopeSelector) {
    scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, '$1');
    var splits = [' ', '>', '+', '~'],
      scoped = selector,
      attrName = '[' + scopeSelector + ']';
    splits.forEach(function(sep) {
      var parts = scoped.split(sep);
      scoped = parts.map(function(p) {
        // remove :host since it should be unnecessary
        var t = p.trim().replace(polyfillHostRe, '');
        if (t && (splits.indexOf(t) < 0) && (t.indexOf(attrName) < 0)) {
          p = t.replace(/([^:]*)(:*)(.*)/, '$1' + attrName + '$2$3');
        }
        return p;
      }).join(sep);
    });
    return scoped;
  },
  insertPolyfillHostInCssText: function(selector) {
    return selector.replace(colonHostContextRe, polyfillHostContext).replace(
        colonHostRe, polyfillHost);
  },
  propertiesFromRule: function(rule) {
    var cssText = rule.style.cssText;
    // TODO(sorvell): Safari cssom incorrectly removes quotes from the content
    // property. (https://bugs.webkit.org/show_bug.cgi?id=118045)
    // don't replace attr rules
    if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {
      cssText = cssText.replace(/content:[^;]*;/g, 'content: \'' +
          rule.style.content + '\';');
    }
    // TODO(sorvell): we can workaround this issue here, but we need a list
    // of troublesome properties to fix https://github.com/Polymer/platform/issues/53
    //
    // inherit rules can be omitted from cssText
    // TODO(sorvell): remove when Blink bug is fixed:
    // https://code.google.com/p/chromium/issues/detail?id=358273
    var style = rule.style;
    for (var i in style) {
      if (style[i] === 'initial') {
        cssText += i + ': initial; ';
      }
    }
    return cssText;
  },
  replaceTextInStyles: function(styles, action) {
    if (styles && action) {
      if (!(styles instanceof Array)) {
        styles = [styles];
      }
      Array.prototype.forEach.call(styles, function(s) {
        s.textContent = action.call(this, s.textContent);
      }, this);
    }
  },
  addCssToDocument: function(cssText, name) {
    if (cssText.match('@import')) {
      addOwnSheet(cssText, name);
    } else {
      addCssToDocument(cssText);
    }
  }
};

var selectorRe = /([^{]*)({[\s\S]*?})/gim,
    cssCommentRe = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
    // TODO(sorvell): remove either content or comment
    cssCommentNextSelectorRe = /\/\*\s*@polyfill ([^*]*\*+([^/*][^*]*\*+)*\/)([^{]*?){/gim,
    cssContentNextSelectorRe = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim,
    // TODO(sorvell): remove either content or comment
    cssCommentRuleRe = /\/\*\s@polyfill-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim,
    cssContentRuleRe = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim,
    // TODO(sorvell): remove either content or comment
    cssCommentUnscopedRuleRe = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim,
    cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim,
    cssPseudoRe = /::(x-[^\s{,(]*)/gim,
    cssPartRe = /::part\(([^)]*)\)/gim,
    // note: :host pre-processed to -shadowcsshost.
    polyfillHost = '-shadowcsshost',
    // note: :host-context pre-processed to -shadowcsshostcontext.
    polyfillHostContext = '-shadowcsscontext',
    parenSuffix = ')(?:\\((' +
        '(?:\\([^)(]*\\)|[^)(]*)+?' +
        ')\\))?([^,{]*)';
    var cssColonHostRe = new RegExp('(' + polyfillHost + parenSuffix, 'gim'),
    cssColonHostContextRe = new RegExp('(' + polyfillHostContext + parenSuffix, 'gim'),
    selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$',
    colonHostRe = /\:host/gim,
    colonHostContextRe = /\:host-context/gim,
    /* host name without combinator */
    polyfillHostNoCombinator = polyfillHost + '-no-combinator',
    polyfillHostRe = new RegExp(polyfillHost, 'gim'),
    polyfillHostContextRe = new RegExp(polyfillHostContext, 'gim'),
    shadowDOMSelectorsRe = [
      />>>/g,
      /::shadow/g,
      /::content/g,
      // Deprecated selectors
      /\/deep\//g, // former >>>
      /\/shadow\//g, // former ::shadow
      /\/shadow-deep\//g, // former /deep/
      /\^\^/g,     // former /shadow/
      /\^(?!=)/g   // former /shadow-deep/
    ];

function stylesToCssText(styles, preserveComments) {
  var cssText = '';
  Array.prototype.forEach.call(styles, function(s) {
    cssText += s.textContent + '\n\n';
  });
  // strip comments for easier processing
  if (!preserveComments) {
    cssText = cssText.replace(cssCommentRe, '');
  }
  return cssText;
}

function cssTextToStyle(cssText) {
  var style = document.createElement('style');
  style.textContent = cssText;
  return style;
}

function cssToRules(cssText) {
  var style = cssTextToStyle(cssText);
  document.head.appendChild(style);
  var rules = [];
  if (style.sheet) {
    // TODO(sorvell): Firefox throws when accessing the rules of a stylesheet
    // with an @import
    // https://bugzilla.mozilla.org/show_bug.cgi?id=625013
    try {
      rules = style.sheet.cssRules;
    } catch(e) {
      //
    }
  } else {
    console.warn('sheet not found', style);
  }
  style.parentNode.removeChild(style);
  return rules;
}

var frame = document.createElement('iframe');
frame.style.display = 'none';

function initFrame() {
  frame.initialized = true;
  document.body.appendChild(frame);
  var doc = frame.contentDocument;
  var base = doc.createElement('base');
  base.href = document.baseURI;
  doc.head.appendChild(base);
}

function inFrame(fn) {
  if (!frame.initialized) {
    initFrame();
  }
  document.body.appendChild(frame);
  fn(frame.contentDocument);
  document.body.removeChild(frame);
}

// TODO(sorvell): use an iframe if the cssText contains an @import to workaround
// https://code.google.com/p/chromium/issues/detail?id=345114
var isChrome = navigator.userAgent.match('Chrome');
function withCssRules(cssText, callback) {
  if (!callback) {
    return;
  }
  var rules;
  if (cssText.match('@import') && isChrome) {
    var style = cssTextToStyle(cssText);
    inFrame(function(doc) {
      doc.head.appendChild(style.impl);
      rules = Array.prototype.slice.call(style.sheet.cssRules, 0);
      callback(rules);
    });
  } else {
    rules = cssToRules(cssText);
    callback(rules);
  }
}

function rulesToCss(cssRules) {
  for (var i=0, css=[]; i < cssRules.length; i++) {
    css.push(cssRules[i].cssText);
  }
  return css.join('\n\n');
}

function addCssToDocument(cssText) {
  if (cssText) {
    getSheet().appendChild(document.createTextNode(cssText));
  }
}

function addOwnSheet(cssText, name) {
  var style = cssTextToStyle(cssText);
  style.setAttribute(name, '');
  style.setAttribute(SHIMMED_ATTRIBUTE, '');
  document.head.appendChild(style);
}

var SHIM_ATTRIBUTE = 'shim-shadowdom';
var SHIMMED_ATTRIBUTE = 'shim-shadowdom-css';
var NO_SHIM_ATTRIBUTE = 'no-shim';

var sheet;
function getSheet() {
  if (!sheet) {
    sheet = document.createElement("style");
    sheet.setAttribute(SHIMMED_ATTRIBUTE, '');
    sheet[SHIMMED_ATTRIBUTE] = true;
  }
  return sheet;
}

// add polyfill stylesheet to document
if (window.ShadowDOMPolyfill) {
  addCssToDocument('style { display: none !important; }\n');
  var doc = ShadowDOMPolyfill.wrap(document);
  var head = doc.querySelector('head');
  head.insertBefore(getSheet(), head.childNodes[0]);

  // TODO(sorvell): monkey-patching HTMLImports is abusive;
  // consider a better solution.
  document.addEventListener('DOMContentLoaded', function() {
    var urlResolver = scope.urlResolver;

    if (window.HTMLImports && !HTMLImports.useNative) {
      var SHIM_SHEET_SELECTOR = 'link[rel=stylesheet]' +
          '[' + SHIM_ATTRIBUTE + ']';
      var SHIM_STYLE_SELECTOR = 'style[' + SHIM_ATTRIBUTE + ']';
      HTMLImports.importer.documentPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;
      HTMLImports.importer.importsPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;

      HTMLImports.parser.documentSelectors = [
        HTMLImports.parser.documentSelectors,
        SHIM_SHEET_SELECTOR,
        SHIM_STYLE_SELECTOR
      ].join(',');

      var originalParseGeneric = HTMLImports.parser.parseGeneric;

      HTMLImports.parser.parseGeneric = function(elt) {
        if (elt[SHIMMED_ATTRIBUTE]) {
          return;
        }
        var style = elt.__importElement || elt;
        if (!style.hasAttribute(SHIM_ATTRIBUTE)) {
          originalParseGeneric.call(this, elt);
          return;
        }
        if (elt.__resource) {
          style = elt.ownerDocument.createElement('style');
          style.textContent = elt.__resource;
        }
        // relay on HTMLImports for path fixup
        HTMLImports.path.resolveUrlsInStyle(style, elt.href);
        style.textContent = ShadowCSS.shimStyle(style);
        style.removeAttribute(SHIM_ATTRIBUTE, '');
        style.setAttribute(SHIMMED_ATTRIBUTE, '');
        style[SHIMMED_ATTRIBUTE] = true;
        // place in document
        if (style.parentNode !== head) {
          // replace links in head
          if (elt.parentNode === head) {
            head.replaceChild(style, elt);
          } else {
            this.addElementToDocument(style);
          }
        }
        style.__importParsed = true;
        this.markParsingComplete(elt);
        this.parseNext();
      }

      var hasResource = HTMLImports.parser.hasResource;
      HTMLImports.parser.hasResource = function(node) {
        if (node.localName === 'link' && node.rel === 'stylesheet' &&
            node.hasAttribute(SHIM_ATTRIBUTE)) {
          return (node.__resource);
        } else {
          return hasResource.call(this, node);
        }
      }

    }
  });
}

// exports
scope.ShadowCSS = ShadowCSS;

})(window.WebComponents);
