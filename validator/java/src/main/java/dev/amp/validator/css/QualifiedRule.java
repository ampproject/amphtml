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
 * The abstract superclass for all tokens.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class QualifiedRule extends Rule {

  /**
   * Constructor to initialize empty qualified rule
   */
  public QualifiedRule() {
    super();
    rules = new ArrayList<>();
    prelude = new ArrayList<>();
    declarations = new ArrayList<>();
  }

  /**
   * process a qualified rule through a visitor
   *
   * @param visitor used to process the rule
   */
  @Override
  public void accept(@Nonnull final RuleVisitor visitor) throws CssValidationException {
    visitor.visitQualifiedRule(this);
    for (final Declaration declaration : this.declarations) {
      declaration.accept(visitor);
    }
    visitor.leaveQualifiedRule(this);
  }

  /**
   * return the token type of the qualified rule
   *
   * @return TokenType.QUALIFIED_RULE
   */
  @Override
  public TokenType getTokenType() {
    return TokenType.QUALIFIED_RULE;
  }

  /**
   * Setter for rules
   *
   * @return the list of rules associated with this qualified rule.
   */
  public List<Rule> getRules() {
    return this.rules;
  }

  /**
   * Setter for rules
   *
   * @param rules the rules to initialize to the qualified rule
   */
  public void setRules(@Nonnull final List<Rule> rules) {
    this.rules = rules;
  }

  /**
   * Setter for declarations
   *
   * @param declarations to initialize to the qualified rule
   */
  public void setDeclarations(@Nonnull final List<Declaration> declarations) {
    this.declarations = declarations;
  }

  /**
   * Getter for declarations
   *
   * @return the declarations of the rule
   */
  @Nonnull
  public List<Declaration> getDeclarations() {
    return declarations;
  }

  /**
   * Getter for the prelude
   *
   * @return the prelude of the qualified rule
   */
  public List<com.steadystate.css.parser.Token> getPrelude() {
    return prelude;
  }

  /**
   * concatenate a qualified rule name
   *
   * @return The concatenation of the qualified rule name.
   */
  public String ruleName() {
    @Nonnull String ruleName = "";
    for (int i = 0; i < this.prelude.size(); i++) {
      Token prelude = this.prelude.get(i);
      if (prelude.toString() != null) {
        ruleName += prelude.toString();
      }
    }
    return ruleName;
  }

  @Nonnull
  private List<Rule> rules;

  @Nonnull
  private List<Declaration> declarations;

  @Nonnull
  private List<Token> prelude;
}
