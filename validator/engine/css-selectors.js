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
goog.require('amp.validator.LIGHT');
goog.require('amp.validator.ValidationError');
goog.require('goog.asserts');
goog.require('parse_css.ErrorToken');
goog.require('parse_css.TRIVIAL_ERROR_TOKEN');
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
    node.forEachChild(child => {
      toVisit.push(child);
    });
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
  accept(visitor) {
    visitor.visitTypeSelector(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.TypeSelector.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['namespacePrefix'] = this.namespacePrefix;
    json['elementName'] = this.elementName;
    return json;
  };
}

/**
 * Helper function for determining whether the provided token is a specific
 * delimiter.
 * @param {!parse_css.Token} token
 * @param {string} delimChar
 * @return {boolean}
 */
function isDelim(token, delimChar) {
  return token.tokenType === parse_css.TokenType.DELIM &&
      /** @type {!parse_css.DelimToken} */ (token).value === delimChar;
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
      tokenStream.current().tokenType === parse_css.TokenType.IDENT &&
      isDelim(tokenStream.next(), '|')) {
    const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  if (isDelim(tokenStream.current(), '*')) {
    elementName = '*';
    tokenStream.consume();
  } else if (tokenStream.current().tokenType === parse_css.TokenType.IDENT) {
    const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
    elementName = ident.value;
    tokenStream.consume();
  }
  return start.copyPosTo(
      new parse_css.TypeSelector(namespacePrefix, elementName));
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
  toString() {
    return '#' + this.value;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitIdSelector(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.IdSelector.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['value'] = this.value;
    return json;
  };
}

/**
 * tokenStream.current() must be the hash token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.IdSelector}
 */
parse_css.parseAnIdSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current().tokenType === parse_css.TokenType.HASH,
      'Precondition violated: must start with HashToken');
  const hash = /** @type {!parse_css.HashToken} */ (tokenStream.current());
  tokenStream.consume();
  return hash.copyPosTo(new parse_css.IdSelector(hash.value));
};

/**
 * An attribute selector matches document nodes based on their attributes.
 * http://www.w3.org/TR/css3-selectors/#attribute-selectors
 *
 * Typically written as '[foo=bar]'.
 */
