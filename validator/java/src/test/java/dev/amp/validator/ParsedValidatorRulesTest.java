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
 * Changes to the original project are Copyright 2019, Oath Inc..
 */

package dev.amp.validator;

import amp.validator.Validator;
import dev.amp.validator.exception.TagValidationException;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.regex.Pattern;

/**
 * Tests for {@link ParsedValidatorRules}
 *
 * @author sphatak
 */
public class ParsedValidatorRulesTest {

    @Test
    public void testConstructor() throws TagValidationException {
        final Validator.HtmlFormat.Code htmlFormatCode = Validator.HtmlFormat.Code.AMP4EMAIL;
        final AMPValidatorManager mockValidationManager = Mockito.mock(AMPValidatorManager.class);
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(3)).thenReturn("NAME_VALUE_DISPATCH");

        final Validator.ValidatorRules.Builder rulesBuilder = Validator.ValidatorRules.newBuilder();
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP4EMAIL)
                .setExtensionSpec(Validator.ExtensionSpec.newBuilder()
                        .setDeprecatedAllowDuplicates(true).setName("amp-lightbox-gallery").addVersion("1.0").build())
                .addAlsoRequiresTagWarning("amp-ad extension .js script")
                .setSpecName("SCRIPT")
                .setMandatory(true)
                .build());
        // different html format
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .setTagName("AMP-STICKY-AD")
                .setExtensionSpec(Validator.ExtensionSpec.newBuilder()
                        .setName("amp-inputmask")
                        .build())
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP)
                .build());
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP4EMAIL)
                .setSpecName("AMP-CAROUSEL lightbox")
                .build());
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP4EMAIL)
                .setSpecName("amp-consent [type]")
                .build());

        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setFormat("The mandatory tag '%1' is missing or incorrect.")
                .build());
        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setFormat("The tag '%1' is disallowed.")
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setSpecificity(0)
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setSpecificity(8)
                .build());
        Mockito.when(mockValidationManager.getRules()).thenReturn(rulesBuilder);

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertEquals(rules.getByTagSpecId(0).getSpec().getSpecName(), "SCRIPT");

        // already exists in map
        Assert.assertEquals(rules.getByTagSpecId(0).getSpec().getSpecName(), "SCRIPT");

    }

    @Test
    public void testRegex() {
        final Validator.HtmlFormat.Code htmlFormatCode = Validator.HtmlFormat.Code.AMP4EMAIL;
        final AMPValidatorManager mockValidationManager = Mockito.mock(AMPValidatorManager.class);
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(0)).thenReturn("NAME_VALUE_DISPATCH");
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(1)).thenReturn(null);

        final Validator.ValidatorRules.Builder rulesBuilder = Validator.ValidatorRules.newBuilder();
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .setExtensionSpec(Validator.ExtensionSpec.newBuilder()
                        .setDeprecatedAllowDuplicates(true).setName("amp-lightbox-gallery").addVersion("1.0").build())
                .setSpecName("SCRIPT")
                .build());
        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setFormat("The tag '%1' is disallowed.")
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setSpecificity(8)
                .build());
        Mockito.when(mockValidationManager.getRules()).thenReturn(rulesBuilder);

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        final Pattern pattern = rules.getFullMatchRegex("[0-9]+");

        Assert.assertTrue(pattern.matcher("98").matches());

        final Pattern pattern1 = rules.getFullMatchCaseiRegex("[0-9a-f]+");

        Assert.assertTrue(pattern1.matcher("a1").matches());

        final Pattern pattern2 = rules.getPartialMatchCaseiRegex("[0-9a-f]");

        Assert.assertTrue(pattern2.matcher("a").matches());

        rules.getFullMatchRegex("[0-9a-d]{2}");
        rules.getFullMatchCaseiRegex("[0-9a-d]{3}");
        rules.getPartialMatchCaseiRegex("[0-9a-d]{4}");

        Assert.assertTrue(rules.getFullMatchRegex("[0-9]+").matcher("98").matches());
        Assert.assertTrue(rules.getFullMatchCaseiRegex("[0-9a-f]+").matcher("a1").matches());
        Assert.assertTrue(rules.getPartialMatchCaseiRegex("[0-9a-f]").matcher("a").matches());
    }

}