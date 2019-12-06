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
import dev.amp.validator.css.TokenType;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.QualifiedRule;


import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;
import static dev.amp.validator.css.CssTokenUtil.getTokenType;
import static dev.amp.validator.utils.CssSpecUtils.stripVendorPrefix;

/**
 * A visitor class extension to handle amp4ads validation of css tokens.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class Amp4AdsVisitor implements RuleVisitor {
    /**
     * Constructor.
     *
     * @param errors to populate upon error encountered
     */
    public Amp4AdsVisitor(@Nonnull final List<ErrorToken> errors) {
        super();
        this.errors = errors;
        this.inKeyframes = null;
    }

    /**
     * Visit a declaration.
     *
     * @param declaration to populate upon error encountered
     * @throws CssValidationException Css Validation Exception
     */
    public void visitDeclaration(@Nonnull final Declaration declaration) throws CssValidationException {
        // position:fixed and position:sticky are disallowed.
        if (declaration.getName().equals("position")) {
            return;
        }

        final String ident = firstIdent(declaration.getValue());
        if (ident.equals("fixed") || ident.equals("sticky")) {
            List<String> params = new ArrayList<>();
            params.add("style");
            params.add("position");
            params.add(ident);
            this.errors.add(createParseErrorTokenAt(
                    declaration,
                    ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
                    params));
        }
    }

    /**
     * Visit a qualified rule.
     *
     * @param qualifiedRule to validate
     * @throws CssValidationException Css Validation Exception
     */
    @Override
    public void visitQualifiedRule(@Nonnull final QualifiedRule qualifiedRule) throws CssValidationException {
        for (final Declaration decl : qualifiedRule.getDeclarations()) {
            final String name = stripVendorPrefix(decl.getName());
            // The name of the property may identify a transition. The only
            // properties that may be transitioned are opacity and transform.
            if (name.equals("transition")) {
                final String transitionedProperty = firstIdent(decl.getValue());
                final String transitionedPropertyStripped = stripVendorPrefix(transitionedProperty);
                if (!transitionedPropertyStripped.equals("opacity")
                        && !transitionedPropertyStripped.equals("transform")) {
                    final List<String> params = new ArrayList<>();
                    params.add("style");
                    params.add("transition");
                    params.add(transitionedProperty);
                    params.add("[\'opacity\', \'transform\']");
                    this.errors.add(createParseErrorTokenAt(
                            decl,
                            ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT,
                            params));
                }
            }
            // This is the @keyframes variant for identifying transitions;
            // the only properties that may be specified within a transition
            // are opacity, transform, and animation-timing-function.
            if (this.inKeyframes != null && !name.equals("transform")
                    && !name.equals("opacity") && !name.equals("animation-timing-function")) {
                List<String> params = new ArrayList<>();
                params.add("style");
                params.add(decl.getName());
                params.add(this.inKeyframes.getName());
                params.add("[\'animation-timing-function\', \'opacity\', \'transform\']");

                this.errors.add(createParseErrorTokenAt(
                        decl,
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE,
                        params));
            }
        }
    }

    /**
     * Visit a rule.
     *
     * @param atRule to process
     */
    @Override
    public void visitAtRule(@Nonnull final AtRule atRule) {
        if (stripVendorPrefix(atRule.getName()).equals("keyframes")) {
            this.inKeyframes = atRule;
        } else {
            this.inKeyframes = null;
        }
    }

    /**
     * Leave an atRule.
     *
     * @param atRule unnecessary, must exist in method pattern
     */
    @Override
    public void leaveAtRule(@Nonnull final AtRule atRule) {
        this.inKeyframes = null;
    }

    /**
     * For a list of |tokens|, if the first non-whitespace token is an identifier,
     * returns its string value. Otherwise, returns the empty string.
     *
     * @param tokens
     * @return a string value.
     */
    private static String firstIdent(@Nonnull final List<Token> tokens) {
        if (tokens.size() == 0) {
            return "";
        }
        if (getTokenType(tokens.get(0)) == TokenType.IDENT) {
            return (String) (tokens.get(0)).getValue();
        }
        if (tokens.size() >= 2
                && (getTokenType(tokens.get(0)) == TokenType.WHITESPACE)
                && getTokenType(tokens.get(1)) == TokenType.IDENT) {
            return (String) (tokens.get(1)).getValue();
        }
        return "";
    }

    /**
     * Fills an ErrorToken with the provided position, code, and params.
     *
     * @param positionToken token generating an error
     * @param code          the code to populate error with
     * @param params        the error params to report
     * @return the error list
     * @throws CssValidationException Css Validation Exception
     */
    public static ErrorToken createParseErrorTokenAt(@Nonnull final Token positionToken,
                                                     @Nonnull final ValidatorProtos.ValidationError.Code code,
                                                     @Nonnull final List<String> params) throws CssValidationException {
        ErrorToken token = new ErrorToken(code, params);
        copyPosTo(positionToken, token);
        return token;
    }

    @Nonnull
    private final List<ErrorToken> errors;

    @Nonnull
    private AtRule inKeyframes;
}
