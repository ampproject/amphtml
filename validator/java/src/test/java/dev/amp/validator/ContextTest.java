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

import java.util.Collections;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test class for {@link Context}
 *
 * @author sphatak01
 */
public class ContextTest {

    /**
     * Initialize.
     */
    @BeforeClass
    public void init() throws Exception {
        ampValidatorManager = new AMPValidatorManager();
        ampValidatorManager.loadRule("validator-all-test.protoascii");
    }

    /**
     *
     * @throws TagValidationException
     */
    @Test
    public void testUpdateFromTagResultsAncestorNoHead() throws TagValidationException {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);
        final ParsedHtmlTag htmlTag = mock(ParsedHtmlTag.class);
        when(htmlTag.upperName()).thenReturn(UPPER_NAME);

        final ValidateTagResult mockReferencePointResult = mock(ValidateTagResult.class);

        final ValidateTagResult mockTagResult = mock(ValidateTagResult.class);
        final ValidatorProtos.ValidationResult.Builder validationBuilder = ValidatorProtos.ValidationResult.newBuilder();
        validationBuilder.setStatus(ValidatorProtos.ValidationResult.Status.PASS);

        when(mockTagResult.getValidationResult()).thenReturn(validationBuilder);

        final ParsedTagSpec tagSpec = mock(ParsedTagSpec.class);
        final ValidatorProtos.TagSpec tagSpecMock = mockValidatorRules.getByTagSpecId("test_satisfies").getSpec();
        when(tagSpec.getSpec()).thenReturn(tagSpecMock);
        when(mockTagResult.getBestMatchTagSpec()).thenReturn(tagSpec);

        context.updateFromTagResults(htmlTag, mockReferencePointResult, mockTagResult);

