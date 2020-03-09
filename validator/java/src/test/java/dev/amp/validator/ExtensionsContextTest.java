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

import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import java.util.List;

public class ExtensionsContextTest {

    @Test
    public void testRecordFutureErrorsIfMissing() {
        final ExtensionsContext extContext = new ExtensionsContext();

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        final ValidatorProtos.TagSpec tagSpec = ValidatorProtos.TagSpec.newBuilder().addRequiresExtension("amp-form").
                setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup").
                setSpecName("test_parent").build();
        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpec);

        final Locator locator = new Locator() {
            @Override
            public String getPublicId() {
                return "pubId2";
            }

            @Override
            public String getSystemId() {
                return "sysId1";
            }

            @Override
            public int getLineNumber() {
                return 23;
            }

            @Override
            public int getColumnNumber() {
                return 45;
            }
        };

        extContext.recordFutureErrorsIfMissing(mockParsedTagSpec, locator);
        final List<ValidatorProtos.ValidationError> errors = extContext.missingExtensionErrors();

        Assert.assertEquals(errors.size(), 1);
        Assert.assertEquals(errors.get(0).getCode(), ValidatorProtos.ValidationError.Code.MISSING_REQUIRED_EXTENSION);
        Assert.assertEquals(errors.get(0).getSeverity(), ValidatorProtos.ValidationError.Severity.ERROR);
        Assert.assertEquals(errors.get(0).getLine(), 23);
        Assert.assertEquals(errors.get(0).getCol(), 45);
        Assert.assertEquals(errors.get(0).getSpecUrl(), "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup");
        Assert.assertEquals(errors.get(0).getParamsList().size(), 2);
        Assert.assertEquals(errors.get(0).getParamsList().get(0), "test_parent");
        Assert.assertEquals(errors.get(0).getParamsList().get(1), "amp-form");

    }

    @Test
    public void testUpdateFromtagResultsNullbestMatchTagSpec() {
        final ExtensionsContext extContext = new ExtensionsContext();

        ValidateTagResult mockTagResult = Mockito.mock(ValidateTagResult.class);
        Mockito.when(mockTagResult.getBestMatchTagSpec()).thenReturn(null);

        extContext.updateFromTagResult(mockTagResult);
        Assert.assertEquals(extContext.unusedExtensionsRequired().size(), 0);
    }

    @Test
    public void testUpdateFromtagResults() {
        final ExtensionsContext extContext = new ExtensionsContext();

        ValidateTagResult mockTagResult = Mockito.mock(ValidateTagResult.class);

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        final ValidatorProtos.TagSpec tagSpec = ValidatorProtos.TagSpec.newBuilder()
                .setExtensionSpec(ValidatorProtos.ExtensionSpec.newBuilder().setName("amp-date-picker")
                        .setRequiresUsage(ValidatorProtos.ExtensionSpec.ExtensionUsageRequirement.EXEMPTED).build())
                .addRequiresExtension("amp-form")
                .setSpecName("test_parent").build();

        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpec);
        Mockito.when(mockTagResult.getBestMatchTagSpec()).thenReturn(mockParsedTagSpec);

        extContext.updateFromTagResult(mockTagResult);

        Assert.assertTrue(extContext.isExtensionLoaded("amp-date-picker"));
        Assert.assertTrue(extContext.isExtensionLoaded("amp-ad"));

        Assert.assertEquals(extContext.unusedExtensionsRequired().size(), 0);
    }

    @Test
    public void testUpdateFromtagResultsError() {
        final ExtensionsContext extContext = new ExtensionsContext();

        ValidateTagResult mockTagResult = Mockito.mock(ValidateTagResult.class);

        final ParsedTagSpec mockParsedTagSpec = Mockito.mock(ParsedTagSpec.class);
        final ValidatorProtos.TagSpec tagSpec = ValidatorProtos.TagSpec.newBuilder()
                .setExtensionSpec(ValidatorProtos.ExtensionSpec.newBuilder().setName("amp-date-picker")
                        .setRequiresUsage(ValidatorProtos.ExtensionSpec.ExtensionUsageRequirement.ERROR).build())
                .addRequiresExtension("amp-form")
                .setSpecName("test_parent").build();

        Mockito.when(mockParsedTagSpec.getSpec()).thenReturn(tagSpec);
        Mockito.when(mockTagResult.getBestMatchTagSpec()).thenReturn(mockParsedTagSpec);

        extContext.updateFromTagResult(mockTagResult);

        Assert.assertTrue(extContext.isExtensionLoaded("amp-date-picker"));
        Assert.assertTrue(extContext.isExtensionLoaded("amp-ad"));
        Assert.assertEquals(extContext.unusedExtensionsRequired().size(), 1);
        Assert.assertEquals(extContext.unusedExtensionsRequired().get(0), "amp-date-picker");
    }
}
