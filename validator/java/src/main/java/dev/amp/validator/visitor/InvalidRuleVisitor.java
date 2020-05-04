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

import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.css.AtRule;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.Declaration;
import dev.amp.validator.Context;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.utils.CssSpecUtils.allowedDeclarationsString;
import static dev.amp.validator.utils.CssSpecUtils.isDeclarationValid;
import static dev.amp.validator.utils.TagSpecUtils.getTagSpecName;
import static dev.amp.validator.utils.CssSpecUtils.stripVendorPrefix;

/**
 * Extension of RuleVisitor used to handle an invalid css rule.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class InvalidRuleVisitor implements RuleVisitor {
    /**
     * Initialize an InvalidRuleVisitor.
     *
     * @param tagSpec to validate against.
     * @param cssSpec to validate against.
     * @param context provides global information related to html validation.
     * @param result  the validation result to populate.
     */
    public InvalidRuleVisitor(@Nonnull final ValidatorProtos.TagSpec tagSpec, @Nonnull final ValidatorProtos.CssSpec cssSpec,
                              @Nonnull final Context context,
                              @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
        super();
        this.tagSpec = tagSpec;
        this.cssSpec = cssSpec;
        this.context = context;
        this.result = result;
    }

    /**
     * Visit an atRule
     *
     * @param atRule to visit
     */
    @Override
    public void visitAtRule(@Nonnull final AtRule atRule) throws CssValidationException {
        if (!isAtRuleValid(this.cssSpec, atRule.getName())) {
            List<String> params = new ArrayList<>();
            params.add(getTagSpecName(this.tagSpec));
            params.add(atRule.getName());
            this.context.addError(
                    ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_AT_RULE,
                    context.getLineCol().getLineNumber() + atRule.getLine(),
                    context.getLineCol().getColumnNumber() + atRule.getCol(),
                    params,
                    "",
                    this.result);
        }
    }

    /**
     * Returns true if the given AT rule is considered valid.
     *
     * @param cssSpec    to validate against
     * @param atRuleName the rule to validate
     * @return true iff rule is valid
     * @throws CssValidationException Css Validation Exception
     */
    public boolean isAtRuleValid(@Nonnull final ValidatorProtos.CssSpec cssSpec,
                                 @Nonnull final String atRuleName) {
      for (final ValidatorProtos.AtRuleSpec atRuleSpec : cssSpec.getAtRuleSpecList()) {
        if (atRuleSpec.getName().equals(stripVendorPrefix(atRuleName))) {
          return true;
        }
      }
      return false;
    }

    /**
     * Touches a Declaration
     *
     * @param declaration to visit
     */
    @Override
    public void visitDeclaration(@Nonnull final Declaration declaration) {
        if (!isDeclarationValid(this.cssSpec, declaration.getName())) {
            final String declarationsStr = allowedDeclarationsString(this.cssSpec);
            if (declarationsStr.equals("")) {
                List<String> params = new ArrayList<>();
                params.add(getTagSpecName(this.tagSpec));
                params.add(declaration.getName());

                this.context.addError(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
                        context.getLineCol().getLineNumber() + declaration.getLine(),
                        context.getLineCol().getColumnNumber() + declaration.getCol(),
                        params,
                        "",
                        this.result);

            } else {
                List<String> params = new ArrayList<>();
                params.add(getTagSpecName(this.tagSpec));
                params.add(declaration.getName());
                params.add(declaration.getName());
                allowedDeclarationsString(this.cssSpec);

                this.context.addError(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_PROPERTY,
                        context.getLineCol().getLineNumber() + declaration.getLine(),
                        context.getLineCol().getColumnNumber() + declaration.getCol(),
                        params,
                        "",
                        this.result);
            }
        }
    }

    /** Tag spec. */
    private final ValidatorProtos.TagSpec tagSpec;

    /** Css spec. */
    private final ValidatorProtos.CssSpec cssSpec;

    /** Context. */
    private final Context context;

    /** Result builder. */
    private final ValidatorProtos.ValidationResult.Builder result;
}