        Assert.assertTrue(context.satisfiesCondition("amp-app-banner button[open-button]"));
        Assert.assertEquals(context.getMandatoryAlternativesSatisfied().size(), 1);
        Assert.assertEquals(context.getMandatoryAlternativesSatisfied().get(0), "alternative");
        Assert.assertNotNull(context.getTagspecsValidated());
        Assert.assertTrue(context.getTagspecsValidated().get(0));
        Assert.assertTrue(context.hasTagspecsValidated(0));
    }

    @Test
    public void testMarkUrlSeenFromMatchingTagSpec() {
    }

    /**
     *
     * @throws TagValidationException
     */
    @Test
    public void testSatisfyMandatoryAlternativesFromTagSpec() throws TagValidationException {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);

        final ParsedTagSpec tagSpec = mock(ParsedTagSpec.class);
        final ValidatorProtos.TagSpec tagSpecMock = mockValidatorRules.getByTagSpecId("test_satisfies").getSpec();
        when(tagSpec.getSpec()).thenReturn(tagSpecMock);

        context.satisfyMandatoryAlternativesFromTagSpec(tagSpec);

        Assert.assertEquals(context.getMandatoryAlternativesSatisfied().size(), 1);
        Assert.assertEquals(context.getMandatoryAlternativesSatisfied().get(0), "alternative");
    }

    /**
     *
     */
    @Test
    public void testAddBuiltError() {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);

        final ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        final ValidatorProtos.ValidationError.Builder error = ValidatorProtos.ValidationError.newBuilder();
        error.setCode(ValidatorProtos.ValidationError.Code.EXTENSION_UNUSED);
        error.setSeverity(ValidatorProtos.ValidationError.Severity.WARNING);

        context.addBuiltError(error.build(), builder);

        Assert.assertEquals(builder.getStatus(), ValidatorProtos.ValidationResult.Status.UNKNOWN);
        Assert.assertEquals(builder.getErrorsList().size(), 1);

        error.setSeverity(ValidatorProtos.ValidationError.Severity.ERROR);

        context.addBuiltError(error.build(), builder);
        Assert.assertEquals(builder.getStatus(), ValidatorProtos.ValidationResult.Status.FAIL);
        Assert.assertEquals(builder.getErrorsList().size(), 2);
    }

    /**
     * test adding an error field to validationResult with severity ERROR.
     */
    @Test
    public void testAddError() {
        final String mockSpecUrl = "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#links";
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);
        final ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        context.addError(ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
                new Locator() {
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
                },
                Collections.emptyList(),
                mockSpecUrl,
                builder);

        Assert.assertEquals(builder.getStatus(), ValidatorProtos.ValidationResult.Status.FAIL);
        Assert.assertEquals(builder.getErrorsList().size(), 1);
        Assert.assertEquals(builder.getErrorsList().get(0).getLine(), 23);
        Assert.assertEquals(builder.getErrorsList().get(0).getCol(), 2);
        Assert.assertEquals(builder.getErrorsList().get(0).getCode(), ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR);
        Assert.assertEquals(builder.getErrorsList().get(0).getSpecUrl(), mockSpecUrl);
    }

    /**
     *
     */
    @Test
    public void testAddError1() {
        final String mockSpecUrl = "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#links";
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);
        final ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        context.addError(ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
                23, 2, Collections.emptyList(),
                mockSpecUrl,
                builder);

        Assert.assertEquals(builder.getStatus(), ValidatorProtos.ValidationResult.Status.FAIL);
        Assert.assertEquals(builder.getErrorsList().size(), 1);
        Assert.assertEquals(builder.getErrorsList().get(0).getLine(), 23);
        Assert.assertEquals(builder.getErrorsList().get(0).getCol(), 2);
        Assert.assertEquals(builder.getErrorsList().get(0).getCode(), ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR);
        Assert.assertEquals(builder.getErrorsList().get(0).getSpecUrl(), mockSpecUrl);
    }

    /**
     *
     */
    @Test
    public void testAddWarning() {
        final String mockSpecUrl = "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#links";
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);
        final ValidatorProtos.ValidationResult.Builder builder = ValidatorProtos.ValidationResult.newBuilder();

        context.addWarning(ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR,
                new Locator() {
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
                },
                Collections.emptyList(),
                mockSpecUrl,
                builder);

        Assert.assertEquals(builder.getStatus(), ValidatorProtos.ValidationResult.Status.UNKNOWN);
        Assert.assertEquals(builder.getErrorsList().size(), 1);
        Assert.assertEquals(builder.getErrorsList().get(0).getLine(), 23);
        Assert.assertEquals(builder.getErrorsList().get(0).getCol(), 2);
        Assert.assertEquals(builder.getErrorsList().get(0).getCode(), ValidatorProtos.ValidationError.Code.DISALLOWED_ATTR);
        Assert.assertEquals(builder.getErrorsList().get(0).getSpecUrl(), mockSpecUrl);
    }

    /**
     * test line cols.
     */
    @Test
    public void testLineCol() {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);

        context.setLineCol(new Locator() {
            @Override
            public String getPublicId() {
                return "pub_id";
            }

            @Override
            public String getSystemId() {
                return "sys_id";
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 2;
            }
        });

        Assert.assertEquals(context.getLineCol().getColumnNumber(), 2);
        Assert.assertEquals(context.getLineCol().getLineNumber(), 23);
        Assert.assertEquals(context.getLineCol().getSystemId(), "sys_id");
        Assert.assertEquals(context.getLineCol().getPublicId(), "pub_id");

    }

    /**
     *
     */
    @Test
    public void testSettersGetters() {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);
        context.recordTypeIdentifier("type_id");
        context.recordTypeIdentifier("transformed");

        Assert.assertEquals(context.getRules(), mockValidatorRules);
        Assert.assertNotNull(context.getTagStack());
        Assert.assertEquals(context.getTypeIdentifiers().size(), 2);
        Assert.assertEquals(context.getTypeIdentifiers().get(0), "type_id");
        Assert.assertTrue(context.isTransformed());
        Assert.assertNotNull(context.getTagStack());
        Assert.assertNotNull(context.getExtensions());

    }

    /**
     *
     */
    @Test
    public void testByteSizeComputations() {
        mockValidatorRules = new ParsedValidatorRules(ValidatorProtos.HtmlFormat.Code.AMP, ampValidatorManager);
        final Context context = new Context(mockValidatorRules);

        context.addInlineStyleByteSize(40);
        context.addStyleAmpCustomByteSize(50);

        Assert.assertEquals(context.getInlineStyleByteSize(), 40);
        Assert.assertEquals(context.getStyleAmpCustomByteSize(), 50);
    }

    private ParsedValidatorRules mockValidatorRules;
    private static final String UPPER_NAME = "HEAD";
    /** AMPValidatorManager object. */
    private AMPValidatorManager ampValidatorManager;
}
