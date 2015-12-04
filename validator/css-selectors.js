/**
 * @license
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * limitations under the license.
 */
goog.require('goog.asserts');
goog.require('parse_css.EOFToken');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.TokenStream');
goog.require('parse_css.extractASimpleBlock');

goog.provide('css_selectors.AttrSelector');
goog.provide('css_selectors.ClassSelector');
goog.provide('css_selectors.Combinator');
goog.provide('css_selectors.IdSelector');
goog.provide('css_selectors.NodeVisitor');
goog.provide('css_selectors.PseudoSelector');
goog.provide('css_selectors.SelectorNode');
goog.provide('css_selectors.SelectorsGroup');
goog.provide('css_selectors.SimpleSelectorSequence');
goog.provide('css_selectors.TypeSelector');
goog.provide('css_selectors.parseASelector');
goog.provide('css_selectors.parseATypeSelector');
goog.provide('css_selectors.parseAnAttrSelector');
goog.provide('css_selectors.parseAnIdSelector');
goog.provide('css_selectors.traverse');

/**
 * Abstract super class for CSS Selectors.
 * @param {!number} line
 * @param {!number} col
 * @constructor
 */
css_selectors.SelectorNode = function(line, col) {
  /** @type {number} */
  this.line = line;
  /** @type {number} */
  this.col = col;
};

/** @type {string} */
css_selectors.SelectorNode.prototype.nodeType = 'abstract';

/** @return {!Object} */
css_selectors.SelectorNode.prototype.toJSON = function() {
  return {
    'line': this.line,
    'col': this.col,
    'node': this.nodeType
  };
};

