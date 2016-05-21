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
goog.provide('parse_css.AttrSelector');
goog.provide('parse_css.ClassSelector');
goog.provide('parse_css.Combinator');
goog.provide('parse_css.IdSelector');
goog.provide('parse_css.PseudoSelector');
goog.provide('parse_css.Selector');
goog.provide('parse_css.SelectorVisitor');
goog.provide('parse_css.SelectorsGroup');
goog.provide('parse_css.SimpleSelectorSequence');
goog.provide('parse_css.TypeSelector');
goog.provide('parse_css.parseAClassSelector');
goog.provide('parse_css.parseASelector');
goog.provide('parse_css.parseASelectorsGroup');
goog.provide('parse_css.parseASimpleSelectorSequence');
goog.provide('parse_css.parseATypeSelector');
goog.provide('parse_css.parseAnAttrSelector');
goog.provide('parse_css.parseAnIdSelector');
goog.provide('parse_css.parseSelectors');
goog.provide('parse_css.traverseSelectors');

goog.require('goog.asserts');
goog.require('parse_css.EOFToken');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.Token');
goog.require('parse_css.TokenStream');
goog.require('parse_css.extractAFunction');

/**
 * Abstract super class for CSS Selectors. The Token class, which this
 * class inherits from, has line, col, and tokenType fields.
 */
parse_css.Selector = class extends parse_css.Token {
  /** @param {!function(!parse_css.Selector)} lambda */
  forEachChild(lambda) {}

  /** @param {!parse_css.SelectorVisitor} visitor */
  accept(visitor) {}
};

/**
 * A super class for making visitors (by overriding the types of interest).
 * The parse_css.traverseSelectros function can be used to visit nodes in a
 * parsed CSS selector.
 */
parse_css.SelectorVisitor = class {
  constructor() {}

  /** @param {!parse_css.TypeSelector} typeSelector */
  visitTypeSelector(typeSelector) {}

  /** @param {!parse_css.IdSelector} idSelector */
  visitIdSelector(idSelector) {}

  /** @param {!parse_css.AttrSelector} attrSelector */
  visitAttrSelector(attrSelector) {}

  /** @param {!parse_css.PseudoSelector} pseudoSelector */
  visitPseudoSelector(pseudoSelector) {}

  /** @param {!parse_css.ClassSelector} classSelector */
  visitClassSelector(classSelector) {}

  /** @param {!parse_css.SimpleSelectorSequence} sequence */
  visitSimpleSelectorSequence(sequence) {}

  /** @param {!parse_css.Combinator} combinator */
  visitCombinator(combinator) {}

  /** @param {!parse_css.SelectorsGroup} group */
  visitSelectorsGroup(group) {}
};

/**
 * Visits selectorNode and its children, recursively, by calling the
 * appropriate methods on the provided visitor.
 * @param {!parse_css.Selector} selectorNode
 * @param {!parse_css.SelectorVisitor} visitor
 */
parse_css.traverseSelectors = function(selectorNode, visitor) {
  /** @type {!Array<!parse_css.Selector>} */
  const toVisit = [selectorNode];
  while (toVisit.length > 0) {
    /** @type {!parse_css.Selector} */
    const node = toVisit.shift();
    node.accept(visitor);
    node.forEachChild(child => { toVisit.push(child); });
  }
};

/**
 * This node models type selectors and universial selectors.
 * http://www.w3.org/TR/css3-selectors/#type-selectors
 * http://www.w3.org/TR/css3-selectors/#universal-selector
 */
