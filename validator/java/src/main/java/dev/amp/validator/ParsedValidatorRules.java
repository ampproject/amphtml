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
import dev.amp.validator.exception.ValidatorException;
import dev.amp.validator.utils.AttributeSpecUtils;
import dev.amp.validator.utils.DispatchKeyUtils;
import dev.amp.validator.utils.TagSpecUtils;
import org.xml.sax.Attributes;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * This wrapper class provides access to the validation rules.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedValidatorRules {
    /**
     * Constructor.
     * @param htmlFormat the HTML format.
     * @param ampValidatorManager the AMPValidatorManager instance.
     */
    public ParsedValidatorRules(@Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat,
                                @Nonnull final AMPValidatorManager ampValidatorManager) {
        this.ampValidatorManager = ampValidatorManager;

        this.htmlFormat = htmlFormat;
        this.parsedTagSpecById = new HashMap<>();
        this.tagSpecByTagName = new HashMap<>();
        this.mandatoryTagSpecs = new ArrayList<>();
        this.fullMatchRegexes = new HashMap<>();
        this.fullMatchCaseiRegexes = new HashMap<>();
        this.partialMatchCaseiRegexes = new HashMap<>();

        this.typeIdentifiers = new HashMap<>();
        typeIdentifiers.put("⚡", 0);
        typeIdentifiers.put("amp", 0);
        typeIdentifiers.put("⚡4ads", 0);
        typeIdentifiers.put("amp4ads", 0);
        typeIdentifiers.put("⚡4email", 0);
        typeIdentifiers.put("amp4email", 0);
        typeIdentifiers.put("actions", 0);
        typeIdentifiers.put("transformed", 0);
        typeIdentifiers.put("data-ampdevmode", 0);

        expandExtensionSpec();

        this.parsedAttrSpecs = new ParsedAttrSpecs(ampValidatorManager);

        this.tagSpecIdsToTrack = new HashMap<>();
        final int numTags = this.ampValidatorManager.getRules().getTagsList().size();
        for (int tagSpecId = 0; tagSpecId < numTags; ++tagSpecId) {
            final ValidatorProtos.TagSpec tag = this.ampValidatorManager.getRules().getTags(tagSpecId);
            if (!this.isTagSpecCorrectHtmlFormat(tag)) {
                continue;
            }

            if (tag.hasSpecName()) {
                tagSpecNameToSpecId.put(tag.getSpecName(), tagSpecId);
            }

            if (tag.getAlsoRequiresTagWarningList().size() > 0) {
                this.tagSpecIdsToTrack.put(tagSpecId, true);
            }

            for (String otherTag : tag.getAlsoRequiresTagWarningList()) {
                this.tagSpecIdsToTrack.put(otherTag, true);
            }

            if (!tag.getTagName().equals("$REFERENCE_POINT")) {
                if (!(tagSpecByTagName.containsKey(tag.getTagName()))) {
                    this.tagSpecByTagName.put(tag.getTagName(), new TagSpecDispatch());
                }

                final TagSpecDispatch tagnameDispatch = this.tagSpecByTagName.get(tag.getTagName());
                if (tag.hasExtensionSpec()) {
                    // This tag is an extension. Compute and register a dispatch key
                    // for it.
                    String dispatchKey = DispatchKeyUtils.makeDispatchKey(
                            ValidatorProtos.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH,
                            AttributeSpecUtils.getExtensionNameAttribute(tag.getExtensionSpec()),
                            tag.getExtensionSpec().getName(), "");
                    tagnameDispatch.registerDispatchKey(dispatchKey, tagSpecId);
                } else {
                    String dispatchKey = this.ampValidatorManager.getDispatchKeyByTagSpecId(tagSpecId);
                    if (dispatchKey == null) {
                        tagnameDispatch.registerTagSpec(tagSpecId);
                    } else {
                        tagnameDispatch.registerDispatchKey(dispatchKey, tagSpecId);
                    }
                }
            }

            if (tag.hasMandatory()) {
                this.mandatoryTagSpecs.add(tagSpecId);
            }
        }

        this.errorCodes = new HashMap<>();
        for (int i = 0; i < this.ampValidatorManager.getRules().getErrorFormatsList().size(); ++i) {
            final ValidatorProtos.ErrorFormat errorFormat =
                    this.ampValidatorManager.getRules().getErrorFormats(i);
            if (errorFormat != null) {
                ErrorCodeMetadata errorCodeMetadata = new ErrorCodeMetadata();
                errorCodeMetadata.setFormat(errorFormat.getFormat());
                errorCodes.put(errorFormat.getCode(), errorCodeMetadata);
            }
        }

        for (int i = 0; i < this.ampValidatorManager.getRules().getErrorSpecificityList().size(); ++i) {
            final ValidatorProtos.ErrorSpecificity errorSpecificity =
                    this.ampValidatorManager.getRules().getErrorSpecificity(i);
            if (errorSpecificity != null) {
                ErrorCodeMetadata errorCodeMetadata = errorCodes.get(errorSpecificity.getCode());
                if (errorCodeMetadata != null) {
                    errorCodeMetadata.setSpecificity(errorSpecificity.getSpecificity());
                }
            }
        }
    }

    /**
     * TODO - verify ALL regex getXXX() to ensure proper implementation
     * @param regex the regex.
     * @return returns the full match regex pattern.
     */
    public Pattern getFullMatchRegex(@Nonnull final String regex) {
        String regexEscape = regex.replace("{", "\\{");

        for (String fullMatchRegex : fullMatchRegexes.keySet()) {
            if (fullMatchRegex.equals(regex))  {
                return fullMatchRegexes.get(regexEscape);
            }
        }
        String fullMatchRegex = "^(" + regexEscape + ")$";
        Pattern pattern = Pattern.compile(fullMatchRegex);
        fullMatchRegexes.put(regexEscape, pattern);

        return pattern;
    }

    /**
     * @param caseiRegex case insensitive regex.
     * @return returns the full match case insensitive regex pattern.
     */
    public Pattern getFullMatchCaseiRegex(@Nonnull final String caseiRegex) {
        String caseiRegexEscape = caseiRegex.replace("{", "\\{");

        for (String fullMatchRegex : fullMatchCaseiRegexes.keySet()) {
            if (fullMatchRegex.equals(caseiRegexEscape))  {
                return fullMatchCaseiRegexes.get(caseiRegexEscape);
            }
        }

        Pattern pattern = Pattern.compile("^(" + caseiRegexEscape + ")$");
        this.fullMatchCaseiRegexes.put(caseiRegexEscape, pattern);
        return pattern;
    }

    /**
     * Returns the partial match case insensitive match regex pattern.
     *
     * @param caseiRegex the regex.
     * @return returns the partial match case insensitive match regex pattern.
     */
    public Pattern getPartialMatchCaseiRegex(@Nonnull final String caseiRegex) {
        final String caseiRegexEscape = caseiRegex.replace("{", "\\{");

        for (String fullMatchRegex : partialMatchCaseiRegexes.keySet()) {
            if (fullMatchRegex.equals(caseiRegexEscape))  {
                return partialMatchCaseiRegexes.get(caseiRegexEscape);
            }
        }

        Pattern pattern = Pattern.compile(caseiRegexEscape);
        partialMatchCaseiRegexes.put(caseiRegexEscape, pattern);

        return pattern;
    }

    /**
     * Computes the name for a given reference point.
     * Used in generating error strings.
     * @param referencePoint the reference point.
     * @throws TagValidationException the TagValidationException.
     * @return returns the compute name for a given reference point.
     */
    public String getReferencePointName(@Nonnull final ValidatorProtos.ReferencePoint referencePoint)
            throws TagValidationException {
        // tagSpecName here is actually a number, which was replaced in
        // validator_gen_js.py from the name string, so this works.
        final int tagSpecId =
                ampValidatorManager.getTagSpecIdByReferencePointTagSpecName(referencePoint.getTagSpecName());
        final ParsedTagSpec refPointSpec = this.getByTagSpecId(tagSpecId);
        return TagSpecUtils.getTagSpecName(refPointSpec.getSpec());
    }

    /**
     * Return the ParsedTagSpec given the reference point spec name.
     * @param specName the spec name.
     * @throws TagValidationException the TagValidationException.
     * @return return the ParsedTagSpec given the reference point spec name.
     */
    public ParsedTagSpec getByTagSpecId(final String specName) throws TagValidationException {
        int tagSpecId = this.ampValidatorManager.getTagSpecIdByReferencePointTagSpecName(specName);
        return getByTagSpecId(tagSpecId);
    }

    /**
     * Returns the spec id by spec name.
     * @param specName the spec name.
     * @return returns the spec id if exists.
     */
    public Integer getTagSpecIdBySpecName(@Nonnull final String specName) {
        return tagSpecNameToSpecId.get(specName);
    }

    /**
     * Returns the ParsedTagSpec given the tag spec id.
     * @param id tag spec id.
     * @throws TagValidationException the TagValidationException.
     * @return returns the ParsedTagSpec.
     */
    public ParsedTagSpec getByTagSpecId(final int id) throws TagValidationException {
        ParsedTagSpec parsed = this.parsedTagSpecById.get(id);
        if (parsed != null) {
            return parsed;
        }

        ValidatorProtos.TagSpec tag = this.ampValidatorManager.getRules().getTags(id);
        if (tag == null) {
            throw new TagValidationException("TagSpec is null for tag spec id " + id);
        }

        parsed = new ParsedTagSpec(
                this.parsedAttrSpecs,
                TagSpecUtils.shouldRecordTagspecValidated(tag, id, this.tagSpecIdsToTrack), tag,
                id);
        this.parsedTagSpecById.put(id, parsed);
        return parsed;
    }

    /**
     * Returns the tag spec id by reference point tag spec name.
     * @param tagName the reference point tag name.
     * @throws TagValidationException the TagValidationException.
     * @return returns the tag spec id by reference point tag spec name.
     */
    public int getTagSpecIdByReferencePointTagSpecName(@Nonnull final String tagName) throws TagValidationException {
        return this.ampValidatorManager.getTagSpecIdByReferencePointTagSpecName(tagName);
    }

    /**
     * Returns true iff resultA is a better result than resultB.
     * @param resultA a validation result.
     * @param resultB a validation result.
     * @throws ValidatorException the ValidatorException.
     * @return returns true iff resultA is a better result than resultB.
     */
    public boolean betterValidationResultThan(@Nonnull final ValidatorProtos.ValidationResult.Builder resultA,
                                              @Nonnull final ValidatorProtos.ValidationResult.Builder resultB)
                                            throws ValidatorException {
        if (resultA.getStatus() != resultB.getStatus()) {
            return this.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus());
        }

        // If one of the error sets by error.code is a subset of the other
        // error set's error.codes, use the subset one. It's essentially saying, if
        // you fix these errors that we both complain about, then you'd be passing
        // for my tagspec, but not the other one, regardless of specificity.
        if (this.isErrorSubset(resultB.getErrorsList(), resultA.getErrorsList())) {
            return true;
        }

        if (this.isErrorSubset(resultA.getErrorsList(), resultB.getErrorsList())) {
            return false;
        }

        // Prefer the most specific error found in either set.
        if (this.maxSpecificity(resultA.getErrorsList())
                > this.maxSpecificity(resultB.getErrorsList())) {
            return true;
        }
        if (this.maxSpecificity(resultB.getErrorsList())
                > this.maxSpecificity(resultA.getErrorsList())) {
            return false;
        }

        // Prefer the attempt with the fewest errors if the most specific errors
        // are the same.
        if (resultA.getErrorsCount() < resultB.getErrorsCount()) {
            return true;
        }
        if (resultB.getErrorsCount() < resultA.getErrorsCount()) {
            return false;
        }

        // Equal, so not better than.
        return false;
    }

    /**
     * Checks if maybeTypeIdentifier is contained in rules' typeIdentifiers.
     * @param maybeTypeIdentifier identifier to check
     * @return true iff maybeTypeIdentifier is in typeIdentifiers.
     */
    public boolean isTypeIdentifier(@Nonnull final String maybeTypeIdentifier) {
        return this.typeIdentifiers.containsKey(maybeTypeIdentifier);
    }

    /**
     * Validates type identifiers within a set of attributes, adding
     * ValidationErrors as necessary, and sets type identifiers on
     * ValidationResult.typeIdentifier.
     * @param attrs sax Attributes object from tag.
     * @param formatIdentifiers html formats
     * @param context global context of document validation
     * @param validationResult status of document validation
     */
    public void validateTypeIdentifiers(@Nonnull final Attributes attrs,
                                        @Nonnull final List<String> formatIdentifiers, @Nonnull final Context context,
                                        @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        boolean hasMandatoryTypeIdentifier = false;
        for (int i = 0; i < attrs.getLength(); i++) {
            // Verify this attribute is a type identifier. Other attributes are
            // validated in validateAttributes.
            if (this.isTypeIdentifier(attrs.getLocalName(i))) {
                // Verify this type identifier is allowed for this format.
                if (formatIdentifiers.contains(attrs.getLocalName(i))) {
                    // Only add the type identifier once per representation. That is, both
                    // "⚡" and "amp", which represent the same type identifier.
                    final String typeIdentifier = attrs.getLocalName(i).replace("⚡", "amp");
                    if (!validationResult.getTypeIdentifierList().contains(typeIdentifier)) {
                        validationResult.addTypeIdentifier(typeIdentifier);
                        context.recordTypeIdentifier(typeIdentifier);
                    }
                    // The type identifier "actions" and "transformed" are not considered
                    // mandatory unlike other type identifiers.
                    if (!typeIdentifier.equals("actions")
                            && !typeIdentifier.equals("transformed")
                            && !typeIdentifier.equals("data-ampdevmode")) {
                        hasMandatoryTypeIdentifier = true;
                    }
                    // The type identifier "transformed" has restrictions on it's value.
                    // It must be \w+;v=\d+ (e.g. google;v=1).
                    if ((typeIdentifier.equals("transformed") && !(attrs.getValue(i).equals("")))) {
                        Matcher reResult = TRANSFORMED_VALUE_REGEX.matcher(attrs.getValue(i));
                        if (reResult.matches()) {
                            validationResult.setTransformerVersion(Integer.parseInt(reResult.group(1)));
                        } else {
                            final List<String> params = new ArrayList<>();
                            params.add(attrs.getLocalName(i));
                            params.add("html");
                            params.add(attrs.getValue(i));
                            context.addError(
                                    ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
                                    context.getLineCol(),
                                    /*params=*/params,
                            "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup",
                                    validationResult);
                        }
                    }
                    if (typeIdentifier.equals("data-ampdevmode")) {
                        // https://github.com/ampproject/amphtml/issues/20974
                        // We always emit an error for this type identifier, but it
                        // suppresses other errors later in the document.
                        context.addError(
                                ValidatorProtos.ValidationError.Code.DEV_MODE_ONLY,
                                context.getLineCol(), /*params=*/new ArrayList<>(), /*url*/ "",
                                validationResult);
                    }
                } else {
                    final List<String> params = new ArrayList<>();
                    params.add(attrs.getLocalName(i));
                    params.add("html");
                    context.addError(
                            ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
                            context.getLineCol(), /*params=*/params,
                    "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup",
                            validationResult);
                }
            }
        }
        if (!hasMandatoryTypeIdentifier) {
            // Missing mandatory type identifier (any AMP variant but "actions" or
            // "transformed").
            final List<String> params = new ArrayList<>();
            params.add(formatIdentifiers.get(0));
            params.add("html");
            context.addError(
                    ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
                    context.getLineCol(), /*params=*/params,
            "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup",
                    validationResult);
        }
    }

    /**
     * Validates the HTML tag for type identifiers.
     * @param htmlTag the html tag to validate.
     * @param context global context of document validation
     * @param validationResult status of document validation
     */
    public void validateHtmlTag(@Nonnull final ParsedHtmlTag htmlTag,
                                @Nonnull final Context context,
                                @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        switch (this.htmlFormat) {
            case AMP:
                this.validateTypeIdentifiers(
                        htmlTag.attrs(), TagSpecUtils.AMP_IDENTIFIERS, context, validationResult);
                break;
            case AMP4ADS:
                this.validateTypeIdentifiers(
                        htmlTag.attrs(), TagSpecUtils.AMP4ADS_IDENTIFIERS, context, validationResult);
                break;
            case AMP4EMAIL:
                this.validateTypeIdentifiers(
                        htmlTag.attrs(), TagSpecUtils.AMP4EMAIL_IDENTIFIERS, context, validationResult);
                break;
            case ACTIONS:
                this.validateTypeIdentifiers(
                        htmlTag.attrs(), TagSpecUtils.ACTIONS_IDENTIFIERS, context,  validationResult);

                if (!validationResult.getTypeIdentifierList().contains("actions")) {
                    final List<String> params = new ArrayList<>();
                    params.add("actions");
                    params.add("html");
                    context.addError(
                            ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING,
                            context.getLineCol(), /* params */params,
                            /* url */"", validationResult);
                }
                break;
            default:
                // fallthrough
        }
    }

    /**
     * Returns the error code specificity.
     * @param errorCode the validation error code.
     * @return returns the error code specificity.
     */
    public int specificity(@Nonnull final ValidatorProtos.ValidationError.Code errorCode) {
        return this.errorCodes.get(errorCode).getSpecificity();
    }

    /**
     * A helper function which allows us to compare two candidate results
     * in validateTag to report the results which have the most specific errors.
     * @param errors a list of validation errors.
     * @throws ValidatorException the TagValidationException.
     * @return returns maximum value of specificity found in all errors.
     */
    public int maxSpecificity(@Nonnull final List<ValidatorProtos.ValidationError> errors) throws ValidatorException {
        int max = 0;
        for (final ValidatorProtos.ValidationError error : errors) {
            if (error.getCode() == null) {
                throw new ValidatorException("Validation error code is null");
            }
            max = Math.max(this.specificity(error.getCode()), max);
        }
        return max;
    }

    /**
     * Returns true iff the error codes in errorsB are a subset of the error
     * codes in errorsA.
     * @param errorsA a list of validation errors.
     * @param errorsB a list of validation errors.
     * @return returns true iff the error codes in errorsB are a subset of the error
     * codes in errorsA.
     */
    public boolean isErrorSubset(@Nonnull final List<ValidatorProtos.ValidationError> errorsA,
                                 @Nonnull final List<ValidatorProtos.ValidationError> errorsB) {
        Map<ValidatorProtos.ValidationError.Code, Integer> codesA = new HashMap<>();
        for (final ValidatorProtos.ValidationError error : errorsA) {
            codesA.put(error.getCode(), 1);
        }

        Map<ValidatorProtos.ValidationError.Code, Integer> codesB = new HashMap<>();
        for (final ValidatorProtos.ValidationError error : errorsB) {
            codesB.put(error.getCode(), 1);
            if (!codesA.containsKey(error.getCode())) {
                return false;
            }
        }

        // Every code in B is also in A. If they are the same, not a subset.
        return  codesA.size() > codesB.size();
    }

    /**
     * Returns true iff statusA is a better status than statusB.
     * @param statusA validation result status.
     * @param statusB validation result status.
     * @throws ValidatorException the ValidatorException.
     * @return returns true iff statusA is a better status than statusB.
     */
    public boolean betterValidationStatusThan(@Nonnull final ValidatorProtos.ValidationResult.Status statusA,
                                              @Nonnull final ValidatorProtos.ValidationResult.Status statusB)
                                            throws ValidatorException {
        // Equal, so not better than.
        if (statusA == statusB) {
            return false;
        }

        // PASS > FAIL > UNKNOWN
        if (statusA == ValidatorProtos.ValidationResult.Status.PASS) {
            return true;
        }

        if (statusB == ValidatorProtos.ValidationResult.Status.PASS) {
            return false;
        }

        if (statusA == ValidatorProtos.ValidationResult.Status.FAIL) {
            return true;
        }

        if (statusA == ValidatorProtos.ValidationResult.Status.UNKNOWN) {
            throw new ValidatorException("Status unknown");
        }

        return false;
    }

    /**
     * Returns a TagSpecDispatch for a give tag name.
     * @param tagName the tag name.
     * @return returns a TagSpecDispatch if found.
     */
    public TagSpecDispatch dispatchForTagName(@Nonnull final String tagName) {
        return this.tagSpecByTagName.get(tagName);
    }

    /**
     * Returns a styles spec url.
     * @return returns a styles spec url.
     */
    public String getStylesSpecUrl() {
        return this.ampValidatorManager.getRules().getStylesSpecUrl();
    }

    /**
     * Returns a template spec url.
     * @return returns a template spec url.
     */
    public String getTemplateSpecUrl() {
        return this.ampValidatorManager.getRules().getTemplateSpecUrl();
    }

    /**
     * Returns the script spec url.
     * @return returns the script spec url.
     */
    public String getScriptSpecUrl() {
        return this.ampValidatorManager.getRules().getScriptSpecUrl();
    }

    /**
     * Returns the list of Css length spec.
     * @return returns the list of Css length spec.
     */
    public List<ValidatorProtos.CssLengthSpec> getCssLengthSpec() {
        return this.ampValidatorManager.getRules().getCssLengthSpecList();
    }

    /**
     * Returns the descendant tag lists.
     * @return returns the descendant tag lists.
     */
    public List<ValidatorProtos.DescendantTagList> getDescendantTagLists() {
        return ampValidatorManager.getDescendantTagLists();
    }

    /**
     * Returns a combined black listed regex.
     * @param tagSpecId tag spec id.
     * @return returns a combined black listed regex.
     */
    public String getCombinedBlacklistedCdataRegex(final int tagSpecId) {
        return ampValidatorManager.getCombinedBlacklistedCdataRegex(tagSpecId);
    }

    /**
     * Emits any validation errors which require a global view
     * (mandatory tags, tags required by other tags, mandatory alternatives).
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitGlobalTagValidationErrors(@Nonnull final Context context,
                                                   @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                            throws TagValidationException {
        this.maybeEmitMandatoryTagValidationErrors(context, validationResult);
        this.maybeEmitAlsoRequiresTagValidationErrors(context, validationResult);
        this.maybeEmitMandatoryAlternativesSatisfiedErrors(
                context, validationResult);
        this.maybeEmitCssLengthSpecErrors(context, validationResult);
        this.maybeEmitValueSetMismatchErrors(context, validationResult);
    }

    /**
     * Emits errors when there is a ValueSetRequirement with no matching
     * ValueSetProvision in the document.
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitValueSetMismatchErrors(@Nonnull final Context context,
                                                @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                            throws TagValidationException {
        final Set<String> providedKeys = context.valueSetsProvided();
        for (final String requiredKey : context.valueSetsRequired().keySet()) {
            if (!providedKeys.contains(requiredKey)) {
                context.valueSetsRequired().get(requiredKey);
                for (final ValidatorProtos.ValidationError error :  context.valueSetsRequired().get(requiredKey)) {
                    context.addBuiltError(error, validationResult);
                }
            }
        }
    }

    /**
     * Emits errors for css size limitations across entire document.
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitCssLengthSpecErrors(@Nonnull final Context context,
                                             @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
            throws TagValidationException {
        // Only emit an error if there have been inline styles used. Otherwise
        // if there was to be an error it would have been caught by
        // CdataMatcher::Match().
        if (context.getInlineStyleByteSize() == 0) {
            return;
        }

        final int bytesUsed =
                context.getInlineStyleByteSize() + context.getStyleAmpCustomByteSize();

        for (final ValidatorProtos.CssLengthSpec cssLengthSpec : getCssLengthSpec()) {
            if (!this.isCssLengthSpecCorrectHtmlFormat(cssLengthSpec)) {
                continue;
            }
            if (cssLengthSpec.hasMaxBytes() && bytesUsed > cssLengthSpec.getMaxBytes()) {
                final List<String> params = new ArrayList<>();
                params.add(String.valueOf(bytesUsed));
                params.add(String.valueOf(cssLengthSpec.getMaxBytes()));
                context.addError(
                        ValidatorProtos.ValidationError.Code
                                .STYLESHEET_AND_INLINE_STYLE_TOO_LONG,
                        context.getLineCol(), /* params */
                        params,
                        /* specUrl */ cssLengthSpec.getSpecUrl(), validationResult);
            }
        }
    }

    /**
     * Emits errors for tags that are specified as mandatory alternatives.
     * Returns false iff context.Progress(result).complete.
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitMandatoryAlternativesSatisfiedErrors(@Nonnull final Context context,
                                                              @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
        throws TagValidationException {
        final List<String> satisfied = context.getMandatoryAlternativesSatisfied();
        /** @type {!Array<string>} */
        final List<String> missing = new ArrayList<>();
        Map<String, String> specUrlsByMissing = new HashMap<>();
        for (final ValidatorProtos.TagSpec tagSpec : this.ampValidatorManager.getRules().getTagsList()) {
            if (!tagSpec.hasMandatoryAlternatives() || !this.isTagSpecCorrectHtmlFormat(tagSpec)) {
                continue;
            }
            final String alternative = tagSpec.getMandatoryAlternatives();
            if (satisfied.indexOf(alternative) == -1) {
                if (!missing.contains(alternative)) {
                    missing.add(alternative);
                    specUrlsByMissing.put(alternative, TagSpecUtils.getTagSpecUrl(tagSpec));
                }
            }
        }
        //sortAndUniquify(missing);
        for (final String tagMissing : missing) {
            final List<String> params = new ArrayList<>();
            params.add(tagMissing);
            context.addError(
                    ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING,
                    context.getLineCol(),
                    params,
                    /* specUrl */ specUrlsByMissing.get(tagMissing),
                    validationResult);
        }
    }

    /**
     * Emits errors for tags that are specified to be mandatory.
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitMandatoryTagValidationErrors(@Nonnull final Context context,
                                                      @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                    throws TagValidationException {
        for (int tagSpecId : this.mandatoryTagSpecs) {
            final ParsedTagSpec parsedTagSpec = this.getByTagSpecId(tagSpecId);
            // Skip TagSpecs that aren't used for these type identifiers.
            if (!parsedTagSpec.isUsedForTypeIdentifiers(
                    context.getTypeIdentifiers())) {
                continue;
            }

            if (!context.getTagspecsValidated().containsKey(tagSpecId)) {
                final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
                final List<String> params = new ArrayList<>();
                params.add(TagSpecUtils.getTagSpecName(spec));
                context.addError(
                        ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(spec),
                        validationResult);
            }
        }
    }

    /**
     * Emits errors for tags that specify that another tag is also required or
     * a condition is required to be satisfied.
     * Returns false iff context.Progress(result).complete.
     * @param context the Context.
     * @param validationResult the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void maybeEmitAlsoRequiresTagValidationErrors(@Nonnull final Context context,
                                                         @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                                    throws TagValidationException {
        for (final int tagSpecId : context.getTagspecsValidated().keySet()) {
            final ParsedTagSpec parsedTagSpec = this.getByTagSpecId(tagSpecId);
            // Skip TagSpecs that aren't used for these type identifiers.
            if (!parsedTagSpec.isUsedForTypeIdentifiers(
                    context.getTypeIdentifiers())) {
                continue;
            }
            for (final String condition : parsedTagSpec.requires()) {
                if (!context.satisfiesCondition(condition)) {
                    final List<String> params = new ArrayList<>();
                    params.add(condition);
                    params.add(TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()));
                    context.addError(
                            ValidatorProtos.ValidationError.Code.TAG_REQUIRED_BY_MISSING,
                            context.getLineCol(),
                            params,
                            TagSpecUtils.getTagSpecUrl(parsedTagSpec.getSpec()),
                            validationResult);
                }
            }
            for (final String condition : parsedTagSpec.excludes()) {
                if (context.satisfiesCondition(condition)) {
                    final List<String> params = new ArrayList<>();
                    params.add(TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()));
                    params.add(condition);
                    context.addError(
                            ValidatorProtos.ValidationError.Code.TAG_EXCLUDED_BY_TAG,
                            context.getLineCol(),
                            params,
                            TagSpecUtils.getTagSpecUrl(parsedTagSpec.getSpec()),
                            validationResult);
                }
            }
            for (final String requiresTagWarning : parsedTagSpec.getAlsoRequiresTagWarning()) {
                final Integer tagSpecIdObj = getTagSpecIdBySpecName(requiresTagWarning);
                if (tagSpecIdObj == null || !context.getTagspecsValidated().containsKey(tagSpecIdObj)) {
                    final ParsedTagSpec alsoRequiresTagspec = this.getByTagSpecId(tagSpecIdObj);
                    final List<String> params = new ArrayList<>();
                    params.add(TagSpecUtils.getTagSpecName(alsoRequiresTagspec.getSpec()));
                    params.add(TagSpecUtils.getTagSpecName(parsedTagSpec.getSpec()));
                    context.addWarning(
                            ValidatorProtos.ValidationError.Code.WARNING_TAG_REQUIRED_BY_MISSING,
                            context.getLineCol(),
                            params,
                            TagSpecUtils.getTagSpecUrl(parsedTagSpec.getSpec()),
                            validationResult);
                }
            }
        }

        final ExtensionsContext extensionsCtx = context.getExtensions();
        final List<String> unusedRequired = extensionsCtx.unusedExtensionsRequired();
        for (final String unusedExtensionName : unusedRequired) {
            final List<String> params = new ArrayList<>();
            params.add(unusedExtensionName);
            context.addError(
                    ValidatorProtos.ValidationError.Code.EXTENSION_UNUSED,
                    context.getLineCol(),
                    params,
                    /* specUrl */ "", validationResult);
        }
    }


    /**
     * Returns true if Css length spec's html format is equal to this html format.
     * @param cssLengthSpec the CssLengthSpec.
     * @return returns true of Css length spec's html format is same as this html format.
     */
    private boolean isCssLengthSpecCorrectHtmlFormat(@Nonnull final ValidatorProtos.CssLengthSpec cssLengthSpec) {
        return cssLengthSpec.hasHtmlFormat() ? cssLengthSpec.getHtmlFormat() == htmlFormat : false;
    }

    /**
     * Returns true if TagSpec's html format is the same as this html format.
     * @param tagSpec the TagSpec.
     * @return returns true if TagSpec's html format is the same as this html format.
     */
    private boolean isTagSpecCorrectHtmlFormat(@Nonnull final ValidatorProtos.TagSpec tagSpec) {
        for (final ValidatorProtos.HtmlFormat.Code htmlFormatCode : tagSpec.getHtmlFormatList()) {
            if (htmlFormatCode == htmlFormat) {
                return true;
            }
        }

        return false;
    }

    /**
     * For every tagspec that contains an ExtensionSpec, we add several TagSpec
     * fields corresponding to the data found in the ExtensionSpec.
     */
    private void expandExtensionSpec() {
        final int numTags = this.ampValidatorManager.getRules().getTagsList().size();
        for (int tagSpecId = 0; tagSpecId < numTags; ++tagSpecId) {
            ValidatorProtos.TagSpec tagSpec = this.ampValidatorManager.getRules().getTags(tagSpecId);

            if (!tagSpec.hasExtensionSpec()) {
                continue;
            }

            ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
            tagSpecBuilder.mergeFrom(tagSpec);

            if (!tagSpec.hasSpecName()) {
                tagSpecBuilder.setSpecName(tagSpec.getTagName() + " extension .js script");
            }

            tagSpecBuilder.setMandatoryParent("HEAD");
            if (tagSpec.getExtensionSpec().hasDeprecatedAllowDuplicates()) {
                tagSpecBuilder.setUniqueWarning(true);
            } else {
                tagSpecBuilder.setUnique(true);
            }

            ValidatorProtos.CdataSpec cdataSpec = ValidatorProtos.CdataSpec.getDefaultInstance();
            cdataSpec = cdataSpec.toBuilder().setWhitespaceOnly(true).build();
            tagSpecBuilder.setCdata(cdataSpec);

            this.ampValidatorManager.getRules().setTags(tagSpecId, tagSpecBuilder.build());
        }
    }

    /**
     * @return {!ParsedAttrSpecs}
     */
    public ParsedAttrSpecs getParsedAttrSpecs() {
        return this.parsedAttrSpecs;
    }

    /** AmpValidatorManager. */
    private AMPValidatorManager ampValidatorManager;

    /** The HTML format. */
    private ValidatorProtos.HtmlFormat.Code htmlFormat;

    /** ParsedTagSpecs in id order. */
    private Map<Integer, ParsedTagSpec> parsedTagSpecById;

    /** ParsedTagSpecs keyed by name. */
    private Map<String, TagSpecDispatch> tagSpecByTagName;

    /** Tag ids that are mandatory for a document to legally validate. */
    private List<Integer> mandatoryTagSpecs;

    /** A cache for full match regex instantiations. */
    private Map<String, Pattern> fullMatchRegexes;

    /** A cache for full match case insensitive regex instantiation. */
    private  Map<String, Pattern> fullMatchCaseiRegexes;

    /** A cache for partial match case insensitive regex instantiation. */
    private  Map<String, Pattern> partialMatchCaseiRegexes;

    /**
     * Type identifiers which are used to determine the set of validation
     * rules to be applied.
     */
    private Map<String, Integer> typeIdentifiers;

    /** A ParsedAttrSpecs object. */
    private ParsedAttrSpecs parsedAttrSpecs;

    /** A tag spec names to track. */
    private Map<Object, Boolean> tagSpecIdsToTrack;

    /** ErrorCodeMetadata keyed by error code. */
    private Map<ValidatorProtos.ValidationError.Code, ErrorCodeMetadata> errorCodes;

    /** Tag spec name to spec id .*/
    private Map<String, Integer> tagSpecNameToSpecId = new HashMap<>();

    /** Transformed value regex pattern. */
    private static final Pattern TRANSFORMED_VALUE_REGEX = Pattern.compile("^\\w+;v=(\\d+)$");
}
