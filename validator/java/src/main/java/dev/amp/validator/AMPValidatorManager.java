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

import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.utils.DispatchKeyUtils;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class manages the rules.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class AMPValidatorManager {
    /**
     * Constructor of AMP validator manager class.
     */
    public AMPValidatorManager() {
    }

    /**
     * Loading AMP validator main and extensions rules.
     *
     * @throws IOException if I/O errors occur.
     * @throws  URISyntaxException if this URL is not formatted strictly
     * according to to RFC2396 and cannot be converted to a URI.
     */
    public void loadRule() throws IOException, URISyntaxException {
        loadRule(null);
    }

    /**
     * Loading AMP validator main and extensions rules.
     *
     * @param filePath file path.
     * @throws IOException if I/O errors occur.
     * @throws  URISyntaxException if this URL is not formatted strictly
     * according to to RFC2396 and cannot be converted to a URI.
     */
    public void loadRule(final String filePath) throws IOException, URISyntaxException {
        final AMPValidatorLoader ampValidatorLoader = new AMPValidatorLoader();

        this.builder = ampValidatorLoader.load(filePath);
        this.combinedBlacklistedCdataRegexMap = new HashMap<>();

        final List<ValidatorProtos.TagSpec> tagSpecs = builder.getTagsList();

        int tagSpecId = 0;
        for (ValidatorProtos.TagSpec tagSpec : tagSpecs) {
            final List<ValidatorProtos.HtmlFormat.Code> htmlFormats = tagSpec.getHtmlFormatList();
            for (final ValidatorProtos.HtmlFormat.Code htmlFormat : htmlFormats) {
                Map<String, List<ValidatorProtos.TagSpec>> tagSpecMap = tagSpecMapByHtmlFormat.get(htmlFormat);
                if (tagSpecMap == null) {
                    tagSpecMap = new HashMap<>();
                    tagSpecMap.put(tagSpec.getTagName(), new ArrayList<>());
                    tagSpecMapByHtmlFormat.put(htmlFormat, tagSpecMap);
                }
                List<ValidatorProtos.TagSpec> tagSpecList = tagSpecMap.get(tagSpec.getTagName());
                if (tagSpecList == null) {
                    tagSpecList = new ArrayList<>();
                }
                tagSpecList.add(tagSpec);
                tagSpecMap.put(tagSpec.getTagName(), tagSpecList);
            }

            String dispatchKey = DispatchKeyUtils.getDispatchKeyForTagSpecOrNone(tagSpec);
            if (dispatchKey != null) {
                dispatchKeyByTagSpecId.put(tagSpecId, dispatchKey);
            }

            final List<ValidatorProtos.BlackListedCDataRegex> blackListedCDataRegexList =
                    tagSpec.getCdata().getBlacklistedCdataRegexList();
            if (blackListedCDataRegexList != null) {
                final List<String> combined = new ArrayList<>();
                for (final ValidatorProtos.BlackListedCDataRegex blackListedCDataRegex : blackListedCDataRegexList) {
                    combined.add(blackListedCDataRegex.getRegex());
                }

                if (!combined.isEmpty()) {
                    final String combinedBlacklistedCdataRegex = String.join("|", combined);
                    this.combinedBlacklistedCdataRegexMap.put(String.valueOf(tagSpecId), combinedBlacklistedCdataRegex);
                }
            }

            tagSpecId++;
        }



        /** Populating the lookup for attribute list by name. */
        List<ValidatorProtos.AttrList> attrListsList = builder.getAttrListsList();
        for (ValidatorProtos.AttrList attrList : attrListsList) {
            attrListMap.put(attrList.getName(), attrList);
        }
    }

    /**
     * Return true if tag spec name exists.
     * @param htmlFormat the HtmlFormat.
     * @param name tag spec name.
     * @return returns true if tag spec name exists.
     */
    public boolean hasTagSpec(@Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat, @Nonnull final String name) {
        Map<String, List<ValidatorProtos.TagSpec>> tagSpecMap = tagSpecMapByHtmlFormat.get(htmlFormat);
        return tagSpecMap != null ? tagSpecMap.containsKey(name) : false;
    }

    /**
     * Return a list of TagSpec given a tag name.
     * @param htmlFormat the HtmlFormat.
     * @param name tag spec name.
     * @return returns a list of TagSpect given a tag name.
     */
    public List<ValidatorProtos.TagSpec> getTagSpec(@Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat, @Nonnull final String name) {
         Map<String, List<ValidatorProtos.TagSpec>> tagSpecMap = tagSpecMapByHtmlFormat.get(htmlFormat);
         return tagSpecMap != null ? tagSpecMap.get(name) : null;
    }

    /**
     * Return a list of AttrList given an attribute list name.
     * @param name attribute list name.
     * @return returns a list of AttrList given an attribute spec name.
     */
    public ValidatorProtos.AttrList getAttrList(@Nonnull final String name) {
        return attrListMap.get(name);
    }

    /**
     * Return a list of TagSpec given a tag name.
     * @param htmlFormat the HtmlFormat.
     * @param tagName a tag name.
     * @return returns a list of TagSpec given a tag name.
     */
    public List<ValidatorProtos.TagSpec> getListTagSpecByName(@Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat,
                                                        @Nonnull final String tagName) {
        Map<String, List<ValidatorProtos.TagSpec>> tagMap = tagSpecMapByHtmlFormat.get(htmlFormat);
        return (tagMap != null ? tagMap.get(tagName) : null);
    }

    /**
     * Returns the validation rules.
     *
     * @return returns the validation rules.
     */
    public ValidatorProtos.ValidatorRules.Builder getRules() {
        return this.builder;
    }

    /**
     * Returns the $GLOBAL_ATTRS attr spec list.
     * @return returns the $GLOBAL_ATTRS attr spec list.
     */
    public List<ValidatorProtos.AttrSpec> getGlobalAttrs() {
        for (ValidatorProtos.AttrList attrList : builder.getAttrListsList()) {
            if (attrList.getName().equals("$GLOBAL_ATTRS")) {
                return attrList.getAttrsList();
            }
        }

        return Collections.emptyList();
    }

    /**
     * Returns the $AMP_LAYOUT_ATTRS attr spec list.
     * @return returns the $AMP_LAYOUT_ATTRS attr spec list.
     */
    public List<ValidatorProtos.AttrSpec> getAmpLayoutAttrs() {
        for (ValidatorProtos.AttrList attrList : builder.getAttrListsList()) {
            if (attrList.getName().equals("$AMP_LAYOUT_ATTRS")) {
                return attrList.getAttrsList();
            }
        }

        return Collections.emptyList();
    }

    /**
     * Returns the descendant tag lists.
     * @return returns the descendant tag lists.
     */
    public List<ValidatorProtos.DescendantTagList> getDescendantTagLists() {
        return this.builder.getDescendantTagListList();
    }

    /**
     * Returns dispatch key given tag spec id.
     * @param tagSpecId tag spec id.
     * @return returns dispatch key.
     */
    public String getDispatchKeyByTagSpecId(final int tagSpecId) {
        return dispatchKeyByTagSpecId.get(tagSpecId);
    }

    /**
     * Returns the specId for given the tag spec name of the reference point.
     * @param specName the spec name.
     * @throws TagValidationException the TagValidationException.
     * @return returns specId.
     */
    public int getTagSpecIdByReferencePointTagSpecName(@Nonnull final String specName) throws TagValidationException {
        int index = 0;
        for (ValidatorProtos.TagSpec tagSpec : builder.getTagsList()) {
            if (tagSpec.getTagName().equals("$REFERENCE_POINT")) {
                if (tagSpec.getSpecName().equals(specName)) {
                    return index;
                }
            }
            index++;
        }

        throw new TagValidationException("The reference point with spec name " + specName + " does not exist");
    }

    /**
     * Returns the styles spec url.
     * @return returns the styles spec url.
     */
    public String getStylesSpecUrl() {
        return builder.getStylesSpecUrl();
    }

    /**
     * Returns the script spec url.
     * @return returns the script spec url.
     */
    public String getScriptSpecUrl() {
        return builder.getScriptSpecUrl();
    }

    /**
     * Returns the attr list map.
     * @return returns the attr list map.
     */
    public Map<String, ValidatorProtos.AttrList> getAttrListMap() {
        return attrListMap;
    }

    /**
     * Returns a combined black listed regex.
     * @param tagSpecId tag spec id.
     * @return returns a combined black listed regex.
     */
    public String getCombinedBlacklistedCdataRegex(final int tagSpecId) {
        return combinedBlacklistedCdataRegexMap.get(Integer.toString(tagSpecId));
    }

    /** Validator builder rules. */
    @Nonnull
    private ValidatorProtos.ValidatorRules.Builder builder = null;

    /** TagSpec lookup (tag_name) by name. */
    @Nonnull
    private final Map<ValidatorProtos.HtmlFormat.Code, Map<String, List<ValidatorProtos.TagSpec>>> tagSpecMapByHtmlFormat = new HashMap<>();

    /** Attribute list (attr_list) lookup by name. */
    @Nonnull
    private final Map<String, ValidatorProtos.AttrList> attrListMap = new HashMap<>();

    /**
     * The map of dispatch key by tag spec id.
     */
    @Nonnull
    private final Map<Integer, String> dispatchKeyByTagSpecId = new HashMap<>();

    /** Combined black listed Cdata regex per Cdataspec. */
    private Map<String, String> combinedBlacklistedCdataRegexMap;
}