parse_css.AttrSelector = class extends parse_css.Selector {
  /**
   * @param {?string} namespacePrefix
   * @param {string} attrName
   * @param {string} matchOperator is either the string
   * representation of the match operator (e.g., '=' or '~=') or '',
   * in which case the attribute selector is a check for the presence
   * of the attribute.
   * @param {string} value is the value to apply the match operator
   * against, or if matchOperator is '', then this must be empty as
   * well.
   */
  constructor(namespacePrefix, attrName, matchOperator, value) {
    super();
    /** @type {?string} */
    this.namespacePrefix = namespacePrefix;
    /** @type {string} */
    this.attrName = attrName;
    /** @type {string} */
    this.matchOperator = matchOperator;
    /** @type {string} */
    this.value = value;
    /** @type {parse_css.TokenType} */
    this.tokenType = parse_css.TokenType.ATTR_SELECTOR;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitAttrSelector(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.AttrSelector.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['namespacePrefix'] = this.namespacePrefix;
    json['attrName'] = this.attrName;
    json['matchOperator'] = this.matchOperator;
    json['value'] = this.value;
    return json;
  };
}

/**
 * Helper for parseAnAttrSelector.
 * @private
 * @param {!parse_css.Token} start
 * @return {!parse_css.ErrorToken}
 */
function newInvalidAttrSelectorError(start) {
  return start.copyPosTo(new parse_css.ErrorToken(
      amp.validator.ValidationError.Code.CSS_SYNTAX_INVALID_ATTR_SELECTOR,
      ['style']));
}

/**
 * tokenStream.current() must be the open square token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.AttrSelector|!parse_css.ErrorToken}
 */
parse_css.parseAnAttrSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current().tokenType === parse_css.TokenType.OPEN_SQUARE,
      'Precondition violated: must be an OpenSquareToken');
  const start = tokenStream.current();
  tokenStream.consume();  // Consumes '['.
  if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
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
      tokenStream.current().tokenType === parse_css.TokenType.IDENT &&
      isDelim(tokenStream.next(), '|')) {
    const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
    namespacePrefix = ident.value;
    tokenStream.consume();
    tokenStream.consume();
  }
  // Now parse the attribute name. This part is mandatory.
  if (!(tokenStream.current().tokenType === parse_css.TokenType.IDENT)) {
    if (amp.validator.LIGHT) {
      return parse_css.TRIVIAL_ERROR_TOKEN;
    }
    return newInvalidAttrSelectorError(start);
  }
  const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
  const attrName = ident.value;
  tokenStream.consume();
  if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
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
  const current = tokenStream.current().tokenType;
  if (isDelim(tokenStream.current(), '=')) {
    matchOperator = '=';
    tokenStream.consume();
  } else if (current === parse_css.TokenType.INCLUDE_MATCH) {
    matchOperator = '~=';
    tokenStream.consume();
  } else if (current === parse_css.TokenType.DASH_MATCH) {
    matchOperator = '|=';
    tokenStream.consume();
  } else if (current === parse_css.TokenType.PREFIX_MATCH) {
    matchOperator = '^=';
    tokenStream.consume();
  } else if (current === parse_css.TokenType.SUFFIX_MATCH) {
    matchOperator = '$=';
    tokenStream.consume();
  } else if (current === parse_css.TokenType.SUBSTRING_MATCH) {
    matchOperator = '*=';
    tokenStream.consume();
  }
  if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }
  /** @type {string} */
  let value = '';
  if (matchOperator !== '') {  // If we saw an operator, parse the value.
    const current = tokenStream.current().tokenType;
    if (current === parse_css.TokenType.IDENT) {
      const ident =
          /** @type {!parse_css.IdentToken} */ (tokenStream.current());
      value = ident.value;
      tokenStream.consume();
    } else if (current === parse_css.TokenType.STRING) {
      const str = /** @type {!parse_css.StringToken} */ (tokenStream.current());
      value = str.value;
      tokenStream.consume();
    } else {
      if (amp.validator.LIGHT) {
        return parse_css.TRIVIAL_ERROR_TOKEN;
      }
    }
  }
  if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
    tokenStream.consume();
  }
  // The attribute selector must in any case terminate with a close square
  // token.
  if (tokenStream.current().tokenType !== parse_css.TokenType.CLOSE_SQUARE) {
    if (amp.validator.LIGHT) {
      return parse_css.TRIVIAL_ERROR_TOKEN;
    }
    return newInvalidAttrSelectorError(start);
  }
  tokenStream.consume();
  const selector = new parse_css.AttrSelector(
      namespacePrefix, attrName, matchOperator, value);
  return start.copyPosTo(selector);
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
  accept(visitor) {
    visitor.visitPseudoSelector(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.PseudoSelector.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['isClass'] = this.isClass;
    json['name'] = this.name;
    if (this.func.length !== 0) {
      json['func'] = recursiveArrayToJSON(this.func);
    }
    return json;
  };
}

/**
 * tokenStream.current() must be the ColonToken. Returns an error if
 * the pseudo token can't be parsed (e.g., a lone ':').
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.PseudoSelector|!parse_css.ErrorToken}
 */
parse_css.parseAPseudoSelector = function(tokenStream) {
  goog.asserts.assert(
      tokenStream.current().tokenType === parse_css.TokenType.COLON,
      'Precondition violated: must be a ":"');
  const firstColon = tokenStream.current();
  tokenStream.consume();
  let isClass = true;
  if (tokenStream.current().tokenType === parse_css.TokenType.COLON) {
    // '::' starts a pseudo element, ':' starts a pseudo class.
    isClass = false;
    tokenStream.consume();
  }
  if (tokenStream.current().tokenType === parse_css.TokenType.IDENT) {
    const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
    const name = ident.value;
    tokenStream.consume();
    return firstColon.copyPosTo(
        new parse_css.PseudoSelector(isClass, name, []));
  } else if (
      tokenStream.current().tokenType === parse_css.TokenType.FUNCTION_TOKEN) {
    const funcToken =
        /** @type {!parse_css.FunctionToken} */ (tokenStream.current());
    const func = parse_css.extractAFunction(tokenStream);
    tokenStream.consume();
    return firstColon.copyPosTo(
        new parse_css.PseudoSelector(isClass, funcToken.value, func));
  } else if (!amp.validator.LIGHT) {
    return firstColon.copyPosTo(new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_ERROR_IN_PSEUDO_SELECTOR,
        ['style']));
  }
  return parse_css.TRIVIAL_ERROR_TOKEN;
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
  toString() {
    return '.' + this.value;
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitClassSelector(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.ClassSelector.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['value'] = this.value;
    return json;
  };
}

/**
 * tokenStream.current() must be the '.' delimiter token.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.ClassSelector}
 */
