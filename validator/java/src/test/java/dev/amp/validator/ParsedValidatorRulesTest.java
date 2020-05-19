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
        htmlFormatCode = ValidatorProtos.HtmlFormat.Code.AMP4EMAIL;

        mockValidationManager = Mockito.mock(AMPValidatorManager.class);
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(3)).thenReturn("NAME_VALUE_DISPATCH");

        rulesBuilder = ValidatorProtos.ValidatorRules.newBuilder();
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL)
                .setExtensionSpec(ValidatorProtos.ExtensionSpec.newBuilder()
                        .setDeprecatedAllowDuplicates(true).setName("amp-lightbox-gallery").addVersion("1.0").build())
                .addAlsoRequiresTagWarning("amp-ad extension .js script")
                .setSpecName("SCRIPT")
                .setTagName("SCRIPT")
                .addRequires("requires")
                .addExcludes("excludes")
                .setMandatory(true)
                .build());
        // different html format
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .setTagName("AMP-STICKY-AD")
                .setExtensionSpec(ValidatorProtos.ExtensionSpec.newBuilder()
                        .setName("amp-inputmask")
                        .build())
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP)
                .build());
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL)
                .setMandatoryAlternatives("alternatives")
                .setSpecName("AMP-CAROUSEL lightbox")
                .build());
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL)
                .setMandatory(true)
                .addDisabledBy("transformed")
                .setSpecName("amp-consent [type]")
                .setMandatoryAlternatives("not-alternatives")
                .build());
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .setTagName("$REFERENCE_POINT")
                .setSpecName("AMP-SELECTOR option")
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP)
                .build());
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .addHtmlFormat(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL)
                .setSpecName("amp-ad extension .js script")
                .setTagName("amp-ad extension .js script")
                .build());

        rulesBuilder.addErrorFormats(ValidatorProtos.ErrorFormat.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setFormat("The mandatory tag '%1' is missing or incorrect.")
                .build());
        rulesBuilder.addErrorFormats(ValidatorProtos.ErrorFormat.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
                .setFormat("The tag '%1' is disallowed.")
                .build());
        rulesBuilder.addErrorFormats(ValidatorProtos.ErrorFormat.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                .setFormat("The property '%1' is missing from attribute '%2' in tag '%3'.")
                .build());
        rulesBuilder.addErrorFormats(ValidatorProtos.ErrorFormat.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE)
                .setFormat("SS syntax error in tag '%1' - the property '%2' is set to the disallowed value '%3'. Allowed values: %4.")
                .build());

        rulesBuilder.addErrorSpecificity(ValidatorProtos.ErrorSpecificity.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING)
                .setSpecificity(0)
                .build());
        rulesBuilder.addErrorSpecificity(ValidatorProtos.ErrorSpecificity.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
                .setSpecificity(0)
                .build());
        rulesBuilder.addErrorSpecificity(ValidatorProtos.ErrorSpecificity.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                .setSpecificity(33)
                .build());
        rulesBuilder.addErrorSpecificity(ValidatorProtos.ErrorSpecificity.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE)
                .setSpecificity(0)
                .build());
        rulesBuilder.setStylesSpecUrl(STYLES_SPEC_URL);
        rulesBuilder.setScriptSpecUrl(SCRIPT_SPEC_URL);
        rulesBuilder.setTemplateSpecUrl(TEMPLATE_SPEC_URL);

        Mockito.when(mockValidationManager.getRules()).thenReturn(rulesBuilder);
    }

    @Test
    public void testRegex() {
        final ValidatorProtos.HtmlFormat.Code htmlFormatCode = ValidatorProtos.HtmlFormat.Code.AMP4EMAIL;
        final AMPValidatorManager mockValidationManager = Mockito.mock(AMPValidatorManager.class);
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(0)).thenReturn("NAME_VALUE_DISPATCH");
        Mockito.when(mockValidationManager.getDispatchKeyByTagSpecId(1)).thenReturn(null);

        final ValidatorProtos.ValidatorRules.Builder rulesBuilder = ValidatorProtos.ValidatorRules.newBuilder();
        rulesBuilder.addTags(ValidatorProtos.TagSpec.newBuilder()
                .setExtensionSpec(ValidatorProtos.ExtensionSpec.newBuilder()
                        .setDeprecatedAllowDuplicates(true).setName("amp-lightbox-gallery").addVersion("1.0").build())
                .setSpecName("SCRIPT")
                .build());
        rulesBuilder.addErrorFormats(ValidatorProtos.ErrorFormat.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
                .setFormat("The tag '%1' is disallowed.")
                .build());
        rulesBuilder.addErrorSpecificity(ValidatorProtos.ErrorSpecificity.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
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

        String refPointName = rules.getReferencePointName(ValidatorProtos.ReferencePoint.newBuilder().setTagSpecName("AMP-CAROUSEL lightbox").build());

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

        ValidatorProtos.ValidationResult.Builder resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        ValidatorProtos.ValidationResult.Builder resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());

        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE).build());

        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE).build());


        Assert.assertTrue(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE).build());


        Assert.assertFalse(rules.betterValidationResultThan(resultA, resultB));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());


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

        final ValidatorProtos.ValidationResult.Builder validationResult = ValidatorProtos.ValidationResult.newBuilder();
        validationResult.addTypeIdentifier("transformed");

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        rules.validateTypeIdentifiers(mockAttrs, formatIdentifiers, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(0), ValidatorProtos.ValidationError.Code.DEV_MODE_ONLY);
        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR);

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

        final ValidatorProtos.ValidationResult.Builder validationResult = ValidatorProtos.ValidationResult.newBuilder();
        validationResult.addTypeIdentifier("transformed");

        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        rules.validateTypeIdentifiers(mockAttrs, formatIdentifiers, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(0), ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);
        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING);

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
        ValidatorProtos.HtmlFormat.Code testHtmlFormatCode = ValidatorProtos.HtmlFormat.Code.AMP4EMAIL;
        ParsedValidatorRules rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);

        final ParsedHtmlTag mockParsedHtmlTag = Mockito.mock(ParsedHtmlTag.class);

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockParsedHtmlTag.attrs()).thenReturn(mockAttrs);

        Context mockContext = Mockito.mock(Context.class);

        final ValidatorProtos.ValidationResult.Builder validationResult = ValidatorProtos.ValidationResult.newBuilder();

        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));



        testHtmlFormatCode = ValidatorProtos.HtmlFormat.Code.AMP4ADS;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        testHtmlFormatCode = ValidatorProtos.HtmlFormat.Code.AMP4EMAIL;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        Mockito.verify(mockContext, Mockito.times(1)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        testHtmlFormatCode = ValidatorProtos.HtmlFormat.Code.ACTIONS;
        mockContext = Mockito.mock(Context.class);

        rules = new ParsedValidatorRules(testHtmlFormatCode, mockValidationManager);
        rules.validateHtmlTag(mockParsedHtmlTag, mockContext, validationResult);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(2))
                .addError(errorCodeCapture.capture(),
                    Mockito.any(Locator.class),
                    listCaptor.capture(),
                    Mockito.anyString(),
                    Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getAllValues().get(1), ValidatorProtos.ValidationError.Code.MANDATORY_ATTR_MISSING);
        Assert.assertEquals(listCaptor.getAllValues().get(1).size(), 2);
        Assert.assertEquals(listCaptor.getAllValues().get(1).get(0), "actions");
        Assert.assertEquals(listCaptor.getAllValues().get(1).get(1), "html");
    }

    @Test
    public void testSpecificity() throws ValidatorException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertEquals(rules.specificity(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG), 0);

        Assert.assertEquals(rules.maxSpecificity(ImmutableList.of(
                ValidatorProtos.ValidationError.newBuilder()
                        .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
                        .build(),
                ValidatorProtos.ValidationError.newBuilder()
                        .setCode(ValidatorProtos.ValidationError.Code.MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE)
                        .build())), 33);

    }

    @Test
    public void testIsErrorSubset() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        ValidatorProtos.ValidationResult.Builder resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        ValidatorProtos.ValidationResult.Builder resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());

        Assert.assertFalse(rules.isErrorSubset(resultA.getErrorsList(), resultB.getErrorsList()));


        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());

        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultB.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());

        Assert.assertTrue(rules.isErrorSubset(resultA.getErrorsList(), resultB.getErrorsList()));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING).build());
        resultA.addErrors(ValidatorProtos.ValidationError.newBuilder().setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG).build());

    }

    @Test(expectedExceptions = ValidatorException.class, expectedExceptionsMessageRegExp = "Status unknown")
    public void testBetterValidationStatusThan() throws ValidatorException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        ValidatorProtos.ValidationResult.Builder resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        ValidatorProtos.ValidationResult.Builder resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        Assert.assertFalse(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

        Assert.assertTrue(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        Assert.assertFalse(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);

        Assert.assertTrue(rules.betterValidationStatusThan(resultA.getStatus(), resultB.getStatus()));

        resultA = ValidatorProtos.ValidationResult.newBuilder();
        resultA.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);

        resultB = ValidatorProtos.ValidationResult.newBuilder();
        resultB.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

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
    public void testDescendantTagLists() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Mockito.when(mockValidationManager.getDescendantTagLists())
                .thenReturn(Collections.singletonList(ValidatorProtos.DescendantTagList.newBuilder()
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
        final ValidatorProtos.ValidationError mismatchError = ValidatorProtos.ValidationError.newBuilder()
                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_PROPERTY_IN_ATTR_VALUE)
                .build();
        Mockito.when(mockContext.valueSetsRequired())
                .thenReturn(ImmutableMap.of("a", ImmutableList.of(ValidatorProtos.ValidationError.newBuilder()
                                .setCode(ValidatorProtos.ValidationError.Code.DISALLOWED_TAG)
                                .build()),
                "b", ImmutableList.of(ValidatorProtos.ValidationError.newBuilder()
                                .setCode(ValidatorProtos.ValidationError.Code.EXTENSION_UNUSED)
                                .build()),
                        "c", ImmutableList.of(mismatchError)));

        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        rules.maybeEmitValueSetMismatchErrors(mockContext, result);
        Mockito.verify(mockContext, Mockito.times(1)).addBuiltError(mismatchError, result);
    }

    @Test
    public void testMaybeEmitMandatoryAlternativesSatisfiedErrors() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getMandatoryAlternativesSatisfied()).thenReturn(ImmutableList.of("alternatives"));

        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        rules.maybeEmitMandatoryAlternativesSatisfiedErrors(mockContext, result);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));


        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING);
        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "not-alternatives");

    }

    @Test
    public void testMaybeEmitMandatoryTagValidationErrors() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(ImmutableList.of("transformed"));

        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        rules.maybeEmitMandatoryTagValidationErrors(mockContext, result);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));


        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MANDATORY_TAG_MISSING);
        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "SCRIPT");


    }


    @Test
    public void testMaybeEmitAlsoRequiresTagValidationErrors() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.satisfiesCondition("requires")).thenReturn(false);
        Mockito.when(mockContext.satisfiesCondition("excludes")).thenReturn(true);
        Mockito.when(mockContext.getTagspecsValidated()).thenReturn(ImmutableMap.of(0, true,
                1, true,
                2, true,
                3, true,
                4, true));
        final ExtensionsContext mockExtContext = Mockito.mock(ExtensionsContext.class);
        Mockito.when(mockExtContext.unusedExtensionsRequired()).thenReturn(ImmutableList.of("unused_ext_1"));

        Mockito.when(mockContext.getExtensions()).thenReturn(mockExtContext);

        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        rules.maybeEmitAlsoRequiresTagValidationErrors(mockContext, result);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        Mockito.verify(mockContext, Mockito.times(3))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Mockito.verify(mockContext, Mockito.times(1))
                .addWarning(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<ValidatorProtos.ValidationError.Code> errorCodes = errorCodeCapture.getAllValues();
        final List<List> params = listCaptor.getAllValues();

        Assert.assertEquals(errorCodes.size(), 4);
        Assert.assertEquals(errorCodes.get(0), ValidatorProtos.ValidationError.Code.TAG_REQUIRED_BY_MISSING);
        Assert.assertEquals(errorCodes.get(1), ValidatorProtos.ValidationError.Code.TAG_EXCLUDED_BY_TAG);
        Assert.assertEquals(errorCodes.get(2), ValidatorProtos.ValidationError.Code.EXTENSION_UNUSED);
        Assert.assertEquals(errorCodes.get(3), ValidatorProtos.ValidationError.Code.WARNING_TAG_REQUIRED_BY_MISSING);

        Assert.assertEquals(params.size(), 4);
        Assert.assertEquals(params.get(0).size(), 2);
        Assert.assertEquals(params.get(0).get(0), "requires");
        Assert.assertEquals(params.get(0).get(1), "SCRIPT");

        Assert.assertEquals(params.get(1).size(), 2);
        Assert.assertEquals(params.get(1).get(0), "SCRIPT");
        Assert.assertEquals(params.get(1).get(1), "excludes");

        Assert.assertEquals(params.get(2).size(), 1);
        Assert.assertEquals(params.get(2).get(0), "unused_ext_1");

        Assert.assertEquals(params.get(3).size(), 2);
        Assert.assertEquals(params.get(3).get(0), "amp-ad extension .js script");
        Assert.assertEquals(params.get(3).get(1), "SCRIPT");
    }

    @Test
    public void testmMybeEmitGlobalTagValidationErrors() throws TagValidationException {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();
        Context mockContext = Mockito.mock(Context.class);
        final ExtensionsContext mockExtContext = Mockito.mock(ExtensionsContext.class);
        Mockito.when(mockExtContext.unusedExtensionsRequired()).thenReturn(ImmutableList.of("unused_ext_1"));
        Mockito.when(mockContext.getExtensions()).thenReturn(mockExtContext);

        rules.maybeEmitGlobalTagValidationErrors(mockContext, result);

        Mockito.verify(mockContext, Mockito.times(5))
                .addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Mockito.verify(mockContext, Mockito.times(0))
                .addWarning(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    }


    @Test
    public void testGetParsedAttrSpecs() {
        final ParsedValidatorRules rules = new ParsedValidatorRules(htmlFormatCode, mockValidationManager);

        Assert.assertNotNull(rules.getParsedAttrSpecs());
    }

    private ValidatorProtos.ValidatorRules.Builder rulesBuilder;

    private ValidatorProtos.HtmlFormat.Code htmlFormatCode;

    private AMPValidatorManager mockValidationManager;

    private static final String STYLES_SPEC_URL = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";

    private static final String TEMPLATE_SPEC_URL = "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#html-tags";

    private static final String SCRIPT_SPEC_URL = "https://amp.dev/documentation/components/amp-mustache";

    private static final int MAX_BYTES = 1000;



}
