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
import com.google.protobuf.ProtocolStringList;
import dev.amp.validator.utils.AttributeSpecUtils;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * This class provides access to a TagSpec and a tag id
 * which is unique within its context, the ParsedValidatorRules.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedTagSpec {
    /**
     * Constructor.
     * @param parsedAttrSpecs the ParsedAttrSpecs instance.
     * @param shouldRecordTagsValidated  a record validated value to determine if record tag should validate.
     * @param tagSpec the TagSpec.
     * @param id the id.
     */
    public ParsedTagSpec(@Nonnull final ParsedAttrSpecs parsedAttrSpecs,
                         @Nonnull final RecordValidated shouldRecordTagsValidated,
                         @Nonnull final ValidatorProtos.TagSpec tagSpec, final int id) {
        this.spec = tagSpec;
        this.id = id;
        this.referencePoints = new ParsedReferencePoints(tagSpec);
        this.isReferencePoint = (tagSpec.getTagName().equals("$REFERENCE_POINT"));
        this.isTypeJson = false;
        this.shouldRecordTagspecValidated = shouldRecordTagsValidated;
        this.attrsCanSatisfyExtension = false;
        this.attrsByName = new HashMap<>();
        this.mandatoryAttrs = new HashSet<>();
        this.mandatoryAnyofs = new HashSet<>();
        this.mandatoryOneofs = new HashSet<>();
        this.implicitAttrspecs = new ArrayList<>();
        this.containsUrl = false;

        // Collect the attr spec ids for a given |tagspec|.
        // There are four ways to specify attributes:
        // (1) implicitly by a tag spec, if the tag spec has the amp_layout field
        // set - in this case, the AMP_LAYOUT_ATTRS are assumed;
        // (2) within a TagSpec::attrs;
        // (3) via TagSpec::attr_lists which references lists by key;
        // (4) within the $GLOBAL_ATTRS TagSpec::attr_list.
        // It's possible to provide multiple specifications for the same attribute
        // name, but for any given tag only one such specification can be active.
        // The precedence is (1), (2), (3), (4)
        // If tagSpec.explicitAttrsOnly is true then only collect the attributes
        // from (2) and (3).

        // (1) layout attrs (except when explicitAttrsOnly is true).
        if (!tagSpec.hasExplicitAttrsOnly() && tagSpec.getAmpLayout() != null
                && !this.isReferencePoint) {
            this.mergeAttrs(parsedAttrSpecs.getAmpLayoutAttrs(), parsedAttrSpecs);
        }
        // (2) attributes specified within |tagSpec|.
        this.mergeAttrs(tagSpec.getAttrsList(), parsedAttrSpecs);

        // (3) attributes specified via reference to an attr_list.
        for (final String attrLists : tagSpec.getAttrListsList()) {
            this.mergeAttrs(parsedAttrSpecs.getAttrListByName(attrLists), parsedAttrSpecs);
        }
        // (4) attributes specified in the global_attr list (except when
        // explicitAttrsOnly is true).
        if (!tagSpec.hasExplicitAttrsOnly() && !this.isReferencePoint) {
            this.mergeAttrs(parsedAttrSpecs.getGlobalAttrs(), parsedAttrSpecs);
        }
    }

    /**
     * Getting the TagSpec.
     *
     * @return returns the TagSpec.
     */
    public ValidatorProtos.TagSpec getSpec() {
        return spec;
    }

    /**
     * If tag has a cdata spec, returns a CdataMatcher, else null.
     * @param lineCol the pair of line/col.
     * @return CdataMatcher returns CdataMatcher object.
     */
    public CdataMatcher cdataMatcher(@Nonnull final Locator lineCol) {
        if (this.spec.getCdata() != null) {
            return new CdataMatcher(this, lineCol);
        }

        return null;
    }

    /**
     * If tag has a child_tag spec, returns a ChildTagMatcher, else null.
     * @throws TagValidationException the TagValidationException.
     * @return ChildTagMatcher returns the ChildTagMatcher.
     */
    public ChildTagMatcher childTagMatcher() throws TagValidationException {
        if (this.spec.hasChildTags()) {
            return new ChildTagMatcher(this.spec);
        }
        return null;
    }

    /**
     * If tag has a reference_point spec, returns a ReferencePointMatcher,
     * else null.
     * @param rules the ParsedValidatorRules object.
     * @param lineCol the pair of line/col.
     * @throws TagValidationException the TagValidationException.
     * @return returns the ReferencePointMatcher object.
     */
    public ReferencePointMatcher referencePointMatcher(@Nonnull final ParsedValidatorRules rules,
                                                       @Nonnull final Locator lineCol)
            throws TagValidationException {
        if (this.hasReferencePoints()) {
            return new ReferencePointMatcher(rules, this.referencePoints, lineCol);
        }
        return null;
    }

    /**
     * Returns true if this tagSpec contains an attribute of name "type" and value
     * "application/json".
     * @return returns true if this tagSpec contains an attribute of name "type"
     * and value "application/json.".
     */
    public boolean isTypeJson() {
        return this.isTypeJson;
    }

    /**
     * Return the parsed tag id.
     * @return returns the parsed tag id.
     */
    public int getId() {
        return id;
    }

    /**
     * Returns true if this TagSpec should be used for the given type identifiers
     * based on the TagSpec's disabled_by or enabled_by fields.
     * @param typeIdentifiers the list of identifiers.
     * @return returns true if this tagSpec should be used for the given type identifiers.
     */
    public boolean isUsedForTypeIdentifiers(@Nonnull final List<String> typeIdentifiers) {
        return AttributeSpecUtils.isUsedForTypeIdentifiers(
                typeIdentifiers, this.spec.getEnabledByList(), this.spec.getDisabledByList());
    }

    /**
     * A TagSpec may specify other tags to be required as well, when that
     * tag is used. This accessor returns the IDs for the tagspecs that
     * are also required if |this| tag occurs in the document, but where
     * such requirement is currently only a warning.
     * @return returns a list of requires tag warning list.
     */
    public List<String> getAlsoRequiresTagWarning() {
        return this.spec.getAlsoRequiresTagWarningList();
    }

    /**
     * A TagSpec may specify generic conditions which are required if the
     * tag is present. This accessor returns the list of those conditions.
     * @return returns requires list.
     */
    public List<String> requires() {
        return this.spec.getRequiresList();
    }

    /**
     * A TagSpec may specify that another tag is excluded. This accessor returns
     * the list of those tags.
     * @return returns excludes list.
     */
    public List<String> excludes() {
        return this.spec.getExcludesList();
    }

    /**
     * Returns true if this tagSpec contains a value_url field.
     * @return returns true if this tagSpec contains a value_url field.
     */
    public boolean containsUrl() {
        return this.containsUrl;
    }

    /**
     * Whether or not the tag should be recorded via
     * Context.recordTagspecValidated_ if it was validated
     * successfully. For performance, this is only done for tags that are
     * mandatory, unique, or possibly required by some other tag.
     * @return returns a record validated enumeration whether or not the tag should be recorded.
     */
    public RecordValidated shouldRecordTagspecValidated() {
        return this.shouldRecordTagspecValidated;
    }

    /**
     * Returns a boolean whether the this tagSpec has reference point.
     *
     * @return returns a boolean whether the this tagSpec has reference point.
     */
    public boolean isReferencePoint() {
        return this.isReferencePoint;
    }

    /**
     * Return true if reference points not empty. Else return false.
     * @return Returns true if reference points not empty. Else return false.
     */
    public boolean hasReferencePoints() {
        return !this.referencePoints.empty();
    }

    /** @return returns ParsedReferencePoints object. */
    public ParsedReferencePoints getReferencePoints() {
        return this.referencePoints;
    }

    /** @return returns if this tagSpec can satisfy extension. */
    public boolean attrsCanSatisfyExtension() {
        return this.attrsCanSatisfyExtension;
    }

    /**
     * Returns if attrsByName contains the mapping keyed name.
     * @param name attribute name.
     * @return returns if attrsByName contains the mapping keyed name.
     */
    public boolean hasAttrWithName(@Nonnull final String name) {
        return attrsByName.containsKey(name);
    }

    /**
     * Returns the implicit attr specs.
     * @return returns the implicit attr specs.
     */
    public List<ValidatorProtos.AttrSpec> getImplicitAttrspecs() {
        return this.implicitAttrspecs;
    }

    /**
     * Returns the map of attrs by name.
     * @return returns the map of attrs by name.
     */
    public Map<String, ValidatorProtos.AttrSpec> getAttrsByName() {
        return this.attrsByName;
    }

    /**
     * Returns the set of mandatoryOneofs.
     * @return returns the set of mandatoryOneofs.
     */
    public Set<String> getMandatoryOneofs() {
        return this.mandatoryOneofs;
    }

    /**
     * Returns the set of mandatoryAnyofs.
     * @return returns the set of mandatoryAnyofs.
     */
    public Set<String> getMandatoryAnyofs() {
        return this.mandatoryAnyofs;
    }

    /**
     * Returns the set of mandatoryAttrs.
     * @return returns the set of mandatoryAttrs.
     */
    public Set<ValidatorProtos.AttrSpec> getMandatoryAttrIds() {
        return this.mandatoryAttrs;
    }

    /**
     * Merges the list of attrs into attrsByName, avoiding to merge in attrs
     * with names that are already in attrsByName.
     * @param attrs the list of attr specs.
     * @param parsedAttrSpecs the ParsedAttrSpec object.
     */
    private void mergeAttrs(final List<ValidatorProtos.AttrSpec> attrs, final ParsedAttrSpecs parsedAttrSpecs) {
        for (ValidatorProtos.AttrSpec attrSpec : attrs) {
            final String name = attrSpec.getName();
            if (attrsByName.containsKey(name)) {
                continue;
            }

            attrsByName.put(name, attrSpec);
            if (attrSpec.getName() != null
                    && attrSpec.getAllFields().size() == 1) { // negative attr ids are simple attrs (only name set).
                continue;
            }

            if (attrSpec.getValueCaseiCount() > 0) {
                for (final String valueCasei : attrSpec.getValueCaseiList()) {
                    populateAttrSpec(name, valueCasei, parsedAttrSpecs, attrSpec);
                }
            } else {
                populateAttrSpec(name, "", parsedAttrSpecs, attrSpec);
            }
        }
    }

    /**
     * Returns the parsed tag spec id.
     * @return tag spec id.
     */
    public int id() {
        return this.id;
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.spec = null;
        this.referencePoints = null;
        this.attrsByName = null;
        this.mandatoryAttrs = null;
        this.mandatoryOneofs = null;
        this.mandatoryAnyofs = null;
        this.implicitAttrspecs = null;
    }

    private void populateAttrSpec(@Nonnull final String name, @Nonnull final String value,
                                  @Nonnull final ParsedAttrSpecs parsedAttrSpecs,
                                  @Nonnull final ValidatorProtos.AttrSpec attrSpec) {
        final ParsedAttrSpec attr = parsedAttrSpecs.getParsedAttrSpec(name, value, attrSpec);
        if (attr != null) {
            final ValidatorProtos.AttrSpec spec = attr.getSpec();
            if (spec.hasMandatory()) {
                this.mandatoryAttrs.add(spec);
            }
            if (spec.hasMandatoryOneof()) {
                this.mandatoryOneofs.add(spec.getMandatoryOneof());
            }
            if (spec.hasMandatoryAnyof()) {
                this.mandatoryAnyofs.add(spec.getMandatoryAnyof());
            }

            ProtocolStringList protocolStringList = spec.getAlternativeNamesList();
            for (final String altName : protocolStringList) {
                this.attrsByName.put(altName, attrSpec);
            }
            if (spec.hasImplicit()) {
                this.implicitAttrspecs.add(attrSpec);
            }
            if (spec.getName().equals("type") && spec.getValueCaseiList().size() > 0) {
                for (final String v : spec.getValueCaseiList()) {
                    if ("application/json".equals(v)) {
                        this.isTypeJson = true;
                        break;
                    }
                }
            }
            if (spec.hasValueUrl()) {
                this.containsUrl = true;
            }
            if (spec.getRequiresExtensionList().size() > 0) {
                this.attrsCanSatisfyExtension = true;
            }
        }
    }

    /**
     * The TagSpec.
     */
    private ValidatorProtos.TagSpec spec;

    /**
     * A unique tag id.
     */
    private int id;

    /**
     * The ParsedReferencePoints.
     */
    private ParsedReferencePoints referencePoints;

    /**
     * Reference point flag.
     */
    private boolean isReferencePoint;

    /**
     * Type json flag.
     */
    private boolean isTypeJson;

    /**
     * Should record tags validated.
     */
    private RecordValidated shouldRecordTagspecValidated;

    /**
     * A flag to indicate if attrs can satisfy extension.
     */
    private boolean attrsCanSatisfyExtension;

    /**
     * ParsedAttributes keyed by name.
     */
    private Map<String, ValidatorProtos.AttrSpec> attrsByName;

    /**
     * Attributes that are mandatory for this tag to legally validate.
     */
    private Set<ValidatorProtos.AttrSpec> mandatoryAttrs;

    /**
     * A list of mandatory one ofs.
     */
    private Set<String> mandatoryOneofs;

    /**
     * A list of mandatory any ofs.
     */
    private Set<String> mandatoryAnyofs;

    /**
     * A list of implicit attr specs.
     */
    private List<ValidatorProtos.AttrSpec> implicitAttrspecs;

    /**
     * Flag to indicate whether it contains an url.
     */
    private boolean containsUrl;
}
