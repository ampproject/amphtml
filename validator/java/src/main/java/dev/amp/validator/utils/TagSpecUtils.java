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

package dev.amp.validator.utils;

import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.RecordValidated;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.Context;
import dev.amp.validator.CssLength;
import dev.amp.validator.DescendantConstraints;
import dev.amp.validator.ExtensionsContext;
import dev.amp.validator.ParsedHtmlTag;
import dev.amp.validator.ParsedTagSpec;
import dev.amp.validator.TagSpecDispatch;
import dev.amp.validator.TagStack;
import dev.amp.validator.ValidateTagResult;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Tag spec utility methods.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class TagSpecUtils {
    /**
     * Private constructor.
     */
    private TagSpecUtils() {
    }

    /**
     * For creating error URLs, we either find the specUrl in the tag spec or fall
     * back to the extension spec URL if available.
     *
     * @param tagSpec TagSpec instance from the validator.protoscii file.
     * @return returns the tag spec URL.
     */
    public static String getTagSpecUrl(@Nonnull final ValidatorProtos.TagSpec tagSpec) {
        // Handle a ParsedTagSpec as well as a tag spec.
        // TODO(gregable): This is a bit hacky, we should improve on this approach
        // in the future.
        if (tagSpec.hasSpecUrl()) {
            return tagSpec.getSpecUrl();
        }

        final String extensionSpecUrlPrefix = "https://amp.dev/documentation/components/";
        if (tagSpec.hasExtensionSpec() && tagSpec.getExtensionSpec().getName() != null) {
            return extensionSpecUrlPrefix + tagSpec.getExtensionSpec().getName();
        }

        if (tagSpec.getRequiresExtensionCount() > 0) {
            // Return the first |requires_extension|, which should be the most
            // representitive.
            return extensionSpecUrlPrefix + tagSpec.getRequiresExtension(0);
        }

        return "";
    }

    /**
     * For creating error messages, we either find the specName in the tag spec or
     * fall back to the tagName.
     *
     * @param tagSpec TagSpec instance from the validator.protoscii file.
     * @return return the tag spec name.
     */
    public static String getTagSpecName(@Nonnull final ValidatorProtos.TagSpec tagSpec) {
        return (tagSpec.hasSpecName()) ? tagSpec.getSpecName() : tagSpec.getTagName().toLowerCase();
    }

    /**
     * We only track (that is, add them to Context.RecordTagspecValidated) validated
     * tagspecs as necessary. That is, if it's needed for document scope validation:
     * - Mandatory tags
     * - Unique tags
     * - Tags (identified by their TagSpecName() that are required by other tags.
     * @param tag the TagSpec.
     * @param tagSpecId the tag spec id.
     * @param tagSpecIdsToTrack a map of tag spec id to boolean.
     * @return returns a record validated enum value.
     */
    public static RecordValidated shouldRecordTagspecValidated(@Nonnull final ValidatorProtos.TagSpec tag, final int tagSpecId,
                                                               @Nonnull final Map<Object, Boolean> tagSpecIdsToTrack) {
        // Always update from TagSpec if the tag is passing. If it's failing we
        // typically want to update from the best match as it can satisfy
        // requirements which otherwise can confuse the user later. The exception is
        // tagspecs which introduce requirements but satisfy none, such as unique.
        // https://github.com/ampproject/amphtml/issues/24359

        // Mandatory and tagSpecIdsToTrack only satisfy requirements, making the
        // output less verbose even if the tag is failing.
        if (tag.hasMandatory() || tagSpecIdsToTrack.containsKey(tagSpecId)) {
            return RecordValidated.ALWAYS;
        }
        // Unique and similar can introduce requirements, ie: there cannot be another
        // such tag. We don't want to introduce requirements for failing tags.
        if (tag.hasUnique() || tag.getRequiresList().size() > 0 || tag.hasUniqueWarning()) {
            return RecordValidated.IF_PASSING;
        }
        return RecordValidated.NEVER;
    }

    /**
     * Validates the provided |tagName| with respect to the tag
     * specifications in the validator's rules, returning a ValidationResult
     * with errors for this tag and a PASS or FAIL status. At least one
     * specification must validate, or the result will have status FAIL.
     * Also passes back a reference to the tag spec which matched, if a match
     * was found.
     *
     * @param context the context
     * @param encounteredTag the encountered tag
     * @param bestMatchReferencePoint the best match reference point
     * @return returns ValidateTagResult.
     * @throws TagValidationException tag validation exception.
     * @throws ValidatorException tag validation exception.
     * @throws IOException the IOException.
     * @throws CssValidationException Css Validation Exception.
     */
    public static ValidateTagResult validateTag(@Nonnull final Context context,
                                                @Nonnull final ParsedHtmlTag encounteredTag,
                                                final ParsedTagSpec bestMatchReferencePoint)
            throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final TagSpecDispatch tagSpecDispatch =
                context.getRules().dispatchForTagName(encounteredTag.upperName());
        // Filter TagSpecDispatch.AllTagSpecs by type identifiers.
        List<ParsedTagSpec> filteredTagSpecs = new ArrayList<>();
        if (tagSpecDispatch != null) {
            for (Integer tagSpecId : tagSpecDispatch.allTagSpecs()) {
                final ParsedTagSpec parsedTagSpec = context.getRules().getByTagSpecId(tagSpecId);
                // Keep TagSpecs that are used for these type identifiers.
                if (parsedTagSpec.isUsedForTypeIdentifiers(
                        context.getTypeIdentifiers())) {
                    filteredTagSpecs.add(parsedTagSpec);
                }
            }
        }
        // If there are no dispatch keys matching the tag name, ex: tag name is
        // "foo", set a disallowed tag error.
        if (tagSpecDispatch == null
                || (!tagSpecDispatch.hasDispatchKeys() && filteredTagSpecs.size() == 0)) {
            ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();
            String specUrl = "";
            // Special case the spec_url for font tags to be slightly more useful.
            if (encounteredTag.upperName().equals("FONT")) {
                specUrl = context.getRules().getStylesSpecUrl();
            }
            final List<String> params = new ArrayList<>();
            params.add(encounteredTag.lowerName());
            context.addError(
                    ValidatorProtos.ValidationError.Code.DISALLOWED_TAG,
                    context.getLineCol(),
                    params,
                    specUrl,
                    result);

            return new ValidateTagResult(result, null);
        }

        // At this point, we have dispatch keys, tagspecs, or both.
        // The strategy is to look for a matching dispatch key first. A matching
        // dispatch key does not guarantee that the dispatched tagspec will also
        // match. If we find a matching dispatch key, we immediately return the
        // result for that tagspec, success or fail.
        // If we don't find a matching dispatch key, we must try all of the
        // tagspecs to see if any of them match. If there are no tagspecs, we want
        // to return a GENERAL_DISALLOWED_TAG error.
        // calling HasDispatchKeys here is only an optimization to skip the loop
        // over encountered attributes in the case where we have no dispatches.
        if (tagSpecDispatch.hasDispatchKeys()) {
            for (int i = 0; i < encounteredTag.attrs().getLength(); i++) {
                final String name = encounteredTag.attrs().getLocalName(i);
                final String value = encounteredTag.attrs().getValue(i);
                List<Integer> tagSpecIds = tagSpecDispatch.matchingDispatchKey(
                        name,
                        // Attribute values are case-sensitive by default, but we
                        // match dispatch keys in a case-insensitive manner and then
                        // validate using whatever the tagspec requests.
                        value.toLowerCase(), context.getTagStack().parentTagName());
                ValidatorProtos.ValidationResult.Builder validationResult = ValidatorProtos.ValidationResult.newBuilder();
                ValidateTagResult ret = new ValidateTagResult(validationResult, null);
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);
                for (Integer tagSpecId : tagSpecIds) {
                    final ParsedTagSpec parsedTagSpec = context.getRules().getByTagSpecId(tagSpecId);
                    // Skip TagSpecs that aren't used for these type identifiers.
                    if (!parsedTagSpec.isUsedForTypeIdentifiers(
                            context.getTypeIdentifiers())) {
                        continue;
                    }
                    final ValidateTagResult resultForAttempt = TagSpecUtils.validateTagAgainstSpec(
                            parsedTagSpec, bestMatchReferencePoint, context, encounteredTag);
                    if (context.getRules().betterValidationResultThan(
                            resultForAttempt.getValidationResult(), ret.getValidationResult())) {
                        ret.setBestMatchTagSpec(parsedTagSpec);
                        ret.setValidationResult(resultForAttempt.getValidationResult());
                        // TODO (GeorgeLuo) : this copy operation is unnecessary, should refactor to instantiate ret with
                        //  return for resultForAttempt in the first place (5/3/2020)
                        ret.setInlineStyleCssBytes(resultForAttempt.getInlineStyleCssBytes());
                        // Exit early on success
                        if (ret.getValidationResult().getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
                            return ret;
                        }
                    }
                }

                if (ret.getValidationResult().getStatus() != ValidatorProtos.ValidationResult.Status.UNKNOWN) {
                    return ret;
                }
            }
        }
        // None of the dispatch tagspecs matched and passed. If there are no
        // non-dispatch tagspecs, consider this a 'generally' disallowed tag,
        // which gives an error that reads "tag foo is disallowed except in
        // specific forms".
        if (filteredTagSpecs.size() == 0) {
            final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();
            if (encounteredTag.upperName().equals("SCRIPT")) {
                // Special case for <script> tags to produce better error messages.
                context.addError(
                        ValidatorProtos.ValidationError.Code.DISALLOWED_SCRIPT_TAG,
                        context.getLineCol(),
                        new ArrayList<>(),
                        context.getRules().getScriptSpecUrl(),
                        result);
            } else {
                final List<String> params = new ArrayList<>();
                params.add(encounteredTag.lowerName());
                context.addError(
                        ValidatorProtos.ValidationError.Code.GENERAL_DISALLOWED_TAG,
                        context.getLineCol(),
                        params,
                        /* specUrl */ "",
                        result);
            }
            return new ValidateTagResult(result, null);
        }
        // Validate against all remaining tagspecs. Each tagspec will produce a
        // different set of errors. Even if none of them match, we only want to
        // return errors from a single tagspec, not all of them. We keep around
        // the 'best' attempt until we have found a matching TagSpec or have
        // tried them all.
        ValidatorProtos.ValidationResult.Builder resultForBestAttempt = ValidatorProtos.ValidationResult.newBuilder();
        resultForBestAttempt.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);
        ParsedTagSpec bestMatchTagSpec = null;
        for (final ParsedTagSpec parsedTagSpec : filteredTagSpecs) {
          // TODO (GeorgeLuo) : refactor here to handle InlineStyleCssBytes
          //  changes (5/3/2020)
          final ValidateTagResult resultForAttempt = TagSpecUtils.validateTagAgainstSpec(
                    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag);
            if (context.getRules().betterValidationResultThan(resultForAttempt.getValidationResult(), resultForBestAttempt)) {
                resultForBestAttempt = resultForAttempt.getValidationResult();
                bestMatchTagSpec = parsedTagSpec;
                // Exit early
                if (resultForBestAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
                    return new ValidateTagResult(resultForBestAttempt, bestMatchTagSpec);
                }
            }
        }
        return new ValidateTagResult(resultForBestAttempt, bestMatchTagSpec);
    }


    /**
     * Validates the provided |tagName| with respect to a single tag
     * specification.
     * @param parsedTagSpec parsed tag spec.
     * @param bestMatchReferencePoint best match reference point.
     * @param context the context object.
     * @param encounteredTag the encountered tag.
     * @throws TagValidationException the TagValidationException.
     * @throws IOException IO Exception
     * @throws CssValidationException Css validation exception.
     * @return returns the validation result.
     */
    public static ValidateTagResult validateTagAgainstSpec(
            @Nonnull final ParsedTagSpec parsedTagSpec,
            final ParsedTagSpec bestMatchReferencePoint,
            @Nonnull final Context context,
            @Nonnull final ParsedHtmlTag encounteredTag)
            throws TagValidationException, IOException, CssValidationException {
        final ValidatorProtos.ValidationResult.Builder resultForAttempt = ValidatorProtos.ValidationResult.newBuilder();
        ValidateTagResult wrapperResult =
            new ValidateTagResult(resultForAttempt, null);

        resultForAttempt.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        validateParentTag(parsedTagSpec, context, resultForAttempt);
        validateAncestorTags(parsedTagSpec, context, resultForAttempt);
        // Some parent tag specs also define allowed child tag names for the first
        // child or all children. Validate that we aren't violating any of those
        // rules either.
        context.getTagStack().matchChildTagName(
                encounteredTag, context, resultForAttempt);

      // Only validate attributes if we haven't yet found any errors. The
        // Parent/Ancestor errors are informative without adding additional errors
        // about attributes.
        if (resultForAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
            AttributeSpecUtils.validateAttributes(
                    parsedTagSpec, bestMatchReferencePoint, context, encounteredTag,
              wrapperResult);
        }

        // Only validate that this is a valid descendant if it's not already invalid.
        if (resultForAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
            validateDescendantTags(
                    encounteredTag, parsedTagSpec, context, resultForAttempt);
        }

        validateNoSiblingsAllowedTags(parsedTagSpec, context, resultForAttempt);
        validateLastChildTags(context, resultForAttempt);

        // If we haven't reached the body element yet, we may not have seen the
        // necessary extension. That case is handled elsewhere.
        if (context.getTagStack().hasAncestor("BODY")) {
            validateRequiredExtensions(parsedTagSpec, context, resultForAttempt);
        }

        // Only validate uniqueness if we haven't yet found any errors, as it's
        // likely that this is not the correct tagspec if we have.
        if (resultForAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
            validateUniqueness(parsedTagSpec, context, resultForAttempt);
        }

        // Append some warnings, only if no errors.
        if (resultForAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
            final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
            List<String> params = new ArrayList<>();
            if (tagSpec.hasDeprecation()) {
                params.add(TagSpecUtils.getTagSpecName(tagSpec));
                params.add(tagSpec.getDeprecation());
                context.addWarning(
                        ValidatorProtos.ValidationError.Code.DEPRECATED_TAG,
                        context.getLineCol(),
                        params,
                        tagSpec.getDeprecationUrl(),
                        resultForAttempt);
            }
            if (tagSpec.hasUniqueWarning()
                   && context.hasTagspecsValidated(parsedTagSpec.getId())) {
                params.clear();
                params.add(TagSpecUtils.getTagSpecName(tagSpec));
                context.addWarning(
                        ValidatorProtos.ValidationError.Code.DUPLICATE_UNIQUE_TAG_WARNING,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(tagSpec),
                        resultForAttempt);
            }
        }
        return wrapperResult;
    }

    /**
     * Validates whether the parent tag satisfied the spec (e.g., some
     * tags can only appear in head).
     * @param parsedTagSpec the parsed tag spec.
     * @param context the Context object.
     * @param validationResult validation result.
     * @throws TagValidationException the TagValidationException.
     */
    public static void validateParentTag(@Nonnull final ParsedTagSpec parsedTagSpec,
                                         @Nonnull final Context context,
                                         @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                    throws TagValidationException {
        final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
        if (spec.hasMandatoryParent()
                && !spec.getMandatoryParent().equals(context.getTagStack().parentTagName())) {
            // Output a parent/child error using CSS Child Selector syntax which is
            // both succinct and should be well understood by web developers.
            List<String> params = new ArrayList<>();
            params.add(getTagSpecName(spec));
            params.add(context.getTagStack().parentTagName().toLowerCase());
            params.add(spec.getMandatoryParent().toLowerCase());
            context.addError(
                    ValidatorProtos.ValidationError.Code.WRONG_PARENT_TAG,
                    context.getLineCol(),
                    params,
                    getTagSpecUrl(spec),
                    validationResult);
        }
    }

    /**
     * Validates if the tag ancestors satisfied the spec.
     * @param parsedTagSpec the parsed tag spec.
     * @param context the context.
     * @param validationResult validation result.
     */
    public static void validateAncestorTags(@Nonnull final ParsedTagSpec parsedTagSpec,
                                            @Nonnull final Context context,
                                            @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
        if (spec.hasMandatoryAncestor()) {
            final String mandatoryAncestor = /** @type {string} */ spec.getMandatoryAncestor();
            if (!context.getTagStack().hasAncestor(mandatoryAncestor)) {
                if (spec.hasMandatoryAncestorSuggestedAlternative()) {
                    final List<String> params = new ArrayList<>();
                    params.add(getTagSpecName(spec));
                    params.add(mandatoryAncestor.toLowerCase());
                    params.add(spec.getMandatoryAncestorSuggestedAlternative().toLowerCase());
                    context.addError(
                            ValidatorProtos.ValidationError.Code.MANDATORY_TAG_ANCESTOR_WITH_HINT,
                            context.getLineCol(),
                            params,
                            getTagSpecUrl(spec),
                            validationResult);
                } else {
                    final List<String> params = new ArrayList<>();
                    params.add(getTagSpecName(spec));
                    params.add(mandatoryAncestor.toLowerCase());
                    context.addError(
                            ValidatorProtos.ValidationError.Code.MANDATORY_TAG_ANCESTOR,
                            context.getLineCol(),
                            params,
                            getTagSpecUrl(spec),
                            validationResult);
                }
                return;
            }
        }
        for (String disallowedAncestor : spec.getDisallowedAncestorList()) {
            if (context.getTagStack().hasAncestor(disallowedAncestor)) {
                final List<String> params = new ArrayList<>();
                params.add(getTagSpecName(spec));
                params.add(disallowedAncestor.toLowerCase());
                context.addError(
                        ValidatorProtos.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
                        context.getLineCol(),
                        params,
                        getTagSpecUrl(spec),
                        validationResult);
                return;
            }
        }
    }

    /**
     * @param layout layout.
     * @return amp.validator.AmpLayout.Layout.
     */
    public static ValidatorProtos.AmpLayout.Layout parseLayout(final String layout) {
        if (layout == null) {
            return ValidatorProtos.AmpLayout.Layout.UNKNOWN;
        }

        final String normLayout = layout.toUpperCase().replace('-', '_');
        if (ValidatorProtos.AmpLayout.Layout.getDescriptor().findValueByName(normLayout) == null) {
            return ValidatorProtos.AmpLayout.Layout.UNKNOWN;
        }
        return ValidatorProtos.AmpLayout.Layout.valueOf(normLayout);
    }

    /**
     * Calculates the effective height from input layout and input height.
     *
     * @param spec the amp layout spec.
     * @param inputLayout input layout.
     * @param inputHeight css length input height.
     * @return returns the css length instance.
     */
    public static CssLength calculateHeight(@Nonnull final ValidatorProtos.AmpLayout spec,
                                                      @Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
                                                      @Nonnull final CssLength inputHeight) {
        if ((inputLayout == ValidatorProtos.AmpLayout.Layout.UNKNOWN
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT)
                && !inputHeight.isSet() && spec.hasDefinesDefaultHeight()) {
            return new CssLength(
                    "1px", /* allowAuto */ false, /* allowFluid */ false);
        }
        return inputHeight;
    }

    /**
     * Calculates the layout; this depends on the width / height
     * calculation above. It happens last because web designers often make
     * fixed-sized mocks first and then the layout determines how things
     * will change for different viewports / devices / etc.
     *
     * @param inputLayout input layout.
     * @param width widht.
     * @param height height.
     * @param sizesAttr sizes attribute.
     * @param heightsAttr heights attribute.
     * @return return the layout depends on the width/height.
     */
    public static ValidatorProtos.AmpLayout.Layout calculateLayout(@Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
                                                             @Nonnull final CssLength width,
                                                             @Nonnull final CssLength height,
                                                             final String sizesAttr,
                                                             final String heightsAttr) {
        if (inputLayout != ValidatorProtos.AmpLayout.Layout.UNKNOWN) {
            return inputLayout;
        } else if (!width.isSet() && !height.isSet()) {
            return ValidatorProtos.AmpLayout.Layout.CONTAINER;
        } else if ((height.isSet() && height.isFluid()) || (width.isSet() && width.isFluid())) {
            return ValidatorProtos.AmpLayout.Layout.FLUID;
        } else if (height.isSet() && (!width.isSet() || width.isAuto())) {
            return ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT;
        } else if (height.isSet() && width.isSet() && (sizesAttr != null || heightsAttr != null)) {
            return ValidatorProtos.AmpLayout.Layout.RESPONSIVE;
        } else {
            return ValidatorProtos.AmpLayout.Layout.FIXED;
        }
    }

    /**
     * Helper method for validateLayout.
     * Validates the server-side rendering related attributes for the given layout.
     * @param spec the tag spec.
     * @param encounteredTag the encounted tag.
     * @param inputLayout input layout.
     * @param inputWidth input width.
     * @param inputHeight input height.
     * @param sizesAttr sizes attribute.
     * @param heightsAttr heights attribute.
     * @param context the context.
     * @param result validation result.
     */
    public static void validateSsrLayout(
            @Nonnull final ValidatorProtos.TagSpec spec,
            @Nonnull final ParsedHtmlTag encounteredTag,
            @Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
            @Nonnull final CssLength inputWidth,
            @Nonnull final CssLength inputHeight,
            final String sizesAttr,
            final String heightsAttr,
            @Nonnull final Context context,
            @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
        // Only applies to transformed AMP and custom elements (<amp-...>).
        if (!context.isTransformed()
                || !encounteredTag.lowerName().startsWith("amp-")) {
            return;
        }

        // calculate effective ssr layout
        final CssLength width =
                calculateWidthForTag(inputLayout, inputWidth, encounteredTag.upperName());
        final CssLength height = calculateHeightForTag(
                inputLayout, inputHeight, encounteredTag.upperName());
        final ValidatorProtos.AmpLayout.Layout layout =
                calculateLayout(inputLayout, width, height, sizesAttr, heightsAttr);

        final HashMap<String, String> attrsByKey = encounteredTag.attrsByKey();

        // class attribute
        final String classAttr = attrsByKey.get("class");
        if (classAttr != null) {
            // i-amphtml-layout-{layout_name}
            final Set<String> validInternalClasses = new HashSet<>();
            validInternalClasses.add(getLayoutClass(layout));
            if (isLayoutSizeDefined(layout)) {
                // i-amphtml-layout-size-defined
                validInternalClasses.add(getLayoutSizeDefinedClass());
            }
            final String [] classes = classAttr.split("[\\s+]");
            for (String classValue : classes) {
                if (classValue.startsWith("i-amphtml-")
                        && !(validInternalClasses.contains(classValue))) {
                    List<String> params = new ArrayList<>();
                    params.add("class");
                    params.add(getTagSpecName(spec));
                    params.add(classAttr);
                    context.addError(
                            ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE,
                            context.getLineCol(),
                            params,
                            getTagSpecUrl(spec),
                            result);
                }
            }
        }

        // i-amphtml-layout attribute
        final String ssrAttr = attrsByKey.get("i-amphtml-layout");
        if (ssrAttr != null) {
            final String layoutName = layout.name(); //getLayoutName(layout);
            if (!layoutName.equals(ssrAttr.toLowerCase())) {
                List<String> params = new ArrayList<>();
                params.add(ssrAttr);
                params.add("i-amphtml-layout");
                params.add(getTagSpecName(spec));
                params.add(layoutName.toUpperCase());
                params.add(layoutName);
                context.addError(
                        ValidatorProtos.ValidationError.Code.ATTR_VALUE_REQUIRED_BY_LAYOUT,
                        context.getLineCol(),
                        params,
                        getTagSpecUrl(spec),
                        result);
            }
        }
    }

    /**
     * @param layout AMP layout.
     * @return returns true if layout size is matched.
     */
    public static boolean isLayoutSizeDefined(@Nonnull final ValidatorProtos.AmpLayout.Layout layout) {
        return (
                layout == ValidatorProtos.AmpLayout.Layout.FILL
                        || layout == ValidatorProtos.AmpLayout.Layout.FIXED
                        || layout == ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT
                        || layout == ValidatorProtos.AmpLayout.Layout.FLEX_ITEM
                        || layout == ValidatorProtos.AmpLayout.Layout.FLUID
                        || layout == ValidatorProtos.AmpLayout.Layout.INTRINSIC
                        || layout == ValidatorProtos.AmpLayout.Layout.RESPONSIVE);
    }

    /**
     * @param layout AMP layout.
     * @return returns the layout class.
     */
    public static String getLayoutClass(@Nonnull final ValidatorProtos.AmpLayout.Layout layout) {
        return "i-amphtml-layout-" + layout.name();
    }

    /**
     * @return returns the layout size defined class.
     */
    public static String getLayoutSizeDefinedClass() {
        return "i-amphtml-layout-size-defined";
    }

    /**
     * Calculates the effective width from the input layout, input width and tag.
     * For certain tags it uses explicit dimensions.
     *
     * @param inputLayout input layout.
     * @param inputWidth input width.
     * @param tagName the tag name.
     * @return returns the css length instance.
     */
    public static CssLength calculateWidthForTag(@Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
                                                           @Nonnull final CssLength inputWidth,
                                                           @Nonnull final String tagName) {
        if ((inputLayout == ValidatorProtos.AmpLayout.Layout.UNKNOWN
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED)
                && !inputWidth.isSet()) {
            if (tagName.equals("AMP-ANALYTICS") || tagName.equals("AMP-PIXEL")) {
                return new CssLength(
                        "1px", /* allowAuto */ false, /* allowFluid */ false);
            }
            if (tagName.equals("AMP-SOCIAL-SHARE")) {
                return new CssLength(
                        "60px", /* allowAuto */ false, /* allowFluid */ false);
            }
        }
        return inputWidth;
    }

    /**
     * Calculates the effective height from the input layout, input height and tag.
     * For certain tags it uses explicit dimensions.
     *
     * @param inputLayout input layout.
     * @param inputHeight input height.
     * @param tagName the tag name.
     * @return returns the css length instance.
     */
    public static CssLength calculateHeightForTag(@Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
                                                  @Nonnull final CssLength inputHeight,
                                                  @Nonnull final String tagName) {
        if ((inputLayout == ValidatorProtos.AmpLayout.Layout.UNKNOWN
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED_HEIGHT)
                && !inputHeight.isSet()) {
            if (tagName.equals("AMP-ANALYTICS") || tagName.equals("AMP-PIXEL")) {
                return new CssLength(
                        "1px", /* allowAuto */ false, /* allowFluid */ false);
            }
            if (tagName.equals("AMP-SOCIAL-SHARE")) {
                return new CssLength(
                        "44px", /* allowAuto */ false, /* allowFluid */ false);
            }
        }
        return inputHeight;
    }

    /**
     * Calculates the effective width from the input layout and input width.
     * This involves considering that some elements, such as amp-audio and
     * amp-pixel, have natural dimensions (browser or implementation-specific
     * defaults for width / height).
     *
     * @param spec AMP layout spec.
     * @param inputLayout input layout.
     * @param inputWidth input width.
     * @return return the css length instance.
     */
    public static CssLength calculateWidth(@Nonnull final ValidatorProtos.AmpLayout spec,
                                                     @Nonnull final ValidatorProtos.AmpLayout.Layout inputLayout,
                                                     @Nonnull final CssLength inputWidth) {
        if ((inputLayout == ValidatorProtos.AmpLayout.Layout.UNKNOWN
                || inputLayout == ValidatorProtos.AmpLayout.Layout.FIXED)
                && !inputWidth.isSet() && spec.hasDefinesDefaultWidth()) {
            return new CssLength(
                    "1px", /* allowAuto */ false, /* allowFluid */ false);
        }
        return inputWidth;
    }

    /**
     * Validates that this tag is an allowed descendant tag type.
     * Registers new descendent constraints if they are set.
     * @param encounteredTag encountered tag.
     * @param parsedTagSpec the parsed tag spec.
     * @param context the context.
     * @param validationResult validation result.
     */
    public static void validateDescendantTags(
            @Nonnull final ParsedHtmlTag encounteredTag, @Nonnull final ParsedTagSpec parsedTagSpec,
            @Nonnull final Context context,
            @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        final TagStack tagStack = context.getTagStack();

        for (DescendantConstraints allowedDescendantsList : tagStack.allowedDescendantsList()) {
            // If the tag we're validating is not whitelisted for a specific ancestor,
            // then throw an error.
            if (!allowedDescendantsList.getAllowedTags().contains(encounteredTag.upperName())) {
                final List<String> params = new ArrayList<>();
                params.add(encounteredTag.lowerName());
                params.add(allowedDescendantsList.getTagName().toLowerCase());
                context.addError(
                        ValidatorProtos.ValidationError.Code.DISALLOWED_TAG_ANCESTOR,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(parsedTagSpec.getSpec()),
                        validationResult);
                return;
            }
        }
    }

    /**
     * Validates if the 'no siblings allowed' rule exists.
     * @param parsedTagSpec the parsed tag spec.
     * @param context the context.
     * @param validationResult validation result.
     * @throws TagValidationException the TagValidationException.
     */
    public static void validateNoSiblingsAllowedTags(
            @Nonnull final ParsedTagSpec parsedTagSpec, @Nonnull final Context context,
            @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
            throws TagValidationException {
        final ValidatorProtos.TagSpec spec = parsedTagSpec.getSpec();
        final TagStack tagStack = context.getTagStack();

        if (spec.hasSiblingsDisallowed() && tagStack.parentChildCount() > 0) {
            final List<String> params = new ArrayList<>();
            params.add(spec.getTagName().toLowerCase());
            params.add(tagStack.parentTagName().toLowerCase());
            context.addError(
                    ValidatorProtos.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
                    context.getLineCol(),
                    params,
                    getTagSpecUrl(spec),
                    validationResult);
        }

        if (tagStack.parentHasChildWithNoSiblingRule() && tagStack.parentChildCount() > 0) {
            final List<String> params = new ArrayList<>();
            params.add(tagStack.parentOnlyChildTagName().toLowerCase());
            params.add(tagStack.parentTagName().toLowerCase());
            context.addError(
                    ValidatorProtos.ValidationError.Code.TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
                    tagStack.parentOnlyChildErrorLineCol(),
                    params,
                    TagSpecUtils.getTagSpecUrl(spec),
                    validationResult);
        }
    }

    /**
     * Validates if the 'last child' rule exists.
     * @param context the context.
     * @param validationResult validation result.
     * @throws TagValidationException the TagValidationException.
     */
    public static void validateLastChildTags(@Nonnull final Context context,
                             @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
                            throws TagValidationException {
        final TagStack tagStack = context.getTagStack();

        if (tagStack.parentHasChildWithLastChildRule()) {
            final List<String> params = new ArrayList<>();
            params.add(tagStack.parentLastChildTagName().toLowerCase());
            params.add(tagStack.parentTagName().toLowerCase());
            context.addError(
                    ValidatorProtos.ValidationError.Code.MANDATORY_LAST_CHILD_TAG,
                    tagStack.parentLastChildErrorLineCol(),
                    params,
                    tagStack.parentLastChildUrl(),
                    validationResult);
        }
    }

    /**
     * If this tag requires an extension and we have processed all extensions,
     * report an error if that extension has not been loaded.
     * @param parsedTagSpec the parsed tag spec.
     * @param context the context.
     * @param validationResult validation result.
     */
    public static void validateRequiredExtensions(@Nonnull final ParsedTagSpec parsedTagSpec,
                                      @Nonnull final Context context,
                                      @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
        final ExtensionsContext extensionsCtx = context.getExtensions();
        for (final String requiredExtension : tagSpec.getRequiresExtensionList()) {
            if (!extensionsCtx.isExtensionLoaded(requiredExtension)) {
                final List<String> params = new ArrayList<>();
                params.add(getTagSpecName(parsedTagSpec.getSpec()));
                params.add(requiredExtension);
                context.addError(
                        ValidatorProtos.ValidationError.Code.MISSING_REQUIRED_EXTENSION,
                        context.getLineCol(),
                        params,
                        getTagSpecUrl(parsedTagSpec.getSpec()),
                        validationResult);
            }
        }
    }

    /**
     * Check for duplicates of tags that should be unique, reporting errors for
     * the second instance of each unique tag.
     * @param parsedTagSpec the parsed tag spec.
     * @param context the context.
     * @param validationResult validation result.
     */
    public static void validateUniqueness(@Nonnull final ParsedTagSpec parsedTagSpec,
                                          @Nonnull final Context context,
                                          @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
        if (tagSpec.hasUnique()
                && context.getTagspecsValidated().containsKey(parsedTagSpec.id())) {
            final List<String> params = new ArrayList<>();
            params.add(getTagSpecName(tagSpec));
            context.addError(
                    ValidatorProtos.ValidationError.Code.DUPLICATE_UNIQUE_TAG,
                    context.getLineCol(),
                    params,
                    getTagSpecUrl(parsedTagSpec.getSpec()),
                    validationResult);
        }
    }

    /** List identifiers for AMP format. */
    public static final List AMP_IDENTIFIERS = Arrays.asList("\u26a1", "\u26a1\ufe0f", "amp", "transformed", "data-ampdevmode");

    /** List identifiers for AMP4ADS format. */
    public static final List AMP4ADS_IDENTIFIERS = Arrays.asList("\u26a14ads", "\u26a1\ufe0f4ads", "amp4ads", "data-ampdevmode");

    /** List identifiers for AMP4EMAIL format. */
    public static final List AMP4EMAIL_IDENTIFIERS = Arrays.asList("\u26a14email", "\u26a1\ufe0f4email", "amp4email", "data-ampdevmode");

    /** List identifiers for ACTIONS format. */
    public static final List ACTIONS_IDENTIFIERS = Arrays.asList("\u26a1", "\u26a1\ufe0f", "amp", "actions", "data-ampdevmode");
}
