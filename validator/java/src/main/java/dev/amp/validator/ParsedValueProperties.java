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
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class creates a map of property specs key by name.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedValueProperties {
    /**
     * Constructor.
     * @param spec property spec list.
     */
    public ParsedValueProperties(@Nonnull final ValidatorProtos.PropertySpecList spec) {
        this.valuePropertyByName = new HashMap<>();
        this.mandatoryValuePropertyNames = new ArrayList<>();

        for (final ValidatorProtos.PropertySpec propertySpec : spec.getPropertiesList()) {
            this.valuePropertyByName.put(propertySpec.getName(), propertySpec);
            if (propertySpec.hasMandatory()) {
                this.mandatoryValuePropertyNames.add(propertySpec.getName());
            }
        }
        Collections.sort(this.mandatoryValuePropertyNames);
    }

    /**
     * Returns the a map of PropertySpec.
     * @return returns a map of PropertySpec.
     */
    @Nonnull
    public Map<String, ValidatorProtos.PropertySpec> getValuePropertyByName() {
        return this.valuePropertyByName;
    }

    /**
     * Returns a list of mandatory property names.
     * @return returns a list of mandatory property names.
     */
    public List<String> getMandatoryValuePropertyNames() {
        return this.mandatoryValuePropertyNames;
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.valuePropertyByName = null;
        this.mandatoryValuePropertyNames = null;
    }

    /**
     * PropertySpec map.
     */
    @Nonnull
    private Map<String, ValidatorProtos.PropertySpec> valuePropertyByName;

    /**
     * A list of mandatory property names.
     */
    @Nonnull
    private List<String> mandatoryValuePropertyNames;
}
