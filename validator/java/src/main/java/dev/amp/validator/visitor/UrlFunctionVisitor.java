package dev.amp.validator.visitor;

import dev.amp.validator.ValidatorProtos;
import com.steadystate.css.parser.Token;
import dev.amp.validator.css.AtRule;
import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.TokenType;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.ParsedCssUrl;
import dev.amp.validator.css.QualifiedRule;


import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;
import static dev.amp.validator.css.CssTokenUtil.getTokenType;
import static dev.amp.validator.utils.CssSpecUtils.parseUrlFunction;
import static dev.amp.validator.utils.CssSpecUtils.parseUrlToken;

/**
 * Helper class for implementing extractUrls.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class UrlFunctionVisitor implements RuleVisitor {
    /**
     * @param parsedUrls a list of urls found in css parse
     * @param errors     to populate with css validation errors
     */
    public UrlFunctionVisitor(@Nonnull final List<ParsedCssUrl> parsedUrls, @Nonnull final List<ErrorToken> errors) {
        super();

        this.parsedUrls = parsedUrls;
        this.errors = errors;
        this.atRuleScope = "";
    }

    /**
     * Visit an AtRule.
     *
     * @param atRule to visit
     */
    @Override
    public void visitAtRule(@Nonnull final AtRule atRule) {
        this.atRuleScope = atRule.getName();
    }

    /**
     * Leave an AtRule.
     *
     * @param atRule AtRule to leave
     */
    @Override
    public void leaveAtRule(@Nonnull final AtRule atRule) {
        this.atRuleScope = "";
    }

    /**
     * Visit a qualified rule.
     *
     * @param qualifiedRule to visit
     */
    @Override
    public void visitQualifiedRule(@Nonnull final QualifiedRule qualifiedRule) {
        this.atRuleScope = "";
    }

    /**
     * Visit a declaration rule.
     *
     * @param declaration to visit
     * @throws CssValidationException Css Validation Exception
     */
    public void visitDeclaration(@Nonnull final Declaration declaration) throws CssValidationException {
        if (declaration.getValue().size() <= 0) {
            throw new CssValidationException("Invalid declaration size");
        }

        if (getTokenType(declaration.getValue().get(declaration.getValue().size() - 1)) != TokenType.EOF_TOKEN) {
            throw new CssValidationException("Last Token is not EOF");
        }

        for (int ii = 0; ii < declaration.getValue().size() - 1;) {
            Token token = declaration.getValue().get(ii);
            if (getTokenType(token) == TokenType.URL) {
                final ParsedCssUrl parsedUrl = new ParsedCssUrl();
                parseUrlToken(declaration.getValue(), ii, parsedUrl);
                parsedUrl.setAtRuleScope(this.atRuleScope);
                this.parsedUrls.add(parsedUrl);
                ii++;
                continue;
            }
            if (getTokenType(token) == TokenType.FUNCTION_TOKEN && (token).toString().equals("url(")) {
                final ParsedCssUrl parsedUrl = new ParsedCssUrl();
                ii = parseUrlFunction(declaration.getValue(), ii, parsedUrl);
                if (ii == -1) {
                    List<String> params = new ArrayList<>();
                    params.add("style");
                    this.errors.add((ErrorToken) copyPosTo(token, new ErrorToken(
                            ValidatorProtos.ValidationError.Code.CSS_SYNTAX_BAD_URL, params)));
                    return;
                }
                parsedUrl.setAtRuleScope(this.atRuleScope);
                this.parsedUrls.add(parsedUrl);
                continue;
            }
            // It's neither a url token nor a function token named url. So, we skip.
            ii++;
        }
    }

    /** AT rule scope. */
    @Nonnull
    private String atRuleScope;

    /** List of error token. */
    @Nonnull
    private final List<ErrorToken> errors;

    /** List of parsed css urls. */
    @Nonnull
    private final List<ParsedCssUrl> parsedUrls;
}
