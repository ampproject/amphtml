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

import dev.amp.validator.css.ParsedDocCssSpec;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.utils.ExtensionsUtils;
import dev.amp.validator.utils.TagSpecUtils;
import dev.amp.validator.utils.ValidationErrorUtils;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static dev.amp.validator.utils.AttributeSpecUtils.isUsedForTypeIdentifiers;
import static dev.amp.validator.utils.ExtensionsUtils.isAmpRuntimeScript;
import static dev.amp.validator.utils.ExtensionsUtils.isExtensionScript;
import static dev.amp.validator.utils.ExtensionsUtils.isLtsScriptUrl;

/**
 * The Context keeps track of the line / column that the validator is
 * in, as well as the mandatory tag specs that have already been validated.
 * So, this constitutes the mutable state for the validator except for
 * the validation result itself.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class Context {

    /**
     * Constructor.
     *
     * @param parsedValidatorRules a ParsedValidationRules object.
     */
    public Context(@Nonnull final ParsedValidatorRules parsedValidatorRules) {
        this.rules = parsedValidatorRules;
        this.mandatoryAlternativesSatisfied = new ArrayList<>();
        this.docLocator = null;
        this.tagStack = new TagStack();
        this.tagspecsValidated = new HashMap<>();
        //TODO - it's a hack, remove this when DOCTYPE is fixed
        tagspecsValidated.put(0, true);

        this.styleTagByteSize = 0;
        this.inlineStyleByteSize = 0;
        this.typeIdentifiers = new ArrayList<>();
        this.valueSetsProvided = new HashSet<>();
        this.valueSetsRequired = new HashMap<>();
        this.conditionsSatisfied = new HashMap<>();
        this.firstUrlSeenTag = null;
        this.extensions = new ExtensionsContext();
        this.scriptReleaseVersion = ExtensionsUtils.ScriptReleaseVersion.UNKNOWN;
    }

    /**
     * Given the tagResult from validating a single tag, update the overall
     * result as well as the Context state to affect later validation.
     *
     * @param encounteredTag       the encountered tag.
     * @param referencePointResult the reference point result.
     * @param tagResult            the tag result.
     * @throws TagValidationException the TagValidationException.
     */
    public void updateFromTagResults(@Nonnull final ParsedHtmlTag encounteredTag,
                                     @Nonnull final ValidateTagResult referencePointResult,
                                     @Nonnull final ValidateTagResult tagResult) throws TagValidationException {
        this.tagStack.updateFromTagResults(
                encounteredTag, referencePointResult, tagResult, this.getRules(),
                this.getLineCol());

        this.recordAttrRequiresExtension(encounteredTag, referencePointResult);
        this.recordAttrRequiresExtension(encounteredTag, tagResult);
        this.updateFromTagResult(referencePointResult);
        this.updateFromTagResult(tagResult);
    }

    /**
     * Given a tag result, update the Context state to affect
     * later validation. Does not handle updating the tag stack.
     *
     * @param result a result.
     */
    private void updateFromTagResult(@Nonnull final ValidateTagResult result) {
        if (result.getBestMatchTagSpec() == null) {
            return;
        }

        final ParsedTagSpec parsedTagSpec = result.getBestMatchTagSpec();
        final boolean isPassing =
                (result.getValidationResult().getStatus() == ValidatorProtos.ValidationResult.Status.PASS);

        this.extensions.updateFromTagResult(result);
        // If this requires an extension and we are still in the document head,
        // record that we may still need to emit a missing extension error at
        // the end of the document head. We do this even for a tag failing
        // validation since extensions are based on the tag name, and we're still
        // pretty confident the user forgot to include the extension.
        if (this.tagStack.hasAncestor("HEAD")) {
            this.extensions.recordFutureErrorsIfMissing(
                    parsedTagSpec, this.getLineCol());
        }
        // We also want to satisfy conditions, to reduce errors seen elsewhere in
        // the document.
        this.satisfyConditionsFromTagSpec(parsedTagSpec);
        this.satisfyMandatoryAlternativesFromTagSpec(parsedTagSpec);
        this.recordValidatedFromTagSpec(isPassing, parsedTagSpec);

        final ValidatorProtos.ValidationResult.Builder validationResult = result.getValidationResult();
        for (final ValidatorProtos.ValueSetProvision provision : validationResult.getValueSetProvisionsList()) {
            this.valueSetsProvided.add(this.keyFromValueSetProvision(provision));
        }
        for (final ValidatorProtos.ValueSetRequirement requirement : validationResult.getValueSetRequirementsList()) {
            if (!requirement.hasProvision()) {
                continue;
            }

            final String key = this.keyFromValueSetProvision(requirement.getProvision());
            List<ValidatorProtos.ValidationError> errors = this.valueSetsRequired.get(key);
            if (errors == null) {
                errors = new ArrayList<>();
                this.valueSetsRequired.put(key, errors);
            }
            errors.add(requirement.getErrorIfUnsatisfied());
        }

        if (isPassing) {
            // If the tag spec didn't match, we don't know that the tag actually
            // contained a URL, so no need to complain about it.
            this.markUrlSeenFromMatchingTagSpec(parsedTagSpec);
        }
    }

    /**
     * Record if this document contains a tag requesting the LTS runtime engine.
     *
     * @param parsedTag
     * @param result    the result
     */
    private void recordScriptReleaseVersionFromTagResult(@Nonnull final ParsedHtmlTag parsedTag,
                                                         @Nonnull final ValidatorProtos.ValidationResult result) {
        if (this.getScriptReleaseVersion() == ExtensionsUtils.ScriptReleaseVersion.UNKNOWN
                && (isExtensionScript(parsedTag) || isAmpRuntimeScript(parsedTag))) {
            final String src = (parsedTag.attrsByKey().get("src") != null) ? parsedTag.attrsByKey().get("src") : "";
            this.scriptReleaseVersion = isLtsScriptUrl(src)
                    ? ExtensionsUtils.ScriptReleaseVersion.LTS : ExtensionsUtils.ScriptReleaseVersion.STANDARD;
        }
    }

    /**
     * Records that a Tag was seen which contains an URL. Used to note issues
     * with base href occurring in the document after an URL.
     *
     * @param parsedTagSpec parsed tag spec.
     */
    public void markUrlSeenFromMatchingTagSpec(@Nonnull final ParsedTagSpec parsedTagSpec) {
        if (!this.hasSeenUrl() && parsedTagSpec.containsUrl()) {
            this.firstUrlSeenTag = parsedTagSpec.getSpec();
        }
    }

    /**
     * Returns all the value set provisions so far, as a set of derived keys, as
     * computed by keyFromValueSetProvision_().
     *
     * @return the value sets provided
     */
    public Set<String> valueSetsProvided() {
        return this.valueSetsProvided;
    }

    /**
     * Returns all the value set requirements so far, keyed by derived keys, as
     * computed by getValueSetProvisionKey().
     *
     * @return the map of value sets required.
     */
    public Map<String, List<ValidatorProtos.ValidationError>> valueSetsRequired() {
        return this.valueSetsRequired;
    }

    /**
     * Records that this document contains a tag matching a particular tag spec.
     *
     * @param isPassing     is passing status.
     * @param parsedTagSpec parsed tag spec.
     */
    private void recordValidatedFromTagSpec(final boolean isPassing, @Nonnull final ParsedTagSpec parsedTagSpec) {
        final RecordValidated recordValidated = parsedTagSpec.shouldRecordTagspecValidated();
        if (recordValidated == RecordValidated.ALWAYS) {
            this.tagspecsValidated.put(parsedTagSpec.id(), true);
        } else if (isPassing && (recordValidated == RecordValidated.IF_PASSING)) {
            this.tagspecsValidated.put(parsedTagSpec.id(), true);
        }
    }

    /**
     * Record document-level conditions which have been satisfied.
     *
     * @param parsedTagSpec parsed tag spec.
     */
    private void satisfyConditionsFromTagSpec(@Nonnull final ParsedTagSpec parsedTagSpec) {
        for (final String condition : parsedTagSpec.getSpec().getSatisfiesList()) {
            this.conditionsSatisfied.put(condition, true);
        }
    }

    /**
     * Record that this document contains a tag which is a member of a list
     * of mandatory alternatives.
     *
     * @param parsedTagSpec parsed tag spec.
     */
    public void satisfyMandatoryAlternativesFromTagSpec(@Nonnull final ParsedTagSpec parsedTagSpec) {
        final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
        if (tagSpec.hasMandatoryAlternatives()) {
            this.mandatoryAlternativesSatisfied.add(tagSpec.getMandatoryAlternatives());
        }
    }

    /**
     * Record when an encountered tag's attribute that requires an extension
     * that it also satisfies that the requied extension is used.
     *
     * @param encounteredTag encountered tag.
     * @param tagResult      tag result.
     */
    private void recordAttrRequiresExtension(@Nonnull final ParsedHtmlTag encounteredTag,
                                             @Nonnull final ValidateTagResult tagResult) {
        if (tagResult.getBestMatchTagSpec() == null) {
            return;
        }

        final ParsedTagSpec parsedTagSpec = tagResult.getBestMatchTagSpec();
        if (!parsedTagSpec.attrsCanSatisfyExtension()) {
            return;
        }

        Map<String, ValidatorProtos.AttrSpec> attrsByName = parsedTagSpec.getAttrsByName();
        final ExtensionsContext extensionsCtx = this.extensions;
        for (int i = 0; i < encounteredTag.attrs().getLength(); i++) {
            String attrName = encounteredTag.attrs().getLocalName(i);
            String attrValue = encounteredTag.attrs().getValue(i);
            if (attrName.equals(attrValue)) {
                attrValue = "";
            }
            if (attrsByName.containsKey(attrName)) {
                final ValidatorProtos.AttrSpec attrSpec = attrsByName.get(attrName);
                if (attrSpec == null) {
                    continue;
                }
                final ParsedAttrSpec parsedAttrSpec =
                        this.rules.getParsedAttrSpecs().getParsedAttrSpec(attrName, attrValue, attrSpec);
                if (parsedAttrSpec != null && parsedAttrSpec.getSpec().getRequiresExtensionCount() > 0) {
                    extensionsCtx.recordUsedExtensions(
                            parsedAttrSpec.getSpec().getRequiresExtensionList());
                }
            }
        }
    }

    /**
     * @param error            a ValidationError object.
     * @param validationResult a ValidationResult object.
     */
    public void addBuiltError(@Nonnull final ValidatorProtos.ValidationError error,
                              @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        // If any of the errors amount to more than a WARNING, validation fails.
        if (error.getSeverity() != ValidatorProtos.ValidationError.Severity.WARNING) {
            validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        }
        validationResult.addErrors(error);
    }

    /**
     * Add an error field to validationResult with severity ERROR.
     *
     * @param validationErrorCode Error code
     * @param lineCol             a line / column pair.
     * @param params              a list of params.
     * @param specUrl             a link (URL) to the amphtml spec
     * @param validationResult    a ValidationResult object.
     */
    public void addError(@Nonnull final ValidatorProtos.ValidationError.Code validationErrorCode,
                         @Nonnull final Locator lineCol,
                         final List<String> params, final String specUrl,
                         @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        addError(validationErrorCode, lineCol.getLineNumber(),
                lineCol.getColumnNumber(), params, specUrl, validationResult);
    }

    /**
     * Add an error field to validationResult with severity ERROR.
     *
     * @param validationErrorCode Error code
     * @param line                a line number.
     * @param column              a column number.
     * @param params              a list of params.
     * @param specUrl             a link (URL) to the amphtml spec
     * @param validationResult    a ValidationResult object.
     */
    public void addError(@Nonnull final ValidatorProtos.ValidationError.Code validationErrorCode,
                         final int line,
                         final int column,
                         final List<String> params, final String specUrl,
                         @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        this.addBuiltError(
                ValidationErrorUtils.populateError(
                        ValidatorProtos.ValidationError.Severity.ERROR,
                        validationErrorCode,
                        line, column, params, specUrl),
                validationResult);
        validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
    }

    /**
     * Add an error field to validationResult with severity WARNING.
     *
     * @param validationErrorCode Error code
     * @param lineCol             a line / column pair.
     * @param params              a list of params.
     * @param specUrl             a link (URL) to the amphtml spec
     * @param validationResult    a ValidationResult object.
     */
    public void addWarning(@Nonnull final ValidatorProtos.ValidationError.Code validationErrorCode,
                           @Nonnull final Locator lineCol,
                           final List<String> params, final String specUrl,
                           @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        this.addBuiltError(
                ValidationErrorUtils.populateError(
                        ValidatorProtos.ValidationError.Severity.WARNING, validationErrorCode,
                        lineCol, params, specUrl),
                validationResult);
    }

    /**
     * Returns a line/col pair.
     *
     * @return returns a line/col pair.
     */
    public Locator getLineCol() {
        return docLocator;
    }

    /**
     * Setting the LineCol.
     *
     * @param lineCol a pair line/col.
     */
    public void setLineCol(@Nonnull final Locator lineCol) {
        this.docLocator = lineCol;
    }

    /**
     * Returns the ParsedValidatorRules.
     *
     * @return returns the ParsedValidatorRules object.
     */
    public ParsedValidatorRules getRules() {
        return rules;
    }

    /**
     * Returns the tag stack.
     *
     * @return returns the tag stack.
     */
    public TagStack getTagStack() {
        return tagStack;
    }

    /**
     * Record the type identifier in this document.
     *
     * @param typeIdentifier type identifier.
     */
    public void recordTypeIdentifier(@Nonnull final String typeIdentifier) {
        this.typeIdentifiers.add(typeIdentifier);
    }

    /**
     * Returns the type identifiers in this document.
     *
     * @return returns the type identifiers.
     */
    public List<String> getTypeIdentifiers() {
        return this.typeIdentifiers;
    }

    /**
     * @return returns the extensions of the current validation job.
     */
    public ExtensionsContext getExtensions() {
        return extensions;
    }

    /**
     * Returns the tag spec ids that have been validated. The return object
     * should be treated as a set (the object keys), and the value should be
     * ignored.
     *
     * @return returns validated tag specs.
     */
    public Map<Integer, Boolean> getTagspecsValidated() {
        return this.tagspecsValidated;
    }

    /**
     * Returns the boolean value of true if exists.
     *
     * @param id tag spec id.
     * @return returns the boolean value of true if exists.
     */
    public boolean hasTagspecsValidated(final int id) {
        Boolean b = tagspecsValidated.get(id);
        if (b == null) {
            return false;
        }

        return b.booleanValue();
    }

    /**
     * Records how much of the document is used towards &lt;style amp-custom&gt;.
     *
     * @param byteSize byte size.
     */
    public void addStyleTagByteSize(final int byteSize) {
        this.styleTagByteSize += byteSize;
    }

    /**
     * Records how much of the document is used towards inline style.
     *
     * @param byteSize integer to add to running inline style byte size.
     */
    public void addInlineStyleByteSize(final int byteSize) {
        this.inlineStyleByteSize += byteSize;
    }

    /**
     * Returns the size of inline styles.
     *
     * @return returns running inline style byte size.
     */
    public int getInlineStyleByteSize() {
        return this.inlineStyleByteSize;
    }

    /**
     * Returns the size of style amp-custom.
     *
     * @return returns the size of style of amp-custom
     */
    public int getStyleTagByteSize() {
        return this.styleTagByteSize;
    }

    /**
     * Returns true iff "transformed" is a type identifier in this document.
     *
     * @return returns true iff "transformed" is a type identifier in this document.
     */
    public boolean isTransformed() {
        return this.typeIdentifiers.contains("transformed");
    }

    /**
     * Returns true iff the current context has observed a tag which contains
     * an URL. This is set by calling markUrlSeen_ above.
     *
     * @return returns true if first url seen tag is not null.
     */
    public boolean hasSeenUrl() {
        return this.firstUrlSeenTag != null;
    }

    /**
     * @param condition the condition.
     * @return returns true if condition exists.
     */
    public boolean satisfiesCondition(@Nonnull final String condition) {
        return this.conditionsSatisfied.containsKey(condition);
    }

    /**
     * The TagSpecName of the first seen URL. Do not call unless HasSeenUrl
     * returns true.
     *
     * @return returns TagSpecName of the first seen URL.
     */
    public String firstSeenUrlTagName() {
        return TagSpecUtils.getTagSpecName(this.firstUrlSeenTag);
    }

    /**
     * The mandatory alternatives that we've satisfied. This may contain
     * duplicates (we'd have to filter them in record... above if we cared).
     *
     * @return returns the mandatory alternatives that we've satisfied.
     */
    public List<String> getMandatoryAlternativesSatisfied() {
        return this.mandatoryAlternativesSatisfied;
    }

    /**
     * getter for scriptReleaseVersion
     *
     * @return the associated script release version.
     */
    public ExtensionsUtils.ScriptReleaseVersion getScriptReleaseVersion() {
        return this.scriptReleaseVersion;
    }

    /**
     * @param provision a ValueSetProvision.
     * @return A key for valueSetsProvided and valueSetsRequired.
     */
    private String keyFromValueSetProvision(@Nonnull final ValidatorProtos.ValueSetProvision provision) {
        return (provision.hasSet() ? provision.getSet() : "")
                + ">"
                + (provision.hasValue() ? provision.getValue() : "");
    }

    /**
     * Returns the first (there should be at most one) DocCssSpec which matches
     * both the html format and type identifiers recorded so far in this
     * context. If called before identifiers have been recorded, it may return
     * an incorrect selection.
     *
     * @return ParsedDocCssSpec
     */
    public ParsedDocCssSpec matchingDocCssSpec() {
        // The specs are usually already filtered by HTML format, so this loop
        // should be very short, often 1:
        for (ParsedDocCssSpec spec : this.rules.getCss()) {
            if (this.rules.isDocCssSpecCorrectHtmlFormat(spec.getSpec()) && this.isDocCssSpecValidForTypeIdentifiers(spec)) {
                return spec;
            }
        }
        return null;
    }

    /**
     * Returns true iff `spec` should be used for the type identifiers recorded
     * in this context, as seen in the document so far. If called before type
     * identifiers have been recorded, will always return false.
     *
     * @param spec
     * @return true iff `spec` should be used for the type identifiers recorded in context
     */
    private boolean isDocCssSpecValidForTypeIdentifiers(final ParsedDocCssSpec spec) {
        return isUsedForTypeIdentifiers(
                this.getTypeIdentifiers(), spec.enabledBy(), spec.disabledBy());
    }

    /**
     * An instance of ParsedValidatorRules.
     */
    private ParsedValidatorRules rules;

    /**
     * The mandatory alternatives that we've validated (a small list of ids).
     */
    private List<String> mandatoryAlternativesSatisfied;

    /**
     * DocLocator object from the parser which gives us line/col numbers.
     */
    private Locator docLocator = null;

    /**
     * An instance of TagStack.
     */
    private TagStack tagStack = null;

    /**
     * Set of tagSpec ids that have been validated.
     */
    private Map<Integer, Boolean> tagspecsValidated;

    /**
     * Size of &lt;style amp-custom&gt;.
     */
    private int styleTagByteSize = 0;

    /**
     * Size of all inline styles (style attribute) combined.
     */
    private int inlineStyleByteSize = 0;

    /**
     * Set of type identifiers in this document.
     */
    private List<String> typeIdentifiers;

    /**
     * All the value set provisions so far.
     */
    private Set<String> valueSetsProvided;

    /**
     * All the value set requirements so far.
     */
    private Map<String, List<ValidatorProtos.ValidationError>> valueSetsRequired;

    /**
     * Set of conditions that we've satisfied.
     */
    private Map<String, Boolean> conditionsSatisfied;

    /**
     * First tag spec seen (matched) which contains an URL.
     */
    private ValidatorProtos.TagSpec firstUrlSeenTag = null;

    /**
     * Extension-specific context.
     */
    private ExtensionsContext extensions;

    /**
     * flag for LTS runtime engine present
     */
    private ExtensionsUtils.ScriptReleaseVersion scriptReleaseVersion;
}
