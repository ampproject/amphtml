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

/**
 * Token enumeration types.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public enum TokenType {
    /** EOF_TOKEN */
    EOF_TOKEN,
    /** PARSED_CSS_URL */
    PARSED_CSS_URL,
    /** WHITESPACE */
    WHITESPACE,
    /** CDO */
    CDO,
    /** CDC */
    CDC,
    /** AT_KEYWORD */
    AT_KEYWORD,
    /** SEMICOLON */
    SEMICOLON,
    /** OPEN_CURLY */
    OPEN_CURLY,
    /** CLOSE_CURLY */
    CLOSE_CURLY,
    /** OPEN_SQUARE */
    OPEN_SQUARE,
    /** CLOSE_SQUARE */
    CLOSE_SQUARE,
    /** OPEN_PAREN */
    OPEN_PAREN,
    /** CLOSE_PAREN */
    CLOSE_PAREN,
    /** FUNCTION_TOKEN */
    FUNCTION_TOKEN,
    /** IDENT */
    IDENT,
    /** COLON */
    COLON,
    /** COMMA */
    COMMA,
    /** STYLESHEET */
    STYLESHEET,
    /** QUALIFIED_RULE */
    AT_RULE,
    /** QUALIFIED_RULE */
    QUALIFIED_RULE,
    /** DECLARATION */
    DECLARATION,
    /** UNKNOWN */
    UNKNOWN,
    /** DELIM */
    DELIM,
    /** URL */
    URL,
    /** STRING */
    STRING,
    /** ERROR */
    ERROR,
}