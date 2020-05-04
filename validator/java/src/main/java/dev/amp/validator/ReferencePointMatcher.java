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

import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;
import dev.amp.validator.utils.TagSpecUtils;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A tag may initialize this ReferencePointMatcher with its reference points.
 * Then, the matcher will be invoked for each child tag via ::Match,
 * and eventually it will be invoked upon exiting the parent tag.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ReferencePointMatcher {
    /**
     * Constructor.
     * @param parsedValidatorRules the ParsedValidatorRules object.
     * @param parsedReferencePoints the parsed reference points.
     * @param lineCol a pair of line/col.
     * @throws TagValidationException the TagValidationException.
     */
    public ReferencePointMatcher(@Nonnull final ParsedValidatorRules parsedValidatorRules,
                                 @Nonnull final ParsedReferencePoints parsedReferencePoints,
                                 @Nonnull final Locator lineCol) throws TagValidationException {
        this.parsedValidatorRules = parsedValidatorRules;
        this.parsedReferencePoints = parsedReferencePoints;
        if (parsedReferencePoints.empty()) {
            throw new TagValidationException("Reference point matcher should not be empty");
        }

        this.lineCol = lineCol;
        this.referencePointsMatched = new ArrayList<>();

    }

    /**
     * This method gets invoked when matching a child tag of the parent
     * that is specifying / requiring the reference points. So
     * effectively, this method will try through the specified reference
     * points and record them in this.referencePointsMatched.
     * @param tag the ParsedHtmlTag.
     * @param context the Context.
     * @throws TagValidationException the TagValidationException.
     * @throws ValidatorException the ValidatorException.
     * @throws IOException IO Exception
     * @throws CssValidationException CssValidation Exception
     * @return result returns ValidateTagResult.
     */
    public ValidateTagResult validateTag(@Nonnull final ParsedHtmlTag tag, @Nonnull final Context context)
            throws TagValidationException, ValidatorException, IOException, CssValidationException {
        // Look for a matching reference point, if we find one, record and exit.
        ValidatorProtos.ValidationResult.Builder resultForBestAttempt = ValidatorProtos.ValidationResult.newBuilder();
        resultForBestAttempt.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);
        for (ValidatorProtos.ReferencePoint p : this.parsedReferencePoints.iterate()) {
            final ParsedTagSpec parsedTagSpec = context.getRules().getByTagSpecId(p.getTagSpecName());
            // Skip TagSpecs that aren't used for these type identifiers.
            if (!parsedTagSpec.isUsedForTypeIdentifiers(context.getTypeIdentifiers())) {
                continue;
            }
            // TODO (GeorgeLuo) : refactor here to handle InlineStyleCssBytes
            //  changes (5/3/2020)
            final ValidateTagResult resultForAttemptWrapper =
                    TagSpecUtils.validateTagAgainstSpec(
                    parsedTagSpec, /*bestMatchReferencePoint=*/null, context, tag);
            final ValidatorProtos.ValidationResult.Builder resultForAttempt = resultForAttemptWrapper.getValidationResult();
            if (context.getRules().betterValidationResultThan(resultForAttempt, resultForBestAttempt)) {
                resultForBestAttempt = resultForAttempt;
            }
            if (resultForBestAttempt.getStatus() == ValidatorProtos.ValidationResult.Status.PASS) {
                ValidateTagResult validateTagResult = new ValidateTagResult(resultForBestAttempt, parsedTagSpec);
                return  validateTagResult;
            }
        }

        // This check cannot fail as a successful validation above exits early.
        if (resultForBestAttempt.getStatus() != ValidatorProtos.ValidationResult.Status.FAIL) {
            throw new ValidatorException("Successful validation should have exited earlier");
        }

        // Special case: only one reference point defined - emit a singular
        // error message *and* merge in the errors from the best attempt above.
        if (this.parsedReferencePoints.size() == 1) {
            List<String> params = new ArrayList<>();
            params.add(tag.lowerName());
            params.add(this.parsedReferencePoints.parentTagSpecName());
            params.add(this.parsedValidatorRules.getReferencePointName(
                    this.parsedReferencePoints.iterate().get(0)));
            context.addError(
                    ValidatorProtos.ValidationError.Code
                            .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR,
                    context.getLineCol(),
                    params,
                    this.parsedReferencePoints.parentSpecUrl(), resultForBestAttempt);
            ValidateTagResult validateTagResult = new ValidateTagResult(resultForBestAttempt, null);
            return validateTagResult;
        }
        // General case: more than one reference point defined. Emit a plural
        // message with the acceptable reference points listed.
        final List<String> acceptable = new ArrayList<>();
        for (final ValidatorProtos.ReferencePoint p : this.parsedReferencePoints.iterate()) {
            acceptable.add(this.parsedValidatorRules.getReferencePointName(p));
        }
        final ValidatorProtos.ValidationResult.Builder resultForMultipleAttempts = ValidatorProtos.ValidationResult.newBuilder();
        final List<String> params = new ArrayList<>();
        params.add(tag.lowerName());
        params.add(this.parsedReferencePoints.parentTagSpecName());
        params.add(String.join(", ", acceptable));
        context.addError(
                ValidatorProtos.ValidationError.Code
                        .CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT,
                context.getLineCol(),
                params,
                this.parsedReferencePoints.parentSpecUrl(),
                resultForMultipleAttempts);

        ValidateTagResult validateTagResult = new ValidateTagResult(resultForMultipleAttempts, null);
        return validateTagResult;
    }

    /**
     * This method gets invoked when we're done with processing all the
     * child tags, so now we can determine whether any reference points
     * remain unsatisfied or duplicate.
     * @param context the Context.
     * @param result the ValidationResult.
     * @throws TagValidationException the TagValidationException.
     */
    public void exitParentTag(@Nonnull final Context context, @Nonnull final ValidatorProtos.ValidationResult.Builder result)
            throws TagValidationException {
        final Map<Integer, Integer> referencePointByCount = new HashMap<>();
        for (final int r : this.referencePointsMatched) {
            int count = 1;
            if (referencePointByCount.containsKey(r)) {
                count = referencePointByCount.get(r);
                count++;
            }
            referencePointByCount.put(r, count);
        }

        for (final ValidatorProtos.ReferencePoint p : this.parsedReferencePoints.iterate()) {
            int refPointTagSpecId = this.parsedValidatorRules.getTagSpecIdByReferencePointTagSpecName(p.getTagSpecName());
            if (p.hasMandatory()
                    && !referencePointByCount.containsKey(refPointTagSpecId)) {
                final List<String> params = new ArrayList<>();
                params.add(this.parsedValidatorRules.getReferencePointName(p));
                params.add(this.parsedReferencePoints.parentTagSpecName());
                context.addError(
                        ValidatorProtos.ValidationError.Code.MANDATORY_REFERENCE_POINT_MISSING,
                        this.getLineCol(),
                        params,
                        this.parsedReferencePoints.parentSpecUrl(),
                        result);
            }

            if (p.hasUnique()
                    && referencePointByCount.containsKey(refPointTagSpecId)
                    && referencePointByCount.get(refPointTagSpecId) != 1) {
                final List<String> params = new ArrayList<>();
                params.add(this.parsedValidatorRules.getReferencePointName(p));
                params.add(this.parsedReferencePoints.parentTagSpecName());
                context.addError(
                        ValidatorProtos.ValidationError.Code.DUPLICATE_REFERENCE_POINT,
                        this.getLineCol(),
                        params,
                        this.parsedReferencePoints.parentSpecUrl(),
                        result);
            }
        }
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.lineCol = null;
        this.referencePointsMatched = null;
    }

    /**
     * Returns a pair of line/col.
     * @return returns a pair of line/col.
     */
    public Locator getLineCol() {
        return this.lineCol;
    }

    /**
     * Record the parsed tag spec id.
     * @param parsedTagSpec the ParsedTagSpec.
     */
    public void recordMatch(@Nonnull final ParsedTagSpec parsedTagSpec) {
        this.referencePointsMatched.add(parsedTagSpec.id());
    }

    /** A ParsedValidatorRules instance. */
    private ParsedValidatorRules parsedValidatorRules;

    /** A ParsedReferencePoints instance. */
    private ParsedReferencePoints parsedReferencePoints;

    /** A line/col pair. */
    private Locator lineCol;

    /** An array of reference points matched. */
    private List<Integer> referencePointsMatched;
}
