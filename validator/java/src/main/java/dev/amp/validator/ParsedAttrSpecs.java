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

import javax.annotation.Nonnull;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TagSpecs specify attributes that are valid for a particular tag.
 * They can also reference lists of attributes (AttrLists), thereby
 * sharing those definitions. This abstraction instantiates
 * ParsedAttrSpec for each AttrSpec (from validator-*.protoascii, our
 * specification file) exactly once, and provides quick access to the
 * attr spec names as well, including for simple attr specs (those
 * which only have a name but no specification for their value).
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedAttrSpecs {
    /**
     * Constructor.
     *
     * @param validatorManager the AMPValidatorManager instance.
     */
    public ParsedAttrSpecs(@Nonnull final AMPValidatorManager validatorManager) {
        this.validatorManager = validatorManager;
        this.parsedAttrSpecs = new HashMap<>();
    }

    /**
     * Returns the ParsedAttrSpec.
     *
     * @param name     the attr spec name.
     * @param value    the attr spec value.
     * @param attrSpec the AttributeSpec.
     * @return returns the ParsedAttrSpec.
     */
    public ParsedAttrSpec getParsedAttrSpec(@Nonnull final String name,
                                            @Nonnull final String value,
                                            @Nonnull final ValidatorProtos.AttrSpec attrSpec) {
        final String key = name + value;
        if (this.parsedAttrSpecs.containsKey(key)) {
            return parsedAttrSpecs.get(key);
        }

        final ParsedAttrSpec parsed = new ParsedAttrSpec(attrSpec, name);
        this.parsedAttrSpecs.put(key, parsed);

        return parsed;
    }

    /**
     * Returns the attr list by name.
     *
     * @param name the attr list name.
     * @return returns the attr list.
     */
    public List<ValidatorProtos.AttrSpec> getAttrListByName(@Nonnull final String name) {
        ValidatorProtos.AttrList attrList = validatorManager.getAttrListMap().get(name);
        if (attrList != null) {
            return attrList.getAttrsList();
        }

        return Collections.emptyList();
    }

    /**
     * Returns the global attr list.
     *
     * @return returns the global attr list.
     */
    public List<ValidatorProtos.AttrSpec> getGlobalAttrs() {
        return validatorManager.getGlobalAttrs();
    }

    /**
     * Returns the AmpLayout attr list.
     *
     * @return returns the AmpLayout attr list.
     */
    public List<ValidatorProtos.AttrSpec> getAmpLayoutAttrs() {
        return validatorManager.getAmpLayoutAttrs();
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.parsedAttrSpecs = null;
    }

    /**
     * AMPValidatorManager instance.
     */
    private final AMPValidatorManager validatorManager;

    /**
     * The already instantiated ParsedAttrSpec instances, indexed by
     * attr spec name.
     */
    private Map<String, ParsedAttrSpec> parsedAttrSpecs;
}