parse_css.parseAClassSelector = function(tokenStream) {
  goog.asserts.assert(
      isDelim(tokenStream.current(), '.') &&
          tokenStream.next().tokenType === parse_css.TokenType.IDENT,
      'Precondition violated: must start with "." and follow with ident');
  const dot = tokenStream.current();
  tokenStream.consume();
  const ident = /** @type {!parse_css.IdentToken} */ (tokenStream.current());
  tokenStream.consume();
  return dot.copyPosTo(new parse_css.ClassSelector(ident.value));
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
  forEachChild(lambda) {
    lambda(this.typeSelector);
    for (const other of this.otherSelectors) {
      lambda(other);
    }
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitSimpleSelectorSequence(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.SimpleSelectorSequence.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['typeSelector'] = this.typeSelector.toJSON();
    json['otherSelectors'] = recursiveArrayToJSON(this.otherSelectors);
    return json;
  };
}

/**
 * tokenStream.current must be the first token of the sequence.
 * This function will return an error if no selector is found.
 * @param {!parse_css.TokenStream} tokenStream
 * @return {!parse_css.SimpleSelectorSequence|!parse_css.ErrorToken}
 */
parse_css.parseASimpleSelectorSequence = function(tokenStream) {
  const start = tokenStream.current();
  let typeSelector = null;
  if (isDelim(tokenStream.current(), '*') ||
      isDelim(tokenStream.current(), '|') ||
      tokenStream.current().tokenType === parse_css.TokenType.IDENT) {
    typeSelector = parse_css.parseATypeSelector(tokenStream);
  }
  /** @type {!Array<!parse_css.Selector>} */
  const otherSelectors = [];
  while (true) {
    if (tokenStream.current().tokenType === parse_css.TokenType.HASH) {
      otherSelectors.push(parse_css.parseAnIdSelector(tokenStream));
    } else if (
        isDelim(tokenStream.current(), '.') &&
        tokenStream.next().tokenType === parse_css.TokenType.IDENT) {
      otherSelectors.push(parse_css.parseAClassSelector(tokenStream));
    } else if (
        tokenStream.current().tokenType === parse_css.TokenType.OPEN_SQUARE) {
      const maybeAttrSelector = parse_css.parseAnAttrSelector(tokenStream);
      if (maybeAttrSelector.tokenType === parse_css.TokenType.ERROR) {
        return /** @type {!parse_css.ErrorToken} */ (maybeAttrSelector);
      }
      otherSelectors.push(
          /** @type {!parse_css.Selector} */ (maybeAttrSelector));
    } else if (tokenStream.current().tokenType === parse_css.TokenType.COLON) {
      const maybePseudo = parse_css.parseAPseudoSelector(tokenStream);
      if (maybePseudo.tokenType === parse_css.TokenType.ERROR) {
        return /** @type {!parse_css.ErrorToken} */ (maybePseudo);
      }
      otherSelectors.push(/** @type {!parse_css.Selector} */ (maybePseudo));
      // NOTE: If adding more 'else if' clauses here, be sure to udpate
      // isSimpleSelectorSequenceStart accordingly.
    } else {
      if (typeSelector === null) {
        if (otherSelectors.length == 0) {
          if (amp.validator.LIGHT) {
            return parse_css.TRIVIAL_ERROR_TOKEN;
          }
          return tokenStream.current().copyPosTo(new parse_css.ErrorToken(
              amp.validator.ValidationError.Code.CSS_SYNTAX_MISSING_SELECTOR,
              ['style']));
        }
        // If no type selector is given then the universal selector is implied.
        typeSelector = start.copyPosTo(new parse_css.TypeSelector(
            /*namespacePrefix=*/null, /*elementName=*/'*'));
      }
      return start.copyPosTo(
          new parse_css.SimpleSelectorSequence(typeSelector, otherSelectors));
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
  forEachChild(lambda) {
    lambda(this.left);
    lambda(this.right);
  }

  /** @inheritDoc */
  accept(visitor) {
    visitor.visitCombinator(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.Combinator.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['combinatorType'] = this.combinatorType;
    json['left'] = this.left.toJSON();
    json['right'] = this.right.toJSON();
    return json;
  };
}

/**
 * The CombinatorType for a given token; helper function used when
 * constructing a Combinator instance.
 * @param {!parse_css.Token} token
 * @return {!parse_css.CombinatorType}
 */
function combinatorTypeForToken(token) {
  if (token.tokenType === parse_css.TokenType.WHITESPACE) {
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
      (token.tokenType === parse_css.TokenType.IDENT)) {
    return true;
  }
  // Id selector start.
  if (token.tokenType === parse_css.TokenType.HASH) {
    return true;
  }
  // Class selector start.
  if (isDelim(token, '.')) {
    return true;
  }
  // Attr selector start.
  if (token.tokenType === parse_css.TokenType.OPEN_SQUARE) {
    return true;
  }
  // A pseudo selector.
  if (token.tokenType === parse_css.TokenType.COLON) {
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
    if (amp.validator.LIGHT) {
      return parse_css.TRIVIAL_ERROR_TOKEN;
    }
    return tokenStream.current().copyPosTo(new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']));
  }
  const parsed = parse_css.parseASimpleSelectorSequence(tokenStream);
  if (parsed.tokenType === parse_css.TokenType.ERROR) {
    return parsed;
  }
  let left = /** @type {!parse_css.SimpleSelectorSequence}*/ (parsed);
  while (true) {
    // Consume whitespace in front of combinators, while being careful
    // to not eat away the infamous "whitespace operator" (sigh, haha).
    if ((tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) &&
        !isSimpleSelectorSequenceStart(tokenStream.next())) {
      tokenStream.consume();
    }
    // If present, grab the combinator token which we'll use for line
    // / column info.
    if (!(((tokenStream.current().tokenType ===
            parse_css.TokenType.WHITESPACE) &&
           isSimpleSelectorSequenceStart(tokenStream.next())) ||
          isDelim(tokenStream.current(), '+') ||
          isDelim(tokenStream.current(), '>') ||
          isDelim(tokenStream.current(), '~'))) {
      return left;
    }
    const combinatorToken = tokenStream.current();
    tokenStream.consume();
    if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }
    const right = parse_css.parseASimpleSelectorSequence(tokenStream);
    if (right.tokenType === parse_css.TokenType.ERROR) {
      return right;  // TODO(johannes): more than one error / partial tree.
    }
    left = combinatorToken.copyPosTo(new parse_css.Combinator(
        combinatorTypeForToken(combinatorToken), left,
        /** @type {!parse_css.SimpleSelectorSequence} */ (right)));
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
  forEachChild(lambda) {
    for (const child of this.elements) {
      lambda(child);
    }
  }

  /** @param {!parse_css.SelectorVisitor} visitor */
  accept(visitor) {
    visitor.visitSelectorsGroup(this);
  }
};
if (!amp.validator.LIGHT) {
  /** @inheritDoc */
  parse_css.SelectorsGroup.prototype.toJSON = function() {
    const json = parse_css.Selector.prototype.toJSON.call(this);
    json['elements'] = recursiveArrayToJSON(this.elements);
    return json;
  };
}

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
    if (amp.validator.LIGHT) {
      return parse_css.TRIVIAL_ERROR_TOKEN;
    }
    return tokenStream.current().copyPosTo(new parse_css.ErrorToken(
        amp.validator.ValidationError.Code.CSS_SYNTAX_NOT_A_SELECTOR_START,
        ['style']));
  }
  const start = tokenStream.current();
  const elements = [parse_css.parseASelector(tokenStream)];
  if (elements[0].tokenType === parse_css.TokenType.ERROR) {
    return elements[0];
  }
  while (true) {
    if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
      tokenStream.consume();
    }
    if (tokenStream.current().tokenType === parse_css.TokenType.COMMA) {
      tokenStream.consume();
      if (tokenStream.current().tokenType === parse_css.TokenType.WHITESPACE) {
        tokenStream.consume();
      }
      elements.push(parse_css.parseASelector(tokenStream));
      if (elements[elements.length - 1].tokenType ===
          parse_css.TokenType.ERROR) {
        return elements[elements.length - 1];
      }
      continue;
    }
    // We're about to claim success and return a selector,
    // but before we do, we check that no unparsed input remains.
    if (!(tokenStream.current().tokenType === parse_css.TokenType.EOF_TOKEN)) {
      if (amp.validator.LIGHT) {
        return parse_css.TRIVIAL_ERROR_TOKEN;
      }
      return tokenStream.current().copyPosTo(new parse_css.ErrorToken(
          amp.validator.ValidationError.Code
              .CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR,
          ['style']));
    }
    if (elements.length == 1) {
      return elements[0];
    }
    return start.copyPosTo(new parse_css.SelectorsGroup(elements));
  }
};
