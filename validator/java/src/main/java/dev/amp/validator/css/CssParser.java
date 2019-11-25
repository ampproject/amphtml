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
import com.steadystate.css.parser.SACParserCSS3;
import com.steadystate.css.parser.CssCharStream;
import com.steadystate.css.parser.ParseException;
import com.steadystate.css.parser.ListableTokenManager;
import com.steadystate.css.parser.Token;
import com.steadystate.css.parser.TokenMgrError;
import org.w3c.css.sac.CSSParseException;
import org.w3c.css.sac.InputSource;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;

/**
 * A utility to parse css text into a list of tokens.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class CssParser extends SACParserCSS3 {

    /**
     * Constructor.
     *
     * @param cssText the stylesheet data.
     * @param line    line number.
     * @param col     column number.
     * @param errors  the global error token list for css validation errors.
     */
    public CssParser(@Nonnull final String cssText,
                     final int line,
                     final int col,
                     @Nonnull final List<ErrorToken> errors) {
        this.errors = errors;
        setErrorHandler(new CssErrorHandler());
        this.line = line;
        this.col = col;

        /** Initializing the token manager. */
        this.source = new InputSource(new StringReader(cssText));
        final ListableTokenManager manager =
                new ListableTokenManager(new CssCharStream(source.getCharacterStream(), 1, 1));
        ReInit(manager);
    }

    /**
     * Override to handle specific validation errors encountered during tokenization.
     *
     * @param key the type of the exception
     * @param ex  the exception to handle
     * @return a populated CSSParseException
     */
    @Override
    protected CSSParseException toCSSParseException(final String key, @Nonnull final ParseException ex) {
        try {
            // catch CSS_SYNTAX_STRAY_TRAILING_BACKSLASH
            if (ex.currentToken != null && ex.currentToken.next != null
                    && ex.currentToken.next.image != null && ex.currentToken.next.image.equals("\\")) {
                final List<String> params = new ArrayList<>();
                params.add("style");
                this.errors.add((ErrorToken) copyPosTo(ex.currentToken.next, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_STRAY_TRAILING_BACKSLASH,
                        params)));
            }

            // catch CSS_SYNTAX_STRAY_TRAILING_BACKSLASH
            if (ex.currentToken != null && ex.currentToken.next != null
                    && ex.currentToken.next.image != null
                    && (ex.currentToken.next.image.equals("\"") || ex.currentToken.next.image.equals("\'"))) {
                final List<String> params = new ArrayList<>();
                params.add("style");
                this.errors.add((ErrorToken) copyPosTo(ex.currentToken.next, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING,
                        params)));
            }
        } catch (CssValidationException e) {
            /**ignore*/
        }
        return super.toCSSParseException(key, ex);
    }

    @Override
    protected CSSParseException toCSSParseException(final TokenMgrError ex) {
        if (((ListableTokenManager) (this.token_source)).getCurLexState() == 1) {
            final List<String> params = new ArrayList<>();
            params.add("style");

            try {
                this.errors.add((ErrorToken) copyPosTo(this.token, new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_COMMENT,
                        params)));
                ((ListableTokenManager) (this.token_source)).getParsedTokens().add(new EOFToken());
            } catch (CssValidationException e) {
                /**ignore*/
            }
        }
        return super.toCSSParseException(ex);
    }

    /**
     * Generates a list of cssparser Tokens extracted from cssText.
     *
     * @return a list of Tokens found.
     * @throws IOException IO exception.
     */
    public List<Token> tokenize() throws IOException {
        parseStyleSheet(source);
        return ((ListableTokenManager) token_source).getParsedTokens();
    }

    /**
     * Returns the token errors.
     * @return returns the token errors.
     */
    public List<ErrorToken> getErrors() {
        return errors;
    }

    @Nonnull
    private List<ErrorToken> errors;

    /**
     * Line number.
     */
    private int line;

    /**
     * Column number.
     */
    private int col;

    /**
     * Source data.
     */
    private InputSource source;
}
