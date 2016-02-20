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

goog.require('goog.asserts');
goog.require('parse_css.EOFToken');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.TokenStream');
goog.require('parse_css.extractASimpleBlock');

/**
 * Abstract super class for CSS Selectors.
 */
css_selectors.SelectorNode = class {
  /**
   * @param {!number} line
   * @param {!number} col
   */
  constructor(line, col) {
    /** @type {number} */
    this.line = line;
    /** @type {number} */
    this.col = col;
    /** @type {string} */
    this.nodeType = 'abstract';
  }

  /** @return {!Object} */
  toJSON() {
    return {
      'line': this.line,
      'col': this.col,
      'node': this.nodeType
    }
  }

  /** @return {!Array<!css_selectors.SelectorNode>} */
  getChildNodes() { return []; }

  /** @param {!css_selectors.NodeVisitor} visitor */
  accept(visitor) {}
};

/**
 * A super class for making visitors (by overriding the types of interest).
 * The css_selectors.traverse function can be used to visit nodes in a
 * parsed CSS selector.
 */
css_selectors.NodeVisitor = class {
  constructor() {}

  /** @param {!css_selectors.TypeSelector} typeSelector */
  visitTypeSelector(typeSelector) {}

  /** @param {!css_selectors.IdSelector} idSelector */
  visitIdSelector(idSelector) {}

  /** @param {!css_selectors.AttrSelector} attrSelector */
  visitAttrSelector(attrSelector) {}

  /** @param {!css_selectors.PseudoSelector} pseudoSelector */
  visitPseudoSelector(pseudoSelector) {}

  /** @param {!css_selectors.ClassSelector} classSelector */
  visitClassSelector(classSelector) {}

  /** @param {!css_selectors.SimpleSelectorSequence} sequence */
  visitSimpleSelectorSequence(sequence) {}

  /** @param {!css_selectors.Combinator} combinator */
  visitCombinator(combinator) {}

  /** @param {!css_selectors.SelectorsGroup} group */
  visitSelectorsGroup(group) {}
};

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
 */
css_selectors.TypeSelector = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {?string} namespacePrefix
   * @param {string} elementName
   */
  constructor(line, col, namespacePrefix, elementName) {
    super(line, col);
    /** @type {?string} */
    this.namespacePrefix = namespacePrefix;
    /** @type {string} */
    this.elementName = elementName;
    /** @type {string} */
    this.nodeType = 'TYPE_SELECTOR';
  }

  /**
   * Serializes the selector to a string (in this case CSS syntax that
   * could be used to recreate it).
   * @return {string}
   */
  toString() {
    if (this.namespacePrefix === null) {
      return this.elementName;
    }
    return this.namespacePrefix + '|' + this.elementName;
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['namespacePrefix'] = this.namespacePrefix;
    json['elementName'] = this.elementName;
    return json;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitTypeSelector(this);
  }
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
 */
css_selectors.IdSelector = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {string} value
   */
  constructor(line, col, value) {
    super(line, col);
    /** @type {string} */
    this.value = value;
    /** @type {string} */
    this.nodeType = 'ID_SELECTOR';
  }

  /** @return {string} */
  toString() { return '#' + this.value; }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['value'] = this.value;
    return json;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitIdSelector(this);
  }
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
 */
css_selectors.AttrSelector = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {!Array<!parse_css.Token>} value
   */
  constructor(line, col, value) {
    super(line, col);
    /** @type {!Array<!parse_css.Token>} */
    this.value = value;
    /** @type {string} */
    this.nodeType = 'ATTR_SELECTOR';
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['value'] = recursiveArrayToJSON(this.value);
    return json;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitAttrSelector(this);
  }
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
 */
css_selectors.PseudoSelector = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {boolean} isClass selectors with a single colon (e.g., ':visited')
   *   are pseudo class selectors. Selectors with two colons
   *   (e.g., '::first-line') are pseudo elements.
   * @param {string} name
   * @param {!Array<!parse_css.Token>} func If it's a function style
   * pseudo selector, like lang(fr), then this parameter takes the function
   * tokens.
   */
  constructor(line, col, isClass, name, func) {
    super(line, col);
    /** @type {boolean} */
    this.isClass = isClass;
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!parse_css.Token>} */
    this.func = func;
    /** @type {string} */
    this.nodeType = 'PSEUDO_SELECTOR';
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['isClass'] = this.isClass;
    json['name'] = this.name;
    if (this.func.length !== 0) {
      json['func'] = recursiveArrayToJSON(this.func);
    }
    return json;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitPseudoSelector(this);
  }
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
  /** @type {!Array<!parse_css.Token>} */
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
        amp.validator.ValidationError.Code.CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR,
        ['style']);
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
 */
