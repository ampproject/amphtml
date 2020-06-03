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

package com.steadystate.css.parser;

import dev.amp.validator.css.CssTokenUtil;
import dev.amp.validator.css.TokenType;

import java.util.LinkedList;
import java.util.List;

/**
 * A class to extend the default css parser's manager in order to override the next
 * token method to populate a list of tokens.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ListableTokenManager extends SACParserCSS3TokenManager {
    /**
     * Constructor to initialize the list of tokens.
     * @param stream a stream of css text to parse into tokens
     */
    public ListableTokenManager(final CharStream stream) {
        super(stream);
        parsedTokens  = new LinkedList<>();
    }

    /**
     * Store the token in a list of tokens.
     * @return the next token in the css text
     */
    @Override
    public Token getNextToken() {
        Token t = super.getNextToken();
        parsedTokens.add(t);

        return t;
    }

    /**
     * Compress the tail tokens with the input token to produce a single token,
     * by stepping backwards WHITESPACE tokens until an IDENT token is detected.
     */
    public void compressEnd() {
        StringBuilder image = new StringBuilder();
        image.insert(0, parsedTokens.get(parsedTokens.size() - 1).image);
        parsedTokens.pollLast();

        while (parsedTokens.getLast() != null) {
            if (CssTokenUtil.getTokenType(parsedTokens.getLast()) == TokenType.WHITESPACE) {
                image.insert(0, parsedTokens.getLast().image);
                parsedTokens.pollLast();
            } else if (CssTokenUtil.getTokenType(parsedTokens.getLast()) == TokenType.IDENT) {
                image.insert(0, parsedTokens.getLast().image);
                parsedTokens.getLast().image = image.toString();
                parsedTokens.getLast().kind = SACParserCSS3Constants.FUNCTION;
                break;
            }
        }
    }

    /**
     * accessor for current lex state, which informs whether the parser is within a comment
     * @return value of 1 for comment and 0 for css cdata
     */
    public int getCurLexState() {
        return this.curLexState;
    }

    /**
     * Getter for the list of tokens.
     * @return the underlying tokens
     */
    public List<Token> getParsedTokens() {
        return parsedTokens;
    }

    /** The parsed tokens. */
    private LinkedList<Token> parsedTokens;
}