/** @return {!Array<!css_selectors.SelectorNode>} */
css_selectors.SelectorNode.prototype.getChildNodes = function() {
  return [];
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.SelectorNode.prototype.accept = function(visitor) {
  goog.asserts.fail('Abstract Base Class');
};

/**
 * A super class for making visitors (by overriding the types of interest).
 * The css_selectors.traverse function can be used to visit nodes in a
 * parsed CSS selector.
 * @constructor
 */
css_selectors.NodeVisitor = function() {};

/** @param {!css_selectors.TypeSelector} typeSelector */
css_selectors.NodeVisitor.prototype.visitTypeSelector =
    function(typeSelector) {};

/** @param {!css_selectors.IdSelector} idSelector */
css_selectors.NodeVisitor.prototype.visitIdSelector =
    function(idSelector) {};

/** @param {!css_selectors.AttrSelector} attrSelector */
css_selectors.NodeVisitor.prototype.visitAttrSelector =
    function(attrSelector) {};

/** @param {!css_selectors.PseudoSelector} pseudoSelector */
css_selectors.NodeVisitor.prototype.visitPseudoSelector =
    function(pseudoSelector) {};

/** @param {!css_selectors.ClassSelector} classSelector */
css_selectors.NodeVisitor.prototype.visitClassSelector =
    function(classSelector) {};

/** @param {!css_selectors.SimpleSelectorSequence} sequence */
css_selectors.NodeVisitor.prototype.visitSimpleSelectorSequence =
    function(sequence) {};

/** @param {!css_selectors.Combinator} combinator */
css_selectors.NodeVisitor.prototype.visitCombinator =
    function(combinator) {};

/** @param {!css_selectors.SelectorsGroup} group */
css_selectors.NodeVisitor.prototype.visitSelectorsGroup =
    function(group) {};

/**
 * Visits the node by calling the appropriate methods on the provided visitor.
 * @param {!css_selectors.SelectorNode} selectorNode
 * @param {!css_selectors.NodeVisitor} visitor
 */
css_selectors.traverse = function(selectorNode, visitor) {
  /** @type {!Array<!css_selectors.SelectorNode>} */
  const toVisit = [selectorNode];
  while (toVisit.length > 0) {
    /** @type {!css_selectors.SelectorNode} */
    const node = toVisit.shift();
    node.accept(visitor);
    for (const child of node.getChildNodes()) {
      toVisit.push(child);
    }
  }
};

/**
 * This node models type selectors and universial selectors.
 * http://www.w3.org/TR/css3-selectors/#type-selectors
 * http://www.w3.org/TR/css3-selectors/#universal-selector
 *
 * Choices for namespacePrefix:
 * 'a specific namespace prefix' means 'just that specific namespace'.
 * '' means 'without a namespace'
 * '*' means 'any namespace including without a namespace'
 * null means the default namespace if one is declared, and '*' otherwise.
 *
 * The universal selector is covered by setting the elementName to '*'.
 *
 * @param {number} line
 * @param {number} col
 * @param {?string} namespacePrefix
 * @param {string} elementName
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.TypeSelector = function(line, col, namespacePrefix, elementName) {
  goog.base(this, line, col);
  /** @type {?string} */
  this.namespacePrefix = namespacePrefix;
  /** @type {string} */
  this.elementName = elementName;
};
goog.inherits(css_selectors.TypeSelector, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.TypeSelector.prototype.nodeType = 'TYPE_SELECTOR';

/**
 * Serializes the selector to a string (in this case CSS syntax that
 * could be used to recreate it).
 * @return {string}
 */
css_selectors.TypeSelector.prototype.toString = function() {
  if (this.namespacePrefix === null) {
    return this.elementName;
  }
  return this.namespacePrefix + '|' + this.elementName;
};

/** @return {!Object} */
css_selectors.TypeSelector.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['namespacePrefix'] = this.namespacePrefix;
  json['elementName'] = this.elementName;
  return json;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.TypeSelector.prototype.accept = function(visitor) {
  visitor.visitTypeSelector(this);
};

/**
 * Helper function for determining whether the provided token is a specific
 * delimiter.
 * @param {!Object} token
 * @param {string} delimChar
 * @return {boolean}
 */
function isDelim(token, delimChar) {
  if (!(token instanceof parse_css.DelimToken)) {
    return false;
  }
  const delimToken = goog.asserts.assertInstanceof(token, parse_css.DelimToken);
  return delimToken.value === delimChar;
}

/**
 * tokenStream.current() is the first token of the type selector.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.TypeSelector}
 */
css_selectors.parseATypeSelector = function(tokenStream) {
  /** @type {?string} */
  let namespacePrefix = null;
  /** @type {string} */
  let elementName = '*';
  const line = tokenStream.current().line;
  const col = tokenStream.current().col;

  if (isDelim(tokenStream.current(), '|')) {
    namespacePrefix = '';
    tokenStream.consume();
  } else if (isDelim(tokenStream.current(), '*') &&
      isDelim(tokenStream.next(), '|')) {
    namespacePrefix = '*';
    tokenStream.consume();
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.IdentToken &&
      isDelim(tokenStream.next(), '|')) {
    const ident = goog.asserts.assertInstanceof(
        tokenStream.current(), parse_css.IdentToken);
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  if (tokenStream.current() instanceof parse_css.DelimToken &&
      isDelim(tokenStream.current(), '*')) {
    elementName = '*';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.IdentToken) {
    const ident = goog.asserts.assertInstanceof(
        tokenStream.current(), parse_css.IdentToken);
    elementName = ident.value;
    tokenStream.consume();
  }
  return new css_selectors.TypeSelector(
      line, col, namespacePrefix, elementName);
};

/**
 * An ID selector references some document id.
 * http://www.w3.org/TR/css3-selectors/#id-selectors
 * Typically written as '#foo'.
 * @param {number} line
 * @param {number} col
 * @param {string} value
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.IdSelector = function(line, col, value) {
  goog.base(this, line, col);
  /** @type {string} */
  this.value = value;
};
goog.inherits(css_selectors.IdSelector, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.IdSelector.prototype.nodeType = 'ID_SELECTOR';

/** @return {string} */
css_selectors.IdSelector.prototype.toString = function() {
  return '#' + this.value;
};

/** @return {!Object} */
css_selectors.IdSelector.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  return json;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.IdSelector.prototype.accept = function(visitor) {
  visitor.visitIdSelector(this);
};

/**
 * tokenStream.current() must be the hash token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.IdSelector}
 */
css_selectors.parseAnIdSelector = function(tokenStream) {
  goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.HashToken,
      'Precondition violated: must start with HashToken');
  const hash = goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.HashToken);
  tokenStream.consume();
  return new css_selectors.IdSelector(hash.line, hash.col, hash.value);
};

/**
 * An attribute selector matches document nodes based on their attributes.
 * http://www.w3.org/TR/css3-selectors/#attribute-selectors
 * Note: this is a placeholder implementation which has the raw tokens
 * as its value. We'll refine this in the future.
 *
 * Typically written as '[foo=bar]'.
 * @param {number} line
 * @param {number} col
 * @param {!Array<!parse_css.CSSParserToken>} value
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.AttrSelector = function(line, col, value) {
  goog.base(this, line, col);
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.value = value;
};
goog.inherits(css_selectors.AttrSelector, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.AttrSelector.prototype.nodeType = 'ATTR_SELECTOR';

/** @return {!Object} */
css_selectors.AttrSelector.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = recursiveArrayToJSON(this.value);
  return json;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.AttrSelector.prototype.accept = function(visitor) {
  visitor.visitAttrSelector(this);
};

