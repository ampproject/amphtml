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

package dev.amp.validator.visitor;

import dev.amp.validator.css.AtRule;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.Stylesheet;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.css.QualifiedRule;

import javax.annotation.Nonnull;

/**
 * A visitor model implementation for rules to implement.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public interface RuleVisitor {
    /**
     * Visit a Stylesheet.
     * @param stylesheet to visit
     */
    default void visitStylesheet(@Nonnull Stylesheet stylesheet) {
    }

    /**
     * Leave a Stylesheet.
     * @param stylesheet to leave
     */
    default void leaveStylesheet(@Nonnull Stylesheet stylesheet) {
    }

    /**
     * Visit an AtRule.
     * @param atRule to visit
     * @throws CssValidationException Css Validation Exception
     */
    default void visitAtRule(@Nonnull AtRule atRule) throws CssValidationException {
    }

    /**
     * Leave an AtRule.
     * @param atRule to leave
     */
    default void leaveAtRule(@Nonnull AtRule atRule) {
    }

    /**
     * Visit a QualifiedRule.
     * @param qualifiedRule to visit
     * @throws CssValidationException Css Validation Exception
     */
    default void visitQualifiedRule(@Nonnull QualifiedRule qualifiedRule) throws CssValidationException {
    }

    /**
     * Leave a qualified rule.
     * @param qualifiedRule to leave
     */
    default void leaveQualifiedRule(@Nonnull QualifiedRule qualifiedRule) {
    }

    /**
     * Visit a declaration.
     * @param declaration to visit
     * @throws CssValidationException Css Validation Exception
     */
    default void visitDeclaration(@Nonnull Declaration declaration) throws CssValidationException {
    }

    /**
     * Leave a declaration.
     * @param declaration to leave
     */
    default void leaveDeclaration(@Nonnull Declaration declaration) {
    }
}
