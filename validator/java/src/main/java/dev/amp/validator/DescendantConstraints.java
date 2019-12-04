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
import java.util.List;

/**
 * Instances of this class specify which tag names (|allowedTags|)
 * are allowed as descendent tags of a particular tag (|tagName|).
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class DescendantConstraints {
    /**
     * Constructor.
     * @param tagName tag name.
     * @param allowedTags allowed tags.
     */
    public DescendantConstraints(@Nonnull final String tagName, @Nonnull final List<String> allowedTags) {
        this.tagName = tagName;
        this.allowedTags = allowedTags;
    }

    /**
     * Returns the tag name.
     * @return returns the tag name.
     */
    public String getTagName() {
        return tagName;
    }

    /**
     * Returns the allowed tags.
     * @return returns the allowed tags.
     */
    public List<String> getAllowedTags() {
        return allowedTags;
    }

    /** A tag name. */
    private final String tagName;

    /** Allowed tags. */
    private final List<String> allowedTags;
}
