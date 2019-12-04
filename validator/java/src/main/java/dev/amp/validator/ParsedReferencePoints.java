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

import dev.amp.validator.utils.TagSpecUtils;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Holds the reference points for a particular parent tag spec, including
 * their resolved TagSpec ids.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedReferencePoints {
    /**
     * Constructor.
     * @param parentTagSpec the parent TagSpec.
     */
    public ParsedReferencePoints(@Nonnull final ValidatorProtos.TagSpec parentTagSpec) {
        this.parentTagSpec = parentTagSpec;
    }

    /**
     * Return the reference points list.
     *
     * @return returns the reference points list.
     */
    public List<ValidatorProtos.ReferencePoint> iterate() {
        return this.parentTagSpec.getReferencePointsList();
    }

    /**
     * Return true if the parent tag spec's reference point size is empty.
     *
     * @return returns true if parent tag spec's reference point size is empty.
     */
    public boolean empty() {
        return this.size() == 0;
    }

    /**
     * Returns the parent tag spec's reference points size.
     *
     * @return returns the parent tag spec's reference points size.
     */
    public int size() {
        return this.parentTagSpec.getReferencePointsCount();
    }

    /**
     * Returns the parent's tag spec url.
     *
     * @return returns the parent's tag spec url.
     */
    public String parentSpecUrl() {
        return TagSpecUtils.getTagSpecUrl(this.parentTagSpec);
    }

    /**
     * Returns the parent's tag spec name.
     *
     * @return returns the parent's tag spec name.
     */
    public String parentTagSpecName() {
        return TagSpecUtils.getTagSpecName(this.parentTagSpec);
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.parentTagSpec = null;
    }

    /**
     * The parent TagSpec.
     */
    @Nonnull
    private ValidatorProtos.TagSpec parentTagSpec;
}
