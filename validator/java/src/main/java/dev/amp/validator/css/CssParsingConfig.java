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

import amp.validator.Validator;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.Map;

/**
 * This class holds the CSS parsing configuration.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class CssParsingConfig {

    /**
     * Constructor for CssParsingConfig.
     *
     * @param atRuleSpec  the AtRule spec to validate against
     * @param defaultSpec the default blocktype to validate for
     */
    public CssParsingConfig(@Nonnull final Map<String, Validator.AtRuleSpec.BlockType> atRuleSpec,
                            @Nonnull final Validator.AtRuleSpec.BlockType defaultSpec) {
        // TODO: atRuleSpec could be split into a string and BlockType, as the map is only ever size = 1
        this.atRuleSpec = atRuleSpec;
        this.defaultSpec = defaultSpec;
    }

    /**
     * Generates a CssParsingConfig from a CssSpec.
     *
     * @param cssSpec to extract validator parameters from
     * @return a CssParsingConfig representing the CssSpec
     * @throws CssValidationException Css Validation Exception
     */
    public static CssParsingConfig computeCssParsingConfig(@Nonnull final Validator.CssSpec cssSpec)
            throws CssValidationException {
        final Map<String, Validator.AtRuleSpec.BlockType> ampAtRuleParsingSpec = new HashMap<>();
        for (final Validator.AtRuleSpec atRuleSpec : cssSpec.getAtRuleSpecList()) {
            if (atRuleSpec.getType() == Validator.AtRuleSpec.BlockType.PARSE_AS_ERROR
                    || (atRuleSpec.getType() == Validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE)) {
                ampAtRuleParsingSpec.put(atRuleSpec.getName(), Validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE);
            } else if (atRuleSpec.getType() == Validator.AtRuleSpec.BlockType.PARSE_AS_RULES) {
                ampAtRuleParsingSpec.put(atRuleSpec.getName(), Validator.AtRuleSpec.BlockType.PARSE_AS_RULES);
            } else if (atRuleSpec.getType() == Validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS) {
                ampAtRuleParsingSpec.put(atRuleSpec.getName(), Validator.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
            } else {
                throw new CssValidationException("Unrecognized atRuleSpec type: " + atRuleSpec.getType());
            }
        }
        final CssParsingConfig config =
                new CssParsingConfig(ampAtRuleParsingSpec, Validator.AtRuleSpec.BlockType.PARSE_AS_IGNORE);

        if (cssSpec.getAtRuleSpecList().size() > 0) {
            config.setDefaultSpec(ampAtRuleParsingSpec.get("$DEFAULT"));
        }
        return config;
    }

  /**
     * Getter for underlying AtRule spec.
     *
     * @return the AtRule spec
     */
    public Map<String, Validator.AtRuleSpec.BlockType> getAtRuleSpec() {
        return this.atRuleSpec;
    }

    /**
     * Getter for underlying default spec default spec.
     *
     * @return the default spec blocktype
     */
    public Validator.AtRuleSpec.BlockType getDefaultSpec() {
        return this.defaultSpec;
    }

    /**
     * Setter for underlying default spec blocktype spec.
     *
     * @param defaultSpec the value to set default spec to.
     */
    public void setDefaultSpec(@Nonnull final Validator.AtRuleSpec.BlockType defaultSpec) {
        this.defaultSpec = defaultSpec;
    }

    /** Default block type. */
    @Nonnull
    private Validator.AtRuleSpec.BlockType defaultSpec;

    /** AtRuleSpec map. */
    @Nonnull
    private Map<String, Validator.AtRuleSpec.BlockType> atRuleSpec;
}
