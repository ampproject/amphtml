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

import dev.amp.validator.ValidatorProtos;

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
    public CssParsingConfig(@Nonnull final Map<String, ValidatorProtos.AtRuleSpec.BlockType> atRuleSpec,
                            @Nonnull final ValidatorProtos.AtRuleSpec.BlockType defaultSpec) {
        // TODO: atRuleSpec could be split into a string and BlockType, as the map is only ever size = 1
        this.atRuleSpec = atRuleSpec;
        this.defaultSpec = defaultSpec;
    }

    /**
     * Generates a CssParsingConfig from a CssSpec.
     *
     * @return a CssParsingConfig representing the CssSpec
     */
    public static CssParsingConfig computeCssParsingConfig() {
      final Map<String, ValidatorProtos.AtRuleSpec.BlockType> ampAtRuleParsingSpec = new HashMap<>();
      ampAtRuleParsingSpec.put("font-face", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
      ampAtRuleParsingSpec.put("keyframes", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_RULES);
      ampAtRuleParsingSpec.put("media", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_RULES);
      ampAtRuleParsingSpec.put("page", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_DECLARATIONS);
      ampAtRuleParsingSpec.put("supports", ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_RULES);

      final CssParsingConfig config =
        new CssParsingConfig(ampAtRuleParsingSpec, ValidatorProtos.AtRuleSpec.BlockType.PARSE_AS_IGNORE);

      return config;
    }

  /**
     * Getter for underlying AtRule spec.
     *
     * @return the AtRule spec
     */
    public Map<String, ValidatorProtos.AtRuleSpec.BlockType> getAtRuleSpec() {
        return this.atRuleSpec;
    }

    /**
     * Getter for underlying default spec default spec.
     *
     * @return the default spec blocktype
     */
    public ValidatorProtos.AtRuleSpec.BlockType getDefaultSpec() {
        return this.defaultSpec;
    }

    /**
     * Setter for underlying default spec blocktype spec.
     *
     * @param defaultSpec the value to set default spec to.
     */
    public void setDefaultSpec(@Nonnull final ValidatorProtos.AtRuleSpec.BlockType defaultSpec) {
        this.defaultSpec = defaultSpec;
    }

    /** Default block type. */
    @Nonnull
    private ValidatorProtos.AtRuleSpec.BlockType defaultSpec;

    /** AtRuleSpec map. */
    @Nonnull
    private Map<String, ValidatorProtos.AtRuleSpec.BlockType> atRuleSpec;
}
