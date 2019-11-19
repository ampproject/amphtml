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
package dev.amp.validator.utils;


import amp.validator.Validator;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import dev.amp.validator.Context;
import dev.amp.validator.ParsedHtmlTag;
import dev.amp.validator.ParsedTagSpec;
import dev.amp.validator.ParsedValidatorRules;
import dev.amp.validator.RecordValidated;
import dev.amp.validator.TagSpecDispatch;
import dev.amp.validator.TagStack;
import dev.amp.validator.ValidateTagResult;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Tests for {@link TagSpecUtils}
 *
 * @author sphatak01
 */
public class TagSpecUtilsTest {

    @Test
    public void testGetTagSpecUrl() {
        final Validator.TagSpec.Builder tagSpecBuilder1 = Validator.TagSpec.newBuilder().setSpecUrl("url1");


        Assert.assertEquals(TagSpecUtils.getTagSpecUrl(tagSpecBuilder1.build()), "url1");

        final Validator.TagSpec.Builder tagSpecBuilder2 = Validator.TagSpec.newBuilder()
                .setExtensionSpec(Validator.ExtensionSpec.newBuilder()
                        .setName("extSpec2")
                        .build());

        Assert.assertEquals(TagSpecUtils.getTagSpecUrl(tagSpecBuilder2.build()), "https://amp.dev/documentation/components/extSpec2");

        final Validator.TagSpec.Builder tagSpecBuilder3 = Validator.TagSpec.newBuilder().addRequiresExtension("ext3");

        Assert.assertEquals(TagSpecUtils.getTagSpecUrl(tagSpecBuilder3.build()), "https://amp.dev/documentation/components/ext3");

        Assert.assertEquals(TagSpecUtils.getTagSpecUrl(Validator.TagSpec.getDefaultInstance()), "");
    }

    @Test
    public void testGetTagSpecName() {
        final Validator.TagSpec.Builder tagSpecBuilder1 = Validator.TagSpec.newBuilder().setSpecName("spec1");

        Assert.assertEquals(TagSpecUtils.getTagSpecName(tagSpecBuilder1.build()), "spec1");

        final Validator.TagSpec.Builder tagSpecBuilder2 = Validator.TagSpec.newBuilder().setTagName("TAG1");

        Assert.assertEquals(TagSpecUtils.getTagSpecName(tagSpecBuilder2.build()), "tag1");
    }

