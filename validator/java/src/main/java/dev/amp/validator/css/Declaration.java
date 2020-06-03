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

import com.steadystate.css.parser.Token;
import dev.amp.validator.visitor.RuleVisitor;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * Object model for a declaration used to define css.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class Declaration extends Rule {

    /**
     * Constructor of Declaration
     *
     * @param name to set for this declaration
     */
    public Declaration(@Nonnull final String name) {
        super();
        this.name = name;
        this.value = new ArrayList<>();
        this.important = false;
    }

    /**
     * Process a Declaration with a visitor
     *
     * @param visitor a rule visitor object used to access a declaration
     * @throws CssValidationException Css Validation Exception
     */
    @Override
    public void accept(@Nonnull final RuleVisitor visitor) throws CssValidationException {
        visitor.visitDeclaration(this);
        visitor.leaveDeclaration(this);
    }

    /**
     * Getter for token type
     *
     * @return the type of the token (declaration)
     */
    @Override
    public TokenType getTokenType() {
        return TokenType.DECLARATION;
    }


    /**
     * For a declaration, if the first non-whitespace token is an identifier,
     * returns its string value. Otherwise, returns the empty string.
     *
     * @return value of first non-whitespace identifier or empty string
     */
    public String firstIdent() {
        if (this.value.size() == 0) {
            return "";
        }

        if (CssTokenUtil.getTokenType(this.value.get(0)) == TokenType.IDENT) {
            return this.value.get(0).toString();
        }
        if (this.value.size() >= 2
                && (CssTokenUtil.getTokenType(this.value.get(0)) == TokenType.WHITESPACE)
                && CssTokenUtil.getTokenType(this.value.get(1)) == TokenType.IDENT) {
            return this.value.get(1).toString();
        }
        return "";
    }

    /**
     * Getter for contents of declaration
     *
     * @return the value of Declaration as a list of its contents
     */
    @Override
    public List<Token> getValue() {
        return value;
    }

    /**
     * Getter for contents of name of declaration
     *
     * @return the name of a declaration
     */
    @Nonnull
    public String getName() {
        return name;
    }

    /**
     * Getter for important value
     *
     * @return the target value of important flag
     */
    public boolean getImportant() {
        return this.important;
    }

    /**
     * @param important the target value of important
     *                  Setter for importance of declaration
     */
    public void setImportant(final boolean important) {
        this.important = important;
    }

    /**
     * if this is an "important" element
     */
    private boolean important;

    @Nonnull
    private final String name;

    @Nonnull
    private final List<Token> value;
}
