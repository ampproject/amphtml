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

import java.util.List;

/**
 * Tests for {@link UrlErrorInStylesheetAdapter}
 *
 * @author sphatak01
 */
public class UrlErrorInStylesheetAdapterTest {

    @Test
    public void testMissingUrl() {
        int lineNumber = 23;
        int colNumber = 45;

        final UrlErrorInStylesheetAdapter urlErrorInStylesheetAdapter = new UrlErrorInStylesheetAdapter(lineNumber, colNumber);
        final Context mockContext = Mockito.mock(Context.class);

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInStylesheetAdapter.missingUrl(mockContext, tagSpec, resultBuilder);
        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_MISSING_URL);

    }

    @Test
    public void testInvalidUrl() {
        final int lineNumber = 23;
        final int colNumber = 45;
        final String url = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final UrlErrorInStylesheetAdapter urlErrorInStylesheetAdapter = new UrlErrorInStylesheetAdapter(lineNumber, colNumber);
        final Context mockContext = Mockito.mock(Context.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInStylesheetAdapter.invalidUrl(mockContext, url, tagSpec, resultBuilder);
        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(params.get(1), url);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_URL);

    }

    @Test
    public void testInvalidUrlProtocol() {
        final int lineNumber = 23;
        final int colNumber = 45;
        final String protocol = "https";

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final UrlErrorInStylesheetAdapter urlErrorInStylesheetAdapter = new UrlErrorInStylesheetAdapter(lineNumber, colNumber);
        final Context mockContext = Mockito.mock(Context.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInStylesheetAdapter.invalidUrlProtocol(mockContext, protocol, tagSpec, resultBuilder);
        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(params.get(1), protocol);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL);

    }

    @Test
    public void testDisallowedRelativeUrl() {
        final int lineNumber = 23;
        final int colNumber = 45;
        final String url = "https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages";

        ArgumentCaptor<List> listCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<ValidatorProtos.ValidationError.Code> errorCodeCapture = ArgumentCaptor.forClass(ValidatorProtos.ValidationError.Code.class);

        final UrlErrorInStylesheetAdapter urlErrorInStylesheetAdapter = new UrlErrorInStylesheetAdapter(lineNumber, colNumber);
        final Context mockContext = Mockito.mock(Context.class);

        final ValidatorProtos.TagSpec.Builder tagSpecBuilder = ValidatorProtos.TagSpec.newBuilder();
        tagSpecBuilder.setSpecUrl("https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/style_pages");
        tagSpecBuilder.setSpecName("spec1");

        final ValidatorProtos.TagSpec tagSpec = tagSpecBuilder.build();
        final ValidatorProtos.ValidationResult.Builder resultBuilder = ValidatorProtos.ValidationResult.newBuilder();

        urlErrorInStylesheetAdapter.disallowedRelativeUrl(mockContext, url, tagSpec, resultBuilder);
        Mockito.verify(mockContext, Mockito.times(1))
                .addError(errorCodeCapture.capture(),
                        Mockito.anyInt(),
                        Mockito.anyInt(),
                        listCaptor.capture(),
                        Mockito.anyString(),
                        Mockito.any(ValidatorProtos.ValidationResult.Builder.class));

        final List<String> params = listCaptor.getValue();
        Assert.assertEquals(params.get(0), "spec1");
        Assert.assertEquals(params.get(1), url);
        Assert.assertEquals(errorCodeCapture.getValue(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL);

    }
}
