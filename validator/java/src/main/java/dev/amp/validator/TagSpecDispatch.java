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

import dev.amp.validator.utils.DispatchKeyUtils;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class stores the dispatch rules for all TagSpecs with the same tag name.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class TagSpecDispatch {
    /**
     * Constructor.
     */
    public TagSpecDispatch() {
        this.allTagSpecs = new ArrayList<>();
    }

    /**
     * Registers a new dispatch key to match a tagspec id
     * @param dispatchKey the dispatch key.
     * @param tagSpecId tag spec id.
     */
    public void registerDispatchKey(@Nonnull final String dispatchKey, final int tagSpecId) {
        if (this.tagSpecsByDispatch == null) {
            this.tagSpecsByDispatch = new HashMap<>();
        }
        // Multiple TagSpecs may have the same dispatch key. These are added in the
        // order in which they are found.
        List<Integer> tagSpecIds;
        if (!(tagSpecsByDispatch.containsKey(dispatchKey))) {
            tagSpecIds = new ArrayList<>();
            tagSpecIds.add(tagSpecId);
            this.tagSpecsByDispatch.put(dispatchKey, tagSpecIds);
        } else {
            tagSpecIds = this.tagSpecsByDispatch.get(dispatchKey);
            tagSpecIds.add(tagSpecId);
        }
    }

    /**
     * Looks up a dispatch key as previously registered, returning the
     * corresponding tagSpecIds which are ordered by their specificity of match
     * (e.g. Name/Value/Parent, then Name/Value, and then Name).
     * @param attrName attribute name.
     * @param attrValue attribute value.
     * @param mandatoryParent mandatory parent.
     * @return returns the list of tag spec ids.
     */
    public List<Integer> matchingDispatchKey(@Nonnull final String attrName,
                                             @Nonnull final String attrValue,
                                             @Nonnull final String mandatoryParent) {
        List<Integer> tagSpecIds = new ArrayList<>();
        if (!this.hasDispatchKeys()) {
            return tagSpecIds;
        }

        // Try first to find a key with the given parent.
        final String dispatchKey = DispatchKeyUtils.makeDispatchKey(
               ValidatorProtos.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH,
                attrName, attrValue, mandatoryParent);
        final List<Integer> match = this.tagSpecsByDispatch.get(dispatchKey);
        if (match != null) {
            tagSpecIds.addAll(match);
        }

        // Try next to find a key that allows any parent.
        final String noParentKey = DispatchKeyUtils.makeDispatchKey(
                ValidatorProtos.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH, attrName,
                attrValue, "");
        final List<Integer> noParentMatch = this.tagSpecsByDispatch.get(noParentKey);
        if (noParentMatch != null) {
            tagSpecIds.addAll(noParentMatch);
        }

        // Try last to find a key that matches just this attribute name.
        final String noValueKey = DispatchKeyUtils.makeDispatchKey(
                ValidatorProtos.AttrSpec.DispatchKeyType.NAME_DISPATCH, attrName, "", "");
        final List<Integer> noValueMatch = this.tagSpecsByDispatch.get(noValueKey);
        if (noValueMatch != null) {
            tagSpecIds.addAll(noValueMatch);
        }

        // Special case for foo=foo. We consider this a match for a dispatch key of
        // foo="" or just <tag foo>.
        if (attrName.equals(attrValue)) {
            tagSpecIds.addAll(
                    this.matchingDispatchKey(attrName, "", mandatoryParent));
        }

        return tagSpecIds;
    }

    /**
     * Registers a new non dispatch key tagspec id.
     * @param tagSpecId tag spec id.
     */
    public void registerTagSpec(final int tagSpecId) {
        this.allTagSpecs.add(tagSpecId);
    }

    /**
     * Returns true if dispatch key is not null and tag specs is not empty.
     * @return returns true if dispatch key is not null and tag specs is not empty.
     */
    public boolean empty() {
        return !this.hasDispatchKeys() && !this.hasTagSpecs();
    }

    /**
     * Returns true if tag spec key by dispatch not null.
     * @return returns true if tag spec key by dispatch not null.
     */
    public boolean hasDispatchKeys() {
        return this.tagSpecsByDispatch != null;
    }

    /**
     * Return true if tag specs not empty.
     * @return returns true if tag specs not empty.
     */
    public boolean hasTagSpecs() {
        return this.allTagSpecs.size() > 0;
    }

    /**
     * Returns the tag specs.
     * @return returns the tag specs.
     */
    public List<Integer> allTagSpecs() {
        return this.allTagSpecs;
    }

   /** TagSpec ids for a specific attribute dispatch key. */
    private Map<String, List<Integer>> tagSpecsByDispatch;

    /** List of all tag specs. */
    private List<Integer> allTagSpecs;
}
