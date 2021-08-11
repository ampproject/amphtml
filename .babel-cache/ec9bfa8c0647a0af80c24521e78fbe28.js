/**
* @license
* Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file or at
* https://developers.google.com/open-source/licenses/bsd
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
export var ShadowCSS = {
  strictStyling: false,
  // change a selector like 'div' to 'name div'

  /** @this {ShadowCSS} */
  scopeRules: function scopeRules(cssRules, scopeSelector, opt_transformer) {
    var cssText = '';

    if (cssRules) {
      Array.prototype.forEach.call(cssRules, function (rule) {
        if (rule.selectorText && rule.style && rule.style.cssText !== undefined) {
          cssText += this.scopeSelector(rule.selectorText, scopeSelector, this.strictStyling, opt_transformer) + ' {\n\t';
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
          } catch (x) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {
              cssText += this.ieSafeCssTextFromKeyFrameRule(rule);
            }
          }
        }
      }, this);
    }

    return cssText;
  },

  /** @this {ShadowCSS} */
  ieSafeCssTextFromKeyFrameRule: function ieSafeCssTextFromKeyFrameRule(rule) {
    var cssText = '@keyframes ' + rule.name + ' {';
    Array.prototype.forEach.call(rule.cssRules, function (rule) {
      cssText += ' ' + rule.keyText + ' {' + rule.style.cssText + '}';
    });
    cssText += ' }';
    return cssText;
  },

  /** @this {ShadowCSS} */
  scopeSelector: function scopeSelector(selector, _scopeSelector, strict, opt_transformer) {
    var r = [],
        parts = selector.split(',');
    parts.forEach(function (p) {
      p = p.trim();

      if (opt_transformer) {
        p = opt_transformer(p);
      }

      if (this.selectorNeedsScoping(p, _scopeSelector)) {
        p = strict && !p.match(polyfillHostNoCombinator) ? this.applyStrictSelectorScope(p, _scopeSelector) : this.applySelectorScope(p, _scopeSelector);
      }

      r.push(p);
    }, this);
    return r.join(', ');
  },

  /** @this {ShadowCSS} */
  selectorNeedsScoping: function selectorNeedsScoping(selector, scopeSelector) {
    if (Array.isArray(scopeSelector)) {
      return true;
    }

    var re = this.makeScopeMatcher(scopeSelector);
    return !selector.match(re);
  },

  /** @this {ShadowCSS} */
  makeScopeMatcher: function makeScopeMatcher(scopeSelector) {
    scopeSelector = scopeSelector.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    return new RegExp('^(' + scopeSelector + ')' + selectorReSuffix, 'm');
  },

  /** @this {ShadowCSS} */
  applySelectorScope: function applySelectorScope(selector, selectorScope) {
    return Array.isArray(selectorScope) ? this.applySelectorScopeList(selector, selectorScope) : this.applySimpleSelectorScope(selector, selectorScope);
  },
  // apply an array of selectors

  /** @this {ShadowCSS} */
  applySelectorScopeList: function applySelectorScopeList(selector, scopeSelectorList) {
    var r = [];

    for (var i = 0, s; s = scopeSelectorList[i]; i++) {
      r.push(this.applySimpleSelectorScope(selector, s));
    }

    return r.join(', ');
  },
  // scope via name and [is=name]

  /** @this {ShadowCSS} */
  applySimpleSelectorScope: function applySimpleSelectorScope(selector, scopeSelector) {
    if (selector.match(polyfillHostRe)) {
      selector = selector.replace(polyfillHostNoCombinator, scopeSelector);
      return selector.replace(polyfillHostRe, scopeSelector + ' ');
    } else {
      return scopeSelector + ' ' + selector;
    }
  },
  // return a selector with [name] suffix on each simple selector
  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]

  /** @this {ShadowCSS} */
  applyStrictSelectorScope: function applyStrictSelectorScope(selector, scopeSelector) {
    scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, '$1');
    var splits = [' ', '>', '+', '~'],
        scoped = selector,
        attrName = '[' + scopeSelector + ']';
    splits.forEach(function (sep) {
      var parts = scoped.split(sep);
      scoped = parts.map(function (p) {
        // remove :host since it should be unnecessary
        var t = p.trim().replace(polyfillHostRe, '');

        if (t && splits.indexOf(t) < 0 && t.indexOf(attrName) < 0) {
          p = t.replace(/([^:]*)(:*)(.*)/, '$1' + attrName + '$2$3');
        }

        return p;
      }).join(sep);
    });
    return scoped;
  },

  /** @this {ShadowCSS} */
  propertiesFromRule: function propertiesFromRule(rule) {
    var cssText = rule.style.cssText;

    // TODO(sorvell): Safari cssom incorrectly removes quotes from the content
    // property. (https://bugs.webkit.org/show_bug.cgi?id=118045)
    // don't replace attr rules
    if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {
      cssText = cssText.replace(/content:[^;]*;/g, 'content: \'' + rule.style.content + '\';');
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
    parenSuffix = ')(?:\\((' + '(?:\\([^)(]*\\)|[^)(]*)+?' + ')\\))?([^,{]*)';
var cssColonHostRe = new RegExp('(' + polyfillHost + parenSuffix, 'gim'),
    cssColonHostContextRe = new RegExp('(' + polyfillHostContext + parenSuffix, 'gim'),
    selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$',
    colonHostRe = /\:host/gim,
    colonHostContextRe = /\:host-context/gim,

/* host name without combinator */
polyfillHostNoCombinator = polyfillHost + '-no-combinator',
    polyfillHostRe = new RegExp(polyfillHost, 'gim'),
    polyfillHostContextRe = new RegExp(polyfillHostContext, 'gim'),
    shadowDOMSelectorsRe = [/>>>/g, /::shadow/g, /::content/g, // Deprecated selectors
/\/deep\//g, // former >>>
/\/shadow\//g, // former ::shadow
/\/shadow-deep\//g, // former /deep/
/\^\^/g, // former /shadow/
/\^(?!=)/g // former /shadow-deep/
];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYWRvd0NTUy5qcyJdLCJuYW1lcyI6WyJTaGFkb3dDU1MiLCJzdHJpY3RTdHlsaW5nIiwic2NvcGVSdWxlcyIsImNzc1J1bGVzIiwic2NvcGVTZWxlY3RvciIsIm9wdF90cmFuc2Zvcm1lciIsImNzc1RleHQiLCJBcnJheSIsInByb3RvdHlwZSIsImZvckVhY2giLCJjYWxsIiwicnVsZSIsInNlbGVjdG9yVGV4dCIsInN0eWxlIiwidW5kZWZpbmVkIiwicHJvcGVydGllc0Zyb21SdWxlIiwidHlwZSIsIkNTU1J1bGUiLCJNRURJQV9SVUxFIiwibWVkaWEiLCJtZWRpYVRleHQiLCJ4IiwiS0VZRlJBTUVTX1JVTEUiLCJpZVNhZmVDc3NUZXh0RnJvbUtleUZyYW1lUnVsZSIsIm5hbWUiLCJrZXlUZXh0Iiwic2VsZWN0b3IiLCJzdHJpY3QiLCJyIiwicGFydHMiLCJzcGxpdCIsInAiLCJ0cmltIiwic2VsZWN0b3JOZWVkc1Njb3BpbmciLCJtYXRjaCIsInBvbHlmaWxsSG9zdE5vQ29tYmluYXRvciIsImFwcGx5U3RyaWN0U2VsZWN0b3JTY29wZSIsImFwcGx5U2VsZWN0b3JTY29wZSIsInB1c2giLCJqb2luIiwiaXNBcnJheSIsInJlIiwibWFrZVNjb3BlTWF0Y2hlciIsInJlcGxhY2UiLCJSZWdFeHAiLCJzZWxlY3RvclJlU3VmZml4Iiwic2VsZWN0b3JTY29wZSIsImFwcGx5U2VsZWN0b3JTY29wZUxpc3QiLCJhcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUiLCJzY29wZVNlbGVjdG9yTGlzdCIsImkiLCJzIiwicG9seWZpbGxIb3N0UmUiLCJzcGxpdHMiLCJzY29wZWQiLCJhdHRyTmFtZSIsInNlcCIsIm1hcCIsInQiLCJpbmRleE9mIiwiY29udGVudCIsInNlbGVjdG9yUmUiLCJjc3NDb21tZW50UmUiLCJjc3NDb21tZW50TmV4dFNlbGVjdG9yUmUiLCJjc3NDb250ZW50TmV4dFNlbGVjdG9yUmUiLCJjc3NDb21tZW50UnVsZVJlIiwiY3NzQ29udGVudFJ1bGVSZSIsImNzc0NvbW1lbnRVbnNjb3BlZFJ1bGVSZSIsImNzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZSIsImNzc1BzZXVkb1JlIiwiY3NzUGFydFJlIiwicG9seWZpbGxIb3N0IiwicG9seWZpbGxIb3N0Q29udGV4dCIsInBhcmVuU3VmZml4IiwiY3NzQ29sb25Ib3N0UmUiLCJjc3NDb2xvbkhvc3RDb250ZXh0UmUiLCJjb2xvbkhvc3RSZSIsImNvbG9uSG9zdENvbnRleHRSZSIsInBvbHlmaWxsSG9zdENvbnRleHRSZSIsInNoYWRvd0RPTVNlbGVjdG9yc1JlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxPQUFPLElBQU1BLFNBQVMs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YUk7QUFDQUMsWUFBWSxHQUFHLGdCQWRuQjtBQUFBLElBZUk7QUFDQUMsbUJBQW1CLEdBQUcsbUJBaEIxQjtBQUFBLElBaUJJQyxXQUFXLEdBQUcsYUFDViwyQkFEVSxHQUVWLGdCQW5CUjtBQW9CSSxJQUFJQyxjQUFjLEdBQUcsSUFBSTlCLE1BQUosQ0FBVyxNQUFNMkIsWUFBTixHQUFxQkUsV0FBaEMsRUFBNkMsS0FBN0MsQ0FBckI7QUFBQSxJQUNBRSxxQkFBcUIsR0FBRyxJQUFJL0IsTUFBSixDQUFXLE1BQU00QixtQkFBTixHQUE0QkMsV0FBdkMsRUFBb0QsS0FBcEQsQ0FEeEI7QUFBQSxJQUVBNUIsZ0JBQWdCLEdBQUcsNkJBRm5CO0FBQUEsSUFHQStCLFdBQVcsR0FBRyxXQUhkO0FBQUEsSUFJQUMsa0JBQWtCLEdBQUcsbUJBSnJCOztBQUtBO0FBQ0ExQyx3QkFBd0IsR0FBR29DLFlBQVksR0FBRyxnQkFOMUM7QUFBQSxJQU9BbkIsY0FBYyxHQUFHLElBQUlSLE1BQUosQ0FBVzJCLFlBQVgsRUFBeUIsS0FBekIsQ0FQakI7QUFBQSxJQVFBTyxxQkFBcUIsR0FBRyxJQUFJbEMsTUFBSixDQUFXNEIsbUJBQVgsRUFBZ0MsS0FBaEMsQ0FSeEI7QUFBQSxJQVNBTyxvQkFBb0IsR0FBRyxDQUNyQixNQURxQixFQUVyQixXQUZxQixFQUdyQixZQUhxQixFQUlyQjtBQUNBLFdBTHFCLEVBS1I7QUFDYixhQU5xQixFQU1OO0FBQ2Ysa0JBUHFCLEVBT0Q7QUFDcEIsT0FScUIsRUFRUjtBQUNiLFVBVHFCLENBU1I7QUFUUSxDQVR2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbGljZW5zZVxuKiBDb3B5cmlnaHQgKGMpIDIwMTQgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZVxuKiBsaWNlbnNlIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgb3IgYXRcbiogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vb3Blbi1zb3VyY2UvbGljZW5zZXMvYnNkXG4qL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bHRpb246IFN0eWxlcyBkZWZpbmVkIHdpdGhpbiBTaGFkb3dET00sIGFwcGx5IG9ubHkgdG9cbiAgZG9tIGluc2lkZSB0aGUgU2hhZG93RE9NLiBQb2x5bWVyIHVzZXMgb25lIG9mIHR3byB0ZWNobmlxdWVzIHRvIGltbGVtZW50XG4gIHRoaXMgZmVhdHVyZS5cblxuICBCeSBkZWZhdWx0LCBydWxlcyBhcmUgcHJlZml4ZWQgd2l0aCB0aGUgaG9zdCBlbGVtZW50IHRhZyBuYW1lXG4gIGFzIGEgZGVzY2VuZGFudCBzZWxlY3Rvci4gVGhpcyBlbnN1cmVzIHN0eWxpbmcgZG9lcyBub3QgbGVhayBvdXQgb2YgdGhlICd0b3AnXG4gIG9mIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NLiBGb3IgZXhhbXBsZSxcblxuICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgeC1mb28gZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG5cbiAgQWx0ZXJuYXRpdmVseSwgaWYgV2ViQ29tcG9uZW50cy5TaGFkb3dDU1Muc3RyaWN0U3R5bGluZyBpcyBzZXQgdG8gdHJ1ZSB0aGVuXG4gIHNlbGVjdG9ycyBhcmUgc2NvcGVkIGJ5IGFkZGluZyBhbiBhdHRyaWJ1dGUgc2VsZWN0b3Igc3VmZml4IHRvIGVhY2hcbiAgc2ltcGxlIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZS4gRWFjaCBlbGVtZW50XG4gIGluIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NIHRlbXBsYXRlIGlzIGFsc28gZ2l2ZW4gdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgVGh1cywgdGhlc2UgcnVsZXMgbWF0Y2ggb25seSBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiB4LWZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICAgIGRpdlt4LWZvb10ge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIE5vdGUgdGhhdCBlbGVtZW50cyB0aGF0IGFyZSBkeW5hbWljYWxseSBhZGRlZCB0byBhIHNjb3BlIG11c3QgaGF2ZSB0aGUgc2NvcGVcbiAgc2VsZWN0b3IgYWRkZWQgdG8gdGhlbSBtYW51YWxseS5cblxuICAqIHVwcGVyL2xvd2VyIGJvdW5kIGVuY2Fwc3VsYXRpb246IFN0eWxlcyB3aGljaCBhcmUgZGVmaW5lZCBvdXRzaWRlIGFcbiAgc2hhZG93Um9vdCBzaG91bGQgbm90IGNyb3NzIHRoZSBTaGFkb3dET00gYm91bmRhcnkgYW5kIHNob3VsZCBub3QgYXBwbHlcbiAgaW5zaWRlIGEgc2hhZG93Um9vdC5cblxuICBUaGlzIHN0eWxpbmcgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBTb21lIHBvc3NpYmxlIHdheXMgdG8gZG8gdGhpcyB0aGF0XG4gIHdlcmUgcmVqZWN0ZWQgZHVlIHRvIGNvbXBsZXhpdHkgYW5kL29yIHBlcmZvcm1hbmNlIGNvbmNlcm5zIGluY2x1ZGU6ICgxKSByZXNldFxuICBldmVyeSBwb3NzaWJsZSBwcm9wZXJ0eSBmb3IgZXZlcnkgcG9zc2libGUgc2VsZWN0b3IgZm9yIGEgZ2l2ZW4gc2NvcGUgbmFtZTtcbiAgKDIpIHJlLWltcGxlbWVudCBjc3MgaW4gamF2YXNjcmlwdC5cblxuICBBcyBhbiBhbHRlcm5hdGl2ZSwgdXNlcnMgc2hvdWxkIG1ha2Ugc3VyZSB0byB1c2Ugc2VsZWN0b3JzXG4gIHNwZWNpZmljIHRvIHRoZSBzY29wZSBpbiB3aGljaCB0aGV5IGFyZSB3b3JraW5nLlxuXG4gICogOjpkaXN0cmlidXRlZDogVGhpcyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIEl0J3Mgb2Z0ZW4gbm90IG5lY2Vzc2FyeVxuICB0byBzdHlsZSB0aGUgY29udGVudHMgb2YgYSBzcGVjaWZpYyBpbnNlcnRpb24gcG9pbnQgYW5kIGluc3RlYWQsIGRlc2NlbmRhbnRzXG4gIG9mIHRoZSBob3N0IGVsZW1lbnQgY2FuIGJlIHN0eWxlZCBzZWxlY3RpdmVseS4gVXNlcnMgY2FuIGFsc28gY3JlYXRlIGFuXG4gIGV4dHJhIG5vZGUgYXJvdW5kIGFuIGluc2VydGlvbiBwb2ludCBhbmQgc3R5bGUgdGhhdCBub2RlJ3MgY29udGVudHNcbiAgdmlhIGRlc2NlbmRlbnQgc2VsZWN0b3JzLiBGb3IgZXhhbXBsZSwgd2l0aCBhIHNoYWRvd1Jvb3QgbGlrZSB0aGlzOlxuXG4gICAgPHN0eWxlPlxuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG5cbiAgY291bGQgYmVjb21lOlxuXG4gICAgPHN0eWxlPlxuICAgICAgLyAqQHBvbHlmaWxsIC5jb250ZW50LWNvbnRhaW5lciBkaXYgKiAvXG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LWNvbnRhaW5lclwiPlxuICAgICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuICAgIDwvZGl2PlxuXG4gIE5vdGUgdGhlIHVzZSBvZiBAcG9seWZpbGwgaW4gdGhlIGNvbW1lbnQgYWJvdmUgYSBTaGFkb3dET00gc3BlY2lmaWMgc3R5bGVcbiAgZGVjbGFyYXRpb24uIFRoaXMgaXMgYSBkaXJlY3RpdmUgdG8gdGhlIHN0eWxpbmcgc2hpbSB0byB1c2UgdGhlIHNlbGVjdG9yXG4gIGluIGNvbW1lbnRzIGluIGxpZXUgb2YgdGhlIG5leHQgc2VsZWN0b3Igd2hlbiBydW5uaW5nIHVuZGVyIHBvbHlmaWxsLlxuKi9cblxuZXhwb3J0IGNvbnN0IFNoYWRvd0NTUyA9IHtcbiAgc3RyaWN0U3R5bGluZzogZmFsc2UsXG4gIC8vIGNoYW5nZSBhIHNlbGVjdG9yIGxpa2UgJ2RpdicgdG8gJ25hbWUgZGl2J1xuICAvKiogQHRoaXMge1NoYWRvd0NTU30gKi9cbiAgc2NvcGVSdWxlczogZnVuY3Rpb24oY3NzUnVsZXMsIHNjb3BlU2VsZWN0b3IsIG9wdF90cmFuc2Zvcm1lcikge1xuICAgIHZhciBjc3NUZXh0ID0gJyc7XG4gICAgaWYgKGNzc1J1bGVzKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGNzc1J1bGVzLCBmdW5jdGlvbihydWxlKSB7XG4gICAgICAgIGlmIChydWxlLnNlbGVjdG9yVGV4dCAmJiAocnVsZS5zdHlsZSAmJiBydWxlLnN0eWxlLmNzc1RleHQgIT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICBjc3NUZXh0ICs9IHRoaXMuc2NvcGVTZWxlY3RvcihydWxlLnNlbGVjdG9yVGV4dCwgc2NvcGVTZWxlY3RvcixcbiAgICAgICAgICAgIHRoaXMuc3RyaWN0U3R5bGluZywgb3B0X3RyYW5zZm9ybWVyKSArICcge1xcblxcdCc7XG4gICAgICAgICAgY3NzVGV4dCArPSB0aGlzLnByb3BlcnRpZXNGcm9tUnVsZShydWxlKSArICdcXG59XFxuXFxuJztcbiAgICAgICAgfSBlbHNlIGlmIChydWxlLnR5cGUgPT09IENTU1J1bGUuTUVESUFfUlVMRSkge1xuICAgICAgICAgIGNzc1RleHQgKz0gJ0BtZWRpYSAnICsgcnVsZS5tZWRpYS5tZWRpYVRleHQgKyAnIHtcXG4nO1xuICAgICAgICAgIGNzc1RleHQgKz0gdGhpcy5zY29wZVJ1bGVzKHJ1bGUuY3NzUnVsZXMsIHNjb3BlU2VsZWN0b3IpO1xuICAgICAgICAgIGNzc1RleHQgKz0gJ1xcbn1cXG5cXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEtFWUZSQU1FU19SVUxFIGluIElFIHRocm93cyB3aGVuIHdlIHF1ZXJ5IGNzc1RleHRcbiAgICAgICAgICAvLyB3aGVuIGl0IGNvbnRhaW5zIGEgLXdlYmtpdC0gcHJvcGVydHkuXG4gICAgICAgICAgLy8gaWYgdGhpcyBoYXBwZW5zLCB3ZSBmYWxsYmFjayB0byBjb25zdHJ1Y3RpbmcgdGhlIHJ1bGVcbiAgICAgICAgICAvLyBmcm9tIHRoZSBDU1NSdWxlU2V0XG4gICAgICAgICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2tkZXRhaWwvdmlldy85NTU3MDMvYWNjZXNzaW5nLWNzc3RleHQtb2YtYS1rZXlmcmFtZS1ydWxlLXRoYXQtY29udGFpbnMtYS13ZWJraXQtcHJvcGVydHktdmlhLWNzc29tLWdlbmVyYXRlcy1leGNlcHRpb25cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJ1bGUuY3NzVGV4dCkge1xuICAgICAgICAgICAgICBjc3NUZXh0ICs9IHJ1bGUuY3NzVGV4dCArICdcXG5cXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2goeCkge1xuICAgICAgICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gQ1NTUnVsZS5LRVlGUkFNRVNfUlVMRSAmJiBydWxlLmNzc1J1bGVzKSB7XG4gICAgICAgICAgICAgIGNzc1RleHQgKz0gdGhpcy5pZVNhZmVDc3NUZXh0RnJvbUtleUZyYW1lUnVsZShydWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dDtcbiAgfSxcbiAgLyoqIEB0aGlzIHtTaGFkb3dDU1N9ICovXG4gIGllU2FmZUNzc1RleHRGcm9tS2V5RnJhbWVSdWxlOiBmdW5jdGlvbihydWxlKSB7XG4gICAgdmFyIGNzc1RleHQgPSAnQGtleWZyYW1lcyAnICsgcnVsZS5uYW1lICsgJyB7JztcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHJ1bGUuY3NzUnVsZXMsIGZ1bmN0aW9uKHJ1bGUpIHtcbiAgICAgIGNzc1RleHQgKz0gJyAnICsgcnVsZS5rZXlUZXh0ICsgJyB7JyArIHJ1bGUuc3R5bGUuY3NzVGV4dCArICd9JztcbiAgICB9KTtcbiAgICBjc3NUZXh0ICs9ICcgfSc7XG4gICAgcmV0dXJuIGNzc1RleHQ7XG4gIH0sXG4gIC8qKiBAdGhpcyB7U2hhZG93Q1NTfSAqL1xuICBzY29wZVNlbGVjdG9yOiBmdW5jdGlvbihzZWxlY3Rvciwgc2NvcGVTZWxlY3Rvciwgc3RyaWN0LCBvcHRfdHJhbnNmb3JtZXIpIHtcbiAgICB2YXIgciA9IFtdLCBwYXJ0cyA9IHNlbGVjdG9yLnNwbGl0KCcsJyk7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICBwID0gcC50cmltKCk7XG4gICAgICBpZiAob3B0X3RyYW5zZm9ybWVyKSB7XG4gICAgICAgIHAgPSBvcHRfdHJhbnNmb3JtZXIocCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZWxlY3Rvck5lZWRzU2NvcGluZyhwLCBzY29wZVNlbGVjdG9yKSkge1xuICAgICAgICBwID0gKHN0cmljdCAmJiAhcC5tYXRjaChwb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpKSA/XG4gICAgICAgICAgICB0aGlzLmFwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShwLCBzY29wZVNlbGVjdG9yKSA6XG4gICAgICAgICAgICB0aGlzLmFwcGx5U2VsZWN0b3JTY29wZShwLCBzY29wZVNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICAgIHIucHVzaChwKTtcbiAgICB9LCB0aGlzKTtcbiAgICByZXR1cm4gci5qb2luKCcsICcpO1xuICB9LFxuICAvKiogQHRoaXMge1NoYWRvd0NTU30gKi9cbiAgc2VsZWN0b3JOZWVkc1Njb3Bpbmc6IGZ1bmN0aW9uKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2NvcGVTZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgcmUgPSB0aGlzLm1ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcik7XG4gICAgcmV0dXJuICFzZWxlY3Rvci5tYXRjaChyZSk7XG4gIH0sXG4gIC8qKiBAdGhpcyB7U2hhZG93Q1NTfSAqL1xuICBtYWtlU2NvcGVNYXRjaGVyOiBmdW5jdGlvbihzY29wZVNlbGVjdG9yKSB7XG4gICAgc2NvcGVTZWxlY3RvciA9IHNjb3BlU2VsZWN0b3IucmVwbGFjZSgvXFxbL2csICdcXFxcWycpLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKTtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXignICsgc2NvcGVTZWxlY3RvciArICcpJyArIHNlbGVjdG9yUmVTdWZmaXgsICdtJyk7XG4gIH0sXG4gIC8qKiBAdGhpcyB7U2hhZG93Q1NTfSAqL1xuICBhcHBseVNlbGVjdG9yU2NvcGU6IGZ1bmN0aW9uKHNlbGVjdG9yLCBzZWxlY3RvclNjb3BlKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2VsZWN0b3JTY29wZSkgP1xuICAgICAgICB0aGlzLmFwcGx5U2VsZWN0b3JTY29wZUxpc3Qoc2VsZWN0b3IsIHNlbGVjdG9yU2NvcGUpIDpcbiAgICAgICAgdGhpcy5hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3IsIHNlbGVjdG9yU2NvcGUpO1xuICB9LFxuICAvLyBhcHBseSBhbiBhcnJheSBvZiBzZWxlY3RvcnNcbiAgLyoqIEB0aGlzIHtTaGFkb3dDU1N9ICovXG4gIGFwcGx5U2VsZWN0b3JTY29wZUxpc3Q6IGZ1bmN0aW9uKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yTGlzdCkge1xuICAgIHZhciByID0gW107XG4gICAgZm9yICh2YXIgaT0wLCBzOyAocz1zY29wZVNlbGVjdG9yTGlzdFtpXSk7IGkrKykge1xuICAgICAgci5wdXNoKHRoaXMuYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yLCBzKSk7XG4gICAgfVxuICAgIHJldHVybiByLmpvaW4oJywgJyk7XG4gIH0sXG4gIC8vIHNjb3BlIHZpYSBuYW1lIGFuZCBbaXM9bmFtZV1cbiAgLyoqIEB0aGlzIHtTaGFkb3dDU1N9ICovXG4gIGFwcGx5U2ltcGxlU2VsZWN0b3JTY29wZTogZnVuY3Rpb24oc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IpIHtcbiAgICBpZiAoc2VsZWN0b3IubWF0Y2gocG9seWZpbGxIb3N0UmUpKSB7XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UocG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yLCBzY29wZVNlbGVjdG9yKTtcbiAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKHBvbHlmaWxsSG9zdFJlLCBzY29wZVNlbGVjdG9yICsgJyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNjb3BlU2VsZWN0b3IgKyAnICcgKyBzZWxlY3RvcjtcbiAgICB9XG4gIH0sXG4gIC8vIHJldHVybiBhIHNlbGVjdG9yIHdpdGggW25hbWVdIHN1ZmZpeCBvbiBlYWNoIHNpbXBsZSBzZWxlY3RvclxuICAvLyBlLmcuIC5mb28uYmFyID4gLnpvdCBiZWNvbWVzIC5mb29bbmFtZV0uYmFyW25hbWVdID4gLnpvdFtuYW1lXVxuICAvKiogQHRoaXMge1NoYWRvd0NTU30gKi9cbiAgYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlOiBmdW5jdGlvbihzZWxlY3Rvciwgc2NvcGVTZWxlY3Rvcikge1xuICAgIHNjb3BlU2VsZWN0b3IgPSBzY29wZVNlbGVjdG9yLnJlcGxhY2UoL1xcW2lzPShbXlxcXV0qKVxcXS9nLCAnJDEnKTtcbiAgICB2YXIgc3BsaXRzID0gWycgJywgJz4nLCAnKycsICd+J10sXG4gICAgICBzY29wZWQgPSBzZWxlY3RvcixcbiAgICAgIGF0dHJOYW1lID0gJ1snICsgc2NvcGVTZWxlY3RvciArICddJztcbiAgICBzcGxpdHMuZm9yRWFjaChmdW5jdGlvbihzZXApIHtcbiAgICAgIHZhciBwYXJ0cyA9IHNjb3BlZC5zcGxpdChzZXApO1xuICAgICAgc2NvcGVkID0gcGFydHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgLy8gcmVtb3ZlIDpob3N0IHNpbmNlIGl0IHNob3VsZCBiZSB1bm5lY2Vzc2FyeVxuICAgICAgICB2YXIgdCA9IHAudHJpbSgpLnJlcGxhY2UocG9seWZpbGxIb3N0UmUsICcnKTtcbiAgICAgICAgaWYgKHQgJiYgKHNwbGl0cy5pbmRleE9mKHQpIDwgMCkgJiYgKHQuaW5kZXhPZihhdHRyTmFtZSkgPCAwKSkge1xuICAgICAgICAgIHAgPSB0LnJlcGxhY2UoLyhbXjpdKikoOiopKC4qKS8sICckMScgKyBhdHRyTmFtZSArICckMiQzJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9KS5qb2luKHNlcCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNjb3BlZDtcbiAgfSxcbiAgLyoqIEB0aGlzIHtTaGFkb3dDU1N9ICovXG4gIHByb3BlcnRpZXNGcm9tUnVsZTogZnVuY3Rpb24ocnVsZSkge1xuICAgIHZhciBjc3NUZXh0ID0gcnVsZS5zdHlsZS5jc3NUZXh0O1xuICAgIC8vIFRPRE8oc29ydmVsbCk6IFNhZmFyaSBjc3NvbSBpbmNvcnJlY3RseSByZW1vdmVzIHF1b3RlcyBmcm9tIHRoZSBjb250ZW50XG4gICAgLy8gcHJvcGVydHkuIChodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTE4MDQ1KVxuICAgIC8vIGRvbid0IHJlcGxhY2UgYXR0ciBydWxlc1xuICAgIGlmIChydWxlLnN0eWxlLmNvbnRlbnQgJiYgIXJ1bGUuc3R5bGUuY29udGVudC5tYXRjaCgvWydcIl0rfGF0dHIvKSkge1xuICAgICAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZSgvY29udGVudDpbXjtdKjsvZywgJ2NvbnRlbnQ6IFxcJycgK1xuICAgICAgICAgIHJ1bGUuc3R5bGUuY29udGVudCArICdcXCc7Jyk7XG4gICAgfVxuICAgIC8vIFRPRE8oc29ydmVsbCk6IHdlIGNhbiB3b3JrYXJvdW5kIHRoaXMgaXNzdWUgaGVyZSwgYnV0IHdlIG5lZWQgYSBsaXN0XG4gICAgLy8gb2YgdHJvdWJsZXNvbWUgcHJvcGVydGllcyB0byBmaXggaHR0cHM6Ly9naXRodWIuY29tL1BvbHltZXIvcGxhdGZvcm0vaXNzdWVzLzUzXG4gICAgLy9cbiAgICAvLyBpbmhlcml0IHJ1bGVzIGNhbiBiZSBvbWl0dGVkIGZyb20gY3NzVGV4dFxuICAgIC8vIFRPRE8oc29ydmVsbCk6IHJlbW92ZSB3aGVuIEJsaW5rIGJ1ZyBpcyBmaXhlZDpcbiAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MzU4MjczXG4gICAgdmFyIHN0eWxlID0gcnVsZS5zdHlsZTtcbiAgICBmb3IgKHZhciBpIGluIHN0eWxlKSB7XG4gICAgICBpZiAoc3R5bGVbaV0gPT09ICdpbml0aWFsJykge1xuICAgICAgICBjc3NUZXh0ICs9IGkgKyAnOiBpbml0aWFsOyAnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dDtcbiAgfVxufTtcblxudmFyIHNlbGVjdG9yUmUgPSAvKFtee10qKSh7W1xcc1xcU10qP30pL2dpbSxcbiAgICBjc3NDb21tZW50UmUgPSAvXFwvXFwqW14qXSpcXCorKFteLypdW14qXSpcXCorKSpcXC8vZ2ltLFxuICAgIC8vIFRPRE8oc29ydmVsbCk6IHJlbW92ZSBlaXRoZXIgY29udGVudCBvciBjb21tZW50XG4gICAgY3NzQ29tbWVudE5leHRTZWxlY3RvclJlID0gL1xcL1xcKlxccypAcG9seWZpbGwgKFteKl0qXFwqKyhbXi8qXVteKl0qXFwqKykqXFwvKShbXntdKj8pey9naW0sXG4gICAgY3NzQ29udGVudE5leHRTZWxlY3RvclJlID0gL3BvbHlmaWxsLW5leHQtc2VsZWN0b3JbXn1dKmNvbnRlbnRcXDpbXFxzXSo/WydcIl0oLio/KVsnXCJdWztcXHNdKn0oW157XSo/KXsvZ2ltLFxuICAgIC8vIFRPRE8oc29ydmVsbCk6IHJlbW92ZSBlaXRoZXIgY29udGVudCBvciBjb21tZW50XG4gICAgY3NzQ29tbWVudFJ1bGVSZSA9IC9cXC9cXCpcXHNAcG9seWZpbGwtcnVsZShbXipdKlxcKisoW14vKl1bXipdKlxcKispKilcXC8vZ2ltLFxuICAgIGNzc0NvbnRlbnRSdWxlUmUgPSAvKHBvbHlmaWxsLXJ1bGUpW159XSooY29udGVudFxcOltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbSxcbiAgICAvLyBUT0RPKHNvcnZlbGwpOiByZW1vdmUgZWl0aGVyIGNvbnRlbnQgb3IgY29tbWVudFxuICAgIGNzc0NvbW1lbnRVbnNjb3BlZFJ1bGVSZSA9IC9cXC9cXCpcXHNAcG9seWZpbGwtdW5zY29wZWQtcnVsZShbXipdKlxcKisoW14vKl1bXipdKlxcKispKilcXC8vZ2ltLFxuICAgIGNzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZSA9IC8ocG9seWZpbGwtdW5zY29wZWQtcnVsZSlbXn1dKihjb250ZW50XFw6W1xcc10qWydcIl0oLio/KVsnXCJdKVs7XFxzXSpbXn1dKn0vZ2ltLFxuICAgIGNzc1BzZXVkb1JlID0gLzo6KHgtW15cXHN7LChdKikvZ2ltLFxuICAgIGNzc1BhcnRSZSA9IC86OnBhcnRcXCgoW14pXSopXFwpL2dpbSxcbiAgICAvLyBub3RlOiA6aG9zdCBwcmUtcHJvY2Vzc2VkIHRvIC1zaGFkb3djc3Nob3N0LlxuICAgIHBvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCcsXG4gICAgLy8gbm90ZTogOmhvc3QtY29udGV4dCBwcmUtcHJvY2Vzc2VkIHRvIC1zaGFkb3djc3Nob3N0Y29udGV4dC5cbiAgICBwb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JyxcbiAgICBwYXJlblN1ZmZpeCA9ICcpKD86XFxcXCgoJyArXG4gICAgICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICAgICAnKVxcXFwpKT8oW14se10qKSc7XG4gICAgdmFyIGNzc0NvbG9uSG9zdFJlID0gbmV3IFJlZ0V4cCgnKCcgKyBwb2x5ZmlsbEhvc3QgKyBwYXJlblN1ZmZpeCwgJ2dpbScpLFxuICAgIGNzc0NvbG9uSG9zdENvbnRleHRSZSA9IG5ldyBSZWdFeHAoJygnICsgcG9seWZpbGxIb3N0Q29udGV4dCArIHBhcmVuU3VmZml4LCAnZ2ltJyksXG4gICAgc2VsZWN0b3JSZVN1ZmZpeCA9ICcoWz5cXFxcc34rXFxbLix7Ol1bXFxcXHNcXFxcU10qKT8kJyxcbiAgICBjb2xvbkhvc3RSZSA9IC9cXDpob3N0L2dpbSxcbiAgICBjb2xvbkhvc3RDb250ZXh0UmUgPSAvXFw6aG9zdC1jb250ZXh0L2dpbSxcbiAgICAvKiBob3N0IG5hbWUgd2l0aG91dCBjb21iaW5hdG9yICovXG4gICAgcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yID0gcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJyxcbiAgICBwb2x5ZmlsbEhvc3RSZSA9IG5ldyBSZWdFeHAocG9seWZpbGxIb3N0LCAnZ2ltJyksXG4gICAgcG9seWZpbGxIb3N0Q29udGV4dFJlID0gbmV3IFJlZ0V4cChwb2x5ZmlsbEhvc3RDb250ZXh0LCAnZ2ltJyksXG4gICAgc2hhZG93RE9NU2VsZWN0b3JzUmUgPSBbXG4gICAgICAvPj4+L2csXG4gICAgICAvOjpzaGFkb3cvZyxcbiAgICAgIC86OmNvbnRlbnQvZyxcbiAgICAgIC8vIERlcHJlY2F0ZWQgc2VsZWN0b3JzXG4gICAgICAvXFwvZGVlcFxcLy9nLCAvLyBmb3JtZXIgPj4+XG4gICAgICAvXFwvc2hhZG93XFwvL2csIC8vIGZvcm1lciA6OnNoYWRvd1xuICAgICAgL1xcL3NoYWRvdy1kZWVwXFwvL2csIC8vIGZvcm1lciAvZGVlcC9cbiAgICAgIC9cXF5cXF4vZywgICAgIC8vIGZvcm1lciAvc2hhZG93L1xuICAgICAgL1xcXig/IT0pL2cgICAvLyBmb3JtZXIgL3NoYWRvdy1kZWVwL1xuICAgIF07XG4iXX0=
// /Users/mszylkowski/src/amphtml/third_party/webcomponentsjs/ShadowCSS.js