css_selectors.ClassSelector = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {string} value the class to match.
   */
  constructor(line, col, value) {
    super(line, col);
    /** @type {string} */
    this.value = value;
    /** @type {string} */
    this.nodeType = 'CLASS_SELECTOR';
  }
  /** @return {string} */
  toString() { return '.' + this.value; }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['value'] = this.value;
    return json;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitClassSelector(this);
  }
}

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
 * @param {!Array<!Object>} array
 * @return {!Array<string>}
 */
function recursiveArrayToJSON(array) {
  const json = [];
  for (const entry of array) {
    json.push(entry.toJSON());
  }
  return json;
}

/**
 * Models a simple selector sequence, e.g. '*|foo#id'.
 */
css_selectors.SimpleSelectorSequence = class extends
css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {!css_selectors.TypeSelector} typeSelector
   * @param {!Array<!css_selectors.IdSelector>} otherSelectors
   */
  constructor(line, col, typeSelector, otherSelectors) {
    super(line, col);
    /** @type {!css_selectors.TypeSelector} */
    this.typeSelector = typeSelector;
    /** @type {!Array<!css_selectors.IdSelector>} */
    this.otherSelectors = otherSelectors;
    /** @type {string} */
    this.nodeType = 'SIMPLE_SELECTOR_SEQUENCE';
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['typeSelector'] = this.typeSelector.toJSON();
    json['otherSelectors'] = recursiveArrayToJSON(this.otherSelectors);
    return json;
  }

  /** @inheritDoc */
  getChildNodes() {
    const children = [this.typeSelector];
    for (const other of this.otherSelectors) {
      children.push(other);
    }
    return children;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitSimpleSelectorSequence(this);
  }
}

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
          const error = new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_SELECTOR,
              ['style']);
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
 */
css_selectors.Combinator = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line line of the original combinator token
   * @param {number} col col of the original combinator token
   * @param {!string} combinatorType
   * @param {!css_selectors.SimpleSelectorSequence|!css_selectors.Combinator} left
   * @param {!css_selectors.SimpleSelectorSequence} right
   */
  constructor(line, col, combinatorType, left, right) {
    super(line, col);
    /** @type {!string} */
    this.combinatorType = combinatorType;
    /** @type {!css_selectors.SimpleSelectorSequence|!css_selectors.Combinator} */
    this.left = left;
    /** @type {!css_selectors.SimpleSelectorSequence} */
    this.right = right;
    /** @type {string} */
    this.nodeType = 'COMBINATOR';
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['combinatorType'] = this.combinatorType;
    json['left'] = this.left.toJSON();
    json['right'] = this.right.toJSON();
    return json;
  }

  /** @inheritDoc */
  getChildNodes() {
    return [this.left, this.right];
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitCombinator(this);
  }
};

/**
 * The CombinatorType for a given token; helper function used when
 * constructing a Combinator instance.
 * @param {!parse_css.Token} token
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
 * @param {!parse_css.Token} token
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
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']);
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
 */
css_selectors.SelectorsGroup = class extends css_selectors.SelectorNode {
  /**
   * @param {number} line
   * @param {number} col
   * @param {!Array<!css_selectors.SimpleSelectorSequence|
   *         !css_selectors.Combinator>} elements
   */
  constructor(line, col, elements) {
    super(line, col);
    /** @type {!Array<!css_selectors.SimpleSelectorSequence|
        !css_selectors.Combinator>} */
    this.elements = elements;
    /** @type {string} */
    this.nodeType = 'SELECTORS_GROUP';
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['elements'] = recursiveArrayToJSON(this.elements);
    return json;
  }

  /** @inheritDoc */
  getChildNodes() {
    return this.elements;
  }

  /** @param {!css_selectors.NodeVisitor} visitor */
  accept(visitor) {
    visitor.visitSelectorsGroup(this);
  }
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
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']);
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
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.
            CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR,
        ['style']);
    error.line = tokenStream.current().line;
    error.col = tokenStream.current().col;
    errors.push(error);
  }
  return (group instanceof parse_css.ErrorToken) ? null : group;
}
