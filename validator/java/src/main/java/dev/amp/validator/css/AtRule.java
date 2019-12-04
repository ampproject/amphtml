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
 * Object model for @rules of css content.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class AtRule extends Rule {

    /**
     * Constructor.
     * @param name of AtRule
     */
    public AtRule(@Nonnull final String name) {
        super();
        this.rules = new ArrayList<>();
        this.declarations = new ArrayList<>();
        this.prelude = new ArrayList<>();
        this.name = name;
    }

    /**
     * Return type of token.
     *
     * @return TokenType.AT_RULE
     */
    @Override
    public TokenType getTokenType() {
        return TokenType.AT_RULE;
    }

    /**
     * Setter for rules.
     *
     * @param rules to set within at rules
     */
    public void setRules(@Nonnull final List<Rule> rules) {
        this.rules = rules;
    }

    /**
     * Setter for declarations.
     *
     * @param declarations to set within at rules
     */
    public void setDeclarations(@Nonnull final List<Declaration> declarations) {
        this.declarations = declarations;
    }

    /**
     * Getter of name.
     *
     * @return name
     */
    public String getName() {
        if (name.length() > 0) {
            return name.substring(1);
        }

        return name;
    }

    /**
     * Getter for prelude.
     *
     * @return prelude list
     */
    public List<com.steadystate.css.parser.Token> getPrelude() {
        return prelude;
    }

    /**
     * Visit a rule.
     *
     * @param visitor rule visitor.
     */
    @Override
    public void accept(@Nonnull final RuleVisitor visitor) throws CssValidationException {
        visitor.visitAtRule(this);
        for (final Rule rule : this.rules) {
            rule.accept(visitor);
        }
        for (final Declaration declaration : this.declarations) {
            declaration.accept(visitor);
        }
        visitor.leaveAtRule(this);
    }

    @Nonnull
    private List<Rule> rules;

    @Nonnull
    private List<Declaration> declarations;

    @Nonnull
    private final String name;

    @Nonnull
    private List<com.steadystate.css.parser.Token> prelude;
}
