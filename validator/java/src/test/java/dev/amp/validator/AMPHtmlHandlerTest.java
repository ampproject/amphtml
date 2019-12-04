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

import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.net.URISyntaxException;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test for {@link AMPHtmlHandler}
 *
 * @author sphatak01
 */
public class AMPHtmlHandlerTest {

    @BeforeMethod
    public void setUp() throws IOException, URISyntaxException {
        ampValidatorManager = new AMPValidatorManager();
        ampValidatorManager.loadRule();
    }

    /**
     * start document must set state status to UNKNOWN.
     *
     * @throws SAXException Sax exception.
     */
    @Test
    public void testStartDocument() throws SAXException {
        final AMPHtmlHandler handler = new AMPHtmlHandler(ampValidatorManager,
                ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, ExitCondition.FULL_PARSING,
                MAX_NODES_ALLOWED);

        handler.startDocument();

        Assert.assertEquals(handler.validationResult().getStatus(), ValidatorProtos.ValidationResult.Status.UNKNOWN);
    }

    /**
     *
     */
    @Test
    public void testStartElement() throws SAXException {
        final AMPHtmlHandler handler = new AMPHtmlHandler(ampValidatorManager,
                ValidatorProtos.HtmlFormat.Code.AMP4EMAIL, ExitCondition.FULL_PARSING,
                MAX_NODES_ALLOWED);

        final String uri = "";
        final Attributes attrs = mock(Attributes.class);
        when(attrs.getLocalName(0)).thenReturn("height");
        handler.setDocumentLocator(new Locator() {
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
        handler.startElement(uri, "html", "", attrs);
    }

    @Test
    public void testEndElement() {
    }

    @Test
    public void testSetDocumentLocator() {
    }

    @Test
    public void testValidationResult() {
    }

    @Test
    public void testEmitMissingExtensionErrors() {
    }

    /** AMPValidatorManager object. */
    private AMPValidatorManager ampValidatorManager;

    private static final int MAX_NODES_ALLOWED = 50;
}
