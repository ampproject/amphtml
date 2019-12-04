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
package dev.amp.validator.css;

import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test for {@link ParsedCssUrl}
 *
 * @author GeorgeLuo
 */

public class ParsedCssUrlTest {

    @Test
    public void testGetAtRuleScope() {
        ParsedCssUrl parsedCssUrl = new ParsedCssUrl();
        Assert.assertEquals(parsedCssUrl.getAtRuleScope(), "");
    }

    @Test
    public void testGetUtf8Url() {
        ParsedCssUrl parsedCssUrl = new ParsedCssUrl();
        parsedCssUrl.setUtf8Url("https://www.someurl.com");
        Assert.assertEquals(parsedCssUrl.getUtf8Url(), "https://www.someurl.com");
    }

    @Test
    public void testGetTokenType() {
        ParsedCssUrl parsedCssUrl = new ParsedCssUrl();
        Assert.assertEquals(parsedCssUrl.getTokenType(), TokenType.PARSED_CSS_URL);
    }
}
