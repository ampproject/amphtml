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

import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.xml.sax.Locator;

import java.util.List;

/**
 * Tests for {@link UrlErrorInAttrAdapter}
 *
 * @author sphatak01
 */
public class UrlErrorInAttrAdapterTest {

    @Test
    public void testMissingUrl() {
        final String attrName = "attr";

        final UrlErrorInAttrAdapter urlErrorInAttrAdapter = new UrlErrorInAttrAdapter(attrName);
        final Context mockContext = Mockito.mock(Context.class);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInAttrAdapter.missingUrl(mockContext, tagSpec, resultBuilder);
        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "attr");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.MISSING_URL);

    }

    @Test
    public void testInvalidUrl() {
        final String attrName = "attr";

        final UrlErrorInAttrAdapter urlErrorInAttrAdapter = new UrlErrorInAttrAdapter(attrName);
        final Context mockContext = Mockito.mock(Context.class);

        final String url = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";
        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInAttrAdapter.invalidUrl(mockContext, url, tagSpec, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "attr");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(params.get(2), url);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.INVALID_URL);

    }

    @Test
    public void testInvalidUrlProtocol() {
        final String attrName = "attr";

        final UrlErrorInAttrAdapter urlErrorInAttrAdapter = new UrlErrorInAttrAdapter(attrName);
        final Context mockContext = Mockito.mock(Context.class);

        final String protocol = "http";
        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInAttrAdapter.invalidUrlProtocol(mockContext, protocol, tagSpec, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "attr");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(params.get(2), protocol);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.INVALID_URL_PROTOCOL);

    }

    @Test
    public void testDisallowedRelativeUrl() {
        final String attrName = "attr";

        final UrlErrorInAttrAdapter urlErrorInAttrAdapter = new UrlErrorInAttrAdapter(attrName);
        final Context mockContext = Mockito.mock(Context.class);

        final String url = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";
        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInAttrAdapter.disallowedRelativeUrl(mockContext, url, tagSpec, resultBuilder);

        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.any(Locator.class),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "attr");
        Assert.assertEquals(params.get(1), "spec1");
        Assert.assertEquals(params.get(2), url);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.DISALLOWED_RELATIVE_URL);

    }
}
