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
 * The abstract superclass for all tokens.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public abstract class Token extends com.steadystate.css.parser.Token {
    /**
     * Constructor for Token object, sets default location values
     */
    public Token() {
        this.line = 1;
        this.col = 0;
    }

    /**
     * Overwrite from children class to get token type
     * @return the type of the token.
     */
    public abstract TokenType getTokenType();

    /**
     * Setter for line value.
     * @param line the value to set in line.
     */
    public void setLine(final int line) {
        this.line = line;
    }

    /**
     * Setter for Token's column.
     * @param col value to set in column.
     */
    public void setCol(final int col) {
        this.col = col;
    }

    /**
     * Getter for Token's line.
     * @return a String value of the token from parent class Token.
     */
    public int getLine() {
        return line;
    }

    /**
     * Returns value of token.
     * @return a value of the token from parent class Token, most of time is String,
     * few cases will return a list of tokens
     */
    @Override
    public Object getValue() {
        return this.toString();
    }

    /**
     * Returns value column of token.
     * @return a column value from token
     */
    public int getCol() {
        return col;
    }

    @Override
    public String toString() {
        return getTokenType().toString();
    }

    /** Line number. */
    private int line;

    /** Column number. */
    private int col;
}