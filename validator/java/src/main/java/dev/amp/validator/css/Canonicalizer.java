/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator.css;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.Token;
import dev.amp.validator.utils.CssSpecUtils;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static dev.amp.validator.utils.CssSpecUtils.BlockType.PARSE_AS_DECLARATIONS;
import static dev.amp.validator.utils.CssSpecUtils.BlockType.PARSE_AS_RULES;
import static dev.amp.validator.utils.CssSpecUtils.asciiMatch;
import static dev.amp.validator.utils.CssSpecUtils.stripVendorPrefix;

/**
 * Process and validate a css document.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class Canonicalizer {

    private static final int K_MAXIMUM_CSS_RECURSION = 100;

    /**
     * Constructor for canonicalizer.
     *
     * @param atRuleSpec  the AtRule Spec to validate against
     * @param defaultSpec the block type to process as
     */
    public Canonicalizer(@Nonnull final Map<String, CssSpecUtils.BlockType> atRuleSpec,
                         @Nonnull final CssSpecUtils.BlockType defaultSpec) {
        this.atRuleSpec = atRuleSpec;
        this.defaultAtRuleSpec = defaultSpec;
    }

    /**
     * Parses and returns a list of rules, such as at the top level of a stylesheet.
     * Return list has only QualifiedRule's and AtRule's as top level elements.
     *
     * @param tokenList the css content
     * @param topLevel  the relative top level to parse from
     * @param errors    output array for the errors.
     * @return list of rules
     * @throws CssValidationException Css Validation Exception
     */
    public List<Rule> parseAListOfRules(@Nonnull final List<Token> tokenList, final boolean topLevel,
                                        @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        TokenStream tokenStream = new TokenStream(tokenList);
        final List<Rule> rules = new ArrayList<>();

        while (true) {
            tokenStream.consume();
            TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.WHITESPACE) {
                continue;
            } else if (current == TokenType.EOF_TOKEN) {
                return rules;
            } else if (current == TokenType.CDO
                    || current == TokenType.CDC) {
                if (topLevel) {
                    continue;
                }
                this.parseAQualifiedRule(tokenStream, rules, errors);
            } else if (current == TokenType.AT_KEYWORD) {
                rules.add(this.parseAnAtRule(tokenStream, errors));
            } else {
                this.parseAQualifiedRule(tokenStream, rules, errors);
            }
        }
    }

    /**
     * Extracts an atRule from beginning of token stream
     *
     * @param tokenStream the css content to process
     * @param errors      generated from parse job
     * @return an AtRule extracted from the token stream
     * @throws CssValidationException Css Validation Exception
     */
    private AtRule parseAnAtRule(@Nonnull final TokenStream tokenStream,
                                 @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        if (CssTokenUtil.getTokenType(tokenStream.current()) != TokenType.AT_KEYWORD) {
            throw new CssValidationException("Internal Error: parseAnAtRule precondition not met");
        }

        final Token startToken = tokenStream.current();
        final AtRule rule = new AtRule(startToken.toString());
        CssTokenUtil.copyPosTo(startToken, rule);

        while (true) {
            tokenStream.consume();
            final TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.SEMICOLON
                    || current == TokenType.EOF_TOKEN) {
                rule.getPrelude().add(tokenStream.current());
                return rule;
            }
            if (current == TokenType.OPEN_CURLY) {
                rule.getPrelude().add(CssTokenUtil.copyPosTo(tokenStream.current(), new EOFToken()));

                List<Token> contents = extractASimpleBlock(tokenStream, errors);

                switch (this.blockTypeFor(rule)) {
                    case PARSE_AS_RULES: {
                        rule.setRules(this.parseAListOfRules(contents, /* topLevel */ false, errors));
                        break;
                    }
                    case PARSE_AS_DECLARATIONS: {
                        rule.setDeclarations(this.parseAListOfDeclarations(contents, errors));
                        break;
                    }
                    case PARSE_AS_IGNORE: {
                        break;
                    }
                    default: {
                        throw new CssValidationException(
                                "Unrecognized blockType " + this.blockTypeFor(rule));
                    }
                }
                return rule;
            }
            if (!consumeAComponentValue(tokenStream, rule.getPrelude(), /*depth*/0)) {
                final List<String> params = new ArrayList<>();
                params.add("style");
                errors.add((ErrorToken) CssTokenUtil.copyPosTo(tokenStream.current(), new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_EXCESSIVELY_NESTED, params)));
            }
        }

    }

    /**
     * returns a list of Declarations from css content
     *
     * @param tokenList of tokens within a block
     * @param errors    output array for the errors.
     * @return a list of Declarations
     * @throws CssValidationException Css Validation Exception
     */
    public List<Declaration> parseAListOfDeclarations(@Nonnull final List<Token> tokenList, @Nonnull final List<ErrorToken> errors)
            throws CssValidationException {
        final List<Declaration> decls = new ArrayList<>();
        TokenStream tokenStream = new TokenStream(tokenList);
        while (true) {
            tokenStream.consume();
            final TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.WHITESPACE
                    || current == TokenType.SEMICOLON) {
                continue;
            } else if (current == TokenType.EOF_TOKEN) {
                return decls;
            } else if (current == TokenType.AT_KEYWORD) {
                // The CSS3 Parsing spec allows for AT rules inside lists of
                // declarations, but our grammar does not so we deviate a tiny bit here.
                // We consume an AT rule, but drop it and instead push an error token.
                final AtRule atRule = this.parseAnAtRule(tokenStream, errors);
                final List<String> params = new ArrayList<>();
                params.add("style");
                params.add(atRule.getName());
                errors.add((ErrorToken) CssTokenUtil.copyPosTo(atRule, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE, params)));
            } else if (current == TokenType.IDENT) {
                this.parseADeclaration(tokenStream, decls, errors);
            } else {
                final List<String> params = new ArrayList<>();
                params.add("style");

                errors.add((ErrorToken) CssTokenUtil.copyPosTo(tokenStream.current(), new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_DECLARATION,
                        params)));
                tokenStream.reconsume();
                while (!(CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.SEMICOLON
                        || CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.EOF_TOKEN)) {
                    tokenStream.consume();
                    List<Token> dummyTokenList = new ArrayList<>();
                    if (!consumeAComponentValue(tokenStream, dummyTokenList, /*depth*/0)) {

                        errors.add((ErrorToken) CssTokenUtil.copyPosTo(tokenStream.current(), new ErrorToken(
                                ValidatorProtos.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
                                params)));
                    }
                }
            }

        }
    }

    /**
     * Adds one element to either declarations or errors.
     *
     * @param tokenStream  the css tokens to parse
     * @param declarations output array for
     *                     declarations
     * @param errors       output array for the errors.
     * @throws CssValidationException Css Validation Exception
     */
    public void parseADeclaration(@Nonnull final TokenStream tokenStream, @Nonnull final List<Declaration> declarations,
                                  @Nonnull final List<ErrorToken> errors) throws CssValidationException {

        if (CssTokenUtil.getTokenType(tokenStream.current()) != TokenType.IDENT) {
            throw new CssValidationException("Internal Error: parseADeclaration precondition not met");
        }

        Token startToken = tokenStream.current();
        final Declaration decl = (Declaration) CssTokenUtil.copyPosTo(startToken,
                new Declaration(startToken.toString()));

        while (CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.WHITESPACE) {
            tokenStream.consume();
        }

        tokenStream.consume();
        if (!(CssTokenUtil.getTokenType(tokenStream.current()) == TokenType.COLON)) {
            final List<String> params = new ArrayList<>();
            params.add("style");

            errors.add((ErrorToken) CssTokenUtil.copyPosTo(startToken, new ErrorToken(
                    ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INCOMPLETE_DECLARATION,
                    params)));
            tokenStream.reconsume();
            while (
                    !(CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.SEMICOLON
                            || CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.EOF_TOKEN)) {
                tokenStream.consume();
            }
            return;
        }

        while (!(CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.SEMICOLON
                        || CssTokenUtil.getTokenType(tokenStream.next()) == TokenType.EOF_TOKEN)) {
            tokenStream.consume();
            if (!consumeAComponentValue(tokenStream, decl.getValue(), /*depth*/0)) {
                final List<String> params = new ArrayList<>();
                params.add("style");

                errors.add((ErrorToken) CssTokenUtil.copyPosTo(startToken, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_EXCESSIVELY_NESTED,
                        params)));
            }
            decl.getValue().add(CssTokenUtil.copyPosTo(tokenStream.next(), new EOFToken()));

            boolean foundImportant = false;
            for (int i = decl.getValue().size() - 1; i >= 0; i--) {
                if (CssTokenUtil.getTokenType(decl.getValue().get(i)) == TokenType.WHITESPACE) {
                    continue;
                } else if (
                        CssTokenUtil.getTokenType(decl.getValue().get(i)) == TokenType.IDENT
                                && asciiMatch(decl.getValue().get(i), "important")) {
                    foundImportant = true;
                } else if (foundImportant && CssTokenUtil.getTokenType(decl.getValue().get(i)) == TokenType.DELIM
                        && decl.getValue().get(i).getValue().equals("!")) {
                    decl.getValue().subList(i, decl.getValue().size()).clear();
                    decl.setImportant(true);
                    break;
                } else {
                    break;
                }
            }
        }

        declarations.add(decl);
    }

    /**
     * Returns a type telling us how to canonicalize a given AT rule's block.
     *
     * @param atRule
     * @return the block type of an atRule
     */
    private CssSpecUtils.BlockType blockTypeFor(@Nonnull final AtRule atRule) {
        final CssSpecUtils.BlockType maybeBlockType = this.atRuleSpec.get(stripVendorPrefix(atRule.getName()));
        if (maybeBlockType != null) {
            return maybeBlockType;
        } else {
            return this.defaultAtRuleSpec;
        }
    }

    /**
     * Returns a simple block's contents in tokenStream, excluding the
     * start/end grouping token, and appended with an EOFToken.
     *
     * @param tokenStream the token stream of html content
     * @param errors      generated from extraction
     * @return a list of tokens in a block.
     * @throws CssValidationException Css Validation Exception
     */
    private List<Token> extractASimpleBlock(@Nonnull final TokenStream tokenStream,
                                            @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        /** @type {!Array<!parse_css.Token>} */
        final List<Token> consumedTokens = new ArrayList<Token>();
        if (!consumeASimpleBlock(tokenStream, consumedTokens, /*depth*/0)) {
            final List<String> params = new ArrayList<>();
            params.add("style");
            errors.add((ErrorToken) CssTokenUtil.copyPosTo(tokenStream.current(), new ErrorToken(
                    ValidatorProtos.ValidationError.Code.CSS_EXCESSIVELY_NESTED, params)));
        }

        // A simple block always has a start token (e.g. '{') and
        // either a closing token or EOF token.
        if (consumedTokens.size() < 2) {
            throw new CssValidationException("size of consumedTokens less than 2");
        }

        // Exclude the start token. Convert end token to EOF.
        final int end = consumedTokens.size() - 1;
        consumedTokens.set(end, CssTokenUtil.copyPosTo(consumedTokens.get(end), new EOFToken()));
        return consumedTokens.subList(1, consumedTokens.size());
    }

    /**
     * Consumes one or more tokens from a tokenStream, appending them to a
     * tokenList. If exceeds depth, returns false
     *
     * @param tokenStream the stream of token content
     * @param tokenList   output array for tokens.
     * @param depth the depth to check against exceeding
     * @return true iff finished consuming without exceeding depth
     * @throws CssValidationException Css Validation Exception
     */
    public static boolean consumeAComponentValue(@Nonnull final TokenStream tokenStream,
                                                 @Nonnull final List<Token> tokenList,
                                                 final int depth) throws CssValidationException {
        if (depth > K_MAXIMUM_CSS_RECURSION) {
            return false;
        }
        final TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
        if (current == TokenType.OPEN_CURLY
                || current == TokenType.OPEN_SQUARE
                || current == TokenType.OPEN_PAREN) {
            if (!consumeASimpleBlock(tokenStream, tokenList, depth + 1)) {
                return false;
            }
        } else if (current == TokenType.FUNCTION_TOKEN) {
            if (!consumeAFunction(tokenStream, tokenList, depth + 1)) {
                return false;
            }
        } else {
            tokenList.add(tokenStream.current());
        }
        return true;
    }

    /**
     * Appends a function's contents to a tokenList, consuming from the
     * stream all those tokens that it adds to the tokenList, including
     * the function token and end grouping token. If exceeds depth, returns false.
     *
     * @param tokenStream of html document block
     * @param tokenList   output array for tokens.
     * @param depth       to check against exceeding
     * @return true iff depth not exceeded
     * @throws CssValidationException Css Validation Exception
     */
    private static boolean consumeAFunction(@Nonnull final TokenStream tokenStream,
                                            @Nonnull final List<Token> tokenList,
                                            final int depth) throws CssValidationException {
        if (depth > K_MAXIMUM_CSS_RECURSION) {
            return false;
        }
        if (CssTokenUtil.getTokenType(tokenStream.current()) != TokenType.FUNCTION_TOKEN) {
            throw new CssValidationException("Internal Error: consumeAFunction precondition not met");
        }
        tokenList.add(tokenStream.current());
        while (true) {
            tokenStream.consume();
            final TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.EOF_TOKEN
                    || current == TokenType.CLOSE_PAREN) {
                tokenList.add(tokenStream.current());
                return true;
            } else {
                if (!consumeAComponentValue(tokenStream, tokenList, depth + 1)) {
                    return false;
                }
            }
        }
    }

    /**
     * Appends a simple block's contents to a tokenList, consuming from
     * the stream all those tokens that it adds to the tokenList,
     * including the start/end grouping token. If exceeds depth, returns false.
     *
     * @param tokenStream of html document block
     * @param tokenList   output array for tokens.
     * @param depth       to check against exceeding
     * @return true iff depth not exceeded
     * @throws CssValidationException Css Validation Exception
     */
    private static boolean consumeASimpleBlock(@Nonnull final TokenStream tokenStream,
                                               @Nonnull final List<Token> tokenList,
                                               final int depth) throws CssValidationException {
        if (depth > K_MAXIMUM_CSS_RECURSION) {
            return false;
        }
        TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
        if (current != TokenType.OPEN_CURLY
                && current != TokenType.OPEN_SQUARE && current != TokenType.OPEN_PAREN) {
            throw new CssValidationException("Internal Error: consumeASimpleBlock precondition not met");

        }

        final Token startToken = tokenStream.current();
        final String mirror = CssTokenUtil.getMirror(startToken);

        tokenList.add(startToken);
        while (true) {
            tokenStream.consume();
            current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.EOF_TOKEN) {
                tokenList.add(tokenStream.current());
                return true;
            } else if (
                    (current == TokenType.CLOSE_CURLY
                            || current == TokenType.CLOSE_SQUARE
                            || current == TokenType.CLOSE_PAREN)
                            && (tokenStream.current()).toString().equals(mirror)) {
//                            /** @type {parse_css.GroupingToken} */(tokenStream.current()).getValue() ==
//                            mirror) {
                tokenList.add(tokenStream.current());
                return true;
            } else {
                if (!consumeAComponentValue(tokenStream, tokenList, depth + 1)) {
                    return false;
                }
            }
        }
    }

    /**
     * Parses one Qualified rule or ErrorToken appended to either rules or errors
     * respectively. Rule will include a prelude with the CSS selector (if any)
     * and a list of declarations.
     *
     * @param tokenStream input token stream.
     * @param rules       output array for new rule
     * @param errors      output array for new error.
     * @throws CssValidationException Css Validation Exception
     */
    private void parseAQualifiedRule(@Nonnull final TokenStream tokenStream, @Nonnull final List<Rule> rules,
                                     @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        if (CssTokenUtil.getTokenType(tokenStream.current()) == TokenType.EOF_TOKEN
                || CssTokenUtil.getTokenType(tokenStream.current()) == TokenType.AT_KEYWORD) {
            throw new CssValidationException("Internal Error: parseAQualifiedRule precondition not met");
        }

        final QualifiedRule rule = (QualifiedRule) CssTokenUtil.copyPosTo(tokenStream.current(), new QualifiedRule());
        tokenStream.reconsume();
        while (true) {
            tokenStream.consume();
            final TokenType current = CssTokenUtil.getTokenType(tokenStream.current());
            if (current == TokenType.EOF_TOKEN) {
                final List<String> params = new ArrayList<>();
                params.add("style");
                errors.add((ErrorToken) CssTokenUtil.copyPosTo(rule, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE, params)));
                return;
            }
            if (current == TokenType.OPEN_CURLY) {
                rule.getPrelude().add(
                        CssTokenUtil.copyPosTo(tokenStream.current(), new EOFToken()));

                // This consumes declarations (ie: "color: red;" ) inside
                // a qualified rule as that rule's value.
                rule.setDeclarations(this.parseAListOfDeclarations(
                        extractASimpleBlock(tokenStream, errors), errors));

                rules.add(rule);
                return;
            }
//            // This consumes a CSS selector as the rules prelude.
            if (!consumeAComponentValue(tokenStream, rule.getPrelude(), /*depth*/0)) {
                final List<String> params = new ArrayList<>();
                params.add("style");
                errors.add((ErrorToken) CssTokenUtil.copyPosTo(tokenStream.current(),
                        new ErrorToken(ValidatorProtos.ValidationError.Code.CSS_EXCESSIVELY_NESTED, params)));
            }
        }
    }

    @Nonnull
    private final Map<String, CssSpecUtils.BlockType> atRuleSpec;

    @Nonnull
    private final CssSpecUtils.BlockType defaultAtRuleSpec;

}
