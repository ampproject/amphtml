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

package dev.amp.validator;

import dev.amp.validator.utils.AttributeSpecUtils;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This wrapper class provides access to an AttrSpec and an attribute id which is unique within its context
 * (e.g., it's unique within the ParsedTagSpec).
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedAttrSpec {
    /**
     * Constructor.
     * @param attrSpec the AttrSpec.
     * @param attrName attr name.
     */
    public ParsedAttrSpec(@Nonnull final ValidatorProtos.AttrSpec attrSpec, final String attrName) {
        this.spec = attrSpec;
        this.attrName = attrName;
        this.valueUrlSpec = null;
        this.valueProperties = null;
        this.cssDeclarationByName = new HashMap<>();

        for (final ValidatorProtos.CssDeclaration cssDeclaration : attrSpec.getCssDeclarationList()) {
            if (cssDeclaration.getName() != null) {
                this.cssDeclarationByName.put(cssDeclaration.getName(), cssDeclaration);
            }
        }
    }

    /**
     * Returns unique name for this attr spec.
     * @return returns unique name for this attr spec.
     */
    public String getAttrName() {
        return this.attrName;
    }

    /**
     * Returns the AttrSpec.
     * @return returns this AttrSpec.
     */
    public ValidatorProtos.AttrSpec getSpec() {
        return this.spec;
    }

    /**
     * Returns the ParsedUrlSpec.
     * @return returns the ParsedUrlSpec.
     */
    public ParsedUrlSpec getValueUrlSpec() {
        if (this.valueUrlSpec == null) {
            this.valueUrlSpec = new ParsedUrlSpec(this.spec.getValueUrl());
        }
        return this.valueUrlSpec;
    }

    /**
     * Returns the ParsedValueProperties.
     * @return returns the ParsedValueProperties.
     */
    public ParsedValueProperties getValuePropertiesOrNull() {
        if (!this.spec.hasValueProperties()) {
            return null;
        }

        if (this.valueProperties == null) {
            this.valueProperties =
                    new ParsedValueProperties(this.spec.getValueProperties());
        }
        return this.valueProperties;
    }

    /**
     * Returns the CssDeclaration map.
     * @return returns the CssDeclaration map.
     */
    public Map<String, ValidatorProtos.CssDeclaration> getCssDeclarationByName() {
        return this.cssDeclarationByName;
    }

    /**
     * Returns true if this AttrSpec should be used for the given type identifiers
     * based on the AttrSpec's disabled_by or enabled_by fields.
     * @param typeIdentifiers a list of type identifies.
     * @return returns true if this AttrSpec should be used for the given type identifiers
     * based on AttrSpec's disabled or enabled_by fields.
     */
    public boolean isUsedForTypeIdentifiers(@Nonnull final List<String> typeIdentifiers) {
        return AttributeSpecUtils.isUsedForTypeIdentifiers(
                typeIdentifiers, this.spec.getEnabledByList(), this.spec.getDisabledByList());
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.spec = null;
        this.attrName = null;
        this.valueUrlSpec = null;
        this.valueProperties = null;
        this.cssDeclarationByName = null;
    }

    /**
     * AttributeSpec instance.
     */
    private ValidatorProtos.AttrSpec spec;

    /**
     * Globally unique attribute rule name.
     */
    private String attrName;

    /**
     * ParsedUrlSpec instance.
     */
    private ParsedUrlSpec valueUrlSpec;

    /**
     * ParsedValueProperties instance.
     */
    private ParsedValueProperties valueProperties;

    /**
     * CssDeclaration map.
     */
    private Map<String, ValidatorProtos.CssDeclaration> cssDeclarationByName;
}
