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

import com.steadystate.css.parser.SACParserCSS3Constants;
import com.steadystate.css.parser.Token;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.Map;

/**
 * General utility methods to map token types to token kinds from cssparser library.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class CssTokenUtil {

    /**
     * Default constructor
     */
    private CssTokenUtil() {

    }

    // mapping for tokens that are defined under SACParserCSS3Constants
    private static final Map<Integer, TokenType> KIND_TO_TOKENTYPE;

    // mirror map for grouping tokens
    private static final Map<String, String> REFLECT_TOKEN;

    static {
        KIND_TO_TOKENTYPE = new HashMap<>();
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.S, TokenType.WHITESPACE);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.EOF, TokenType.EOF_TOKEN);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.ATKEYWORD, TokenType.AT_KEYWORD);

        // these are both @ keywords and will be treated the same as other @ keywords
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.MEDIA_SYM, TokenType.AT_KEYWORD);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.FONT_FACE_SYM, TokenType.AT_KEYWORD);

        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.CDC, TokenType.CDC);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.CDO, TokenType.CDO);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.SEMICOLON, TokenType.SEMICOLON);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.LBRACE, TokenType.OPEN_CURLY);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.RBRACE, TokenType.CLOSE_CURLY);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.LSQUARE, TokenType.OPEN_SQUARE);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.RSQUARE, TokenType.CLOSE_SQUARE);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.LROUND, TokenType.OPEN_PAREN);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.RROUND, TokenType.CLOSE_PAREN);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.COLON, TokenType.COLON);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.COMMA, TokenType.COMMA);
        // TODO: verify delim mappings
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.UNKNOWN, TokenType.DELIM);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.ASTERISK, TokenType.DELIM);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.PLUS, TokenType.DELIM);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.MINUS, TokenType.DELIM);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.DOT, TokenType.DELIM);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.TILDE, TokenType.DELIM);

        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.ONLY, TokenType.IDENT);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.NOT, TokenType.IDENT);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.AND, TokenType.IDENT);

        // TODO : check this
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.FUNCTION, TokenType.FUNCTION_TOKEN);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.IDENT, TokenType.IDENT);

        // TODO : verify uri and url are interchangeable for validation
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.URL, TokenType.URL);
        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.URI, TokenType.URL);

        KIND_TO_TOKENTYPE.put(SACParserCSS3Constants.STRING, TokenType.STRING);

        REFLECT_TOKEN = new HashMap<>();
        REFLECT_TOKEN.put("[", "]");
        REFLECT_TOKEN.put("(", ")");
        REFLECT_TOKEN.put("{", "}");

        REFLECT_TOKEN.put("]", "[");
        REFLECT_TOKEN.put(")", "(");
        REFLECT_TOKEN.put("}", "{");
    }


    /**
     * Overloaded method to return a TokenType, given a CSS3 Token
     *
     * @param token of CSS3 Token type
     * @return a TokenType enum value useful to Canonicalizer
     */
    public static TokenType getTokenType(@Nonnull final Token token) {
        return KIND_TO_TOKENTYPE.get(token.kind);
    }

    /**
     * Copies the line / col values of |this| to |other|.
     *
     * @param css3Token is the token to copy location from.
     * @param other     is the value receiving the location values.
     * @return other
     */
    public static dev.amp.validator.css.Token copyPosTo(@Nonnull final Token css3Token,
                                                    @Nonnull final dev.amp.validator.css.Token other) {
        other.setCol(css3Token.beginColumn);
        other.setLine(css3Token.beginLine);

        return other;
    }

    /**
     * Returns a mirroring character for a token with a reflective match
     *
     * @param token of interest.
     * @return the mirroring character
     */
    public static String getMirror(@Nonnull final Token token) {
        return REFLECT_TOKEN.get(token.toString().trim());
    }

}
