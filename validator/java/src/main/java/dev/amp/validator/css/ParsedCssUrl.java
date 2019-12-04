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

import javax.annotation.Nonnull;

import static dev.amp.validator.css.TokenType.PARSED_CSS_URL;

/**
 * Used by parse_css.ExtractUrls to return urls it has seen. This represents
 * URLs in CSS such as url(http://foo.com/) and url("http://bar.com/").
 * For this token, line() and col() indicate the position information
 * of the left-most CSS token that's part of the URL. E.g., this would be
 * the URLToken instance or the FunctionToken instance.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedCssUrl extends Token {

    /**
     * Constructor for empty css url
     */
    public ParsedCssUrl() {
        super();

        /**
         * The decoded URL. This string will not contain CSS string escapes,
         * quotes, or similar. Encoding is utf8.
         */
        this.utf8Url = "";
        /**
         * A rule scope, in case the url was encountered within an at-rule.
         * If not within an at-rule, this string is empty.
         */
        this.atRuleScope = "";
    }

    /**
     * Getter for rule scope
     *
     * @return the atRule scope
     */
    @Nonnull
    public String getAtRuleScope() {
        return atRuleScope;
    }

    /**
     * Getter for url
     *
     * @return the url as utf8 string
     */
    @Nonnull
    public String getUtf8Url() {
        return utf8Url;
    }

    /**
     * setter for url
     *
     * @param utf8Url the value to set utf8Url to
     */
    public void setUtf8Url(@Nonnull final String utf8Url) {
        this.utf8Url = utf8Url;
    }

    /**
     * setter for rule scope
     *
     * @param atRuleScope at rule scope to
     */
    public void setAtRuleScope(@Nonnull final String atRuleScope) {
        this.atRuleScope = atRuleScope;
    }

    /**
     * return the token type
     *
     * @return TokenType.PARSED_CSS_URL
     */
    @Override
    public TokenType getTokenType() {
        return PARSED_CSS_URL;
    }

    @Nonnull
    private String atRuleScope;

    @Nonnull
    private String utf8Url;
}
