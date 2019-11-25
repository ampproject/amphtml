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

package dev.amp.validator.visitor;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.Token;
import dev.amp.validator.css.AtRule;
import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.TokenStream;
import dev.amp.validator.css.TokenType;
import dev.amp.validator.css.Stylesheet;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;
import static dev.amp.validator.css.CssTokenUtil.getTokenType;
import static dev.amp.validator.utils.CssSpecUtils.asciiMatch;

/**
 * A Vistor class to touch media queries.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class MediaQueryVisitor implements RuleVisitor {
    /**
     * Constructor for media query visitor
     * @param mediaTypes the types to validate
     * @param mediaFeatures the features to validate
     * @param errors to populate as media query is visited
     */
    public MediaQueryVisitor(@Nonnull final List<Token> mediaTypes, @Nonnull final List<Token> mediaFeatures,
                             @Nonnull final List<ErrorToken> errors) {
        super();
        this.mediaTypes = mediaTypes;
        this.mediaFeatures = mediaFeatures;
        this.errors = errors;
    }

    /**
     * Visit an AtRule.
     * @param atRule to visit
     */
    @Override
    public void visitAtRule(@Nonnull final AtRule atRule) throws CssValidationException {
        if (!atRule.getName().toLowerCase().equals("media")) {
            return;
        }

        final TokenStream tokenStream = new TokenStream(atRule.getPrelude());
        tokenStream.consume(); // Advance to first token.
        if (!this.parseAMediaQueryList(tokenStream)) {
            final List<String> params = new ArrayList<>();
            params.add("style");
            this.errors.add((ErrorToken) copyPosTo(atRule,
                    new ErrorToken(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_MALFORMED_MEDIA_QUERY,
                    params)));
        }
    }

    /**
     * Maybe consume one whitespace token.
     *
     * @param tokenStream to consume from
     */
    private void maybeConsumeAWhitespaceToken(@Nonnull final TokenStream tokenStream) {
        // While the grammar calls for consuming multiple whitespace tokens,
        // our tokenizer already collapses whitespace so only one token can ever
        // be present.
        if (getTokenType(tokenStream.current()) == TokenType.WHITESPACE) {
            tokenStream.consume();
        }
    }

    /**
     * Parse a media query list.
     *
     * @param tokenStream content to validate
     * @return success of parse job
     * @private
     */
    private boolean parseAMediaQueryList(@Nonnull final TokenStream tokenStream) {
        // https://www.w3.org/TR/css3-mediaqueries/#syntax
        // : S* [media_query [ ',' S* media_query ]* ]?
        // ;
        this.maybeConsumeAWhitespaceToken(tokenStream);
        if (getTokenType(tokenStream.current()) != TokenType.EOF_TOKEN) {
            if (!this.parseAMediaQuery(tokenStream)) {
                return false;
            }
            while (getTokenType(tokenStream.current()) == TokenType.COMMA) {
                tokenStream.consume(); // ','
                this.maybeConsumeAWhitespaceToken(tokenStream);
                if (!this.parseAMediaQuery(tokenStream)) {
                    return false;
                }
            }
        }
        return getTokenType(tokenStream.current()) == TokenType.EOF_TOKEN;
    }

    /**
     * Parse a media query.
     *
     * @param tokenStream content to parse
     * @return true iff parse job is successful
     */
    private boolean parseAMediaQuery(@Nonnull final TokenStream tokenStream) {
        // : [ONLY | NOT]? S* media_type S* [ AND S* expression ]*
        // | expression [ AND S* expression ]*
        // ;
        //
        // Below we parse media queries with this equivalent grammar:
        // : (expression | [ONLY | NOT]? S* media_type S* )
        // [ AND S* expression ]*
        // ;
        //
        // This is more convenient because we know that expressions must start with
        // '(', so it's simpler to use as a check to distinguis the expression case
        // from the media type case.
        if (getTokenType(tokenStream.current()) == TokenType.OPEN_PAREN) {
            if (!this.parseAMediaExpression(tokenStream)) {
                return false;
            }
        } else {
            if (getTokenType(tokenStream.current()) == TokenType.IDENT
                    && (asciiMatch((tokenStream.current()), ("only"))
                    || asciiMatch((tokenStream.current()), ("not")))) {
                tokenStream.consume(); // 'ONLY' | 'NOT'
            }
            this.maybeConsumeAWhitespaceToken(tokenStream);
            if (!this.parseAMediaType(tokenStream)) {
                return false;
            }
            this.maybeConsumeAWhitespaceToken(tokenStream);
        }
        while (getTokenType(tokenStream.current()) == TokenType.IDENT
                && asciiMatch((tokenStream.current()), ("and"))) {
            tokenStream.consume(); // 'AND'
            this.maybeConsumeAWhitespaceToken(tokenStream);
            if (!this.parseAMediaExpression(tokenStream)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Parse a media expression.
     *
     * @param tokenStream content to parse
     * @return true iff parse is successful
     */
    private boolean parseAMediaExpression(@Nonnull final TokenStream tokenStream) {
        //  : '(' S* media_feature S* [ ':' S* expr ]? ')' S*
        //  ;
        if (getTokenType(tokenStream.current()) != TokenType.OPEN_PAREN) {
            return false;
        }
        tokenStream.consume(); // '('
        this.maybeConsumeAWhitespaceToken(tokenStream);
        if (!this.parseAMediaFeature(tokenStream)) {
            return false;
        }
        this.maybeConsumeAWhitespaceToken(tokenStream);
        if (getTokenType(tokenStream.current()) == TokenType.COLON) {
            tokenStream.consume(); // '('
            this.maybeConsumeAWhitespaceToken(tokenStream);
            // The CSS3 grammar at this point just tells us to expect some
            // expr. Which tokens are accepted here are defined by the media
            // feature found above. We don't implement media features here, so
            // we just loop over tokens until we find a CLOSE_PAREN or EOF.
            // While expr in general may have arbitrary sets of open/close parens,
            // it seems that https://www.w3.org/TR/css3-mediaqueries/#media1
            // suggests that media features cannot:
            //
            // "Media features only accept single values: one keyword, one number,
            // or a number with a unit identifier. (The only exceptions are the
            // ‘aspect-ratio’ and ‘device-aspect-ratio’ media features.)
            while (
                    getTokenType(tokenStream.current()) != TokenType.EOF_TOKEN
                            && getTokenType(tokenStream.current()) != TokenType.CLOSE_PAREN) {
                tokenStream.consume();
            }
        }
        if (getTokenType(tokenStream.current()) != TokenType.CLOSE_PAREN) {
            return false;
        }
        tokenStream.consume(); // ')'
        this.maybeConsumeAWhitespaceToken(tokenStream);
        return true;
    }

    /**
     * Parse a media feature.
     *
     * @param tokenStream
     * @return true iff feature parsing is successful
     */
    private boolean parseAMediaFeature(@Nonnull final TokenStream tokenStream) {
        // : IDENT
        // ;
        if (getTokenType(tokenStream.current()) == TokenType.IDENT) {
            this.mediaFeatures.add(
                    /** @type {!parse_css.IdentToken} */(tokenStream.current()));
            tokenStream.consume();
            return true;
        }
        return false;
    }

    /**
     * Parse a media type.
     *
     * @param tokenStream
     * @return true iff media type successfully parsed
     */
    private boolean parseAMediaType(@Nonnull final TokenStream tokenStream) {
        // : IDENT
        // ;
        if (getTokenType(tokenStream.current()) == TokenType.IDENT) {
            this.mediaTypes.add(
                    /** @type {!parse_css.IdentToken} */(tokenStream.current()));
            tokenStream.consume();
            return true;
        }
        return false;
    }


    /**
     * Parses media queries within the provided stylesheet, emitting the set of
     * discovered media types and media features, as well as errors if parsing
     * failed.
     * parsedUrls and errors into errors.
     *
     * @param stylesheet to parse
     * @param mediaTypes found in stylesheet
     * @param mediaFeatures found in stylesheet
     * @param errors discovered during parse
     * @throws CssValidationException css validation exception
     */
    public static void parseMediaQueries(@Nonnull final Stylesheet stylesheet, @Nonnull final List<Token> mediaTypes,
                                         @Nonnull final List<Token> mediaFeatures,
                                         @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        MediaQueryVisitor visitor = new MediaQueryVisitor(mediaTypes, mediaFeatures, errors);
        stylesheet.accept(visitor);
    }

    /** List of media types. */
    @Nonnull
    private final List<Token> mediaTypes;

    /** List of media features. */
    @Nonnull
    private final List<Token> mediaFeatures;

    /** List of token errors. */
    @Nonnull
    private final List<ErrorToken> errors;
}
