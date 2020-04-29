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
import dev.amp.validator.utils.CssSpecUtils;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Tests for {@link CdataMatcher}
 *
 * @author sphatak01
 */
public class CdataMatcherTest {

    @Test
    public void testMatchStylesheetTooLong() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(2);

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 2);
        Assert.assertEquals(params.get(0), "6");
        Assert.assertEquals(params.get(1), "2");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.STYLESHEET_TOO_LONG);

    }

    @Test
    public void testMatchMandatoryCDataMissing() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.setMandatoryCdata("manCdata");

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT);

    }

    @Test
    public void testMatchExactMatch() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.setCdataRegex("cdata");

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        String fullMatchRegex = "cdata";
        Pattern pattern = Pattern.compile(fullMatchRegex);

        Mockito.when(mockParsedValidatorRules.getFullMatchRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT);

    }

    @Test
    public void testMatchCssSpec() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.setCssSpec(ValidatorProtos.CssSpec.newBuilder()
                .addAtRuleSpec(ValidatorProtos.AtRuleSpec.newBuilder()
                  .setName("font-face").build()).build());

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        String fullMatchRegex = "cdata";
        Pattern pattern = Pattern.compile(fullMatchRegex);

        Mockito.when(mockParsedValidatorRules.getFullMatchRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE);

    }

    @Test
    public void testMatchWhitespaceOnly() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.setWhitespaceOnly(true);

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        String fullMatchRegex = "cdata";
        Pattern pattern = Pattern.compile(fullMatchRegex);

        Mockito.when(mockParsedValidatorRules.getFullMatchRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.NON_WHITESPACE_CDATA_ENCOUNTERED);

    }

    @Test
    public void testMatchViolateBlacklist() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("cdata").build());

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockTagStack.isStyleAmpCustomChild()).thenReturn(true);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockParsedValidatorRules.getCombinedBlacklistedCdataRegex(Mockito.anyInt())).thenReturn("cdata");
        String partialMatchRegex = "cdata";
        Pattern pattern = Pattern.compile(partialMatchRegex);

        Mockito.when(mockParsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        cDataMatcher.match("cdata1", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 2);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CDATA_VIOLATES_BLACKLIST);

    }

    @Test
    public void testMatchPartialMatch() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("cdata1").build());

        tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockParsedValidatorRules.getCombinedBlacklistedCdataRegex(Mockito.anyInt())).thenReturn("xyz");
        String partialMatchRegex = "[0-9]";
        Pattern pattern = Pattern.compile(partialMatchRegex);

        Mockito.when(mockParsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        cDataMatcher.match("cdata", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(0))
                .addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    }

    @Test(expectedExceptions = CssValidationException.class, expectedExceptionsMessageRegExp = "atRuleSpec name is not 'media'")
    public void testMatchCssNotMedia() throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("cdata1").build());
        cDataBuilder.setCssSpec(ValidatorProtos.CssSpec.newBuilder()
                .addAtRuleSpec(ValidatorProtos.AtRuleSpec.newBuilder()
                        .setName("font-face").setMediaQuerySpec(ValidatorProtos.MediaQuerySpec.newBuilder()
                                .build()).build()).build());

                    tagSpecBuilder.setCdata(cDataBuilder.build());

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockParsedValidatorRules.getCombinedBlacklistedCdataRegex(Mockito.anyInt())).thenReturn("xyz");
        String partialMatchRegex = "[0-9]";
        Pattern pattern = Pattern.compile(partialMatchRegex);

        Mockito.when(mockParsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        cDataMatcher.match("cdata", mockContext, result);

        Mockito.verify(mockContext, Mockito.times(0))
                .addError(Mockito.any(ValidatorProtos.ValidationError.Code.class),
                        Mockito.any(Locator.class),
                        Mockito.anyListOf(String.class),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

    }

    @Test
    public void testMatchCssMediaErrors() throws CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CssSpec cssSpec = ValidatorProtos.CssSpec.newBuilder()
                .addAtRuleSpec(ValidatorProtos.AtRuleSpec.newBuilder()
                        .setName("media").setMediaQuerySpec(ValidatorProtos.MediaQuerySpec.newBuilder().setIssuesAsError(true)
                                .build()).build())
                .setValidateAmp4Ads(true).setValidateKeyframes(true).build();
        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("cdata1").build());
        cDataBuilder.setCssSpec(cssSpec);
        tagSpecBuilder.setCdata(cDataBuilder.build());

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockParsedValidatorRules.getCombinedBlacklistedCdataRegex(Mockito.anyInt())).thenReturn("xyz");
        String partialMatchRegex = "[0-9]";
        Pattern pattern = Pattern.compile(partialMatchRegex);

        Mockito.when(mockParsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        cDataMatcher.matchCss("cdata", cssSpec, mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE);

    }

    @Test
    public void testMatchCssMediaWarnings() throws CssValidationException, IOException {
        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecName("title");

        final ValidatorProtos.CssSpec cssSpec = ValidatorProtos.CssSpec.newBuilder()
                .addAtRuleSpec(ValidatorProtos.AtRuleSpec.newBuilder()
                        .setName("media").setMediaQuerySpec(ValidatorProtos.MediaQuerySpec.newBuilder().setIssuesAsError(false)
                    .build()).build())
                .setValidateAmp4Ads(false).setValidateKeyframes(false).build();
        final ValidatorProtos.CdataSpec.Builder cDataBuilder = ValidatorProtos.CdataSpec.newBuilder();
        cDataBuilder.setMaxBytes(6);
        cDataBuilder.addBlacklistedCdataRegex(ValidatorProtos.BlackListedCDataRegex.newBuilder().setRegex("cdata1").build());
        cDataBuilder.setCssSpec(cssSpec);
        tagSpecBuilder.setCdata(cDataBuilder.build());

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpecBuilder.build());
        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId1";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 24;
            }

            @Override
            public int getColumnNumber() {
                return 35;
            }
        };

        final Context mockContext = Mockito.mock(Context.class);
        Mockito.when(mockContext.getLineCol()).thenReturn(locator);

        final TagStack mockTagStack = Mockito.mock(TagStack.class);
        Mockito.when(mockContext.getTagStack()).thenReturn(mockTagStack);

        final ParsedValidatorRules mockParsedValidatorRules = Mockito.mock(ParsedValidatorRules.class);
        Mockito.when(mockParsedValidatorRules.getCombinedBlacklistedCdataRegex(Mockito.anyInt())).thenReturn("xyz");
        String partialMatchRegex = "[0-9]";
        Pattern pattern = Pattern.compile(partialMatchRegex);

        Mockito.when(mockParsedValidatorRules.getPartialMatchCaseiRegex(Mockito.anyString())).thenReturn(pattern);
        Mockito.when(mockContext.getRules()).thenReturn(mockParsedValidatorRules);
        final ValidatorProtos.ValidationResult.Builder result = ValidatorProtos.ValidationResult.newBuilder();

        final CdataMatcher cDataMatcher = new CdataMatcher(mockParsedTagSpec, locator);

        cDataMatcher.matchCss("cdata", cssSpec, mockContext, result);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.size(), 1);
        Assert.assertEquals(params.get(0), "title");

        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE);

    }
}