parse_css.TypeSelector = class extends parse_css.Selector {
  /**
   * Choices for namespacePrefix:
   * - 'a specific namespace prefix' means 'just that specific namespace'.
   * - '' means 'without a namespace'
   * - '*' means 'any namespace including without a namespace'
   * - null means the default namespace if one is declared, and '*' otherwise.
   *
   * The universal selector is covered by setting the elementName to '*'.
   *
   * @param {?string} namespacePrefix
   * @param {string} elementName
   */
  constructor(namespacePrefix, elementName) {
    super();
    /** @type {?string} */
    this.namespacePrefix = namespacePrefix;
    /** @type {string} */
    this.elementName = elementName;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.TYPE_SELECTOR;
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
  accept(visitor) { visitor.visitTypeSelector(this); }
};

/**
 * Helper function for determining whether the provided token is a specific
 * delimiter.
 * @param {!parse_css.Token} token
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
 * @return {!parse_css.TypeSelector}
 */
parse_css.parseATypeSelector = function(tokenStream) {
  /** @type {?string} */
  let namespacePrefix = null;
  /** @type {string} */
  let elementName = '*';
  const start = tokenStream.current();

  if (isDelim(tokenStream.current(), '|')) {
    namespacePrefix = '';
    tokenStream.consume();
  } else if (
      isDelim(tokenStream.current(), '*') && isDelim(tokenStream.next(), '|')) {
    namespacePrefix = '*';
    tokenStream.consume();
    tokenStream.consume();
  } else if (
      tokenStream.current() instanceof parse_css.IdentToken &&
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
  const selector = new parse_css.TypeSelector(namespacePrefix, elementName);
  start.copyStartPositionTo(selector);
  return selector;
};

/**
 * An ID selector references some document id.
 * http://www.w3.org/TR/css3-selectors/#id-selectors
 * Typically written as '#foo'.
 */
parse_css.IdSelector = class extends parse_css.Selector {
  /**
   * @param {string} value
   */
  constructor(value) {
    super();
    /** @type {string} */
    this.value = value;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.ID_SELECTOR;
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
  accept(visitor) { visitor.visitIdSelector(this); }
};

/**
 * tokenStream.current() must be the hash token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.IdSelector}
 */
parse_css.parseAnIdSelector = function(tokenStream) {
  goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.HashToken,
      'Precondition violated: must start with HashToken');
  const hash =
      goog.asserts.assertInstanceof(tokenStream.current(), parse_css.HashToken);
  tokenStream.consume();
  const selector = new parse_css.IdSelector(hash.value);
  hash.copyStartPositionTo(selector);
  return selector;
};

/**
 * An attribute selector matches document nodes based on their attributes.
 * http://www.w3.org/TR/css3-selectors/#attribute-selectors
 *
 * Typically written as '[foo=bar]'.
 */
parse_css.AttrSelector = class extends parse_css.Selector {
  /**
   * @param {string?} namespacePrefix
   * @param {!string} attrName
   * @param {!string} matchOperator is either the string
   * representation of the match operator (e.g., '=' or '~=') or '',
   * in which case the attribute selector is a check for the presence
   * of the attribute.
   * @param {!string} value is the value to apply the match operator
   * against, or if matchOperator is '', then this must be empty as
   * well.
   */
  constructor(namespacePrefix, attrName, matchOperator, value) {
    super();
    /** @type {string?} */
    this.namespacePrefix = namespacePrefix;
    /** @type {!string} */
    this.attrName = attrName;
    /** @type {string?} */
    this.matchOperator = matchOperator;
    /** @type {string?} */
    this.value = value;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.ATTR_SELECTOR;
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['namespacePrefix'] = this.namespacePrefix;
    json['attrName'] = this.attrName;
    json['matchOperator'] = this.matchOperator;
    json['value'] = this.value;
    return json;
  }

  /** @inheritDoc */
  accept(visitor) { visitor.visitAttrSelector(this); }
};

/**
 * Helper for parseAnAttrSelector.
 * @private
 * @param {!parse_css.Token} start
 * @return {!parse_css.ErrorToken}
 */
function newInvalidAttrSelectorError(start) {
  const error = new parse_css.ErrorToken(
      amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_ATTR_SELECTOR,
      ['style']);
  start.copyStartPositionTo(error);
  return error;
}

/**
 * tokenStream.current() must be the open square token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.AttrSelector|!parse_css.ErrorToken}
 */
parse_css.parseAnAttrSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current() instanceof parse_css.OpenSquareToken,
      'Precondition violated: must be an OpenSquareToken');
  const start = tokenStream.current();
  tokenStream.consume();  // Consumes '['.
  if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }
  // This part is defined in https://www.w3.org/TR/css3-selectors/#attrnmsp:
  // Attribute selectors and namespaces. It is similar to parseATypeSelector.
  let namespacePrefix = null;
  if (isDelim(tokenStream.current(), '|')) {
    namespacePrefix = '';
    tokenStream.consume();
  } else if (
      isDelim(tokenStream.current(), '*') && isDelim(tokenStream.next(), '|')) {
    namespacePrefix = '*';
    tokenStream.consume();
    tokenStream.consume();
  } else if (
      tokenStream.current() instanceof parse_css.IdentToken &&
      isDelim(tokenStream.next(), '|')) {
    const ident = goog.asserts.assertInstanceof(
        tokenStream.current(), parse_css.IdentToken);
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  // Now parse the attribute name. This part is mandatory.
  if (!(tokenStream.current() instanceof parse_css.IdentToken)) {
    return newInvalidAttrSelectorError(start);
  }
  const ident = goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.IdentToken);
  const attrName = ident.value;
  tokenStream.consume();
  if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }

  // After the attribute name, we may see an operator; if we do, then
  // we must see either a string or an identifier. This covers
  // 6.3.1 Attribute presence and value selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-representation) and
  // 6.3.2 Substring matching attribute selectors
  // (https://www.w3.org/TR/css3-selectors/#attribute-substrings).

  /** @type {string} */
  let matchOperator = '';
  if (isDelim(tokenStream.current(), '=')) {
    matchOperator = '=';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.IncludeMatchToken) {
    matchOperator = '~=';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.DashMatchToken) {
    matchOperator = '|=';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.PrefixMatchToken) {
    matchOperator = '^=';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.SuffixMatchToken) {
    matchOperator = '$=';
    tokenStream.consume();
  } else if (tokenStream.current() instanceof parse_css.SubstringMatchToken) {
    matchOperator = '*=';
    tokenStream.consume();
  }
  if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }
  /** @type {string} */
  let value = '';
  if (matchOperator !== '') {  // If we saw an operator, parse the value.
    if (tokenStream.current() instanceof parse_css.IdentToken) {
      const ident = goog.asserts.assertInstanceof(
          tokenStream.current(), parse_css.IdentToken);
      value = ident.value;
      tokenStream.consume();
    } else if (tokenStream.current() instanceof parse_css.StringToken) {
      const str = goog.asserts.assertInstanceof(
          tokenStream.current(), parse_css.StringToken);
      value = str.value;
      tokenStream.consume();
    } else {
      return newInvalidAttrSelectorError(start);
    }
  }
  if (tokenStream.current() instanceof parse_css.WhitespaceToken) {
    tokenStream.consume();
  }
  // The attribute selector must in any case terminate with a close square
  // token.
  if (!(tokenStream.current() instanceof parse_css.CloseSquareToken)) {
    return newInvalidAttrSelectorError(start);
  }
  tokenStream.consume();
  const selector = new parse_css.AttrSelector(
      namespacePrefix, attrName, matchOperator, value);
  start.copyStartPositionTo(selector);
  return selector;
};

