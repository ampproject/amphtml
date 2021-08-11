/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/
function mustacheFactory(mustache) {
  var objectToString = Object.prototype.toString;

  var isArray = Array.isArray || function isArrayPolyfill(object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr(obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty(obj, propName) {
    return obj != null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, propName);
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;

  function testRegExp(re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;

  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template) return [];
    var sections = [];
    // Stack to hold section tokens
    var tokens = [];
    // Buffer to hold the tokens
    var spaces = [];
    // Indices of whitespace tokens on the current line
    var hasTag = false;
    // Is there a {{tag}} on the current line?
    var nonSpace = false;

    // Is there a non-space char on the current line?
    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;

    function compileTags(tagsToCompile) {
      if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2);
      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) throw new Error('Invalid tags: ' + tagsToCompile);
      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);
    var scanner = new Scanner(template);
    var start, type, value, chr, token, openSection;

    while (!scanner.eos()) {
      start = scanner.pos;
      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;
          // Check for whitespace on the current line.
          if (chr === '\n') stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe)) break;
      hasTag = true;
      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos);
      token = [type, value, start, scanner.pos];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();
        if (!openSection) throw new Error('Unopened section "' + value + '" at ' + start);
        if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];
    var token, lastToken;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];
    var token, section;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;

        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;

        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos() {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan(re) {
    var match = this.tail.match(re);
    if (!match || match.index !== 0) return '';
    var string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil(re) {
    var index = this.tail.search(re),
        match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;

      case 0:
        match = '';
        break;

      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;
    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view;
    this.cache = {
      '.': this.view
    };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push(view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup(name) {
    var cache = this.cache;
    var value;

    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this,
          names,
          index,
          lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (!hasProperty(value, names[index])) {
              value = null;
              break;
            }

            if (index === names.length - 1) lookupHit = true;
            value = value[names[index++]];
          }
        } else {
          if (!hasProperty(context.view, name)) {
            value = null;
          } else {
            value = context.view[name];
            lookupHit = true;
          }
        }

        if (lookupHit) break;
        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value)) value = value.call(this.view);
    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache() {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse(template, tags) {
    var cache = this.cache;
    var tokens = cache[template];
    if (tokens == null) tokens = cache[template] = parseTemplate(template, tags);
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render(template, view, partials) {
    var tokens = this.parse(template);
    var context = view instanceof Context ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
    var buffer = '';
    var token, symbol, value;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];
      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);else if (symbol === '&') value = this.unescapedValue(token, context);else if (symbol === 'name') value = this.escapedValue(token, context);else if (symbol === 'text') value = this.rawValue(token);
      if (value !== undefined) buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender(template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template');
      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
      if (value != null) buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }

    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);
    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || isArray(value) && value.length === 0) return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
    if (!partials) return;
    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue(token, context) {
    var value = context.lookup(token[1]);

    if (value != null) {
      if (mustache.sanitizeUnescaped) {
        return mustache.sanitizeUnescaped(value);
      }

      return value;
    }
  };

  Writer.prototype.escapedValue = function escapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null) return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue(token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.2.0';
  mustache.tags = ['{{', '}}'];
  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache() {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse(template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render(template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.,

  /*eslint-disable */
  // eslint wants camel cased function name
  mustache.to_html = function to_html(template, view, partials, send) {
    /*eslint-enable*/
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;
  // Export the sanitizing function for unescaped values.
  mustache.sanitizeUnescaped = null;

  mustache.setUnescapedSanitizer = function setUnescapedSanitizer(sanitizeUnescaped) {
    mustache.sanitizeUnescaped = sanitizeUnescaped;
  };

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;
}

;
var Mustache = {};
mustacheFactory(Mustache);
export default Mustache;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm11c3RhY2hlLmpzIl0sIm5hbWVzIjpbIm11c3RhY2hlRmFjdG9yeSIsIm11c3RhY2hlIiwib2JqZWN0VG9TdHJpbmciLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImlzQXJyYXkiLCJBcnJheSIsImlzQXJyYXlQb2x5ZmlsbCIsIm9iamVjdCIsImNhbGwiLCJpc0Z1bmN0aW9uIiwidHlwZVN0ciIsIm9iaiIsImVzY2FwZVJlZ0V4cCIsInN0cmluZyIsInJlcGxhY2UiLCJoYXNQcm9wZXJ0eSIsInByb3BOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJyZWdFeHBUZXN0IiwiUmVnRXhwIiwidGVzdCIsInRlc3RSZWdFeHAiLCJyZSIsIm5vblNwYWNlUmUiLCJpc1doaXRlc3BhY2UiLCJlbnRpdHlNYXAiLCJlc2NhcGVIdG1sIiwiU3RyaW5nIiwiZnJvbUVudGl0eU1hcCIsInMiLCJ3aGl0ZVJlIiwic3BhY2VSZSIsImVxdWFsc1JlIiwiY3VybHlSZSIsInRhZ1JlIiwicGFyc2VUZW1wbGF0ZSIsInRlbXBsYXRlIiwidGFncyIsInNlY3Rpb25zIiwidG9rZW5zIiwic3BhY2VzIiwiaGFzVGFnIiwibm9uU3BhY2UiLCJzdHJpcFNwYWNlIiwibGVuZ3RoIiwicG9wIiwib3BlbmluZ1RhZ1JlIiwiY2xvc2luZ1RhZ1JlIiwiY2xvc2luZ0N1cmx5UmUiLCJjb21waWxlVGFncyIsInRhZ3NUb0NvbXBpbGUiLCJzcGxpdCIsIkVycm9yIiwic2Nhbm5lciIsIlNjYW5uZXIiLCJzdGFydCIsInR5cGUiLCJ2YWx1ZSIsImNociIsInRva2VuIiwib3BlblNlY3Rpb24iLCJlb3MiLCJwb3MiLCJzY2FuVW50aWwiLCJpIiwidmFsdWVMZW5ndGgiLCJjaGFyQXQiLCJwdXNoIiwic2NhbiIsIm5lc3RUb2tlbnMiLCJzcXVhc2hUb2tlbnMiLCJzcXVhc2hlZFRva2VucyIsImxhc3RUb2tlbiIsIm51bVRva2VucyIsIm5lc3RlZFRva2VucyIsImNvbGxlY3RvciIsInNlY3Rpb24iLCJ0YWlsIiwibWF0Y2giLCJpbmRleCIsInN1YnN0cmluZyIsInNlYXJjaCIsIkNvbnRleHQiLCJ2aWV3IiwicGFyZW50Q29udGV4dCIsImNhY2hlIiwicGFyZW50IiwibG9va3VwIiwibmFtZSIsImNvbnRleHQiLCJuYW1lcyIsImxvb2t1cEhpdCIsImluZGV4T2YiLCJXcml0ZXIiLCJjbGVhckNhY2hlIiwicGFyc2UiLCJyZW5kZXIiLCJwYXJ0aWFscyIsInJlbmRlclRva2VucyIsIm9yaWdpbmFsVGVtcGxhdGUiLCJidWZmZXIiLCJzeW1ib2wiLCJ1bmRlZmluZWQiLCJyZW5kZXJTZWN0aW9uIiwicmVuZGVySW52ZXJ0ZWQiLCJyZW5kZXJQYXJ0aWFsIiwidW5lc2NhcGVkVmFsdWUiLCJlc2NhcGVkVmFsdWUiLCJyYXdWYWx1ZSIsInNlbGYiLCJzdWJSZW5kZXIiLCJqIiwic2xpY2UiLCJzYW5pdGl6ZVVuZXNjYXBlZCIsImVzY2FwZSIsInZlcnNpb24iLCJkZWZhdWx0V3JpdGVyIiwiVHlwZUVycm9yIiwidG9faHRtbCIsInNlbmQiLCJyZXN1bHQiLCJzZXRVbmVzY2FwZWRTYW5pdGl6ZXIiLCJNdXN0YWNoZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFFQSxTQUFTQSxlQUFULENBQTBCQyxRQUExQixFQUFvQztBQUVsQyxNQUFJQyxjQUFjLEdBQUdDLE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkMsUUFBdEM7O0FBQ0EsTUFBSUMsT0FBTyxHQUFHQyxLQUFLLENBQUNELE9BQU4sSUFBaUIsU0FBU0UsZUFBVCxDQUEwQkMsTUFBMUIsRUFBa0M7QUFDL0QsV0FBT1AsY0FBYyxDQUFDUSxJQUFmLENBQW9CRCxNQUFwQixNQUFnQyxnQkFBdkM7QUFDRCxHQUZEOztBQUlBLFdBQVNFLFVBQVQsQ0FBcUJGLE1BQXJCLEVBQTZCO0FBQzNCLFdBQU8sT0FBT0EsTUFBUCxLQUFrQixVQUF6QjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsV0FBU0csT0FBVCxD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RDs7QUFVQTs7QUFDQTtBQUFvQjtBQUNwQmxHLEVBQUFBLFFBQVEsQ0FBQ3VILE9BQVQsR0FBbUIsU0FBU0EsT0FBVCxDQUFrQmxGLFFBQWxCLEVBQTRCK0MsSUFBNUIsRUFBa0NjLFFBQWxDLEVBQTRDc0IsSUFBNUMsRUFBa0Q7QUFDbkU7QUFFQSxRQUFJQyxNQUFNLEdBQUd6SCxRQUFRLENBQUNpRyxNQUFULENBQWdCNUQsUUFBaEIsRUFBMEIrQyxJQUExQixFQUFnQ2MsUUFBaEMsQ0FBYjs7QUFFQSxRQUFJeEYsVUFBVSxDQUFDOEcsSUFBRCxDQUFkLEVBQXNCO0FBQ3BCQSxNQUFBQSxJQUFJLENBQUNDLE1BQUQsQ0FBSjtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU9BLE1BQVA7QUFDRDtBQUNGLEdBVkQ7O0FBWUE7QUFDQTtBQUNBekgsRUFBQUEsUUFBUSxDQUFDbUgsTUFBVCxHQUFrQnhGLFVBQWxCO0FBRUE7QUFDQTNCLEVBQUFBLFFBQVEsQ0FBQ2tILGlCQUFULEdBQTZCLElBQTdCOztBQUNBbEgsRUFBQUEsUUFBUSxDQUFDMEgscUJBQVQsR0FBaUMsU0FBU0EscUJBQVQsQ0FBK0JSLGlCQUEvQixFQUFrRDtBQUNqRmxILElBQUFBLFFBQVEsQ0FBQ2tILGlCQUFULEdBQTZCQSxpQkFBN0I7QUFDRCxHQUZEOztBQUlBO0FBQ0FsSCxFQUFBQSxRQUFRLENBQUN1RCxPQUFULEdBQW1CQSxPQUFuQjtBQUNBdkQsRUFBQUEsUUFBUSxDQUFDbUYsT0FBVCxHQUFtQkEsT0FBbkI7QUFDQW5GLEVBQUFBLFFBQVEsQ0FBQzhGLE1BQVQsR0FBa0JBLE1BQWxCO0FBRUQ7O0FBQUE7QUFFRCxJQUFNNkIsUUFBUSxHQUFHLEVBQWpCO0FBQ0E1SCxlQUFlLENBQUM0SCxRQUFELENBQWY7QUFDQSxlQUFlQSxRQUFmIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBtdXN0YWNoZS5qcyAtIExvZ2ljLWxlc3Mge3ttdXN0YWNoZX19IHRlbXBsYXRlcyB3aXRoIEphdmFTY3JpcHRcbiAqIGh0dHA6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanNcbiAqL1xuXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlIE11c3RhY2hlOiB0cnVlKi9cblxuZnVuY3Rpb24gbXVzdGFjaGVGYWN0b3J5IChtdXN0YWNoZSkge1xuXG4gIHZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5UG9seWZpbGwgKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3RUb1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNGdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICAvKipcbiAgICogTW9yZSBjb3JyZWN0IHR5cGVvZiBzdHJpbmcgaGFuZGxpbmcgYXJyYXlcbiAgICogd2hpY2ggbm9ybWFsbHkgcmV0dXJucyB0eXBlb2YgJ29iamVjdCdcbiAgICovXG4gIGZ1bmN0aW9uIHR5cGVTdHIgKG9iaikge1xuICAgIHJldHVybiBpc0FycmF5KG9iaikgPyAnYXJyYXknIDogdHlwZW9mIG9iajtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cCAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZywgJ1xcXFwkJicpO1xuICB9XG5cbiAgLyoqXG4gICAqIE51bGwgc2FmZSB3YXkgb2YgY2hlY2tpbmcgd2hldGhlciBvciBub3QgYW4gb2JqZWN0LFxuICAgKiBpbmNsdWRpbmcgaXRzIHByb3RvdHlwZSwgaGFzIGEgZ2l2ZW4gcHJvcGVydHlcbiAgICovXG4gIGZ1bmN0aW9uIGhhc1Byb3BlcnR5IChvYmosIHByb3BOYW1lKSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmXG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3BOYW1lKTtcbiAgfVxuXG4gIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vaXNzdWVzLmFwYWNoZS5vcmcvamlyYS9icm93c2UvQ09VQ0hEQi01NzdcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODlcbiAgdmFyIHJlZ0V4cFRlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XG4gIGZ1bmN0aW9uIHRlc3RSZWdFeHAgKHJlLCBzdHJpbmcpIHtcbiAgICByZXR1cm4gcmVnRXhwVGVzdC5jYWxsKHJlLCBzdHJpbmcpO1xuICB9XG5cbiAgdmFyIG5vblNwYWNlUmUgPSAvXFxTLztcbiAgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlIChzdHJpbmcpIHtcbiAgICByZXR1cm4gIXRlc3RSZWdFeHAobm9uU3BhY2VSZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgICcvJzogJyYjeDJGOycsXG4gICAgJ2AnOiAnJiN4NjA7JyxcbiAgICAnPSc6ICcmI3gzRDsnXG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlSHRtbCAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHJpbmcpLnJlcGxhY2UoL1smPD5cIidgPVxcL10vZywgZnVuY3Rpb24gZnJvbUVudGl0eU1hcCAocykge1xuICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciB3aGl0ZVJlID0gL1xccyovO1xuICB2YXIgc3BhY2VSZSA9IC9cXHMrLztcbiAgdmFyIGVxdWFsc1JlID0gL1xccyo9LztcbiAgdmFyIGN1cmx5UmUgPSAvXFxzKlxcfS87XG4gIHZhciB0YWdSZSA9IC8jfFxcXnxcXC98PnxcXHt8Jnw9fCEvO1xuXG4gIC8qKlxuICAgKiBCcmVha3MgdXAgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgc3RyaW5nIGludG8gYSB0cmVlIG9mIHRva2Vucy4gSWYgdGhlIGB0YWdzYFxuICAgKiBhcmd1bWVudCBpcyBnaXZlbiBoZXJlIGl0IG11c3QgYmUgYW4gYXJyYXkgd2l0aCB0d28gc3RyaW5nIHZhbHVlczogdGhlXG4gICAqIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLiBbIFwiPCVcIiwgXCIlPlwiIF0pLiBPZlxuICAgKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gbXVzdGFjaGUudGFncykuXG4gICAqXG4gICAqIEEgdG9rZW4gaXMgYW4gYXJyYXkgd2l0aCBhdCBsZWFzdCA0IGVsZW1lbnRzLiBUaGUgZmlyc3QgZWxlbWVudCBpcyB0aGVcbiAgICogbXVzdGFjaGUgc3ltYm9sIHRoYXQgd2FzIHVzZWQgaW5zaWRlIHRoZSB0YWcsIGUuZy4gXCIjXCIgb3IgXCImXCIuIElmIHRoZSB0YWdcbiAgICogZGlkIG5vdCBjb250YWluIGEgc3ltYm9sIChpLmUuIHt7bXlWYWx1ZX19KSB0aGlzIGVsZW1lbnQgaXMgXCJuYW1lXCIuIEZvclxuICAgKiBhbGwgdGV4dCB0aGF0IGFwcGVhcnMgb3V0c2lkZSBhIHN5bWJvbCB0aGlzIGVsZW1lbnQgaXMgXCJ0ZXh0XCIuXG4gICAqXG4gICAqIFRoZSBzZWNvbmQgZWxlbWVudCBvZiBhIHRva2VuIGlzIGl0cyBcInZhbHVlXCIuIEZvciBtdXN0YWNoZSB0YWdzIHRoaXMgaXNcbiAgICogd2hhdGV2ZXIgZWxzZSB3YXMgaW5zaWRlIHRoZSB0YWcgYmVzaWRlcyB0aGUgb3BlbmluZyBzeW1ib2wuIEZvciB0ZXh0IHRva2Vuc1xuICAgKiB0aGlzIGlzIHRoZSB0ZXh0IGl0c2VsZi5cbiAgICpcbiAgICogVGhlIHRoaXJkIGFuZCBmb3VydGggZWxlbWVudHMgb2YgdGhlIHRva2VuIGFyZSB0aGUgc3RhcnQgYW5kIGVuZCBpbmRpY2VzLFxuICAgKiByZXNwZWN0aXZlbHksIG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXG4gICAqXG4gICAqIFRva2VucyB0aGF0IGFyZSB0aGUgcm9vdCBub2RlIG9mIGEgc3VidHJlZSBjb250YWluIHR3byBtb3JlIGVsZW1lbnRzOiAxKSBhblxuICAgKiBhcnJheSBvZiB0b2tlbnMgaW4gdGhlIHN1YnRyZWUgYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgYXRcbiAgICogd2hpY2ggdGhlIGNsb3NpbmcgdGFnIGZvciB0aGF0IHNlY3Rpb24gYmVnaW5zLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICBpZiAoIXRlbXBsYXRlKVxuICAgICAgcmV0dXJuIFtdO1xuXG4gICAgdmFyIHNlY3Rpb25zID0gW107ICAgICAvLyBTdGFjayB0byBob2xkIHNlY3Rpb24gdG9rZW5zXG4gICAgdmFyIHRva2VucyA9IFtdOyAgICAgICAvLyBCdWZmZXIgdG8gaG9sZCB0aGUgdG9rZW5zXG4gICAgdmFyIHNwYWNlcyA9IFtdOyAgICAgICAvLyBJbmRpY2VzIG9mIHdoaXRlc3BhY2UgdG9rZW5zIG9uIHRoZSBjdXJyZW50IGxpbmVcbiAgICB2YXIgaGFzVGFnID0gZmFsc2U7ICAgIC8vIElzIHRoZXJlIGEge3t0YWd9fSBvbiB0aGUgY3VycmVudCBsaW5lP1xuICAgIHZhciBub25TcGFjZSA9IGZhbHNlOyAgLy8gSXMgdGhlcmUgYSBub24tc3BhY2UgY2hhciBvbiB0aGUgY3VycmVudCBsaW5lP1xuXG4gICAgLy8gU3RyaXBzIGFsbCB3aGl0ZXNwYWNlIHRva2VucyBhcnJheSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgIC8vIGlmIHRoZXJlIHdhcyBhIHt7I3RhZ319IG9uIGl0IGFuZCBvdGhlcndpc2Ugb25seSBzcGFjZS5cbiAgICBmdW5jdGlvbiBzdHJpcFNwYWNlICgpIHtcbiAgICAgIGlmIChoYXNUYWcgJiYgIW5vblNwYWNlKSB7XG4gICAgICAgIHdoaWxlIChzcGFjZXMubGVuZ3RoKVxuICAgICAgICAgIGRlbGV0ZSB0b2tlbnNbc3BhY2VzLnBvcCgpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBoYXNUYWcgPSBmYWxzZTtcbiAgICAgIG5vblNwYWNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG9wZW5pbmdUYWdSZSwgY2xvc2luZ1RhZ1JlLCBjbG9zaW5nQ3VybHlSZTtcbiAgICBmdW5jdGlvbiBjb21waWxlVGFncyAodGFnc1RvQ29tcGlsZSkge1xuICAgICAgaWYgKHR5cGVvZiB0YWdzVG9Db21waWxlID09PSAnc3RyaW5nJylcbiAgICAgICAgdGFnc1RvQ29tcGlsZSA9IHRhZ3NUb0NvbXBpbGUuc3BsaXQoc3BhY2VSZSwgMik7XG5cbiAgICAgIGlmICghaXNBcnJheSh0YWdzVG9Db21waWxlKSB8fCB0YWdzVG9Db21waWxlLmxlbmd0aCAhPT0gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZ3M6ICcgKyB0YWdzVG9Db21waWxlKTtcblxuICAgICAgb3BlbmluZ1RhZ1JlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAodGFnc1RvQ29tcGlsZVswXSkgKyAnXFxcXHMqJyk7XG4gICAgICBjbG9zaW5nVGFnUmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKHRhZ3NUb0NvbXBpbGVbMV0pKTtcbiAgICAgIGNsb3NpbmdDdXJseVJlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCgnfScgKyB0YWdzVG9Db21waWxlWzFdKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZVRhZ3ModGFncyB8fCBtdXN0YWNoZS50YWdzKTtcblxuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgdmFyIHN0YXJ0LCB0eXBlLCB2YWx1ZSwgY2hyLCB0b2tlbiwgb3BlblNlY3Rpb247XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvcygpKSB7XG4gICAgICBzdGFydCA9IHNjYW5uZXIucG9zO1xuXG4gICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKG9wZW5pbmdUYWdSZSk7XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCB2YWx1ZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2hyID0gdmFsdWUuY2hhckF0KGkpO1xuXG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjaHIpKSB7XG4gICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRva2Vucy5wdXNoKFsgJ3RleHQnLCBjaHIsIHN0YXJ0LCBzdGFydCArIDEgXSk7XG4gICAgICAgICAgc3RhcnQgKz0gMTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aGl0ZXNwYWNlIG9uIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgICAgICAgaWYgKGNociA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdHJpcFNwYWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIG9wZW5pbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4ob3BlbmluZ1RhZ1JlKSlcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGhhc1RhZyA9IHRydWU7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHR5cGUuXG4gICAgICB0eXBlID0gc2Nhbm5lci5zY2FuKHRhZ1JlKSB8fCAnbmFtZSc7XG4gICAgICBzY2FubmVyLnNjYW4od2hpdGVSZSk7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHZhbHVlLlxuICAgICAgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ0N1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oY3VybHlSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICAgIHR5cGUgPSAnJic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBjbG9zaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKGNsb3NpbmdUYWdSZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgdGFnIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICAgIHRva2VuID0gWyB0eXBlLCB2YWx1ZSwgc3RhcnQsIHNjYW5uZXIucG9zIF07XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG5cbiAgICAgIGlmICh0eXBlID09PSAnIycgfHwgdHlwZSA9PT0gJ14nKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnLycpIHtcbiAgICAgICAgLy8gQ2hlY2sgc2VjdGlvbiBuZXN0aW5nLlxuICAgICAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuXG4gICAgICAgIGlmICghb3BlblNlY3Rpb24pXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbm9wZW5lZCBzZWN0aW9uIFwiJyArIHZhbHVlICsgJ1wiIGF0ICcgKyBzdGFydCk7XG5cbiAgICAgICAgaWYgKG9wZW5TZWN0aW9uWzFdICE9PSB2YWx1ZSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHN0YXJ0KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ25hbWUnIHx8IHR5cGUgPT09ICd7JyB8fCB0eXBlID09PSAnJicpIHtcbiAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gT1JJR0lOQUwgQ09ERTpcbiAgICAgIC8vIGVsc2UgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgLy8gICAvLyBTZXQgdGhlIHRhZ3MgZm9yIHRoZSBuZXh0IHRpbWUgYXJvdW5kLlxuICAgICAgLy8gICBjb21waWxlVGFncyh2YWx1ZSk7XG4gICAgICAvLyB9XG4gICAgICAvLyBGYWlsIHF1aXRlbHkgYnV0IGRvIG5vdCBhbGxvdyBkZWxpbWl0ZXIgc3Vic3RpdHV0aW9ucy4gVGhpcyBpc1xuICAgICAgLy8gaW1wb3J0YW50IGZyb20gdGhlIHNlY3VyaXR5IHBvaW50IG9mIHZpZXcgc28gdGhhdCBvdXIgdmFsaWRhdG9yc1xuICAgICAgLy8gZG8gbm90IGhhdmUgdG8gcGFyc2UgYW5kIGludGVycHJldGUgYWxsIG9mIHRoZSBtdXN0YWNoZSdzIHN5bnRheC5cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICBpZiAob3BlblNlY3Rpb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lcyB0aGUgdmFsdWVzIG9mIGNvbnNlY3V0aXZlIHRleHQgdG9rZW5zIGluIHRoZSBnaXZlbiBgdG9rZW5zYCBhcnJheVxuICAgKiB0byBhIHNpbmdsZSB0b2tlbi5cbiAgICovXG4gIGZ1bmN0aW9uIHNxdWFzaFRva2VucyAodG9rZW5zKSB7XG4gICAgdmFyIHNxdWFzaGVkVG9rZW5zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIGxhc3RUb2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlblswXSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbiAmJiBsYXN0VG9rZW5bMF0gPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlblsxXSArPSB0b2tlblsxXTtcbiAgICAgICAgICBsYXN0VG9rZW5bM10gPSB0b2tlblszXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgaW50byBhIG5lc3RlZCB0cmVlIHN0cnVjdHVyZSB3aGVyZVxuICAgKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gICAqIGFsbCB0b2tlbnMgdGhhdCBhcHBlYXIgaW4gdGhhdCBzZWN0aW9uIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsXG4gICAqIHRlbXBsYXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgZW5kIG9mIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG5lc3RUb2tlbnMgKHRva2Vucykge1xuICAgIHZhciBuZXN0ZWRUb2tlbnMgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gbmVzdGVkVG9rZW5zO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBzZWN0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgY29sbGVjdG9yID0gdG9rZW5bNF0gPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuICAgICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bNF0gOiBuZXN0ZWRUb2tlbnM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXN0ZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgc3RyaW5nIHNjYW5uZXIgdGhhdCBpcyB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSBwYXJzZXIgdG8gZmluZFxuICAgKiB0b2tlbnMgaW4gdGVtcGxhdGUgc3RyaW5ncy5cbiAgICovXG4gIGZ1bmN0aW9uIFNjYW5uZXIgKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gZW9zICgpIHtcbiAgICByZXR1cm4gdGhpcy50YWlsID09PSAnJztcbiAgfTtcblxuICAvKipcbiAgICogVHJpZXMgdG8gbWF0Y2ggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogUmV0dXJucyB0aGUgbWF0Y2hlZCB0ZXh0IGlmIGl0IGNhbiBtYXRjaCwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2UuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gc2NhbiAocmUpIHtcbiAgICB2YXIgbWF0Y2ggPSB0aGlzLnRhaWwubWF0Y2gocmUpO1xuXG4gICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCAhPT0gMClcbiAgICAgIHJldHVybiAnJztcblxuICAgIHZhciBzdHJpbmcgPSBtYXRjaFswXTtcblxuICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCk7XG4gICAgdGhpcy5wb3MgKz0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNraXBzIGFsbCB0ZXh0IHVudGlsIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGJlIG1hdGNoZWQuIFJldHVybnNcbiAgICogdGhlIHNraXBwZWQgc3RyaW5nLCB3aGljaCBpcyB0aGUgZW50aXJlIHRhaWwgaWYgbm8gbWF0Y2ggY2FuIGJlIG1hZGUuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuVW50aWwgPSBmdW5jdGlvbiBzY2FuVW50aWwgKHJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWlsLnNlYXJjaChyZSksIG1hdGNoO1xuXG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICAgIHRoaXMudGFpbCA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbWF0Y2ggPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBtYXRjaCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSByZW5kZXJpbmcgY29udGV4dCBieSB3cmFwcGluZyBhIHZpZXcgb2JqZWN0IGFuZFxuICAgKiBtYWludGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAqL1xuICBmdW5jdGlvbiBDb250ZXh0ICh2aWV3LCBwYXJlbnRDb250ZXh0KSB7XG4gICAgdGhpcy52aWV3ID0gdmlldztcbiAgICB0aGlzLmNhY2hlID0geyAnLic6IHRoaXMudmlldyB9O1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50Q29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbnRleHQgdXNpbmcgdGhlIGdpdmVuIHZpZXcgd2l0aCB0aGlzIGNvbnRleHRcbiAgICogYXMgdGhlIHBhcmVudC5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoICh2aWV3KSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGlzIGNvbnRleHQsIHRyYXZlcnNpbmdcbiAgICogdXAgdGhlIGNvbnRleHQgaGllcmFyY2h5IGlmIHRoZSB2YWx1ZSBpcyBhYnNlbnQgaW4gdGhpcyBjb250ZXh0J3Mgdmlldy5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIGxvb2t1cCAobmFtZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKGNhY2hlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIG5hbWVzLCBpbmRleCwgbG9va3VwSGl0ID0gZmFsc2U7XG5cbiAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlldztcbiAgICAgICAgICBuYW1lcyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBVc2luZyB0aGUgZG90IG5vdGlvbiBwYXRoIGluIGBuYW1lYCwgd2UgZGVzY2VuZCB0aHJvdWdoIHRoZVxuICAgICAgICAgICAqIG5lc3RlZCBvYmplY3RzLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogVG8gYmUgY2VydGFpbiB0aGF0IHRoZSBsb29rdXAgaGFzIGJlZW4gc3VjY2Vzc2Z1bCwgd2UgaGF2ZSB0b1xuICAgICAgICAgICAqIGNoZWNrIGlmIHRoZSBsYXN0IG9iamVjdCBpbiB0aGUgcGF0aCBhY3R1YWxseSBoYXMgdGhlIHByb3BlcnR5XG4gICAgICAgICAgICogd2UgYXJlIGxvb2tpbmcgZm9yLiBXZSBzdG9yZSB0aGUgcmVzdWx0IGluIGBsb29rdXBIaXRgLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogVGhpcyBpcyBzcGVjaWFsbHkgbmVjZXNzYXJ5IGZvciB3aGVuIHRoZSB2YWx1ZSBoYXMgYmVlbiBzZXQgdG9cbiAgICAgICAgICAgKiBgdW5kZWZpbmVkYCBhbmQgd2Ugd2FudCB0byBhdm9pZCBsb29raW5nIHVwIHBhcmVudCBjb250ZXh0cy5cbiAgICAgICAgICAgKiovXG4gICAgICAgICAgd2hpbGUgKHZhbHVlICE9IG51bGwgJiYgaW5kZXggPCBuYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghaGFzUHJvcGVydHkodmFsdWUsIG5hbWVzW2luZGV4XSkpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gbmFtZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgbG9va3VwSGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbbmFtZXNbaW5kZXgrK11dO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWhhc1Byb3BlcnR5KGNvbnRleHQudmlldywgbmFtZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSBjb250ZXh0LnZpZXdbbmFtZV07XG4gICAgICAgICAgICBsb29rdXBIaXQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb29rdXBIaXQpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICBjYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSlcbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLnZpZXcpO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIFdyaXRlciBrbm93cyBob3cgdG8gdGFrZSBhIHN0cmVhbSBvZiB0b2tlbnMgYW5kIHJlbmRlciB0aGVtIHRvIGFcbiAgICogc3RyaW5nLCBnaXZlbiBhIGNvbnRleHQuIEl0IGFsc28gbWFpbnRhaW5zIGEgY2FjaGUgb2YgdGVtcGxhdGVzIHRvXG4gICAqIGF2b2lkIHRoZSBuZWVkIHRvIHBhcnNlIHRoZSBzYW1lIHRlbXBsYXRlIHR3aWNlLlxuICAgKi9cbiAgZnVuY3Rpb24gV3JpdGVyICgpIHtcbiAgICB0aGlzLmNhY2hlID0ge307XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoaXMgd3JpdGVyLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24gY2xlYXJDYWNoZSAoKSB7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBhbmQgcmV0dXJucyB0aGUgYXJyYXkgb2YgdG9rZW5zXG4gICAqIHRoYXQgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHBhcnNlLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG4gICAgdmFyIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXTtcblxuICAgIGlmICh0b2tlbnMgPT0gbnVsbClcbiAgICAgIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHRhZ3MpO1xuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfTtcblxuICAvKipcbiAgICogSGlnaC1sZXZlbCBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCB3aXRoXG4gICAqIHRoZSBnaXZlbiBgdmlld2AuXG4gICAqXG4gICAqIFRoZSBvcHRpb25hbCBgcGFydGlhbHNgIGFyZ3VtZW50IG1heSBiZSBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGVcbiAgICogbmFtZXMgYW5kIHRlbXBsYXRlcyBvZiBwYXJ0aWFscyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZS4gSXQgbWF5XG4gICAqIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gbG9hZCBwYXJ0aWFsIHRlbXBsYXRlcyBvbiB0aGUgZmx5XG4gICAqIHRoYXQgdGFrZXMgYSBzaW5nbGUgYXJndW1lbnQ6IHRoZSBuYW1lIG9mIHRoZSBwYXJ0aWFsLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnBhcnNlKHRlbXBsYXRlKTtcbiAgICB2YXIgY29udGV4dCA9ICh2aWV3IGluc3RhbmNlb2YgQ29udGV4dCkgPyB2aWV3IDogbmV3IENvbnRleHQodmlldyk7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VucywgY29udGV4dCwgcGFydGlhbHMsIHRlbXBsYXRlKTtcbiAgfTtcblxuICAvKipcbiAgICogTG93LWxldmVsIG1ldGhvZCB0aGF0IHJlbmRlcnMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIHVzaW5nXG4gICAqIHRoZSBnaXZlbiBgY29udGV4dGAgYW5kIGBwYXJ0aWFsc2AuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBgb3JpZ2luYWxUZW1wbGF0ZWAgaXMgb25seSBldmVyIHVzZWQgdG8gZXh0cmFjdCB0aGUgcG9ydGlvblxuICAgKiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB3YXMgY29udGFpbmVkIGluIGEgaGlnaGVyLW9yZGVyIHNlY3Rpb24uXG4gICAqIElmIHRoZSB0ZW1wbGF0ZSBkb2Vzbid0IHVzZSBoaWdoZXItb3JkZXIgc2VjdGlvbnMsIHRoaXMgYXJndW1lbnQgbWF5XG4gICAqIGJlIG9taXR0ZWQuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclRva2VucyA9IGZ1bmN0aW9uIHJlbmRlclRva2VucyAodG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciBidWZmZXIgPSAnJztcblxuICAgIHZhciB0b2tlbiwgc3ltYm9sLCB2YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgc3ltYm9sID0gdG9rZW5bMF07XG5cbiAgICAgIGlmIChzeW1ib2wgPT09ICcjJykgdmFsdWUgPSB0aGlzLnJlbmRlclNlY3Rpb24odG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ14nKSB2YWx1ZSA9IHRoaXMucmVuZGVySW52ZXJ0ZWQodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJz4nKSB2YWx1ZSA9IHRoaXMucmVuZGVyUGFydGlhbCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnJicpIHZhbHVlID0gdGhpcy51bmVzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICduYW1lJykgdmFsdWUgPSB0aGlzLmVzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICd0ZXh0JykgdmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2VuKTtcblxuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyU2VjdGlvbiA9IGZ1bmN0aW9uIHJlbmRlclNlY3Rpb24gKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYnVmZmVyID0gJyc7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJlbmRlciBhbiBhcmJpdHJhcnkgdGVtcGxhdGVcbiAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBzZWN0aW9ucy5cbiAgICBmdW5jdGlvbiBzdWJSZW5kZXIgKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gc2VsZi5yZW5kZXIodGVtcGxhdGUsIGNvbnRleHQsIHBhcnRpYWxzKTtcbiAgICB9XG5cbiAgICBpZiAoIXZhbHVlKSByZXR1cm47XG5cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGZvciAodmFyIGogPSAwLCB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaiA8IHZhbHVlTGVuZ3RoOyArK2opIHtcbiAgICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LnB1c2godmFsdWVbal0pLCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LnB1c2godmFsdWUpLCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbFRlbXBsYXRlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucyB3aXRob3V0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZScpO1xuXG4gICAgICAvLyBFeHRyYWN0IHRoZSBwb3J0aW9uIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHRoZSBzZWN0aW9uIGNvbnRhaW5zLlxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKGNvbnRleHQudmlldywgb3JpZ2luYWxUZW1wbGF0ZS5zbGljZSh0b2tlblszXSwgdG9rZW5bNV0pLCBzdWJSZW5kZXIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlckludmVydGVkID0gZnVuY3Rpb24gcmVuZGVySW52ZXJ0ZWQgKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcblxuICAgIC8vIFVzZSBKYXZhU2NyaXB0J3MgZGVmaW5pdGlvbiBvZiBmYWxzeS4gSW5jbHVkZSBlbXB0eSBhcnJheXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODZcbiAgICBpZiAoIXZhbHVlIHx8IChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApKVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXJQYXJ0aWFsID0gZnVuY3Rpb24gcmVuZGVyUGFydGlhbCAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzKSB7XG4gICAgaWYgKCFwYXJ0aWFscykgcmV0dXJuO1xuXG4gICAgdmFyIHZhbHVlID0gaXNGdW5jdGlvbihwYXJ0aWFscykgPyBwYXJ0aWFscyh0b2tlblsxXSkgOiBwYXJ0aWFsc1t0b2tlblsxXV07XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModGhpcy5wYXJzZSh2YWx1ZSksIGNvbnRleHQsIHBhcnRpYWxzLCB2YWx1ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS51bmVzY2FwZWRWYWx1ZSA9IGZ1bmN0aW9uIHVuZXNjYXBlZFZhbHVlICh0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYgKG11c3RhY2hlLnNhbml0aXplVW5lc2NhcGVkKSB7XG4gICAgICAgIHJldHVybiBtdXN0YWNoZS5zYW5pdGl6ZVVuZXNjYXBlZCh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24gZXNjYXBlZFZhbHVlICh0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiBtdXN0YWNoZS5lc2NhcGUodmFsdWUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmF3VmFsdWUgPSBmdW5jdGlvbiByYXdWYWx1ZSAodG9rZW4pIHtcbiAgICByZXR1cm4gdG9rZW5bMV07XG4gIH07XG5cbiAgbXVzdGFjaGUubmFtZSA9ICdtdXN0YWNoZS5qcyc7XG4gIG11c3RhY2hlLnZlcnNpb24gPSAnMi4yLjAnO1xuICBtdXN0YWNoZS50YWdzID0gWyAne3snLCAnfX0nIF07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiBjbGVhckNhY2hlICgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jbGVhckNhY2hlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpbiB0aGUgZGVmYXVsdCB3cml0ZXIgYW5kIHJldHVybnMgdGhlXG4gICAqIGFycmF5IG9mIHRva2VucyBpdCBjb250YWlucy4gRG9pbmcgdGhpcyBhaGVhZCBvZiB0aW1lIGF2b2lkcyB0aGUgbmVlZCB0b1xuICAgKiBwYXJzZSB0ZW1wbGF0ZXMgb24gdGhlIGZseSBhcyB0aGV5IGFyZSByZW5kZXJlZC5cbiAgICovXG4gIG11c3RhY2hlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCBhbmQgYHBhcnRpYWxzYCB1c2luZyB0aGVcbiAgICogZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHRlbXBsYXRlISBUZW1wbGF0ZSBzaG91bGQgYmUgYSBcInN0cmluZ1wiICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYnV0IFwiJyArIHR5cGVTdHIodGVtcGxhdGUpICsgJ1wiIHdhcyBnaXZlbiBhcyB0aGUgZmlyc3QgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdhcmd1bWVudCBmb3IgbXVzdGFjaGUjcmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyknKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5yZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGhlcmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggMC40LnguLFxuICAvKmVzbGludC1kaXNhYmxlICovIC8vIGVzbGludCB3YW50cyBjYW1lbCBjYXNlZCBmdW5jdGlvbiBuYW1lXG4gIG11c3RhY2hlLnRvX2h0bWwgPSBmdW5jdGlvbiB0b19odG1sICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHNlbmQpIHtcbiAgICAvKmVzbGludC1lbmFibGUqL1xuXG4gICAgdmFyIHJlc3VsdCA9IG11c3RhY2hlLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oc2VuZCkpIHtcbiAgICAgIHNlbmQocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBlc2NhcGluZyBmdW5jdGlvbiBzbyB0aGF0IHRoZSB1c2VyIG1heSBvdmVycmlkZSBpdC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8yNDRcbiAgbXVzdGFjaGUuZXNjYXBlID0gZXNjYXBlSHRtbDtcblxuICAvLyBFeHBvcnQgdGhlIHNhbml0aXppbmcgZnVuY3Rpb24gZm9yIHVuZXNjYXBlZCB2YWx1ZXMuXG4gIG11c3RhY2hlLnNhbml0aXplVW5lc2NhcGVkID0gbnVsbDtcbiAgbXVzdGFjaGUuc2V0VW5lc2NhcGVkU2FuaXRpemVyID0gZnVuY3Rpb24gc2V0VW5lc2NhcGVkU2FuaXRpemVyKHNhbml0aXplVW5lc2NhcGVkKSB7XG4gICAgbXVzdGFjaGUuc2FuaXRpemVVbmVzY2FwZWQgPSBzYW5pdGl6ZVVuZXNjYXBlZDtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlc2UgbWFpbmx5IGZvciB0ZXN0aW5nLCBidXQgYWxzbyBmb3IgYWR2YW5jZWQgdXNhZ2UuXG4gIG11c3RhY2hlLlNjYW5uZXIgPSBTY2FubmVyO1xuICBtdXN0YWNoZS5Db250ZXh0ID0gQ29udGV4dDtcbiAgbXVzdGFjaGUuV3JpdGVyID0gV3JpdGVyO1xuXG59O1xuXG5jb25zdCBNdXN0YWNoZSA9IHt9O1xubXVzdGFjaGVGYWN0b3J5KE11c3RhY2hlKTtcbmV4cG9ydCBkZWZhdWx0IE11c3RhY2hlO1xuIl19
// /Users/mszylkowski/src/amphtml/third_party/mustache/mustache.js