    @Test
    public void testShouldRecordTagspecValidated() {
        final Validator.TagSpec.Builder tagSpecBuilder1 = Validator.TagSpec.newBuilder().setMandatory(true);

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(tagSpecBuilder1.build(), 2, ImmutableMap.of(2, true)),
                RecordValidated.ALWAYS);

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(tagSpecBuilder1.build(), 0, ImmutableMap.of(2, true)),
                RecordValidated.ALWAYS);


        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(Validator.TagSpec
                        .getDefaultInstance(), 2, ImmutableMap.of(2, true)), RecordValidated.ALWAYS);

        final Validator.TagSpec.Builder tagSpecBuilder2 = Validator.TagSpec.newBuilder().setUnique(true);

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(tagSpecBuilder2.build(), 3, ImmutableMap.of(2, true)),
                RecordValidated.IF_PASSING);

        final Validator.TagSpec.Builder tagSpecBuilder3 = Validator.TagSpec.newBuilder().addRequires("req3");

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(tagSpecBuilder3.build(), 3, ImmutableMap.of(2, true)),
                RecordValidated.IF_PASSING);

        final Validator.TagSpec.Builder tagSpecBuilder4 = Validator.TagSpec.newBuilder().setUniqueWarning(true);

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(tagSpecBuilder4.build(), 3, ImmutableMap.of(2, true)),
                RecordValidated.IF_PASSING);

        Assert.assertEquals(TagSpecUtils.shouldRecordTagspecValidated(Validator.TagSpec.getDefaultInstance(),
                3, ImmutableMap.of(2, true)), RecordValidated.NEVER);
    }

    @Test
    public void testValidateTag() throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(Collections.emptyList());

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("parent");

        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final TagSpecDispatch mockDispatch = Mockito.mock(TagSpecDispatch.class);
        Mockito.when(mockDispatch.allTagSpecs()).thenReturn(ImmutableList.of(0, 1, 2));
        Mockito.when(mockDispatch.hasDispatchKeys()).thenReturn(true);

        final ParsedTagSpec mockParsedTagSpec1 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec1.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockParsedTagSpec1.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);
        Mockito.when(mockRules.getByTagSpecId(0)).thenReturn(mockParsedTagSpec1);
        Mockito.when(mockRules.getByTagSpecId(2)).thenReturn(mockParsedTagSpec1);

        final ParsedTagSpec mockParsedTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec2.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);
        Mockito.when(mockParsedTagSpec2.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockRules.getByTagSpecId(1)).thenReturn(mockParsedTagSpec2);

        Mockito.when(mockRules.dispatchForTagName(Mockito.anyString())).thenReturn(mockDispatch);

        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(Validator.ValidationResult.Builder.class),
                Mockito.any(Validator.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(encounteredTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(2);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("attr0");
        Mockito.when(mockAttrs.getValue(0)).thenReturn("val0");
        Mockito.when(mockAttrs.getLocalName(1)).thenReturn("attr1");
        Mockito.when(mockAttrs.getValue(1)).thenReturn("val0");

        Mockito.when(encounteredTag.attrs()).thenReturn(mockAttrs);

        Mockito.when(mockDispatch.matchingDispatchKey("attr1", "val0", "parent"))
            .thenReturn(ImmutableList.of(0, 1));


        final ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

        final ValidateTagResult res = TagSpecUtils.validateTag(mockContext, encounteredTag, bestMatchReferencePoint);
        Assert.assertEquals(res.getValidationResult().getStatus(), Validator.ValidationResult.Status.PASS);
        Assert.assertEquals(res.getValidationResult().getErrorsCount(), 0);
    }

    @Test
    public void testValidateTagDisallowedTag() throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(Collections.emptyList());

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("parent");

        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(encounteredTag.upperName()).thenReturn("FONT");
        Mockito.when(encounteredTag.lowerName()).thenReturn("font");

        final ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        final ValidateTagResult res = TagSpecUtils.validateTag(mockContext, encounteredTag, bestMatchReferencePoint);

        Mockito.verify(mockContext, Mockito.times(1)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.DISALLOWED_TAG);
        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "font");

        Assert.assertEquals(res.getValidationResult().getStatus(), Validator.ValidationResult.Status.UNKNOWN);
    }

    @Test
    public void testValidateTagDisallowedScriptTag() throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(Collections.emptyList());

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("parent");

        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final TagSpecDispatch mockDispatch = Mockito.mock(TagSpecDispatch.class);
        Mockito.when(mockDispatch.allTagSpecs()).thenReturn(Collections.emptyList());
        Mockito.when(mockDispatch.hasDispatchKeys()).thenReturn(true);

        final ParsedTagSpec mockParsedTagSpec1 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec1.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockParsedTagSpec1.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);
        Mockito.when(mockRules.getByTagSpecId(0)).thenReturn(mockParsedTagSpec1);
        Mockito.when(mockRules.getByTagSpecId(2)).thenReturn(mockParsedTagSpec1);

        final ParsedTagSpec mockParsedTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec2.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);
        Mockito.when(mockParsedTagSpec2.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockRules.getByTagSpecId(1)).thenReturn(mockParsedTagSpec2);

        Mockito.when(mockRules.dispatchForTagName(Mockito.anyString())).thenReturn(mockDispatch);

        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(Validator.ValidationResult.Builder.class),
                Mockito.any(Validator.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(encounteredTag.upperName()).thenReturn("SCRIPT");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(2);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("attr0");
        Mockito.when(mockAttrs.getValue(0)).thenReturn("val0");
        Mockito.when(mockAttrs.getLocalName(1)).thenReturn("attr1");
        Mockito.when(mockAttrs.getValue(1)).thenReturn("val0");

        Mockito.when(encounteredTag.attrs()).thenReturn(mockAttrs);

        Mockito.when(mockDispatch.matchingDispatchKey("attr1", "val0", "parent"))
                .thenReturn(ImmutableList.of(0, 1));


        final ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        final ValidateTagResult res = TagSpecUtils.validateTag(mockContext, encounteredTag, bestMatchReferencePoint);

        Mockito.verify(mockContext, Mockito.times(1)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.DISALLOWED_SCRIPT_TAG);
        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 0);

        Assert.assertEquals(res.getValidationResult().getStatus(), Validator.ValidationResult.Status.UNKNOWN);
        Assert.assertEquals(res.getValidationResult().getErrorsCount(), 0);
    }

    @Test
    public void testValidateTagGeneralDisallowedTag() throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(Collections.emptyList());

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("parent");

        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final TagSpecDispatch mockDispatch = Mockito.mock(TagSpecDispatch.class);
        Mockito.when(mockDispatch.allTagSpecs()).thenReturn(Collections.emptyList());
        Mockito.when(mockDispatch.hasDispatchKeys()).thenReturn(true);

        final ParsedTagSpec mockParsedTagSpec1 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec1.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockParsedTagSpec1.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);
        Mockito.when(mockRules.getByTagSpecId(0)).thenReturn(mockParsedTagSpec1);
        Mockito.when(mockRules.getByTagSpecId(2)).thenReturn(mockParsedTagSpec1);

        final ParsedTagSpec mockParsedTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec2.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);
        Mockito.when(mockParsedTagSpec2.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockRules.getByTagSpecId(1)).thenReturn(mockParsedTagSpec2);

        Mockito.when(mockRules.dispatchForTagName(Mockito.anyString())).thenReturn(mockDispatch);

        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(Validator.ValidationResult.Builder.class),
                Mockito.any(Validator.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(encounteredTag.upperName()).thenReturn("HTML");
        Mockito.when(encounteredTag.lowerName()).thenReturn("html");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(2);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("attr0");
        Mockito.when(mockAttrs.getValue(0)).thenReturn("val0");
        Mockito.when(mockAttrs.getLocalName(1)).thenReturn("attr1");
        Mockito.when(mockAttrs.getValue(1)).thenReturn("val0");

        Mockito.when(encounteredTag.attrs()).thenReturn(mockAttrs);

        Mockito.when(mockDispatch.matchingDispatchKey("attr1", "val0", "parent"))
                .thenReturn(ImmutableList.of(0, 1));


        final ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        final ValidateTagResult res = TagSpecUtils.validateTag(mockContext, encounteredTag, bestMatchReferencePoint);

        Mockito.verify(mockContext, Mockito.times(1)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(Validator.ValidationResult.Builder.class));

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.GENERAL_DISALLOWED_TAG);
        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "html");

        Assert.assertEquals(res.getValidationResult().getStatus(), Validator.ValidationResult.Status.UNKNOWN);
        Assert.assertEquals(res.getValidationResult().getErrorsCount(), 0);
    }

    @Test
    public void testValidateTagBestAttempt() throws TagValidationException, ValidatorException, IOException, CssValidationException {
        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockContext.getTypeIdentifiers()).thenReturn(Collections.emptyList());

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("parent");

        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final TagSpecDispatch mockDispatch = Mockito.mock(TagSpecDispatch.class);
        Mockito.when(mockDispatch.allTagSpecs()).thenReturn(ImmutableList.of(0, 1, 2));
        Mockito.when(mockDispatch.hasDispatchKeys()).thenReturn(false);

        final ParsedTagSpec mockParsedTagSpec1 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec1.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockParsedTagSpec1.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);
        Mockito.when(mockRules.getByTagSpecId(0)).thenReturn(mockParsedTagSpec1);
        Mockito.when(mockRules.getByTagSpecId(2)).thenReturn(mockParsedTagSpec1);

        final ParsedTagSpec mockParsedTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec2.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);
        Mockito.when(mockParsedTagSpec2.getSpec()).thenReturn(Validator.TagSpec.getDefaultInstance());
        Mockito.when(mockRules.getByTagSpecId(1)).thenReturn(mockParsedTagSpec2);

        Mockito.when(mockRules.dispatchForTagName(Mockito.anyString())).thenReturn(mockDispatch);

        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(Validator.ValidationResult.Builder.class),
                Mockito.any(Validator.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final ParsedHtmlTag encounteredTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(encounteredTag.upperName()).thenReturn("HTML");
        Mockito.when(encounteredTag.lowerName()).thenReturn("html");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(2);
        Mockito.when(mockAttrs.getLocalName(0)).thenReturn("attr0");
        Mockito.when(mockAttrs.getValue(0)).thenReturn("val0");
        Mockito.when(mockAttrs.getLocalName(1)).thenReturn("attr1");
        Mockito.when(mockAttrs.getValue(1)).thenReturn("val0");

        Mockito.when(encounteredTag.attrs()).thenReturn(mockAttrs);

        Mockito.when(mockDispatch.matchingDispatchKey("attr1", "val0", "parent"))
                .thenReturn(ImmutableList.of(0, 1));

        final ParsedTagSpec bestMatchReferencePoint = Mockito.mock(ParsedTagSpec.class);

        final ValidateTagResult res = TagSpecUtils.validateTag(mockContext, encounteredTag, bestMatchReferencePoint);

        Assert.assertEquals(res.getValidationResult().getStatus(), Validator.ValidationResult.Status.PASS);
        Assert.assertEquals(res.getValidationResult().getErrorsCount(), 0);
    }
}