/**
 * A pseudo selector can match either pseudo classes or pseudo elements.
 * http://www.w3.org/TR/css3-selectors/#pseudo-classes
 * http://www.w3.org/TR/css3-selectors/#pseudo-elements.
 *
 * Typically written as ':visited', ':lang(fr)', and '::first-line'.
 *
 * isClass: Pseudo selectors with a single colon (e.g., ':visited')
 * are pseudo class selectors. Selectors with two colons (e.g.,
 * '::first-line') are pseudo elements.
 *
 * func: If it's a function style pseudo selector, like lang(fr), then func
 * the function tokens. TODO(powdercloud): parse this in more detail.
 */
parse_css.PseudoSelector = class extends parse_css.Selector {
  /**
   * @param {boolean} isClass
   * @param {string} name
   * @param {!Array<!parse_css.Token>} func
   */
  constructor(isClass, name, func) {
    super();
    /** @type {boolean} */
    this.isClass = isClass;
    /** @type {string} */
    this.name = name;
    /** @type {!Array<!parse_css.Token>} */
    this.func = func;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.PSEUDO_SELECTOR;
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
  accept(visitor) { visitor.visitPseudoSelector(this); }
};

/**
 * tokenStream.current() must be the ColonToken. Returns an error if
 * the pseudo token can't be parsed (e.g., a lone ':').
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.PseudoSelector|!parse_css.ErrorToken}
 */
parse_css.parseAPseudoSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current() instanceof parse_css.ColonToken,
      'Precondition violated: must be a ":"');
  const firstColon = tokenStream.current();
  tokenStream.consume();
  let isClass = true;
  if (tokenStream.current() instanceof parse_css.ColonToken) {
    // '::' starts a pseudo element, ':' starts a pseudo class.
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
    tokenStream.consume();
  } else {
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR,
        ['style']);
    firstColon.copyStartPositionTo(error);
    return error;
  }
  const selector = new parse_css.PseudoSelector(isClass, name, func);
  firstColon.copyStartPositionTo(selector);
  return selector;
};

/**
 * A class selector of the form '.value' is a shorthand notation for
 * an attribute match of the form '[class~=value]'.
 * http://www.w3.org/TR/css3-selectors/#class-html
 */
