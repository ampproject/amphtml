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

package dev.amp.validator.utils;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.Token;
import dev.amp.validator.visitor.Amp4AdsVisitor;
import dev.amp.validator.visitor.KeyframesVisitor;
import dev.amp.validator.visitor.RuleVisitor;
import dev.amp.validator.visitor.UrlFunctionVisitor;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;
import static dev.amp.validator.css.CssTokenUtil.getTokenType;

import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.TokenType;
import dev.amp.validator.css.Stylesheet;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.ParsedCssUrl;
import dev.amp.validator.css.Canonicalizer;
import dev.amp.validator.css.CssTokenUtil;
import dev.amp.validator.css.EOFToken;

/**
 * Methods to handle Css Spec processing.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class CssSpecUtils {
    /**
     * private constructor
     */
    private CssSpecUtils() {
    }

    /**
     * Returns a Stylesheet object with nested parse_css.Rules.
     * <p>
     * The top level Rules in a Stylesheet are always a series of
     * QualifiedRule's or AtRule's.
     *
     * @param tokenList   the css content as token list
     * @param atRuleSpec  block type rules for
     *                    all CSS AT rules this canonicalizer should handle.
     * @param defaultSpec default block type for types not
     *                    found in atRuleSpec.
     * @param errors      output array for the errors.
     * @return a stylesheet object model
     * @throws CssValidationException css validation exception
     */
    public static Stylesheet parseAStylesheet(@Nonnull final List<Token> tokenList,
                                              @Nonnull final Map<String, BlockType> atRuleSpec,
                                              @Nonnull final BlockType defaultSpec,
                                              @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        final Canonicalizer canonicalizer = new Canonicalizer(atRuleSpec, defaultSpec);
        final Stylesheet stylesheet = new Stylesheet();

        stylesheet.setRules(canonicalizer.parseAListOfRules(tokenList, /* topLevel */ true, errors));
        CssTokenUtil.copyPosTo(tokenList.get(0), stylesheet);
        stylesheet.setEOF((EOFToken) CssTokenUtil.copyPosTo(tokenList.get(tokenList.size() - 1), new EOFToken()));

        return stylesheet;
    }

    /**
     * Extracts the URLs within the provided stylesheet, emitting them into
     * parsedUrls and errors into errors.
     *
     * @param stylesheet to parse urls from
     * @param parsedUrls urls found in stylesheet
     * @param errors     collection of tokens to populate
     * @throws CssValidationException css validation exception
     */
    public static void extractUrls(@Nonnull final Stylesheet stylesheet, @Nonnull final List<ParsedCssUrl> parsedUrls,
                                   @Nonnull final List<ErrorToken> errors) throws CssValidationException {

        final int parsedUrlsOldLength = parsedUrls.size();
        final int errorsOldLength = errors.size();
        final UrlFunctionVisitor visitor = new UrlFunctionVisitor(parsedUrls, errors);
        stylesheet.accept(visitor);
        // If anything went wrong, delete the urls we've already emitted.
        if (errorsOldLength != errors.size()) {
            parsedUrls.subList(parsedUrlsOldLength, parsedUrls.size()).clear();
        }
    }

    /**
     * Strips vendor prefixes from identifiers, e.g. property names or names
     * of at rules. E.g., "-moz-keyframes" to "keyframes".
     *
     * @param prefixedString string with prefix
     * @return input string less the prefix component
     */
    public static String stripVendorPrefix(@Nonnull final String prefixedString) {
        // Checking for '-' is an optimization.
        if (!prefixedString.equals("") && prefixedString.charAt(0) == '-') {
            if (prefixedString.startsWith("-o-")) {
                return prefixedString.substring("-o-".length());
            }
            if (prefixedString.startsWith("-moz-")) {
                return prefixedString.substring("-moz-".length());
            }
            if (prefixedString.startsWith("-ms-")) {
                return prefixedString.substring("-ms-".length());
            }
            if (prefixedString.startsWith("-webkit-")) {
                return prefixedString.substring("-webkit-".length());
            }
        }
        return prefixedString;
    }

    /**
     * Strips 'min-' or 'max-' from the start of a media feature identifier, if
     * present. E.g., "min-width" to "width".
     *
     * @param prefixedString the string with a prefix
     * @return the prefix-stripped string
     */
    public static String stripMinMax(@Nonnull final String prefixedString) {
        if (prefixedString.startsWith("min-")) {
            return prefixedString.substring("min-".length());
        }
        if (prefixedString./*OK*/ startsWith("max-")) {
            return prefixedString.substring("max-".length());
        }
        return prefixedString;
    }

    /**
     * @param token value to match
     * @param str   to match against
     * @return true iff ascii value of token and string match
     */
    public static boolean asciiMatch(@Nonnull final Token token, @Nonnull final String str) {
        return token.toString().toLowerCase().equals(str.toLowerCase());
    }


    /**
     * validate the keyframes of css content
     *
     * @param styleSheet to validate
     * @param errors     generated from css parsing
     * @throws CssValidationException css validation exception
     */
    public static void validateKeyframesCss(@Nonnull final Stylesheet styleSheet,
                                            @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        final RuleVisitor visitor = new KeyframesVisitor(errors);
        styleSheet.accept(visitor);

    }

    /**
     * validate a css document against amp4ads specs
     *
     * @param styleSheet to validate
     * @param errors     generated from css parsing
     * @throws CssValidationException css validation exception
     */
    public static void validateAmp4AdsCss(@Nonnull final Stylesheet styleSheet,
                                          @Nonnull final List<ErrorToken> errors) throws CssValidationException {
        final RuleVisitor visitor = new Amp4AdsVisitor(errors);
        styleSheet.accept(visitor);
    }

    /**
     * Returns true if the given Declaration is considered valid.
     *
     * @param cssSpec         the css spec of interest.
     * @param declarationName the declaration to query for in the css spec.
     * @return true iff the declaration is found in scc spec's allowed declarations
     */
    public static boolean isDeclarationValid(@Nonnull final ValidatorProtos.CssSpec cssSpec, @Nonnull final String declarationName) {
        if (cssSpec.getDeclarationList().size() == 0) {
            return true;
        }
        return cssSpec.getDeclarationList().indexOf(stripVendorPrefix(declarationName)) > -1;
    }

    /**
     * Returns a string of the allowed Declarations.
     *
     * @param cssSpec of interest
     * @return a string representation of allowed declarations
     */
    public static String allowedDeclarationsString(@Nonnull final ValidatorProtos.CssSpec cssSpec) {
        if (cssSpec.getDeclarationList().size() > MAX_NUM_ALLOWED_DECLARATIONS) {
            return "";
        }
        return "[\'" + String.join("\', \'", cssSpec.getDeclarationList()) + "\']";
    }

    /**
     * Parses a CSS URL token; typically takes the form "url(http://foo)".
     * Preconditions: tokens[token_idx] is a URL token
     * and token_idx + 1 is in range.
     *
     * @param tokens   to parse
     * @param tokenIdx starting index from tokens
     * @param parsed   ParsedCssUrl to populate
     * @throws CssValidationException css validation exception
     */
    public static void parseUrlToken(@Nonnull final List<Token> tokens, final int tokenIdx,
                                     @Nonnull final ParsedCssUrl parsed) throws CssValidationException {
        if (tokenIdx + 1 >= tokens.size()) {
            throw new CssValidationException("Url token not within range of tokens");
        }
        final Token token = tokens.get(tokenIdx);

        if (getTokenType(token) != TokenType.URL) {
            throw new CssValidationException("Url token not within range of tokens");
        }

        copyPosTo(token, parsed);
        parsed.setUtf8Url(token.toString());
    }

    /**
     * Parses a CSS function token named 'url', including the string and closing
     * paren. Typically takes the form "url('http://foo')".
     * Returns the token_idx past the closing paren, or -1 if parsing fails.
     * Preconditions: tokens[token_idx] is a URL token
     * and tokens[token_idx].StringValue() == "url"
     *
     * @param tokens   to validate
     * @param tokenIdx index to start from
     * @param parsed   ParsedCssUrl object to populate
     * @return the token_idx past the closing paren, or -1 if parsing fails.
     * @throws CssValidationException css validation exception
     */
    public static int parseUrlFunction(@Nonnull final List<Token> tokens, int tokenIdx,
                                       @Nonnull final ParsedCssUrl parsed) throws CssValidationException {
        final Token token = tokens.get(tokenIdx);

        if (getTokenType(token) != TokenType.FUNCTION_TOKEN) {
            throw new CssValidationException("Token at index is not a function token");
        }

        if (!token.toString().equals("url(")) {
            throw new CssValidationException("Token value is not url");
        }

        if (getTokenType(tokens.get(tokens.size() - 1)) != TokenType.EOF_TOKEN) {
            throw new CssValidationException("Last token is not EOF token");
        }

        copyPosTo(token, parsed);
        tokenIdx++; // We've digested the function token above.
        // Safe: tokens ends w/ EOF_TOKEN.
        if (tokenIdx >= tokens.size()) {
            throw new CssValidationException("Index outside of tokens range");
        }

        // Consume optional whitespace.
        while (getTokenType(tokens.get(tokenIdx)) == TokenType.WHITESPACE) {
            tokenIdx++;
            // Safe: tokens ends w/ EOF_TOKEN.
            if (tokenIdx >= tokens.size()) {
                throw new CssValidationException("Index outside of tokens range");
            }
        }

        // Consume URL.
        if (getTokenType(tokens.get(tokenIdx)) != TokenType.STRING) {
            return -1;
        }
        parsed.setUtf8Url((tokens.get(tokenIdx).toString()));

        tokenIdx++;
        // Safe: tokens ends w/ EOF_TOKEN.
        if (tokenIdx >= tokens.size()) {
            throw new CssValidationException("token index outside of tokens range");
        }

        // Consume optional whitespace.
        while (getTokenType(tokens.get(tokenIdx)) == TokenType.WHITESPACE) {
            tokenIdx++;
            // Safe: tokens ends w/ EOF_TOKEN.
            if (tokenIdx >= tokens.size()) {
                throw new CssValidationException("token index outside of tokens range");
            }
        }

        // Consume ')'
        if (getTokenType(tokens.get(tokenIdx)) != TokenType.CLOSE_PAREN) {
            return -1;
        }
        return tokenIdx + 1;
    }

    /**
     * Parse inline style content into Declaration objects.
     *
     * @param tokenList the css content in a list of tokens.
     * @param errors    output array for the errors.
     * @return Returns a array of Declaration objects.
     * @throws CssValidationException Css Validation Exception
     */
    public static List<Declaration> parseInlineStyle(@Nonnull final List<Token> tokenList,
                                                     @Nonnull final List<ErrorToken> errors)
            throws CssValidationException {
        final Canonicalizer canonicalizer =
                new Canonicalizer(new HashMap<String, BlockType>(),
                        BlockType.PARSE_AS_DECLARATIONS);
        return canonicalizer.parseAListOfDeclarations(tokenList, errors);
    }

    /** Max number of allowed declarations. */
    private static final int MAX_NUM_ALLOWED_DECLARATIONS = 5;

  /**
   * Enum describing how to parse the rules inside a CSS AT Rule.
   *
   */
  public enum BlockType {
    /** Parse this simple block as a list of rules (Either Qualified Rules or AT Rules) */
    PARSE_AS_RULES,
    /** Parse this simple block as a list of declarations */
    PARSE_AS_DECLARATIONS,
    /** Ignore this simple block, do not parse. This is generally used
     in conjunction with a later step emitting an error for this rule. */
    PARSE_AS_IGNORE,
  }
}
