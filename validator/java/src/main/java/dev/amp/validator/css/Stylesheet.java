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

import dev.amp.validator.visitor.RuleVisitor;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * Stylesheet object model.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class Stylesheet extends Rule {

    /**
     * Constructor for empty stylesheet
     */
    public Stylesheet() {
        super();
        this.rules = new ArrayList<>();
        this.eof = null;
    }

    /**
     * Process the rules of a stylesheet.
     *
     * @param visitor used to rules of a stylesheet
     * @throws CssValidationException Css Validation Exception
     */
    @Override
    public void accept(@Nonnull final RuleVisitor visitor) throws CssValidationException {
        visitor.visitStylesheet(this);
        for (final Rule rule : this.rules) {
            rule.accept(visitor);
        }
        visitor.leaveStylesheet(this);
    }

    /**
     * Getter for token type returns stylesheet.
     *
     * @return TokenType.STYLESHEET
     */
    @Override
    public TokenType getTokenType() {
        return TokenType.STYLESHEET;
    }

    /**
     * Setter for rules tokens
     *
     * @param rules of stylesheet
     */
    public void setRules(@Nonnull final List<Rule> rules) {
        this.rules = rules;
    }

    /**
     * Setter for eof token of stylesheet
     *
     * @param eof of stylesheet
     */
    public void setEOF(@Nonnull final EOFToken eof) {
        this.eof = eof;
    }

    @Nonnull
    private List<Rule> rules;

    @Nonnull
    private Token eof;
}