parse_css.ClassSelector = class extends parse_css.Selector {
  /**
   * @param {string} value the class to match.
   */
  constructor(value) {
    super();
    /** @type {string} */
    this.value = value;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.CLASS_SELECTOR;
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
  accept(visitor) { visitor.visitClassSelector(this); }
};

/**
 * tokenStream.current() must be the '.' delimiter token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.ClassSelector}
 */
parse_css.parseAClassSelector = function(tokenStream) {
  goog.asserts.assert(
      isDelim(tokenStream.current(), '.') &&
          tokenStream.next() instanceof parse_css.IdentToken,
      'Precondition violated: must start with "." and follow with ident');
  const dot = tokenStream.current();
  tokenStream.consume();
  const ident = goog.asserts.assertInstanceof(
      tokenStream.current(), parse_css.IdentToken);
  tokenStream.consume();
  const selector = new parse_css.ClassSelector(ident.value);
  selector.line = dot.line;
  selector.col = dot.col;
  return selector;
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
parse_css.SimpleSelectorSequence = class extends parse_css.Selector {
  /**
   * @param {!parse_css.TypeSelector} typeSelector
   * @param {!Array<!parse_css.Selector>} otherSelectors
   */
  constructor(typeSelector, otherSelectors) {
    super();
    /** @type {!parse_css.TypeSelector} */
    this.typeSelector = typeSelector;
    /** @type {!Array<!parse_css.Selector>} */
    this.otherSelectors = otherSelectors;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.SIMPLE_SELECTOR_SEQUENCE;
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['typeSelector'] = this.typeSelector.toJSON();
    json['otherSelectors'] = recursiveArrayToJSON(this.otherSelectors);
    return json;
  }

  /** @inheritDoc */
  forEachChild(lambda) {
    lambda(this.typeSelector);
    for (const other of this.otherSelectors) {
      lambda(other);
    }
  }

  /** @inheritDoc */
  accept(visitor) { visitor.visitSimpleSelectorSequence(this); }
};

/**
 * tokenStream.current must be the first token of the sequence.
 * This function will return an error if no selector is found.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.SimpleSelectorSequence|!parse_css.ErrorToken}
 */
parse_css.parseASimpleSelectorSequence = function(tokenStream) {
  const line = tokenStream.current().line;
  const col = tokenStream.current().col;
  let typeSelector = null;
  if (isDelim(tokenStream.current(), '*') ||
      isDelim(tokenStream.current(), '|') ||
      tokenStream.current() instanceof parse_css.IdentToken) {
    typeSelector = parse_css.parseATypeSelector(tokenStream);
  }
  /** @type {!Array<!parse_css.Selector>} */
  const otherSelectors = [];
  while (true) {
    if (tokenStream.current() instanceof parse_css.HashToken) {
      otherSelectors.push(parse_css.parseAnIdSelector(tokenStream));
    } else if (
        isDelim(tokenStream.current(), '.') &&
        tokenStream.next() instanceof parse_css.IdentToken) {
      otherSelectors.push(parse_css.parseAClassSelector(tokenStream));
    } else if (tokenStream.current() instanceof parse_css.OpenSquareToken) {
      const maybeAttrSelector = parse_css.parseAnAttrSelector(tokenStream);
      if (maybeAttrSelector instanceof parse_css.ErrorToken) {
        return maybeAttrSelector;
      }
      otherSelectors.push(maybeAttrSelector);
    } else if (tokenStream.current() instanceof parse_css.ColonToken) {
      const maybePseudo = parse_css.parseAPseudoSelector(tokenStream);
      if (maybePseudo instanceof parse_css.ErrorToken) {
        return maybePseudo;
      }
      otherSelectors.push(maybePseudo);
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
        typeSelector = new parse_css.TypeSelector(
            /*namespacePrefix=*/null, /*elementName=*/'*');
        typeSelector.line = line;
        typeSelector.col = col;
      }
      const sequence =
          new parse_css.SimpleSelectorSequence(typeSelector, otherSelectors);
      sequence.line = line;
      sequence.col = col;
      return sequence;
    }
  }
};

/**
 * @enum {string}
 */
parse_css.CombinatorType = {
  'DESCENDANT': 'DESCENDANT',
  'CHILD': 'CHILD',
  'ADJACENT_SIBLING': 'ADJACENT_SIBLING',
  'GENERAL_SIBLING': 'GENERAL_SIBLING'
};

/**
 * Models a combinator, as described in
 * http://www.w3.org/TR/css3-selectors/#combinators.
 */
parse_css.Combinator = class extends parse_css.Selector {
  /**
   * @param {!parse_css.CombinatorType} combinatorType
   * @param {!parse_css.SimpleSelectorSequence|!parse_css.Combinator} left
   * @param {!parse_css.SimpleSelectorSequence} right
   */
  constructor(combinatorType, left, right) {
    super();
    /** @type {!parse_css.CombinatorType} */
    this.combinatorType = combinatorType;
    /** @type {!parse_css.SimpleSelectorSequence|!parse_css.Combinator} */
    this.left = left;
    /** @type {!parse_css.SimpleSelectorSequence} */
    this.right = right;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.COMBINATOR;
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
  forEachChild(lambda) {
    lambda(this.left);
    lambda(this.right);
  }

  /** @inheritDoc */
  accept(visitor) { visitor.visitCombinator(this); }
};

/**
 * The CombinatorType for a given token; helper function used when
 * constructing a Combinator instance.
 * @param {!parse_css.Token} token
 * @return {!parse_css.CombinatorType}
 */
function combinatorTypeForToken(token) {
  if (token instanceof parse_css.WhitespaceToken) {
    return parse_css.CombinatorType.DESCENDANT;
  } else if (isDelim(token, '>')) {
    return parse_css.CombinatorType.CHILD;
  } else if (isDelim(token, '+')) {
    return parse_css.CombinatorType.ADJACENT_SIBLING;
  } else if (isDelim(token, '~')) {
    return parse_css.CombinatorType.GENERAL_SIBLING;
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
 * @return {!parse_css.SimpleSelectorSequence|
 *          !parse_css.Combinator|!parse_css.ErrorToken}
 */
parse_css.parseASelector = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']);
    error.line = tokenStream.current().line;
    error.col = tokenStream.current().col;
    return error;
  }
  let left = parse_css.parseASimpleSelectorSequence(tokenStream);
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
    const right = parse_css.parseASimpleSelectorSequence(tokenStream);
    if (right instanceof parse_css.ErrorToken) {
      return right;  // TODO(johannes): more than one error / partial tree.
    }
    left = new parse_css.Combinator(
        combinatorTypeForToken(combinatorToken), left, right);
    left.line = combinatorToken.line;
    left.col = combinatorToken.col;
  }
};

/**
 * Models a selectors group, as described in
 * http://www.w3.org/TR/css3-selectors/#grouping.
 */
parse_css.SelectorsGroup = class extends parse_css.Selector {
  /**
   * @param {!Array<!parse_css.SimpleSelectorSequence|
   *         !parse_css.Combinator>} elements
   */
  constructor(elements) {
    super();
    /** @type {!Array<!parse_css.SimpleSelectorSequence|
        !parse_css.Combinator>} */
    this.elements = elements;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.SELECTORS_GROUP;
  }

  /** @inheritDoc */
  toJSON() {
    const json = super.toJSON();
    json['elements'] = recursiveArrayToJSON(this.elements);
    return json;
  }

  /** @inheritDoc */
  forEachChild(lambda) {
    for (const child of this.elements) {
      lambda(child);
    }
  }

  /** @param {!parse_css.SelectorVisitor} visitor */
  accept(visitor) { visitor.visitSelectorsGroup(this); }
};

/**
 * The selectors_group production from
 * http://www.w3.org/TR/css3-selectors/#grammar.
 * In addition, this parsing routine checks that no input remains,
 * that is, after parsing the production we reached the end of |token_stream|.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.SelectorsGroup|
 *          !parse_css.SimpleSelectorSequence|!parse_css.Combinator|
 *          !parse_css.ErrorToken}
 */
parse_css.parseASelectorsGroup = function(tokenStream) {
  if (!isSimpleSelectorSequenceStart(tokenStream.current())) {
    const error = new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']);
    tokenStream.current().copyStartPositionTo(error);
    return error;
  }
  const start = tokenStream.current();
  const elements = [parse_css.parseASelector(tokenStream)];
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
      elements.push(parse_css.parseASelector(tokenStream));
      if (elements[elements.length - 1] instanceof parse_css.ErrorToken) {
        return elements[elements.length - 1];
      }
      continue;
    }
    // We're about to claim success and return a selector,
    // but before we do, we check that no unparsed input remains.
    if (!(tokenStream.current() instanceof parse_css.EOFToken)) {
      const error = new parse_css.ErrorToken(
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR,
          ['style']);
      tokenStream.current().copyStartPositionTo(error);
      return error;
    }
    if (elements.length == 1) {
      return elements[0];
    }
    const group = new parse_css.SelectorsGroup(elements);
    start.copyStartPositionTo(group);
    return group;
  }
};
