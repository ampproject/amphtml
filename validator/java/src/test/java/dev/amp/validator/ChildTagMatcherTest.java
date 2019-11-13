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

import amp.validator.Validator;
import dev.amp.validator.exception.TagValidationException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import java.util.List;

/**
 * Tests for {@link ChildTagMatcher}
 *
 * @author sphatak01
 */
public class ChildTagMatcherTest {

    @Test(expectedExceptions = TagValidationException.class)
    public void testConstructorError() throws TagValidationException {
        new ChildTagMatcher(Validator.TagSpec.newBuilder().build());
    }

    @Test
    public void testMatchChildTagNameNoError() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();

        final ParsedHtmlTag parsedHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(parsedHtmlTag.upperName()).thenReturn("CHILDNOTONEOF");
        Mockito.when(parsedHtmlTag.lowerName()).thenReturn("childnotoneof");

        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        tagSpecBuilder.setChildTags(childSpecBuilder.build());
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();


        childTagMatcher.matchChildTagName(parsedHtmlTag, mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(0))
                .addError(Mockito.any(Validator.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));
    }

    @Test
    public void testMatchChildTagName() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();
        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        childSpecBuilder.addChildTagNameOneof("CHILDONEOF");

        final ParsedHtmlTag parsedHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(parsedHtmlTag.upperName()).thenReturn("CHILDNOTONEOF");
        Mockito.when(parsedHtmlTag.lowerName()).thenReturn("childnotoneof");

        tagSpecBuilder.setChildTags(childSpecBuilder.build());
        tagSpecBuilder.setSpecName("spec1");
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        childTagMatcher.matchChildTagName(parsedHtmlTag, mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "childnotoneof");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(params.get(2), "['childoneof']");

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.DISALLOWED_CHILD_TAG_NAME);
    }

    @Test
    public void testMatchChildTagFirstChildTag() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();
        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        childSpecBuilder.addChildTagNameOneof("CHILDONEOF");
        childSpecBuilder.addFirstChildTagNameOneof("FIRSTCHILDONEOF");

        final ParsedHtmlTag parsedHtmlTag = Mockito.mock(ParsedHtmlTag.class);
        Mockito.when(parsedHtmlTag.upperName()).thenReturn("CHILDONEOF");
        Mockito.when(parsedHtmlTag.lowerName()).thenReturn("childoneof");

        tagSpecBuilder.setChildTags(childSpecBuilder.build());
        tagSpecBuilder.setSpecName("spec1");
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentChildCount()).thenReturn(0);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);


        childTagMatcher.matchChildTagName(parsedHtmlTag, mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "childoneof");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(params.get(2), "['firstchildoneof']");

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.DISALLOWED_FIRST_CHILD_TAG_NAME);
    }

    @Test
    public void testExitTagSuccess() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();
        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        childSpecBuilder.addChildTagNameOneof("CHILDONEOF");
        childSpecBuilder.addFirstChildTagNameOneof("FIRSTCHILDONEOF");

        tagSpecBuilder.setChildTags(childSpecBuilder.setMandatoryNumChildTags(1).setMandatoryMinNumChildTags(1).build());
        tagSpecBuilder.setSpecName("spec1");
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentChildCount()).thenReturn(1);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();

        childTagMatcher.exitTag(mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(0))
                .addError(Mockito.any(Validator.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));
    }

    @Test
    public void testExitTagExpectedChildTags() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();
        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        childSpecBuilder.addChildTagNameOneof("CHILDONEOF");
        childSpecBuilder.addFirstChildTagNameOneof("FIRSTCHILDONEOF");

        tagSpecBuilder.setChildTags(childSpecBuilder.setMandatoryNumChildTags(1).build());
        tagSpecBuilder.setSpecName("spec1");
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentChildCount()).thenReturn(0);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        childTagMatcher.exitTag(mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(params.get(1), "1");
        Assert.assertEquals(params.get(2), "0");

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.INCORRECT_NUM_CHILD_TAGS);
    }

    @Test
    public void testExitTagExpectedMinChildTags() throws TagValidationException {
        final Validator.TagSpec.Builder tagSpecBuilder = Validator.TagSpec.newBuilder();
        final Validator.ChildTagSpec.Builder childSpecBuilder = Validator.ChildTagSpec.newBuilder();
        childSpecBuilder.addChildTagNameOneof("CHILDONEOF");
        childSpecBuilder.addFirstChildTagNameOneof("FIRSTCHILDONEOF");

        tagSpecBuilder.setChildTags(childSpecBuilder.setMandatoryMinNumChildTags(1).build());
        tagSpecBuilder.setSpecName("spec1");
        final Validator.TagSpec tagSpec = tagSpecBuilder.build();

        final ChildTagMatcher childTagMatcher = new ChildTagMatcher(tagSpec);

        final Context mockContext = Mockito.mock(Context.class);
        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.parentChildCount()).thenReturn(0);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final Validator.ValidationResult.Builder resultBuilder = Validator.ValidationResult.newBuilder();

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Validator.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(Validator.ValidationError.Code.class);

        childTagMatcher.exitTag(mockContext, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(Validator.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(params.get(1), "1");
        Assert.assertEquals(params.get(2), "0");

        Assert.assertEquals(errorCodeCapture.getValue(), Validator.ValidationError.Code.INCORRECT_MIN_NUM_CHILD_TAGS);
    }

}