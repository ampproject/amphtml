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
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.any;

/**
 * Tests for {@link TagStack}
 *
 * @author sphatak01
 */
public class TagStackTest {

    @BeforeClass
    public void init() throws Exception {
        ampValidatorManager = new AMPValidatorManager();
        ampValidatorManager.loadRule("validator-all-test.protoascii");
    }

    @Test
    public void testParentStackEntry() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        Assert.assertEquals(tagStack.parentTagName(), "!DOCTYPE");
        Assert.assertEquals(tagStack.parentStackEntry().getTagName(), "!DOCTYPE");
    }

    @Test(expectedExceptions = TagValidationException.class)
    public void testParentStackEntryError() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Context context = mock(Context.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        tagStack.exitTag(context, validationBuilder);
        tagStack.exitTag(context, validationBuilder);

        tagStack.parentStackEntry();
    }

    @Test
    public void testBack() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        Assert.assertEquals(tagStack.back().getTagName(), "!DOCTYPE");
    }

    @Test(expectedExceptions = TagValidationException.class)
    public void testBackError() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Context context = mock(Context.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        Assert.assertEquals(tagStack.back().getTagName(), "!DOCTYPE");
        tagStack.exitTag(context, validationBuilder);
        tagStack.exitTag(context, validationBuilder);

        tagStack.back();
    }

    @Test
    public void testTellParentNoSiblingsAllowed() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        tagStack.tellParentNoSiblingsAllowed("test_satisfies", lineCol);

        Assert.assertTrue(tagStack.parentHasChildWithNoSiblingRule());
        Assert.assertEquals(tagStack.parentOnlyChildTagName(), "test_satisfies");
        Assert.assertEquals(tagStack.parentStackEntry().getOnlyChildTagName(), "test_satisfies");
        Assert.assertEquals(tagStack.parentOnlyChildErrorLineCol().getColumnNumber(), lineCol.getColumnNumber());
        Assert.assertEquals(tagStack.parentStackEntry().getOnlyChildErrorLineCol().getColumnNumber(), lineCol.getColumnNumber());
        Assert.assertEquals(tagStack.parentOnlyChildErrorLineCol().getLineNumber(), lineCol.getLineNumber());
        Assert.assertEquals(tagStack.parentStackEntry().getOnlyChildErrorLineCol().getLineNumber(), lineCol.getLineNumber());
    }

    @Test
    public void testTellParentImTheLastChild() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        tagStack.tellParentImTheLastChild("test_satisfies", "last_url", lineCol);
        Assert.assertTrue(tagStack.parentHasChildWithLastChildRule());
        Assert.assertEquals(tagStack.parentLastChildTagName(), "test_satisfies");
        Assert.assertEquals(tagStack.parentStackEntry().getLastChildTagName(), "test_satisfies");
        Assert.assertEquals(tagStack.parentLastChildUrl(), "last_url");
        Assert.assertEquals(tagStack.parentStackEntry().getLastChildUrl(), "last_url");
        Assert.assertEquals(tagStack.parentLastChildErrorLineCol().getColumnNumber(), lineCol.getColumnNumber());
        Assert.assertEquals(tagStack.parentStackEntry().getLastChildErrorLineCol().getColumnNumber(), lineCol.getColumnNumber());
        Assert.assertEquals(tagStack.parentLastChildErrorLineCol().getLineNumber(), lineCol.getLineNumber());
        Assert.assertEquals(tagStack.parentStackEntry().getLastChildErrorLineCol().getLineNumber(), lineCol.getLineNumber());
    }

    @Test
    public void testMatchChildTagName() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn("test_satisfies_parent_head");
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        when(mockReferencePointResult.getValidationResult()).thenReturn(validationBuilder);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies_parent_head");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        Assert.assertFalse(tagStack.hasAncestorMarker(ValidatorProtos.AncestorMarker.Marker.AUTOSCROLL));

        final ReferencePointMatcher refMatch = mock(ReferencePointMatcher.class);
        tagStack.setReferencePointMatcher(refMatch);
        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);

        final Context context = mock(Context.class);

        tagStack.matchChildTagName(htmlTag, context, validationBuilder);
    }

    @Test
    public void testAncestor() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn("test_satisfies_parent_head");
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        when(mockReferencePointResult.getValidationResult()).thenReturn(validationBuilder);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies_parent_head");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        Assert.assertFalse(tagStack.hasAncestorMarker(ValidatorProtos.AncestorMarker.Marker.AUTOSCROLL));

        final ReferencePointMatcher refMatch = mock(ReferencePointMatcher.class);
        tagStack.setReferencePointMatcher(refMatch);
        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);

        Assert.assertTrue(tagStack.hasAncestor("!DOCTYPE"));
        Assert.assertTrue(tagStack.hasAncestor("test_satisfies_parent_head"));
        Assert.assertFalse(tagStack.hasAncestor("test_satisfies"));

        Assert.assertTrue(tagStack.hasAncestorMarker(ValidatorProtos.AncestorMarker.Marker.AUTOSCROLL));
    }

    @Test(expectedExceptions = TagValidationException.class, expectedExceptionsMessageRegExp = "Ancestor marker is unknown")
    public void testHasAncestorMarkerError() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        tagStack.hasAncestorMarker(ValidatorProtos.AncestorMarker.Marker.UNKNOWN);
    }

    @Test(expectedExceptions = TagValidationException.class, expectedExceptionsMessageRegExp = "Exiting an empty tag stack.")
    public void testExitTagError() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Context context = mock(Context.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        tagStack.exitTag(context, validationBuilder);
        tagStack.exitTag(context, validationBuilder);

        tagStack.exitTag(context, validationBuilder);
    }

    @Test
    public void testExitTag() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn("test_satisfies_parent_head");
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        when(mockReferencePointResult.getValidationResult()).thenReturn(validationBuilder);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies_parent_head");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        final ReferencePointMatcher refMatch = mock(ReferencePointMatcher.class);
        tagStack.setReferencePointMatcher(refMatch);
        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);

        final Context context = mock(Context.class);
        tagStack.exitTag(context, validationBuilder);

        Assert.assertEquals(tagStack.parentTagName(), "!DOCTYPE");
    }

    @Test
    public void testUpdateStackEntryFromTagResultBestMatchNull() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);

        tagStack.updateStackEntryFromTagResult(mockTagResult, mockValidatorRules, lineCol);
    }

    @Test
    public void testUpdateStackEntryFromTagResult() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_parent");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);
        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        tagStack.updateStackEntryFromTagResult(mockTagResult, mockValidatorRules, lineCol);

        Assert.assertNotNull(tagStack.parentStackEntry().getChildTagMatcher());
        Assert.assertNotNull(tagStack.cdataMatcher());
    }

    @Test
    public void testUpdateFromTagResults() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn("test_satisfies");
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies_parent_head"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        when(mockReferencePointResult.getValidationResult()).thenReturn(validationBuilder);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        final ReferencePointMatcher refMatch = mock(ReferencePointMatcher.class);
        tagStack.setReferencePointMatcher(refMatch);
        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);


        Assert.assertTrue(tagStack.hasAncestor("!DOCTYPE"));
        verify(refMatch, times(1)).recordMatch(any(ParsedTagSpec.class));
        Assert.assertEquals(tagStack.parentStackEntry().getNumChildren(), 0);
        Assert.assertEquals(tagStack.parentStackEntry().getReferencePoint(), mockValidatorRules
                .getByTagSpecId("test_satisfies_parent_head"));
        Assert.assertEquals(tagStack.parentStackEntry().getTagSpec(),
                mockValidatorRules.getByTagSpecId("test_satisfies"));
        Assert.assertFalse(tagStack.isStyleAmpCustomChild());
    }

    @Test
    public void testUpdateFromTagResultsParentHead() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn("test_satisfies_parent_head");
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
        when(mockReferencePointResult.getValidationResult()).thenReturn(validationBuilder);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies_parent_head");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        final ReferencePointMatcher refMatch = mock(ReferencePointMatcher.class);
        tagStack.setReferencePointMatcher(refMatch);
        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);


        Assert.assertTrue(tagStack.hasAncestor("!DOCTYPE"));
        verify(refMatch, times(1)).recordMatch(any(ParsedTagSpec.class));
        Assert.assertEquals(tagStack.parentStackEntry().getNumChildren(), 0);
        Assert.assertEquals(tagStack.parentStackEntry().getReferencePoint(), mockValidatorRules
                .getByTagSpecId("test_satisfies"));
        Assert.assertEquals(tagStack.parentStackEntry().getTagSpec(),
                mockValidatorRules.getByTagSpecId("test_satisfies_parent_head"));
        Assert.assertTrue(tagStack.isStyleAmpCustomChild());

        Assert.assertTrue(tagStack.parentStackEntry().getHasDescendantConstraintLists());
        Assert.assertEquals(tagStack.allowedDescendantsList().size(), 1);
        Assert.assertEquals(tagStack.allowedDescendantsList().get(0).getTagName(), "test_satisfies_parent_head");
        Assert.assertEquals(tagStack.allowedDescendantsList().get(0).getAllowedTags().size(), 2);

        Assert.assertEquals(tagStack.allowedDescendantsList().get(0).getAllowedTags().get(0), "A");
        Assert.assertEquals(tagStack.allowedDescendantsList().get(0).getAllowedTags().get(1), "ABBR");
        Assert.assertFalse(tagStack.isScriptTypeJsonChild());

    }

    @Test(expectedExceptions = TagValidationException.class, expectedExceptionsMessageRegExp = "Parent's reference point matcher is null")
    public void testUpdateFromTagResultsRefParentNull() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        final Locator lineCol = new Locator() {
            @Override
            public String getPublicId() {
                return null;
            }

            @Override
            public String getSystemId() {
                return null;
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        };
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);
        when(mockReferencePointResult.getBestMatchTagSpec()).thenReturn(mockValidatorRules
                .getByTagSpecId("test_satisfies"));

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mockValidatorRules.getByTagSpecId("test_satisfies_parent_head");
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        tagStack.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult, mockValidatorRules, lineCol);
    }

    @Test
    public void testParentChildCount() throws TagValidationException {
        final TagStack tagStack = new TagStack();
        Assert.assertEquals(tagStack.parentChildCount(), 0);
    }

    private ParsedValidatorRules mockValidatorRules;

    /** AMPValidatorManager object. */
    private AMPValidatorManager ampValidatorManager;
}