/**
 * tokenStream.current() must be the hash token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.AttrSelector}
 */
css_selectors.parseAnAttrSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current() instanceof parse_css.OpenSquareToken,
      'Precondition violated: must be an OpenSquareToken');
  const start = tokenStream.current();
  const block = parse_css.extractASimpleBlock(tokenStream);
  tokenStream.consume();
  return new css_selectors.AttrSelector(start.line, start.col, block);
};

/**
 * A pseudo selector can match either pseudo classes or pseudo elements.
 * http://www.w3.org/TR/css3-selectors/#pseudo-classes
 * http://www.w3.org/TR/css3-selectors/#pseudo-elements.
 *
 * Typically written as ':visited', ':lang(fr)', and '::first-line'.
 * @param {number} line
 * @param {number} col
 * @param {boolean} isClass selectors with a single colon (e.g., ':visited')
 *   are pseudo class selectors. Selectors with two colons
 *   (e.g., '::first-line') are pseudo elements.
 * @param {string} name
 * @param {!Array<!parse_css.CSSParserToken>} func If it's a function style
 * pseudo selector, like lang(fr), then this parameter takes the function
 * tokens.
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.PseudoSelector = function(line, col, isClass, name, func) {
  goog.base(this, line, col);
  /** @type {boolean} */
  this.isClass = isClass;
  /** @type {string} */
  this.name = name;
  /** @type {!Array<!parse_css.CSSParserToken>} */
  this.func = func;
};
goog.inherits(css_selectors.PseudoSelector, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.PseudoSelector.prototype.nodeType = 'PSEUDO_SELECTOR';

/** @return {!Object} */
css_selectors.PseudoSelector.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['isClass'] = this.isClass;
  json['name'] = this.name;
  if (this.func.length !== 0) {
    json['func'] = recursiveArrayToJSON(this.func);
  }
  return json;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.PseudoSelector.prototype.accept = function(visitor) {
  visitor.visitPseudoSelector(this);
};

/**
 * tokenStream.current() must be the ColonToken. Returns an error if
 * the pseudo token can't be parsed (e.g., a lone ':').
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.PseudoSelector|!parse_css.ErrorToken}
 */
css_selectors.parseAPseudoSelector = function(tokenStream) {
  goog.asserts.assert(tokenStream.current() instanceof parse_css.ColonToken,
                      'Precondition violated: must be a ":"');
  const firstColon = tokenStream.current();
  tokenStream.consume();
  let isClass = true;
  if (tokenStream.current() instanceof parse_css.ColonToken) {
    isClass = false;
    tokenStream.consume();
  }
  let name = '';
  /** @type {!Array<!parse_css.CSSParserToken>} */
  let func = [];
  if (tokenStream.current() instanceof parse_css.IdentToken) {
    const ident = goog.asserts.assertInstanceof(
        tokenStream.current(), parse_css.IdentToken);
    name = ident.value;
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.FunctionToken) {
    const funcToken = goog.asserts.assertInstanceof(
        tokenStream.current(), parse_css.FunctionToken);
    name = funcToken.value;
    func = parse_css.extractAFunction(tokenStream);
  } else {
    const error = new parse_css.ErrorToken(
        parse_css.ErrorType.SELECTORS,
        'syntax error in pseudo specification');
    error.line = firstColon.line;
    error.col = firstColon.col;
    return error;
  }
  return new css_selectors.PseudoSelector(
      firstColon.line, firstColon.col, isClass, name, func);
};

/**
 * A class selector of the form '.value' is a shorthand notation for
 * an attribute match of the form '[class~=value]'.
 * http://www.w3.org/TR/css3-selectors/#class-html
 * @param {number} line
 * @param {number} col
 * @param {string} value the class to match.
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.ClassSelector = function(line, col, value) {
  goog.base(this, line, col);
  /** @type {string} */
  this.value = value;
};
goog.inherits(css_selectors.ClassSelector, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.ClassSelector.prototype.nodeType = 'CLASS_SELECTOR';

/** @return {string} */
css_selectors.ClassSelector.prototype.toString = function() {
  return '.' + this.value;
};

/** @return {!Object} */
css_selectors.ClassSelector.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['value'] = this.value;
  return json;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.ClassSelector.prototype.accept = function(visitor) {
  visitor.visitClassSelector(this);
};

/**
 * tokenStream.current() must be the '.' delimiter token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.ClassSelector}
 */
css_selectors.parseAClassSelector = function(tokenStream) {
  goog.asserts.assert(
      isDelim(tokenStream.current(), '.') &&
      tokenStream.next() instanceof parse_css.IdentToken,
      'Precondition violated: must start with "." and follow with ident');
  const dot = tokenStream.current();
  tokenStream.consume();
  const ident = goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.IdentToken);
  tokenStream.consume();
  return new css_selectors.ClassSelector(dot.line, dot.col, ident.value);
};

