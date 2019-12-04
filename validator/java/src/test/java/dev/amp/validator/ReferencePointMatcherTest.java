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
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;

import java.io.IOException;
import java.util.List;

/**
 * Tests for {@link ReferencePointMatcher}
 */
public class ReferencePointMatcherTest {

    @Test(expectedExceptions = TagValidationException.class, expectedExceptionsMessageRegExp = "Reference point matcher should not be empty")
    public void testTagValidationFailure() throws TagValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);
        Mockito.when(mockPoints.empty()).thenReturn(true);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        new ReferencePointMatcher(mockRules, mockPoints, locator);
    }

    @Test(expectedExceptions = ValidatorException.class,
            expectedExceptionsMessageRegExp = "Successful validation should have exited earlier")
    public void testValidateTagValidatorException() throws TagValidationException, ValidatorException, IOException, CssValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.getSpec()).thenReturn(ValidatorProtos.TagSpec.newBuilder().build());

        Mockito.when(mockTagSpec.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));


        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);
        refPointMatcher.validateTag(mockHtmlTag, mockContext);
    }

    @Test
    public void testValidateTagPass() throws TagValidationException, ValidatorException, IOException, CssValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.getSpec()).thenReturn(ValidatorProtos.TagSpec.newBuilder().build());

        Mockito.when(mockTagSpec.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));


        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);
        final ValidateTagResult validateTagResult = refPointMatcher.validateTag(mockHtmlTag, mockContext);

        Assert.assertEquals(validateTagResult.getValidationResult().getStatus(), ValidatorProtos.ValidationResult.Status.PASS);
        Assert.assertEquals(validateTagResult.getBestMatchTagSpec(), mockTagSpec);

        refPointMatcher.cleanup();
    }

    @Test
    public void testValidateTagFailOneRefPoint() throws TagValidationException, ValidatorException, IOException, CssValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.getSpec()).thenReturn(ValidatorProtos.TagSpec.newBuilder().setMandatoryParent("HEAD").build());

        Mockito.when(mockTagSpec.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.doAnswer(new Answer() {
            public Void answer(final InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();

                ValidatorProtos.ValidationResult.Builder validationResult = (ValidatorProtos.ValidationResult.Builder) args[4];
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

                return null;
            }
        }).when(mockContext).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                                    Mockito.any(Locator.class),
                                    Mockito.anyListOf(String.class),
                                    Mockito.anyString(),
                                    Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);


        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));
        Mockito.when(mockPoints.size()).thenReturn(1);

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);
        final ValidateTagResult validateTagResult = refPointMatcher.validateTag(mockHtmlTag, mockContext);

        Assert.assertEquals(validateTagResult.getValidationResult().getStatus(), ValidatorProtos.ValidationResult.Status.FAIL);
        Assert.assertNull(validateTagResult.getBestMatchTagSpec());

        Mockito.verify(mockContext, Mockito.times(2)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        refPointMatcher.cleanup();
    }

    @Test
    public void testValidateTagFailTwoRefPoint() throws TagValidationException, ValidatorException, IOException, CssValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.getSpec()).thenReturn(ValidatorProtos.TagSpec.newBuilder().setMandatoryParent("HEAD").build());

        Mockito.when(mockTagSpec.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(true);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.doAnswer(new Answer() {
            public Void answer(final InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();

                ValidatorProtos.ValidationResult.Builder validationResult = (ValidatorProtos.ValidationResult.Builder) args[4];
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

                return null;
            }
        }).when(mockContext).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);


        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder2 = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint2 = refPointBuilder2.build();

        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint, refPoint2));
        Mockito.when(mockPoints.size()).thenReturn(2);

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);
        Assert.assertEquals(refPointMatcher.getLineCol(), locator);

        final ValidateTagResult validateTagResult = refPointMatcher.validateTag(mockHtmlTag, mockContext);

        Assert.assertEquals(validateTagResult.getValidationResult().getStatus(), ValidatorProtos.ValidationResult.Status.FAIL);
        Assert.assertNull(validateTagResult.getBestMatchTagSpec());

        Mockito.verify(mockContext, Mockito.times(3)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        refPointMatcher.cleanup();

        Assert.assertNull(refPointMatcher.getLineCol());
    }

    @Test(expectedExceptions = ValidatorException.class, expectedExceptionsMessageRegExp = "Successful validation should have exited earlier")
    public void testValidateTagPassNotUsedForTypeIdentifiers()
            throws TagValidationException, ValidatorException, IOException, CssValidationException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.getSpec()).thenReturn(ValidatorProtos.TagSpec.newBuilder().setMandatoryParent("HEAD").build());

        Mockito.when(mockTagSpec.isUsedForTypeIdentifiers(Mockito.anyListOf(String.class))).thenReturn(false);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.doAnswer(new Answer() {
            public Void answer(final InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();

                ValidatorProtos.ValidationResult.Builder validationResult = (ValidatorProtos.ValidationResult.Builder) args[4];
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

                return null;
            }
        }).when(mockContext).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);


        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));
        Mockito.when(mockPoints.size()).thenReturn(1);

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);
        refPointMatcher.validateTag(mockHtmlTag, mockContext);
    }

    @Test
    public void testExitParentTagMandatoryTagMissing()
            throws TagValidationException, ValidatorException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.id()).thenReturn(10);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockRules.getReferencePointName(Mockito.any(ValidatorProtos.ReferencePoint.class))).thenReturn("refPoint1");
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.setMandatory(true).build();
        Mockito.when(mockRules.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(8);


        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));
        Mockito.when(mockPoints.size()).thenReturn(2);
        Mockito.when(mockPoints.parentTagSpecName()).thenReturn("parent1");
        ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);

        refPointMatcher.recordMatch(mockTagSpec);
        refPointMatcher.recordMatch(mockTagSpec);

        final ParsedTagSpec mockTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec2.id()).thenReturn(9);

        refPointMatcher.exitParentTag(mockContext, builder);

        Mockito.verify(mockContext, Mockito.times(1)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 2);
        Assert.assertEquals(params.get(0), "refPoint1");
        Assert.assertEquals(params.get(1), "parent1");
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MANDATORY_REFERENCE_POINT_MISSING);

        refPointMatcher.cleanup();
    }

    @Test
    public void testExitParentTagDuplicateRefPoint()
            throws TagValidationException, ValidatorException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.id()).thenReturn(10);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockRules.getReferencePointName(Mockito.any(ValidatorProtos.ReferencePoint.class))).thenReturn("refPoint1");
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.setUnique(true).build();
        Mockito.when(mockRules.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(10);


        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint));
        Mockito.when(mockPoints.size()).thenReturn(2);
        Mockito.when(mockPoints.parentTagSpecName()).thenReturn("parent1");
        ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);

        refPointMatcher.recordMatch(mockTagSpec);
        refPointMatcher.recordMatch(mockTagSpec);

        final ParsedTagSpec mockTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec2.id()).thenReturn(9);

        refPointMatcher.exitParentTag(mockContext, builder);

        Mockito.verify(mockContext, Mockito.times(1)).addError(errorCodeCapture.capture(),
                Mockito.any(Locator.class),
                listCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 2);
        Assert.assertEquals(params.get(0), "refPoint1");
        Assert.assertEquals(params.get(1), "parent1");
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.DUPLICATE_REFERENCE_POINT);

        refPointMatcher.cleanup();
    }

    @Test
    public void testExitParentTag()
            throws TagValidationException, ValidatorException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.id()).thenReturn(10);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);


        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.setMandatory(true).build();

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder2 = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint2 = refPointBuilder2.setUnique(true).build();
        Mockito.when(mockRules.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(8).thenReturn(10);


        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint, refPoint2));
        Mockito.when(mockPoints.size()).thenReturn(2);

        ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);

        refPointMatcher.recordMatch(mockTagSpec);
        refPointMatcher.recordMatch(mockTagSpec);

        final ParsedTagSpec mockTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec2.id()).thenReturn(9);

        refPointMatcher.exitParentTag(mockContext, builder);

        Mockito.verify(mockContext, Mockito.times(2)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        refPointMatcher.cleanup();
    }

    @Test
    public void testExitParentTagZeroErrors()
            throws TagValidationException, ValidatorException {

        final ParsedValidatorRules mockRules = Mockito.mock(ParsedValidatorRules.class);
        final ParsedTagSpec mockTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec.id()).thenReturn(10);

        final ParsedReferencePoints mockPoints = Mockito.mock(ParsedReferencePoints.class);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId2";
            }

            @Override
            public int getLineNumber() {
                return 30;
            }

            @Override
            public int getColumnNumber() {
                return 40;
            }
        };

        final ParsedHtmlTag mockHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(mockHtmlTag.upperName()).thenReturn("HTML");

        final Attributes mockAttrs = Mockito.mock(Attributes.class);
        Mockito.when(mockAttrs.getLength()).thenReturn(0);
        Mockito.when(mockHtmlTag.attrs()).thenReturn(mockAttrs);

        final Context mockContext = Mockito.mock(Context.class);

        Mockito.when(mockRules.getByTagSpecId(Mockito.anyString())).thenReturn(mockTagSpec);
        Mockito.when(mockRules.betterValidationResultThan(Mockito.any(ValidatorProtos.ValidationResult.Builder.class),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class))).thenReturn(true);
        Mockito.when(mockContext.getRules()).thenReturn(mockRules);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentTagName()).thenReturn("BODY");
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);


        final ValidatorProtos.ReferencePoint.Builder refPointBuilder = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint = refPointBuilder.build();

        final ValidatorProtos.ReferencePoint.Builder refPointBuilder2 = ValidatorProtos.ReferencePoint.newBuilder();

        final ValidatorProtos.ReferencePoint refPoint2 = refPointBuilder2.build();
        Mockito.when(mockRules.getTagSpecIdByReferencePointTagSpecName(Mockito.anyString())).thenReturn(8).thenReturn(10);


        Mockito.when(mockPoints.iterate()).thenReturn(ImmutableList.of(refPoint, refPoint2));
        Mockito.when(mockPoints.size()).thenReturn(2);

        ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        final ReferencePointMatcher refPointMatcher = new ReferencePointMatcher(mockRules, mockPoints, locator);

        refPointMatcher.recordMatch(mockTagSpec);
        refPointMatcher.recordMatch(mockTagSpec);

        final ParsedTagSpec mockTagSpec2 = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockTagSpec2.id()).thenReturn(9);

        refPointMatcher.exitParentTag(mockContext, builder);

        Mockito.verify(mockContext, Mockito.times(0)).addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                Mockito.any(Locator.class),
                Mockito.anyListOf(String.class),
                Mockito.anyString(),
                Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        refPointMatcher.cleanup();
    }
}
