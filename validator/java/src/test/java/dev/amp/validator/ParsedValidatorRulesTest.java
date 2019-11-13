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
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;

import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Tests for {@link ParsedValidatorRules}
 *
 * @author sphatak01
 */
public class ParsedValidatorRulesTest {

    @BeforeMethod
    public void init() {
        htmlFormatCode = Validator.HtmlFormat.Code.AMP4EMAIL;

        mockValidationManager = Mockito.mock(AMPValidatorManager.class);
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(3)).thenReturn("NAME_VALUE_DISPATCH");

        rulesBuilder = Validator.ValidatorRules.newBuilder();
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP4EMAIL)
                .setExtensionSpec(Validator.ExtensionSpec.newBuilder()
                        .setDeprecatedAllowDuplicates(true).setName("amp-lightbox-gallery").addVersion("1.0").build())
                .addAlsoRequiresTagWarning("amp-ad extension .js script")
                .setSpecName("SCRIPT")
                .setTagName("SCRIPT")
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
        rulesBuilder.addTags(Validator.TagSpec.newBuilder()
                .setTagName("$REFERENCE_POINT")
                .setSpecName("AMP-SELECTOR option")
                .addHtmlFormat(Validator.HtmlFormat.Code.AMP)
                .build());

        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setFormat("The mandatory tag '%1' is missing or incorrect.")
                .build());
        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setFormat("The tag '%1' is disallowed.")
                .build());
        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                .setFormat("The property '%1' is missing from attribute '%2' in tag '%3'.")
                .build());
        rulesBuilder.addErrorFormats(Validator.ErrorFormat.newBuilder()
                .setCode(Validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE)
                .setFormat("SS syntax error in tag '%1' - the property '%2' is set to the disallowed value '%3'. Allowed values: %4.")
                .build());

        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setSpecificity(0)
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                .setSpecificity(0)
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                .setSpecificity(33)
                .build());
        rulesBuilder.addErrorSpecificity(Validator.ErrorSpecificity.newBuilder()
                .setCode(Validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE)
                .setSpecificity(0)
                .build());
        rulesBuilder.setStylesSpecUrl(STYLES_SPEC_URL);
        rulesBuilder.setScriptSpecUrl(SCRIPT_SPEC_URL);
        rulesBuilder.setTemplateSpecUrl(TEMPLATE_SPEC_URL);
        rulesBuilder.addCssLengthSpec(Validator.CssLengthSpec.newBuilder()
                .setHtmlFormat(Validator.HtmlFormat.Code.AMP4EMAIL)
                .build());

        Mockito.when(mockValidationManager.getRules()).thenReturn(rulesBuilder);
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

    @Test
    public void testRefPointName() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Mockito.when(mockValidationManager.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(4);

        String refPointName = rules.getReferencePointName(Validator.ReferencePoint.newBuilder().setTagSpecName("AMP-CAROUSEL lightbox").build());

        Assert.assertEquals(refPointName, "AMP-SELECTOR option");

    }

    @Test
    public void testTagSpecGetters() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Mockito.when(mockValidationManager.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(2);

        ParsedTagSpec tagSpec = rules.getByTagSpecId("AMP-CAROUSEL lightbox");

        Assert.assertEquals(tagSpec.getSpec().getSpecName(), "AMP-CAROUSEL lightbox");

        Assert.assertEquals(rules.getTagSpecIdBySpecName("AMP-CAROUSEL lightbox").intValue(), 2);

        Assert.assertEquals(rules.getByTagSpecId(2).getSpec().getSpecName(), "AMP-CAROUSEL lightbox");

        Mockito.when(mockValidationManager.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(4);
        Assert.assertEquals(rules.getTagSpecIdByReferencePointTagSpecName("AMP-SELECTOR option"), 4);
    }

    @Test
    public void testBetterValidationResultThan() throws ValidatorException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Validator.ValidationResult.Builder resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.PASS);

        Validator.ValidationResult.Builder resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());

        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE).build());

        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE).build());


        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE).build());


        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());


        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

    }

    @Test
    public void testTypeIdentifiersDevAndDisallowedAttr() {
        final Attributes mockAttrs = Mockito.mock(Attributes.class);

        Mockito.when(mockAttrs.getLength()).thenReturn(4);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("amp4email");
        Mockito.when(mockAttrs.getLocalName(1)).thenReturn("transformed");
        Mockito.when(mockAttrs.getValue(1)).thenReturn("google;v=1");
        Mockito.when(mockAttrs.getLocalName(2)).thenReturn("data-ampdevmode");
        Mockito.when(mockAttrs.getLocalName(3)).thenReturn("amp4ads");

        final List<String> formatIdentifiers = ImmutableList.of("transformed", "data-ampdevmode", "amp4email");

        final Context mockContext = Mockito.mock(Context.class);

        final Validator.ValidationResult.Builder validationResult = Validator.ValidationResult.newBuilder();
        validationResult.addTypeIdentifier("transformed");

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        rules.validateTypeIdentifiers(mockAttrs, formatIdentifiers, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(0), Validator.ValidationError.Code.DEV_MODE_ONLY);
        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), Validator.ValidationError.Code.DISALLOWED_ATTR);

        final List<List> params = listCaptor.getAllValues();
        Assert.assertEquals(params.size(), 2);

        Assert.assertEquals(params.get(0).size(), 0);

        Assert.assertEquals(params.get(1).size(), 2);
        Assert.assertEquals(params.get(1).get(0), "amp4ads");
        Assert.assertEquals(params.get(1).get(1), "html");
    }

    @Test
    public void testTypeIdentifiersInvalidAttrAndMandatoryAttrMissing() {
        final Attributes mockAttrs = Mockito.mock(Attributes.class);

        Mockito.when(mockAttrs.getLength()).thenReturn(4);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("transformed");
        Mockito.when(mockAttrs.getValue(0)).thenReturn("google;v=abc");

        final List<String> formatIdentifiers = ImmutableList.of("transformed", "data-ampdevmode");

        final Context mockContext = Mockito.mock(Context.class);

        final Validator.ValidationResult.Builder validationResult = Validator.ValidationResult.newBuilder();
        validationResult.addTypeIdentifier("transformed");

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        rules.validateTypeIdentifiers(mockAttrs, formatIdentifiers, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(0), Validator.ValidationError.Code.INVALID_ATTR_VALUE);
        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), Validator.ValidationError.Code.MANDATORY_ATTR_MISSING);

        final List<List> params = listCaptor.getAllValues();
        Assert.assertEquals(params.size(), 2);

        Assert.assertEquals(params.get(0).size(), 3);
        Assert.assertEquals(params.get(0).get(0), "transformed");
        Assert.assertEquals(params.get(0).get(1), "html");
        Assert.assertEquals(params.get(0).get(2), "google;v=abc");

        Assert.assertEquals(params.get(1).size(), 2);
        Assert.assertEquals(params.get(1).get(0), "transformed");
        Assert.assertEquals(params.get(1).get(1), "html");
    }

    @Test
    public void testValidateHtmlTag() {
        Validator.HtmlFormat.Code testHtmlFormatCode = Validator.HtmlFormat.Code.AMP4EMAIL;
        ParsedValidatorRules rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);

        final ParsedHtmlTag mockParsedHtmlTag = Mockito.mock(ParsedHtmlTag.class);

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockParsedHtmlTag.attrs()).thenReturn(mockAttrs);

        Context mockContext = Mockito.mock(Context.class);

        final Validator.ValidationResult.Builder validationResult = Validator.ValidationResult.newBuilder();

        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(Validator.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));



        testHtmlFormatCode = Validator.HtmlFormat.Code.AMP4ADS;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(Validator.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        testHtmlFormatCode = Validator.HtmlFormat.Code.AMP4EMAIL;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(Validator.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        testHtmlFormatCode = Validator.HtmlFormat.Code.ACTIONS;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2))
                .addError(errorCodeCapture.capture(),
                    Mockito.any(Locator.class),
                    listCaptor.capture(),
                    Mockito.anyString(),
                    Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), Validator.ValidationError.Code.MANDATORY_ATTR_MISSING);
        Assert.assertEquals(listCaptor.getAllValues().get(1).size(), 2);
        Assert.assertEquals(listCaptor.getAllValues().get(1).get(0), "actions");
        Assert.assertEquals(listCaptor.getAllValues().get(1).get(1), "html");
    }

    @Test
    public void testSpecificity() throws ValidatorException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertEquals(rules.specificity(Validator.ValidationError.Code.DISALLOWED_TAG), 0);

        Assert.assertEquals(rules.maxSpecificity(ImmutableList.of(
                Validator.ValidationError.newBuilder()
                        .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                        .build(),
                Validator.ValidationError.newBuilder()
                        .setCode(Validator.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                        .build())), 33);

    }

    @Test
    public void testIsErrorSubset() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Validator.ValidationResult.Builder resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.PASS);

        Validator.ValidationResult.Builder resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertFalse(rules.isErrorSubset(resultA.getErrorsList(), resultB.getErrorsList()));


        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());

        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);
        resultB.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());

        Assert.assertTrue(rules.isErrorSubset(resultA.getErrorsList(), resultB.getErrorsList()));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(Validator.ValidationError.newBuilder().setCode(Validator.ValidationError.Code.DISALLOWED_TAG).build());

    }

    @Test(expectedExceptions = ValidatorException.class, expectedExceptionsMessageRegExp = "Status unknown")
    public void testBetterValidationStatusThan() throws ValidatorException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Validator.ValidationResult.Builder resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.PASS);

        Validator.ValidationResult.Builder resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.PASS);

        Assert.assertFalse(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.PASS);

        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);

        Assert.assertTrue(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);

        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.PASS);

        Assert.assertFalse(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.FAIL);

        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.UNKNOWN);

        Assert.assertTrue(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = Validator.ValidationResult.newBuilder();
        resultA.setStatus(Validator.ValidationResult.Status.UNKNOWN);

        resultB = Validator.ValidationResult.newBuilder();
        resultB.setStatus(Validator.ValidationResult.Status.FAIL);

        rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus());
    }

    @Test
    public void testDispatchForTagName() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertTrue(rules.dispatchForTagName("SCRIPT").allTagSpecs().isEmpty());
    }

    @Test
    public void testSpecUrl() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);
        Assert.assertEquals(rules.getStylesSpecUrl(), STYLES_SPEC_URL);
        Assert.assertEquals(rules.getTemplateSpecUrl(), TEMPLATE_SPEC_URL);
        Assert.assertEquals(rules.getScriptSpecUrl(), SCRIPT_SPEC_URL);

    }

    @Test
    public void testCssLengthSpec() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertEquals(rules.getCssLengthSpec().get(0).getHtmlFormat(), Validator.HtmlFormat.Code.AMP4EMAIL);
    }

    @Test
    public void testDescendantTagLists() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Mockito.when(mockValidationManager.getDescendantTagLists())
                .thenReturn(Collections.singletonList(Validator.DescendantTagList.newBuilder()
                        .addTag("tag1")
                        .build()));

        Assert.assertEquals(rules.getDescendantTagLists().get(0).getTag(0), "tag1");
    }

    @Test
    public void testCombinedBlacklistedCdataRegex() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Mockito.when(mockValidationManager.getCombinedBlacklistedCdataRegex(Mockito.anyInt()))
                .thenReturn("\\d");

        Assert.assertEquals(rules.getCombinedBlacklistedCdataRegex(1), "\\d");
    }

    @Test
    public void testMaybeEmitValueSetMismatchErrors() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.valueSetsProvided()).thenReturn(ImmutableSet.of("a", "b"));
        final Validator.ValidationError mismatchError = Validator.ValidationError.newBuilder()
                .setCode(Validator.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE)
                .build();
        Mockito.when(mockContext.valueSetsRequired())
                .thenReturn(ImmutableMap.of("a", ImmutableList.of(Validator.ValidationError.newBuilder()
                                .setCode(Validator.ValidationError.Code.DISALLOWED_TAG)
                                .build()),
                "b", ImmutableList.of(Validator.ValidationError.newBuilder()
                                .setCode(Validator.ValidationError.Code.EXTENSION_UNUSED)
                                .build()),
                        "c", ImmutableList.of(mismatchError)));

        final Validator.ValidationResult.Builder result = Validator.ValidationResult.newBuilder();

        rules.maybeEmitValueSetMismatchErrors(mockContext, result);
        Mockito.verify(mockContext, Mockito.times(1)).addBuiltError(mismatchError, result);
    }


    private Validator.ValidatorRules.Builder rulesBuilder;

    private Validator.HtmlFormat.Code htmlFormatCode;

    private AMPValidatorManager mockValidationManager;

    private static final String STYLES_SPEC_URL = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";

    private static final String TEMPLATE_SPEC_URL = "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#html-tags";

    private static final String SCRIPT_SPEC_URL = "https://amp.dev/documentation/components/amp-mustache";



}