/**
 * Models a simple selector sequence, e.g. '*|foo#id'.
 * @param {number} line
 * @param {number} col
 * @param {css_selectors.TypeSelector} typeSelector
 * @param {!Array<!css_selectors.IdSelector>} otherSelectors
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.SimpleSelectorSequence = function(line, col,
                                                typeSelector, otherSelectors) {
  goog.base(this, line, col);
  this.typeSelector = typeSelector;
  this.otherSelectors = otherSelectors;
};
goog.inherits(css_selectors.SimpleSelectorSequence, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.SimpleSelectorSequence.prototype.nodeType =
    'SIMPLE_SELECTOR_SEQUENCE';

function recursiveArrayToJSON(array) {
  const json = [];
  for (const entry of array) {
    json.push(entry.toJSON());
  }
  return json;
}

/** @return {!Object} */
css_selectors.SimpleSelectorSequence.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['typeSelector'] = this.typeSelector.toJSON();
  json['otherSelectors'] = recursiveArrayToJSON(this.otherSelectors);
  return json;
};

/** @return {!Array<!css_selectors.SelectorNode>} */
css_selectors.SimpleSelectorSequence.prototype.getChildNodes = function() {
  const children = [this.typeSelector];
  for (const other of this.otherSelectors) {
    children.push(other);
  }
  return children;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.SimpleSelectorSequence.prototype.accept = function(visitor) {
  visitor.visitSimpleSelectorSequence(this);
};

/**
 * tokenStream.current must be the first token of the sequence.
 * This function will return an error if no selector is found.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.SimpleSelectorSequence|!parse_css.ErrorToken}
 */
css_selectors.parseASimpleSelectorSequence = function(tokenStream) {
  const line = tokenStream.current().line;
  const col = tokenStream.current().col;
  let typeSelector = null;
  if (isDelim(tokenStream.current(), '*') ||
      isDelim(tokenStream.current(), '|') ||
      tokenStream.current() instanceof parse_css.IdentToken) {
    typeSelector = css_selectors.parseATypeSelector(tokenStream);
  }
  const otherSelectors = [];
  while (true) {
    if (tokenStream.current() instanceof parse_css.HashToken) {
      otherSelectors.push(css_selectors.parseAnIdSelector(tokenStream));
    } else if (isDelim(tokenStream.current(), '.') &&
        tokenStream.next() instanceof parse_css.IdentToken) {
      otherSelectors.push(css_selectors.parseAClassSelector(tokenStream));
    } else if (tokenStream.current() instanceof parse_css.OpenSquareToken) {
      otherSelectors.push(css_selectors.parseAnAttrSelector(tokenStream));
    } else if (tokenStream.current() instanceof parse_css.ColonToken) {
      const pseudo = css_selectors.parseAPseudoSelector(tokenStream);
      if (pseudo instanceof parse_css.ErrorToken) {
        return pseudo;
      }
      otherSelectors.push(pseudo);
      // NOTE: If adding more 'else if' clauses here, be sure to udpate
      // isSimpleSelectorSequenceStart accordingly.
    } else {
      if (typeSelector === null) {
        if (otherSelectors.length == 0) {
          const error = new parse_css.ErrorToken(parse_css.ErrorType.SELECTORS,
                                               'no selector found');
          error.line = tokenStream.current().line;
          error.col = tokenStream.current().col;
          return error;
        }
        // If no type selector is given then the universal selector is implied.
        typeSelector = new css_selectors.TypeSelector(
            line, col, /*namespacePrefix=*/ null, /*elementname=*/ '*');
      }
      return new css_selectors.SimpleSelectorSequence(
          line, col, typeSelector, otherSelectors);
    }
  }
};

/**
 * @enum {string}
 */
css_selectors.CombinatorType = {
  'DESCENDANT': 'DESCENDANT',
  'CHILD': 'CHILD',
  'ADJACENT_SIBLING': 'ADJACENT_SIBLING',
  'GENERAL_SIBLING': 'GENERAL_SIBLING'
};

/**
 * Models a combinator, as described in
 * http://www.w3.org/TR/css3-selectors/#combinators.
 * @param {number} line line of the original combinator token
 * @param {number} col col of the original combinator token
 * @param {!string} combinatorType
 * @param {!css_selectors.SimpleSelectorSequence|!css_selectors.Combinator} left
 * @param {!css_selectors.SimpleSelectorSequence} right
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.Combinator = function(line, col, combinatorType, left, right) {
  goog.base(this, line, col);
  /** @type {!string} */
  this.combinatorType = combinatorType;
  /** @type {!css_selectors.SimpleSelectorSequence|!css_selectors.Combinator} */
  this.left = left;
  /** @type {!css_selectors.SimpleSelectorSequence} */
  this.right = right;
};
goog.inherits(css_selectors.Combinator, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.Combinator.prototype.nodeType = 'COMBINATOR';

/** @return {!Object} */
css_selectors.Combinator.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['combinatorType'] = this.combinatorType;
  json['left'] = this.left.toJSON();
  json['right'] = this.right.toJSON();
  return json;
};

