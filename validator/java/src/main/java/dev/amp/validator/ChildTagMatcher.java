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
import dev.amp.validator.utils.TagSpecUtils;
import org.apache.commons.lang3.StringUtils;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * The child tag matcher evaluates ChildTagSpec. The constructor
 * provides the enclosing TagSpec for the parent tag so that we can
 * produce error messages mentioning the parent.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ChildTagMatcher {
    /**
     * Constructor.
     *
     * @param parentSpec parent tag spec.
     * @throws TagValidationException child tag expected to be null.
     */
    public ChildTagMatcher(@Nonnull final ValidatorProtos.TagSpec parentSpec)
            throws TagValidationException {
        this.parentSpec = parentSpec;
        if (!parentSpec.hasChildTags()) {
            throw new TagValidationException("The parent's child tag should be null");
        }
    }

    /**
     * Matching child tag name.
     * @param encounteredTag the ParsedHtmlTag.
     * @param context the Context.
     * @param result validation result.
     * @throws TagValidationException the TagValidationException.
     */
    public void matchChildTagName(@Nonnull final ParsedHtmlTag encounteredTag,
                                  @Nonnull final Context context,
                                  @Nonnull final ValidatorProtos.ValidationResult.Builder result)
            throws TagValidationException {
        final ValidatorProtos.ChildTagSpec childTags = parentSpec.getChildTags();
        // Enforce child_tag_name_oneof: If at least one tag name is specified,
        // then the child tags of the parent tag must have one of the provided
        // tag names.

        String allowedNames;
        if (childTags.getChildTagNameOneofList().size() > 0) {
            final List<String> names = childTags.getChildTagNameOneofList();
            if (names.indexOf(encounteredTag.upperName()) == -1) {
                allowedNames = "[\'" + StringUtils.join(names, ", ") + "\']";
                final List<String> params = new ArrayList<>();
                params.add(encounteredTag.lowerName());
                params.add(TagSpecUtils.getTagSpecName(this.parentSpec));
                params.add(allowedNames.toLowerCase());
                context.addError(
                        ValidatorProtos.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(this.parentSpec),
                        result);
            }
        }
        // Enforce first_child_tag_name_oneof: If at least one tag name is
        // specified, then the first child of the parent tag must have one
        // of the provided tag names.
        if (childTags.getFirstChildTagNameOneofList().size() > 0
                && context.getTagStack().parentChildCount() == 0) {
            final List<String> names = childTags.getFirstChildTagNameOneofList();
            if (names.indexOf(encounteredTag.upperName()) == -1) {
                allowedNames = "[\'" + StringUtils.join(names, ", ") + "\']";
                final List<String> params = new ArrayList<>();
                params.add(encounteredTag.lowerName());
                params.add(TagSpecUtils.getTagSpecName(this.parentSpec));
                params.add(allowedNames.toLowerCase());
                context.addError(
                        ValidatorProtos.ValidationError.Code.DISALLOWED_FIRST_CHILD_TAG_NAME,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(this.parentSpec),
                        result);
            }
        }
    }

    /**
     * Exit tag.
     * @param context the context.
     * @param result validation result.
     * @throws TagValidationException the TagValidationException.
     */
    public void exitTag(@Nonnull final Context context, @Nonnull final ValidatorProtos.ValidationResult.Builder result) throws TagValidationException {
        final int expectedNumChildTags =
                this.parentSpec.getChildTags().getMandatoryNumChildTags();
        List<String> params;
        if (expectedNumChildTags != -1
                && expectedNumChildTags != context.getTagStack().parentChildCount()) {
            params = new ArrayList<>();
            params.add(TagSpecUtils.getTagSpecName(this.parentSpec));
            params.add(String.valueOf(expectedNumChildTags));
            params.add(String.valueOf(context.getTagStack().parentChildCount()));
            context.addError(
                    ValidatorProtos.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS,
                    context.getLineCol(),
                    params,
                    TagSpecUtils.getTagSpecUrl(this.parentSpec),
                    result);
            return;
        }

        final int  expectedMinNumChildTags =
                this.parentSpec.getChildTags().getMandatoryMinNumChildTags();
        if (expectedMinNumChildTags != -1
                && context.getTagStack().parentChildCount() < expectedMinNumChildTags) {
            params = new ArrayList<>();
            params.add(TagSpecUtils.getTagSpecName(this.parentSpec));
            params.add(String.valueOf(expectedMinNumChildTags));
            params.add(String.valueOf(context.getTagStack().parentChildCount()));
            context.addError(
                    ValidatorProtos.ValidationError.Code.INCORRECT_MIN_NUM_CHILD_TAGS,
                    context.getLineCol(),
                    params,
                    TagSpecUtils.getTagSpecUrl(this.parentSpec),
                    result);
            return;
        }
    }

    /** Parent tag spec. */
    @Nonnull
    private ValidatorProtos.TagSpec parentSpec;
}