/** @return {!Array<!css_selectors.SelectorNode>} */
css_selectors.Combinator.prototype.getChildNodes = function() {
  return [this.left, this.right];
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.Combinator.prototype.accept = function(visitor) {
  visitor.visitCombinator(this);
};

/**
 * The CombinatorType for a given token; helper function used when
 * constructing a Combinator instance.
 * @param {!parse_css.CSSParserToken} token
 * @return {string}
 */
function combinatorTypeForToken(token) {
  if (token instanceof parse_css.WhitespaceToken) {
    return css_selectors.CombinatorType.DESCENDANT;
  } else if (isDelim(token, '>')) {
    return css_selectors.CombinatorType.CHILD;
  } else if (isDelim(token, '+')) {
    return css_selectors.CombinatorType.ADJACENT_SIBLING;
  } else if (isDelim(token, '~')) {
    return css_selectors.CombinatorType.GENERAL_SIBLING;
  }
  goog.asserts.fail('Internal Error: not a combinator token');
}

/**
 * Whether or not the provided token could be the start of a simple
 * selector sequence. See the simple_selector_sequence production in
 * http://www.w3.org/TR/css3-selectors/#grammar.
 * @param {!parse_css.CSSParserToken} token
 * @return {boolean}
 */
function isSimpleSelectorSequenceStart(token) {
  // Type selector start.
  if (isDelim(token, '*') || isDelim(token, '|') ||
      (token instanceof parse_css.IdentToken)) {
    return true;
  }
  // Id selector start.
  if (token instanceof parse_css.HashToken) {
    return true;
  }
  // Class selector start.
  if (isDelim(token, '.')) {
    return true;
  }
  // Attr selector start.
  if (token instanceof parse_css.OpenSquareToken) {
    return true;
  }
  // A pseudo selector.
  if (token instanceof parse_css.ColonToken) {
    return true;
  }
  // TODO(johannes): add the others.
  return false;
}

/**
 * The selector production from
 * http://www.w3.org/TR/css3-selectors/#grammar
 * Returns an ErrorToken if no selector is found.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.SimpleSelectorSequence|
 *          !css_selectors.Combinator|!parse_css.ErrorToken}
 */
css_selectors.parseASelector = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    const error = new parse_css.ErrorToken(parse_css.ErrorType.SELECTORS,
                                         'not a selector start');
    error.line = tokenStream.current().line;
    error.col = tokenStream.current().col;
    return error;
  }
  let left = css_selectors.parseASimpleSelectorSequence(tokenStream);
  if (left instanceof parse_css.ErrorToken) {
    return left;
  }
  while (true) {
    // Consume whitespace in front of combinators, while being careful
    // to not eat away the infamous "whitespace operator" (sigh, haha).
    if ((tokenStream.current() instanceof parse_css.WhitespaceToken) &&
        !isSimpleSelectorSequenceStart(tokenStream.next())) {
      tokenStream.consume();
    }
    // If present, grab the combinator token which we'll use for line
    // / column info.
    if (!(((tokenStream.current() instanceof parse_css.WhitespaceToken) &&
        isSimpleSelectorSequenceStart(tokenStream.next())) ||
        isDelim(tokenStream.current(), '+') ||
        isDelim(tokenStream.current(), '>') ||
        isDelim(tokenStream.current(), '~'))) {
      return left;
    }
    const combinatorToken = tokenStream.current();
    tokenStream.consume();
    if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
      tokenStream.consume();
    }
    const right = css_selectors.parseASimpleSelectorSequence(tokenStream);
    if (right instanceof parse_css.ErrorToken) {
      return right;  // TODO(johannes): more than one error / partial tree.
    }
    left = new css_selectors.Combinator(
        combinatorToken.line, combinatorToken.col,
        combinatorTypeForToken(combinatorToken), left, right);
  }
};

/**
 * Models a selectors group, as described in
 * http://www.w3.org/TR/css3-selectors/#grouping.
 * @param {number} line
 * @param {number} col
 * @param {!Array<!css_selectors.SimpleSelectorSequence|
 *         !css_selectors.Combinator>} elements
 * @constructor
 * @extends {css_selectors.SelectorNode}
 */
css_selectors.SelectorsGroup = function(line, col, elements) {
  goog.base(this, line, col);
  /** @type {!Array<!css_selectors.SimpleSelectorSequence|
  !css_selectors.Combinator>} */
  this.elements = elements;
};
goog.inherits(css_selectors.SelectorsGroup, css_selectors.SelectorNode);

/** @type {string} */
css_selectors.SelectorsGroup.prototype.nodeType = 'SELECTORS_GROUP';

/** @return {!Object} */
css_selectors.SelectorsGroup.prototype.toJSON = function() {
  const json = goog.base(this, 'toJSON');
  json['elements'] = recursiveArrayToJSON(this.elements);
  return json;
};

/** @return {!Array<!css_selectors.SelectorNode>} */
css_selectors.SelectorsGroup.prototype.getChildNodes = function() {
  return this.elements;
};

/** @param {!css_selectors.NodeVisitor} visitor */
css_selectors.SelectorsGroup.prototype.accept = function(visitor) {
  visitor.visitSelectorsGroup(this);
};

/**
 * The selectors_group production from
 * http://www.w3.org/TR/css3-selectors/#grammar
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!css_selectors.SelectorsGroup|
 *          !css_selectors.SimpleSelectorSequence|!css_selectors.Combinator|
 *          !parse_css.ErrorToken}
 */
css_selectors.parseASelectorsGroup = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    const error = new parse_css.ErrorToken(parse_css.ErrorType.SELECTORS,
                                           'not a selector start');
    error.line = tokenStream.current().line;
    error.col = tokenStream.current().col;
    return error;
  }
  const line = tokenStream.current().line;
  const col = tokenStream.current().col;
  const elements = [css_selectors.parseASelector(tokenStream)];
  if (elements[0] instanceof parse_css.ErrorToken) {
    return elements[0];
  }
  while (true) {
    if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
      tokenStream.consume();
    }
    if (tokenStream.current() instanceof parse_css.CommaToken) {
      tokenStream.consume();
      if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
        tokenStream.consume();
      }
      elements.push(css_selectors.parseASelector(tokenStream));
      if (elements[elements.length - 1] instanceof parse_css.ErrorToken) {
        return elements[elements.length - 1];
      }
      continue;
    }
    if (elements.length == 1) {
      return elements[0];
    }
    return new css_selectors.SelectorsGroup(line, col, elements);
  }
};

/**
 * @param {!parse_css.TokenStream} tokenStream
 * @param {!Array<!parse_css.ErrorToken>} errors
 * @return {css_selectors.SelectorsGroup|css_selectors.SimpleSelectorSequence|css_selectors.Combinator}
 */
css_selectors.parse = function(tokenStream, errors) {
  const group = css_selectors.parseASelectorsGroup(tokenStream);
  if (group instanceof parse_css.ErrorToken) {
    errors.push(group);
  }
  if (!(tokenStream.current() instanceof parse_css.EOFToken)) {
    const error = new parse_css.ErrorToken(parse_css.ErrorType.SELECTORS,
                                           'unparsed input remains');
    error.line = tokenStream.current().line;
    error.col = tokenStream.current().col;
    errors.push(error);
  }
  return (group instanceof parse_css.ErrorToken) ? null : group;
}
